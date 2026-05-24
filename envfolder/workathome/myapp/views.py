from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, action, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from django.db.models import Sum, Q, Avg, Count
from django.utils import timezone
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

from .models import (
    CustomerProfile, WorkerProfile, ServiceCategory, Booking, 
    BookingSlot, Payment, Review, Message, Notification, Address, RevenueTracking
)
from .serializers import (
    UserSerializer, RegisterSerializer, CustomerProfileSerializer, WorkerProfileSerializer,
    ServiceCategorySerializer, BookingSlotSerializer, BookingSerializer, PaymentSerializer,
    ReviewSerializer, MessageSerializer, NotificationSerializer, AddressSerializer,
    RevenueTrackingSerializer
)

User = get_user_model()

# --- Helpers for real-time WebSockets notifications ---
def push_notification(user, title, message_content):
    notification = Notification.objects.create(
        user=user,
        title=title,
        message=message_content
    )
    
    # Broadcast through channels layer
    channel_layer = get_channel_layer()
    if channel_layer:
        async_to_sync(channel_layer.group_send)(
            f'user_{user.id}',
            {
                'type': 'send_notification',
                'notification': {
                    'id': notification.id,
                    'title': title,
                    'message': message_content,
                    'is_read': False,
                    'created_at': notification.created_at.strftime('%Y-%m-%dT%H:%M:%SZ')
                }
            }
        )
    return notification


# --- Custom Permissions ---
class IsCustomer(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'CUSTOMER'

class IsWorker(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'WORKER'

class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (request.user.role == 'ADMIN' or request.user.is_staff)


# --- Authentication Views ---
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = {
            'id': self.user.id,
            'username': self.user.username,
            'email': self.user.email,
            'role': self.user.role,
            'name': self.user.name,
            'is_verified': self.user.is_verified,
        }
        return data

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register_user(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response({
            "message": "User Registered Successfully!",
            "user": UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# --- Profile Views ---
class CustomerProfileViewSet(viewsets.ModelViewSet):
    queryset = CustomerProfile.objects.all()
    serializer_class = CustomerProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'ADMIN' or self.request.user.is_staff:
            return CustomerProfile.objects.all()
        return CustomerProfile.objects.filter(user=self.request.user)


class WorkerProfileViewSet(viewsets.ModelViewSet):
    queryset = WorkerProfile.objects.all()
    serializer_class = WorkerProfileSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = WorkerProfile.objects.all()
        service = self.request.query_params.get('service')
        rating = self.request.query_params.get('rating')
        price_max = self.request.query_params.get('price_max')

        if service:
            queryset = queryset.filter(skills__icontains=service)
        if rating:
            queryset = queryset.filter(average_rating__gte=float(rating))
        if price_max:
            queryset = queryset.filter(base_hourly_rate__lte=float(price_max))
        return queryset

    @action(detail=False, methods=['GET'], permission_classes=[IsWorker])
    def me(self, request):
        try:
            profile = WorkerProfile.objects.get(user=request.user)
            serializer = self.get_serializer(profile)
            return Response(serializer.data)
        except WorkerProfile.DoesNotExist:
            return Response({"error": "Worker profile not found"}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['PUT'], permission_classes=[IsWorker])
    def update_profile(self, request):
        try:
            profile = WorkerProfile.objects.get(user=request.user)
            # Update user info if needed
            name = request.data.get('name')
            if name:
                request.user.name = name
                request.user.save()
                
            serializer = self.get_serializer(profile, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except WorkerProfile.DoesNotExist:
            return Response({"error": "Worker profile not found"}, status=status.HTTP_444_NOT_FOUND)


# --- Services Views ---
class ServiceCategoryViewSet(viewsets.ModelViewSet):
    queryset = ServiceCategory.objects.filter(is_active=True)
    serializer_class = ServiceCategorySerializer
    permission_classes = [permissions.AllowAny]


# --- Address Views ---
class AddressViewSet(viewsets.ModelViewSet):
    queryset = Address.objects.all()
    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# --- Booking Slots Views ---
class BookingSlotViewSet(viewsets.ModelViewSet):
    queryset = BookingSlot.objects.all()
    serializer_class = BookingSlotSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = BookingSlot.objects.all()
        worker_id = self.request.query_params.get('worker_id')
        date_str = self.request.query_params.get('date')
        
        if worker_id:
            queryset = queryset.filter(worker_id=worker_id)
        if date_str:
            queryset = queryset.filter(date=date_str)
            
        # Workers can view all their slots, customers only see unbooked slots
        if self.request.user.is_authenticated and self.request.user.role == 'WORKER':
            return queryset.filter(worker__user=self.request.user)
            
        return queryset.filter(is_booked=False)

    @action(detail=False, methods=['POST'], permission_classes=[IsWorker])
    def bulk_create_slots(self, request):
        worker = request.user.worker_profile
        slots_data = request.data.get('slots', [])
        created_slots = []
        
        for slot in slots_data:
            date = slot.get('date')
            start_time = slot.get('start_time')
            end_time = slot.get('end_time')
            if date and start_time and end_time:
                obj, created = BookingSlot.objects.get_or_create(
                    worker=worker,
                    date=date,
                    start_time=start_time,
                    end_time=end_time
                )
                if created:
                    created_slots.append(obj)
                    
        return Response({"message": f"Successfully created {len(created_slots)} slots."}, status=status.HTTP_201_CREATED)


# --- Booking Workflow Views ---
class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN' or user.is_staff:
            return Booking.objects.all()
        elif user.role == 'WORKER':
            return Booking.objects.filter(worker__user=user)
        else:
            return Booking.objects.filter(customer__user=user)

    def perform_create(self, serializer):
        customer = self.request.user.customer_profile
        booking = serializer.save(customer=customer)
        
        # Mark slot as booked if slot matches
        # Booking slot matching logic optional, but we tag it
        push_notification(
            user=booking.worker.user,
            title="New Booking Request!",
            message_content=f"You have a new booking request for {booking.service.name} on {booking.date}."
        )

    @action(detail=True, methods=['POST'], permission_classes=[IsWorker])
    def accept(self, request, pk=None):
        booking = self.get_object()
        if booking.status != 'PENDING':
            return Response({"error": "Booking is not pending"}, status=status.HTTP_400_BAD_REQUEST)
        
        booking.status = 'ACCEPTED'
        booking.save()
        
        push_notification(
            user=booking.customer.user,
            title="Booking Accepted!",
            message_content=f"Your booking with {booking.worker.user.name or booking.worker.user.email} is accepted."
        )
        return Response({"message": "Booking accepted successfully", "status": booking.status})

    @action(detail=True, methods=['POST'], permission_classes=[IsWorker])
    def reject(self, request, pk=None):
        booking = self.get_object()
        if booking.status != 'PENDING':
            return Response({"error": "Booking is not pending"}, status=status.HTTP_400_BAD_REQUEST)
            
        booking.status = 'REJECTED'
        booking.save()
        
        push_notification(
            user=booking.customer.user,
            title="Booking Rejected",
            message_content=f"Your booking for {booking.service.name} was rejected by the provider."
        )
        return Response({"message": "Booking rejected successfully", "status": booking.status})

    @action(detail=True, methods=['POST'])
    def cancel(self, request, pk=None):
        booking = self.get_object()
        if booking.status in ['COMPLETED', 'CANCELLED', 'REJECTED']:
            return Response({"error": "Booking cannot be cancelled"}, status=status.HTTP_400_BAD_REQUEST)
            
        booking.status = 'CANCELLED'
        booking.save()
        
        # Inform the other party
        other_party = booking.worker.user if request.user.role == 'CUSTOMER' else booking.customer.user
        push_notification(
            user=other_party,
            title="Booking Cancelled",
            message_content=f"Booking #{booking.id} was cancelled."
        )
        return Response({"message": "Booking cancelled successfully", "status": booking.status})

    @action(detail=True, methods=['POST'], permission_classes=[IsWorker])
    def complete(self, request, pk=None):
        booking = self.get_object()
        if booking.status != 'ACCEPTED':
            return Response({"error": "Only accepted bookings can be completed"}, status=status.HTTP_400_BAD_REQUEST)
            
        booking.status = 'COMPLETED'
        booking.save()
        
        # Calculate shares
        # Worker share = base_price - 10% commission
        # Admin share = ₹40 platform_fee + 10% commission
        commission_amt = booking.commission
        total_price = booking.final_price
        worker_share = booking.base_price - commission_amt
        admin_share = booking.platform_fee + commission_amt
        
        RevenueTracking.objects.create(
            booking=booking,
            total_amount=total_price,
            worker_share=worker_share,
            admin_share=admin_share
        )
        
        # Mark payment as PAID if not already done
        if hasattr(booking, 'payment'):
            booking.payment.status = 'PAID'
            booking.payment.save()
            
        push_notification(
            user=booking.customer.user,
            title="Job Completed!",
            message_content=f"Your home service booking #{booking.id} has been marked completed by the worker."
        )
        return Response({"message": "Booking marked as completed", "status": booking.status})


# --- Payment Simulated Checkout Views ---
class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=['POST'])
    def simulate_checkout(self, request, pk=None):
        payment = self.get_object()
        status_input = request.data.get('status', 'PAID')  # PAID, FAILED, REFUNDED
        
        if payment.status == 'PAID' and status_input == 'PAID':
            return Response({"error": "Payment already processed"}, status=status.HTTP_400_BAD_REQUEST)

        payment.status = status_input
        payment.transaction_id = request.data.get('transaction_id', f"TXN-{timezone.now().timestamp()}")
        payment.save()
        
        # If payment succeeded, keep booking in pending/accepted status
        if status_input == 'PAID':
            push_notification(
                user=payment.booking.customer.user,
                title="Payment Successful!",
                message_content=f"Payment of ₹{payment.amount} succeeded for booking #{payment.booking.id}."
            )
        elif status_input == 'FAILED':
            push_notification(
                user=payment.booking.customer.user,
                title="Payment Failed",
                message_content=f"Payment for booking #{payment.booking.id} failed."
            )
            
        return Response({"message": f"Payment status simulated to {status_input}", "payment_status": payment.status})


# --- Reviews Views ---
class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        customer = self.request.user.customer_profile
        review = serializer.save(customer=customer)
        
        # Recalculate average rating for the worker
        worker = review.worker
        avg_rating = Review.objects.filter(worker=worker).aggregate(Avg('rating'))['rating__avg']
        worker.average_rating = round(avg_rating, 2)
        worker.save()
        
        push_notification(
            user=worker.user,
            title="New Review!",
            message_content=f"A customer gave you a {review.rating}-star review."
        )


# --- Live Chat Views ---
class MessageViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Message.objects.filter(Q(sender=user) | Q(receiver=user)).order_by('timestamp')

    @action(detail=False, methods=['GET'])
    def active_contacts(self, request):
        user = request.user
        # Find all unique users this user has messaged or received messages from
        sent_to = Message.objects.filter(sender=user).values_list('receiver_id', flat=True)
        received_from = Message.objects.filter(receiver=user).values_list('sender_id', flat=True)
        all_ids = set(list(sent_to) + list(received_from))
        
        contacts = User.objects.filter(id__in=all_ids).exclude(id=user.id)
        return Response(UserSerializer(contacts, many=True).data)


# --- Notifications Views ---
class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    @action(detail=False, methods=['POST'])
    def mark_all_read(self, request):
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({"message": "All notifications marked as read"})


# --- Admin Analytics Views ---
@api_view(['GET'])
@permission_classes([IsAdmin])
def admin_stats(request):
    total_users = User.objects.filter(role='CUSTOMER').count()
    total_workers = User.objects.filter(role='WORKER').count()
    total_completed = Booking.objects.filter(status='COMPLETED').count()
    
    revenue_agg = RevenueTracking.objects.aggregate(
        total_volume=Sum('total_amount'),
        worker_payouts=Sum('worker_share'),
        admin_profits=Sum('admin_share')
    )
    
    # Custom Seed category stats
    category_booking_stats = Booking.objects.values('service__name').annotate(count=Count('id'))
    
    # Earnings history for charts
    revenue_over_time = RevenueTracking.objects.extra(
        select={'date': "strftime('%%Y-%%m-%%d', created_at)"}
    ).values('date').annotate(
        revenue=Sum('admin_share'),
        volume=Sum('total_amount')
    ).order_by('date')[:30]

    return Response({
        "stats": {
            "total_customers": total_users,
            "total_workers": total_workers,
            "total_completed_bookings": total_completed,
            "total_transaction_volume": revenue_agg['total_volume'] or 0.00,
            "total_worker_payouts": revenue_agg['worker_payouts'] or 0.00,
            "platform_earnings": revenue_agg['admin_profits'] or 0.00,
        },
        "bookings_by_category": category_booking_stats,
        "revenue_chart_data": list(revenue_over_time)
    })
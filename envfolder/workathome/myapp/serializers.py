from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    CustomerProfile, WorkerProfile, ServiceCategory, Booking, 
    BookingSlot, Payment, Review, Message, Notification, Address, RevenueTracking
)

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'name', 'role', 'is_verified', 'created_at')


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(choices=User.ROLE_CHOICES, default='CUSTOMER')
    phone = serializers.CharField(required=False, write_only=True, allow_blank=True)

    class Meta:
        model = User
        fields = ('id', 'email', 'username', 'name', 'password', 'role', 'phone')

    def create(self, validated_data):
        phone = validated_data.pop('phone', '')
        password = validated_data.pop('password')
        role = validated_data.get('role', 'CUSTOMER')
        
        # Create user
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()

        # Create corresponding profile
        if role == 'WORKER':
            WorkerProfile.objects.create(user=user, phone=phone)
        else:
            CustomerProfile.objects.create(user=user, phone=phone)

        return user


class CustomerProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = CustomerProfile
        fields = '__all__'


class WorkerProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = WorkerProfile
        fields = '__all__'


class ServiceCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceCategory
        fields = '__all__'


class BookingSlotSerializer(serializers.ModelSerializer):
    worker_name = serializers.CharField(source='worker.user.name', read_only=True)
    
    class Meta:
        model = BookingSlot
        fields = '__all__'


class BookingSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.user.name', read_only=True)
    worker_name = serializers.CharField(source='worker.user.name', read_only=True)
    service_name = serializers.CharField(source='service.name', read_only=True)
    
    class Meta:
        model = Booking
        fields = '__all__'
        read_only_fields = ('customer', 'platform_fee', 'commission', 'final_price', 'status', 'created_at')

    def create(self, validated_data):
        from decimal import Decimal
        base_price = validated_data['base_price']
        
        # Formula: Final Payable = base_price + ₹40 platform_fee + 10% commission
        platform_fee = Decimal('40.00')
        commission = base_price * Decimal('0.10')
        final_price = base_price + platform_fee + commission

        validated_data['platform_fee'] = platform_fee
        validated_data['commission'] = commission
        validated_data['final_price'] = final_price

        booking = Booking.objects.create(**validated_data)
        
        # Auto-create a pending payment record
        Payment.objects.create(
            booking=booking,
            amount=final_price,
            status='PENDING'
        )

        return booking


class PaymentSerializer(serializers.ModelSerializer):
    booking_id = serializers.IntegerField(source='booking.id', read_only=True)
    service_name = serializers.CharField(source='booking.service.name', read_only=True)
    
    class Meta:
        model = Payment
        fields = '__all__'


class ReviewSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.user.name', read_only=True)
    
    class Meta:
        model = Review
        fields = '__all__'
        read_only_fields = ('customer',)


class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.name', read_only=True)
    receiver_name = serializers.CharField(source='receiver.name', read_only=True)
    
    class Meta:
        model = Message
        fields = '__all__'


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = '__all__'
        read_only_fields = ('user',)


class RevenueTrackingSerializer(serializers.ModelSerializer):
    booking_service = serializers.CharField(source='booking.service.name', read_only=True)
    
    class Meta:
        model = RevenueTracking
        fields = '__all__'
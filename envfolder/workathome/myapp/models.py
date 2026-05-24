from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator

class User(AbstractUser):
    ROLE_CHOICES = (
        ('CUSTOMER', 'Customer'),
        ('WORKER', 'Worker'),
        ('ADMIN', 'Admin'),
    )
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='CUSTOMER')
    name = models.CharField(max_length=150, blank=True)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return f"{self.email} ({self.role})"


class CustomerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='customer_profile')
    phone = models.CharField(max_length=20, blank=True, null=True)
    profile_picture = models.URLField(max_length=500, blank=True, null=True)

    def __str__(self):
        return f"Customer: {self.user.name or self.user.email}"


class WorkerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='worker_profile')
    phone = models.CharField(max_length=20, blank=True, null=True)
    profile_picture = models.URLField(max_length=500, blank=True, null=True)
    skills = models.JSONField(default=list, help_text="List of service names worker can perform")
    bio = models.TextField(blank=True, null=True)
    base_hourly_rate = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    experience_years = models.IntegerField(default=0)
    verification_badge = models.BooleanField(default=False)
    average_rating = models.FloatField(default=0.0)
    is_available = models.BooleanField(default=True)

    def __str__(self):
        return f"Worker: {self.user.name or self.user.email}"


class ServiceCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    icon = models.CharField(max_length=50, default='wrench', help_text="Lucide icon name")
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class Booking(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('ACCEPTED', 'Accepted'),
        ('REJECTED', 'Rejected'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    )
    customer = models.ForeignKey(CustomerProfile, on_delete=models.CASCADE, related_name='bookings')
    worker = models.ForeignKey(WorkerProfile, on_delete=models.CASCADE, related_name='bookings')
    service = models.ForeignKey(ServiceCategory, on_delete=models.CASCADE, related_name='bookings')
    date = models.DateField()
    time_slot = models.CharField(max_length=100, help_text="e.g. 10:00 AM - 11:00 AM")
    
    # Pricing Breakdown
    base_price = models.DecimalField(max_digits=10, decimal_places=2)
    platform_fee = models.DecimalField(max_digits=10, decimal_places=2, default=40.00)
    commission = models.DecimalField(max_digits=10, decimal_places=2)
    final_price = models.DecimalField(max_digits=10, decimal_places=2)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    address = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['customer', 'status']),
            models.Index(fields=['worker', 'status']),
            models.Index(fields=['date']),
        ]

    def __str__(self):
        return f"Booking #{self.id} for {self.service.name} by {self.customer.user.email}"


class BookingSlot(models.Model):
    worker = models.ForeignKey(WorkerProfile, on_delete=models.CASCADE, related_name='slots')
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_booked = models.BooleanField(default=False)

    class Meta:
        unique_together = ('worker', 'date', 'start_time', 'end_time')

    def __str__(self):
        return f"{self.worker.user.email} - {self.date} {self.start_time} to {self.end_time}"


class Payment(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('PAID', 'Paid'),
        ('FAILED', 'Failed'),
        ('REFUNDED', 'Refunded'),
    )
    booking = models.OneToOneField(Booking, on_delete=models.CASCADE, related_name='payment')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    transaction_id = models.CharField(max_length=100, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Payment #{self.id} ({self.status}) for Booking #{self.booking.id}"


class Review(models.Model):
    booking = models.OneToOneField(Booking, on_delete=models.CASCADE, related_name='review')
    customer = models.ForeignKey(CustomerProfile, on_delete=models.CASCADE, related_name='reviews')
    worker = models.ForeignKey(WorkerProfile, on_delete=models.CASCADE, related_name='reviews')
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Review for Worker {self.worker.user.email} - Rating: {self.rating}"


class Message(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages')
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f"From {self.sender.email} to {self.receiver.email} at {self.timestamp}"


class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Notification for {self.user.email}: {self.title}"


class Address(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='addresses')
    title = models.CharField(max_length=100, default='Home', help_text="e.g. Home, Office")
    street_address = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    zip_code = models.CharField(max_length=20)
    is_default = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.title}: {self.street_address}, {self.city}"


class RevenueTracking(models.Model):
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='revenue_records')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    worker_share = models.DecimalField(max_digits=10, decimal_places=2)
    admin_share = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Revenue for Booking #{self.booking.id} - Total: ₹{self.total_amount}"

from django.db import models
import random


class SubAgent(models.Model):
    STATUS_CHOICES = [
        ('Active', 'Active'),
        ('Suspended', 'Suspended'),
        ('Blocked', 'Blocked'),
        ('Pending KYC', 'Pending KYC'),
    ]

    name = models.CharField(max_length=150)
    company = models.CharField(max_length=150)
    initials = models.CharField(max_length=4, blank=True)
    color = models.CharField(max_length=20, default='#4F46E5')
    email = models.EmailField()
    phone = models.CharField(max_length=50)
    city = models.CharField(max_length=100)
    credit_limit = models.DecimalField(max_digits=12, decimal_places=2, default=500000)
    credit_used = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    bookings_count = models.IntegerField(default=0)
    revenue = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    growth = models.IntegerField(default=10)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='Active')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-bookings_count', 'id']

    @property
    def balance(self):
        return max(float(self.credit_limit) - float(self.credit_used), 0)

    def save(self, *args, **kwargs):
        if not self.initials and self.name:
            parts = self.name.strip().split()
            if len(parts) >= 2:
                self.initials = (parts[0][0] + parts[1][0]).upper()
            else:
                self.initials = self.name[:2].upper()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.city})"


class FlightSegment(models.Model):
    STATUS_CHOICES = [
        ('Active', 'Active'),
        ('Inactive', 'Inactive'),
        ('Cancelled', 'Cancelled'),
    ]
    CABIN_CHOICES = [
        ('Economy', 'Economy'),
        ('Business', 'Business'),
        ('First', 'First'),
    ]

    segment_id = models.CharField(max_length=30, unique=True, blank=True)
    origin = models.CharField(max_length=10)
    dest = models.CharField(max_length=10)
    airline = models.CharField(max_length=100)
    flight_code = models.CharField(max_length=30, default='EK-601')
    logo = models.CharField(max_length=5, default='EK')
    color = models.CharField(max_length=20, default='#4F46E5')
    aircraft = models.CharField(max_length=50, default='B777')
    dep = models.CharField(max_length=20)
    arr = models.CharField(max_length=20)
    dur = models.CharField(max_length=30)
    stops = models.IntegerField(default=0)
    stop_city = models.CharField(max_length=20, blank=True, default='')
    price = models.DecimalField(max_digits=10, decimal_places=2, default=285)
    old_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    seats = models.IntegerField(default=180)
    cabin_class = models.CharField(max_length=20, choices=CABIN_CHOICES, default='Economy')
    rating = models.FloatField(default=4.5)
    badge = models.CharField(max_length=30, blank=True, default='')
    amenities = models.JSONField(default=list, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Active')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-segment_id', '-id']

    def save(self, *args, **kwargs):
        if not self.segment_id:
            last = FlightSegment.objects.order_by('-id').first()
            next_num = 92 + (last.id if last else 0)
            candidate = f"SEG-{next_num:04d}"
            while FlightSegment.objects.filter(segment_id=candidate).exists():
                next_num += 1
                candidate = f"SEG-{next_num:04d}"
            self.segment_id = candidate
        if not self.logo and self.airline:
            self.logo = self.airline[:2].upper()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.segment_id}: {self.origin} → {self.dest} ({self.airline})"


class Booking(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
        ('Issued', 'Issued'),
        ('Void', 'Void'),
    ]
    CABIN_CHOICES = [
        ('Economy', 'Economy'),
        ('Business', 'Business'),
        ('First', 'First'),
    ]

    ref = models.CharField(max_length=30, unique=True, blank=True)
    passenger = models.CharField(max_length=150)
    title = models.CharField(max_length=15, default='Mr')
    first_name = models.CharField(max_length=80, blank=True, default='')
    last_name = models.CharField(max_length=80, blank=True, default='')
    dob = models.CharField(max_length=30, blank=True, default='')
    nationality = models.CharField(max_length=80, blank=True, default='Pakistan')
    passport_number = models.CharField(max_length=50, blank=True, default='')
    passport_expiry = models.CharField(max_length=30, blank=True, default='')
    gender = models.CharField(max_length=15, blank=True, default='Male')
    passport_copy = models.FileField(upload_to='passports/', null=True, blank=True)

    route = models.CharField(max_length=50)
    origin = models.CharField(max_length=10, default='KHI')
    destination = models.CharField(max_length=10, default='DXB')
    airline = models.CharField(max_length=100)
    flight_code = models.CharField(max_length=30, default='EK-601')
    date = models.CharField(max_length=40)
    cls = models.CharField(max_length=20, choices=CABIN_CHOICES, default='Economy')
    pax_count = models.IntegerField(default=1)

    base_fare = models.DecimalField(max_digits=10, decimal_places=2, default=280)
    taxes = models.DecimalField(max_digits=10, decimal_places=2, default=58)
    surcharge = models.DecimalField(max_digits=10, decimal_places=2, default=24)
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=12)
    promo_discount = models.DecimalField(max_digits=10, decimal_places=2, default=10)
    amount_value = models.DecimalField(max_digits=10, decimal_places=2, default=340)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    sub_agent = models.ForeignKey(SubAgent, on_delete=models.SET_NULL, null=True, blank=True, related_name='bookings')
    initials = models.CharField(max_length=4, blank=True)
    avatar_color = models.CharField(max_length=20, default='#4F46E5')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-id']

    @property
    def amount(self):
        val = float(self.amount_value)
        if val.is_integer():
            return f"${int(val):,}"
        return f"${val:,.2f}"

    def save(self, *args, **kwargs):
        if not self.ref:
            last = Booking.objects.order_by('-id').first()
            next_num = 20242 + (last.id if last else 0)
            candidate = f"BK-{next_num}"
            while Booking.objects.filter(ref=candidate).exists():
                next_num += 1
                candidate = f"BK-{next_num}"
            self.ref = candidate

        if not self.passenger and (self.first_name or self.last_name):
            self.passenger = f"{self.first_name} {self.last_name}".strip()

        if not self.route and self.origin and self.destination:
            self.route = f"{self.origin} → {self.destination}"

        if not self.initials and self.passenger:
            parts = self.passenger.strip().split()
            if len(parts) >= 2:
                self.initials = (parts[0][0] + parts[1][0]).upper()
            else:
                self.initials = self.passenger[:2].upper()

        if not self.avatar_color:
            palette = ['#4F46E5', '#06B6D4', '#22C55E', '#F59E0B', '#7C3AED', '#EF4444']
            self.avatar_color = random.choice(palette)

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.ref} - {self.passenger} ({self.route})"


class PromoCode(models.Model):
    code = models.CharField(max_length=30, unique=True)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=20)
    description = models.CharField(max_length=150, blank=True, default='')
    active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.code} (-${self.discount_amount})"


class PlatformSetting(models.Model):
    agency_name = models.CharField(max_length=150, default='AeroDesk Travel Karachi')
    support_email = models.EmailField(default='ops@aerodesk.pk')
    support_phone = models.CharField(max_length=50, default='+92-21-35880011')
    default_currency = models.CharField(max_length=10, default='USD')
    default_origin = models.CharField(max_length=10, default='KHI')
    tax_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=14.50)
    auto_approve_under = models.DecimalField(max_digits=10, decimal_places=2, default=500.00)
    email_notifications = models.BooleanField(default=True)
    gds_live_sync = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.agency_name

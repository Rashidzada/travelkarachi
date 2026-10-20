from django.contrib import admin
from .models import SubAgent, FlightSegment, Booking, PromoCode, PlatformSetting


@admin.register(SubAgent)
class SubAgentAdmin(admin.ModelAdmin):
    list_display = ('name', 'company', 'city', 'email', 'credit_limit', 'credit_used', 'bookings_count', 'status')
    search_fields = ('name', 'company', 'city', 'email')
    list_filter = ('status', 'city')


@admin.register(FlightSegment)
class FlightSegmentAdmin(admin.ModelAdmin):
    list_display = ('segment_id', 'origin', 'dest', 'airline', 'flight_code', 'aircraft', 'dep', 'arr', 'price', 'seats', 'status')
    search_fields = ('segment_id', 'origin', 'dest', 'airline', 'flight_code')
    list_filter = ('status', 'airline', 'cabin_class')


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('ref', 'passenger', 'route', 'airline', 'date', 'cls', 'amount_value', 'status', 'created_at')
    search_fields = ('ref', 'passenger', 'route', 'airline', 'passport_number')
    list_filter = ('status', 'cls', 'airline')


@admin.register(PromoCode)
class PromoCodeAdmin(admin.ModelAdmin):
    list_display = ('code', 'discount_amount', 'description', 'active')


@admin.register(PlatformSetting)
class PlatformSettingAdmin(admin.ModelAdmin):
    list_display = ('agency_name', 'support_email', 'default_currency', 'default_origin', 'updated_at')

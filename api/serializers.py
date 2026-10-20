from rest_framework import serializers
from django.utils.timesince import timesince
from .models import SubAgent, FlightSegment, Booking, PromoCode, PlatformSetting


class SubAgentSerializer(serializers.ModelSerializer):
    creditLimit = serializers.SerializerMethodField()
    creditUsed = serializers.SerializerMethodField()
    balance = serializers.SerializerMethodField()
    bookings = serializers.IntegerField(source='bookings_count', required=False, default=0)
    revenue_formatted = serializers.SerializerMethodField()

    class Meta:
        model = SubAgent
        fields = [
            'id', 'name', 'company', 'initials', 'color', 'email', 'phone',
            'city', 'credit_limit', 'credit_used', 'creditLimit', 'creditUsed',
            'balance', 'bookings_count', 'bookings', 'revenue', 'revenue_formatted',
            'growth', 'status', 'created_at'
        ]

    def get_creditLimit(self, obj):
        return float(obj.credit_limit)

    def get_creditUsed(self, obj):
        return float(obj.credit_used)

    def get_balance(self, obj):
        return obj.balance

    def get_revenue_formatted(self, obj):
        return f"${int(float(obj.revenue)):,}"


class FlightSegmentSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='segment_id', read_only=True)
    pk = serializers.IntegerField(source='id', read_only=True)
    code = serializers.CharField(source='flight_code', required=False)
    depTime = serializers.CharField(source='dep', read_only=True)
    arrTime = serializers.CharField(source='arr', read_only=True)
    duration = serializers.CharField(source='dur', read_only=True)
    stopCity = serializers.CharField(source='stop_city', required=False, allow_blank=True)
    oldPrice = serializers.DecimalField(source='old_price', max_digits=10, decimal_places=2, required=False, allow_null=True)
    cls = serializers.CharField(source='cabin_class', required=False)

    class Meta:
        model = FlightSegment
        fields = [
            'pk', 'id', 'segment_id', 'origin', 'dest', 'airline',
            'flight_code', 'code', 'logo', 'color', 'aircraft',
            'dep', 'arr', 'depTime', 'arrTime', 'dur', 'duration',
            'stops', 'stop_city', 'stopCity', 'price', 'old_price', 'oldPrice',
            'seats', 'cabin_class', 'cls', 'rating', 'badge', 'amenities', 'status'
        ]


class BookingSerializer(serializers.ModelSerializer):
    amount = serializers.ReadOnlyField()
    color = serializers.CharField(source='avatar_color', required=False)
    time = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = [
            'id', 'ref', 'passenger', 'title', 'first_name', 'last_name',
            'dob', 'nationality', 'passport_number', 'passport_expiry',
            'gender', 'passport_copy', 'route', 'origin', 'destination',
            'airline', 'flight_code', 'date', 'cls', 'pax_count',
            'base_fare', 'taxes', 'surcharge', 'discount', 'promo_discount',
            'amount_value', 'amount', 'status', 'sub_agent',
            'initials', 'avatar_color', 'color', 'time', 'created_at'
        ]

    def get_time(self, obj):
        if not obj.created_at:
            return "Just now"
        diff = timesince(obj.created_at)
        first_part = diff.split(',')[0].strip()
        if '0\xa0minutes' in first_part or '0 minutes' in first_part:
            return "Just now"
        first_part = (
            first_part.replace('\xa0', ' ')
            .replace(' hours', 'h').replace(' hour', 'h')
            .replace(' minutes', 'm').replace(' minute', 'm')
            .replace(' days', 'd').replace(' day', 'd')
        )
        return f"{first_part} ago"


class PromoCodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = PromoCode
        fields = ['id', 'code', 'discount_amount', 'description', 'active']


class PlatformSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlatformSetting
        fields = '__all__'

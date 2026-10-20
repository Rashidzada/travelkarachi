from django.contrib.auth.models import User
from .models import SubAgent, FlightSegment, Booking, PromoCode, PlatformSetting


def ensure_seed_data():
    """
    Populates the database with realistic initial Karachi / AeroDesk travel data
    if the database is currently empty. Also ensures a default admin user exists.
    """
    if not User.objects.filter(username='admin').exists():
        admin_user = User.objects.create_superuser(
            username='admin',
            email='admin@aerodesk.io',
            password='adminpassword123',
            first_name='Admin',
            last_name='User',
        )
        admin_user.save()

    if not PlatformSetting.objects.exists():
        PlatformSetting.objects.create(
            agency_name='AeroDesk Travel Karachi',
            support_email='ops@aerodesk.pk',
            support_phone='+92-21-35880011',
            default_currency='USD',
            default_origin='KHI',
            tax_percentage=14.50,
            auto_approve_under=500.00,
            email_notifications=True,
            gds_live_sync=True,
        )

    if not PromoCode.objects.exists():
        promos = [
            {'code': 'AERO20', 'discount_amount': 20, 'description': '$20 off any international flight'},
            {'code': 'KARACHI50', 'discount_amount': 50, 'description': '$50 off KHI departures'},
            {'code': 'WELCOME10', 'discount_amount': 10, 'description': '$10 welcome promo'},
        ]
        for p in promos:
            PromoCode.objects.create(**p)

    if not SubAgent.objects.exists():
        agents_data = [
            {
                'name': 'Falcon Travels', 'company': 'Falcon Intl', 'initials': 'FT', 'color': '#4F46E5',
                'email': 'info@falcon.pk', 'phone': '+92-21-1234567', 'city': 'Karachi',
                'credit_limit': 500000, 'credit_used': 210000, 'bookings_count': 284, 'revenue': 142800, 'growth': 18, 'status': 'Active'
            },
            {
                'name': 'Sky Bridge Intl', 'company': 'Sky Group', 'initials': 'SB', 'color': '#06B6D4',
                'email': 'ops@skybridge.com', 'phone': '+92-42-9876543', 'city': 'Lahore',
                'credit_limit': 350000, 'credit_used': 280000, 'bookings_count': 231, 'revenue': 118350, 'growth': 12, 'status': 'Active'
            },
            {
                'name': 'Horizon Agency', 'company': 'Horizon LLC', 'initials': 'HA', 'color': '#22C55E',
                'email': 'book@horizon.ae', 'phone': '+971-4-1234567', 'city': 'Dubai',
                'credit_limit': 800000, 'credit_used': 520000, 'bookings_count': 198, 'revenue': 99000, 'growth': 9, 'status': 'Active'
            },
            {
                'name': 'Global Wings', 'company': 'Global Corp', 'initials': 'GW', 'color': '#7C3AED',
                'email': 'sales@globalwings.pk', 'phone': '+92-51-5555555', 'city': 'Islamabad',
                'credit_limit': 200000, 'credit_used': 178000, 'bookings_count': 167, 'revenue': 83500, 'growth': -4, 'status': 'Suspended'
            },
            {
                'name': 'AirConnect Ltd', 'company': 'AirConnect', 'initials': 'AC', 'color': '#F59E0B',
                'email': 'admin@airconnect.sa', 'phone': '+966-11-888888', 'city': 'Riyadh',
                'credit_limit': 600000, 'credit_used': 45000, 'bookings_count': 143, 'revenue': 71500, 'growth': 6, 'status': 'Active'
            },
            {
                'name': 'TravelPro KHI', 'company': 'TravelPro', 'initials': 'TP', 'color': '#EF4444',
                'email': 'info@travelpro.pk', 'phone': '+92-21-7777777', 'city': 'Karachi',
                'credit_limit': 150000, 'credit_used': 0, 'bookings_count': 42, 'revenue': 21400, 'growth': 24, 'status': 'Pending KYC'
            },
            {
                'name': 'Nova Travels', 'company': 'Nova Group', 'initials': 'NT', 'color': '#0F172A',
                'email': 'nova@travels.com', 'phone': '+44-20-9999999', 'city': 'London',
                'credit_limit': 1000000, 'credit_used': 850000, 'bookings_count': 95, 'revenue': 64200, 'growth': -8, 'status': 'Blocked'
            },
        ]
        for a in agents_data:
            SubAgent.objects.create(**a)

    if not FlightSegment.objects.exists():
        segments_data = [
            {
                'segment_id': 'SEG-0091', 'origin': 'KHI', 'dest': 'DXB', 'airline': 'Emirates',
                'flight_code': 'EK-623', 'logo': 'EK', 'color': '#C8102E', 'aircraft': 'B777',
                'dep': '06:15', 'arr': '08:30', 'dur': '2h 15m', 'stops': 0, 'stop_city': '',
                'price': 285, 'old_price': None, 'seats': 248, 'cabin_class': 'Economy',
                'rating': 4.8, 'badge': 'Top Pick', 'amenities': ['wifi', 'meal', 'usb', 'lounge'], 'status': 'Active'
            },
            {
                'segment_id': 'SEG-0090', 'origin': 'LHR', 'dest': 'JFK', 'airline': 'British Airways',
                'flight_code': 'BA-117', 'logo': 'BA', 'color': '#1E3A8A', 'aircraft': 'A380',
                'dep': '09:00', 'arr': '12:00', 'dur': '7h 00m', 'stops': 0, 'stop_city': '',
                'price': 640, 'old_price': 720, 'seats': 524, 'cabin_class': 'Business',
                'rating': 4.7, 'badge': 'Premium', 'amenities': ['wifi', 'meal', 'usb', 'lounge'], 'status': 'Active'
            },
            {
                'segment_id': 'SEG-0089', 'origin': 'ISB', 'dest': 'RUH', 'airline': 'PIA',
                'flight_code': 'PK-753', 'logo': 'PK', 'color': '#006341', 'aircraft': 'B737',
                'dep': '14:00', 'arr': '16:15', 'dur': '2h 15m', 'stops': 0, 'stop_city': '',
                'price': 220, 'old_price': None, 'seats': 162, 'cabin_class': 'Economy',
                'rating': 3.9, 'badge': 'Cheapest', 'amenities': ['meal'], 'status': 'Inactive'
            },
            {
                'segment_id': 'SEG-0088', 'origin': 'DXB', 'dest': 'SIN', 'airline': 'Emirates',
                'flight_code': 'EK-354', 'logo': 'EK', 'color': '#C8102E', 'aircraft': 'A350',
                'dep': '23:30', 'arr': '07:45', 'dur': '7h 15m', 'stops': 0, 'stop_city': '',
                'price': 490, 'old_price': None, 'seats': 312, 'cabin_class': 'Economy',
                'rating': 4.8, 'badge': 'Top Pick', 'amenities': ['wifi', 'meal', 'usb'], 'status': 'Active'
            },
            {
                'segment_id': 'SEG-0087', 'origin': 'CDG', 'dest': 'MUC', 'airline': 'Air France',
                'flight_code': 'AF-1422', 'logo': 'AF', 'color': '#002157', 'aircraft': 'A320',
                'dep': '11:30', 'arr': '13:05', 'dur': '1h 35m', 'stops': 0, 'stop_city': '',
                'price': 180, 'old_price': None, 'seats': 180, 'cabin_class': 'Economy',
                'rating': 4.2, 'badge': '', 'amenities': ['wifi', 'usb'], 'status': 'Cancelled'
            },
            {
                'segment_id': 'SEG-0086', 'origin': 'BOM', 'dest': 'LHR', 'airline': 'Jet Airways',
                'flight_code': '9W-118', 'logo': '9W', 'color': '#D97706', 'aircraft': 'B787',
                'dep': '03:00', 'arr': '07:30', 'dur': '9h 30m', 'stops': 0, 'stop_city': '',
                'price': 560, 'old_price': None, 'seats': 256, 'cabin_class': 'Economy',
                'rating': 4.4, 'badge': '', 'amenities': ['wifi', 'meal', 'usb'], 'status': 'Active'
            },
            {
                'segment_id': 'SEG-0085', 'origin': 'CAI', 'dest': 'IST', 'airline': 'Turkish Airlines',
                'flight_code': 'TK-691', 'logo': 'TK', 'color': '#E11D48', 'aircraft': 'B737',
                'dep': '08:45', 'arr': '12:15', 'dur': '3h 30m', 'stops': 0, 'stop_city': '',
                'price': 290, 'old_price': None, 'seats': 162, 'cabin_class': 'Economy',
                'rating': 4.6, 'badge': '', 'amenities': ['wifi', 'meal'], 'status': 'Active'
            },
            # Additional KHI -> DXB segments for rich FlightPOS search results
            {
                'segment_id': 'SEG-0084', 'origin': 'KHI', 'dest': 'DXB', 'airline': 'Air Arabia',
                'flight_code': 'G9-521', 'logo': 'G9', 'color': '#FF6B35', 'aircraft': 'A320',
                'dep': '09:45', 'arr': '12:20', 'dur': '2h 35m', 'stops': 0, 'stop_city': '',
                'price': 189, 'old_price': None, 'seats': 14, 'cabin_class': 'Economy',
                'rating': 4.1, 'badge': '', 'amenities': ['usb'], 'status': 'Active'
            },
            {
                'segment_id': 'SEG-0083', 'origin': 'KHI', 'dest': 'DXB', 'airline': 'PIA',
                'flight_code': 'PK-212', 'logo': 'PK', 'color': '#006341', 'aircraft': 'B777',
                'dep': '11:00', 'arr': '14:45', 'dur': '3h 45m', 'stops': 1, 'stop_city': 'ISB',
                'price': 165, 'old_price': None, 'seats': 21, 'cabin_class': 'Economy',
                'rating': 3.6, 'badge': 'Cheapest', 'amenities': ['meal'], 'status': 'Active'
            },
            {
                'segment_id': 'SEG-0082', 'origin': 'KHI', 'dest': 'DXB', 'airline': 'Qatar Airways',
                'flight_code': 'QR-405', 'logo': 'QR', 'color': '#5C0632', 'aircraft': 'A350',
                'dep': '13:20', 'arr': '15:50', 'dur': '2h 30m', 'stops': 0, 'stop_city': '',
                'price': 340, 'old_price': 420, 'seats': 2, 'cabin_class': 'Business',
                'rating': 4.9, 'badge': 'Premium', 'amenities': ['wifi', 'meal', 'usb', 'lounge'], 'status': 'Active'
            },
            {
                'segment_id': 'SEG-0081', 'origin': 'KHI', 'dest': 'DXB', 'airline': 'flydubai',
                'flight_code': 'FZ-312', 'logo': 'FZ', 'color': '#00A3E0', 'aircraft': 'B737 MAX',
                'dep': '16:05', 'arr': '18:25', 'dur': '2h 20m', 'stops': 0, 'stop_city': '',
                'price': 210, 'old_price': None, 'seats': 8, 'cabin_class': 'Economy',
                'rating': 4.3, 'badge': '', 'amenities': ['wifi', 'usb'], 'status': 'Active'
            },
            {
                'segment_id': 'SEG-0080', 'origin': 'KHI', 'dest': 'DXB', 'airline': 'Serene Air',
                'flight_code': 'ER-501', 'logo': 'ER', 'color': '#1B3A6B', 'aircraft': 'A330',
                'dep': '19:30', 'arr': '22:05', 'dur': '2h 35m', 'stops': 0, 'stop_city': '',
                'price': 155, 'old_price': None, 'seats': 26, 'cabin_class': 'Economy',
                'rating': 3.8, 'badge': '', 'amenities': ['meal'], 'status': 'Active'
            },
        ]
        for s in segments_data:
            FlightSegment.objects.create(**s)

    if not Booking.objects.exists():
        falcon = SubAgent.objects.filter(name='Falcon Travels').first()
        bookings_data = [
            {
                'ref': 'BK-20232', 'passenger': 'Sophie Laurent', 'first_name': 'Sophie', 'last_name': 'Laurent',
                'route': 'CDG → NYC', 'origin': 'CDG', 'destination': 'NYC', 'airline': 'Air France',
                'flight_code': 'AF-022', 'date': 'Jun 21, 2026', 'cls': 'First', 'amount_value': 4800,
                'status': 'Approved', 'initials': 'SL', 'avatar_color': '#4F46E5', 'sub_agent': falcon
            },
            {
                'ref': 'BK-20233', 'passenger': 'Tariq Mehmood', 'first_name': 'Tariq', 'last_name': 'Mehmood',
                'route': 'KHI → LHR', 'origin': 'KHI', 'destination': 'LHR', 'airline': 'PIA',
                'flight_code': 'PK-785', 'date': 'Jun 20, 2026', 'cls': 'Economy', 'amount_value': 850,
                'status': 'Issued', 'initials': 'TM', 'avatar_color': '#06B6D4', 'sub_agent': falcon
            },
            {
                'ref': 'BK-20234', 'passenger': 'Elena Popescu', 'first_name': 'Elena', 'last_name': 'Popescu',
                'route': 'OTP → MUC', 'origin': 'OTP', 'destination': 'MUC', 'airline': 'Lufthansa',
                'flight_code': 'LH-1651', 'date': 'Jun 19, 2026', 'cls': 'Business', 'amount_value': 1100,
                'status': 'Void', 'initials': 'EP', 'avatar_color': '#64748B', 'sub_agent': falcon
            },
            {
                'ref': 'BK-20235', 'passenger': 'Ahmed Hassan', 'first_name': 'Ahmed', 'last_name': 'Hassan',
                'route': 'CAI → IST', 'origin': 'CAI', 'destination': 'IST', 'airline': 'Turkish Airlines',
                'flight_code': 'TK-691', 'date': 'Jun 18, 2026', 'cls': 'Economy', 'amount_value': 290,
                'status': 'Pending', 'initials': 'AH', 'avatar_color': '#F59E0B', 'sub_agent': falcon
            },
            {
                'ref': 'BK-20236', 'passenger': 'Priya Sharma', 'first_name': 'Priya', 'last_name': 'Sharma',
                'route': 'BOM → LHR', 'origin': 'BOM', 'destination': 'LHR', 'airline': 'Jet Airways',
                'flight_code': '9W-118', 'date': 'Jun 17, 2026', 'cls': 'Economy', 'amount_value': 610,
                'status': 'Approved', 'initials': 'PS', 'avatar_color': '#EF4444', 'sub_agent': falcon
            },
            {
                'ref': 'BK-20237', 'passenger': 'Lin Wei', 'first_name': 'Lin', 'last_name': 'Wei',
                'route': 'PEK → SIN', 'origin': 'PEK', 'destination': 'SIN', 'airline': 'Singapore Air',
                'flight_code': 'SQ-807', 'date': 'Jun 16, 2026', 'cls': 'Business', 'amount_value': 1920,
                'status': 'Rejected', 'initials': 'LW', 'avatar_color': '#7C3AED', 'sub_agent': falcon
            },
            {
                'ref': 'BK-20238', 'passenger': 'Marco Rossi', 'first_name': 'Marco', 'last_name': 'Rossi',
                'route': 'MXP → CDG', 'origin': 'MXP', 'destination': 'CDG', 'airline': 'Air France',
                'flight_code': 'AF-1131', 'date': 'Jun 15, 2026', 'cls': 'First', 'amount_value': 5200,
                'status': 'Approved', 'initials': 'MR', 'avatar_color': '#F59E0B', 'sub_agent': falcon
            },
            {
                'ref': 'BK-20239', 'passenger': 'Ayesha Khan', 'first_name': 'Ayesha', 'last_name': 'Khan',
                'route': 'ISB → RUH', 'origin': 'ISB', 'destination': 'RUH', 'airline': 'PIA',
                'flight_code': 'PK-753', 'date': 'Jun 14, 2026', 'cls': 'Economy', 'amount_value': 420,
                'status': 'Issued', 'initials': 'AK', 'avatar_color': '#22C55E', 'sub_agent': falcon
            },
            {
                'ref': 'BK-20240', 'passenger': 'James Okafor', 'first_name': 'James', 'last_name': 'Okafor',
                'route': 'LHR → JFK', 'origin': 'LHR', 'destination': 'JFK', 'airline': 'British Airways',
                'flight_code': 'BA-117', 'date': 'Jun 13, 2026', 'cls': 'Business', 'amount_value': 2840,
                'status': 'Pending', 'initials': 'JO', 'avatar_color': '#06B6D4', 'sub_agent': falcon
            },
            {
                'ref': 'BK-20241', 'passenger': 'Sara Malik', 'first_name': 'Sara', 'last_name': 'Malik',
                'route': 'KHI → DXB', 'origin': 'KHI', 'destination': 'DXB', 'airline': 'Emirates',
                'flight_code': 'EK-623', 'date': 'Jun 12, 2026', 'cls': 'Economy', 'amount_value': 380,
                'status': 'Approved', 'initials': 'SM', 'avatar_color': '#4F46E5', 'sub_agent': falcon
            },
        ]
        for b in bookings_data:
            Booking.objects.create(**b)

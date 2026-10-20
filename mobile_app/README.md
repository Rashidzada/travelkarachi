# AeroDesk TravelKarachi — Flutter Mobile App

Official Flutter mobile application for **AeroDesk Travel Operations Management System**, matching the React web application design and wired directly to the live production Django REST API.

---

## 🔗 Live Backend Connection

By default, the app is pre-configured to connect to your live production backend:
- **Live API Base URL**: `https://travelkarachi.pythonanywhere.com/api`
- **Tap-to-Switch Environment**: On the Login screen or in **Settings**, you can switch between:
  - **Live Cloud (`travelkarachi.pythonanywhere.com`)**
  - **Android Emulator (`10.0.2.2:8000`)**
  - **Localhost (`127.0.0.1:8000`)**

### Default Login Credentials
- **Email**: `admin@aerodesk.io` (or tap **Use Demo Account** on the login screen)
- **Password**: `adminpassword123`

---

## ✨ Features Included (Identical to React Web App)

1. **Login Screen (`lib/screens/login_screen.dart`)**
   - Indigo-to-purple AeroDesk branding, one-tap demo fill, live API switcher, and persistent session storage (`SharedPreferences`).
2. **Executive Dashboard (`lib/screens/dashboard_screen.dart`)**
   - Live KPI cards (Total Bookings, Active Flights, Revenue, Sub-Agents), 6-month revenue bar chart, booking distribution breakdown, recent bookings list, and top routes progress bars.
3. **Flight POS Search (`lib/screens/flight_pos_screen.dart`)**
   - Round-Trip / One-Way / Multi-City selector, airport swapper, passenger counter (Adults, Children, Infants), promo code verification (`AERODESK10`, `KARACHI20`, `VIP50`), live flight cards, and sticky bottom booking summary bar.
4. **Passenger Booking Form (`lib/screens/passenger_booking_screen.dart`)**
   - Multi-passenger form (Title, Name, DOB, Gender, Nationality, Passport, Expiry, Seat Preference, Meal Preference), special requests, payment method selector (`Agency Credit`, `Bank Transfer`, `Credit Card`, `Cash`), and instant PNR confirmation modal.
5. **Flight Bookings Management (`lib/screens/flight_bookings_screen.dart`)**
   - Live search by PNR/Passenger/Destination, status filter pills (`All`, `Confirmed`, `Pending`, `On Hold`, `Cancelled`), PNR detail bottom sheet, one-tap status update, and delete action.
6. **Segment Management (`lib/screens/segment_management_screen.dart`)**
   - Full flight segment inventory, seat load progress bars, search & status filters, and **New Segment** creation modal.
7. **Sub-Agent Management (`lib/screens/sub_agent_management_screen.dart`)**
   - Agency cards with balance/credit utilization progress bars, performance metrics, **Top-Up Balance** dialog, status toggle (`Active` / `Suspended`), and **Add Sub-Agent** form.
8. **Reports & Settings (`lib/screens/reports_settings_screen.dart`)**
   - Executive KPI summary, airline revenue share breakdown, and interactive API URL switcher.

---

## 🚀 How to Run or Build the APK

```bash
cd mobile_app
flutter pub get

# Run on connected device / emulator / Chrome
flutter run

# Build Release Android APK for Client
flutter build apk --release
```

The built Android APK is generated at:
`mobile_app/build/app/outputs/flutter-apk/app-release.apk`

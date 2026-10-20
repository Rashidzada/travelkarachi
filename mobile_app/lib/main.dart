import 'package:flutter/material.dart';
import 'services/api_service.dart';
import 'theme/aerodesk_theme.dart';
import 'screens/login_screen.dart';
import 'screens/dashboard_screen.dart';
import 'screens/flight_bookings_screen.dart';
import 'screens/flight_pos_screen.dart';
import 'screens/passenger_booking_screen.dart';
import 'screens/segment_management_screen.dart';
import 'screens/sub_agent_management_screen.dart';
import 'screens/reports_settings_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await ApiService.initSession();
  runApp(const AeroDeskApp());
}

class AeroDeskApp extends StatefulWidget {
  const AeroDeskApp({super.key});

  @override
  State<AeroDeskApp> createState() => _AeroDeskAppState();
}

class _AeroDeskAppState extends State<AeroDeskApp> {
  bool _loggedIn = ApiService.isLoggedIn;

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'AeroDesk TravelKarachi',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        scaffoldBackgroundColor: AeroColors.pageBg,
        colorScheme: ColorScheme.fromSeed(
          seedColor: AeroColors.primary,
          primary: AeroColors.primary,
          secondary: AeroColors.secondary,
        ),
      ),
      home: _loggedIn
          ? MainShell(
              onLogout: () async {
                await ApiService.logout();
                setState(() => _loggedIn = false);
              },
            )
          : LoginScreen(
              onLoginSuccess: () => setState(() => _loggedIn = true),
            ),
    );
  }
}

class MainShell extends StatefulWidget {
  final VoidCallback onLogout;

  const MainShell({super.key, required this.onLogout});

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  String _screen = 'dashboard';
  SelectedFlightContext? _selectedFlight;
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();

  static const Map<String, Map<String, String>> _meta = {
    'dashboard': {'breadcrumb': 'AeroDesk', 'page': 'Dashboard'},
    'flight-bookings': {'breadcrumb': 'Flights', 'page': 'Flight Bookings'},
    'flight-pos': {'breadcrumb': 'Flights', 'page': 'Flight POS'},
    'flight-management': {'breadcrumb': 'Flights', 'page': 'Passenger Booking'},
    'segment-management': {'breadcrumb': 'Flights', 'page': 'Segment Management'},
    'sub-agents': {'breadcrumb': 'Management', 'page': 'Sub Agents'},
    'reports': {'breadcrumb': 'AeroDesk', 'page': 'Reports'},
    'settings': {'breadcrumb': 'AeroDesk', 'page': 'Settings'},
  };

  void _navigateTo(String s) {
    setState(() => _screen = s);
    if (_scaffoldKey.currentState?.isDrawerOpen ?? false) {
      Navigator.of(context).pop();
    }
  }

  Widget _buildBody() {
    switch (_screen) {
      case 'dashboard':
        return DashboardScreen(onNavigate: _navigateTo);
      case 'flight-bookings':
        return FlightBookingsScreen(onNewBooking: () => _navigateTo('flight-pos'));
      case 'flight-pos':
        return FlightPosScreen(
          onBookFlight: (flight) {
            setState(() {
              _selectedFlight = flight;
              _screen = 'flight-management';
            });
          },
        );
      case 'flight-management':
        return PassengerBookingScreen(
          selectedFlight: _selectedFlight,
          onBookingComplete: () => _navigateTo('flight-bookings'),
        );
      case 'segment-management':
        return const SegmentManagementScreen();
      case 'sub-agents':
        return const SubAgentManagementScreen();
      case 'reports':
        return const ReportsScreen();
      case 'settings':
        return const SettingsScreen();
      default:
        return DashboardScreen(onNavigate: _navigateTo);
    }
  }

  int get _bottomNavIndex {
    switch (_screen) {
      case 'dashboard':
        return 0;
      case 'flight-pos':
      case 'flight-management':
        return 1;
      case 'flight-bookings':
        return 2;
      case 'segment-management':
        return 3;
      case 'sub-agents':
        return 4;
      default:
        return 0;
    }
  }

  @override
  Widget build(BuildContext context) {
    final currentMeta = _meta[_screen] ?? _meta['dashboard']!;
    final user = ApiService.currentUser;
    final initials = user?['initials']?.toString() ?? 'AM';
    final userName = user?['name']?.toString() ?? 'Admin User';
    final userRole = user?['role']?.toString() ?? 'Super Admin';

    return Scaffold(
      key: _scaffoldKey,
      backgroundColor: AeroColors.pageBg,
      // Dark Sidebar Drawer (matching Sidebar.tsx)
      drawer: Drawer(
        backgroundColor: AeroColors.sidebarBg,
        child: SafeArea(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Brand header
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 18),
                child: Row(
                  children: [
                    Container(
                      width: 34,
                      height: 34,
                      decoration: BoxDecoration(
                        gradient: AeroColors.primaryGradient,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(Icons.flight_takeoff_rounded, color: Colors.white, size: 18),
                    ),
                    const SizedBox(width: 12),
                    const Text(
                      'AeroDesk',
                      style: TextStyle(color: Colors.white, fontSize: 17, fontWeight: FontWeight.w800),
                    ),
                  ],
                ),
              ),
              const Divider(color: Color(0xFF1E293B), height: 1),
              Expanded(
                child: ListView(
                  padding: const EdgeInsets.all(12),
                  children: [
                    const Padding(
                      padding: EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      child: Text(
                        'MAIN',
                        style: TextStyle(color: Colors.white38, fontSize: 10, fontWeight: FontWeight.w800, letterSpacing: 1.2),
                      ),
                    ),
                    _DrawerItem(
                      icon: Icons.dashboard_outlined,
                      label: 'Dashboard',
                      active: _screen == 'dashboard',
                      onTap: () => _navigateTo('dashboard'),
                    ),
                    _DrawerItem(
                      icon: Icons.shopping_cart_outlined,
                      label: 'Flight POS (Search)',
                      active: _screen == 'flight-pos',
                      onTap: () => _navigateTo('flight-pos'),
                    ),
                    _DrawerItem(
                      icon: Icons.book_online_outlined,
                      label: 'Flight Bookings',
                      active: _screen == 'flight-bookings',
                      onTap: () => _navigateTo('flight-bookings'),
                    ),
                    _DrawerItem(
                      icon: Icons.person_pin_outlined,
                      label: 'Passenger Booking Form',
                      active: _screen == 'flight-management',
                      onTap: () => _navigateTo('flight-management'),
                    ),
                    _DrawerItem(
                      icon: Icons.alt_route_rounded,
                      label: 'Segment Management',
                      active: _screen == 'segment-management',
                      onTap: () => _navigateTo('segment-management'),
                    ),
                    const SizedBox(height: 12),
                    const Padding(
                      padding: EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      child: Text(
                        'MANAGEMENT',
                        style: TextStyle(color: Colors.white38, fontSize: 10, fontWeight: FontWeight.w800, letterSpacing: 1.2),
                      ),
                    ),
                    _DrawerItem(
                      icon: Icons.people_outline_rounded,
                      label: 'Sub Agents',
                      active: _screen == 'sub-agents',
                      onTap: () => _navigateTo('sub-agents'),
                    ),
                    _DrawerItem(
                      icon: Icons.bar_chart_rounded,
                      label: 'Reports',
                      active: _screen == 'reports',
                      onTap: () => _navigateTo('reports'),
                    ),
                    _DrawerItem(
                      icon: Icons.settings_outlined,
                      label: 'Settings',
                      active: _screen == 'settings',
                      onTap: () => _navigateTo('settings'),
                    ),
                  ],
                ),
              ),
              const Divider(color: Color(0xFF1E293B), height: 1),
              ListTile(
                leading: Container(
                  width: 36,
                  height: 36,
                  decoration: const BoxDecoration(
                    gradient: AeroColors.primaryGradient,
                    shape: BoxShape.circle,
                  ),
                  alignment: Alignment.center,
                  child: Text(initials, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 12)),
                ),
                title: Text(userName, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w700)),
                subtitle: Text(userRole, style: const TextStyle(color: Colors.white54, fontSize: 11)),
                trailing: IconButton(
                  icon: const Icon(Icons.logout_rounded, color: AeroColors.danger, size: 20),
                  onPressed: widget.onLogout,
                ),
              ),
            ],
          ),
        ),
      ),

      // Top Navbar (matching Navbar.tsx)
      appBar: AppBar(
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.white,
        elevation: 0,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1),
          child: Container(color: AeroColors.border, height: 1),
        ),
        leading: IconButton(
          icon: const Icon(Icons.menu_rounded, color: AeroColors.textPrimary),
          onPressed: () => _scaffoldKey.currentState?.openDrawer(),
        ),
        titleSpacing: 0,
        title: Row(
          children: [
            Text(
              '${currentMeta['breadcrumb']} / ',
              style: const TextStyle(color: AeroColors.textMuted, fontSize: 13.5, fontWeight: FontWeight.w500),
            ),
            Flexible(
              child: Text(
                '${currentMeta['page']}',
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(color: AeroColors.textPrimary, fontSize: 14.5, fontWeight: FontWeight.w800),
              ),
            ),
          ],
        ),
        actions: [
          Stack(
            alignment: Alignment.center,
            children: [
              IconButton(
                onPressed: () => _navigateTo('flight-bookings'),
                icon: const Icon(Icons.notifications_none_rounded, color: AeroColors.textSecondary, size: 22),
              ),
              Positioned(
                top: 12,
                right: 12,
                child: Container(
                  width: 7,
                  height: 7,
                  decoration: const BoxDecoration(color: AeroColors.danger, shape: BoxShape.circle),
                ),
              ),
            ],
          ),
          PopupMenuButton<String>(
            onSelected: (val) {
              if (val == 'logout') widget.onLogout();
              if (val == 'settings') _navigateTo('settings');
            },
            offset: const Offset(0, 46),
            itemBuilder: (_) => [
              PopupMenuItem(
                value: 'settings',
                child: Text('$userName ($userRole)', style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700)),
              ),
              const PopupMenuItem(
                value: 'logout',
                child: Row(
                  children: [
                    Icon(Icons.logout_rounded, size: 16, color: AeroColors.danger),
                    SizedBox(width: 8),
                    Text('Sign out', style: TextStyle(color: AeroColors.danger, fontSize: 12.5, fontWeight: FontWeight.w700)),
                  ],
                ),
              ),
            ],
            child: Padding(
              padding: const EdgeInsets.only(right: 14, left: 4),
              child: Container(
                width: 32,
                height: 32,
                decoration: const BoxDecoration(
                  gradient: AeroColors.primaryGradient,
                  shape: BoxShape.circle,
                ),
                alignment: Alignment.center,
                child: Text(
                  initials,
                  style: const TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.w800),
                ),
              ),
            ),
          ),
        ],
      ),

      body: _buildBody(),

      // Bottom Navigation Bar (matching App.tsx mobile bottom bar)
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          border: Border(top: BorderSide(color: AeroColors.border)),
        ),
        child: BottomNavigationBar(
          currentIndex: _bottomNavIndex,
          onTap: (idx) {
            switch (idx) {
              case 0:
                _navigateTo('dashboard');
                break;
              case 1:
                _navigateTo('flight-pos');
                break;
              case 2:
                _navigateTo('flight-bookings');
                break;
              case 3:
                _navigateTo('segment-management');
                break;
              case 4:
                _navigateTo('sub-agents');
                break;
            }
          },
          type: BottomNavigationBarType.fixed,
          backgroundColor: Colors.white,
          selectedItemColor: AeroColors.primary,
          unselectedItemColor: AeroColors.textMuted,
          selectedLabelStyle: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.w800),
          unselectedLabelStyle: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.w600),
          elevation: 0,
          items: const [
            BottomNavigationBarItem(icon: Icon(Icons.dashboard_rounded), label: 'Home'),
            BottomNavigationBarItem(icon: Icon(Icons.flight_takeoff_rounded), label: 'POS Search'),
            BottomNavigationBarItem(icon: Icon(Icons.confirmation_number_outlined), label: 'Bookings'),
            BottomNavigationBarItem(icon: Icon(Icons.alt_route_rounded), label: 'Segments'),
            BottomNavigationBarItem(icon: Icon(Icons.people_outline_rounded), label: 'Agents'),
          ],
        ),
      ),
    );
  }
}

class _DrawerItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool active;
  final VoidCallback onTap;

  const _DrawerItem({
    required this.icon,
    required this.label,
    required this.active,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: Material(
        color: active ? AeroColors.primary : Colors.transparent,
        borderRadius: BorderRadius.circular(10),
        child: InkWell(
          borderRadius: BorderRadius.circular(10),
          onTap: onTap,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 11),
            child: Row(
              children: [
                Icon(icon, size: 19, color: active ? Colors.white : Colors.white70),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    label,
                    style: TextStyle(
                      color: active ? Colors.white : Colors.white70,
                      fontSize: 13,
                      fontWeight: active ? FontWeight.w700 : FontWeight.w500,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

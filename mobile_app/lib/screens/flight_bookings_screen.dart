import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../theme/aerodesk_theme.dart';

class FlightBookingsScreen extends StatefulWidget {
  final VoidCallback onNewBooking;

  const FlightBookingsScreen({super.key, required this.onNewBooking});

  @override
  State<FlightBookingsScreen> createState() => _FlightBookingsScreenState();
}

class _FlightBookingsScreenState extends State<FlightBookingsScreen> {
  final List<String> _tabs = ['All', 'Pending', 'Approved', 'Rejected', 'Issued', 'Void'];
  String _activeTab = 'All';
  String _searchQuery = '';
  bool _loading = false;

  List<dynamic> _bookings = [
    {'ref': 'BK-20241', 'passenger': 'Sara Malik', 'route': 'KHI → DXB', 'airline': 'Emirates', 'date': 'Jun 12, 2026', 'cls': 'Economy', 'amount': '\$380', 'status': 'Approved'},
    {'ref': 'BK-20240', 'passenger': 'James Okafor', 'route': 'LHR → JFK', 'airline': 'British Airways', 'date': 'Jun 13, 2026', 'cls': 'Business', 'amount': '\$2,840', 'status': 'Pending'},
    {'ref': 'BK-20239', 'passenger': 'Ayesha Khan', 'route': 'ISB → RUH', 'airline': 'PIA', 'date': 'Jun 14, 2026', 'cls': 'Economy', 'amount': '\$420', 'status': 'Issued'},
    {'ref': 'BK-20238', 'passenger': 'Marco Rossi', 'route': 'MXP → CDG', 'airline': 'Air France', 'date': 'Jun 15, 2026', 'cls': 'First', 'amount': '\$5,200', 'status': 'Approved'},
    {'ref': 'BK-20237', 'passenger': 'Lin Wei', 'route': 'PEK → SIN', 'airline': 'Singapore Air', 'date': 'Jun 16, 2026', 'cls': 'Business', 'amount': '\$1,920', 'status': 'Rejected'},
  ];

  @override
  void initState() {
    super.initState();
    _fetchBookings();
  }

  Future<void> _fetchBookings() async {
    setState(() => _loading = true);
    try {
      final list = await ApiService.getBookings(
        status: _activeTab,
        search: _searchQuery,
      );
      if (mounted) {
        setState(() => _bookings = list);
      }
    } catch (_) {
      // Keep local list if offline
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _updateStatus(String ref, String newStatus) async {
    setState(() {
      _bookings = _bookings.map((b) {
        final m = Map<String, dynamic>.from(b as Map);
        if (m['ref'] == ref) m['status'] = newStatus;
        return m;
      }).toList();
    });
    try {
      await ApiService.updateBookingStatus(ref, newStatus);
      _fetchBookings();
    } catch (_) {}
  }

  void _showBookingDetails(Map<String, dynamic> booking) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(22)),
      ),
      builder: (ctx) {
        return Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '${booking['ref']}',
                        style: const TextStyle(color: AeroColors.primary, fontSize: 12, fontWeight: FontWeight.w800),
                      ),
                      Text(
                        '${booking['passenger']}',
                        style: const TextStyle(color: AeroColors.textPrimary, fontSize: 19, fontWeight: FontWeight.w800),
                      ),
                    ],
                  ),
                  StatusBadge(status: '${booking['status']}'),
                ],
              ),
              const Divider(height: 24),
              Row(
                children: [
                  Expanded(
                    child: _DetailTile(label: 'Route & Airline', value: '${booking['route']} · ${booking['airline']}'),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: _DetailTile(label: 'Date & Class', value: '${booking['date']} · ${booking['cls']}'),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              Row(
                children: [
                  Expanded(
                    child: _DetailTile(
                      label: 'Passport / Nationality',
                      value: '${booking['passport_number'] ?? 'PK982312'} (${booking['nationality'] ?? 'Pakistan'})',
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: _DetailTile(label: 'Total Fare', value: '${booking['amount']}'),
                  ),
                ],
              ),
              const SizedBox(height: 18),
              const Text(
                'Update Booking Status:',
                style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AeroColors.textSecondary),
              ),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: ['Approved', 'Issued', 'Pending', 'Rejected', 'Void'].map((st) {
                  final isCurrent = booking['status'] == st;
                  return ChoiceChip(
                    label: Text(st),
                    selected: isCurrent,
                    selectedColor: AeroColors.primary,
                    labelStyle: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: isCurrent ? Colors.white : AeroColors.textSecondary,
                    ),
                    onSelected: (_) {
                      Navigator.pop(ctx);
                      _updateStatus('${booking['ref']}', st);
                    },
                  );
                }).toList(),
              ),
              const SizedBox(height: 12),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final filtered = _bookings.where((raw) {
      final b = raw as Map<String, dynamic>;
      if (_activeTab != 'All' && b['status'] != _activeTab) return false;
      if (_searchQuery.isNotEmpty) {
        final q = _searchQuery.toLowerCase();
        final hit = '${b['ref']} ${b['passenger']} ${b['route']} ${b['airline']}'.toLowerCase().contains(q);
        if (!hit) return false;
      }
      return true;
    }).toList();

    return RefreshIndicator(
      onRefresh: _fetchBookings,
      color: AeroColors.primary,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  const Text(
                    'Flight Bookings',
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: AeroColors.textPrimary),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                      color: AeroColors.primarySoft,
                      borderRadius: BorderRadius.circular(99),
                      border: Border.all(color: const Color(0xFFA5B4FC)),
                    ),
                    child: Text(
                      '${4811 + _bookings.length}',
                      style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Color(0xFF4338CA)),
                    ),
                  ),
                ],
              ),
              DecoratedBox(
                decoration: BoxDecoration(
                  gradient: AeroColors.primaryGradient,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: ElevatedButton.icon(
                  onPressed: widget.onNewBooking,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.transparent,
                    shadowColor: Colors.transparent,
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  ),
                  icon: const Icon(Icons.add_rounded, size: 16, color: Colors.white),
                  label: const Text(
                    'New Booking',
                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Colors.white),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Search Box
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AeroColors.border),
            ),
            child: TextField(
              onChanged: (v) {
                setState(() => _searchQuery = v);
                _fetchBookings();
              },
              decoration: InputDecoration(
                hintText: 'Search ref#, passenger, route, airline…',
                hintStyle: const TextStyle(fontSize: 13, color: AeroColors.textMuted),
                prefixIcon: const Icon(Icons.search_rounded, size: 18, color: AeroColors.textMuted),
                suffixIcon: _loading
                    ? const Padding(
                        padding: EdgeInsets.all(12),
                        child: SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2)),
                      )
                    : null,
                border: InputBorder.none,
              ),
            ),
          ),
          const SizedBox(height: 12),

          // Status Filter Pill Tabs
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: _tabs.map((tab) {
                final active = _activeTab == tab;
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: GestureDetector(
                    onTap: () {
                      setState(() => _activeTab = tab);
                      _fetchBookings();
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      decoration: BoxDecoration(
                        color: active ? AeroColors.primary : Colors.white,
                        borderRadius: BorderRadius.circular(99),
                        border: Border.all(color: active ? AeroColors.primary : AeroColors.border),
                        boxShadow: active
                            ? [
                                BoxShadow(
                                  color: AeroColors.primary.withValues(alpha: 0.25),
                                  blurRadius: 8,
                                  offset: const Offset(0, 2),
                                )
                              ]
                            : null,
                      ),
                      child: Text(
                        tab,
                        style: TextStyle(
                          fontSize: 12.5,
                          fontWeight: FontWeight.w700,
                          color: active ? Colors.white : AeroColors.textSecondary,
                        ),
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
          ),
          const SizedBox(height: 14),

          // Booking Cards
          ...filtered.map((raw) {
            final b = raw as Map<String, dynamic>;
            return Container(
              margin: const EdgeInsets.only(bottom: 10),
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AeroColors.border),
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Text(
                            '${b['ref']}',
                            style: const TextStyle(
                              fontSize: 12.5,
                              fontWeight: FontWeight.w800,
                              color: AeroColors.primary,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: const Color(0xFFF1F5F9),
                              borderRadius: BorderRadius.circular(99),
                            ),
                            child: Text(
                              '${b['cls']}',
                              style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.w600, color: AeroColors.textSecondary),
                            ),
                          ),
                        ],
                      ),
                      StatusBadge(status: '${b['status']}'),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              '${b['passenger']}',
                              style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: AeroColors.textPrimary),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              '${b['route']} · ${b['airline']} · ${b['date']}',
                              style: const TextStyle(fontSize: 12, color: AeroColors.textSecondary),
                            ),
                          ],
                        ),
                      ),
                      Text(
                        '${b['amount']}',
                        style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: AeroColors.textPrimary),
                      ),
                    ],
                  ),
                  const Divider(height: 20),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      _ActionButton(
                        icon: Icons.visibility_outlined,
                        label: 'View',
                        bg: const Color(0xFFECFEFF),
                        color: const Color(0xFF06B6D4),
                        onTap: () => _showBookingDetails(b),
                      ),
                      const SizedBox(width: 8),
                      _ActionButton(
                        icon: Icons.check_circle_outline_rounded,
                        label: 'Approve',
                        bg: const Color(0xFFF0FDF4),
                        color: const Color(0xFF22C55E),
                        onTap: () => _updateStatus('${b['ref']}', 'Approved'),
                      ),
                      const SizedBox(width: 8),
                      _ActionButton(
                        icon: Icons.cancel_outlined,
                        label: 'Reject',
                        bg: const Color(0xFFFEF2F2),
                        color: const Color(0xFFEF4444),
                        onTap: () => _updateStatus('${b['ref']}', 'Rejected'),
                      ),
                    ],
                  ),
                ],
              ),
            );
          }),
        ],
      ),
    );
  }
}

class _ActionButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color bg;
  final Color color;
  final VoidCallback onTap;

  const _ActionButton({
    required this.icon,
    required this.label,
    required this.bg,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          color: bg,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Row(
          children: [
            Icon(icon, size: 14, color: color),
            const SizedBox(width: 4),
            Text(
              label,
              style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.w700, color: color),
            ),
          ],
        ),
      ),
    );
  }
}

class _DetailTile extends StatelessWidget {
  final String label;
  final String value;

  const _DetailTile({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AeroColors.pageBg,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(fontSize: 10.5, color: AeroColors.textMuted)),
          const SizedBox(height: 3),
          Text(
            value,
            style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700, color: AeroColors.textPrimary),
          ),
        ],
      ),
    );
  }
}

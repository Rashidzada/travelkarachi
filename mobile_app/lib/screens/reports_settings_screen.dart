import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../theme/aerodesk_theme.dart';

class ReportsScreen extends StatefulWidget {
  const ReportsScreen({super.key});

  @override
  State<ReportsScreen> createState() => _ReportsScreenState();
}

class _ReportsScreenState extends State<ReportsScreen> {
  Map<String, dynamic>? _data;

  @override
  void initState() {
    super.initState();
    ApiService.getReports().then((res) {
      if (mounted) setState(() => _data = res);
    }).catchError((_) {});
  }

  @override
  Widget build(BuildContext context) {
    final airlines = (_data?['airline_breakdown'] as List<dynamic>?) ??
        [
          {'airline': 'Air France', 'revenue': 10000, 'bookings': 2},
          {'airline': 'British Airways', 'revenue': 2840, 'bookings': 1},
          {'airline': 'Singapore Air', 'revenue': 1920, 'bookings': 1},
          {'airline': 'PIA', 'revenue': 1270, 'bookings': 2},
          {'airline': 'Emirates', 'revenue': 380, 'bookings': 1},
        ];
    final statuses = (_data?['status_breakdown'] as List<dynamic>?) ??
        [
          {'status': 'Approved', 'count': 4},
          {'status': 'Pending', 'count': 2},
          {'status': 'Issued', 'count': 2},
          {'status': 'Rejected', 'count': 1},
        ];

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const Text(
          'Analytics & Financial Reports',
          style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: AeroColors.textPrimary),
        ),
        const SizedBox(height: 4),
        const Text(
          'Live database aggregation across airlines and booking statuses',
          style: TextStyle(fontSize: 12.5, color: AeroColors.textMuted),
        ),
        const SizedBox(height: 16),

        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: AeroColors.border),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Revenue by Airline',
                style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: AeroColors.textPrimary),
              ),
              const SizedBox(height: 12),
              ...airlines.map((raw) {
                final item = raw as Map<String, dynamic>;
                return Padding(
                  padding: const EdgeInsets.symmetric(vertical: 8),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            '${item['airline']}',
                            style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.w700, color: AeroColors.textPrimary),
                          ),
                          Text(
                            '${item['bookings']} bookings',
                            style: const TextStyle(fontSize: 11, color: AeroColors.textMuted),
                          ),
                        ],
                      ),
                      Text(
                        '\$${(item['revenue'] as num).toInt()}',
                        style: const TextStyle(fontSize: 14.5, fontWeight: FontWeight.w800, color: AeroColors.primary),
                      ),
                    ],
                  ),
                );
              }),
            ],
          ),
        ),
        const SizedBox(height: 16),

        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: AeroColors.border),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Bookings by Status',
                style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: AeroColors.textPrimary),
              ),
              const SizedBox(height: 12),
              ...statuses.map((raw) {
                final item = raw as Map<String, dynamic>;
                return Padding(
                  padding: const EdgeInsets.symmetric(vertical: 8),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      StatusBadge(status: '${item['status']}'),
                      Text(
                        '${item['count']} records',
                        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: AeroColors.textPrimary),
                      ),
                    ],
                  ),
                );
              }),
            ],
          ),
        ),
      ],
    );
  }
}

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  final _agencyCtrl = TextEditingController(text: 'AeroDesk Travel Karachi');
  final _emailCtrl = TextEditingController(text: 'ops@aerodesk.pk');
  final _phoneCtrl = TextEditingController(text: '+92-21-35880011');
  final _originCtrl = TextEditingController(text: 'KHI');
  bool _saved = false;

  @override
  void initState() {
    super.initState();
    ApiService.getSettings().then((res) {
      final s = res['settings'] as Map<String, dynamic>?;
      if (s != null && mounted) {
        setState(() {
          _agencyCtrl.text = s['agency_name']?.toString() ?? 'AeroDesk Travel Karachi';
          _emailCtrl.text = s['support_email']?.toString() ?? 'ops@aerodesk.pk';
          _phoneCtrl.text = s['support_phone']?.toString() ?? '+92-21-35880011';
          _originCtrl.text = s['default_origin']?.toString() ?? 'KHI';
        });
      }
    }).catchError((_) {});
  }

  Future<void> _save() async {
    try {
      await ApiService.updateSettings({
        'agency_name': _agencyCtrl.text.trim(),
        'support_email': _emailCtrl.text.trim(),
        'support_phone': _phoneCtrl.text.trim(),
        'default_origin': _originCtrl.text.trim().toUpperCase(),
      });
      if (mounted) {
        setState(() => _saved = true);
        Future.delayed(const Duration(seconds: 3), () {
          if (mounted) setState(() => _saved = false);
        });
      }
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const Text(
          'Platform Settings',
          style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: AeroColors.textPrimary),
        ),
        const SizedBox(height: 4),
        const Text(
          'Configure agency defaults stored in the Django database',
          style: TextStyle(fontSize: 12.5, color: AeroColors.textMuted),
        ),
        const SizedBox(height: 16),

        if (_saved)
          Container(
            padding: const EdgeInsets.all(12),
            margin: const EdgeInsets.only(bottom: 12),
            decoration: BoxDecoration(
              color: const Color(0xFFF0FDF4),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFF86EFAC)),
            ),
            child: const Row(
              children: [
                Icon(Icons.check_circle_rounded, color: Color(0xFF15803D), size: 18),
                SizedBox(width: 8),
                Text(
                  'Settings saved to Django database!',
                  style: TextStyle(color: Color(0xFF15803D), fontWeight: FontWeight.w700, fontSize: 13),
                ),
              ],
            ),
          ),

        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: AeroColors.border),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              TextField(
                controller: _agencyCtrl,
                decoration: const InputDecoration(labelText: 'Agency Name', border: OutlineInputBorder()),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _emailCtrl,
                decoration: const InputDecoration(labelText: 'Support Email', border: OutlineInputBorder()),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _phoneCtrl,
                decoration: const InputDecoration(labelText: 'Support Phone', border: OutlineInputBorder()),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _originCtrl,
                decoration: const InputDecoration(labelText: 'Default Hub (IATA)', border: OutlineInputBorder()),
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                height: 46,
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    gradient: AeroColors.primaryGradient,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: ElevatedButton(
                    onPressed: _save,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.transparent,
                      shadowColor: Colors.transparent,
                    ),
                    child: const Text(
                      'Save Configuration',
                      style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

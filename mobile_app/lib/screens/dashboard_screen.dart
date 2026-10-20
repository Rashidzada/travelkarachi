import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../theme/aerodesk_theme.dart';

class DashboardScreen extends StatefulWidget {
  final void Function(String screen) onNavigate;

  const DashboardScreen({super.key, required this.onNavigate});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  String _period = '1Y';
  String _chartType = 'bookings';
  bool _loading = false;

  Map<String, dynamic> _hero = {
    'active_bookings': '4,821',
    'awaiting_review': 138,
    'bookings_today': '84',
    'pending_review_today': '12',
    'revenue_today': '\$42K',
  };

  List<dynamic> _kpis = [
    {'label': 'Total Bookings', 'value': '4,821', 'sub': '+12.4% vs last month', 'trend': '+12.4%', 'up': true},
    {'label': 'Sales Revenue', 'value': '\$1.24M', 'sub': '+8.7% vs last month', 'trend': '+8.7%', 'up': true},
    {'label': 'Pending Approvals', 'value': '138', 'sub': '–3.2% vs last month', 'trend': '-3.2%', 'up': false},
    {'label': 'Approved Bookings', 'value': '3,902', 'sub': '+15.1% vs last month', 'trend': '+15.1%', 'up': true},
    {'label': 'Sub Agents', 'value': '127', 'sub': '+4.3% vs last month', 'trend': '+4.3%', 'up': true},
    {'label': 'New Registrations', 'value': '23', 'sub': '+18.9% vs last month', 'trend': '+18.9%', 'up': true},
  ];

  List<dynamic> _chartData = [
    {'month': 'Jan', 'bookings': 340, 'revenue': 68},
    {'month': 'Feb', 'bookings': 420, 'revenue': 84},
    {'month': 'Mar', 'bookings': 380, 'revenue': 76},
    {'month': 'Apr', 'bookings': 510, 'revenue': 102},
    {'month': 'May', 'bookings': 460, 'revenue': 92},
    {'month': 'Jun', 'bookings': 620, 'revenue': 124},
    {'month': 'Jul', 'bookings': 580, 'revenue': 116},
    {'month': 'Aug', 'bookings': 710, 'revenue': 142},
    {'month': 'Sep', 'bookings': 650, 'revenue': 130},
    {'month': 'Oct', 'bookings': 780, 'revenue': 156},
    {'month': 'Nov', 'bookings': 820, 'revenue': 164},
    {'month': 'Dec', 'bookings': 940, 'revenue': 188},
  ];

  List<dynamic> _recentApprovals = [
    {'id': 1, 'name': 'Sara Malik', 'ref': 'BK-20241', 'route': 'KHI → DXB', 'status': 'Approved', 'time': '2m ago', 'initials': 'SM', 'color': '#4F46E5'},
    {'id': 2, 'name': 'James Okafor', 'ref': 'BK-20240', 'route': 'LHR → JFK', 'status': 'Pending', 'time': '8m ago', 'initials': 'JO', 'color': '#06B6D4'},
    {'id': 3, 'name': 'Ayesha Khan', 'ref': 'BK-20239', 'route': 'ISB → RUH', 'status': 'Issued', 'time': '15m ago', 'initials': 'AK', 'color': '#22C55E'},
    {'id': 4, 'name': 'Marco Rossi', 'ref': 'BK-20238', 'route': 'MXP → CDG', 'status': 'Approved', 'time': '22m ago', 'initials': 'MR', 'color': '#F59E0B'},
  ];

  List<dynamic> _topAgents = [
    {'name': 'Falcon Travels', 'city': 'Karachi', 'bookings': 284, 'revenue': '\$142,800', 'growth': 18, 'status': 'Active'},
    {'name': 'Sky Bridge Intl', 'city': 'Lahore', 'bookings': 231, 'revenue': '\$118,350', 'growth': 12, 'status': 'Active'},
    {'name': 'Horizon Agency', 'city': 'Dubai', 'bookings': 198, 'revenue': '\$99,000', 'growth': 9, 'status': 'Active'},
    {'name': 'Global Wings', 'city': 'Islamabad', 'bookings': 167, 'revenue': '\$83,500', 'growth': -4, 'status': 'Suspended'},
    {'name': 'AirConnect Ltd', 'city': 'Riyadh', 'bookings': 143, 'revenue': '\$71,500', 'growth': 6, 'status': 'Active'},
  ];

  @override
  void initState() {
    super.initState();
    _fetchDashboard();
  }

  Future<void> _fetchDashboard() async {
    setState(() => _loading = true);
    try {
      final data = await ApiService.getDashboard(period: _period);
      if (!mounted) return;
      setState(() {
        if (data['hero'] != null) _hero = data['hero'] as Map<String, dynamic>;
        if (data['kpis'] != null) _kpis = data['kpis'] as List<dynamic>;
        if (data['chartData'] != null) _chartData = data['chartData'] as List<dynamic>;
        if (data['recentApprovals'] != null) _recentApprovals = data['recentApprovals'] as List<dynamic>;
        if (data['topAgents'] != null) _topAgents = data['topAgents'] as List<dynamic>;
      });
    } catch (_) {
      // Keep fallback data if offline
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final kpiIcons = [
      Icons.confirmation_number_outlined,
      Icons.attach_money_rounded,
      Icons.schedule_rounded,
      Icons.check_circle_outline_rounded,
      Icons.people_outline_rounded,
      Icons.person_add_alt_1_outlined,
    ];
    final kpiColors = [
      const Color(0xFF4F46E5),
      const Color(0xFF22C55E),
      const Color(0xFFF59E0B),
      const Color(0xFF06B6D4),
      const Color(0xFF7C3AED),
      const Color(0xFFEF4444),
    ];

    return RefreshIndicator(
      onRefresh: _fetchDashboard,
      color: AeroColors.primary,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Hero Banner
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: AeroColors.heroGradient,
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: AeroColors.primary.withValues(alpha: 0.22),
                    blurRadius: 20,
                    offset: const Offset(0, 8),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.18),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: Colors.white.withValues(alpha: 0.3)),
                        ),
                        child: const Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.bolt_rounded, color: Colors.white, size: 13),
                            SizedBox(width: 4),
                            Text(
                              'Live Dashboard',
                              style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w700),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 8),
                      if (_loading)
                        const SizedBox(
                          width: 12,
                          height: 12,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white70),
                        ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  const Text(
                    'Good morning, Admin 👋',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 22,
                      fontWeight: FontWeight.w800,
                      letterSpacing: -0.4,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '${_hero['active_bookings']} bookings active · ${_hero['awaiting_review']} awaiting review',
                    style: TextStyle(color: Colors.white.withValues(alpha: 0.7), fontSize: 12.5),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      _HeroStatChip(
                        icon: Icons.flash_on_rounded,
                        label: 'Bookings Today',
                        value: '${_hero['bookings_today']}',
                      ),
                      const SizedBox(width: 8),
                      _HeroStatChip(
                        icon: Icons.access_time_rounded,
                        label: 'Pending Review',
                        value: '${_hero['pending_review_today']}',
                      ),
                      const SizedBox(width: 8),
                      _HeroStatChip(
                        icon: Icons.attach_money_rounded,
                        label: 'Revenue Today',
                        value: '${_hero['revenue_today']}',
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // KPI Cards Grid (2 columns on mobile)
            GridView.builder(
              itemCount: _kpis.length,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
                childAspectRatio: 1.42,
              ),
              itemBuilder: (context, index) {
                final kpi = _kpis[index] as Map<String, dynamic>;
                final up = kpi['up'] == true;
                final color = kpiColors[index % kpiColors.length];
                return Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AeroColors.border),
                    boxShadow: [
                      BoxShadow(
                        color: AeroColors.textPrimary.withValues(alpha: 0.04),
                        blurRadius: 12,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Container(
                            width: 34,
                            height: 34,
                            decoration: BoxDecoration(
                              color: color,
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Icon(kpiIcons[index % kpiIcons.length], color: Colors.white, size: 17),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: up ? const Color(0xFFF0FDF4) : const Color(0xFFFEF2F2),
                              borderRadius: BorderRadius.circular(99),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(
                                  up ? Icons.trending_up_rounded : Icons.trending_down_rounded,
                                  size: 11,
                                  color: up ? const Color(0xFF16A34A) : const Color(0xFFDC2626),
                                ),
                                const SizedBox(width: 2),
                                Text(
                                  '${kpi['trend'] ?? '+12%'}',
                                  style: TextStyle(
                                    fontSize: 10,
                                    fontWeight: FontWeight.w700,
                                    color: up ? const Color(0xFF16A34A) : const Color(0xFFDC2626),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            '${kpi['value']}',
                            style: const TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.w900,
                              color: AeroColors.textPrimary,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            '${kpi['label']}',
                            style: const TextStyle(
                              fontSize: 11.5,
                              fontWeight: FontWeight.w600,
                              color: AeroColors.textSecondary,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ],
                  ),
                );
              },
            ),
            const SizedBox(height: 16),

            // Quick Actions Card
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
                    'Quick Actions',
                    style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: AeroColors.textPrimary),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: _QuickActionBtn(
                          icon: Icons.add_circle_outline_rounded,
                          label: 'New Booking',
                          color: AeroColors.primary,
                          onTap: () => widget.onNavigate('flight-pos'),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: _QuickActionBtn(
                          icon: Icons.person_add_alt_rounded,
                          label: 'Add Agent',
                          color: AeroColors.secondary,
                          onTap: () => widget.onNavigate('sub-agents'),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: _QuickActionBtn(
                          icon: Icons.alt_route_rounded,
                          label: 'Segments',
                          color: AeroColors.accent,
                          onTap: () => widget.onNavigate('segment-management'),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: _QuickActionBtn(
                          icon: Icons.bar_chart_rounded,
                          label: 'Reports',
                          color: const Color(0xFF475569),
                          onTap: () => widget.onNavigate('reports'),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Booking Activity Chart Card
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
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Booking Activity',
                            style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: AeroColors.textPrimary),
                          ),
                          Text(
                            'Monthly performance — $_period view',
                            style: const TextStyle(fontSize: 11, color: AeroColors.textMuted),
                          ),
                        ],
                      ),
                      // Bookings / Revenue Toggle
                      Container(
                        padding: const EdgeInsets.all(3),
                        decoration: BoxDecoration(
                          color: AeroColors.pageBg,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: AeroColors.border),
                        ),
                        child: Row(
                          children: ['bookings', 'revenue'].map((type) {
                            final active = _chartType == type;
                            return GestureDetector(
                              onTap: () => setState(() => _chartType = type),
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                decoration: BoxDecoration(
                                  color: active ? AeroColors.primary : Colors.transparent,
                                  borderRadius: BorderRadius.circular(16),
                                ),
                                child: Text(
                                  type[0].toUpperCase() + type.substring(1),
                                  style: TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.w700,
                                    color: active ? Colors.white : AeroColors.textMuted,
                                  ),
                                ),
                              ),
                            );
                          }).toList(),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  // Period Tabs (7D / 30D / 90D / 1Y)
                  Row(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: ['7D', '30D', '90D', '1Y'].map((p) {
                      final active = _period == p;
                      return Padding(
                        padding: const EdgeInsets.only(left: 6),
                        child: GestureDetector(
                          onTap: () {
                            setState(() => _period = p);
                            _fetchDashboard();
                          },
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: active ? AeroColors.primarySoft : AeroColors.pageBg,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(
                                color: active ? AeroColors.primary : AeroColors.border,
                              ),
                            ),
                            child: Text(
                              p,
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w700,
                                color: active ? AeroColors.primary : AeroColors.textSecondary,
                              ),
                            ),
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    height: 165,
                    width: double.infinity,
                    child: _AeroChartWidget(
                      data: _chartData,
                      metricKey: _chartType,
                      isBar: _chartType == 'revenue',
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Recent Approvals Card
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
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Recent Approvals',
                            style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: AeroColors.textPrimary),
                          ),
                          Text(
                            'Latest transactions from live DB',
                            style: TextStyle(fontSize: 11, color: AeroColors.textMuted),
                          ),
                        ],
                      ),
                      TextButton.icon(
                        onPressed: () => widget.onNavigate('flight-bookings'),
                        icon: const Text('All', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700)),
                        label: const Icon(Icons.arrow_forward_rounded, size: 14),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  ..._recentApprovals.map((item) {
                    final m = item as Map<String, dynamic>;
                    return InkWell(
                      onTap: () => widget.onNavigate('flight-bookings'),
                      child: Padding(
                        padding: const EdgeInsets.symmetric(vertical: 8),
                        child: Row(
                          children: [
                            Container(
                              width: 36,
                              height: 36,
                              decoration: BoxDecoration(
                                color: AeroColors.parseHex(m['color']?.toString()),
                                shape: BoxShape.circle,
                              ),
                              alignment: Alignment.center,
                              child: Text(
                                '${m['initials'] ?? 'BK'}',
                                style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w800),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    '${m['name']}',
                                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AeroColors.textPrimary),
                                  ),
                                  Text(
                                    '${m['ref']} · ${m['route']}',
                                    style: const TextStyle(fontSize: 11, color: AeroColors.textMuted),
                                  ),
                                ],
                              ),
                            ),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                StatusBadge(status: '${m['status']}'),
                                const SizedBox(height: 3),
                                Text(
                                  '${m['time'] ?? 'Just now'}',
                                  style: const TextStyle(fontSize: 10, color: AeroColors.textMuted),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    );
                  }),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Top Sub-Agents Card
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
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Top Sub-Agents',
                            style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: AeroColors.textPrimary),
                          ),
                          Text(
                            'Ranked by bookings this month',
                            style: TextStyle(fontSize: 11, color: AeroColors.textMuted),
                          ),
                        ],
                      ),
                      TextButton(
                        onPressed: () => widget.onNavigate('sub-agents'),
                        child: const Text('View All', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  ..._topAgents.asMap().entries.map((entry) {
                    final idx = entry.key;
                    final agent = entry.value as Map<String, dynamic>;
                    final growth = (agent['growth'] as num?)?.toInt() ?? 0;
                    return Padding(
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      child: Row(
                        children: [
                          SizedBox(
                            width: 24,
                            child: Text(
                              '0${idx + 1}',
                              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: AeroColors.textMuted),
                            ),
                          ),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  '${agent['name']}',
                                  style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AeroColors.textPrimary),
                                ),
                                Text(
                                  '${agent['city']} · ${agent['bookings']} bookings',
                                  style: const TextStyle(fontSize: 11, color: AeroColors.textSecondary),
                                ),
                              ],
                            ),
                          ),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              Text(
                                '${agent['revenue']}',
                                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: AeroColors.textPrimary),
                              ),
                              Text(
                                '${growth >= 0 ? '+' : ''}$growth%',
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w700,
                                  color: growth >= 0 ? const Color(0xFF16A34A) : const Color(0xFFDC2626),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(width: 10),
                          StatusBadge(status: '${agent['status']}'),
                        ],
                      ),
                    );
                  }),
                ],
              ),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }
}

class _HeroStatChip extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;

  const _HeroStatChip({required this.icon, required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 8),
        decoration: BoxDecoration(
          color: Colors.white.withValues(alpha: 0.14),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: Colors.white.withValues(alpha: 0.22)),
        ),
        child: Column(
          children: [
            Icon(icon, color: Colors.white70, size: 15),
            const SizedBox(height: 4),
            Text(
              value,
              style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w900),
            ),
            const SizedBox(height: 2),
            Text(
              label,
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.white.withValues(alpha: 0.65), fontSize: 9.5),
            ),
          ],
        ),
      ),
    );
  }
}

class _QuickActionBtn extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;

  const _QuickActionBtn({
    required this.icon,
    required this.label,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 6),
        decoration: BoxDecoration(
          color: AeroColors.pageBg,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AeroColors.border),
        ),
        child: Column(
          children: [
            Container(
              width: 38,
              height: 38,
              decoration: BoxDecoration(
                color: color,
                borderRadius: BorderRadius.circular(11),
              ),
              child: Icon(icon, color: Colors.white, size: 20),
            ),
            const SizedBox(height: 6),
            Text(
              label,
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.w700, color: AeroColors.textPrimary),
            ),
          ],
        ),
      ),
    );
  }
}

class _AeroChartWidget extends StatelessWidget {
  final List<dynamic> data;
  final String metricKey;
  final bool isBar;

  const _AeroChartWidget({
    required this.data,
    required this.metricKey,
    required this.isBar,
  });

  @override
  Widget build(BuildContext context) {
    if (data.isEmpty) return const SizedBox.shrink();
    final values = data.map((e) => ((e as Map)[metricKey] as num?)?.toDouble() ?? 0.0).toList();
    final labels = data.map((e) => '${(e as Map)['month'] ?? ''}').toList();
    final maxVal = values.fold<double>(1.0, (prev, el) => el > prev ? el : prev);

    return Column(
      children: [
        Expanded(
          child: CustomPaint(
            size: Size.infinite,
            painter: _ChartPainter(values: values, maxVal: maxVal, isBar: isBar),
          ),
        ),
        const SizedBox(height: 8),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: labels
              .map(
                (l) => Text(
                  l,
                  style: const TextStyle(fontSize: 9.5, color: AeroColors.textMuted, fontWeight: FontWeight.w600),
                ),
              )
              .toList(),
        ),
      ],
    );
  }
}

class _ChartPainter extends CustomPainter {
  final List<double> values;
  final double maxVal;
  final bool isBar;

  _ChartPainter({required this.values, required this.maxVal, required this.isBar});

  @override
  void paint(Canvas canvas, Size size) {
    if (values.isEmpty) return;

    final gridPaint = Paint()
      ..color = const Color(0xFFE2E8F0)
      ..strokeWidth = 1;

    for (int i = 0; i <= 3; i++) {
      final y = size.height * (i / 3);
      canvas.drawLine(Offset(0, y), Offset(size.width, y), gridPaint);
    }

    if (isBar) {
      final barWidth = (size.width / values.length) * 0.55;
      final barPaint = Paint()..color = AeroColors.primary.withValues(alpha: 0.85);
      for (int i = 0; i < values.length; i++) {
        final xCenter = (size.width / values.length) * (i + 0.5);
        final barHeight = (values[i] / maxVal) * (size.height - 10);
        final rect = RRect.fromRectAndCorners(
          Rect.fromLTWH(xCenter - barWidth / 2, size.height - barHeight, barWidth, barHeight),
          topLeft: const Radius.circular(5),
          topRight: const Radius.circular(5),
        );
        canvas.drawRRect(rect, barPaint);
      }
      return;
    }

    // Smooth Line + Area Chart
    final points = <Offset>[];
    for (int i = 0; i < values.length; i++) {
      final x = values.length == 1 ? size.width / 2 : (size.width * i) / (values.length - 1);
      final y = size.height - ((values[i] / maxVal) * (size.height - 12));
      points.add(Offset(x, y));
    }

    final linePath = Path()..moveTo(points.first.dx, points.first.dy);
    for (int i = 1; i < points.length; i++) {
      final p0 = points[i - 1];
      final p1 = points[i];
      final midX = (p0.dx + p1.dx) / 2;
      linePath.cubicTo(midX, p0.dy, midX, p1.dy, p1.dx, p1.dy);
    }

    final fillPath = Path.from(linePath)
      ..lineTo(points.last.dx, size.height)
      ..lineTo(points.first.dx, size.height)
      ..close();

    final fillPaint = Paint()
      ..shader = LinearGradient(
        colors: [
          AeroColors.primary.withValues(alpha: 0.22),
          AeroColors.primary.withValues(alpha: 0.01),
        ],
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
      ).createShader(Rect.fromLTWH(0, 0, size.width, size.height));

    final strokePaint = Paint()
      ..color = AeroColors.primary
      ..strokeWidth = 2.6
      ..style = PaintingStyle.stroke;

    canvas.drawPath(fillPath, fillPaint);
    canvas.drawPath(linePath, strokePaint);
  }

  @override
  bool shouldRepaint(covariant _ChartPainter oldDelegate) =>
      oldDelegate.values != values || oldDelegate.isBar != isBar;
}

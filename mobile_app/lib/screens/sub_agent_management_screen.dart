import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../theme/aerodesk_theme.dart';

class SubAgentManagementScreen extends StatefulWidget {
  const SubAgentManagementScreen({super.key});

  @override
  State<SubAgentManagementScreen> createState() => _SubAgentManagementScreenState();
}

class _SubAgentManagementScreenState extends State<SubAgentManagementScreen> {
  String _search = '';
  bool _loading = false;

  List<dynamic> _agents = [
    {'id': 1, 'name': 'Falcon Travels', 'company': 'Falcon Intl', 'initials': 'FT', 'color': '#4F46E5', 'email': 'info@falcon.pk', 'phone': '+92-21-1234567', 'city': 'Karachi', 'creditLimit': 500000, 'creditUsed': 210000, 'balance': 290000, 'status': 'Active'},
    {'id': 2, 'name': 'Sky Bridge Intl', 'company': 'Sky Group', 'initials': 'SB', 'color': '#06B6D4', 'email': 'ops@skybridge.com', 'phone': '+92-42-9876543', 'city': 'Lahore', 'creditLimit': 350000, 'creditUsed': 280000, 'balance': 70000, 'status': 'Active'},
    {'id': 3, 'name': 'Horizon Agency', 'company': 'Horizon LLC', 'initials': 'HA', 'color': '#22C55E', 'email': 'book@horizon.ae', 'phone': '+971-4-1234567', 'city': 'Dubai', 'creditLimit': 800000, 'creditUsed': 520000, 'balance': 280000, 'status': 'Active'},
    {'id': 4, 'name': 'Global Wings', 'company': 'Global Corp', 'initials': 'GW', 'color': '#7C3AED', 'email': 'sales@globalwings.pk', 'phone': '+92-51-5555555', 'city': 'Islamabad', 'creditLimit': 200000, 'creditUsed': 178000, 'balance': 22000, 'status': 'Suspended'},
  ];

  @override
  void initState() {
    super.initState();
    _fetchAgents();
  }

  Future<void> _fetchAgents() async {
    setState(() => _loading = true);
    try {
      final list = await ApiService.getAgents(search: _search);
      if (mounted) setState(() => _agents = list);
    } catch (_) {
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _cycleStatus(Map<String, dynamic> agent) async {
    const order = ['Active', 'Suspended', 'Pending KYC', 'Blocked'];
    final current = '${agent['status']}';
    final nextStatus = order[(order.indexOf(current) + 1) % order.length];
    final id = (agent['id'] as num).toInt();

    setState(() {
      _agents = _agents.map((a) {
        final m = Map<String, dynamic>.from(a as Map);
        if (m['id'] == id) m['status'] = nextStatus;
        return m;
      }).toList();
    });

    try {
      await ApiService.updateAgent(id, {'status': nextStatus});
    } catch (_) {
      _fetchAgents();
    }
  }

  void _openAgentModal({Map<String, dynamic>? existing}) {
    final nameCtrl = TextEditingController(text: existing?['name']?.toString() ?? '');
    final companyCtrl = TextEditingController(text: existing?['company']?.toString() ?? '');
    final emailCtrl = TextEditingController(text: existing?['email']?.toString() ?? '');
    final phoneCtrl = TextEditingController(text: existing?['phone']?.toString() ?? '+92-21-');
    final cityCtrl = TextEditingController(text: existing?['city']?.toString() ?? 'Karachi');
    final limitCtrl = TextEditingController(text: '${existing?['creditLimit'] ?? existing?['credit_limit'] ?? 500000}');
    String status = existing?['status']?.toString() ?? 'Active';

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(22)),
      ),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (ctx, setModalState) {
            return Padding(
              padding: EdgeInsets.fromLTRB(20, 20, 20, MediaQuery.of(ctx).viewInsets.bottom + 20),
              child: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      existing != null ? 'Edit ${existing['name']}' : 'Add New Sub Agent',
                      style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w800, color: AeroColors.textPrimary),
                    ),
                    const Divider(height: 24),
                    Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: nameCtrl,
                            decoration: const InputDecoration(labelText: 'Agency Name', border: OutlineInputBorder()),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: TextField(
                            controller: companyCtrl,
                            decoration: const InputDecoration(labelText: 'Company Group', border: OutlineInputBorder()),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: emailCtrl,
                            decoration: const InputDecoration(labelText: 'Email', border: OutlineInputBorder()),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: TextField(
                            controller: phoneCtrl,
                            decoration: const InputDecoration(labelText: 'Phone', border: OutlineInputBorder()),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: cityCtrl,
                            decoration: const InputDecoration(labelText: 'City', border: OutlineInputBorder()),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: TextField(
                            controller: limitCtrl,
                            keyboardType: TextInputType.number,
                            decoration: const InputDecoration(labelText: 'Credit Limit (\$)', border: OutlineInputBorder()),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: DropdownButtonFormField<String>(
                            initialValue: status,
                            items: ['Active', 'Pending KYC', 'Suspended', 'Blocked']
                                .map((s) => DropdownMenuItem(value: s, child: Text(s, style: const TextStyle(fontSize: 12.5))))
                                .toList(),
                            onChanged: (v) => setModalState(() => status = v ?? 'Active'),
                            decoration: const InputDecoration(labelText: 'Status', border: OutlineInputBorder()),
                          ),
                        ),
                      ],
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
                          onPressed: () async {
                            final payload = {
                              'name': nameCtrl.text.trim(),
                              'company': companyCtrl.text.trim(),
                              'email': emailCtrl.text.trim(),
                              'phone': phoneCtrl.text.trim(),
                              'city': cityCtrl.text.trim(),
                              'credit_limit': double.tryParse(limitCtrl.text) ?? 500000,
                              'status': status,
                            };
                            Navigator.pop(ctx);
                            try {
                              if (existing != null) {
                                await ApiService.updateAgent((existing['id'] as num).toInt(), payload);
                              } else {
                                await ApiService.createAgent(payload);
                              }
                              _fetchAgents();
                            } catch (_) {}
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.transparent,
                            shadowColor: Colors.transparent,
                          ),
                          child: Text(
                            existing != null ? 'Save Changes' : 'Create Sub Agent',
                            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final totalAgents = 120 + _agents.length;

    return RefreshIndicator(
      onRefresh: _fetchAgents,
      color: AeroColors.primary,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  const Text(
                    'Sub Agents',
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: AeroColors.textPrimary),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF0FDF4),
                      borderRadius: BorderRadius.circular(99),
                      border: Border.all(color: const Color(0xFF86EFAC)),
                    ),
                    child: Text(
                      '$totalAgents Active',
                      style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Color(0xFF15803D)),
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
                  onPressed: () => _openAgentModal(),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.transparent,
                    shadowColor: Colors.transparent,
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  ),
                  icon: const Icon(Icons.add_rounded, size: 16, color: Colors.white),
                  label: const Text(
                    'Add Agent',
                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Colors.white),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Stats Strip
          GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            mainAxisSpacing: 10,
            crossAxisSpacing: 10,
            childAspectRatio: 2.3,
            children: [
              _MiniStatCard(label: 'Total Agents', value: '$totalAgents', color: AeroColors.primary, bg: AeroColors.primarySoft),
              const _MiniStatCard(label: 'Active Today', value: '84', color: Color(0xFF22C55E), bg: Color(0xFFF0FDF4)),
              const _MiniStatCard(label: 'Credit Extended', value: '\$8.4M', color: Color(0xFF06B6D4), bg: Color(0xFFECFEFF)),
              const _MiniStatCard(label: 'Pending KYC', value: '9', color: Color(0xFFF59E0B), bg: Color(0xFFFFFBEB)),
            ],
          ),
          const SizedBox(height: 12),

          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AeroColors.border),
            ),
            child: TextField(
              onChanged: (v) {
                setState(() => _search = v);
                _fetchAgents();
              },
              decoration: InputDecoration(
                hintText: 'Search agents by name, city, email…',
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
          const SizedBox(height: 14),

          ..._agents.map((raw) {
            final a = raw as Map<String, dynamic>;
            final limit = (a['creditLimit'] ?? a['credit_limit'] ?? 500000 as num).toDouble();
            final used = (a['creditUsed'] ?? a['credit_used'] ?? 0 as num).toDouble();
            final balance = (a['balance'] ?? (limit - used) as num).toDouble();
            final pct = limit > 0 ? (used / limit).clamp(0.0, 1.0) : 0.0;
            final barColor = pct > 0.85
                ? AeroColors.danger
                : pct > 0.6
                    ? AeroColors.warning
                    : AeroColors.success;

            return Container(
              margin: const EdgeInsets.only(bottom: 10),
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AeroColors.border),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 38,
                        height: 38,
                        decoration: BoxDecoration(
                          color: AeroColors.parseHex(a['color']?.toString()),
                          shape: BoxShape.circle,
                        ),
                        alignment: Alignment.center,
                        child: Text(
                          '${a['initials'] ?? 'AG'}',
                          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 12),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              '${a['name']}',
                              style: const TextStyle(fontSize: 14.5, fontWeight: FontWeight.w800, color: AeroColors.textPrimary),
                            ),
                            Text(
                              '${a['company']} · ${a['city']}',
                              style: const TextStyle(fontSize: 11.5, color: AeroColors.secondary, fontWeight: FontWeight.w600),
                            ),
                          ],
                        ),
                      ),
                      StatusBadge(status: '${a['status']}'),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Text(
                    '${a['email']} · ${a['phone']}',
                    style: const TextStyle(fontSize: 11.5, color: AeroColors.textSecondary),
                  ),
                  const SizedBox(height: 10),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Credit Used: \$${(used / 1000).toStringAsFixed(0)}k / \$${(limit / 1000).toStringAsFixed(0)}k',
                        style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w700, color: AeroColors.textPrimary),
                      ),
                      Text(
                        'Balance: \$${(balance / 1000).toStringAsFixed(0)}k',
                        style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w800, color: Color(0xFF16A34A)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(99),
                    child: LinearProgressIndicator(
                      value: pct,
                      minHeight: 5,
                      backgroundColor: AeroColors.border,
                      valueColor: AlwaysStoppedAnimation<Color>(barColor),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      TextButton.icon(
                        onPressed: () => _openAgentModal(existing: a),
                        icon: const Icon(Icons.edit_outlined, size: 15),
                        label: const Text('Edit', style: TextStyle(fontSize: 12)),
                      ),
                      TextButton.icon(
                        onPressed: () => _cycleStatus(a),
                        icon: const Icon(Icons.sync_rounded, size: 15),
                        label: const Text('Toggle Status', style: TextStyle(fontSize: 12)),
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

class _MiniStatCard extends StatelessWidget {
  final String label;
  final String value;
  final Color color;
  final Color bg;

  const _MiniStatCard({
    required this.label,
    required this.value,
    required this.color,
    required this.bg,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AeroColors.border),
      ),
      child: Row(
        children: [
          Container(
            width: 34,
            height: 34,
            decoration: BoxDecoration(
              color: bg,
              borderRadius: BorderRadius.circular(10),
            ),
            alignment: Alignment.center,
            child: Text(
              value[0],
              style: TextStyle(color: color, fontWeight: FontWeight.w900, fontSize: 15),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(value, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w900, color: AeroColors.textPrimary)),
                Text(
                  label,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(fontSize: 10.5, color: AeroColors.textMuted),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

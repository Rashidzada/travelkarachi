import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../theme/aerodesk_theme.dart';

class SegmentManagementScreen extends StatefulWidget {
  const SegmentManagementScreen({super.key});

  @override
  State<SegmentManagementScreen> createState() => _SegmentManagementScreenState();
}

class _SegmentManagementScreenState extends State<SegmentManagementScreen> {
  String _search = '';
  bool _loading = false;

  List<dynamic> _segments = [
    {'id': 'SEG-0091', 'origin': 'KHI', 'dest': 'DXB', 'airline': 'Emirates', 'aircraft': 'B777', 'dep': '06:30', 'arr': '08:45', 'dur': '2h 15m', 'seats': 248, 'price': 285, 'status': 'Active'},
    {'id': 'SEG-0090', 'origin': 'LHR', 'dest': 'JFK', 'airline': 'British Airways', 'aircraft': 'A380', 'dep': '09:00', 'arr': '12:00', 'dur': '7h 00m', 'seats': 524, 'price': 640, 'status': 'Active'},
    {'id': 'SEG-0089', 'origin': 'ISB', 'dest': 'RUH', 'airline': 'PIA', 'aircraft': 'B737', 'dep': '14:00', 'arr': '16:15', 'dur': '2h 15m', 'seats': 162, 'price': 220, 'status': 'Inactive'},
    {'id': 'SEG-0088', 'origin': 'DXB', 'dest': 'SIN', 'airline': 'Emirates', 'aircraft': 'A350', 'dep': '23:30', 'arr': '07:45', 'dur': '7h 15m', 'seats': 312, 'price': 490, 'status': 'Active'},
  ];

  @override
  void initState() {
    super.initState();
    _fetchSegments();
  }

  Future<void> _fetchSegments() async {
    setState(() => _loading = true);
    try {
      final list = await ApiService.getSegments(search: _search);
      if (mounted) setState(() => _segments = list);
    } catch (_) {
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _duplicate(String id) async {
    try {
      await ApiService.duplicateSegment(id);
      _fetchSegments();
    } catch (_) {}
  }

  Future<void> _delete(String id) async {
    setState(() {
      _segments = _segments.where((s) => (s as Map)['id'] != id).toList();
    });
    try {
      await ApiService.deleteSegment(id);
    } catch (_) {
      _fetchSegments();
    }
  }

  void _openSegmentModal({Map<String, dynamic>? existing}) {
    final originCtrl = TextEditingController(text: existing?['origin']?.toString() ?? 'KHI');
    final destCtrl = TextEditingController(text: existing?['dest']?.toString() ?? 'DXB');
    final airlineCtrl = TextEditingController(text: existing?['airline']?.toString() ?? 'Emirates');
    final aircraftCtrl = TextEditingController(text: existing?['aircraft']?.toString() ?? 'B777');
    final depCtrl = TextEditingController(text: existing?['dep']?.toString() ?? '08:00');
    final arrCtrl = TextEditingController(text: existing?['arr']?.toString() ?? '10:15');
    final durCtrl = TextEditingController(text: existing?['dur']?.toString() ?? '2h 15m');
    final seatsCtrl = TextEditingController(text: '${existing?['seats'] ?? 240}');
    final priceCtrl = TextEditingController(text: '${existing?['price'] ?? 295}');
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
              padding: EdgeInsets.fromLTRB(
                20,
                20,
                20,
                MediaQuery.of(ctx).viewInsets.bottom + 20,
              ),
              child: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      existing != null ? 'Edit Segment ${existing['id']}' : 'Add New Flight Segment',
                      style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w800, color: AeroColors.textPrimary),
                    ),
                    const Divider(height: 24),
                    Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: originCtrl,
                            decoration: const InputDecoration(labelText: 'Origin (IATA)', border: OutlineInputBorder()),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: TextField(
                            controller: destCtrl,
                            decoration: const InputDecoration(labelText: 'Dest (IATA)', border: OutlineInputBorder()),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: airlineCtrl,
                            decoration: const InputDecoration(labelText: 'Airline', border: OutlineInputBorder()),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: TextField(
                            controller: aircraftCtrl,
                            decoration: const InputDecoration(labelText: 'Aircraft', border: OutlineInputBorder()),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: depCtrl,
                            decoration: const InputDecoration(labelText: 'Departure', border: OutlineInputBorder()),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: TextField(
                            controller: arrCtrl,
                            decoration: const InputDecoration(labelText: 'Arrival', border: OutlineInputBorder()),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: TextField(
                            controller: durCtrl,
                            decoration: const InputDecoration(labelText: 'Duration', border: OutlineInputBorder()),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: seatsCtrl,
                            keyboardType: TextInputType.number,
                            decoration: const InputDecoration(labelText: 'Seats', border: OutlineInputBorder()),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: TextField(
                            controller: priceCtrl,
                            keyboardType: TextInputType.number,
                            decoration: const InputDecoration(labelText: 'Price (\$)', border: OutlineInputBorder()),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: DropdownButtonFormField<String>(
                            initialValue: status,
                            items: ['Active', 'Inactive', 'Cancelled']
                                .map((s) => DropdownMenuItem(value: s, child: Text(s, style: const TextStyle(fontSize: 13))))
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
                              'origin': originCtrl.text.trim().toUpperCase(),
                              'dest': destCtrl.text.trim().toUpperCase(),
                              'airline': airlineCtrl.text.trim(),
                              'aircraft': aircraftCtrl.text.trim(),
                              'dep': depCtrl.text.trim(),
                              'arr': arrCtrl.text.trim(),
                              'dur': durCtrl.text.trim(),
                              'seats': int.tryParse(seatsCtrl.text) ?? 200,
                              'price': double.tryParse(priceCtrl.text) ?? 250,
                              'status': status,
                            };
                            Navigator.pop(ctx);
                            try {
                              if (existing != null) {
                                await ApiService.updateSegment('${existing['id']}', payload);
                              } else {
                                await ApiService.createSegment(payload);
                              }
                              _fetchSegments();
                            } catch (_) {}
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.transparent,
                            shadowColor: Colors.transparent,
                          ),
                          child: Text(
                            existing != null ? 'Save Changes' : 'Create Segment',
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
    final filtered = _segments.where((raw) {
      final s = raw as Map<String, dynamic>;
      if (_search.isEmpty) return true;
      return '${s['id']} ${s['origin']} ${s['dest']} ${s['airline']}'
          .toLowerCase()
          .contains(_search.toLowerCase());
    }).toList();

    return RefreshIndicator(
      onRefresh: _fetchSegments,
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
                    'Segment Management',
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: AeroColors.textPrimary),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                      color: AeroColors.primarySoft,
                      borderRadius: BorderRadius.circular(99),
                    ),
                    child: Text(
                      '${_segments.length}',
                      style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AeroColors.primary),
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
                  onPressed: () => _openSegmentModal(),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.transparent,
                    shadowColor: Colors.transparent,
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  ),
                  icon: const Icon(Icons.add_rounded, size: 16, color: Colors.white),
                  label: const Text(
                    'Add Segment',
                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Colors.white),
                  ),
                ),
              ),
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
                _fetchSegments();
              },
              decoration: InputDecoration(
                hintText: 'Search segment ID, airport, airline…',
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

          ...filtered.map((raw) {
            final s = raw as Map<String, dynamic>;
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
                      Text(
                        '${s['id']}',
                        style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w800, color: AeroColors.primary),
                      ),
                      StatusBadge(status: '${s['status']}'),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            '${s['origin']} → ${s['dest']}',
                            style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w900, color: AeroColors.textPrimary),
                          ),
                          Text(
                            '${s['airline']} · ${s['aircraft']} · ${s['seats']} seats',
                            style: const TextStyle(fontSize: 12, color: AeroColors.textSecondary),
                          ),
                        ],
                      ),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text(
                            '${s['dep']} - ${s['arr']}',
                            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: AeroColors.textPrimary),
                          ),
                          Text(
                            '${s['dur']}',
                            style: const TextStyle(fontSize: 11, color: AeroColors.textMuted),
                          ),
                        ],
                      ),
                    ],
                  ),
                  const Divider(height: 18),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      IconButton(
                        onPressed: () => _openSegmentModal(existing: s),
                        icon: const Icon(Icons.edit_outlined, size: 18, color: AeroColors.primary),
                        tooltip: 'Edit',
                      ),
                      IconButton(
                        onPressed: () => _duplicate('${s['id']}'),
                        icon: const Icon(Icons.copy_rounded, size: 18, color: AeroColors.accent),
                        tooltip: 'Duplicate',
                      ),
                      IconButton(
                        onPressed: () => _delete('${s['id']}'),
                        icon: const Icon(Icons.delete_outline_rounded, size: 18, color: AeroColors.danger),
                        tooltip: 'Delete',
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

import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../theme/aerodesk_theme.dart';

class FlightPosScreen extends StatefulWidget {
  final void Function(SelectedFlightContext flight) onBookFlight;

  const FlightPosScreen({super.key, required this.onBookFlight});

  @override
  State<FlightPosScreen> createState() => _FlightPosScreenState();
}

class _FlightPosScreenState extends State<FlightPosScreen> {
  String _tripType = 'Round Trip';
  final _fromCtrl = TextEditingController(text: 'KHI');
  final _toCtrl = TextEditingController(text: 'DXB');
  final String _departDate = '2026-06-15';
  String _cabinClass = 'Economy';
  int _adults = 1;
  int _children = 0;
  int _infants = 0;
  final _promoCtrl = TextEditingController();
  double _promoDiscount = 0;
  String? _promoStatusText;
  bool _promoOk = false;

  bool _searching = false;
  List<dynamic>? _results;
  String? _selectedFlightId;

  static const Map<String, String> _airportNames = {
    'KHI': 'Jinnah Intl · Karachi',
    'DXB': 'Dubai International',
    'ISB': 'Islamabad Intl',
    'LHR': 'London Heathrow',
    'RUH': 'King Khalid Intl',
    'JFK': 'John F. Kennedy',
    'BOM': 'Chhatrapati Shivaji',
    'SIN': 'Singapore Changi',
    'DOH': 'Hamad International',
    'CDG': 'Charles de Gaulle',
  };

  int get _totalPax => _adults + _children + _infants;

  void _swapAirports() {
    final tmp = _fromCtrl.text;
    setState(() {
      _fromCtrl.text = _toCtrl.text;
      _toCtrl.text = tmp;
    });
  }

  Future<void> _applyPromo() async {
    final code = _promoCtrl.text.trim();
    if (code.isEmpty) return;
    try {
      final res = await ApiService.validatePromo(code);
      setState(() {
        _promoDiscount = (res['discount_amount'] as num?)?.toDouble() ?? 20;
        _promoStatusText = 'Promo ${res['code']} applied (-\$$_promoDiscount)';
        _promoOk = true;
      });
    } catch (_) {
      setState(() {
        _promoDiscount = 0;
        _promoStatusText = 'Invalid code (Try AERO20 or KARACHI50)';
        _promoOk = false;
      });
    }
  }

  Future<void> _searchFlights() async {
    setState(() {
      _searching = true;
      _selectedFlightId = null;
    });
    final from = _fromCtrl.text.trim().toUpperCase();
    final to = _toCtrl.text.trim().toUpperCase();
    try {
      final res = await ApiService.searchFlights(
        from: from.isEmpty ? 'KHI' : from,
        to: to.isEmpty ? 'DXB' : to,
        cabinClass: _cabinClass,
        promoCode: _promoCtrl.text.trim(),
      );
      if (mounted) {
        setState(() {
          _results = res['flights'] as List<dynamic>?;
          if (res['promo_applied'] != null && (res['promo_applied'] as num) > 0) {
            _promoDiscount = (res['promo_applied'] as num).toDouble();
          }
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _results = [
            {'id': '1', 'airline': 'Emirates', 'code': 'EK-623', 'logo': 'EK', 'color': '#C8102E', 'dep': from, 'arr': to, 'depTime': '06:15', 'arrTime': '08:30', 'duration': '2h 15m', 'stops': 0, 'price': 285, 'seats': 4, 'cls': _cabinClass, 'rating': 4.8, 'badge': 'Top Pick'},
            {'id': '2', 'airline': 'PIA', 'code': 'PK-212', 'logo': 'PK', 'color': '#006341', 'dep': from, 'arr': to, 'depTime': '11:00', 'arrTime': '14:45', 'duration': '3h 45m', 'stops': 1, 'stopCity': 'ISB', 'price': 165, 'seats': 21, 'cls': _cabinClass, 'rating': 3.6, 'badge': 'Cheapest'},
            {'id': '3', 'airline': 'Qatar Airways', 'code': 'QR-405', 'logo': 'QR', 'color': '#5C0632', 'dep': from, 'arr': to, 'depTime': '13:20', 'arrTime': '15:50', 'duration': '2h 30m', 'stops': 0, 'price': 340, 'seats': 2, 'cls': 'Business', 'rating': 4.9, 'badge': 'Premium'},
          ];
        });
      }
    } finally {
      if (mounted) setState(() => _searching = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final fromCode = _fromCtrl.text.trim().toUpperCase();
    final toCode = _toCtrl.text.trim().toUpperCase();

    return SingleChildScrollView(
      child: Column(
        children: [
          // Top Gradient Hero Banner
          Container(
            width: double.infinity,
            padding: const EdgeInsets.fromLTRB(16, 20, 16, 48),
            decoration: const BoxDecoration(
              gradient: AeroColors.primaryGradient,
            ),
            child: Column(
              children: [
                // Trip Type Tabs
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: ['Round Trip', 'One Way', 'Multi City'].map((t) {
                    final active = _tripType == t;
                    return Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 4),
                      child: GestureDetector(
                        onTap: () => setState(() => _tripType = t),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
                          decoration: BoxDecoration(
                            color: active ? Colors.white : Colors.white.withValues(alpha: 0.16),
                            borderRadius: BorderRadius.circular(99),
                          ),
                          child: Text(
                            t,
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
                              color: active ? AeroColors.primary : Colors.white,
                            ),
                          ),
                        ),
                      ),
                    );
                  }).toList(),
                ),
                const SizedBox(height: 10),
                Text(
                  'Search across 500+ airlines worldwide',
                  style: TextStyle(color: Colors.white.withValues(alpha: 0.78), fontSize: 12.5),
                ),
              ],
            ),
          ),

          // Overlapping Search Card
          Transform.translate(
            offset: const Offset(0, -28),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Column(
                children: [
                  Container(
                    padding: const EdgeInsets.all(18),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(18),
                      border: Border.all(color: AeroColors.border),
                      boxShadow: [
                        BoxShadow(
                          color: AeroColors.textPrimary.withValues(alpha: 0.08),
                          blurRadius: 32,
                          offset: const Offset(0, 12),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Route Row (From <-> To)
                        Row(
                          children: [
                            Expanded(
                              child: Container(
                                padding: const EdgeInsets.all(10),
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(10),
                                  border: Border.all(color: AeroColors.border),
                                ),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const Text(
                                      'FROM',
                                      style: TextStyle(fontSize: 10, color: AeroColors.textMuted, fontWeight: FontWeight.w700),
                                    ),
                                    TextField(
                                      controller: _fromCtrl,
                                      maxLength: 3,
                                      onChanged: (_) => setState(() {}),
                                      style: const TextStyle(
                                        fontSize: 28,
                                        fontWeight: FontWeight.w900,
                                        color: AeroColors.primary,
                                        height: 1.1,
                                      ),
                                      decoration: const InputDecoration(
                                        counterText: '',
                                        isDense: true,
                                        border: InputBorder.none,
                                        contentPadding: EdgeInsets.symmetric(vertical: 2),
                                      ),
                                    ),
                                    Text(
                                      _airportNames[fromCode] ?? 'Jinnah Intl Airport',
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: const TextStyle(fontSize: 10.5, color: AeroColors.textMuted),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                            Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 8),
                              child: InkWell(
                                onTap: _swapAirports,
                                borderRadius: BorderRadius.circular(99),
                                child: Container(
                                  width: 38,
                                  height: 38,
                                  decoration: const BoxDecoration(
                                    color: AeroColors.primarySoft,
                                    shape: BoxShape.circle,
                                  ),
                                  child: const Icon(Icons.swap_horiz_rounded, color: AeroColors.primary, size: 20),
                                ),
                              ),
                            ),
                            Expanded(
                              child: Container(
                                padding: const EdgeInsets.all(10),
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(10),
                                  border: Border.all(color: AeroColors.border),
                                ),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const Text(
                                      'TO',
                                      style: TextStyle(fontSize: 10, color: AeroColors.textMuted, fontWeight: FontWeight.w700),
                                    ),
                                    TextField(
                                      controller: _toCtrl,
                                      maxLength: 3,
                                      onChanged: (_) => setState(() {}),
                                      style: const TextStyle(
                                        fontSize: 28,
                                        fontWeight: FontWeight.w900,
                                        color: AeroColors.primary,
                                        height: 1.1,
                                      ),
                                      decoration: const InputDecoration(
                                        counterText: '',
                                        isDense: true,
                                        border: InputBorder.none,
                                        contentPadding: EdgeInsets.symmetric(vertical: 2),
                                      ),
                                    ),
                                    Text(
                                      _airportNames[toCode] ?? 'Dubai Intl Airport',
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: const TextStyle(fontSize: 10.5, color: AeroColors.textMuted),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),

                        // Cabin Class Row
                        const Text(
                          'CABIN CLASS',
                          style: TextStyle(fontSize: 10, color: AeroColors.textMuted, fontWeight: FontWeight.w800),
                        ),
                        const SizedBox(height: 6),
                        Row(
                          children: ['Economy', 'Business', 'First'].map((cls) {
                            final active = _cabinClass == cls;
                            return Expanded(
                              child: Padding(
                                padding: const EdgeInsets.symmetric(horizontal: 3),
                                child: GestureDetector(
                                  onTap: () => setState(() => _cabinClass = cls),
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(vertical: 9),
                                    alignment: Alignment.center,
                                    decoration: BoxDecoration(
                                      color: active ? AeroColors.primary : AeroColors.pageBg,
                                      borderRadius: BorderRadius.circular(8),
                                      border: Border.all(color: active ? AeroColors.primary : AeroColors.border),
                                    ),
                                    child: Text(
                                      cls,
                                      style: TextStyle(
                                        fontSize: 12,
                                        fontWeight: FontWeight.w700,
                                        color: active ? Colors.white : AeroColors.textSecondary,
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                            );
                          }).toList(),
                        ),
                        const SizedBox(height: 12),

                        // Passenger Counters
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: AeroColors.border),
                          ),
                          child: Column(
                            children: [
                              _PaxCounter(
                                label: 'Adults',
                                sub: 'Age 12+',
                                value: _adults,
                                onDec: _adults > 1 ? () => setState(() => _adults--) : null,
                                onInc: () => setState(() => _adults++),
                              ),
                              const SizedBox(height: 8),
                              _PaxCounter(
                                label: 'Children',
                                sub: 'Age 2–11',
                                value: _children,
                                onDec: _children > 0 ? () => setState(() => _children--) : null,
                                onInc: () => setState(() => _children++),
                              ),
                              const SizedBox(height: 8),
                              _PaxCounter(
                                label: 'Infants',
                                sub: 'Under 2',
                                value: _infants,
                                onDec: _infants > 0 ? () => setState(() => _infants--) : null,
                                onInc: () => setState(() => _infants++),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 12),

                        // Promo Code Input
                        Row(
                          children: [
                            Expanded(
                              child: SizedBox(
                                height: 40,
                                child: TextField(
                                  controller: _promoCtrl,
                                  style: const TextStyle(fontSize: 12.5),
                                  decoration: InputDecoration(
                                    hintText: 'Promo code (e.g. AERO20)',
                                    contentPadding: const EdgeInsets.symmetric(horizontal: 12),
                                    border: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(8),
                                      borderSide: const BorderSide(color: AeroColors.border),
                                    ),
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(width: 8),
                            SizedBox(
                              height: 40,
                              child: TextButton(
                                onPressed: _applyPromo,
                                style: TextButton.styleFrom(
                                  backgroundColor: AeroColors.primarySoft,
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                ),
                                child: const Text(
                                  'Apply',
                                  style: TextStyle(color: AeroColors.primary, fontWeight: FontWeight.w700, fontSize: 12.5),
                                ),
                              ),
                            ),
                          ],
                        ),
                        if (_promoStatusText != null) ...[
                          const SizedBox(height: 4),
                          Text(
                            _promoStatusText!,
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                              color: _promoOk ? const Color(0xFF16A34A) : AeroColors.danger,
                            ),
                          ),
                        ],
                        const SizedBox(height: 14),

                        // Search Button
                        SizedBox(
                          width: double.infinity,
                          height: 48,
                          child: DecoratedBox(
                            decoration: BoxDecoration(
                              gradient: AeroColors.primaryGradient,
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: ElevatedButton.icon(
                              onPressed: _searching ? null : _searchFlights,
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.transparent,
                                shadowColor: Colors.transparent,
                              ),
                              icon: _searching
                                  ? const SizedBox(
                                      width: 18,
                                      height: 18,
                                      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                                    )
                                  : const Icon(Icons.search_rounded, color: Colors.white, size: 18),
                              label: Text(
                                _searching ? 'Searching 500+ airlines…' : 'Search Flights',
                                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 14),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                  // Results List
                  if (_results != null) ...[
                    const SizedBox(height: 16),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          '${_results!.length} flights found ($fromCode → $toCode)',
                          style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: AeroColors.textPrimary),
                        ),
                        Text(
                          '$_totalPax Pax · $_cabinClass',
                          style: const TextStyle(fontSize: 12, color: AeroColors.textMuted, fontWeight: FontWeight.w600),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    ..._results!.map((raw) {
                      final f = raw as Map<String, dynamic>;
                      final id = '${f['id']}';
                      final isSelected = _selectedFlightId == id;
                      final price = (f['price'] as num?)?.toDouble() ?? 250;
                      final stops = (f['stops'] as num?)?.toInt() ?? 0;

                      return GestureDetector(
                        onTap: () => setState(() => _selectedFlightId = isSelected ? null : id),
                        child: Container(
                          margin: const EdgeInsets.only(bottom: 10),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(
                              color: isSelected ? AeroColors.primary : AeroColors.border,
                              width: isSelected ? 1.5 : 1,
                            ),
                          ),
                          child: Column(
                            children: [
                              Padding(
                                padding: const EdgeInsets.all(14),
                                child: Column(
                                  children: [
                                    Row(
                                      children: [
                                        Container(
                                          width: 38,
                                          height: 38,
                                          decoration: BoxDecoration(
                                            color: AeroColors.parseHex(f['color']?.toString()),
                                            borderRadius: BorderRadius.circular(10),
                                          ),
                                          alignment: Alignment.center,
                                          child: Text(
                                            '${f['logo'] ?? 'FL'}',
                                            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 12),
                                          ),
                                        ),
                                        const SizedBox(width: 10),
                                        Expanded(
                                          child: Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              Text(
                                                '${f['airline']}',
                                                style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.w800, color: AeroColors.textPrimary),
                                              ),
                                              Text(
                                                '${f['code']} · ${f['duration']}',
                                                style: const TextStyle(fontSize: 11, color: AeroColors.textMuted),
                                              ),
                                            ],
                                          ),
                                        ),
                                        Column(
                                          crossAxisAlignment: CrossAxisAlignment.end,
                                          children: [
                                            Text(
                                              '\$${price.toInt()}',
                                              style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: AeroColors.textPrimary),
                                            ),
                                            Text(
                                              stops == 0 ? 'Non-stop' : '1 stop',
                                              style: TextStyle(
                                                fontSize: 10.5,
                                                fontWeight: FontWeight.w700,
                                                color: stops == 0 ? const Color(0xFF16A34A) : AeroColors.warning,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 12),
                                    Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Text(
                                              '${f['depTime']}',
                                              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: AeroColors.textPrimary),
                                            ),
                                            Text('${f['dep']}', style: const TextStyle(fontSize: 11, color: AeroColors.textMuted, fontWeight: FontWeight.w700)),
                                          ],
                                        ),
                                        const Expanded(
                                          child: Padding(
                                            padding: EdgeInsets.symmetric(horizontal: 14),
                                            child: Row(
                                              children: [
                                                Expanded(child: Divider()),
                                                Padding(
                                                  padding: EdgeInsets.symmetric(horizontal: 6),
                                                  child: Icon(Icons.flight_takeoff_rounded, size: 15, color: AeroColors.primary),
                                                ),
                                                Expanded(child: Divider()),
                                              ],
                                            ),
                                          ),
                                        ),
                                        Column(
                                          crossAxisAlignment: CrossAxisAlignment.end,
                                          children: [
                                            Text(
                                              '${f['arrTime']}',
                                              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: AeroColors.textPrimary),
                                            ),
                                            Text('${f['arr']}', style: const TextStyle(fontSize: 11, color: AeroColors.textMuted, fontWeight: FontWeight.w700)),
                                          ],
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                              if (isSelected)
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                                  decoration: const BoxDecoration(
                                    color: AeroColors.pageBg,
                                    borderRadius: BorderRadius.vertical(bottom: Radius.circular(14)),
                                  ),
                                  child: Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            'Total ($_totalPax Pax)',
                                            style: const TextStyle(fontSize: 10.5, color: AeroColors.textMuted),
                                          ),
                                          Text(
                                            '\$${(price * _totalPax).toInt()}',
                                            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: AeroColors.primary),
                                          ),
                                        ],
                                      ),
                                      DecoratedBox(
                                        decoration: BoxDecoration(
                                          gradient: AeroColors.primaryGradient,
                                          borderRadius: BorderRadius.circular(8),
                                        ),
                                        child: ElevatedButton.icon(
                                          onPressed: () {
                                            widget.onBookFlight(
                                              SelectedFlightContext(
                                                airline: '${f['airline']}',
                                                code: '${f['code']}',
                                                dep: '${f['dep']}',
                                                arr: '${f['arr']}',
                                                depTime: '${f['depTime']}',
                                                arrTime: '${f['arrTime']}',
                                                duration: '${f['duration']}',
                                                stops: stops,
                                                price: price,
                                                cls: '${f['cls'] ?? _cabinClass}',
                                                pax: _totalPax,
                                                date: _departDate,
                                                promoDiscount: _promoDiscount,
                                              ),
                                            );
                                          },
                                          style: ElevatedButton.styleFrom(
                                            backgroundColor: Colors.transparent,
                                            shadowColor: Colors.transparent,
                                          ),
                                          icon: const Text(
                                            'Book Now',
                                            style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 12.5),
                                          ),
                                          label: const Icon(Icons.chevron_right_rounded, color: Colors.white, size: 16),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                            ],
                          ),
                        ),
                      );
                    }),
                  ],
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _PaxCounter extends StatelessWidget {
  final String label;
  final String sub;
  final int value;
  final VoidCallback? onDec;
  final VoidCallback onInc;

  const _PaxCounter({
    required this.label,
    required this.sub,
    required this.value,
    required this.onDec,
    required this.onInc,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700, color: AeroColors.textPrimary)),
            Text(sub, style: const TextStyle(fontSize: 10, color: AeroColors.textMuted)),
          ],
        ),
        Row(
          children: [
            InkWell(
              onTap: onDec,
              child: Container(
                width: 28,
                height: 28,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(color: AeroColors.border),
                  color: AeroColors.pageBg,
                ),
                child: Icon(Icons.remove, size: 14, color: onDec == null ? AeroColors.textMuted : AeroColors.textPrimary),
              ),
            ),
            SizedBox(
              width: 28,
              child: Text(
                '$value',
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.w800, color: AeroColors.textPrimary),
              ),
            ),
            InkWell(
              onTap: onInc,
              child: Container(
                width: 28,
                height: 28,
                decoration: const BoxDecoration(
                  shape: BoxShape.circle,
                  color: AeroColors.primarySoft,
                ),
                child: const Icon(Icons.add, size: 14, color: AeroColors.primary),
              ),
            ),
          ],
        ),
      ],
    );
  }
}

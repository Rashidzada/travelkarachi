import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../theme/aerodesk_theme.dart';

class PassengerBookingScreen extends StatefulWidget {
  final SelectedFlightContext? selectedFlight;
  final VoidCallback onBookingComplete;

  const PassengerBookingScreen({
    super.key,
    this.selectedFlight,
    required this.onBookingComplete,
  });

  @override
  State<PassengerBookingScreen> createState() => _PassengerBookingScreenState();
}

class _PassengerBookingScreenState extends State<PassengerBookingScreen> {
  String _title = 'Mr';
  final _firstNameCtrl = TextEditingController();
  final _lastNameCtrl = TextEditingController();
  final _passportCtrl = TextEditingController();
  String _nationality = 'Pakistan';
  String _gender = 'Male';
  bool _submitting = false;
  String? _error;
  Map<String, dynamic>? _createdBooking;

  SelectedFlightContext get _flight =>
      widget.selectedFlight ??
      SelectedFlightContext(
        airline: 'Emirates',
        code: 'EK-601',
        dep: 'KHI',
        arr: 'DXB',
        depTime: '06:30 AM',
        arrTime: '08:45 AM',
        duration: '2h 15m',
        stops: 0,
        price: 280,
        cls: 'Economy',
        pax: 1,
        date: 'Jun 15, 2026',
        promoDiscount: 10,
      );

  Future<void> _submitBooking(String statusChoice) async {
    setState(() => _error = null);
    final fn = _firstNameCtrl.text.trim();
    final ln = _lastNameCtrl.text.trim();
    if (fn.isEmpty || ln.isEmpty) {
      setState(() => _error = 'Please enter Passenger First Name and Last Name.');
      return;
    }

    final f = _flight;
    final baseFare = f.price * f.pax;
    final taxes = (baseFare * 0.2).roundToDouble();
    const surcharge = 24.0;
    const discount = 12.0;
    final promo = f.promoDiscount;
    final total = (baseFare + taxes + surcharge - discount - promo).clamp(50.0, 999999.0);

    setState(() => _submitting = true);
    try {
      final created = await ApiService.createBooking({
        'title': _title,
        'first_name': fn,
        'last_name': ln,
        'passenger': '$fn $ln',
        'nationality': _nationality,
        'passport_number': _passportCtrl.text.trim().isEmpty ? 'PK9283712' : _passportCtrl.text.trim(),
        'gender': _gender,
        'origin': f.dep,
        'destination': f.arr,
        'route': '${f.dep} → ${f.arr}',
        'airline': f.airline,
        'flight_code': f.code,
        'date': f.date,
        'cls': f.cls,
        'pax_count': f.pax,
        'base_fare': baseFare,
        'taxes': taxes,
        'surcharge': surcharge,
        'discount': discount,
        'promo_discount': promo,
        'amount_value': total,
        'status': statusChoice,
      });
      if (mounted) {
        setState(() => _createdBooking = created);
      }
    } catch (e) {
      if (mounted) {
        setState(() => _error = e.toString().replaceFirst('Exception: ', ''));
      }
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final f = _flight;
    final baseFare = f.price * f.pax;
    final taxes = (baseFare * 0.2).roundToDouble();
    const surcharge = 24.0;
    const discount = 12.0;
    final promo = f.promoDiscount;
    final total = (baseFare + taxes + surcharge - discount - promo).clamp(50.0, 999999.0);

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (_createdBooking != null) ...[
            Container(
              padding: const EdgeInsets.all(16),
              margin: const EdgeInsets.only(bottom: 16),
              decoration: BoxDecoration(
                color: const Color(0xFFF0FDF4),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: const Color(0xFF86EFAC)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.check_circle_rounded, color: Color(0xFF15803D), size: 22),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          'Booking Confirmed! Ref: ${_createdBooking!['ref']}',
                          style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: Color(0xFF15803D)),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'Passenger: ${_createdBooking!['passenger']} · ${_createdBooking!['route']} · Total: ${_createdBooking!['amount']}',
                    style: const TextStyle(fontSize: 12, color: Color(0xFF166534)),
                  ),
                  const SizedBox(height: 10),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: widget.onBookingComplete,
                      style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF15803D)),
                      child: const Text('View in Flight Bookings →', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
                    ),
                  ),
                ],
              ),
            ),
          ],

          // Selected Flight & Fare Summary Card
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AeroColors.border),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Fare Summary',
                      style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: AeroColors.textPrimary),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                      decoration: BoxDecoration(
                        color: const Color(0xFFECFEFF),
                        borderRadius: BorderRadius.circular(99),
                        border: Border.all(color: const Color(0xFFA5F3FC)),
                      ),
                      child: Text(
                        '${f.dep} → ${f.arr}',
                        style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AeroColors.accent),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AeroColors.primarySoft,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('${f.airline} (${f.code})', style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700, color: AeroColors.primary)),
                      Text('${f.cls} · ${f.pax} Pax', style: const TextStyle(fontSize: 12, color: AeroColors.textSecondary)),
                    ],
                  ),
                ),
                const SizedBox(height: 10),
                _FareRow(label: 'Base Fare (${f.pax} Pax)', value: '\$${baseFare.toStringAsFixed(2)}'),
                _FareRow(label: 'Taxes & Fees', value: '\$${taxes.toStringAsFixed(2)}'),
                _FareRow(label: 'Surcharge', value: '\$${surcharge.toStringAsFixed(2)}'),
                _FareRow(label: 'Discount + Promo', value: '-\$${(discount + promo).toStringAsFixed(2)}', isGreen: true),
                const Divider(height: 18),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Total', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: AeroColors.textPrimary)),
                    Text('\$${total.toStringAsFixed(2)}', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: AeroColors.primary)),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Passenger Form Card
          Container(
            padding: const EdgeInsets.all(16),
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
                      width: 26,
                      height: 26,
                      decoration: const BoxDecoration(color: AeroColors.primary, shape: BoxShape.circle),
                      alignment: Alignment.center,
                      child: const Text('1', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w800)),
                    ),
                    const SizedBox(width: 8),
                    const Text(
                      'Passenger 1 — Adult',
                      style: TextStyle(fontSize: 14.5, fontWeight: FontWeight.w800, color: AeroColors.textPrimary),
                    ),
                  ],
                ),
                const Divider(height: 24),

                if (_error != null) ...[
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(10),
                    margin: const EdgeInsets.only(bottom: 12),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFEF2F2),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: const Color(0xFFFCA5A5)),
                    ),
                    child: Text(_error!, style: const TextStyle(color: Color(0xFFB91C1C), fontSize: 12)),
                  ),
                ],

                const Text('TITLE', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AeroColors.textSecondary)),
                const SizedBox(height: 6),
                Row(
                  children: ['Mr', 'Mrs', 'Miss', 'Dr'].map((t) {
                    final active = _title == t;
                    return Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: GestureDetector(
                        onTap: () => setState(() => _title = t),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                          decoration: BoxDecoration(
                            color: active ? AeroColors.primarySoft : Colors.white,
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: active ? AeroColors.primary : AeroColors.border),
                          ),
                          child: Text(
                            t,
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w700,
                              color: active ? AeroColors.primary : AeroColors.textSecondary,
                            ),
                          ),
                        ),
                      ),
                    );
                  }).toList(),
                ),
                const SizedBox(height: 14),

                const Text('FIRST NAME', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AeroColors.textSecondary)),
                const SizedBox(height: 6),
                TextField(
                  controller: _firstNameCtrl,
                  decoration: InputDecoration(
                    hintText: 'e.g. Sara',
                    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                ),
                const SizedBox(height: 14),

                const Text('LAST NAME', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AeroColors.textSecondary)),
                const SizedBox(height: 6),
                TextField(
                  controller: _lastNameCtrl,
                  decoration: InputDecoration(
                    hintText: 'e.g. Malik',
                    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                ),
                const SizedBox(height: 14),

                Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('NATIONALITY', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AeroColors.textSecondary)),
                          const SizedBox(height: 6),
                          DropdownButtonFormField<String>(
                            initialValue: _nationality,
                            items: ['Pakistan', 'UAE', 'United Kingdom', 'Saudi Arabia', 'USA', 'Germany']
                                .map((c) => DropdownMenuItem(value: c, child: Text(c, style: const TextStyle(fontSize: 13))))
                                .toList(),
                            onChanged: (v) => setState(() => _nationality = v ?? 'Pakistan'),
                            decoration: InputDecoration(
                              contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                              border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('PASSPORT NO.', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AeroColors.textSecondary)),
                          const SizedBox(height: 6),
                          TextField(
                            controller: _passportCtrl,
                            decoration: InputDecoration(
                              hintText: 'AA1234567',
                              contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                              border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 14),

                const Text('GENDER', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AeroColors.textSecondary)),
                const SizedBox(height: 6),
                Row(
                  children: ['Male', 'Female'].map((g) {
                    final active = _gender == g;
                    return Expanded(
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 4),
                        child: GestureDetector(
                          onTap: () => setState(() => _gender = g),
                          child: Container(
                            padding: const EdgeInsets.symmetric(vertical: 12),
                            alignment: Alignment.center,
                            decoration: BoxDecoration(
                              color: active ? AeroColors.primarySoft : Colors.white,
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(color: active ? AeroColors.primary : AeroColors.border),
                            ),
                            child: Text(
                              '${g == 'Male' ? '♂ ' : '♀ '}$g',
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w700,
                                color: active ? AeroColors.primary : AeroColors.textSecondary,
                              ),
                            ),
                          ),
                        ),
                      ),
                    );
                  }).toList(),
                ),
                const SizedBox(height: 20),

                SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: DecoratedBox(
                    decoration: BoxDecoration(
                      gradient: AeroColors.primaryGradient,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: ElevatedButton(
                      onPressed: _submitting ? null : () => _submitBooking('Approved'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.transparent,
                        shadowColor: Colors.transparent,
                      ),
                      child: Text(
                        _submitting ? 'Creating Booking in DB…' : 'Confirm & Issue Booking →',
                        style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w800),
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 8),
                SizedBox(
                  width: double.infinity,
                  height: 42,
                  child: OutlinedButton(
                    onPressed: _submitting ? null : () => _submitBooking('Pending'),
                    child: const Text('Save as Pending Approval', style: TextStyle(fontSize: 12.5)),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _FareRow extends StatelessWidget {
  final String label;
  final String value;
  final bool isGreen;

  const _FareRow({required this.label, required this.value, this.isGreen = false});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontSize: 12.5, color: AeroColors.textSecondary)),
          Text(
            value,
            style: TextStyle(
              fontSize: 12.5,
              fontWeight: FontWeight.w700,
              color: isGreen ? const Color(0xFF16A34A) : AeroColors.textPrimary,
            ),
          ),
        ],
      ),
    );
  }
}

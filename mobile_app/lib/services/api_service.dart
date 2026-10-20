import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class SelectedFlightContext {
  final String airline;
  final String code;
  final String dep;
  final String arr;
  final String depTime;
  final String arrTime;
  final String duration;
  final int stops;
  final double price;
  final String cls;
  final int pax;
  final String date;
  final double promoDiscount;

  SelectedFlightContext({
    required this.airline,
    required this.code,
    required this.dep,
    required this.arr,
    required this.depTime,
    required this.arrTime,
    required this.duration,
    required this.stops,
    required this.price,
    required this.cls,
    required this.pax,
    required this.date,
    this.promoDiscount = 0,
  });
}

class ApiService {
  static const String baseUrl = 'https://travelkarachi.pythonanywhere.com/api';
  static String? _token;
  static Map<String, dynamic>? _currentUser;

  static Map<String, dynamic>? get currentUser => _currentUser;

  static Future<void> initSession() async {
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString('aerodesk_token');
    final userRaw = prefs.getString('aerodesk_user');
    if (userRaw != null) {
      try {
        _currentUser = jsonDecode(userRaw) as Map<String, dynamic>;
      } catch (_) {}
    }
  }

  static bool get isLoggedIn => _token != null && _token!.isNotEmpty;

  static Map<String, String> _headers() {
    final headers = <String, String>{
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (_token != null && _token!.isNotEmpty) {
      headers['Authorization'] = 'Token $_token';
    }
    return headers;
  }

  static Future<Map<String, dynamic>> login(String email, String password) async {
    final res = await http.post(
      Uri.parse('$baseUrl/auth/login/'),
      headers: _headers(),
      body: jsonEncode({'email': email, 'password': password}),
    );
    if (res.statusCode >= 200 && res.statusCode < 300) {
      final data = jsonDecode(res.body) as Map<String, dynamic>;
      _token = data['token']?.toString();
      _currentUser = data['user'] as Map<String, dynamic>?;
      final prefs = await SharedPreferences.getInstance();
      if (_token != null) await prefs.setString('aerodesk_token', _token!);
      if (_currentUser != null) {
        await prefs.setString('aerodesk_user', jsonEncode(_currentUser));
      }
      return data;
    }
    throw Exception('Invalid credentials (${res.statusCode})');
  }

  static Future<void> logout() async {
    try {
      await http.post(Uri.parse('$baseUrl/auth/logout/'), headers: _headers());
    } catch (_) {}
    _token = null;
    _currentUser = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('aerodesk_token');
    await prefs.remove('aerodesk_user');
  }

  static Future<Map<String, dynamic>> getDashboard({String period = '1Y'}) async {
    final res = await http.get(
      Uri.parse('$baseUrl/dashboard/?period=${Uri.encodeComponent(period)}'),
      headers: _headers(),
    );
    if (res.statusCode == 200) {
      return jsonDecode(res.body) as Map<String, dynamic>;
    }
    throw Exception('Failed to load dashboard');
  }

  static Future<List<dynamic>> getBookings({
    String status = 'All',
    String airline = 'All Airlines',
    String search = '',
  }) async {
    final params = <String, String>{};
    if (status != 'All') params['status'] = status;
    if (airline != 'All Airlines') params['airline'] = airline;
    if (search.isNotEmpty) params['search'] = search;

    final uri = Uri.parse('$baseUrl/bookings/').replace(
      queryParameters: params.isEmpty ? null : params,
    );
    final res = await http.get(uri, headers: _headers());
    if (res.statusCode == 200) {
      return jsonDecode(res.body) as List<dynamic>;
    }
    throw Exception('Failed to load bookings');
  }

  static Future<Map<String, dynamic>> createBooking(Map<String, dynamic> payload) async {
    final res = await http.post(
      Uri.parse('$baseUrl/bookings/'),
      headers: _headers(),
      body: jsonEncode(payload),
    );
    if (res.statusCode >= 200 && res.statusCode < 300) {
      return jsonDecode(res.body) as Map<String, dynamic>;
    }
    throw Exception('Failed to create booking: ${res.body}');
  }

  static Future<Map<String, dynamic>> updateBookingStatus(String ref, String status) async {
    final res = await http.post(
      Uri.parse('$baseUrl/bookings/${Uri.encodeComponent(ref)}/update_status/'),
      headers: _headers(),
      body: jsonEncode({'status': status}),
    );
    if (res.statusCode == 200) {
      return jsonDecode(res.body) as Map<String, dynamic>;
    }
    throw Exception('Failed to update status');
  }

  static Future<Map<String, dynamic>> searchFlights({
    required String from,
    required String to,
    required String cabinClass,
    String promoCode = '',
  }) async {
    final params = <String, String>{
      'from': from,
      'to': to,
      'cabin_class': cabinClass,
      if (promoCode.isNotEmpty) 'promo_code': promoCode,
    };
    final uri = Uri.parse('$baseUrl/pos/search/').replace(queryParameters: params);
    final res = await http.get(uri, headers: _headers());
    if (res.statusCode == 200) {
      return jsonDecode(res.body) as Map<String, dynamic>;
    }
    throw Exception('Flight search failed');
  }

  static Future<Map<String, dynamic>> validatePromo(String code) async {
    final res = await http.post(
      Uri.parse('$baseUrl/pos/promo/'),
      headers: _headers(),
      body: jsonEncode({'code': code}),
    );
    if (res.statusCode == 200) {
      return jsonDecode(res.body) as Map<String, dynamic>;
    }
    throw Exception('Invalid or expired promo code');
  }

  static Future<List<dynamic>> getSegments({
    String search = '',
    String status = 'All Statuses',
  }) async {
    final params = <String, String>{};
    if (search.isNotEmpty) params['search'] = search;
    if (status != 'All Statuses') params['status'] = status;
    final uri = Uri.parse('$baseUrl/segments/').replace(
      queryParameters: params.isEmpty ? null : params,
    );
    final res = await http.get(uri, headers: _headers());
    if (res.statusCode == 200) {
      return jsonDecode(res.body) as List<dynamic>;
    }
    throw Exception('Failed to load segments');
  }

  static Future<Map<String, dynamic>> createSegment(Map<String, dynamic> payload) async {
    final res = await http.post(
      Uri.parse('$baseUrl/segments/'),
      headers: _headers(),
      body: jsonEncode(payload),
    );
    if (res.statusCode >= 200 && res.statusCode < 300) {
      return jsonDecode(res.body) as Map<String, dynamic>;
    }
    throw Exception('Failed to create segment');
  }

  static Future<Map<String, dynamic>> updateSegment(String id, Map<String, dynamic> payload) async {
    final res = await http.patch(
      Uri.parse('$baseUrl/segments/${Uri.encodeComponent(id)}/'),
      headers: _headers(),
      body: jsonEncode(payload),
    );
    if (res.statusCode >= 200 && res.statusCode < 300) {
      return jsonDecode(res.body) as Map<String, dynamic>;
    }
    throw Exception('Failed to update segment');
  }

  static Future<Map<String, dynamic>> duplicateSegment(String id) async {
    final res = await http.post(
      Uri.parse('$baseUrl/segments/${Uri.encodeComponent(id)}/duplicate/'),
      headers: _headers(),
    );
    if (res.statusCode >= 200 && res.statusCode < 300) {
      return jsonDecode(res.body) as Map<String, dynamic>;
    }
    throw Exception('Failed to duplicate segment');
  }

  static Future<void> deleteSegment(String id) async {
    await http.delete(
      Uri.parse('$baseUrl/segments/${Uri.encodeComponent(id)}/'),
      headers: _headers(),
    );
  }

  static Future<List<dynamic>> getAgents({String search = ''}) async {
    final uri = Uri.parse('$baseUrl/agents/').replace(
      queryParameters: search.isNotEmpty ? {'search': search} : null,
    );
    final res = await http.get(uri, headers: _headers());
    if (res.statusCode == 200) {
      return jsonDecode(res.body) as List<dynamic>;
    }
    throw Exception('Failed to load sub-agents');
  }

  static Future<Map<String, dynamic>> createAgent(Map<String, dynamic> payload) async {
    final res = await http.post(
      Uri.parse('$baseUrl/agents/'),
      headers: _headers(),
      body: jsonEncode(payload),
    );
    if (res.statusCode >= 200 && res.statusCode < 300) {
      return jsonDecode(res.body) as Map<String, dynamic>;
    }
    throw Exception('Failed to create agent');
  }

  static Future<Map<String, dynamic>> updateAgent(int id, Map<String, dynamic> payload) async {
    final res = await http.patch(
      Uri.parse('$baseUrl/agents/$id/'),
      headers: _headers(),
      body: jsonEncode(payload),
    );
    if (res.statusCode >= 200 && res.statusCode < 300) {
      return jsonDecode(res.body) as Map<String, dynamic>;
    }
    throw Exception('Failed to update agent');
  }

  static Future<Map<String, dynamic>> getReports() async {
    final res = await http.get(Uri.parse('$baseUrl/reports/'), headers: _headers());
    if (res.statusCode == 200) {
      return jsonDecode(res.body) as Map<String, dynamic>;
    }
    throw Exception('Failed to load reports');
  }

  static Future<Map<String, dynamic>> getSettings() async {
    final res = await http.get(Uri.parse('$baseUrl/settings/'), headers: _headers());
    if (res.statusCode == 200) {
      return jsonDecode(res.body) as Map<String, dynamic>;
    }
    throw Exception('Failed to load settings');
  }

  static Future<Map<String, dynamic>> updateSettings(Map<String, dynamic> payload) async {
    final res = await http.patch(
      Uri.parse('$baseUrl/settings/'),
      headers: _headers(),
      body: jsonEncode(payload),
    );
    if (res.statusCode == 200) {
      return jsonDecode(res.body) as Map<String, dynamic>;
    }
    throw Exception('Failed to save settings');
  }
}

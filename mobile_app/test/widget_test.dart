import 'package:flutter_test/flutter_test.dart';
import 'package:aerodesk_mobile/main.dart';

void main() {
  testWidgets('AeroDesk app initializes test', (WidgetTester tester) async {
    await tester.pumpWidget(const AeroDeskApp());
    expect(find.text('AeroDesk'), findsWidgets);
  });
}

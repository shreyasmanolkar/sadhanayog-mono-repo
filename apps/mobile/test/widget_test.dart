import 'package:flutter_test/flutter_test.dart';
import 'package:sadhanayog/app/app.dart';

void main() {
  testWidgets('foundation shell explains emptiness', (WidgetTester tester) async {
    await tester.pumpWidget(const SadhanaYogApp());
    expect(find.text('The desk is empty on purpose.'), findsOneWidget);
    expect(find.textContaining('vertical slices'), findsOneWidget);
  });
}

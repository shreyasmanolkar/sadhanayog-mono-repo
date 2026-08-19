import 'package:flutter_test/flutter_test.dart';
import 'package:sadhanayog/app/app.dart';
import 'package:sadhanayog/app/config.dart';

void main() {
  testWidgets('foundation shell explains emptiness', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(const SadhanaYogApp());
    expect(find.text('The desk is empty on purpose.'), findsOneWidget);
    expect(find.textContaining('vertical slices'), findsOneWidget);
    expect(find.text('Environment: dev'), findsOneWidget);
  });

  testWidgets('config shell can inject a non-dev environment', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      const SadhanaYogApp(
        config: AppConfig(
          environment: 'prod',
          apiOrigin: 'https://api.example.invalid',
        ),
      ),
    );
    expect(find.text('Environment: prod'), findsOneWidget);
  });
}

import 'package:flutter_test/flutter_test.dart';
import 'package:sadhanayog/app/config.dart';

void main() {
  test('dev is the local default and is not production', () {
    const AppConfig config = AppConfig(
      environment: 'dev',
      apiOrigin: 'http://127.0.0.1:8787',
    );
    expect(config.isProd, isFalse);
    expect(Uri.parse(config.apiOrigin).hasScheme, isTrue);
  });

  test('prod is a distinct flavor name', () {
    const AppConfig config = AppConfig(
      environment: 'prod',
      apiOrigin: 'https://api.example.invalid',
    );
    expect(config.isProd, isTrue);
  });
}

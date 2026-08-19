import 'package:flutter_test/flutter_test.dart';
import 'package:sadhanayog/core/failure.dart';
import 'package:sadhanayog/core/result.dart';

void main() {
  test('Result distinguishes success from failure', () {
    expect(const Result<int>.ok(1), isA<Ok<int>>());
    expect(const Result<int>.error(UnexpectedFailure('nope')), isA<Err<int>>());
  });
}

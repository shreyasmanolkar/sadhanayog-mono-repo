import 'failure.dart';

sealed class Result<T> {
  const Result();
  const factory Result.ok(T value) = Ok._;
  const factory Result.error(AppFailure failure) = Err._;
}

final class Ok<T> extends Result<T> {
  const Ok._(this.value);
  final T value;
}

final class Err<T> extends Result<T> {
  const Err._(this.failure);
  final AppFailure failure;
}

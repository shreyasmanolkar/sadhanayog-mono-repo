sealed class AppFailure {
  const AppFailure(this.message);
  final String message;
}

final class NetworkFailure extends AppFailure {
  const NetworkFailure(super.message);
}

final class UnexpectedFailure extends AppFailure {
  const UnexpectedFailure(super.message);
}

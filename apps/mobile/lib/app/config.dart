/// Compile-time environment for the empty Flutter shell.
///
/// Native Android/iOS product flavors stay in SY-0064. Pass values with
/// `--dart-define=SADHANAYOG_ENV=dev` and
/// `--dart-define=SADHANAYOG_API_ORIGIN=http://127.0.0.1:8787`.
class AppConfig {
  const AppConfig({required this.environment, required this.apiOrigin});

  final String environment;
  final String apiOrigin;

  static const AppConfig current = AppConfig(
    environment: String.fromEnvironment('SADHANAYOG_ENV', defaultValue: 'dev'),
    apiOrigin: String.fromEnvironment(
      'SADHANAYOG_API_ORIGIN',
      defaultValue: 'http://127.0.0.1:8787',
    ),
  );

  bool get isProd => environment == 'prod';
}

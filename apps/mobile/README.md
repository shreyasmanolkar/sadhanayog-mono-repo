# Sadhana Yog mobile

Flutter shell only. No product features, no embedded secrets.

```bash
cd apps/mobile
flutter pub get
flutter analyze
flutter test
```

Compile-time config (Stage 1 shell):

```bash
flutter run \
  --dart-define=SADHANAYOG_ENV=dev \
  --dart-define=SADHANAYOG_API_ORIGIN=http://127.0.0.1:8787
```

iOS and Android platform folders are present. Native product flavors `dev` and
`prod` arrive in Stage 8 (SY-0064). Keep signing material out of this
repository.

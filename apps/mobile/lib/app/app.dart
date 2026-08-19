import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import 'config.dart';

final GoRouter appRouter = GoRouter(
  routes: <RouteBase>[
    GoRoute(
      path: '/',
      builder: (BuildContext context, GoRouterState state) {
        return const FoundationHomePage();
      },
    ),
  ],
);

class SadhanaYogApp extends StatelessWidget {
  const SadhanaYogApp({super.key, GoRouter? router, AppConfig? config})
    : _router = router,
      _config = config;

  final GoRouter? _router;
  final AppConfig? _config;

  @override
  Widget build(BuildContext context) {
    final ColorScheme scheme = ColorScheme.fromSeed(
      seedColor: const Color(0xFF9C3D2A),
      brightness: Brightness.light,
    );
    return Provider<AppConfig>.value(
      value: _config ?? AppConfig.current,
      child: MaterialApp.router(
        title: 'Sadhana Yog',
        theme: ThemeData(colorScheme: scheme, useMaterial3: true),
        routerConfig: _router ?? appRouter,
      ),
    );
  }
}

class FoundationHomePage extends StatelessWidget {
  const FoundationHomePage({super.key});

  @override
  Widget build(BuildContext context) {
    final AppConfig config = context.watch<AppConfig>();
    return Scaffold(
      appBar: AppBar(title: const Text('Sadhana Yog')),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            const Text(
              'The desk is empty on purpose.',
              style: TextStyle(fontSize: 28, height: 1.1),
            ),
            const SizedBox(height: 12),
            const Text(
              'This is the Flutter shell. Product features arrive as vertical slices.',
            ),
            const SizedBox(height: 12),
            Text('Environment: ${config.environment}'),
          ],
        ),
      ),
    );
  }
}

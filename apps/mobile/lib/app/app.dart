import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

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
  const SadhanaYogApp({super.key, GoRouter? router}) : _router = router;

  final GoRouter? _router;

  @override
  Widget build(BuildContext context) {
    final ColorScheme scheme = ColorScheme.fromSeed(
      seedColor: const Color(0xFF9C3D2A),
      brightness: Brightness.light,
    );
    return MaterialApp.router(
      title: 'Sadhana Yog',
      theme: ThemeData(colorScheme: scheme, useMaterial3: true),
      routerConfig: _router ?? appRouter,
    );
  }
}

class FoundationHomePage extends StatelessWidget {
  const FoundationHomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Sadhana Yog')),
      body: const Padding(
        padding: EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Text(
              'The desk is empty on purpose.',
              style: TextStyle(fontSize: 28, height: 1.1),
            ),
            SizedBox(height: 12),
            Text(
              'This is the Flutter shell. Product features arrive as vertical slices.',
            ),
          ],
        ),
      ),
    );
  }
}

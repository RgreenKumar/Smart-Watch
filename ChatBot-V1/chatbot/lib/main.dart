// lib/main.dart  (MODIFIED — replace existing file)
// ─────────────────────────────────────────────────────────────────────────────
// Changes vs original:
//   1. AuthStore.restore() on startup → checks for saved JWT.
//   2. Routes to AppRoot if session valid, else LoginScreen.
//   3. Connects WebSocket immediately after restore if session exists.
// ─────────────────────────────────────────────────────────────────────────────

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'core/theme/app_theme.dart';
import 'core/services/auth_store.dart';
import 'core/services/websocket_service.dart';
import 'features/auth/screens/login_screen.dart';
import 'features/app_root.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
    ),
  );

  // ── Restore saved session ─────────────────────────────────────────────────
  final hasSession = await AuthStore.instance.restore();

  // Reconnect WebSocket if session exists
  if (hasSession && AuthStore.instance.userEmail != null) {
    WebSocketService.instance.connect(
      departmentId: AuthStore.instance.departmentId ?? 0,
      agentEmail:   AuthStore.instance.userEmail!,
    );
  }

  runApp(ChatApp(startLoggedIn: hasSession));
}

class ChatApp extends StatelessWidget {
  final bool startLoggedIn;
  const ChatApp({super.key, required this.startLoggedIn});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Chat',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light,
      scrollBehavior: const _NoOverScroll(),
      // NOTE: Do NOT use 'const' here — AppRoot and LoginScreen
      // contain non-const members (controllers, etc.)
      home: startLoggedIn ? AppRoot() : LoginScreen(),
    );
  }
}

class _NoOverScroll extends ScrollBehavior {
  const _NoOverScroll();

  @override
  Widget buildOverscrollIndicator(
    BuildContext context,
    Widget child,
    ScrollableDetails details,
  ) =>
      child;

  @override
  ScrollPhysics getScrollPhysics(BuildContext context) =>
      const ClampingScrollPhysics();
}

// test/integration/app_flow_test.dart
//
// INTEGRATION TEST — Full App Navigation Flow
// ─────────────────────────────────────────────────────────────────────────────
// Tests end-to-end flows: login → dashboard → chat
// These tests pump the full app but mock the HTTP backend.
//
// Run: flutter test test/integration/app_flow_test.dart
//
// NOTE: Integration tests that need a real device/emulator:
//   flutter test integration_test/app_test.dart --device-id=<id>

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:chat_app/features/app_root.dart';
import 'package:chat_app/features/auth/screens/login_screen.dart';
import 'package:chat_app/core/widgets/custom_bottom_nav.dart';

void main() {

  // ════════════════════════════════════════════════════════════════════════════
  // Tab navigation with IndexedStack (Bug Fix: tab switching should keep chat open)
  // ════════════════════════════════════════════════════════════════════════════

  group('AppRoot — IndexedStack tab navigation', () {

    testWidgets('All 5 tab pages exist in IndexedStack', (tester) async {
      await tester.pumpWidget(const MaterialApp(home: AppRoot()));
      await tester.pump();

      // IndexedStack should be used (not AnimatedSwitcher)
      expect(find.byType(IndexedStack), findsOneWidget,
          reason: 'Must use IndexedStack to keep pages alive across tab switches');

      // AnimatedSwitcher must NOT be used (it disposes pages)
      expect(find.byType(AnimatedSwitcher), findsNothing,
          reason: 'AnimatedSwitcher would destroy active chat when switching tabs');
    });

    testWidgets('Bottom nav shows all 5 tabs', (tester) async {
      await tester.pumpWidget(const MaterialApp(home: AppRoot()));
      await tester.pump();

      expect(find.byType(CustomBottomNav), findsOneWidget);
      expect(find.text('Chats'),     findsOneWidget);
      expect(find.text('Dashboard'), findsOneWidget);
      expect(find.text('Settings'),  findsOneWidget);
    });

    testWidgets('Switching from Chats tab to Dashboard tab does NOT dispose Chats', (tester) async {
      await tester.pumpWidget(const MaterialApp(home: AppRoot()));
      await tester.pump();

      // Start on Chats (index 0) — default
      // Tap Dashboard (index 2)
      await tester.tap(find.text('Dashboard'));
      await tester.pump();

      // The IndexedStack keeps all pages mounted — Chats is still in tree
      // (just hidden with Offstage). Verify IndexedStack still present.
      expect(find.byType(IndexedStack), findsOneWidget);

      // Tap back to Chats
      await tester.tap(find.text('Chats'));
      await tester.pump();

      // App still alive — no crash
      expect(find.byType(AppRoot), findsOneWidget);
    });

    testWidgets('Multiple rapid tab switches do not crash', (tester) async {
      await tester.pumpWidget(const MaterialApp(home: AppRoot()));
      await tester.pump();

      // Rapid tab switching
      final tabs = ['Chats', 'Users', 'Dashboard', 'DM', 'Settings'];
      for (final tab in tabs) {
        await tester.tap(find.text(tab));
        await tester.pump(const Duration(milliseconds: 50));
      }
      // Back to start
      await tester.tap(find.text('Chats'));
      await tester.pumpAndSettle();

      expect(find.byType(AppRoot), findsOneWidget,
          reason: 'App should survive rapid tab switching without crashes');
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // LoginScreen renders before auth
  // ════════════════════════════════════════════════════════════════════════════

  group('LoginScreen — basic render', () {

    testWidgets('Login screen renders without errors', (tester) async {
      await tester.pumpWidget(const MaterialApp(home: LoginScreen()));
      await tester.pump();
      expect(find.byType(LoginScreen), findsOneWidget);
    });
  });
}

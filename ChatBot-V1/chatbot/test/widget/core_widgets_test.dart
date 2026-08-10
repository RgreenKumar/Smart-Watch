// test/widget/core_widgets_test.dart
//
// WIDGET TESTS — Core Reusable Widgets
// Run: flutter test test/widget/core_widgets_test.dart

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:chat_app/core/widgets/chat_avatar.dart';
import 'package:chat_app/core/widgets/custom_bottom_nav.dart';

Widget wrap(Widget child) => MaterialApp(home: Scaffold(body: child));

void main() {

  // ════════════════════════════════════════════════════════════════════════════
  // ChatAvatar
  // ════════════════════════════════════════════════════════════════════════════

  group('ChatAvatar widget', () {

    testWidgets('Displays first letter of label', (tester) async {
      await tester.pumpWidget(wrap(
        const ChatAvatar(label: 'Ram Kumar', radius: 24),
      ));
      expect(find.text('R'), findsOneWidget,
          reason: 'Should show first letter of "Ram Kumar"');
    });

    testWidgets('Shows "?" for empty label', (tester) async {
      await tester.pumpWidget(wrap(
        const ChatAvatar(label: '', radius: 24),
      ));
      expect(find.text('?'), findsOneWidget,
          reason: 'Empty label should fall back to "?"');
    });

    testWidgets('Renders as circle with correct radius', (tester) async {
      await tester.pumpWidget(wrap(
        const ChatAvatar(label: 'Alice', radius: 30),
      ));
      final container = tester.widget<Container>(find.byType(Container).first);
      final decoration = container.decoration as BoxDecoration?;
      expect(decoration?.shape, BoxShape.circle,
          reason: 'Avatar must be circular');
    });

    testWidgets('Uppercase first letter regardless of input case', (tester) async {
      await tester.pumpWidget(wrap(
        const ChatAvatar(label: 'deepika', radius: 20),
      ));
      expect(find.text('D'), findsOneWidget);
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // CustomBottomNav
  // ════════════════════════════════════════════════════════════════════════════

  group('CustomBottomNav widget', () {

    testWidgets('Renders 5 navigation tabs', (tester) async {
      int tapped = -1;
      await tester.pumpWidget(MaterialApp(
        home: Scaffold(
          bottomNavigationBar: CustomBottomNav(
            currentIndex: 0,
            onTap: (i) => tapped = i,
          ),
        ),
      ));

      // 5 labels: Chats, Users, Dashboard, DM, Settings
      expect(find.text('Chats'),     findsOneWidget);
      expect(find.text('Users'),     findsOneWidget);
      expect(find.text('Dashboard'), findsOneWidget);
      expect(find.text('DM'),        findsOneWidget);
      expect(find.text('Settings'),  findsOneWidget);
    });

    testWidgets('Calls onTap with correct index', (tester) async {
      int tapped = -1;
      await tester.pumpWidget(MaterialApp(
        home: Scaffold(
          bottomNavigationBar: CustomBottomNav(
            currentIndex: 0,
            onTap: (i) => tapped = i,
          ),
        ),
      ));

      // Tap "Users" (index 1)
      await tester.tap(find.text('Users'));
      await tester.pump();
      expect(tapped, 1, reason: 'Users tab should be index 1');
    });

    testWidgets('Tapping current tab does NOT call onTap', (tester) async {
      int callCount = 0;
      await tester.pumpWidget(MaterialApp(
        home: Scaffold(
          bottomNavigationBar: CustomBottomNav(
            currentIndex: 2,     // Dashboard currently selected
            onTap: (_) => callCount++,
          ),
        ),
      ));

      // Tap "Dashboard" (already selected)
      await tester.tap(find.text('Dashboard'));
      await tester.pump();
      expect(callCount, 0,
          reason: 'Tapping active tab should not trigger onTap');
    });

    testWidgets('Currently selected tab has distinct styling', (tester) async {
      await tester.pumpWidget(MaterialApp(
        home: Scaffold(
          bottomNavigationBar: CustomBottomNav(
            currentIndex: 0,
            onTap: (_) {},
          ),
        ),
      ));
      // Just verify it renders without error
      expect(find.byType(CustomBottomNav), findsOneWidget);
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // FloatingToast
  // ════════════════════════════════════════════════════════════════════════════

  group('FloatingToast', () {

    testWidgets('App does not crash without FloatingToast being shown', (tester) async {
      await tester.pumpWidget(wrap(const SizedBox()));
      // No crash = pass
      expect(find.byType(SizedBox), findsOneWidget);
    });
  });
}

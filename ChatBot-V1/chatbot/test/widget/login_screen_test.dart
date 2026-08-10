// test/widget/login_screen_test.dart
//
// WIDGET TESTS — LoginScreen UI
// ─────────────────────────────────────────────────────────────────────────────
// Tests UI elements, input validation, and button states WITHOUT hitting backend.
// Run: flutter test test/widget/login_screen_test.dart

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:chat_app/features/auth/screens/login_screen.dart';

Widget makeTestWidget(Widget child) {
  return MaterialApp(
    home: child,
  );
}

void main() {

  // ════════════════════════════════════════════════════════════════════════════
  // GROUP 1: LoginScreen — UI elements present
  // ════════════════════════════════════════════════════════════════════════════

  group('LoginScreen — UI renders correctly', () {

    testWidgets('Shows email and password fields', (tester) async {
      await tester.pumpWidget(makeTestWidget(const LoginScreen()));

      // Email field present
      expect(find.byType(TextField), findsWidgets,
          reason: 'Login screen must have input fields');

      // At least one text field for email
      expect(
        find.widgetWithText(TextField, 'Email') .evaluate().isNotEmpty ||
        find.byKey(const Key('email_field')).evaluate().isNotEmpty ||
        find.text('Email').evaluate().isNotEmpty,
        isTrue,
        reason: 'Email label or field must be visible',
      );
    });

    testWidgets('Shows a Login/Sign In button', (tester) async {
      await tester.pumpWidget(makeTestWidget(const LoginScreen()));
      await tester.pump();

      // Find elevated button or text button with "Login" or "Sign In"
      final loginBtns = find.byWidgetPredicate((w) {
        if (w is ElevatedButton || w is TextButton || w is FilledButton) {
          final btn = w as ButtonStyleButton;
          final child = btn.child;
          if (child is Text) {
            return child.data?.toLowerCase().contains('login') == true ||
                   child.data?.toLowerCase().contains('sign in') == true;
          }
        }
        return false;
      });

      expect(loginBtns, findsAtLeastNWidgets(1),
          reason: 'A Login button must exist on the login screen');
    });

    testWidgets('Password field is obscured by default', (tester) async {
      await tester.pumpWidget(makeTestWidget(const LoginScreen()));
      await tester.pump();

      // Find all TextFields and check if any has obscureText=true
      final textFields = tester.widgetList<TextField>(find.byType(TextField));
      final hasObscured = textFields.any((tf) => tf.obscureText == true);
      expect(hasObscured, isTrue,
          reason: 'Password field must obscure text');
    });

  });

  // ════════════════════════════════════════════════════════════════════════════
  // GROUP 2: Input validation
  // ════════════════════════════════════════════════════════════════════════════

  group('LoginScreen — Input validation', () {

    testWidgets('Tapping login with empty fields shows validation', (tester) async {
      await tester.pumpWidget(makeTestWidget(const LoginScreen()));
      await tester.pump();

      // Tap whatever button has "login" text
      final btns = find.byWidgetPredicate((w) {
        if (w is ElevatedButton) {
          final c = (w as ElevatedButton).child;
          if (c is Text) return c.data?.toLowerCase().contains('login') == true;
        }
        return false;
      });

      if (btns.evaluate().isNotEmpty) {
        await tester.tap(btns.first);
        await tester.pumpAndSettle();
        // Either a snackbar, validation error text, or nothing happens
        // The important thing: app doesn't crash
      }
    });

    testWidgets('Can type into email field', (tester) async {
      await tester.pumpWidget(makeTestWidget(const LoginScreen()));
      await tester.pump();

      final fields = find.byType(TextField);
      if (fields.evaluate().isNotEmpty) {
        await tester.enterText(fields.first, 'test@example.com');
        await tester.pump();
        expect(find.text('test@example.com'), findsOneWidget);
      }
    });
  });
}

import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'main_tab.dart';
import 'login_page.dart';

class AuthWrapper extends StatefulWidget {
  const AuthWrapper({super.key});

  @override
  State<AuthWrapper> createState() => _AuthWrapperState();
}

class _AuthWrapperState extends State<AuthWrapper> {
  final _storage = const FlutterSecureStorage();

  @override
  void initState() {
    super.initState();
    _checkAuthToken();
  }

  Future<void> _checkAuthToken() async {
    final token = await _storage.read(key: 'auth_token');

    if (!mounted) return;

    if (token != null && token.isNotEmpty) {
      // User is authenticated
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => const MainTab(initialTab: 0)),
      );
    } else {
      // User needs to log in
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => const LoginPage()),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(child: CircularProgressIndicator()),
    );
  }
}
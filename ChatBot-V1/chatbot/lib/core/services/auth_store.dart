// lib/core/services/auth_store.dart
// ─────────────────────────────────────────────────────────────────────────────
// In-memory session store. Holds JWT + user profile returned by login.
// SharedPreferences keeps the session alive across app restarts.
// ─────────────────────────────────────────────────────────────────────────────

import 'package:shared_preferences/shared_preferences.dart';

class AuthStore {
  AuthStore._();
  static final AuthStore instance = AuthStore._();

  // ── Session data ──────────────────────────────────────────────────────────
  String? token;
  int?    userId;
  String? userName;
  String? userEmail;
  String? role;         // 'ADMIN' | 'AGENT'
  int?    departmentId;

  bool get isLoggedIn => token != null;
  bool get isAdmin    => role == 'ADMIN';
  bool get isAgent    => role == 'AGENT';

  // ── Save after login ──────────────────────────────────────────────────────

  Future<void> save({
    required String token,
    required int    userId,
    required String userName,
    required String userEmail,
    required String role,
    int?            departmentId,
  }) async {
    this.token        = token;
    this.userId       = userId;
    this.userName     = userName;
    this.userEmail    = userEmail;
    this.role         = role;
    this.departmentId = departmentId;

    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('jwt_token',  token);
    await prefs.setInt   ('user_id',    userId);
    await prefs.setString('user_name',  userName);
    await prefs.setString('user_email', userEmail);
    await prefs.setString('user_role',  role);
    if (departmentId != null) {
      await prefs.setInt('department_id', departmentId);
    } else {
      await prefs.remove('department_id');
    }
  }

  // ── Restore from disk on app start ────────────────────────────────────────

  Future<bool> restore() async {
    final prefs = await SharedPreferences.getInstance();
    final savedToken = prefs.getString('jwt_token');
    if (savedToken == null) return false;

    token        = savedToken;
    userId       = prefs.getInt   ('user_id');
    userName     = prefs.getString('user_name');
    userEmail    = prefs.getString('user_email');
    role         = prefs.getString('user_role');
    departmentId = prefs.getInt   ('department_id');
    return true;
  }

  // ── Clear on logout (async) ───────────────────────────────────────────────

  Future<void> clear() async {
    clearSync();
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
  }

  // ── Synchronous in-memory clear (for 401 handler in ApiClient) ───────────
  // Does NOT await SharedPreferences — safe to call from synchronous context.

  void clearSync() {
    token        = null;
    userId       = null;
    userName     = null;
    userEmail    = null;
    role         = null;
    departmentId = null;
    // Fire-and-forget prefs clear — don't await in sync context
    SharedPreferences.getInstance().then((p) => p.clear());
  }
}

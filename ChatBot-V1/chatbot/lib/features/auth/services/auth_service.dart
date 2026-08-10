// lib/features/auth/services/auth_service.dart
// ─────────────────────────────────────────────────────────────────────────────
// Maps Flutter auth screens → Spring Boot /chatbot/* endpoints.
//
// Spring endpoints used:
//   POST /chatbot/login          → body: {email, password}
//   POST /chatbot/register       → params: username, email, password
//   POST /chatbot/logout         → header: Authorization
//   GET  /chatbot/check-admin-exists
//   GET  /chatbot/register-token/{token}
// ─────────────────────────────────────────────────────────────────────────────

import '../../../core/services/api_client.dart';
import '../../../core/services/auth_store.dart';
import '../../../core/services/websocket_service.dart';

class AuthService {
  AuthService._();
  static final AuthService instance = AuthService._();

  // ── Login ──────────────────────────────────────────────────────────────────
  // Calls POST /chatbot/login  (JSON body)
  // On success: saves token + profile to AuthStore, connects WebSocket.

  Future<void> login(String email, String password) async {
    final data = await ApiClient.instance.post(
      '/chatbot/login',
      {'email': email, 'password': password},
    ) as Map<String, dynamic>;

    // Spring returns: token, name, email, userId, role, departmentId
    final token        = data['token']        as String;
    final userId       = (data['userId']      as num).toInt();
    final userName     = data['name']         as String? ?? '';
    final userEmail    = data['email']        as String? ?? email;
    final role         = data['role']         as String? ?? 'AGENT';
    final departmentId = data['departmentId'] != null
        ? (data['departmentId'] as num).toInt()
        : null;

    await AuthStore.instance.save(
      token:        token,
      userId:       userId,
      userName:     userName,
      userEmail:    userEmail,
      role:         role,
      departmentId: departmentId,
    );

    // Connect WebSocket after login
    WebSocketService.instance.connect(
      departmentId: departmentId ?? 0,
      agentEmail:   userEmail,
    );
  }

  // ── Register ───────────────────────────────────────────────────────────────
  // Calls POST /chatbot/register  (form params)
  // Used for first-admin creation AND for invited users activating via token.

  Future<String> register({
    required String username,
    required String email,
    required String password,
    String? inviteToken,
  }) async {
    final result = await ApiClient.instance.postForm(
      '/chatbot/register',
      {
        'username': username,
        'email':    email,
        'password': password,
      },
    );
    return result?.toString() ?? 'Registered successfully';
  }

  // ── Validate invite token ──────────────────────────────────────────────────
  // GET /chatbot/register-token/{token}
  // Returns {email, role} for pre-filled registration form.

  Future<Map<String, String>> getInviteDetails(String token) async {
    final data = await ApiClient.instance.get(
      '/chatbot/register-token/$token',
    ) as Map<String, dynamic>;
    return {
      'email': data['email'] as String? ?? '',
      'role':  data['role']  as String? ?? 'AGENT',
    };
  }

  // ── Check if first admin exists ────────────────────────────────────────────
  // GET /chatbot/check-admin-exists
  // Used on app start to decide whether to show "Create first admin" page.

  Future<bool> adminExists() async {
    final result = await ApiClient.instance.get('/chatbot/check-admin-exists');
    return result == true || result?.toString() == 'true';
  }

  // ── Logout ─────────────────────────────────────────────────────────────────
  // POST /chatbot/logout  (sends Bearer token in header, Spring blacklists it)

  Future<void> logout() async {
    try {
      await ApiClient.instance.postForm('/chatbot/logout', {});
    } catch (_) {
      // Ignore server errors — always clear local session
    }
    WebSocketService.instance.disconnect();
    await AuthStore.instance.clear();
  }

  // ── Forgot password ────────────────────────────────────────────────────────
  // NOTE: Spring Boot does NOT currently expose a forgot-password REST endpoint.
  // Gap identified: this endpoint must be added to Spring or handled via
  // a separate email flow. Until then, we return a generic success message.
  // Implementation below is a placeholder stub.

  Future<void> forgotPassword(String email) async {
    // TODO: Implement once Spring adds POST /chatbot/forgot-password
    // For now, simulate a short delay so the UI shows success state.
    await Future.delayed(const Duration(milliseconds: 600));
    // Throw to signal "not implemented" if you prefer:
    // throw ApiException(501, 'Forgot password not yet supported by backend');
  }

  // ── Change password ────────────────────────────────────────────────────────
  // NOTE: Same gap — Spring has no change-password endpoint yet.
  // Stub implementation matches the same pattern as forgot-password.

  Future<void> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    // TODO: Implement once Spring adds PATCH /chatbot/change-password
    await Future.delayed(const Duration(milliseconds: 600));
  }
}

// lib/features/users/services/user_service.dart
// ─────────────────────────────────────────────────────────────────────────────
// Maps UsersScreen → Spring Boot endpoints for visitor/user data.
//
// GAP IDENTIFIED:
// Spring Boot currently has NO endpoint that lists UserInfo records.
// UserInfo is saved when a visitor submits the chat widget login form
// (POST /chatbot/widget/chat/{id}), but there is no GET endpoint to
// retrieve the list.
//
// FIX REQUIRED IN SPRING (see section 4 below):
//   Add GET /chatbot/users  to return all UserInfo records.
//   Add GET /chatbot/users/{id}/sessions  to return chat history per user.
//
// Until those endpoints are added, this service falls back to empty lists.
// ─────────────────────────────────────────────────────────────────────────────

import '../../../core/services/api_client.dart';

class VisitorDto {
  final int    id;
  final String username;
  final String email;
  final String role;

  const VisitorDto({
    required this.id,
    required this.username,
    required this.email,
    required this.role,
  });

  String get initials => username.isNotEmpty ? username[0].toUpperCase() : '?';

  factory VisitorDto.fromJson(Map<String, dynamic> j) => VisitorDto(
        id:       (j['id']       as num).toInt(),
        username: j['username']  as String? ?? j['email'] as String? ?? '',
        email:    j['email']     as String? ?? '',
        role:     j['role']      as String? ?? 'USER',
      );
}

class UserService {
  UserService._();
  static final UserService instance = UserService._();

  // ── GET /chatbot/users  (NEW endpoint — not yet in Spring) ─────────────────
  // Returns all UserInfo (end-visitors who interacted with the chat widget).
  //
  // IMPORTANT: Add this Spring controller method to handle this endpoint:
  //
  //   @GetMapping("/users")
  //   public ResponseEntity<List<UserInfo>> getAllUsers() {
  //     return ResponseEntity.ok(userinforepository.findAll());
  //   }

  Future<List<VisitorDto>> getAllUsers() async {
    try {
      final data = await ApiClient.instance.get('/chatbot/users') as List;
      return data
          .map((j) => VisitorDto.fromJson(j as Map<String, dynamic>))
          .toList();
    } on ApiException catch (e) {
      // 404 = endpoint not yet added to Spring
      if (e.statusCode == 404 || e.statusCode == 405) {
        return []; // graceful fallback until Spring is updated
      }
      rethrow;
    }
  }

  // ── GET /chatbot/users/{id}/sessions  (NEW endpoint — not yet in Spring) ──
  // Returns chat session history for a specific visitor.
  //
  // IMPORTANT: Add this Spring controller method:
  //
  //   @GetMapping("/users/{id}/sessions")
  //   public ResponseEntity<List<SessionDisplayDTO>> getUserSessions(
  //       @PathVariable Long id) {
  //     List<ChatSession> sessions = sessionRepo.findBySender(
  //         userinforepository.findById(id).orElseThrow().getEmail()
  //     );
  //     // map to SessionDisplayDTO and return
  //   }

  Future<List<Map<String, dynamic>>> getUserSessions(int userId) async {
    try {
      final data = await ApiClient.instance.get(
        '/chatbot/users/$userId/sessions',
      ) as List;
      return data.cast<Map<String, dynamic>>();
    } on ApiException catch (e) {
      if (e.statusCode == 404 || e.statusCode == 405) return [];
      rethrow;
    }
  }
}

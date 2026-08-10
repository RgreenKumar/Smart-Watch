// test/unit/session_display_test.dart
//
// UNIT TESTS — SessionDisplay State Machine
// ─────────────────────────────────────────────────────────────────────────────
// Tests the Tawk business logic computed properties WITHOUT hitting any backend.
// Run: flutter test test/unit/session_display_test.dart

import 'package:flutter_test/flutter_test.dart';
import 'package:chat_app/features/chats/services/chat_service.dart';

// ── Test helper: build a SessionDisplay quickly ──────────────────────────────
SessionDisplay makeSession({
  String  sessionId  = 'sess-001',
  bool    status     = false,       // false = open, true = resolved
  String? adminEmail,               // null = no agent claimed
  String? userEmail  = 'visitor@test.com',
  String? username   = 'Test Visitor',
  String? lastMessage,
  String? timestamp,
}) {
  return SessionDisplay(
    sessionId:    sessionId,
    status:       status,
    adminEmail:   adminEmail,
    userEmail:    userEmail,
    username:     username ?? 'Test Visitor',
    lastMessage:  lastMessage,
    timestamp:    timestamp ?? DateTime.now().toIso8601String(),
  );
}

void main() {

  // ════════════════════════════════════════════════════════════════════════════
  // GROUP 1: Monitoring Status (Dashboard Active Chats)
  // ════════════════════════════════════════════════════════════════════════════

  group('Monitoring Status — Unanswered vs Served', () {

    test('isUnanswered = true  when status=false AND no agent claimed', () {
      final s = makeSession(status: false, adminEmail: null);
      expect(s.isUnanswered, isTrue,
          reason: 'No agent joined yet → must show in Unanswered section');
    });

    test('isUnanswered = false when adminEmail is set', () {
      final s = makeSession(status: false, adminEmail: 'agent@co.com');
      expect(s.isUnanswered, isFalse,
          reason: 'Agent has joined → no longer Unanswered');
    });

    test('isServed = true  when status=false AND adminEmail is set', () {
      final s = makeSession(status: false, adminEmail: 'agent@co.com');
      expect(s.isServed, isTrue,
          reason: 'Agent joined + not resolved → Served in Monitoring');
    });

    test('isServed = false when no agent claimed', () {
      final s = makeSession(status: false, adminEmail: null);
      expect(s.isServed, isFalse);
    });

    test('isServed = false when session is resolved', () {
      final s = makeSession(status: true, adminEmail: 'agent@co.com');
      expect(s.isServed, isFalse,
          reason: 'Resolved sessions leave Monitoring entirely');
    });

    test('Empty string adminEmail treated same as null (Unanswered)', () {
      final s = makeSession(status: false, adminEmail: '   ');
      expect(s.isUnanswered, isTrue,
          reason: 'Whitespace adminEmail = no agent');
      expect(s.isServed, isFalse);
    });

    test('monitoringStatus returns correct enum', () {
      final unanswered = makeSession(status: false, adminEmail: null);
      final served     = makeSession(status: false, adminEmail: 'a@b.com');
      expect(unanswered.monitoringStatus, MonitoringStatus.unanswered);
      expect(served.monitoringStatus,     MonitoringStatus.served);
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // GROUP 2: Inbox Status (Chats Page)
  // ════════════════════════════════════════════════════════════════════════════

  group('Inbox Status — Open / Pending / Closed / Missed', () {

    test('isClosed = true  when status=true', () {
      final s = makeSession(status: true, adminEmail: 'agent@co.com');
      expect(s.isClosed, isTrue);
    });

    test('isClosed = false when status=false', () {
      final s = makeSession(status: false, adminEmail: 'agent@co.com');
      expect(s.isClosed, isFalse);
    });

    test('isPending = true  when status=false AND agent joined (Served, not resolved)', () {
      final s = makeSession(status: false, adminEmail: 'agent@co.com');
      expect(s.isPending, isTrue,
          reason: 'Agent replied but did not resolve = Pending in Inbox');
    });

    test('isOpenMissed = true  when status=false AND no agent ever replied', () {
      final s = makeSession(status: false, adminEmail: null);
      expect(s.isOpenMissed, isTrue,
          reason: 'Visitor messaged, nobody replied = Missed chat');
    });

    test('isOpenMissed = false when agent has replied', () {
      final s = makeSession(status: false, adminEmail: 'agent@co.com');
      expect(s.isOpenMissed, isFalse);
    });

    test('inboxStatus returns Open for missed chats', () {
      final s = makeSession(status: false, adminEmail: null);
      expect(s.inboxStatus, InboxStatus.open);
    });

    test('inboxStatus returns Pending for answered-but-open chats', () {
      final s = makeSession(status: false, adminEmail: 'agent@co.com');
      expect(s.inboxStatus, InboxStatus.pending);
    });

    test('inboxStatus returns Closed for resolved chats', () {
      final s = makeSession(status: true, adminEmail: 'agent@co.com');
      expect(s.inboxStatus, InboxStatus.closed);
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // GROUP 3: Session Age and Live Window
  // ════════════════════════════════════════════════════════════════════════════

  group('Session Age — Live Window (22-minute rule)', () {

    test('isWithinLiveWindow = true  for brand new session', () {
      final s = makeSession(timestamp: DateTime.now().toIso8601String());
      expect(s.isWithinLiveWindow, isTrue);
    });

    test('isWithinLiveWindow = false for session 25 minutes ago', () {
      final old = DateTime.now().subtract(const Duration(minutes: 25));
      final s   = makeSession(timestamp: old.toIso8601String());
      expect(s.isWithinLiveWindow, isFalse,
          reason: '25 min > 22 min window → session left Monitoring');
    });

    test('isWithinLiveWindow = true  exactly at 21 minutes (still in buffer)', () {
      final recent = DateTime.now().subtract(const Duration(minutes: 21));
      final s      = makeSession(timestamp: recent.toIso8601String());
      expect(s.isWithinLiveWindow, isTrue,
          reason: '21 min < 22 min → still inside 2-min buffer');
    });

    test('ageSeconds returns positive number', () {
      final s = makeSession(
        timestamp: DateTime.now()
            .subtract(const Duration(seconds: 90))
            .toIso8601String(),
      );
      expect(s.ageSeconds, greaterThanOrEqualTo(88),
          reason: 'Should be close to 90 seconds');
    });

    test('ageSeconds returns 0 for null timestamp', () {
      final s = SessionDisplay(
        sessionId: 'x', status: false, username: 'V', timestamp: null);
      expect(s.ageSeconds, equals(0));
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // GROUP 4: fromJson parsing
  // ════════════════════════════════════════════════════════════════════════════

  group('SessionDisplay.fromJson — data parsing', () {

    test('Parses standard Spring response correctly', () {
      final json = {
        'sessionId':    'sess-abc',
        'status':       false,
        'adminemail':   null,
        'useremail':    'visitor@test.com',
        'username':     'Ram Kumar',
        'message':      'Hello there',
        'timestamp':    '2026-04-17T10:30:00',
        'departmentId': 2,
        'userid':       5,
      };
      final s = SessionDisplay.fromJson(json);
      expect(s.sessionId,    'sess-abc');
      expect(s.status,       false);
      expect(s.adminEmail,   null);
      expect(s.userEmail,    'visitor@test.com');
      expect(s.username,     'Ram Kumar');
      expect(s.lastMessage,  'Hello there');
      expect(s.departmentId, 2);
      expect(s.userId,       5);
    });

    test('Handles missing optional fields gracefully', () {
      final json = {
        'sessionId': 'sess-min',
        'status':    false,
        'username':  'Anonymous',
      };
      final s = SessionDisplay.fromJson(json as Map<String, dynamic>);
      expect(s.sessionId,   'sess-min');
      expect(s.adminEmail,  isNull);
      expect(s.userEmail,   isNull);
      expect(s.lastMessage, isNull);
      expect(s.isUnanswered, isTrue);
    });

    test('Defaults username to "Unknown Visitor" when missing', () {
      final json = {'sessionId': 'sess-x', 'status': false};
      final s = SessionDisplay.fromJson(json as Map<String, dynamic>);
      expect(s.username, 'Unknown Visitor');
    });

    test('Parses served session (adminemail set)', () {
      final json = {
        'sessionId':  'sess-served',
        'status':     false,
        'adminemail': 'agent@company.com',
        'username':   'Deepika',
      };
      final s = SessionDisplay.fromJson(json as Map<String, dynamic>);
      expect(s.isServed,    isTrue);
      expect(s.isUnanswered, isFalse);
      expect(s.adminEmail,  'agent@company.com');
    });

    test('Parses closed session (status=true)', () {
      final json = {
        'sessionId':  'sess-closed',
        'status':     true,
        'adminemail': 'agent@company.com',
        'username':   'Ravi',
      };
      final s = SessionDisplay.fromJson(json as Map<String, dynamic>);
      expect(s.isClosed, isTrue);
      expect(s.isServed,  isFalse);
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // GROUP 5: ChatMessage parsing
  // ════════════════════════════════════════════════════════════════════════════

  group('ChatMessage — role detection', () {

    test('USER message detected correctly', () {
      final m = ChatMessage(
        sessionId: 's1', sender: 'visitor@g.c',
        content: 'Hi', role: 'USER', timestamp: '');
      expect(m.isFromUser,  isTrue);
      expect(m.isFromAgent, isFalse);
      expect(m.isFromBot,   isFalse);
      expect(m.isSystemMsg, isFalse);
    });

    test('AGENT message detected correctly', () {
      final m = ChatMessage(
        sessionId: 's1', sender: 'agent@co.com',
        content: 'Hello!', role: 'AGENT', timestamp: '');
      expect(m.isFromAgent, isTrue);
      expect(m.isFromUser,  isFalse);
    });

    test('BOT message detected correctly', () {
      final m = ChatMessage(
        sessionId: 's1', sender: 'bot',
        content: 'RAG answer', role: 'BOT', timestamp: '');
      expect(m.isFromBot, isTrue);
    });

    test('SYSTEM message detected correctly', () {
      final m = ChatMessage(
        sessionId: 's1', sender: 'SYSTEM',
        content: 'Assigned to agent', role: 'SYSTEM', timestamp: '');
      expect(m.isSystemMsg, isTrue);
    });

    test('fromJson parses correctly', () {
      final json = {
        'sessionId': 's1',
        'sender':    'visitor@test.com',
        'content':   'hello',
        'role':      'USER',
        'timestamp': '2026-04-17T11:00:00',
      };
      final m = ChatMessage.fromJson(json);
      expect(m.content, 'hello');
      expect(m.role,    'USER');
      expect(m.isFromUser, isTrue);
    });
  });
}

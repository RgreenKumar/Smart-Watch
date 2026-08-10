// lib/features/chats/services/chat_service.dart
//
// SOURCE OF TRUTH — Tawk business logic state machine
// ─────────────────────────────────────────────────────────────────────────────
//
//  Spring DB field mapping (ChatSession entity):
//    status=false + adminEmail=null  → Unanswered  (nobody replied yet)
//    status=false + adminEmail=set   → Served      (agent replied, still open)
//    status=true                     → Closed      (agent explicitly resolved)
//
//  Tawk Inbox labels (Chats page):
//  ┌──────────────────────────────────────────────────────────────────┐
//  │  Monitoring (Dashboard)  │  Inbox (Chats)                       │
//  ├──────────────────────────────────────────────────────────────────┤
//  │  Unanswered              │  Open  (+ "Missed chat" badge)        │
//  │  Served                  │  Pending (agent active)               │
//  │  Active / Idle visitor   │  — (no chat yet)                     │
//  │  (timed out / closed)    │  Closed                              │
//  └──────────────────────────────────────────────────────────────────┘

import '../../../core/services/api_client.dart';
import '../../../core/services/auth_store.dart';

// ── Monitoring status ─────────────────────────────────────────────────────────
enum MonitoringStatus { unanswered, served }

// ── Inbox status ──────────────────────────────────────────────────────────────
enum InboxStatus { open, pending, closed }

// ── SessionDisplay DTO ────────────────────────────────────────────────────────

class SessionDisplay {
  final String  sessionId;
  final bool    status;        // true = resolved/closed by agent
  final int?    departmentId;
  final String? adminEmail;    // set when an agent has claimed/replied
  final int?    userId;
  final String  username;
  final String? userEmail;
  final String? lastMessage;
  final String? timestamp;     // last message timestamp (ISO string)
  final int     messageCount;  // ← NEW: real count from backend

  const SessionDisplay({
    required this.sessionId,
    required this.status,
    this.departmentId,
    this.adminEmail,
    this.userId,
    required this.username,
    this.userEmail,
    this.lastMessage,
    this.timestamp,
    this.messageCount = 0,
  });

  // ── Monitoring status ────────────────────────────────────────────────────
  bool get _hasAgent => adminEmail != null && adminEmail!.trim().isNotEmpty;

  /// Unanswered = open + no agent joined yet
  bool get isUnanswered => !status && !_hasAgent;

  /// Joined / Served = open + agent has replied/joined
  bool get isJoined => !status && _hasAgent;

  /// Alias kept for compatibility
  bool get isServed => isJoined;

  MonitoringStatus get monitoringStatus =>
      isServed ? MonitoringStatus.served : MonitoringStatus.unanswered;

  // ── Inbox status ─────────────────────────────────────────────────────────
  bool get isClosed    => status;
  bool get isPending   => !status && _hasAgent;
  bool get isOpenMissed => !status && !_hasAgent;
  bool get isActive    => !status;

  InboxStatus get inboxStatus {
    if (isClosed)  return InboxStatus.closed;
    if (isPending) return InboxStatus.pending;
    return InboxStatus.open;
  }

  bool get agentJoined => _hasAgent;

  bool get isMine {
    final me = AuthStore.instance.userEmail;
    if (me == null || !_hasAgent) return false;
    return adminEmail!.toLowerCase() == me.toLowerCase();
  }

  int get ageSeconds {
    if (timestamp == null) return 0;
    try {
      return DateTime.now()
          .difference(DateTime.parse(timestamp!))
          .inSeconds
          .abs();
    } catch (_) { return 0; }
  }

  /// Tawk: 20-min inactivity timeout + 2-min buffer = 22 min live window
  bool get isWithinLiveWindow => ageSeconds < 22 * 60;

  /// Session is approaching 20-min timeout — show warning at 15 min
  bool get isNearTimeout => ageSeconds > 15 * 60 && ageSeconds < 22 * 60;

  factory SessionDisplay.fromJson(Map<String, dynamic> j) => SessionDisplay(
    sessionId:    j['sessionId']    as String,
    status:       j['status']       as bool?   ?? false,
    departmentId: j['departmentId'] != null
        ? (j['departmentId'] as num).toInt() : null,
    adminEmail:   j['adminemail']   as String?,
    userId:       j['userid'] != null ? (j['userid'] as num).toInt() : null,
    username:     j['username']     as String? ?? 'Unknown Visitor',
    userEmail:    j['useremail']    as String?,
    lastMessage:  j['message']      as String?,
    timestamp:    j['timestamp']    as String?,
    messageCount: j['messageCount'] != null
        ? (j['messageCount'] as num).toInt() : 0,
  );
}

// ── ChatMessage DTO ───────────────────────────────────────────────────────────

class ChatMessage {
  final String  sessionId;
  final String  sender;
  final String? receiver;
  final String  content;
  final String  role;        // USER | BOT | AGENT | SYSTEM
  final String  timestamp;

  const ChatMessage({
    required this.sessionId,
    required this.sender,
    this.receiver,
    required this.content,
    required this.role,
    required this.timestamp,
  });

  bool get isFromUser  => role == 'USER';
  bool get isFromAgent => role == 'AGENT';
  bool get isFromBot   => role == 'BOT';
  bool get isSystemMsg => role == 'SYSTEM';

  factory ChatMessage.fromJson(Map<String, dynamic> j) => ChatMessage(
    sessionId: j['sessionId'] as String,
    sender:    j['sender']    as String,
    receiver:  j['receiver']  as String?,
    content:   j['content']   as String,
    role:      j['role']      as String? ?? 'USER',
    timestamp: j['timestamp'] as String? ?? '',
  );
}

// ── ChatService ───────────────────────────────────────────────────────────────

class ChatService {
  ChatService._();
  static final ChatService instance = ChatService._();

  Future<List<SessionDisplay>> getVisibleSessions() async {
    final agentId = AuthStore.instance.userId;
    if (agentId == null) return [];
    final data = await ApiClient.instance
        .get('/chat/sessions/visible?agentId=$agentId') as List<dynamic>;
    return data
        .map((j) => SessionDisplay.fromJson(j as Map<String, dynamic>))
        .toList();
  }

  Future<List<ChatMessage>> getHistory(String sessionId) async {
    final data = await ApiClient.instance
        .get('/chat/history/$sessionId') as List<dynamic>;
    return data
        .map((j) => ChatMessage.fromJson(j as Map<String, dynamic>))
        .toList();
  }

  /// Claim (join) an unanswered session → Unanswered → Served
  Future<bool> claimSession(String sessionId) async {
    final agentEmail = AuthStore.instance.userEmail ?? '';
    try {
      await ApiClient.instance.postForm(
        '/chat/claim',
        {'sessionId': sessionId, 'agentEmail': agentEmail},
      );
      return true;
    } on ApiException catch (e) {
      if (e.statusCode == 409) return false;
      rethrow;
    }
  }

  /// Resolve → status=true (Tawk: "Closed")
  Future<void> resolveSession(String sessionId) async {
    await ApiClient.instance.postForm(
      '/chat/setStatusForSessionID',
      {'sessionId': sessionId, 'Status': 'true'},
    );
  }

  /// Reopen → status=false (Tawk: back to Served/Open)
  Future<void> reopenSession(String sessionId) async {
    await ApiClient.instance.postForm(
      '/chat/setStatusForSessionID',
      {'sessionId': sessionId, 'Status': 'false'},
    );
  }

  /// Permanently delete a session (Tawk: "Purge")
  Future<void> deleteSession(String sessionId) async {
    await ApiClient.instance.delete('/chat/sessions/$sessionId');
  }
}

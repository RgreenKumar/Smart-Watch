// lib/core/services/websocket_service.dart
// Updated: adds typing indicator + visitor monitor subscriptions.

import 'dart:async';
import 'dart:convert';
import 'package:web_socket_channel/web_socket_channel.dart';
import 'api_client.dart';

typedef MessageCallback = void Function(Map<String, dynamic> msg);
typedef PendingCallback = void Function(Map<String, dynamic> alert);

class WebSocketService {
  WebSocketService._();
  static final WebSocketService instance = WebSocketService._();

  WebSocketChannel? _channel;
  StreamSubscription? _subscription;
  bool _connected = false;
  bool get connected => _connected;

  final Map<String, MessageCallback> _subs   = {};
  final Map<String, String>          _subIds = {};
  int _subIdCounter = 0;

  Timer? _reconnectTimer;
  String? _lastDepartmentStr;
  String? _lastAgentEmail;

  // ── External callbacks ────────────────────────────────────────────────────
  PendingCallback? onPendingSession;
  MessageCallback? onVisitorMonitorUpdate; // Feature 9: live visitor list
  MessageCallback? onSessionClaimed;       // Agent joined a session → refresh list

  // ── Connect ───────────────────────────────────────────────────────────────
  void connect({required int departmentId, required String agentEmail}) {
    _lastDepartmentStr = departmentId.toString();
    _lastAgentEmail    = agentEmail;

    final wsBase = springBaseUrl
        .replaceFirst('https://', 'wss://')
        .replaceFirst('http://',  'ws://');
    final uri = Uri.parse('$wsBase/chat/websocket');

    _disconnect();
    try {
      _channel     = WebSocketChannel.connect(uri);
      _subscription = _channel!.stream.listen(
        _onFrame,
        onDone:  _onDisconnected,
        onError: (_) => _onDisconnected(),
      );
      _send('CONNECT\naccept-version:1.1,1.0\nheart-beat:10000,10000\n\n\x00');
    } catch (_) {
      _scheduleReconnect();
    }
  }

  // ── Frame parser ──────────────────────────────────────────────────────────
  void _onFrame(dynamic raw) {
    final frame = raw.toString();

    if (frame.startsWith('CONNECTED')) {
      _connected = true;
      _reconnectTimer?.cancel();
      _subscribeAdminPending();
      _subscribeVisitorMonitor();
      if (_lastDepartmentStr != null) _subscribeSessionClaimed(_lastDepartmentStr!);
      // Re-subscribe existing session + typing subs
      final saved = Map<String, MessageCallback>.from(_subs);
      _subs.clear(); _subIds.clear();
      saved.forEach((dest, cb) {
        if (dest.startsWith('/topic/messages/') ||
            dest.startsWith('/topic/typing/')) {
          _stompSubscribe(dest, cb);
        }
      });
      return;
    }

    if (frame.startsWith('MESSAGE')) {
      final destination = _extractHeader(frame, 'destination');
      final body        = _extractBody(frame);
      if (destination == null || body == null) return;
      final cb = _subs[destination];
      if (cb != null) {
        try { cb(jsonDecode(body) as Map<String, dynamic>); } catch (_) {}
      }
    }
  }

  // ── Core subscriptions ────────────────────────────────────────────────────

  void _subscribeAdminPending() {
    _stompSubscribe('/topic/admin/pending', (data) {
      onPendingSession?.call(data);
    });
  }

  void _subscribeSessionClaimed(String deptId) {
    _stompSubscribe('/topic/session-claimed/$deptId', (data) {
      onSessionClaimed?.call(data);
    });
  }

  // Feature 9: visitor monitor
  void _subscribeVisitorMonitor() {
    _stompSubscribe('/topic/visitor-monitor', (data) {
      onVisitorMonitorUpdate?.call(data);
    });
  }

  // ── Chat session messages ─────────────────────────────────────────────────

  void subscribeToSession(String sessionId, MessageCallback onMessage) {
    final dest = '/topic/messages/$sessionId';
    if (_subs.containsKey(dest)) return;
    _stompSubscribe(dest, onMessage);
  }

  void unsubscribeFromSession(String sessionId) {
    final dest = '/topic/messages/$sessionId';
    final id   = _subIds[dest];
    if (id != null) { _send('UNSUBSCRIBE\nid:$id\n\n\x00'); _subIds.remove(dest); }
    _subs.remove(dest);
  }

  // ── Feature 1: Typing indicator ───────────────────────────────────────────

  void subscribeToTyping(String sessionId, MessageCallback onTyping) {
    final dest = '/topic/typing/$sessionId';
    if (_subs.containsKey(dest)) return;
    _stompSubscribe(dest, onTyping);
  }

  void unsubscribeTyping(String sessionId) {
    final dest = '/topic/typing/$sessionId';
    final id   = _subIds[dest];
    if (id != null) { _send('UNSUBSCRIBE\nid:$id\n\n\x00'); _subIds.remove(dest); }
    _subs.remove(dest);
  }

  void sendTyping({
    required String sessionId,
    required String sender,
    required bool   isTyping,
  }) {
    _stompSend('/app/typing', jsonEncode({
      'sessionId': sessionId,
      'sender':    sender,
      'isTyping':  isTyping,
    }));
  }

  // ── Agent message ─────────────────────────────────────────────────────────

  void sendMessage({
    required String sessionId,
    required String sender,
    required String content,
    String role = 'AGENT',
  }) {
    _stompSend('/app/send', jsonEncode({
      'sessionId': sessionId,
      'sender':    sender,
      'content':   content,
      'role':      role,
    }));
  }

  // ── Takeover broadcast ────────────────────────────────────────────────────

  void takeoverSession({
    required String sessionId,
    required int    departmentId,
    required String agentEmail,
  }) {
    _stompSend('/app/chat.takeover', jsonEncode({
      'sessionId':    sessionId,
      'departmentId': departmentId,
      'agentEmail':   agentEmail,
    }));
  }

  // ── STOMP internals ───────────────────────────────────────────────────────

  void _stompSubscribe(String destination, MessageCallback cb) {
    final id = 'sub-${_subIdCounter++}';
    _subs[destination]   = cb;
    _subIds[destination] = id;
    if (_connected) _send('SUBSCRIBE\ndestination:$destination\nid:$id\n\n\x00');
  }

  void _stompSend(String destination, String body) {
    if (!_connected) return;
    final len = utf8.encode(body).length;
    _send('SEND\ndestination:$destination\ncontent-type:application/json\ncontent-length:$len\n\n$body\x00');
  }

  void _send(String frame) {
    try { _channel?.sink.add(frame); } catch (_) {}
  }

  String? _extractHeader(String frame, String key) {
    for (final line in frame.split('\n')) {
      if (line.startsWith('$key:')) return line.substring(key.length + 1).trim();
    }
    return null;
  }

  String? _extractBody(String frame) {
    final idx = frame.indexOf('\n\n');
    if (idx == -1) return null;
    final body = frame.substring(idx + 2);
    return body.endsWith('\x00') ? body.substring(0, body.length - 1) : body;
  }

  void _onDisconnected() {
    _connected = false;
    _scheduleReconnect();
  }

  void _scheduleReconnect() {
    _reconnectTimer?.cancel();
    _reconnectTimer = Timer(const Duration(seconds: 5), () {
      if (_lastAgentEmail != null && _lastDepartmentStr != null) {
        connect(
          departmentId: int.tryParse(_lastDepartmentStr!) ?? 0,
          agentEmail:   _lastAgentEmail!,
        );
      }
    });
  }

  void _disconnect() {
    _subscription?.cancel(); _subscription = null;
    try { _channel?.sink.close(); } catch (_) {}
    _channel = null; _connected = false;
  }

  void disconnect() {
    _reconnectTimer?.cancel();
    if (_connected) { try { _send('DISCONNECT\n\n\x00'); } catch (_) {} }
    _subs.clear(); _subIds.clear();
    _disconnect();
  }
}

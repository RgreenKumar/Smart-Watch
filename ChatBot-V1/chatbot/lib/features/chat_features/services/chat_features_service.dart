// lib/features/chat_features/services/chat_features_service.dart

import 'dart:typed_data';
import '../../../core/services/api_client.dart';

class CannedResponse {
  final int    id;
  final String shortcut;
  final String message;
  final String? createdBy;
  const CannedResponse({required this.id, required this.shortcut,
      required this.message, this.createdBy});
  factory CannedResponse.fromJson(Map<String, dynamic> j) => CannedResponse(
    id:        (j['id']       as num).toInt(),
    shortcut:  j['shortcut']  as String,
    message:   j['message']   as String,
    createdBy: j['createdBy'] as String?,
  );
}

class ChatNote {
  final int    id;
  final String sessionId;
  final String agentEmail;
  final String content;
  final String timestamp;
  const ChatNote({required this.id, required this.sessionId,
      required this.agentEmail, required this.content, required this.timestamp});
  factory ChatNote.fromJson(Map<String, dynamic> j) => ChatNote(
    id:         (j['id']        as num).toInt(),
    sessionId:  j['sessionId']  as String,
    agentEmail: j['agentEmail'] as String? ?? '',
    content:    j['content']    as String,
    timestamp:  j['timestamp']  as String? ?? '',
  );
}

enum AgentStatus { online, away, offline }

class AgentInfo {
  final int     id;
  final String? username;
  final String  email;
  final String  status;
  const AgentInfo({required this.id, this.username,
      required this.email, required this.status});
  bool get isOnline => status == 'ONLINE';
  bool get isAway   => status == 'AWAY';
  String get displayName => (username != null && username!.isNotEmpty) ? username! : email;
  factory AgentInfo.fromJson(Map<String, dynamic> j) => AgentInfo(
    id:       (j['id']  as num).toInt(),
    username: j['username'] as String?,
    email:    j['email']    as String,
    status:   j['status']   as String? ?? 'OFFLINE',
  );
}

class VisitorInfo {
  final String  visitorId;
  final String  page;
  final String  username;
  final String  email;
  final String? sessionId;
  final int     lastSeen;
  const VisitorInfo({required this.visitorId, required this.page,
      required this.username, required this.email,
      this.sessionId, required this.lastSeen});
  String get pageLabel {
    final p = page.isEmpty ? '/' : page;
    return p.length > 35 ? '${p.substring(0, 33)}…' : p;
  }
  factory VisitorInfo.fromJson(Map<String, dynamic> j) => VisitorInfo(
    visitorId: j['visitorId'] as String? ?? '',
    page:      j['page']      as String? ?? '/',
    username:  j['username']  as String? ?? 'Anonymous',
    email:     j['email']     as String? ?? '',
    sessionId: j['sessionId'] as String?,
    lastSeen:  (j['lastSeen'] as num?)?.toInt() ?? 0,
  );
}

class UploadedFile {
  final String url;
  final String filename;
  final int    size;
  final String ext;
  const UploadedFile({required this.url, required this.filename,
      required this.size, required this.ext});
  bool get isImage => ['jpg','jpeg','png','gif','webp'].contains(ext.toLowerCase());
  String get sizeLabel {
    if (size < 1024)      return '${size}B';
    if (size < 1048576)   return '${(size/1024).toStringAsFixed(1)}KB';
    return '${(size/1048576).toStringAsFixed(1)}MB';
  }
  factory UploadedFile.fromJson(Map<String, dynamic> j) => UploadedFile(
    url:      j['url']      as String,
    filename: j['filename'] as String,
    size:     (j['size']    as num).toInt(),
    ext:      j['ext']      as String? ?? '',
  );
}

class ChatFeaturesService {
  ChatFeaturesService._();
  static final ChatFeaturesService instance = ChatFeaturesService._();

  // ── Canned Responses ──────────────────────────────────────────────────────
  Future<List<CannedResponse>> getCannedResponses() async {
    final data = await ApiClient.instance.get('/chatbot/canned') as List;
    return data.map((j) => CannedResponse.fromJson(j as Map<String, dynamic>)).toList();
  }
  Future<CannedResponse> createCannedResponse({required String shortcut, required String message}) async {
    final data = await ApiClient.instance.post('/chatbot/canned',
        {'shortcut': shortcut, 'message': message}) as Map<String, dynamic>;
    return CannedResponse.fromJson(data);
  }
  Future<void> deleteCannedResponse(int id) async =>
      ApiClient.instance.delete('/chatbot/canned/$id');

  List<CannedResponse> filterByQuery(List<CannedResponse> all, String query) {
    if (query.isEmpty) return all;
    final q = query.toLowerCase();
    return all.where((c) =>
        c.shortcut.toLowerCase().contains(q) ||
        c.message.toLowerCase().contains(q)).toList();
  }

  // ── Chat Notes ────────────────────────────────────────────────────────────
  Future<List<ChatNote>> getNotes(String sessionId) async {
    final data = await ApiClient.instance.get('/chat/notes/$sessionId') as List;
    return data.map((j) => ChatNote.fromJson(j as Map<String, dynamic>)).toList();
  }
  Future<ChatNote> addNote({required String sessionId, required String content}) async {
    final data = await ApiClient.instance.post('/chat/notes',
        {'sessionId': sessionId, 'content': content}) as Map<String, dynamic>;
    return ChatNote.fromJson(data);
  }
  Future<void> deleteNote(int id) async =>
      ApiClient.instance.delete('/chat/notes/$id');

  // ── Transfer ──────────────────────────────────────────────────────────────
  Future<void> transferChat({required String sessionId, required String toAgentEmail}) async {
    await ApiClient.instance.postForm('/chat/transfer',
        {'sessionId': sessionId, 'toAgentEmail': toAgentEmail});
  }

  // ── Agent Status ──────────────────────────────────────────────────────────
  Future<void> updateMyStatus(AgentStatus status) async {
    await ApiClient.instance.postForm('/chatbot/my-status',
        {'status': status.name.toUpperCase()});
  }
  Future<List<AgentInfo>> getAllAgentStatus() async {
    final data = await ApiClient.instance.get('/chatbot/agents/status') as List;
    return data.map((j) => AgentInfo.fromJson(j as Map<String, dynamic>)).toList();
  }
  Future<List<AgentInfo>> getOnlineAgents() async {
    final data = await ApiClient.instance.get('/chatbot/agents/online') as List;
    return data.map((j) => AgentInfo.fromJson(j as Map<String, dynamic>)).toList();
  }

  // ── File Upload ───────────────────────────────────────────────────────────
  Future<UploadedFile> uploadFile(Uint8List bytes, String filename) async {
    final data = await ApiClient.instance.uploadBytes(
      '/chat/upload-file', bytes, filename, 'file',
    ) as Map<String, dynamic>;
    return UploadedFile.fromJson(data);
  }

  // ── Visitor Monitor ───────────────────────────────────────────────────────
  Future<List<VisitorInfo>> getActiveVisitors() async {
    try {
      final data = await ApiClient.instance.get('/visitor/active') as List;
      return data.map((j) => VisitorInfo.fromJson(j as Map<String, dynamic>)).toList();
    } catch (_) { return []; }
  }
}

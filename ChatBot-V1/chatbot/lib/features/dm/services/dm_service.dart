import '../../../core/services/api_client.dart';

class DmRecipient {
  final int id;
  final String name;
  final String email;
  final String role;
  final DateTime? lastSeen;
  final bool online;

  const DmRecipient({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    this.lastSeen,
    this.online = false,
  });

  String get initials => name.isNotEmpty ? name[0].toUpperCase() : email.isNotEmpty ? email[0].toUpperCase() : '?';

  factory DmRecipient.fromJson(Map<String, dynamic> j) {
    final rawLastSeen = j['lastSeen'];
    DateTime? lastSeen;
    if (rawLastSeen is String && rawLastSeen.isNotEmpty) {
      lastSeen = DateTime.tryParse(rawLastSeen);
    }
    final rawName = (j['name'] as String?)?.trim() ?? '';
    final rawEmail = (j['email'] as String?)?.trim() ?? '';
    return DmRecipient(
      id: (j['id'] as num?)?.toInt() ?? 0,
      name: rawName.isNotEmpty ? rawName : rawEmail,
      email: rawEmail,
      role: (j['role'] as String?)?.trim().isNotEmpty == true
          ? (j['role'] as String).trim()
          : 'USER',
      lastSeen: lastSeen,
      online: j['online'] == true,
    );
  }
}

class DmService {
  DmService._();
  static final DmService instance = DmService._();

  Future<List<DmRecipient>> fetchRecipients({String query = ''}) async {
    final q = query.trim();
    final path = q.isEmpty ? '/compose/users' : '/compose/search-users?q=${Uri.encodeQueryComponent(q)}';
    final data = await ApiClient.instance.get(path) as List;
    return data
        .whereType<Map>()
        .map((e) => DmRecipient.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();
  }

  Future<void> sendDirectMessage({
    required String agentEmail,
    required String recipientEmail,
    required String content,
    String? recipientName,
    String? subject,
  }) async {
    await ApiClient.instance.postForm('/compose/create-conversation', {
      'agentEmail': agentEmail,
      'recipientEmail': recipientEmail,
      if ((recipientName ?? '').trim().isNotEmpty) 'recipientName': recipientName!.trim(),
      'subject': subject?.trim().isNotEmpty == true ? subject!.trim() : 'Direct message',
      'content': content,
      'createTicket': 'false',
    });
  }
}

// lib/features/chats/screens/chat_detail_screen.dart
//
// TAWK-EXACT CHAT DETAIL (Image 2)
// ─────────────────────────────────────────────────────────────────────────────
// Header: back arrow | visitor avatar (flag style) | visitor name + session info | ⋮
// Tabs: Chat | Ticket  (we implement Chat only, Ticket tab is placeholder)
// Body: transcript — date separator, system messages, chat bubbles
// Bottom action bar: [New ticket] [Email] [Transcript]  (no message input — this is archive)
//
// This screen is READ-ONLY for ended sessions.
// For sessions still in monitoring (isActive/isPending), show a banner.

import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/widgets/floating_toast.dart';
import '../services/chat_service.dart';

class ChatDetailScreen extends StatefulWidget {
  final SessionDisplay session;
  const ChatDetailScreen({super.key, required this.session});

  @override
  State<ChatDetailScreen> createState() => _ChatDetailScreenState();
}

class _ChatDetailScreenState extends State<ChatDetailScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final _scrollCtrl = ScrollController();

  List<ChatMessage> _messages    = [];
  bool _loadingHistory = true;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _loadHistory();
  }

  @override
  void dispose() {
    _tabController.dispose();
    _scrollCtrl.dispose();
    super.dispose();
  }

  Future<void> _loadHistory() async {
    try {
      final msgs = await ChatService.instance.getHistory(widget.session.sessionId);
      if (!mounted) return;
      setState(() { _messages = msgs; _loadingHistory = false; });
      _scrollToBottom();
    } catch (_) {
      if (!mounted) return;
      setState(() => _loadingHistory = false);
    }
  }

  void _scrollToBottom() {
    Future.delayed(const Duration(milliseconds: 150), () {
      if (_scrollCtrl.hasClients) {
        _scrollCtrl.animateTo(
          _scrollCtrl.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  // ── Date separator label ───────────────────────────────────────────────
  String _dateLabel(String ts) {
    try {
      final dt  = DateTime.parse(ts).toLocal();
      final now = DateTime.now();
      final weekdays = ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY'];
      final months   = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
      if (dt.year == now.year && dt.month == now.month && dt.day == now.day) {
        return 'TODAY';
      }
      if (now.difference(dt).inDays < 7) {
        return '${weekdays[dt.weekday - 1]}, ${dt.day} ${months[dt.month - 1]}';
      }
      return '${weekdays[dt.weekday - 1]}, ${dt.day} ${months[dt.month - 1]} ${dt.year}';
    } catch (_) { return ''; }
  }

  // ── Group messages by date ─────────────────────────────────────────────
  List<_MsgGroup> _groupByDate(List<ChatMessage> msgs) {
    final Map<String, List<ChatMessage>> groups = {};
    for (final m in msgs) {
      final key = m.timestamp.isNotEmpty
          ? m.timestamp.substring(0, 10)
          : 'unknown';
      groups.putIfAbsent(key, () => []).add(m);
    }
    return groups.entries
        .map((e) => _MsgGroup(dateKey: e.key, messages: e.value))
        .toList()
      ..sort((a, b) => a.dateKey.compareTo(b.dateKey));
  }

  // ════════════════════════════════════════════════════════════════════════
  // BUILD
  // ════════════════════════════════════════════════════════════════════════

  @override
  Widget build(BuildContext context) {
    final s = widget.session;

    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F5),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 1,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded,
              size: 20, color: Color(0xFF424242)),
          onPressed: () => Navigator.pop(context),
        ),
        title: Row(
          children: [
            // Visitor avatar (flag-style circular, like Image 2)
            GestureDetector(
              onTap: () {}, // could show visitor details
              child: Stack(
                children: [
                  Container(
                    width: 36, height: 36,
                    decoration: const BoxDecoration(
                      color: Color(0xFFEEEEEE),
                      shape: BoxShape.circle,
                    ),
                    child: Center(
                      child: Text(
                        s.username.isNotEmpty ? s.username[0].toUpperCase() : '?',
                        style: const TextStyle(
                            fontSize: 16, fontWeight: FontWeight.w700,
                            color: Color(0xFF616161)),
                      ),
                    ),
                  ),
                  // Small dropdown arrow like Image 2
                  Positioned(
                    bottom: 0, right: -2,
                    child: Container(
                      width: 14, height: 14,
                      decoration: const BoxDecoration(
                          color: Color(0xFF616161), shape: BoxShape.circle),
                      child: const Icon(Icons.arrow_drop_down,
                          size: 12, color: Colors.white),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 10),
            // Name + session date snippet (Image 2)
            Expanded(
              child: GestureDetector(
                onTap: _showSessionDetails,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(s.username,
                        style: const TextStyle(
                            fontSize: 15, fontWeight: FontWeight.w700,
                            color: Color(0xFF212121)),
                        maxLines: 1, overflow: TextOverflow.ellipsis),
                    Row(
                      children: [
                        Text(
                          _sessionChip(s),
                          style: const TextStyle(
                              fontSize: 11, color: Color(0xFF9E9E9E)),
                        ),
                        const Icon(Icons.arrow_drop_down,
                            size: 16, color: Color(0xFF9E9E9E)),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.more_vert, color: Color(0xFF424242)),
            onPressed: _showMoreMenu,
          ),
        ],
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(46),
          child: TabBar(
            controller: _tabController,
            indicatorColor: const Color(0xFF00897B),
            indicatorWeight: 2.5,
            labelColor: const Color(0xFF00897B),
            unselectedLabelColor: const Color(0xFF9E9E9E),
            labelStyle: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
            tabs: const [
              Tab(
                child: Row(mainAxisSize: MainAxisSize.min, children: [
                  Icon(Icons.chat_outlined, size: 18),
                  SizedBox(width: 6),
                  Text('Chat'),
                ]),
              ),
              Tab(
                child: Row(mainAxisSize: MainAxisSize.min, children: [
                  Icon(Icons.confirmation_number_outlined, size: 18),
                  SizedBox(width: 6),
                  Text('Ticket'),
                ]),
              ),
            ],
          ),
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _chatTab(),
          _ticketPlaceholder(),
        ],
      ),
    );
  }

  // ── Chat Tab ───────────────────────────────────────────────────────────
  Widget _chatTab() {
    return Column(
      children: [
        // Transcript area
        Expanded(
          child: _loadingHistory
              ? const Center(child: CircularProgressIndicator())
              : _messages.isEmpty
                  ? const Center(
                      child: Text('No messages in this session',
                          style: TextStyle(color: Color(0xFF9E9E9E), fontSize: 14)))
                  : _buildTranscript(),
        ),

        // Bottom action bar — exactly Image 2: New ticket | Email | Transcript
        _bottomActionBar(),
      ],
    );
  }

  Widget _buildTranscript() {
    final groups = _groupByDate(_messages);

    final List<Widget> items = [];
    for (final group in groups) {
      // Date separator (grey pill, Image 2)
      if (group.messages.isNotEmpty) {
        final label = _dateLabel(group.messages.first.timestamp);
        items.add(_dateSeparator(label));
      }

      // "Visitor navigated to X" at top if first system message says so
      for (final m in group.messages) {
        if (m.isSystemMsg) {
          items.add(_systemLine(m.content));
        } else {
          items.add(_bubble(m));
        }
      }
    }

    return ListView(
      controller: _scrollCtrl,
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
      children: items,
    );
  }

  // Date separator: grey rounded pill (Image 2: "WEDNESDAY, 8 APRIL")
  Widget _dateSeparator(String label) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 16),
      child: Center(
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 5),
          decoration: BoxDecoration(
            color: const Color(0xFF757575),
            borderRadius: BorderRadius.circular(20),
          ),
          child: Text(label,
              style: const TextStyle(
                  color: Colors.white, fontSize: 11,
                  fontWeight: FontWeight.w600, letterSpacing: 0.5)),
        ),
      ),
    );
  }

  // System line (e.g. "Visitor navigated to Meganar Technologies" — teal link)
  Widget _systemLine(String content) {
    // Parse "navigated to X" to make X teal (like Image 2)
    final parts = content.split(' ');
    final isNav = content.toLowerCase().contains('navigated to');

    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: isNav
          ? RichText(
              text: TextSpan(
                style: const TextStyle(fontSize: 13, color: Color(0xFF9E9E9E)),
                children: [
                  const TextSpan(text: 'Visitor navigated to '),
                  TextSpan(
                    text: parts.last,
                    style: const TextStyle(
                        color: Color(0xFF00897B), fontWeight: FontWeight.w500),
                  ),
                ],
              ),
            )
          : Text(
              content,
              style: const TextStyle(fontSize: 13, color: Color(0xFF9E9E9E)),
            ),
    );
  }

  // Chat bubble
  Widget _bubble(ChatMessage m) {
    // BOT messages appear on the left with grey avatar (Image 2 "Customer Support (System)")
    // AGENT messages appear on the right
    // USER messages appear on the left with their avatar

    final isAgent = m.isFromAgent;
    final isBot   = m.isFromBot;
    final isUser  = m.isFromUser || (!isAgent && !isBot);

    final timeStr = _fmtTime(m.timestamp);

    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Column(
        crossAxisAlignment: isAgent ? CrossAxisAlignment.end : CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: isAgent ? MainAxisAlignment.end : MainAxisAlignment.start,
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              // Left avatar (user or bot)
              if (!isAgent) ...[
                Container(
                  width: 32, height: 32,
                  decoration: BoxDecoration(
                    color: isBot ? const Color(0xFF9E9E9E) : const Color(0xFF7B3FE4),
                    shape: BoxShape.circle,
                  ),
                  child: Center(
                    child: Text(
                      isBot ? 'C' : (m.sender.isNotEmpty ? m.sender[0].toUpperCase() : 'V'),
                      style: const TextStyle(color: Colors.white,
                          fontSize: 13, fontWeight: FontWeight.w700),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
              ],

              // Bubble
              Flexible(
                child: Container(
                  constraints: BoxConstraints(
                      maxWidth: MediaQuery.of(context).size.width * 0.70),
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 11),
                  decoration: BoxDecoration(
                    color: isAgent
                        ? const Color(0xFF212121)   // dark — agent
                        : Colors.white,             // white — user/bot
                    borderRadius: BorderRadius.only(
                      topLeft:     const Radius.circular(14),
                      topRight:    const Radius.circular(14),
                      bottomLeft:  Radius.circular(isAgent ? 14 : 4),
                      bottomRight: Radius.circular(isAgent ? 4 : 14),
                    ),
                    boxShadow: const [
                      BoxShadow(color: Colors.black12, blurRadius: 2, offset: Offset(0, 1))
                    ],
                  ),
                  child: Text(
                    m.content,
                    style: TextStyle(
                      fontSize: 14,
                      color: isAgent ? Colors.white : const Color(0xFF212121),
                    ),
                  ),
                ),
              ),

              if (isAgent) const SizedBox(width: 8),
            ],
          ),

          // Sender label + time (Image 2: "Customer Support (System) - 10:43 AM")
          Padding(
            padding: EdgeInsets.only(
                top: 4,
                left: isAgent ? 0 : 40,
                right: isAgent ? 8 : 0),
            child: Text(
              isBot   ? 'Customer Support (System) · $timeStr'
              : isAgent ? '${m.sender} · $timeStr'
              : '${m.sender} · $timeStr',
              style: const TextStyle(fontSize: 11, color: Color(0xFF9E9E9E)),
            ),
          ),
        ],
      ),
    );
  }

  // Bottom action bar (Image 2: New ticket | Email | Transcript)
  Widget _bottomActionBar() {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: Color(0xFFEEEEEE))),
      ),
      padding: EdgeInsets.only(
        left: 16, right: 16, top: 12,
        bottom: 12 + MediaQuery.of(context).padding.bottom,
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          _actionBtn(
            icon: Icons.confirmation_number_outlined,
            label: 'New ticket',
            onTap: () => FloatingToast.show(context,
                message: 'Ticket creation coming soon'),
          ),
          Container(width: 1, height: 36, color: const Color(0xFFEEEEEE)),
          _actionBtn(
            icon: Icons.email_outlined,
            label: 'Email',
            onTap: () => _showEmailTranscript(),
          ),
          Container(width: 1, height: 36, color: const Color(0xFFEEEEEE)),
          _actionBtn(
            icon: Icons.receipt_long_outlined,
            label: 'Transcript',
            onTap: () => _showTranscriptSheet(),
          ),
        ],
      ),
    );
  }

  Widget _actionBtn({
    required IconData  icon,
    required String    label,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          Icon(icon, size: 22, color: const Color(0xFF9E9E9E)),
          const SizedBox(height: 4),
          Text(label, style: const TextStyle(fontSize: 12, color: Color(0xFF9E9E9E))),
        ]),
      ),
    );
  }

  // ── Ticket placeholder tab ─────────────────────────────────────────────
  Widget _ticketPlaceholder() {
    return Center(
      child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
        const Icon(Icons.confirmation_number_outlined,
            size: 56, color: Color(0xFFDDDDDD)),
        const SizedBox(height: 16),
        const Text('No tickets',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600,
                color: Color(0xFF424242))),
        const SizedBox(height: 8),
        const Text('Create a ticket from the Chat tab\nusing the action bar below.',
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 13, color: Color(0xFF9E9E9E))),
      ]),
    );
  }

  // ── More menu ──────────────────────────────────────────────────────────
  void _showMoreMenu() {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (_) => Padding(
        padding: const EdgeInsets.fromLTRB(0, 8, 0, 32),
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          Container(width: 36, height: 4,
              margin: const EdgeInsets.only(bottom: 12),
              decoration: BoxDecoration(color: const Color(0xFFDDDDDD),
                  borderRadius: BorderRadius.circular(2))),
          ListTile(
            leading: const Icon(Icons.info_outline, color: Color(0xFF424242)),
            title: const Text('Session Details'),
            onTap: () { Navigator.pop(context); _showSessionDetails(); },
          ),
          ListTile(
            leading: const Icon(Icons.receipt_long_outlined, color: Color(0xFF424242)),
            title: const Text('View Transcript'),
            onTap: () { Navigator.pop(context); _showTranscriptSheet(); },
          ),
          ListTile(
            leading: const Icon(Icons.email_outlined, color: Color(0xFF424242)),
            title: const Text('Email Transcript'),
            onTap: () { Navigator.pop(context); _showEmailTranscript(); },
          ),
        ]),
      ),
    );
  }

  // ── Session details sheet ──────────────────────────────────────────────
  void _showSessionDetails() {
    final s = widget.session;
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (_) => DraggableScrollableSheet(
        expand: false,
        initialChildSize: 0.55,
        maxChildSize: 0.85,
        builder: (_, ctrl) => Column(children: [
          Container(width: 36, height: 4,
              margin: const EdgeInsets.symmetric(vertical: 12),
              decoration: BoxDecoration(color: const Color(0xFFDDDDDD),
                  borderRadius: BorderRadius.circular(2))),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Row(children: [
              const Text('Visitor & Session Details',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700,
                      color: Color(0xFF212121))),
              const Spacer(),
              IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.pop(context)),
            ]),
          ),
          Expanded(
            child: ListView(controller: ctrl, padding: const EdgeInsets.all(20), children: [
              _detailSection('VISITOR', [
                _detailRow('Name',    s.username),
                _detailRow('Email',   s.userEmail ?? '—'),
              ]),
              const SizedBox(height: 16),
              _detailSection('SESSION', [
                _detailRow('Session ID', s.sessionId),
                _detailRow('Department', s.departmentId?.toString() ?? '—'),
                _detailRow('Agent',      s.adminEmail ?? 'Unassigned'),
                _detailRow('Status',
                    s.isActive ? 'Active' : s.isPending ? 'Pending' : 'Closed'),
                _detailRow('Created',    _fmtFull(s.timestamp)),
              ]),
            ]),
          ),
        ]),
      ),
    );
  }

  Widget _detailSection(String title, List<Widget> rows) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text(title, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700,
          color: Color(0xFF9E9E9E), letterSpacing: 0.8)),
      const SizedBox(height: 10),
      Container(
        decoration: BoxDecoration(color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: const Color(0xFFEEEEEE))),
        child: Column(children: rows),
      ),
    ]);
  }

  Widget _detailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(children: [
        Expanded(child: Text(label,
            style: const TextStyle(fontSize: 13, color: Color(0xFF9E9E9E)))),
        Expanded(child: Text(value,
            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600,
                color: Color(0xFF212121)),
            textAlign: TextAlign.right,
            maxLines: 2, overflow: TextOverflow.ellipsis)),
      ]),
    );
  }

  // ── Transcript sheet ───────────────────────────────────────────────────
  void _showTranscriptSheet() {
    final sb = StringBuffer();
    sb.writeln('Session: ${widget.session.sessionId}');
    sb.writeln('Visitor: ${widget.session.username}');
    sb.writeln('Email:   ${widget.session.userEmail ?? "—"}');
    sb.writeln('Agent:   ${widget.session.adminEmail ?? "Unassigned"}');
    sb.writeln('Date:    ${_fmtFull(widget.session.timestamp)}');
    sb.writeln('─' * 40);
    for (final m in _messages) {
      if (m.isSystemMsg) { sb.writeln('[${_fmtTime(m.timestamp)}] SYSTEM: ${m.content}'); continue; }
      final who = m.isFromAgent ? m.sender : m.isFromBot ? 'Bot' : m.sender;
      sb.writeln('[${_fmtTime(m.timestamp)}] $who: ${m.content}');
    }
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (_) => DraggableScrollableSheet(
        expand: false,
        initialChildSize: 0.7,
        maxChildSize: 0.95,
        builder: (_, ctrl) => Column(children: [
          Container(width: 36, height: 4,
              margin: const EdgeInsets.symmetric(vertical: 12),
              decoration: BoxDecoration(color: const Color(0xFFDDDDDD),
                  borderRadius: BorderRadius.circular(2))),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Row(children: [
              const Text('Transcript',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
              const Spacer(),
              IconButton(icon: const Icon(Icons.close),
                  onPressed: () => Navigator.pop(context)),
            ]),
          ),
          Expanded(
            child: SingleChildScrollView(
              controller: ctrl,
              padding: const EdgeInsets.all(20),
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                    color: const Color(0xFFF5F5F5),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: const Color(0xFFEEEEEE))),
                child: Text(sb.toString(),
                    style: const TextStyle(
                        fontFamily: 'monospace', fontSize: 12,
                        color: Color(0xFF424242), height: 1.6)),
              ),
            ),
          ),
        ]),
      ),
    );
  }

  // ── Email transcript ───────────────────────────────────────────────────
  void _showEmailTranscript() {
    final emailCtrl = TextEditingController(
        text: widget.session.userEmail ?? '');
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Email Transcript'),
        content: Column(mainAxisSize: MainAxisSize.min, children: [
          const Text('Send the chat transcript to:',
              style: TextStyle(fontSize: 13, color: Color(0xFF9E9E9E))),
          const SizedBox(height: 12),
          TextField(
            controller: emailCtrl,
            keyboardType: TextInputType.emailAddress,
            decoration: InputDecoration(
              hintText: 'visitor@email.com',
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
            ),
          ),
        ]),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context),
              child: const Text('Cancel', style: TextStyle(color: Color(0xFF9E9E9E)))),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              FloatingToast.show(context,
                  message: 'Transcript sent to ${emailCtrl.text}');
            },
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF00897B)),
            child: const Text('Send', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  // ── Helpers ────────────────────────────────────────────────────────────
  String _sessionChip(SessionDisplay s) {
    // e.g. "08.04.26 Hi · 2 messages" (Image 2)
    final ts = s.timestamp;
    String datePart = '';
    if (ts != null) {
      try {
        final dt = DateTime.parse(ts).toLocal();
        datePart = '${dt.day.toString().padLeft(2, '0')}.'
            '${dt.month.toString().padLeft(2, '0')}.'
            '${dt.year.toString().substring(2)} ';
      } catch (_) {}
    }
    final preview = s.lastMessage != null
        ? (s.lastMessage!.length > 10
            ? s.lastMessage!.substring(0, 10)
            : s.lastMessage!)
        : 'Chat';
    return '$datePart$preview  ·  messages ∨';
  }

  String _fmtTime(String ts) {
    try {
      final dt  = DateTime.parse(ts).toLocal();
      final h12 = dt.hour % 12 == 0 ? 12 : dt.hour % 12;
      final m   = dt.minute.toString().padLeft(2, '0');
      final p   = dt.hour < 12 ? 'AM' : 'PM';
      return '$h12:$m $p';
    } catch (_) { return ts; }
  }

  String _fmtFull(String? ts) {
    if (ts == null) return '—';
    try {
      final dt = DateTime.parse(ts).toLocal();
      return '${dt.day}/${dt.month}/${dt.year} ${_fmtTime(ts)}';
    } catch (_) { return ts; }
  }
}

// ── Message group ─────────────────────────────────────────────────────────────
class _MsgGroup {
  final String            dateKey;
  final List<ChatMessage> messages;
  _MsgGroup({required this.dateKey, required this.messages});
}

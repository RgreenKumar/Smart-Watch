// lib/features/dashboard/screens/active_chat_screen.dart
//
// UI CHANGES (per Images 1 & 3):
//   1. "Resolve" button REMOVED from AppBar — moved to ⋮ menu
//   2. Toolbar row (Quick, Note, Transfer) REMOVED from input bar
//   3. Those features moved to ⋮ menu  
//   4. Input bar now matches Image 3:
//        [📎 clip icon]  [Write a message...]  [➤ send]
//      Single rounded container, no separate toolbar row
//   5. Chat bubble layout matches Image 1:
//        Visitor messages: avatar on left, light pink bubble, time below
//        Agent messages: right-aligned purple bubble, avatar on right
//        System messages: grey pill in center

import 'dart:async';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import '../../../core/services/auth_store.dart';
import '../../../core/services/websocket_service.dart';
import '../../../core/widgets/floating_toast.dart';
import '../../chat_features/services/chat_features_service.dart';
import '../../chat_features/widgets/canned_responses_sheet.dart';
import '../../chat_features/widgets/chat_note_sheet.dart';
import '../../chat_features/widgets/transfer_sheet.dart';
import '../../chat_features/widgets/typing_indicator.dart';
import '../../chat_features/widgets/file_message_bubble.dart';
import '../../chats/services/chat_service.dart';

class ActiveChatScreen extends StatefulWidget {
  final SessionDisplay session;
  const ActiveChatScreen({super.key, required this.session});

  @override
  State<ActiveChatScreen> createState() => _ActiveChatScreenState();
}

class _ActiveChatScreenState extends State<ActiveChatScreen> {
  final _msgCtrl    = TextEditingController();
  final _scrollCtrl = ScrollController();
  int _tabIndex = 0; // 0 = Chat, 1 = Profile

  List<ChatMessage> _messages = [];
  bool _loadingHistory = true;
  bool _uploading      = false;
  bool _resolved       = false;
  String? _assignedTo;

  // Typing indicator
  bool   _visitorIsTyping = false;
  String _typingSender    = '';
  Timer? _typingTimer;

  // Canned responses (inline autocomplete on '/')
  List<CannedResponse> _canned         = [];
  bool                 _showCanned     = false;
  List<CannedResponse> _cannedFiltered = [];

  @override
  void initState() {
    super.initState();
    _assignedTo = widget.session.adminEmail;
    _loadHistory();
    _subscribeToSession();
    _subscribeToTyping();
    _loadCanned();
    _msgCtrl.addListener(_onTextChanged);
  }

  @override
  void dispose() {
    WebSocketService.instance.unsubscribeFromSession(widget.session.sessionId);
    WebSocketService.instance.unsubscribeTyping(widget.session.sessionId);
    _typingTimer?.cancel();
    _msgCtrl.removeListener(_onTextChanged);
    _msgCtrl.dispose();
    _scrollCtrl.dispose();
    super.dispose();
  }

  // ── Data loading ──────────────────────────────────────────────────────────

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

  Future<void> _loadCanned() async {
    try {
      final list = await ChatFeaturesService.instance.getCannedResponses();
      if (mounted) setState(() => _canned = list);
    } catch (_) {}
  }

  // ── Typing indicator ──────────────────────────────────────────────────────

  void _subscribeToTyping() {
    WebSocketService.instance.subscribeToTyping(
      widget.session.sessionId,
      (data) {
        if (!mounted) return;
        final sender   = data['sender']   as String? ?? '';
        final isTyping = data['isTyping'] as bool?   ?? false;
        if (sender == (AuthStore.instance.userEmail ?? '')) return;
        setState(() {
          _visitorIsTyping = isTyping;
          _typingSender    = sender;
        });
        _typingTimer?.cancel();
        if (isTyping) {
          _typingTimer = Timer(const Duration(seconds: 4), () {
            if (mounted) setState(() => _visitorIsTyping = false);
          });
        }
      },
    );
  }

  // ── Canned response autocomplete ──────────────────────────────────────────

  void _onTextChanged() {
    final text = _msgCtrl.text;
    if (text.startsWith('/') && _canned.isNotEmpty) {
      final filtered = ChatFeaturesService.instance
          .filterByQuery(_canned, text.substring(1));
      setState(() {
        _showCanned     = filtered.isNotEmpty;
        _cannedFiltered = filtered.take(4).toList();
      });
    } else {
      if (_showCanned) setState(() => _showCanned = false);
      // Send typing indicator
      final me = AuthStore.instance.userEmail ?? '';
      WebSocketService.instance.sendTyping(
        sessionId: widget.session.sessionId,
        sender:    me,
        isTyping:  text.isNotEmpty,
      );
    }
  }

  void _applyCanned(String message) {
    _msgCtrl.text = message;
    _msgCtrl.selection =
        TextSelection.fromPosition(TextPosition(offset: message.length));
    setState(() => _showCanned = false);
  }

  // ── WebSocket subscription ────────────────────────────────────────────────

  void _subscribeToSession() {
    WebSocketService.instance.subscribeToSession(
      widget.session.sessionId,
      (msg) {
        if (!mounted) return;
        final me   = AuthStore.instance.userEmail ?? '';
        final role = msg['role'] as String? ?? 'BOT';
        // Skip echo of own agent messages
        if (role == 'AGENT' && (msg['sender'] as String?) == me) return;
        setState(() => _messages.add(ChatMessage(
          sessionId: widget.session.sessionId,
          sender:    msg['sender']    as String? ?? '',
          content:   msg['content']   as String? ?? '',
          role:      role,
          timestamp: msg['timestamp'] as String? ?? DateTime.now().toIso8601String(),
        )));
        _scrollToBottom();
      },
    );
  }

  // ── Send text ─────────────────────────────────────────────────────────────

  void _send() {
    final text = _msgCtrl.text.trim();
    if (text.isEmpty || _resolved) return;
    final me = AuthStore.instance.userEmail ?? '';

    setState(() {
      _messages.add(ChatMessage(
        sessionId: widget.session.sessionId,
        sender:    me,
        content:   text,
        role:      'AGENT',
        timestamp: DateTime.now().toIso8601String(),
      ));
      _showCanned = false;
    });
    _msgCtrl.clear();
    _scrollToBottom();

    WebSocketService.instance.sendMessage(
      sessionId: widget.session.sessionId,
      sender:    me,
      content:   text,
      role:      'AGENT',
    );
    WebSocketService.instance.sendTyping(
      sessionId: widget.session.sessionId,
      sender:    me,
      isTyping:  false,
    );
  }

  // ── File upload ───────────────────────────────────────────────────────────

  Future<void> _pickAndSendFile() async {
    final result = await FilePicker.platform.pickFiles(withData: true);
    if (result == null || result.files.isEmpty) return;
    final pf = result.files.first;
    if (pf.bytes == null) return;

    setState(() => _uploading = true);
    try {
      final uploaded =
          await ChatFeaturesService.instance.uploadFile(pf.bytes!, pf.name);
      final content  = buildFileMessageContent(uploaded);
      final me       = AuthStore.instance.userEmail ?? '';

      setState(() => _messages.add(ChatMessage(
        sessionId: widget.session.sessionId,
        sender:    me,
        content:   content,
        role:      'AGENT',
        timestamp: DateTime.now().toIso8601String(),
      )));
      _scrollToBottom();

      WebSocketService.instance.sendMessage(
        sessionId: widget.session.sessionId,
        sender:    me,
        content:   content,
        role:      'AGENT',
      );
    } catch (e) {
      if (mounted) FloatingToast.show(context, message: 'Upload failed: $e');
    } finally {
      if (mounted) setState(() => _uploading = false);
    }
  }

  void _scrollToBottom() {
    Future.delayed(const Duration(milliseconds: 80), () {
      if (_scrollCtrl.hasClients) {
        _scrollCtrl.animateTo(
          _scrollCtrl.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  // ── Resolve (called from ⋮ menu only) ────────────────────────────────────

  void _showResolveDialog() {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Resolve Chat'),
        content: const Text(
            'Mark as resolved? The visitor\'s session continues — '
            'any new message opens a fresh Unanswered chat.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel',
                style: TextStyle(color: Color(0xFF9E9E9E)))),
          TextButton(
            onPressed: () async {
              Navigator.pop(context);
              try {
                await ChatService.instance.resolveSession(widget.session.sessionId);
              } catch (_) {}
              if (mounted) {
                setState(() => _resolved = true);
                Navigator.pop(context); // leave chat screen → back to Dashboard
              }
            },
            child: const Text('Resolve',
                style: TextStyle(color: Color(0xFF00897B),
                    fontWeight: FontWeight.w700)),
          ),
        ],
      ),
    );
  }

  // _showMoreMenu replaced by _MoreMenuButton widget below

  // ════════════════════════════════════════════════════════════════════════
  // BUILD
  // ════════════════════════════════════════════════════════════════════════

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        surfaceTintColor: Colors.transparent,
        // ── Back arrow ───────────────────────────────────────────────────
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded,
              size: 20, color: Color(0xFF424242)),
          onPressed: () => Navigator.pop(context),
        ),
        // ── Visitor avatar + name + status ───────────────────────────────
        title: Row(children: [
          _avatarCircle(widget.session.username, 20),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  widget.session.username,
                  style: const TextStyle(
                      fontSize: 15, fontWeight: FontWeight.w700,
                      color: Color(0xFF212121)),
                  overflow: TextOverflow.ellipsis,
                ),
                Text(
                  _resolved ? '✓ Resolved'
                      : _visitorIsTyping ? '✏ typing…'
                      : 'Live',
                  style: TextStyle(
                    fontSize: 12, fontWeight: FontWeight.w600,
                    color: _resolved
                        ? const Color(0xFF9E9E9E)
                        : _visitorIsTyping
                            ? const Color(0xFF7B3FE4)
                            : const Color(0xFF22C55E),
                  ),
                ),
              ],
            ),
          ),
        ]),
        // ── Actions: ⋮ dropdown first, then bottom sheet per item ──────
        actions: [
          _MoreMenuButton(
            resolved: _resolved,
            onQuickReplies: () => showModalBottomSheet(
              context: context,
              isScrollControlled: true,
              backgroundColor: Colors.transparent,
              builder: (_) => CannedResponseSheet(
                responses: _canned,
                initialQuery: '',
                onSelect: _applyCanned,
              ),
            ),
            onAddNote: () => showModalBottomSheet(
              context: context,
              isScrollControlled: true,
              backgroundColor: Colors.transparent,
              builder: (_) => ChatNoteSheet(sessionId: widget.session.sessionId),
            ),
            onTransfer: () => showModalBottomSheet(
              context: context,
              isScrollControlled: true,
              backgroundColor: Colors.transparent,
              builder: (_) => TransferSheet(
                sessionId:    widget.session.sessionId,
                visitorName:  widget.session.username,
                onTransferred: () => Navigator.pop(context),
              ),
            ),
            onResolve: _showResolveDialog,
          ),
        ],
        // ── Chat | Profile tabs ──────────────────────────────────────────
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(46),
          child: Row(children: [
            _tab(0, 'Chat'),
            _tab(1, 'Profile'),
          ]),
        ),
      ),
      body: _tabIndex == 0 ? _chatView() : _profileView(),
    );
  }

  // ── Tab header ────────────────────────────────────────────────────────────

  Widget _tab(int idx, String label) {
    final sel = _tabIndex == idx;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _tabIndex = idx),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            border: Border(
              bottom: BorderSide(
                color: sel ? const Color(0xFF212121) : Colors.transparent,
                width: 2.5,
              ),
            ),
          ),
          child: Center(
            child: Text(label,
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: sel ? FontWeight.w700 : FontWeight.w400,
                  color: sel
                      ? const Color(0xFF212121)
                      : const Color(0xFF9E9E9E),
                )),
          ),
        ),
      ),
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  // CHAT VIEW
  // ════════════════════════════════════════════════════════════════════════

  Widget _chatView() {
    final me = AuthStore.instance.userEmail ?? '';

    return Column(
      children: [
        // Assignment banner
        Container(
          padding: const EdgeInsets.symmetric(vertical: 8),
          color: const Color(0xFFF3F4F6),
          child: Row(children: [
            const Expanded(child: Divider(indent: 16)),
            const SizedBox(width: 8),
            Text(
              _resolved
                  ? '→ Resolved'
                  : '→ ${_assignedTo == me ? 'Assigned to You' : 'Assigned to ${_assignedTo ?? 'Agent'}'}',
              style: const TextStyle(
                  fontSize: 12, color: Color(0xFF9E9E9E),
                  fontWeight: FontWeight.w500),
            ),
            const SizedBox(width: 8),
            const Expanded(child: Divider(endIndent: 16)),
          ]),
        ),

        // Messages list
        Expanded(
          child: _loadingHistory
              ? const Center(child: CircularProgressIndicator())
              : Stack(children: [
                  ListView.builder(
                    controller: _scrollCtrl,
                    padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
                    physics: const ClampingScrollPhysics(),
                    itemCount: _messages.length + (_visitorIsTyping ? 1 : 0),
                    itemBuilder: (_, i) {
                      if (_visitorIsTyping && i == _messages.length) {
                        return TypingIndicator(senderName: _typingSender);
                      }
                      return _Bubble(msg: _messages[i], agentEmail: me);
                    },
                  ),
                  if (_uploading)
                    Container(
                      color: Colors.black.withOpacity(0.15),
                      child: const Center(
                        child: Card(
                          child: Padding(
                            padding: EdgeInsets.all(24),
                            child: Column(mainAxisSize: MainAxisSize.min, children: [
                              CircularProgressIndicator(),
                              SizedBox(height: 12),
                              Text('Uploading…'),
                            ]),
                          ),
                        ),
                      ),
                    ),
                ]),
        ),

        // Canned inline suggestions (shown when typing '/')
        if (_showCanned) _cannedSuggestions(),

        // Input bar or resolved banner
        _resolved ? _resolvedBanner() : _inputBar(),
      ],
    );
  }

  // Canned suggestions strip
  Widget _cannedSuggestions() {
    return Container(
      color: Colors.white,
      constraints: const BoxConstraints(maxHeight: 180),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 4),
            child: Row(children: const [
              Icon(Icons.bolt_rounded, color: Color(0xFF7B3FE4), size: 15),
              SizedBox(width: 4),
              Text('Quick Replies',
                  style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600,
                      color: Color(0xFF7B3FE4))),
            ]),
          ),
          ..._cannedFiltered.map((cr) => InkWell(
            onTap: () => _applyCanned(cr.message),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Row(children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: const Color(0xFF7B3FE4).withOpacity(0.1),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(cr.shortcut,
                      style: const TextStyle(fontSize: 11,
                          fontWeight: FontWeight.w700, color: Color(0xFF7B3FE4))),
                ),
                const SizedBox(width: 10),
                Expanded(
                    child: Text(cr.message,
                        style: const TextStyle(fontSize: 13, color: Color(0xFF424242)),
                        maxLines: 1, overflow: TextOverflow.ellipsis)),
              ]),
            ),
          )),
          const Divider(height: 1),
        ],
      ),
    );
  }

  // ── Input bar — matches Image 3 exactly ───────────────────────────────────
  // [📎]  [Write a message... (text field)]  [➤]
  Widget _inputBar() {
    return SafeArea(
      child: Container(
        padding: const EdgeInsets.fromLTRB(12, 8, 12, 12),
        color: Colors.white,
        child: Container(
          decoration: BoxDecoration(
            color: const Color(0xFFF3F4F6),
            borderRadius: BorderRadius.circular(28),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              // 📎 Attachment icon (matches Image 3 style)
              GestureDetector(
                onTap: _pickAndSendFile,
                child: Padding(
                  padding: const EdgeInsets.only(left: 14, bottom: 12, right: 4, top: 12),
                  child: const Icon(Icons.attach_file_rounded,
                      color: Color(0xFF9E9E9E), size: 22),
                ),
              ),

              // Text input
              Expanded(
                child: TextField(
                  controller: _msgCtrl,
                  minLines: 1,
                  maxLines: 5,
                  style: const TextStyle(fontSize: 15, color: Color(0xFF212121)),
                  decoration: const InputDecoration(
                    hintText: 'Write a message…',
                    hintStyle: TextStyle(color: Color(0xFF9E9E9E), fontSize: 15),
                    border: InputBorder.none,
                    isDense: true,
                    contentPadding: EdgeInsets.symmetric(vertical: 12, horizontal: 4),
                  ),
                  textInputAction: TextInputAction.send,
                  onSubmitted: (_) => _send(),
                ),
              ),

              // ➤ Send button
              GestureDetector(
                onTap: _send,
                child: Padding(
                  padding: const EdgeInsets.only(right: 6, bottom: 6, top: 6),
                  child: Container(
                    width: 40, height: 40,
                    decoration: const BoxDecoration(
                      color: Color(0xFF7B3FE4),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.send_rounded,
                        color: Colors.white, size: 18),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _resolvedBanner() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      color: const Color(0xFFF3F4F6),
      child: const Text(
        '✓ This conversation has been resolved.',
        textAlign: TextAlign.center,
        style: TextStyle(fontSize: 13, color: Color(0xFF9E9E9E)),
      ),
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  // PROFILE VIEW
  // ════════════════════════════════════════════════════════════════════════

  Widget _profileView() {
    final me = AuthStore.instance.userEmail ?? '';
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(children: [
        const SizedBox(height: 12),
        _avatarCircle(widget.session.username, 48),
        const SizedBox(height: 16),
        Text(widget.session.username,
            style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w700,
                color: Color(0xFF212121)),
            textAlign: TextAlign.center),
        if (widget.session.userEmail != null)
          Text(widget.session.userEmail!,
              style: const TextStyle(fontSize: 14, color: Color(0xFF9E9E9E)),
              textAlign: TextAlign.center),
        const SizedBox(height: 24),
        Container(
          width: double.infinity, padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: const Color(0xFFFFEAEA),
            borderRadius: BorderRadius.circular(12)),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            _ir('Email',       widget.session.userEmail ?? '—'),
            const Divider(height: 20),
            _ir('Session',     widget.session.sessionId),
            const Divider(height: 20),
            _ir('Status',      _resolved ? 'Resolved' : 'Live'),
            const Divider(height: 20),
            _ir('Assigned to',
                _assignedTo == me ? 'You' : (_assignedTo ?? 'Unassigned')),
          ]),
        ),
      ]),
    );
  }

  Widget _ir(String l, String v) => Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Text(l, style: const TextStyle(fontSize: 12, color: Color(0xFF9E9E9E))),
      const SizedBox(height: 4),
      Text(v, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600,
          color: Color(0xFF212121))),
    ],
  );

  // ── Avatar helper ─────────────────────────────────────────────────────────

  Widget _avatarCircle(String label, double radius) {
    final colors = [
      const Color(0xFF7B3FE4), const Color(0xFF1E88E5),
      const Color(0xFF00897B), const Color(0xFFE53935),
    ];
    final color = label.isNotEmpty
        ? colors[label.codeUnitAt(0) % colors.length]
        : colors[0];
    return Container(
      width: radius * 2, height: radius * 2,
      decoration: BoxDecoration(color: color, shape: BoxShape.circle),
      child: Center(child: Text(
        label.isNotEmpty ? label[0].toUpperCase() : '?',
        style: TextStyle(color: Colors.white,
            fontSize: radius * 0.8, fontWeight: FontWeight.w700),
      )),
    );
  }
}

// ════════════════════════════════════════════════════════════════════════════
// ⋮ More Menu Button
// ════════════════════════════════════════════════════════════════════════════
//
// BEHAVIOR (Problem 2 fix):
//   1st click → shows a compact dropdown popup (like Image 5)
//              4 plain text options: Quick Replies | Add Note | Transfer Chat | Resolve Chat
//   Tap an option → closes dropdown, opens the relevant bottom sheet
//
// This matches Image 5 exactly: plain list in a rounded floating card,
// no icons, no subtitles — just tap-to-open labels.

class _MoreMenuButton extends StatelessWidget {
  final bool         resolved;
  final VoidCallback onQuickReplies;
  final VoidCallback onAddNote;
  final VoidCallback onTransfer;
  final VoidCallback onResolve;

  const _MoreMenuButton({
    required this.resolved,
    required this.onQuickReplies,
    required this.onAddNote,
    required this.onTransfer,
    required this.onResolve,
  });

  @override
  Widget build(BuildContext context) {
    return PopupMenuButton<String>(
      icon: const Icon(Icons.more_vert, color: Color(0xFF424242)),
      // Dropdown appears below the icon, right-aligned (like Image 5)
      offset: const Offset(0, 8),
      color: Colors.white,
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      itemBuilder: (_) => [
        _item('quick', 'Quick Replies'),
        _item('note',  'Add Note'),
        _item('transfer', 'Transfer Chat'),
        if (!resolved) _divider(),
        if (!resolved) _item('resolve', 'Resolve Chat'),
      ],
      onSelected: (value) {
        // Small delay so the dropdown closes cleanly before the sheet opens
        Future.microtask(() {
          switch (value) {
            case 'quick':    onQuickReplies(); break;
            case 'note':     onAddNote();      break;
            case 'transfer': onTransfer();     break;
            case 'resolve':  onResolve();      break;
          }
        });
      },
    );
  }

  PopupMenuItem<String> _item(String value, String label) {
    return PopupMenuItem<String>(
      value: value,
      height: 44,
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.w400,
          color: value == 'resolve'
              ? const Color(0xFF00897B)  // teal for Resolve
              : const Color(0xFF212121),
        ),
      ),
    );
  }

  PopupMenuDivider _divider() => const PopupMenuDivider(height: 1);
}

// ════════════════════════════════════════════════════════════════════════════
// Message Bubble — matches Image 1 layout
// ════════════════════════════════════════════════════════════════════════════

class _Bubble extends StatelessWidget {
  final ChatMessage msg;
  final String      agentEmail;
  const _Bubble({required this.msg, required this.agentEmail});

  bool get _isAgent => msg.role == 'AGENT' || msg.sender == agentEmail;

  @override
  Widget build(BuildContext context) {
    // System message → grey pill centered
    if (msg.isSystemMsg) {
      return Padding(
        padding: const EdgeInsets.symmetric(vertical: 10),
        child: Center(
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
            decoration: BoxDecoration(
              color: const Color(0xFFEEEEEE),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(msg.content,
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 12, color: Color(0xFF616161))),
          ),
        ),
      );
    }

    final isFile = isFileMessage(msg.content);
    final time   = _fmtTime(msg.timestamp);

    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Column(
        crossAxisAlignment:
            _isAgent ? CrossAxisAlignment.end : CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment:
                _isAgent ? MainAxisAlignment.end : MainAxisAlignment.start,
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              // Visitor/Bot avatar on the left
              if (!_isAgent) ...[
                _avatarSmall(msg.sender),
                const SizedBox(width: 8),
              ],

              // Bubble
              ConstrainedBox(
                constraints: BoxConstraints(
                    maxWidth: MediaQuery.of(context).size.width * 0.70),
                child: isFile
                    ? ClipRRect(
                        borderRadius: _radius(),
                        child: FileBubble(content: msg.content, isAgent: _isAgent),
                      )
                    : Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 14, vertical: 11),
                        decoration: BoxDecoration(
                          // Agent: purple (primary)  |  Visitor: light pink
                          color: _isAgent
                              ? const Color(0xFF7B3FE4)
                              : const Color(0xFFFFEAEA),
                          borderRadius: _radius(),
                        ),
                        child: Text(msg.content,
                            style: TextStyle(
                              fontSize: 14,
                              color: _isAgent
                                  ? Colors.white
                                  : const Color(0xFF212121),
                            )),
                      ),
              ),

              // Agent avatar on the right
              if (_isAgent) ...[
                const SizedBox(width: 8),
                _avatarSmall(msg.sender),
              ],
            ],
          ),

          // Timestamp below bubble, matching Image 1
          Padding(
            padding: EdgeInsets.only(
                top: 4,
                left: _isAgent ? 0 : 40,
                right: _isAgent ? 40 : 0),
            child: Text(time,
                style: const TextStyle(
                    fontSize: 11, color: Color(0xFF9E9E9E))),
          ),
        ],
      ),
    );
  }

  BorderRadius _radius() => BorderRadius.only(
        topLeft:     const Radius.circular(14),
        topRight:    const Radius.circular(14),
        bottomLeft:  Radius.circular(_isAgent ? 14 : 4),
        bottomRight: Radius.circular(_isAgent ? 4 : 14),
      );

  Widget _avatarSmall(String label) {
    final colors = [
      const Color(0xFF7B3FE4), const Color(0xFF1E88E5),
      const Color(0xFF00897B),
    ];
    final l = label.isNotEmpty ? label : 'V';
    final c = colors[l.codeUnitAt(0) % colors.length];
    return Container(
      width: 28, height: 28,
      decoration: BoxDecoration(color: c, shape: BoxShape.circle),
      child: Center(child: Text(
        l[0].toUpperCase(),
        style: const TextStyle(color: Colors.white, fontSize: 12,
            fontWeight: FontWeight.w700),
      )),
    );
  }

  String _fmtTime(String ts) {
    try {
      final dt  = DateTime.parse(ts).toLocal();
      final h12 = dt.hour % 12 == 0 ? 12 : dt.hour % 12;
      final m   = dt.minute.toString().padLeft(2, '0');
      final p   = dt.hour < 12 ? 'am' : 'pm';
      return '$h12:$m$p';
    } catch (_) { return ts; }
  }
}

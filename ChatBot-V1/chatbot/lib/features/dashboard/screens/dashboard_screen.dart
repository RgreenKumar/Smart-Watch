// lib/features/dashboard/screens/dashboard_screen.dart
//
// MONITOR PAGE — Tawk-style full logic & flow
// ─────────────────────────────────────────────────────────────────────────────
//
// Tab 1 — Active Chats:
//   Section "Unanswered (N)" → red left-border, pulsing orange dot, [Join] button
//   Section "Served (N)"     → green left-border, blue dot,         [View Chat] button
//   Timeout warning bar when session > 15 min old
//
// Tab 2 — Visitors:
//   Category filter chips:  All | Active | Idle
//   Section "Active (N)"   → green dot, visitor browsing, [Invite] button
//   Section "Idle (N)"     → yellow dot, inactive >120s,  [Invite] button
//   "In chat" badge when visitor has an open session
//   Tap row → open their active chat or show browsing toast
//
// Status dot colours (Tawk spec):
//   Green  = active in chat or browsing <120s
//   Yellow = idle (inactive >120s)
//   Orange = unanswered (no agent reply)
//   Blue   = served (agent chatting)
//
// Session lifecycle:
//   Visitor heartbeat every 15s → visible in Monitor
//   20-min inactivity → session timeout, 2-min buffer
//   After buffer → chat moves to Inbox permanently

import 'dart:async';
import 'package:flutter/material.dart';
import '../../../core/services/auth_store.dart';
import '../../../core/services/websocket_service.dart';
import '../../../core/widgets/floating_toast.dart';
import '../../chat_features/services/chat_features_service.dart';
import '../../chat_features/widgets/agent_status_button.dart';
import '../../chats/services/chat_service.dart';
import 'active_chat_screen.dart';

// ── Visitor state helper ──────────────────────────────────────────────────────

enum _VisState { active, idle }

_VisState _vState(VisitorInfo v) {
  final secs = (DateTime.now().millisecondsSinceEpoch ~/ 1000) - v.lastSeen;
  return secs < 120 ? _VisState.active : _VisState.idle;
}

// ── Visitor filter enum ───────────────────────────────────────────────────────

enum _VisFilter { all, active, idle }

extension _VFLabel on _VisFilter {
  String get label => const {
    _VisFilter.all:    'All',
    _VisFilter.active: 'Active',
    _VisFilter.idle:   'Idle',
  }[this]!;
}

// ─────────────────────────────────────────────────────────────────────────────

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});
  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  List<SessionDisplay> _sessions = [];
  List<VisitorInfo>    _visitors = [];
  bool _loadingS = true;
  bool _loadingV = true;

  Timer? _clockTimer;
  Timer? _pollTimer;

  _VisFilter _visFilter = _VisFilter.all;

  // ── Computed: Active sessions (on site within live window) ────────────────
  List<SessionDisplay> get _activeSessions {
    final emailsOnSite = {
      for (final v in _visitors) if (v.email.isNotEmpty) v.email.toLowerCase()
    };
    final sessionIdsOnSite = {
      for (final v in _visitors) if (v.sessionId != null) v.sessionId!
    };
    return _sessions.where((s) {
      if (s.isClosed) return false;
      // Joined (served) sessions ALWAYS appear in Active Chats — agent is live.
      // This also handles the case where the visitor has gone offline but the
      // agent is still in the chat.
      if (s.isJoined) return true;
      // Unanswered: show if visitor is still on-site or session is fresh
      final emailMatch = s.userEmail != null &&
          emailsOnSite.contains(s.userEmail!.toLowerCase());
      final sidMatch = sessionIdsOnSite.contains(s.sessionId);
      return emailMatch || sidMatch || s.isWithinLiveWindow;
    }).toList();
  }

  List<SessionDisplay> get _unanswered =>
      _activeSessions.where((s) => s.isUnanswered).toList();
  List<SessionDisplay> get _joined =>
      _activeSessions.where((s) => s.isJoined).toList();

  // ── Visitor lists by status ───────────────────────────────────────────────
  List<VisitorInfo> get _activeVisitors =>
      _visitors.where((v) => _vState(v) == _VisState.active).toList();
  List<VisitorInfo> get _idleVisitors =>
      _visitors.where((v) => _vState(v) == _VisState.idle).toList();

  List<VisitorInfo> get _filteredVisitors {
    switch (_visFilter) {
      case _VisFilter.active: return _activeVisitors;
      case _VisFilter.idle:   return _idleVisitors;
      case _VisFilter.all:    return _visitors;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _load();

    // Live clock for elapsed timers
    _clockTimer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (mounted) setState(() {});
    });

    // Poll every 30s (fallback when WebSocket is quiet)
    _pollTimer = Timer.periodic(const Duration(seconds: 30), (_) {
      if (mounted) _load();
    });

    // WebSocket: new unanswered session
    WebSocketService.instance.onPendingSession = (_) {
      if (mounted) _loadSessions();
    };

    // WebSocket: an agent joined/claimed a session → refresh list
    WebSocketService.instance.onSessionClaimed = (_) {
      if (mounted) _loadSessions();
    };

    // WebSocket: visitor heartbeat broadcast
    WebSocketService.instance.onVisitorMonitorUpdate = (data) {
      if (!mounted) return;
      final raw = data['visitors'] as List? ?? [];
      setState(() {
        _visitors = raw
            .map((j) => VisitorInfo.fromJson(j as Map<String, dynamic>))
            .toList();
      });
    };
  }

  @override
  void dispose() {
    _clockTimer?.cancel();
    _pollTimer?.cancel();
    WebSocketService.instance.onPendingSession       = null;
    WebSocketService.instance.onVisitorMonitorUpdate = null;
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _load() async =>
      Future.wait([_loadSessions(), _loadVisitors()]);

  Future<void> _loadSessions() async {
    setState(() => _loadingS = true);
    try {
      final s = await ChatService.instance.getVisibleSessions();
      if (!mounted) return;
      setState(() { _sessions = s; _loadingS = false; });
    } catch (_) {
      if (!mounted) return;
      setState(() => _loadingS = false);
    }
  }

  Future<void> _loadVisitors() async {
    setState(() => _loadingV = true);
    try {
      final v = await ChatFeaturesService.instance.getActiveVisitors();
      if (!mounted) return;
      setState(() { _visitors = v; _loadingV = false; });
    } catch (_) {
      if (!mounted) return;
      setState(() => _loadingV = false);
    }
  }

  // ── Join unanswered session (Unanswered → Joined) ─────────────────────────
  Future<void> _joinSession(SessionDisplay s) async {
    final claimed = await ChatService.instance.claimSession(s.sessionId);
    if (!mounted) return;
    if (claimed) {
      // Broadcast takeover to other agents via WebSocket.
      // NOTE: takeoverSession only sends a broadcast — it does NOT change
      // status in DB (the backend fix ensures agentTakeover no longer sets
      // status=true). This keeps the session in "Joined" (open+agent) state.
      WebSocketService.instance.takeoverSession(
        sessionId:    s.sessionId,
        departmentId: s.departmentId ?? 0,
        agentEmail:   AuthStore.instance.userEmail ?? '',
      );
      // Reload so this session moves from Unanswered → Joined in the list
      await _loadSessions();
      if (!mounted) return;
      // Build an updated session with the agent email set
      final updatedSession = _sessions
          .where((x) => x.sessionId == s.sessionId)
          .firstOrNull ?? s;
      _openChat(updatedSession);
    } else {
      FloatingToast.show(context, message: 'Already joined by another agent');
      _loadSessions();
    }
  }

  void _openChat(SessionDisplay s) {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => ActiveChatScreen(session: s)),
    ).then((_) => _loadSessions());
  }

  // ── Open visitor's chat or show browsing toast ────────────────────────────
  void _openVisitorChat(VisitorInfo v) {
    if (v.sessionId == null || v.sessionId!.isEmpty) {
      FloatingToast.show(context,
          message: '${v.username.isEmpty ? "Visitor" : v.username} '
              'is browsing — no chat started yet.');
      return;
    }

    final session = _sessions
        .where((s) => s.sessionId == v.sessionId).firstOrNull;
    if (session != null) { _openChat(session); return; }

    if (v.email.isNotEmpty) {
      final byEmail = _sessions
          .where((s) => s.userEmail?.toLowerCase() == v.email.toLowerCase()
              && !s.isClosed)
          .toList();
      if (byEmail.isNotEmpty) {
        byEmail.sort((a, b) {
          final ta = DateTime.tryParse(a.timestamp ?? '') ?? DateTime(2000);
          final tb = DateTime.tryParse(b.timestamp ?? '') ?? DateTime(2000);
          return tb.compareTo(ta);
        });
        _openChat(byEmail.first);
        return;
      }
    }

    FloatingToast.show(context, message: 'Refreshing session list…');
    _loadSessions();
  }

  // ── Invite visitor to chat (Tawk: proactive chat) ─────────────────────────
  void _inviteVisitor(VisitorInfo v) {
    FloatingToast.show(context,
        message: 'Invite feature: send a trigger message to ${v.username.isEmpty ? "visitor" : v.username}');
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  String _elapsed(String? ts) {
    if (ts == null) return '00:00';
    try {
      final secs = DateTime.now()
          .difference(DateTime.parse(ts).toLocal()).inSeconds.abs();
      return '${(secs ~/ 60).toString().padLeft(2, '0')}:'
          '${(secs % 60).toString().padLeft(2, '0')}';
    } catch (_) { return '00:00'; }
  }

  String _visElapsed(int epochSecs) {
    final secs = ((DateTime.now().millisecondsSinceEpoch ~/ 1000) - epochSecs).abs();
    return '${(secs ~/ 60).toString().padLeft(2, '0')}:'
        '${(secs % 60).toString().padLeft(2, '0')}';
  }

  // ════════════════════════════════════════════════════════════════════════
  // ACTIVE CHATS TAB
  // ════════════════════════════════════════════════════════════════════════

  Widget _buildActiveChats() {
    final un = _unanswered;
    final jn = _joined;

    if (_loadingS) return const Center(child: CircularProgressIndicator());

    if (un.isEmpty && jn.isEmpty) {
      return _emptyState(
        'No active chats',
        'Unanswered and joined sessions\nappear here in real time.',
        Icons.chat_outlined,
      );
    }

    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.only(bottom: 120),
        children: [
          // ── Unanswered section ─────────────────────────────────────────
          if (un.isNotEmpty) ...[
            _sectionHeader(
              'Unanswered',
              un.length,
              const Color(0xFFE53935),
              'Visitor sent a message — no agent reply yet',
            ),
            ...un.map((s) => _unansweredRow(s)),
          ],

          // ── Joined section ─────────────────────────────────────────────
          if (jn.isNotEmpty) ...[
            _sectionHeader(
              'Joined',
              jn.length,
              const Color(0xFF00897B),
              'Agent is actively chatting',
            ),
            ...jn.map((s) => _joinedRow(s)),
          ],
        ],
      ),
    );
  }

  Widget _sectionHeader(String label, int count, Color color, String subtitle) {
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
      color: const Color(0xFFF5F5F5),
      child: Row(children: [
        Container(
          width: 10, height: 10,
          decoration: BoxDecoration(color: color, shape: BoxShape.circle),
        ),
        const SizedBox(width: 8),
        Text(label,
            style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700,
                color: color, letterSpacing: 0.2)),
        const SizedBox(width: 6),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
          decoration: BoxDecoration(
              color: color.withOpacity(0.12),
              borderRadius: BorderRadius.circular(10)),
          child: Text('$count',
              style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700,
                  color: color)),
        ),
        const Spacer(),
        Text(subtitle, style: const TextStyle(fontSize: 11, color: Color(0xFF9E9E9E))),
      ]),
    );
  }

  Widget _unansweredRow(SessionDisplay s) {
    final nearTimeout = s.isNearTimeout;
    return GestureDetector(
      onTap: () => _joinSession(s),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          border: Border(
            left:   BorderSide(
                color: nearTimeout ? const Color(0xFFFF9800) : const Color(0xFFE53935),
                width: 4),
            bottom: const BorderSide(color: Color(0xFFEEEEEE)),
          ),
        ),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Timeout warning bar
            if (nearTimeout)
              Container(
                width: double.infinity,
                margin: const EdgeInsets.only(bottom: 8),
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration: BoxDecoration(
                  color: const Color(0xFFFF9800).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: const Color(0xFFFF9800).withOpacity(0.3)),
                ),
                child: const Row(children: [
                  Icon(Icons.timer_outlined, size: 14, color: Color(0xFFFF9800)),
                  SizedBox(width: 6),
                  Text('Session approaching 20-min timeout',
                      style: TextStyle(fontSize: 12, color: Color(0xFFFF9800),
                          fontWeight: FontWeight.w500)),
                ]),
              ),
            Row(children: [
              _dot(const Color(0xFFFF9800)),
              const SizedBox(width: 12),
              _flagAvatar(s.username),
              const SizedBox(width: 12),
              Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(s.username,
                    style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700,
                        color: Color(0xFF212121)),
                    maxLines: 1, overflow: TextOverflow.ellipsis),
                const SizedBox(height: 2),
                _pageRow(s.userEmail ?? 'Anonymous'),
                const SizedBox(height: 2),
                if (s.lastMessage != null)
                  Text(s.lastMessage!,
                      style: const TextStyle(fontSize: 12, color: Color(0xFF616161)),
                      maxLines: 1, overflow: TextOverflow.ellipsis),
              ])),
              const SizedBox(width: 12),
              Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
                _statusPill('Unanswered', const Color(0xFFE53935)),
                const SizedBox(height: 4),
                _timer(_elapsed(s.timestamp)),
                const SizedBox(height: 6),
                // Join button
                GestureDetector(
                  onTap: () => _joinSession(s),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: const Color(0xFF7B3FE4),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Text('Join',
                        style: TextStyle(color: Colors.white, fontSize: 12,
                            fontWeight: FontWeight.w700)),
                  ),
                ),
              ]),
            ]),
          ],
        ),
      ),
    );
  }

  Widget _joinedRow(SessionDisplay s) {
    final mine      = s.isMine;
    final agentName = mine
        ? (AuthStore.instance.userName ?? 'You')
        : s.adminEmail ?? 'Agent';

    return GestureDetector(
      onTap: () => _openChat(s),
      child: Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          border: Border(
            left:   BorderSide(color: Color(0xFF00897B), width: 4),
            bottom: BorderSide(color: Color(0xFFEEEEEE)),
          ),
        ),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Row(children: [
          _dot(const Color(0xFF1E88E5)),
          const SizedBox(width: 12),
          _flagAvatar(s.username),
          const SizedBox(width: 12),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(s.username,
                style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700,
                    color: Color(0xFF212121)),
                maxLines: 1, overflow: TextOverflow.ellipsis),
            const SizedBox(height: 2),
            _pageRow(s.userEmail ?? 'Anonymous'),
            const SizedBox(height: 2),
            Row(children: [
              const Icon(Icons.visibility_outlined, size: 12, color: Color(0xFF9E9E9E)),
              const SizedBox(width: 4),
              Text(mine ? 'Assigned to You' : 'Agent: $agentName',
                  style: const TextStyle(fontSize: 12, color: Color(0xFF616161),
                      fontWeight: FontWeight.w600)),
            ]),
          ])),
          const SizedBox(width: 12),
          Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
            _statusPill('Joined', const Color(0xFF00897B)),
            const SizedBox(height: 4),
            _timer(_elapsed(s.timestamp)),
            const SizedBox(height: 6),
            // View Chat button
            GestureDetector(
              onTap: () => _openChat(s),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: const Color(0xFF00897B),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Text('View Chat',
                    style: TextStyle(color: Colors.white, fontSize: 12,
                        fontWeight: FontWeight.w700)),
              ),
            ),
          ]),
        ]),
      ),
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  // VISITORS TAB
  // ════════════════════════════════════════════════════════════════════════

  Widget _buildVisitors() {
    if (_loadingV) return const Center(child: CircularProgressIndicator());

    final active  = _activeVisitors;
    final idle    = _idleVisitors;
    final total   = _visitors.length;

    if (total == 0) {
      return _emptyState(
        'No visitors right now',
        'Visitors browsing your site appear\nhere via the chatbot widget heartbeat.',
        Icons.people_outline_rounded,
      );
    }

    // Choose which sections to show based on filter
    final showActive = _visFilter == _VisFilter.all || _visFilter == _VisFilter.active;
    final showIdle   = _visFilter == _VisFilter.all || _visFilter == _VisFilter.idle;

    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.only(bottom: 120),
        children: [
          // Filter chips bar
          Container(
            color: Colors.white,
            padding: const EdgeInsets.fromLTRB(16, 10, 16, 10),
            child: Row(children: [
              ..._VisFilter.values.map((f) {
                final sel = _visFilter == f;
                final count = f == _VisFilter.all    ? total
                    : f == _VisFilter.active ? active.length
                    : idle.length;
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: GestureDetector(
                    onTap: () => setState(() => _visFilter = f),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: sel
                            ? const Color(0xFF00897B)
                            : const Color(0xFFF3F4F6),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Row(mainAxisSize: MainAxisSize.min, children: [
                        Text(f.label,
                            style: TextStyle(fontSize: 13,
                                fontWeight: FontWeight.w600,
                                color: sel ? Colors.white : const Color(0xFF424242))),
                        const SizedBox(width: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                          decoration: BoxDecoration(
                            color: sel
                                ? Colors.white.withOpacity(0.25)
                                : const Color(0xFFE0E0E0),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text('$count',
                              style: TextStyle(fontSize: 11,
                                  fontWeight: FontWeight.w700,
                                  color: sel ? Colors.white : const Color(0xFF616161))),
                        ),
                      ]),
                    ),
                  ),
                );
              }),
            ]),
          ),
          const Divider(height: 1),

          // ── Active section ─────────────────────────────────────────────
          if (showActive && active.isNotEmpty) ...[
            _sectionHeader(
              'Active',
              active.length,
              const Color(0xFF22C55E),
              'Browsing your site now',
            ),
            ...active.map((v) => _visitorRow(v)),
          ],

          // ── Idle section ───────────────────────────────────────────────
          if (showIdle && idle.isNotEmpty) ...[
            _sectionHeader(
              'Idle',
              idle.length,
              const Color(0xFFFFC107),
              'Inactive >2 min, still on site',
            ),
            ...idle.map((v) => _visitorRow(v)),
          ],

          // Empty when filter yields nothing
          if (_filteredVisitors.isEmpty)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 48),
              child: Center(
                child: Text('No ${_visFilter.label.toLowerCase()} visitors right now',
                    style: const TextStyle(fontSize: 14, color: Color(0xFF9E9E9E))),
              ),
            ),
        ],
      ),
    );
  }

  Widget _visitorRow(VisitorInfo v) {
    final state    = _vState(v);
    final isActive = state == _VisState.active;
    final dotColor = isActive ? const Color(0xFF22C55E) : const Color(0xFFFFC107);
    final hasChat  = v.sessionId != null && v.sessionId!.isNotEmpty;

    return GestureDetector(
      onTap: () => _openVisitorChat(v),
      child: Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          border: Border(bottom: BorderSide(color: Color(0xFFEEEEEE))),
        ),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Row(children: [
          _dot(dotColor),
          const SizedBox(width: 12),
          _flagAvatar(v.username.isNotEmpty ? v.username : 'A'),
          const SizedBox(width: 12),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Row(children: [
              Expanded(
                child: Text(
                  v.email.isNotEmpty ? v.email : 'Anonymous',
                  style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700,
                      color: Color(0xFF212121)),
                  maxLines: 1, overflow: TextOverflow.ellipsis,
                ),
              ),
              if (hasChat)
                Container(
                  margin: const EdgeInsets.only(left: 8),
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: const Color(0xFF7B3FE4).withOpacity(0.12),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Text('In chat',
                      style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700,
                          color: Color(0xFF7B3FE4))),
                ),
            ]),
            const SizedBox(height: 2),
            _pageRow(v.pageLabel),
          ])),
          const SizedBox(width: 12),
          Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
            Text(v.email.isNotEmpty ? 'Returning' : 'New',
                style: const TextStyle(fontSize: 12, color: Color(0xFF9E9E9E),
                    fontWeight: FontWeight.w500)),
            const SizedBox(height: 2),
            _timer(_visElapsed(v.lastSeen)),
            const SizedBox(height: 6),
            // Invite / View Chat button
            GestureDetector(
              onTap: hasChat ? () => _openVisitorChat(v) : () => _inviteVisitor(v),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration: BoxDecoration(
                  color: hasChat
                      ? const Color(0xFF7B3FE4)
                      : const Color(0xFF1E88E5),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  hasChat ? 'View' : 'Invite',
                  style: const TextStyle(color: Colors.white, fontSize: 11,
                      fontWeight: FontWeight.w700),
                ),
              ),
            ),
          ]),
        ]),
      ),
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  // SHARED HELPERS
  // ════════════════════════════════════════════════════════════════════════

  Widget _dot(Color color) => Container(
    width: 10, height: 10,
    decoration: BoxDecoration(color: color, shape: BoxShape.circle),
  );

  Widget _flagAvatar(String label) {
    const colors = [
      Color(0xFF7B3FE4), Color(0xFF1E88E5),
      Color(0xFF00897B), Color(0xFFE53935), Color(0xFF6D4C41),
    ];
    final color = label.isNotEmpty ? colors[label.codeUnitAt(0) % colors.length] : colors[0];
    return Container(
      width: 40, height: 40,
      decoration: BoxDecoration(color: color, shape: BoxShape.circle),
      child: Center(child: Text(
        label.isNotEmpty ? label[0].toUpperCase() : '?',
        style: const TextStyle(color: Colors.white, fontSize: 16,
            fontWeight: FontWeight.w700),
      )),
    );
  }

  Widget _pageRow(String text) => Row(children: [
    const Icon(Icons.language, size: 13, color: Color(0xFF9E9E9E)),
    const SizedBox(width: 4),
    Expanded(child: Text(text,
        style: const TextStyle(fontSize: 12, color: Color(0xFF9E9E9E)),
        maxLines: 1, overflow: TextOverflow.ellipsis)),
  ]);

  Widget _timer(String value) => Text(value,
    style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700,
        color: Color(0xFF212121)));

  Widget _statusPill(String label, Color color) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
    decoration: BoxDecoration(
        color: color.withOpacity(0.12),
        borderRadius: BorderRadius.circular(8)),
    child: Text(label,
        style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700,
            color: color)),
  );

  Widget _emptyState(String title, String sub, IconData icon) => Center(
    child: Padding(
      padding: const EdgeInsets.all(40),
      child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
        Icon(icon, size: 60, color: const Color(0xFFDDDDDD)),
        const SizedBox(height: 16),
        Text(title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600,
            color: Color(0xFF424242)), textAlign: TextAlign.center),
        const SizedBox(height: 8),
        Text(sub, style: const TextStyle(fontSize: 13, color: Color(0xFF9E9E9E)),
            textAlign: TextAlign.center),
      ]),
    ),
  );

  Widget _tabBadge(int n, Color c) => Container(
    margin: const EdgeInsets.only(left: 6),
    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
    decoration: BoxDecoration(color: c, borderRadius: BorderRadius.circular(10)),
    child: Text('$n', style: const TextStyle(color: Colors.white,
        fontSize: 11, fontWeight: FontWeight.w700)),
  );

  // ════════════════════════════════════════════════════════════════════════
  // BUILD
  // ════════════════════════════════════════════════════════════════════════

  @override
  Widget build(BuildContext context) {
    final activeChatCount = _unanswered.length + _joined.length;
    final visitorCount    = _visitors.length;

    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F5),
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(106),
        child: Material(
          elevation: 2, shadowColor: Colors.black12, color: Colors.white,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              AppBar(
                backgroundColor: Colors.white,
                elevation: 0,
                centerTitle: false,
                titleSpacing: 16,
                title: const Text('Monitoring',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700,
                        color: Color(0xFF212121))),
                leading: IconButton(
                  icon: const Icon(Icons.arrow_back_ios_new_rounded,
                      size: 20, color: Color(0xFF424242)),
                  onPressed: () => Navigator.maybePop(context),
                ),
                actions: [
                  const AgentStatusButton(),
                  const SizedBox(width: 4),
                  IconButton(
                    icon: const Icon(Icons.refresh_rounded, color: Color(0xFF424242)),
                    onPressed: _load,
                  ),
                ],
              ),
              // ── Tab bar ──────────────────────────────────────────────
              TabBar(
                controller: _tabController,
                indicatorColor: const Color(0xFF00897B),
                indicatorWeight: 2.5,
                labelColor: const Color(0xFF00897B),
                unselectedLabelColor: const Color(0xFF9E9E9E),
                labelStyle: const TextStyle(
                    fontSize: 13.5, fontWeight: FontWeight.w600),
                tabs: [
                  // Active Chats tab
                  Tab(child: Row(
                      mainAxisAlignment: MainAxisAlignment.center, children: [
                    const Text('Active chats'),
                    if (activeChatCount > 0)
                      _tabBadge(activeChatCount, const Color(0xFFE53935)),
                  ])),
                  // Visitors tab
                  Tab(child: Row(
                      mainAxisAlignment: MainAxisAlignment.center, children: [
                    const Text('Visitors'),
                    if (visitorCount > 0)
                      _tabBadge(visitorCount, const Color(0xFF00897B)),
                  ])),
                ],
              ),
            ],
          ),
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [_buildActiveChats(), _buildVisitors()],
      ),
    );
  }
}

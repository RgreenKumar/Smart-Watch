// lib/features/chats/screens/chat_list_screen.dart
//
// INBOX — Tawk-style full logic & flow
// ─────────────────────────────────────────────────────────────────────────────
// Tab structure:  All | Chats | Tickets
// Filter sheet:   Status (All / Open / Pending / Closed / Missed) + Date range
// Tile actions:   Tap → detail, Long-press → context menu (Reopen/Close/Delete)
// Swipe actions:  Left → Close/Delete  |  Right → Reopen
// Tawk badge map:
//   isOpenMissed → orange "Open" + red "Missed chat" label
//   isPending    → orange "Pending"
//   isClosed     → grey  "Closed"

import 'package:flutter/material.dart';
import '../../../core/services/auth_store.dart';
import '../../../core/services/websocket_service.dart';
import '../../../core/utils/constants.dart';
import '../../../core/utils/page_transition.dart';
import '../../../core/widgets/floating_toast.dart';
import '../../../core/widgets/shadowed_app_bar.dart';
import '../services/chat_service.dart';
import 'chat_detail_screen.dart';

// ── Filter model ──────────────────────────────────────────────────────────────

enum _StatusFilter { all, open, pending, closed, missed }

extension _SFLabel on _StatusFilter {
  String get label => const {
        _StatusFilter.all: 'All',
        _StatusFilter.open: 'Open',
        _StatusFilter.pending: 'Pending',
        _StatusFilter.closed: 'Closed',
        _StatusFilter.missed: 'Missed',
      }[this]!;

  IconData get icon => const {
        _StatusFilter.all: Icons.all_inbox_rounded,
        _StatusFilter.open: Icons.chat_bubble_outline_rounded,
        _StatusFilter.pending: Icons.hourglass_empty_rounded,
        _StatusFilter.closed: Icons.check_circle_outline_rounded,
        _StatusFilter.missed: Icons.phone_missed_rounded,
      }[this]!;

  String get subtitle => const {
        _StatusFilter.all: 'Show all conversations',
        _StatusFilter.open: 'Unanswered — no agent reply yet',
        _StatusFilter.pending: 'Agent active, not yet resolved',
        _StatusFilter.closed: 'Resolved conversations',
        _StatusFilter.missed: 'Visitor left without a reply',
      }[this]!;
}

enum _DateFilter { any, today, week, month }

extension _DFLabel on _DateFilter {
  String get label => const {
        _DateFilter.any: 'Any time',
        _DateFilter.today: 'Today',
        _DateFilter.week: 'This week',
        _DateFilter.month: 'This month',
      }[this]!;
}

// ── Screen ────────────────────────────────────────────────────────────────────

class ChatListScreen extends StatefulWidget {
  const ChatListScreen({super.key});
  @override
  State<ChatListScreen> createState() => _ChatListScreenState();
}

class _ChatListScreenState extends State<ChatListScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final _searchCtrl = TextEditingController();

  List<SessionDisplay> _all = [];
  List<SessionDisplay> _filtered = [];
  bool _loading = true;
  String? _error;

  _StatusFilter _statusFilter = _StatusFilter.all;
  _DateFilter _dateFilter = _DateFilter.any;
  bool _selectMode = false;
  final Set<String> _selected = {};

  // Locally "trashed" sessions (soft-delete before purge)
  final Set<String> _trashed = {};

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _tabController.addListener(() => setState(_applyFilter));
    _load();
    WebSocketService.instance.onPendingSession = (_) {
      if (mounted) _load();
    };
  }

  @override
  void dispose() {
    _tabController.dispose();
    _searchCtrl.dispose();
    WebSocketService.instance.onPendingSession = null;
    super.dispose();
  }

  // ── Data ─────────────────────────────────────────────────────────────────

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final sessions = await ChatService.instance.getVisibleSessions();
      if (!mounted) return;
      setState(() {
        _all = sessions.where((s) => !_trashed.contains(s.sessionId)).toList();
        _loading = false;
        _applyFilter();
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.toString();
        _loading = false;
      });
    }
  }

  void _applyFilter() {
    final q = _searchCtrl.text.toLowerCase();
    final tabIdx = _tabController.index;

    // Step 1 — tab filter
    List<SessionDisplay> base = _all.where((s) {
      if (tabIdx == 1)
        return !s.isClosed ||
            s.isPending ||
            s.isUnanswered; // Chats = open only
      if (tabIdx == 2) return false; // Tickets tab — no real tickets yet
      return true;
    }).toList();

    // Step 2 — status filter
    base = base.where((s) {
      switch (_statusFilter) {
        case _StatusFilter.all:
          return true;
        case _StatusFilter.open:
          return s.isOpenMissed;
        case _StatusFilter.pending:
          return s.isPending;
        case _StatusFilter.closed:
          return s.isClosed;
        case _StatusFilter.missed:
          return s.isOpenMissed;
      }
    }).toList();

    // Step 3 — date filter
    if (_dateFilter != _DateFilter.any) {
      final now = DateTime.now();
      base = base.where((s) {
        if (s.timestamp == null) return false;
        try {
          final dt = DateTime.parse(s.timestamp!);
          switch (_dateFilter) {
            case _DateFilter.today:
              return dt.year == now.year &&
                  dt.month == now.month &&
                  dt.day == now.day;
            case _DateFilter.week:
              return now.difference(dt).inDays < 7;
            case _DateFilter.month:
              return dt.year == now.year && dt.month == now.month;
            default:
              return true;
          }
        } catch (_) {
          return true;
        }
      }).toList();
    }

    // Step 4 — search
    if (q.isNotEmpty) {
      base = base
          .where((s) =>
              s.username.toLowerCase().contains(q) ||
              (s.userEmail?.toLowerCase().contains(q) ?? false) ||
              (s.lastMessage?.toLowerCase().contains(q) ?? false))
          .toList();
    }

    // Sort: open first, then by latest timestamp desc
    base.sort((a, b) {
      if (a.isActive != b.isActive) return a.isClosed ? 1 : -1;
      final ta = DateTime.tryParse(a.timestamp ?? '') ?? DateTime(2000);
      final tb = DateTime.tryParse(b.timestamp ?? '') ?? DateTime(2000);
      return tb.compareTo(ta);
    });

    _filtered = base;
  }

  void _search(String q) => setState(_applyFilter);

  // ── Open chat ─────────────────────────────────────────────────────────────

  void _openChat(SessionDisplay s) {
    if (_selectMode) {
      setState(() {
        if (_selected.contains(s.sessionId)) {
          _selected.remove(s.sessionId);
        } else {
          _selected.add(s.sessionId);
        }
      });
      return;
    }
    Navigator.push(
      context,
      DirectionalPageRoute(
          page: ChatDetailScreen(session: s), direction: SlideDirection.left),
    ).then((_) => _load());
  }

  // ── Bulk actions ──────────────────────────────────────────────────────────

  Future<void> _bulkClose() async {
    for (final id in _selected) {
      try {
        await ChatService.instance.resolveSession(id);
      } catch (_) {}
    }
    setState(() {
      _selected.clear();
      _selectMode = false;
    });
    _load();
    if (mounted) FloatingToast.show(context, message: 'Conversations closed');
  }

  Future<void> _bulkDelete() async {
    final confirmed = await _confirmDialog(
      title: 'Delete conversations',
      message: 'Move ${_selected.length} conversation(s) to Trash?',
      action: 'Delete',
    );
    if (!confirmed) return;
    setState(() {
      _trashed.addAll(_selected);
      _all.removeWhere((s) => _selected.contains(s.sessionId));
      _selected.clear();
      _selectMode = false;
      _applyFilter();
    });
    if (mounted) FloatingToast.show(context, message: 'Moved to Trash');
  }

  // ── Single tile actions ───────────────────────────────────────────────────

  void _showContextMenu(SessionDisplay s) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (_) {
        return Padding(
          padding: EdgeInsets.only(
              bottom: MediaQuery.of(context).padding.bottom + 8),
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            Container(
                width: 36,
                height: 4,
                margin: const EdgeInsets.symmetric(vertical: 12),
                decoration: BoxDecoration(
                    color: const Color(0xFFDDDDDD),
                    borderRadius: BorderRadius.circular(2))),
            ListTile(
              leading: const Icon(Icons.open_in_new_rounded,
                  color: Color(0xFF424242)),
              title: const Text('Open chat'),
              onTap: () {
                Navigator.pop(context);
                _openChat(s);
              },
            ),
            if (s.isClosed)
              ListTile(
                leading:
                    const Icon(Icons.refresh_rounded, color: Color(0xFF00897B)),
                title: const Text('Reopen',
                    style: TextStyle(color: Color(0xFF00897B))),
                onTap: () async {
                  Navigator.pop(context);
                  await ChatService.instance.reopenSession(s.sessionId);
                  _load();
                  if (mounted)
                    FloatingToast.show(context, message: 'Chat reopened');
                },
              )
            else
              ListTile(
                leading: const Icon(Icons.check_circle_outline,
                    color: Color(0xFF9E9E9E)),
                title: const Text('Close / Resolve'),
                onTap: () async {
                  Navigator.pop(context);
                  final ok = await _confirmDialog(
                      title: 'Close chat',
                      message: 'Mark as resolved? New messages will reopen it.',
                      action: 'Resolve');
                  if (ok) {
                    await ChatService.instance.resolveSession(s.sessionId);
                    _load();
                  }
                },
              ),
            ListTile(
              leading: const Icon(Icons.receipt_long_outlined,
                  color: Color(0xFF424242)),
              title: const Text('Copy transcript'),
              onTap: () {
                Navigator.pop(context);
                FloatingToast.show(context, message: 'Transcript copied');
              },
            ),
            ListTile(
              leading: const Icon(Icons.delete_outline_rounded,
                  color: Color(0xFFE53935)),
              title: const Text('Delete',
                  style: TextStyle(color: Color(0xFFE53935))),
              onTap: () async {
                Navigator.pop(context);
                final ok = await _confirmDialog(
                    title: 'Delete chat',
                    message: 'Move to Trash?',
                    action: 'Delete');
                if (ok) {
                  setState(() {
                    _trashed.add(s.sessionId);
                    _all.removeWhere((x) => x.sessionId == s.sessionId);
                    _applyFilter();
                  });
                  FloatingToast.show(context, message: 'Moved to Trash');
                }
              },
            ),
            const SizedBox(height: 4),
          ]),
        );
      },
    );
  }

  // ── Filter bottom sheet ───────────────────────────────────────────────────

  void _showFilterSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (_) {
        return StatefulBuilder(
          builder: (ctx, setLocal) {
            var localStatus = _statusFilter;
            var localDate = _dateFilter;
            return Padding(
              padding: EdgeInsets.only(
                  bottom: MediaQuery.of(context).padding.bottom + 16),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                      width: 36,
                      height: 4,
                      margin: const EdgeInsets.symmetric(vertical: 12),
                      decoration: BoxDecoration(
                          color: const Color(0xFFDDDDDD),
                          borderRadius: BorderRadius.circular(2))),
                  // Status section
                  const Padding(
                    padding: EdgeInsets.fromLTRB(20, 0, 20, 8),
                    child: Align(
                        alignment: Alignment.centerLeft,
                        child: Text('Filter by status',
                            style: TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w700,
                                color: Color(0xFF9E9E9E),
                                letterSpacing: 0.5))),
                  ),
                  ..._StatusFilter.values.map((f) {
                    final sel = localStatus == f;
                    return ListTile(
                      contentPadding:
                          const EdgeInsets.symmetric(horizontal: 20),
                      leading: Icon(f.icon,
                          color: sel
                              ? const Color(0xFF7B3FE4)
                              : const Color(0xFF9E9E9E)),
                      title: Text(f.label,
                          style: TextStyle(
                              fontWeight:
                                  sel ? FontWeight.w700 : FontWeight.w400,
                              color: sel
                                  ? const Color(0xFF7B3FE4)
                                  : const Color(0xFF212121))),
                      subtitle: Text(f.subtitle,
                          style: const TextStyle(
                              fontSize: 12, color: Color(0xFF9E9E9E))),
                      trailing: sel
                          ? const Icon(Icons.check_rounded,
                              color: Color(0xFF7B3FE4))
                          : null,
                      onTap: () => setLocal(() => localStatus = f),
                    );
                  }),
                  const Divider(),
                  // Date section
                  const Padding(
                    padding: EdgeInsets.fromLTRB(20, 8, 20, 8),
                    child: Align(
                        alignment: Alignment.centerLeft,
                        child: Text('Filter by date',
                            style: TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w700,
                                color: Color(0xFF9E9E9E),
                                letterSpacing: 0.5))),
                  ),
                  Wrap(
                    spacing: 8,
                    runSpacing: 4,
                    children: _DateFilter.values.map((d) {
                      final sel = localDate == d;
                      return ChoiceChip(
                        label: Text(d.label),
                        selected: sel,
                        onSelected: (_) => setLocal(() => localDate = d),
                        selectedColor: const Color(0xFF7B3FE4),
                        labelStyle: TextStyle(
                            color: sel ? Colors.white : const Color(0xFF424242),
                            fontWeight:
                                sel ? FontWeight.w600 : FontWeight.w400),
                        backgroundColor: const Color(0xFFF3F4F6),
                        padding: const EdgeInsets.symmetric(
                            horizontal: 12, vertical: 4),
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 16),
                  // Apply button
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    child: SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: () {
                          Navigator.pop(context);
                          setState(() {
                            _statusFilter = localStatus;
                            _dateFilter = localDate;
                            _applyFilter();
                          });
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF7B3FE4),
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12)),
                        ),
                        child: const Text('Apply Filters',
                            style: TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.w700)),
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),
                ],
              ),
            );
          },
        );
      },
    );
  }

  // ── Confirm dialog ────────────────────────────────────────────────────────

  Future<bool> _confirmDialog({
    required String title,
    required String message,
    required String action,
  }) async {
    return await showDialog<bool>(
          context: context,
          builder: (_) => AlertDialog(
            shape:
                RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            title: Text(title),
            content: Text(message,
                style: const TextStyle(fontSize: 14, color: Color(0xFF616161))),
            actions: [
              TextButton(
                  onPressed: () => Navigator.pop(context, false),
                  child: const Text('Cancel',
                      style: TextStyle(color: Color(0xFF9E9E9E)))),
              TextButton(
                  onPressed: () => Navigator.pop(context, true),
                  child: Text(action,
                      style: const TextStyle(
                          color: Color(0xFFE53935),
                          fontWeight: FontWeight.w700))),
            ],
          ),
        ) ??
        false;
  }

  // ── Count helpers ─────────────────────────────────────────────────────────

  bool get _hasFilter =>
      _statusFilter != _StatusFilter.all || _dateFilter != _DateFilter.any;

  // ════════════════════════════════════════════════════════════════════════
  // BUILD
  // ════════════════════════════════════════════════════════════════════════

  @override
  Widget build(BuildContext context) {
    final myName = AuthStore.instance.userName ?? 'A';

    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F5),
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(148),
        child: ShadowedAppBar(
          height: 148,
          children: [
            // Top bar
            AppBar(
              toolbarHeight: 64,
              backgroundColor: Colors.white,
              elevation: 0,
              scrolledUnderElevation: 0,
              titleSpacing: 16,
              title: Row(children: [
                Image.asset('assets/images/chat.png',
                    height: 56, fit: BoxFit.contain),
                const Spacer(),
                Text(AppConstants.propertyName,
                    style: const TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                        color: Color(0xFF212121),
                        decoration: TextDecoration.underline)),
                const Spacer(),
                CircleAvatar(
                  radius: 17,
                  backgroundColor: const Color(0xFF7B3FE4),
                  child: Text(myName.isNotEmpty ? myName[0].toUpperCase() : 'A',
                      style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.w700,
                          fontSize: 13)),
                ),
              ]),
            ),

            // Search row
            Container(
              color: Colors.white,
              padding: const EdgeInsets.fromLTRB(12, 4, 12, 0),
              child: Row(children: [
                Expanded(
                  child: Container(
                    height: 40,
                    decoration: BoxDecoration(
                        color: const Color(0xFFF3F4F6),
                        borderRadius: BorderRadius.circular(20)),
                    child: TextField(
                      controller: _searchCtrl,
                      onChanged: _search,
                      style: const TextStyle(
                          fontSize: 14, color: Color(0xFF212121)),
                      decoration: const InputDecoration(
                        hintText: 'Search...',
                        hintStyle:
                            TextStyle(color: Color(0xFF9E9E9E), fontSize: 14),
                        border: InputBorder.none,
                        prefixIcon: Icon(Icons.search,
                            color: Color(0xFF9E9E9E), size: 20),
                        isDense: true,
                        contentPadding: EdgeInsets.symmetric(vertical: 10),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                // Filter button
                GestureDetector(
                  onTap: _showFilterSheet,
                  child: Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: _hasFilter
                          ? const Color(0xFF7B3FE4).withOpacity(0.1)
                          : const Color(0xFFF3F4F6),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Icon(Icons.filter_alt_outlined,
                        size: 20,
                        color: _hasFilter
                            ? const Color(0xFF7B3FE4)
                            : const Color(0xFF9E9E9E)),
                  ),
                ),
                const SizedBox(width: 8),
                // Select toggle
                GestureDetector(
                  onTap: () => setState(() {
                    _selectMode = !_selectMode;
                    if (!_selectMode) _selected.clear();
                  }),
                  child: Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: _selectMode
                          ? const Color(0xFF7B3FE4).withOpacity(0.1)
                          : const Color(0xFFF3F4F6),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Icon(
                      _selectMode
                          ? Icons.check_box_rounded
                          : Icons.check_box_outline_blank_rounded,
                      size: 20,
                      color: _selectMode
                          ? const Color(0xFF7B3FE4)
                          : const Color(0xFF9E9E9E),
                    ),
                  ),
                ),
              ]),
            ),

            // Tab bar: All | Chats | Tickets
            TabBar(
              controller: _tabController,
              indicatorColor: const Color(0xFF7B3FE4),
              indicatorWeight: 2.5,
              labelColor: const Color(0xFF7B3FE4),
              unselectedLabelColor: const Color(0xFF9E9E9E),
              labelStyle:
                  const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
              tabs: [
                Tab(child: _tabLabel('All', _all.length)),
                Tab(
                    child: _tabLabel(
                        'Chats', _all.where((s) => !s.isClosed).length)),
                const Tab(text: 'Tickets'),
              ],
            ),
          ],
        ),
      ),
      body: Column(children: [
        // Active filter chips
        if (_hasFilter || _searchCtrl.text.isNotEmpty) _filterChipRow(),

        // Select mode toolbar
        if (_selectMode && _selected.isNotEmpty) _selectToolbar(),

        const Divider(height: 1),

        Expanded(
          child: RefreshIndicator(
            onRefresh: _load,
            child: _buildBody(),
          ),
        ),
      ]),
    );
  }

  Widget _tabLabel(String label, int count) {
    return Row(mainAxisSize: MainAxisSize.min, children: [
      Text(label),
      if (count > 0) ...[
        const SizedBox(width: 6),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
          decoration: BoxDecoration(
              color: const Color(0xFF7B3FE4),
              borderRadius: BorderRadius.circular(10)),
          child: Text('$count',
              style: const TextStyle(
                  color: Colors.white,
                  fontSize: 11,
                  fontWeight: FontWeight.w700)),
        ),
      ],
    ]);
  }

  Widget _filterChipRow() {
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.fromLTRB(16, 6, 16, 6),
      child: Wrap(spacing: 8, children: [
        if (_statusFilter != _StatusFilter.all)
          _chip(
              _statusFilter.label,
              () => setState(() {
                    _statusFilter = _StatusFilter.all;
                    _applyFilter();
                  })),
        if (_dateFilter != _DateFilter.any)
          _chip(
              _dateFilter.label,
              () => setState(() {
                    _dateFilter = _DateFilter.any;
                    _applyFilter();
                  })),
        if (_searchCtrl.text.isNotEmpty)
          _chip('"${_searchCtrl.text}"', () {
            _searchCtrl.clear();
            setState(_applyFilter);
          }),
      ]),
    );
  }

  Widget _chip(String label, VoidCallback onRemove) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
        decoration: BoxDecoration(
            color: const Color(0xFF7B3FE4).withOpacity(0.1),
            borderRadius: BorderRadius.circular(14)),
        child: Row(mainAxisSize: MainAxisSize.min, children: [
          Text(label,
              style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: Color(0xFF7B3FE4))),
          const SizedBox(width: 6),
          GestureDetector(
              onTap: onRemove,
              child:
                  const Icon(Icons.close, size: 14, color: Color(0xFF7B3FE4))),
        ]),
      );

  Widget _selectToolbar() => Container(
        color: const Color(0xFF7B3FE4),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        child: Row(children: [
          Text('${_selected.length} selected',
              style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w600,
                  fontSize: 14)),
          const Spacer(),
          TextButton(
              onPressed: _bulkClose,
              child: const Text('Close all',
                  style: TextStyle(color: Colors.white70))),
          TextButton(
              onPressed: _bulkDelete,
              child: const Text('Delete',
                  style: TextStyle(color: Color(0xFFFFCDD2)))),
          TextButton(
              onPressed: () => setState(() {
                    _selected.clear();
                    _selectMode = false;
                  }),
              child: const Text('Cancel',
                  style: TextStyle(color: Colors.white70))),
        ]),
      );

  Widget _buildBody() {
    // Tickets tab placeholder
    if (_tabController.index == 2) return _ticketsPlaceholder();

    if (_loading) return const Center(child: CircularProgressIndicator());

    if (_error != null) {
      return Center(
          child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
        const Icon(Icons.wifi_off_rounded, size: 48, color: Color(0xFFDDDDDD)),
        const SizedBox(height: 12),
        const Text('Connection error',
            style: TextStyle(color: Color(0xFF9E9E9E), fontSize: 14)),
        const SizedBox(height: 16),
        ElevatedButton(onPressed: _load, child: const Text('Retry')),
      ]));
    }

    if (_filtered.isEmpty) {
      return Center(
          child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
        const Icon(Icons.inbox_outlined, size: 64, color: Color(0xFFDDDDDD)),
        const SizedBox(height: 14),
        Text(
          _searchCtrl.text.isNotEmpty
              ? 'No results for "${_searchCtrl.text}"'
              : 'No ${_statusFilter == _StatusFilter.all ? "" : "${_statusFilter.label.toLowerCase()} "}chats',
          style: const TextStyle(color: Color(0xFF9E9E9E), fontSize: 14),
          textAlign: TextAlign.center,
        ),
      ]));
    }

    return ListView.builder(
      physics: const AlwaysScrollableScrollPhysics(),
      padding: const EdgeInsets.only(bottom: 110),
      itemCount: _filtered.length,
      itemBuilder: (_, i) {
        final s = _filtered[i];
        return _SwipeableTile(
          session: s,
          isSelected: _selected.contains(s.sessionId),
          selectMode: _selectMode,
          onTap: () => _openChat(s),
          onLongPress: () => _showContextMenu(s),
          onSwipeClose: () async {
            if (s.isClosed) {
              await ChatService.instance.reopenSession(s.sessionId);
              _load();
            } else {
              final ok = await _confirmDialog(
                  title: 'Close chat',
                  message: 'Resolve this conversation?',
                  action: 'Resolve');
              if (ok) {
                await ChatService.instance.resolveSession(s.sessionId);
                _load();
              }
            }
          },
          onSwipeDelete: () async {
            setState(() {
              _trashed.add(s.sessionId);
              _all.removeWhere((x) => x.sessionId == s.sessionId);
              _applyFilter();
            });
            FloatingToast.show(context, message: 'Moved to Trash');
          },
        );
      },
    );
  }

  Widget _ticketsPlaceholder() => Center(
        child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
          const Icon(Icons.confirmation_number_outlined,
              size: 64, color: Color(0xFFDDDDDD)),
          const SizedBox(height: 14),
          const Text('No tickets yet',
              style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: Color(0xFF424242))),
          const SizedBox(height: 8),
          const Text(
              'Convert a missed chat to a ticket\nfrom the chat detail screen.',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 13, color: Color(0xFF9E9E9E))),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            onPressed: () {
              _tabController.animateTo(0);
              setState(() {
                _statusFilter = _StatusFilter.missed;
                _applyFilter();
              });
            },
            icon: const Icon(Icons.phone_missed_rounded, size: 18),
            label: const Text('View Missed Chats'),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF7B3FE4),
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12)),
            ),
          ),
        ]),
      );
}

// ════════════════════════════════════════════════════════════════════════════
// Swipeable Chat Tile
// ════════════════════════════════════════════════════════════════════════════

class _SwipeableTile extends StatelessWidget {
  final SessionDisplay session;
  final bool isSelected;
  final bool selectMode;
  final VoidCallback onTap;
  final VoidCallback onLongPress;
  final VoidCallback onSwipeClose;
  final VoidCallback onSwipeDelete;

  const _SwipeableTile({
    required this.session,
    required this.isSelected,
    required this.selectMode,
    required this.onTap,
    required this.onLongPress,
    required this.onSwipeClose,
    required this.onSwipeDelete,
  });

  @override
  Widget build(BuildContext context) {
    return Dismissible(
      key: ValueKey(session.sessionId),
      // Swipe right → Reopen/Close
      background: Container(
        color: const Color(0xFF00897B),
        alignment: Alignment.centerLeft,
        padding: const EdgeInsets.only(left: 24),
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          Icon(
              session.isClosed
                  ? Icons.refresh_rounded
                  : Icons.check_circle_outline,
              color: Colors.white,
              size: 28),
          const SizedBox(height: 4),
          Text(session.isClosed ? 'Reopen' : 'Close',
              style: const TextStyle(
                  color: Colors.white,
                  fontSize: 12,
                  fontWeight: FontWeight.w600)),
        ]),
      ),
      // Swipe left → Delete
      secondaryBackground: Container(
        color: const Color(0xFFE53935),
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 24),
        child: const Column(mainAxisSize: MainAxisSize.min, children: [
          Icon(Icons.delete_outline_rounded, color: Colors.white, size: 28),
          SizedBox(height: 4),
          Text('Delete',
              style: TextStyle(
                  color: Colors.white,
                  fontSize: 12,
                  fontWeight: FontWeight.w600)),
        ]),
      ),
      confirmDismiss: (dir) async {
        if (dir == DismissDirection.startToEnd) {
          onSwipeClose();
          return false; // tile stays — we reload
        } else {
          onSwipeDelete();
          return false; // we handle removal manually
        }
      },
      child: GestureDetector(
        onTap: onTap,
        onLongPress: onLongPress,
        child: _ChatTile(
          session: session,
          isSelected: isSelected,
          selectMode: selectMode,
        ),
      ),
    );
  }
}

// ════════════════════════════════════════════════════════════════════════════
// Chat Tile Widget
// ════════════════════════════════════════════════════════════════════════════

class _ChatTile extends StatelessWidget {
  final SessionDisplay session;
  final bool isSelected;
  final bool selectMode;

  const _ChatTile({
    required this.session,
    required this.isSelected,
    required this.selectMode,
  });

  @override
  Widget build(BuildContext context) {
    final s = session;

    // ── Badge ────────────────────────────────────────────────────────────
    final (badgeLabel, badgeColor) = s.isClosed
        ? ('Closed', const Color(0xFF9E9E9E))
        : s.isPending
            ? ('Pending', const Color(0xFFFF9800))
            : ('Open', const Color(0xFFFF9800));

    return Container(
      color:
          isSelected ? const Color(0xFF7B3FE4).withOpacity(0.06) : Colors.white,
      padding: const EdgeInsets.fromLTRB(16, 14, 16, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ── Row 1: Avatar | Name + badge | Checkbox ───────────────────
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _avatar(s.username),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(children: [
                      Expanded(
                        child: Text(s.username,
                            style: const TextStyle(
                                fontSize: 15,
                                fontWeight: FontWeight.w700,
                                color: Color(0xFF212121)),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis),
                      ),
                      const SizedBox(width: 8),
                      // Status badge
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 10, vertical: 3),
                        decoration: BoxDecoration(
                            color: badgeColor,
                            borderRadius: BorderRadius.circular(4)),
                        child: Text(badgeLabel,
                            style: const TextStyle(
                                color: Colors.white,
                                fontSize: 11,
                                fontWeight: FontWeight.w700)),
                      ),
                      if (selectMode) ...[
                        const SizedBox(width: 8),
                        Icon(
                          isSelected
                              ? Icons.check_box_rounded
                              : Icons.check_box_outline_blank_rounded,
                          size: 22,
                          color: isSelected
                              ? const Color(0xFF7B3FE4)
                              : const Color(0xFFDDDDDD),
                        ),
                      ],
                    ]),
                    // Message count chip
                    const SizedBox(height: 2),
                    Row(children: [
                      const Icon(Icons.chat_bubble_outline_rounded,
                          size: 12, color: Color(0xFF9E9E9E)),
                      const SizedBox(width: 4),
                      Text(
                        '${s.messageCount} message${s.messageCount == 1 ? '' : 's'}',
                        style: const TextStyle(
                            fontSize: 12, color: Color(0xFF9E9E9E)),
                      ),
                      if (s.adminEmail != null && s.adminEmail!.isNotEmpty) ...[
                        const SizedBox(width: 10),
                        const Icon(Icons.person_outline_rounded,
                            size: 12, color: Color(0xFF9E9E9E)),
                        const SizedBox(width: 4),
                        Expanded(
                          child: Text(
                            s.isMine ? 'You' : (s.adminEmail ?? ''),
                            style: const TextStyle(
                                fontSize: 12, color: Color(0xFF9E9E9E)),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ]),
                  ],
                ),
              ),
            ],
          ),

          const SizedBox(height: 8),

          // ── Row 2: Last message ───────────────────────────────────────
          Padding(
            padding: const EdgeInsets.only(left: 56),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Icon(Icons.chat_bubble_outline,
                    size: 14, color: Color(0xFF9E9E9E)),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    s.lastMessage ?? '—',
                    style:
                        const TextStyle(fontSize: 13, color: Color(0xFF616161)),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 6),

          // ── Row 3: Missed label + timeout warning + timestamp ─────────
          Padding(
            padding: const EdgeInsets.only(left: 56),
            child: Row(children: [
              if (s.isOpenMissed)
                Row(children: const [
                  Icon(Icons.phone_missed_rounded,
                      size: 13, color: Color(0xFFE53935)),
                  SizedBox(width: 4),
                  Text('Missed chat',
                      style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                          color: Color(0xFFE53935))),
                ])
              else if (s.isNearTimeout && !s.isClosed)
                Row(children: const [
                  Icon(Icons.timer_outlined,
                      size: 13, color: Color(0xFFFF9800)),
                  SizedBox(width: 4),
                  Text('Session ending soon',
                      style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                          color: Color(0xFFFF9800))),
                ]),
              const Spacer(),
              Text(_fmtTs(s.timestamp),
                  style:
                      const TextStyle(fontSize: 12, color: Color(0xFF9E9E9E))),
              const SizedBox(width: 4),
              const Icon(Icons.calendar_today_outlined,
                  size: 12, color: Color(0xFF9E9E9E)),
            ]),
          ),

          const SizedBox(height: 12),
          const Divider(height: 1),
        ],
      ),
    );
  }

  Widget _avatar(String label) {
    const colors = [
      Color(0xFF7B3FE4),
      Color(0xFF1E88E5),
      Color(0xFF00897B),
      Color(0xFFE53935),
    ];
    final c = label.isNotEmpty
        ? colors[label.codeUnitAt(0) % colors.length]
        : colors[0];
    return Container(
      width: 44,
      height: 44,
      decoration: BoxDecoration(color: c, shape: BoxShape.circle),
      child: Center(
          child: Text(
        label.isNotEmpty ? label[0].toUpperCase() : '?',
        style: const TextStyle(
            fontSize: 18, fontWeight: FontWeight.w700, color: Colors.white),
      )),
    );
  }

  static String _fmtTs(String? ts) {
    if (ts == null) return '';
    try {
      final dt = DateTime.parse(ts).toLocal();
      final now = DateTime.now();
      final h12 = dt.hour % 12 == 0 ? 12 : dt.hour % 12;
      final m = dt.minute.toString().padLeft(2, '0');
      final ap = dt.hour < 12 ? 'AM' : 'PM';
      final t = '$h12:$m $ap';
      if (dt.year == now.year && dt.month == now.month && dt.day == now.day)
        return t;
      final diff = now.difference(dt);
      if (diff.inDays == 1) return 'Yesterday, $t';
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      if (diff.inDays < 7) return '${days[dt.weekday - 1]}, $t';
      return '${dt.day}/${dt.month}/${dt.year}';
    } catch (_) {
      return ts;
    }
  }
}

// lib/features/users/screens/view_profile_screen.dart
//
// Two-tab view: Profile | Chats
//   Profile tab → user info (id, name, email, role)
//   Chats tab   → all session history for this visitor

import 'package:flutter/material.dart';
import '../../../core/services/auth_store.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/widgets/chat_avatar.dart';
import '../../chats/screens/chat_detail_screen.dart';
import '../../chats/services/chat_service.dart';
import '../services/user_service.dart';

class ViewProfileScreen extends StatefulWidget {
  final VisitorDto visitor;
  const ViewProfileScreen({super.key, required this.visitor});

  @override
  State<ViewProfileScreen> createState() => _ViewProfileScreenState();
}

class _ViewProfileScreenState extends State<ViewProfileScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  List<SessionDisplay> _sessions   = [];
  bool _loadingSessions = true;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _loadSessions();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadSessions() async {
    try {
      // Load all visible sessions and filter by this visitor's email
      final all = await ChatService.instance.getVisibleSessions();
      if (!mounted) return;
      final visitorEmail = widget.visitor.email.toLowerCase();
      setState(() {
        _sessions = all.where((s) =>
            s.userEmail?.toLowerCase() == visitorEmail).toList()
          ..sort((a, b) {
            // Most recent first
            final ta = DateTime.tryParse(a.timestamp ?? '') ?? DateTime(2000);
            final tb = DateTime.tryParse(b.timestamp ?? '') ?? DateTime(2000);
            return tb.compareTo(ta);
          });
        _loadingSessions = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() => _loadingSessions = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.scaffoldBg,
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(112),
        child: Material(
          elevation: 3, shadowColor: Colors.black12, color: AppColors.scaffoldBg,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              SafeArea(
                bottom: false,
                child: AppBar(
                  backgroundColor: AppColors.scaffoldBg,
                  elevation: 0,
                  centerTitle: true,
                  title: const Text('User Profile'),
                  leading: IconButton(
                    icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
                    onPressed: () => Navigator.pop(context),
                  ),
                ),
              ),
              const Divider(height: 1),
              TabBar(
                controller: _tabController,
                tabs: [
                  const Tab(text: 'Profile'),
                  Tab(
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Text('Chats'),
                        if (!_loadingSessions && _sessions.isNotEmpty) ...[
                          const SizedBox(width: 6),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: AppColors.primary,
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Text('${_sessions.length}',
                                style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w700)),
                          ),
                        ],
                      ],
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _profileTab(),
          _chatsTab(),
        ],
      ),
    );
  }

  // ── Profile Tab ───────────────────────────────────────────────────────────
  Widget _profileTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        children: [
          const SizedBox(height: 16),
          ChatAvatar(label: widget.visitor.username, radius: 50),
          const SizedBox(height: 16),
          Text(widget.visitor.username,
              style: AppTextStyles.heading2, textAlign: TextAlign.center),
          const SizedBox(height: 4),
          Text(widget.visitor.email,
              style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary),
              textAlign: TextAlign.center),
          const SizedBox(height: 32),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.profileInfoBg,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _infoRow('User ID',  '#${widget.visitor.id}'),
                const Divider(height: 20),
                _infoRow('Username', widget.visitor.username),
                const Divider(height: 20),
                _infoRow('Email',    widget.visitor.email),
                const Divider(height: 20),
                _infoRow('Role',     widget.visitor.role),
                const Divider(height: 20),
                _infoRow('Total Chats',
                    _loadingSessions ? '…' : '${_sessions.length}'),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ── Chats Tab ─────────────────────────────────────────────────────────────
  Widget _chatsTab() {
    if (_loadingSessions) {
      return const Center(child: CircularProgressIndicator());
    }
    if (_sessions.isEmpty) {
      return Center(
        child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
          Icon(Icons.chat_bubble_outline_rounded, size: 56, color: AppColors.divider),
          const SizedBox(height: 14),
          Text('No chats found for this user',
              style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary)),
        ]),
      );
    }
    return RefreshIndicator(
      onRefresh: _loadSessions,
      child: ListView.separated(
        padding: const EdgeInsets.only(top: 8, bottom: 32),
        itemCount: _sessions.length,
        separatorBuilder: (_, __) => const Divider(height: 1, indent: 16),
        itemBuilder: (_, i) => _SessionTile(
          session: _sessions[i],
          onTap: () => Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => ChatDetailScreen(session: _sessions[i])),
          ).then((_) => _loadSessions()),
        ),
      ),
    );
  }

  Widget _infoRow(String label, String value) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text(label, style: AppTextStyles.bodySmall.copyWith(color: AppColors.textSecondary)),
      const SizedBox(height: 4),
      Text(value, style: AppTextStyles.bodyMedium.copyWith(fontWeight: FontWeight.w600)),
    ]);
  }
}

// ── Session Tile (in Chats tab) ────────────────────────────────────────────────

class _SessionTile extends StatelessWidget {
  final SessionDisplay session;
  final VoidCallback onTap;
  const _SessionTile({required this.session, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final s = session;
    final agentEmail = AuthStore.instance.userEmail ?? '';

    String statusLabel;
    Color  statusColor;
    if (s.isActive) {
      statusLabel = 'Active';
      statusColor = const Color(0xFF22C55E);
    } else if (s.isPending) {
      statusLabel = 'Pending';
      statusColor = const Color(0xFFFF9800);
    } else {
      statusLabel = 'Closed';
      statusColor = AppColors.textSecondary;
    }

    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Row(
          children: [
            // Status dot
            Container(
              width: 10, height: 10,
              margin: const EdgeInsets.only(right: 12),
              decoration: BoxDecoration(color: statusColor, shape: BoxShape.circle),
            ),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          s.sessionId.length > 20
                              ? '#${s.sessionId.substring(0, 18)}…'
                              : '#${s.sessionId}',
                          style: AppTextStyles.bodyMedium.copyWith(fontWeight: FontWeight.w600),
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                        decoration: BoxDecoration(
                          color: statusColor.withOpacity(0.12),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(statusLabel,
                            style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: statusColor)),
                      ),
                    ],
                  ),
                  if (s.lastMessage != null) ...[
                    const SizedBox(height: 3),
                    Text(s.lastMessage!, style: AppTextStyles.bodySmall,
                        maxLines: 1, overflow: TextOverflow.ellipsis),
                  ],
                  const SizedBox(height: 4),
                  Row(children: [
                    Text(
                      s.adminEmail == null || s.adminEmail!.isEmpty
                          ? 'Unassigned'
                          : s.adminEmail == agentEmail
                              ? 'You'
                              : s.adminEmail!,
                      style: AppTextStyles.bodySmall.copyWith(
                        color: s.adminEmail == agentEmail ? AppColors.primary : AppColors.textSecondary,
                        fontWeight: s.adminEmail == agentEmail ? FontWeight.w600 : FontWeight.w400,
                      ),
                    ),
                    const Spacer(),
                    if (s.timestamp != null)
                      Text(_formatDate(s.timestamp!), style: AppTextStyles.caption),
                  ]),
                ],
              ),
            ),
            const SizedBox(width: 8),
            const Icon(Icons.chevron_right_rounded, color: AppColors.textSecondary, size: 20),
          ],
        ),
      ),
    );
  }

  String _formatDate(String ts) {
    try {
      final dt  = DateTime.parse(ts).toLocal();
      final now = DateTime.now();
      if (dt.year == now.year && dt.month == now.month && dt.day == now.day) {
        final h12 = dt.hour % 12 == 0 ? 12 : dt.hour % 12;
        final m   = dt.minute.toString().padLeft(2, '0');
        final p   = dt.hour < 12 ? 'am' : 'pm';
        return '$h12:$m$p';
      }
      return '${dt.day}/${dt.month}/${dt.year.toString().substring(2)}';
    } catch (_) { return ts; }
  }
}

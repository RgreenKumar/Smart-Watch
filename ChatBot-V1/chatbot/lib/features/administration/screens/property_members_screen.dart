// lib/features/administration/screens/property_members_screen.dart  (MODIFIED)
// Replaces AdminMockData with real AdminService calls. All UI unchanged.

import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/widgets/chat_avatar.dart';
import '../../../core/widgets/floating_toast.dart';
import '../services/admin_service.dart';
import 'add_member_screen.dart';

class PropertyMembersScreen extends StatefulWidget {
  const PropertyMembersScreen({super.key});

  @override
  State<PropertyMembersScreen> createState() => _PropertyMembersScreenState();
}

class _PropertyMembersScreenState extends State<PropertyMembersScreen> {
  List<AgentDto> _members  = [];
  List<AgentDto> _filtered = [];
  final _searchCtrl = TextEditingController();
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final list = await AdminService.instance.getAllAgents();
      if (!mounted) return;
      setState(() { _members = list; _filtered = List.from(list); _loading = false; });
    } catch (e) {
      if (!mounted) return;
      setState(() => _loading = false);
      FloatingToast.show(context, message: 'Failed to load members');
    }
  }

  void _search(String q) {
    setState(() {
      _filtered = _members.where((m) =>
          (m.username ?? '').toLowerCase().contains(q.toLowerCase()) ||
          m.email.toLowerCase().contains(q.toLowerCase()) ||
          m.role.toLowerCase().contains(q.toLowerCase())).toList();
    });
  }

  void _deleteMember(AgentDto m) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Remove Member'),
        content: Text('Remove "${m.displayName}" from property members?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context),
              child: const Text('Cancel', style: TextStyle(color: AppColors.textSecondary))),
          TextButton(
            onPressed: () async {
              Navigator.pop(context);
              try {
                await AdminService.instance.deleteAgent(m.id);
                await _load();
                if (mounted) FloatingToast.show(context, message: '${m.displayName} removed');
              } catch (e) {
                if (mounted) FloatingToast.show(context, message: 'Remove failed');
              }
            },
            child: const Text('Remove', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }

  void _addMember() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => AddMemberScreen(
          onSaved: () {
            _load();
            FloatingToast.show(context, message: 'Invitation sent');
          },
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F6FA),
      appBar: _buildAppBar(),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
            child: Row(
              children: [
                Expanded(
                  child: Container(
                    height: 42,
                    decoration: BoxDecoration(
                      color: AppColors.scaffoldBg,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: AppColors.divider),
                    ),
                    child: TextField(
                      controller: _searchCtrl,
                      onChanged: _search,
                      decoration: const InputDecoration(
                        hintText: 'Search members...',
                        border: InputBorder.none,
                        prefixIcon: Icon(Icons.search, color: AppColors.textSecondary, size: 20),
                        isDense: true,
                        contentPadding: EdgeInsets.symmetric(vertical: 11),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                ElevatedButton.icon(
                  onPressed: _addMember,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF28A745),
                    minimumSize: const Size(0, 42),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    padding: const EdgeInsets.symmetric(horizontal: 14),
                  ),
                  icon: const Icon(Icons.add, color: Colors.white, size: 18),
                  label: const Text('Add Member', style: TextStyle(color: Colors.white)),
                ),
              ],
            ),
          ),
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator())
                : _filtered.isEmpty
                    ? _emptyState()
                    : RefreshIndicator(
                        onRefresh: _load,
                        child: SingleChildScrollView(
                          physics: const AlwaysScrollableScrollPhysics(),
                          padding: const EdgeInsets.fromLTRB(16, 0, 16, 110),
                          child: Container(
                            decoration: BoxDecoration(
                              color: AppColors.scaffoldBg,
                              borderRadius: BorderRadius.circular(14),
                              border: Border.all(color: AppColors.divider),
                              boxShadow: const [BoxShadow(color: Colors.black12, blurRadius: 6, offset: Offset(0, 2))],
                            ),
                            child: Column(
                              children: [
                                const _TableHeader(),
                                const Divider(height: 1),
                                ..._filtered.asMap().entries.map((e) {
                                  final m = e.value;
                                  return Column(children: [
                                    _MemberRow(member: m, onDelete: () => _deleteMember(m)),
                                    if (e.key < _filtered.length - 1) const Divider(height: 1),
                                  ]);
                                }),
                              ],
                            ),
                          ),
                        ),
                      ),
          ),
        ],
      ),
    );
  }

  Widget _emptyState() {
    return Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
      Icon(Icons.badge_outlined, size: 64, color: AppColors.divider),
      const SizedBox(height: 16),
      Text('No members found', style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary)),
    ]));
  }

  PreferredSizeWidget _buildAppBar() {
    return PreferredSize(
      preferredSize: const Size.fromHeight(72),
      child: Material(elevation: 3, shadowColor: Colors.black12, color: AppColors.scaffoldBg,
        child: AppBar(
          backgroundColor: AppColors.scaffoldBg, elevation: 0, centerTitle: true,
          title: const Text('Property Members'),
          leading: IconButton(icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20), onPressed: () => Navigator.pop(context)),
          bottom: const PreferredSize(preferredSize: Size.fromHeight(1), child: Divider(height: 1)),
        )),
    );
  }
}

class _TableHeader extends StatelessWidget {
  const _TableHeader();
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(children: [
        Expanded(flex: 4, child: Text('Agent', style: AppTextStyles.bodyMedium.copyWith(fontWeight: FontWeight.w700))),
        Expanded(flex: 3, child: Text('Role', style: AppTextStyles.bodyMedium.copyWith(fontWeight: FontWeight.w700))),
        Expanded(flex: 3, child: Text('Status', style: AppTextStyles.bodyMedium.copyWith(fontWeight: FontWeight.w700))),
        const SizedBox(width: 50),
      ]),
    );
  }
}

class _MemberRow extends StatelessWidget {
  final AgentDto member;
  final VoidCallback onDelete;
  const _MemberRow({required this.member, required this.onDelete});

  Color get _roleBg => member.role == 'ADMIN' ? const Color(0xFF7B3FE4) : const Color(0xFF6B7280);
  bool  get _isActive => member.status;

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.transparent,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(children: [
        Expanded(flex: 4, child: Row(children: [
          ChatAvatar(label: member.displayName, radius: 16),
          const SizedBox(width: 8),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(member.displayName, style: AppTextStyles.bodyMedium.copyWith(fontWeight: FontWeight.w600), overflow: TextOverflow.ellipsis),
            Text(member.email, style: AppTextStyles.bodySmall, overflow: TextOverflow.ellipsis),
          ])),
        ])),
        Expanded(flex: 3, child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          decoration: BoxDecoration(
            color: _roleBg.withOpacity(0.1),
            borderRadius: BorderRadius.circular(6),
            border: Border.all(color: _roleBg.withOpacity(0.3)),
          ),
          child: Text(member.role, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: _roleBg), textAlign: TextAlign.center),
        )),
        Expanded(flex: 3, child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
          decoration: BoxDecoration(
            color: _isActive ? const Color(0xFF22C55E) : AppColors.statusClosed,
            borderRadius: BorderRadius.circular(6),
          ),
          child: Text(_isActive ? 'Active' : 'Pending',
              style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600),
              textAlign: TextAlign.center),
        )),
        SizedBox(width: 50, child: IconButton(
          icon: const Icon(Icons.delete_outline_rounded, color: Colors.red, size: 20),
          onPressed: onDelete,
          tooltip: 'Remove',
        )),
      ]),
    );
  }
}

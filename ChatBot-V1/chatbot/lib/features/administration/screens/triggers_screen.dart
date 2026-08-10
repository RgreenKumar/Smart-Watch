// lib/features/administration/screens/triggers_screen.dart  (MODIFIED)
// Replaces TriggerMockData with AdminService.getAllTriggers(), toggleTriggerStatus(),
// deleteTrigger(). All UI structure unchanged.

import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/widgets/floating_toast.dart';
import '../services/admin_service.dart';
import 'add_trigger_screen.dart';

class TriggersScreen extends StatefulWidget {
  const TriggersScreen({super.key});

  @override
  State<TriggersScreen> createState() => _TriggersScreenState();
}

class _TriggersScreenState extends State<TriggersScreen> {
  List<TriggerDto> _triggers = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final list = await AdminService.instance.getAllTriggers();
      if (!mounted) return;
      setState(() { _triggers = list; _loading = false; });
    } catch (_) {
      if (!mounted) return;
      setState(() => _loading = false);
      FloatingToast.show(context, message: 'Failed to load triggers');
    }
  }

  Future<void> _toggleEnabled(TriggerDto t, bool val) async {
    try {
      await AdminService.instance.toggleTriggerStatus(t.triggerId, enabled: val);
      await _load(); // reload so only one is active at a time
    } catch (_) {
      FloatingToast.show(context, message: 'Toggle failed');
    }
  }

  void _delete(TriggerDto t) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Delete Trigger'),
        content: Text('Delete "${t.name}"?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context),
              child: const Text('Cancel', style: TextStyle(color: AppColors.textSecondary))),
          TextButton(
            onPressed: () async {
              Navigator.pop(context);
              try {
                await AdminService.instance.deleteTrigger(t.triggerId);
                await _load();
                if (mounted) FloatingToast.show(context, message: '"${t.name}" deleted');
              } catch (_) {
                if (mounted) FloatingToast.show(context, message: 'Delete failed');
              }
            },
            child: const Text('Delete', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }

  void _edit(TriggerDto t) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => AddTriggerScreen(
          existing: t,
          onSaved: () { _load(); FloatingToast.show(context, message: 'Trigger updated'); },
        ),
      ),
    );
  }

  void _addTrigger() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => AddTriggerScreen(
          onSaved: () { _load(); FloatingToast.show(context, message: 'Trigger created'); },
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
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Triggers', style: AppTextStyles.heading2),
                ElevatedButton.icon(
                  onPressed: _addTrigger,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF28A745),
                    minimumSize: const Size(0, 42),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                  ),
                  icon: const Icon(Icons.add, color: Colors.white, size: 18),
                  label: const Text('Add Trigger', style: TextStyle(color: Colors.white)),
                ),
              ],
            ),
          ),
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator())
                : _triggers.isEmpty
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
                                const _TriggerTableHeader(),
                                const Divider(height: 1),
                                ..._triggers.asMap().entries.map((e) {
                                  final t = e.value;
                                  return Column(children: [
                                    _TriggerRow(
                                      trigger: t,
                                      onToggleEnabled: (v) => _toggleEnabled(t, v),
                                      onEdit: () => _edit(t),
                                      onDelete: () => _delete(t),
                                    ),
                                    if (e.key < _triggers.length - 1) const Divider(height: 1),
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
      Icon(Icons.bolt_outlined, size: 64, color: AppColors.divider),
      const SizedBox(height: 14),
      Text('No triggers yet', style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary)),
    ]));
  }

  PreferredSizeWidget _buildAppBar() {
    return PreferredSize(
      preferredSize: const Size.fromHeight(72),
      child: Material(elevation: 3, shadowColor: Colors.black12, color: AppColors.scaffoldBg,
        child: AppBar(
          backgroundColor: AppColors.scaffoldBg, elevation: 0, centerTitle: true,
          title: const Text('Administration'),
          leading: IconButton(icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20), onPressed: () => Navigator.pop(context)),
          bottom: const PreferredSize(preferredSize: Size.fromHeight(1), child: Divider(height: 1)),
        )),
    );
  }
}

// ── Table Header ──────────────────────────────────────────

class _TriggerTableHeader extends StatelessWidget {
  const _TriggerTableHeader();
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(children: [
        Expanded(flex: 3, child: Text('Name', style: AppTextStyles.bodyMedium.copyWith(fontWeight: FontWeight.w700))),
        Expanded(flex: 4, child: Text('Type / Delay', style: AppTextStyles.bodyMedium.copyWith(fontWeight: FontWeight.w700))),
        const SizedBox(width: 60, child: Text('Active', style: TextStyle(fontWeight: FontWeight.w700))),
        const SizedBox(width: 70, child: Text('Action', style: TextStyle(fontWeight: FontWeight.w700))),
      ]),
    );
  }
}

class _TriggerRow extends StatelessWidget {
  final TriggerDto trigger;
  final ValueChanged<bool> onToggleEnabled;
  final VoidCallback onEdit;
  final VoidCallback onDelete;
  const _TriggerRow({required this.trigger, required this.onToggleEnabled, required this.onEdit, required this.onDelete});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.transparent,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(children: [
        Expanded(flex: 3, child: Text(trigger.name,
            style: AppTextStyles.bodyMedium.copyWith(fontWeight: FontWeight.w600),
            overflow: TextOverflow.ellipsis)),
        Expanded(flex: 4, child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
            decoration: BoxDecoration(color: AppColors.surfaceBg, borderRadius: BorderRadius.circular(6), border: Border.all(color: AppColors.divider)),
            child: Text(trigger.triggerType?.name ?? 'Basic',
                style: AppTextStyles.caption.copyWith(fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
          ),
          if (trigger.delay > 0) ...[
            const SizedBox(height: 2),
            Text('${trigger.delay}s delay', style: AppTextStyles.bodySmall),
          ],
        ])),
        SizedBox(width: 60, child: Switch.adaptive(
          value: trigger.status,
          onChanged: onToggleEnabled,
          activeColor: AppColors.primary,
          materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
        )),
        SizedBox(width: 70, child: Row(mainAxisAlignment: MainAxisAlignment.end, children: [
          _ActionIcon(icon: Icons.edit_outlined, color: const Color(0xFF28A745), onTap: onEdit, tooltip: 'Edit'),
          const SizedBox(width: 6),
          _ActionIcon(icon: Icons.delete_outline_rounded, color: Colors.red, onTap: onDelete, tooltip: 'Delete'),
        ])),
      ]),
    );
  }
}

class _ActionIcon extends StatelessWidget {
  final IconData icon; final Color color; final VoidCallback onTap; final String tooltip;
  const _ActionIcon({required this.icon, required this.color, required this.onTap, required this.tooltip});
  @override
  Widget build(BuildContext context) {
    return Tooltip(message: tooltip, child: GestureDetector(onTap: onTap, child: Container(
      width: 30, height: 30,
      decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(6)),
      child: Icon(icon, color: Colors.white, size: 16),
    )));
  }
}

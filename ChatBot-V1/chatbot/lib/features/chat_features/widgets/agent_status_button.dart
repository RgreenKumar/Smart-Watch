// lib/features/chat_features/widgets/agent_status_button.dart
// Compact status pill shown in the Dashboard appbar.
// Tapping opens a dropdown to change status.

import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/widgets/floating_toast.dart';
import '../services/chat_features_service.dart';

class AgentStatusButton extends StatefulWidget {
  const AgentStatusButton({super.key});

  @override
  State<AgentStatusButton> createState() => _AgentStatusButtonState();
}

class _AgentStatusButtonState extends State<AgentStatusButton> {
  AgentStatus _current = AgentStatus.online;
  bool _loading = false;

  @override
  void initState() {
    super.initState();
    // Set initial status to Online when dashboard opens
    _setStatus(AgentStatus.online, silent: true);
  }

  Future<void> _setStatus(AgentStatus s, {bool silent = false}) async {
    setState(() { _current = s; _loading = true; });
    try {
      await ChatFeaturesService.instance.updateMyStatus(s);
      if (!silent && mounted) {
        FloatingToast.show(context, message: 'Status set to ${_label(s)}');
      }
    } catch (_) {}
    if (mounted) setState(() => _loading = false);
  }

  Color _color(AgentStatus s) => switch (s) {
    AgentStatus.online  => const Color(0xFF22C55E),
    AgentStatus.away    => const Color(0xFFFF9800),
    AgentStatus.offline => const Color(0xFF9CA3AF),
  };

  String _label(AgentStatus s) => switch (s) {
    AgentStatus.online  => 'Online',
    AgentStatus.away    => 'Away',
    AgentStatus.offline => 'Offline',
  };

  @override
  Widget build(BuildContext context) {
    return PopupMenuButton<AgentStatus>(
      tooltip: 'Change status',
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      offset: const Offset(0, 40),
      onSelected: _setStatus,
      itemBuilder: (_) => AgentStatus.values.map((s) => PopupMenuItem(
        value: s,
        child: Row(
          children: [
            Container(
              width: 10, height: 10,
              margin: const EdgeInsets.only(right: 10),
              decoration: BoxDecoration(color: _color(s), shape: BoxShape.circle),
            ),
            Text(_label(s),
                style: TextStyle(
                  fontWeight: s == _current ? FontWeight.w700 : FontWeight.w400,
                  color: s == _current ? AppColors.primary : AppColors.textPrimary,
                )),
            if (s == _current) ...[
              const Spacer(),
              const Icon(Icons.check_rounded, size: 16, color: AppColors.primary),
            ],
          ],
        ),
      )).toList(),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
        decoration: BoxDecoration(
          color: _color(_current).withOpacity(0.12),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: _color(_current).withOpacity(0.4)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (_loading)
              SizedBox(
                width: 8, height: 8,
                child: CircularProgressIndicator(
                    strokeWidth: 1.5, color: _color(_current)),
              )
            else
              Container(
                width: 8, height: 8,
                decoration: BoxDecoration(
                    color: _color(_current), shape: BoxShape.circle),
              ),
            const SizedBox(width: 6),
            Text(_label(_current),
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  color: _color(_current),
                )),
            const SizedBox(width: 4),
            Icon(Icons.arrow_drop_down_rounded,
                size: 16, color: _color(_current)),
          ],
        ),
      ),
    );
  }
}

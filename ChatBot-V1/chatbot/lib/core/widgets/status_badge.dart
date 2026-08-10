import 'package:flutter/material.dart';
import '../theme/app_colors.dart';

enum ChatStatus { open, closed, newVisitor, missed }

class StatusBadge extends StatelessWidget {
  final ChatStatus status;

  const StatusBadge({super.key, required this.status});

  factory StatusBadge.fromString(String s) {
    switch (s.toLowerCase()) {
      case 'open':
        return const StatusBadge(status: ChatStatus.open);
      case 'closed':
        return const StatusBadge(status: ChatStatus.closed);
      case 'new':
        return const StatusBadge(status: ChatStatus.newVisitor);
      default:
        return const StatusBadge(status: ChatStatus.closed);
    }
  }

  Color get _bg {
    switch (status) {
      case ChatStatus.open:
        return AppColors.statusOpen;
      case ChatStatus.closed:
        return AppColors.statusClosed;
      case ChatStatus.newVisitor:
        return AppColors.statusNew;
      case ChatStatus.missed:
        return AppColors.missedRed;
    }
  }

  String get _label {
    switch (status) {
      case ChatStatus.open:
        return 'Open';
      case ChatStatus.closed:
        return 'Closed';
      case ChatStatus.newVisitor:
        return 'New';
      case ChatStatus.missed:
        return 'Missed';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: _bg,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        _label,
        style: const TextStyle(
          color: Colors.white,
          fontSize: 11,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}

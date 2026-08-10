import 'package:flutter/material.dart';
import '../models/rag_models.dart';
import '../models/rag_app_colors.dart';
import '../models/rag_app_text_styles.dart';

class AlertBanner extends StatelessWidget {
  final AlertData? alert;

  const AlertBanner({super.key, required this.alert});

  @override
  Widget build(BuildContext context) {
    if (alert == null) return const SizedBox.shrink();

    final (bgColor, borderColor, textColor, icon) = switch (alert!.type) {
      AlertType.success => (
          const Color(0xFFEAF7EF),
          RagAppColors.green,
          RagAppColors.green,
          Icons.check_circle_outline,
        ),
      AlertType.error => (
          const Color(0xFFFFF0F0),
          RagAppColors.red,
          RagAppColors.red,
          Icons.error_outline,
        ),
      AlertType.warn => (
          const Color(0xFFFFF8E6),
          RagAppColors.gold,
          RagAppColors.gold,
          Icons.warning_amber_outlined,
        ),
      AlertType.info => (
          const Color(0xFFECF3FB),
          RagAppColors.blue,
          RagAppColors.blue,
          Icons.info_outline,
        ),
    };

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(10),
        border: Border(
          left: BorderSide(color: borderColor, width: 3),
        ),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 16, color: textColor),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              alert!.message,
              style: RagAppTextStyles.alertText.copyWith(color: textColor),
            ),
          ),
        ],
      ),
    );
  }
}

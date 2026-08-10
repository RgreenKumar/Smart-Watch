import 'package:flutter/material.dart';
import '../models/rag_app_colors.dart';
import '../models/rag_app_text_styles.dart';

class RagCard extends StatelessWidget {
  final String label;
  final List<Widget> children;

  const RagCard({
    super.key,
    required this.label,
    required this.children,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: RagAppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: RagAppColors.border),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label.toUpperCase(),
            style: RagAppTextStyles.cardLabel,
          ),
          const SizedBox(height: 14),
          ...children,
        ],
      ),
    );
  }
}

class SectionHeader extends StatelessWidget {
  final String title;
  final String subtitle;
  final Widget? trailing;

  const SectionHeader({
    super.key,
    required this.title,
    required this.subtitle,
    this.trailing,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: RagAppTextStyles.sectionTitle),
              const SizedBox(height: 4),
              Text(subtitle, style: RagAppTextStyles.sectionSub),
            ],
          ),
        ),
        if (trailing != null) trailing!,
      ],
    );
  }
}

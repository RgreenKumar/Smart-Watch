import 'package:flutter/material.dart';
import '../models/rag_app_colors.dart';
import '../models/rag_app_text_styles.dart';

class BackendOptionCard extends StatelessWidget {
  final String title;
  final String badgeLabel;
  final bool isSafe;
  final String description;
  final bool isSelected;
  final VoidCallback onTap;

  const BackendOptionCard({
    super.key,
    required this.title,
    required this.badgeLabel,
    required this.isSafe,
    required this.description,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFFF0F0F0) : Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? Colors.black : RagAppColors.border2,
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    title,
                    style: isSelected
                        ? RagAppTextStyles.modeNameSelected
                        : RagAppTextStyles.modeName,
                  ),
                ),
                _BackendBadge(label: badgeLabel, isSafe: isSafe),
              ],
            ),
            const SizedBox(height: 4),
            RichText(
              text: TextSpan(
                style: RagAppTextStyles.modeDesc,
                children: _parseDescription(description),
              ),
            ),
          ],
        ),
      ),
    );
  }

  List<TextSpan> _parseDescription(String desc) {
    final parts = desc.split('`');
    return parts.asMap().entries.map((e) {
      final isCode = e.key.isOdd;
      return TextSpan(
        text: e.value,
        style: isCode
            ? const TextStyle(
                fontFamily: 'monospace',
                fontSize: 11,
                color: Colors.black,
                fontWeight: FontWeight.w600,
              )
            : RagAppTextStyles.modeDesc,
      );
    }).toList();
  }
}

class _BackendBadge extends StatelessWidget {
  final String label;
  final bool isSafe;

  const _BackendBadge({required this.label, required this.isSafe});

  @override
  Widget build(BuildContext context) {
    final bg = isSafe ? const Color(0xFFE8F5EE) : const Color(0xFFFFF3CD);
    final fg = isSafe ? RagAppColors.green : RagAppColors.gold;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(4),
      ),
      child: Text(
        label,
        style: RagAppTextStyles.badgeText.copyWith(color: fg),
      ),
    );
  }
}

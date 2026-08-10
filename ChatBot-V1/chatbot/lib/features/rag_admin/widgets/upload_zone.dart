import 'package:flutter/material.dart';
import '../models/rag_app_colors.dart';
import '../models/rag_app_text_styles.dart';

class UploadZone extends StatefulWidget {
  final VoidCallback onTap;
  const UploadZone({super.key, required this.onTap});

  @override
  State<UploadZone> createState() => _UploadZoneState();
}

class _UploadZoneState extends State<UploadZone> {
  bool _isHovered = false;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: widget.onTap,
      onTapDown: (_) => setState(() => _isHovered = true),
      onTapUp: (_) => setState(() => _isHovered = false),
      onTapCancel: () => setState(() => _isHovered = false),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 36),
        decoration: BoxDecoration(
          color: _isHovered ? const Color(0xFFF0F0F0) : Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: _isHovered ? Colors.black : RagAppColors.border2,
            width: 2,
          ),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.cloud_upload_outlined,
              size: 36,
              color: _isHovered ? Colors.black : RagAppColors.muted,
            ),
            const SizedBox(height: 10),
            const Text(
              'Tap to browse files',
              style: RagAppTextStyles.uploadTitle,
            ),
            const SizedBox(height: 5),
            const Text(
              'Files indexed to ChromaDB vector store',
              style: RagAppTextStyles.uploadSub,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 12),
            Wrap(
              spacing: 6,
              runSpacing: 6,
              alignment: WrapAlignment.center,
              children: const [
                _FileTag('.txt'),
                _FileTag('.pdf'),
                _FileTag('.docx'),
                _FileTag('.csv'),
                _FileTag('.xlsx'),
                _FileTag('.json'),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _FileTag extends StatelessWidget {
  final String label;
  const _FileTag(this.label);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(
        color: RagAppColors.surface2,
        borderRadius: BorderRadius.circular(4),
        border: Border.all(color: RagAppColors.border2),
      ),
      child: Text(
        label,
        style: const TextStyle(
          fontSize: 10,
          fontFamily: 'monospace',
          color: RagAppColors.muted,
        ),
      ),
    );
  }
}

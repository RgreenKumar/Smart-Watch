import 'package:flutter/material.dart';
import '../models/rag_models.dart';
import '../models/rag_app_colors.dart';
import '../models/rag_app_text_styles.dart';

class FileQueueItemWidget extends StatelessWidget {
  final FileQueueItem item;
  final VoidCallback onRemove;

  const FileQueueItemWidget({
    super.key,
    required this.item,
    required this.onRemove,
  });

  IconData get _fileIcon {
    final ext = item.name.split('.').last.toLowerCase();
    return switch (ext) {
      'pdf'           => Icons.picture_as_pdf_outlined,
      'docx'          => Icons.description_outlined,
      'csv' || 'xlsx' => Icons.table_chart_outlined,
      'json'          => Icons.data_object_outlined,
      _               => Icons.insert_drive_file_outlined,
    };
  }

  String get _formattedSize {
    final b = item.sizeBytes;
    if (b < 1024) return '$b B';
    if (b < 1048576) return '${(b / 1024).toStringAsFixed(1)} KB';
    return '${(b / 1048576).toStringAsFixed(1)} MB';
  }

  (Color bg, Color fg) get _statusColors => switch (item.status) {
    FileStatus.ready    => (RagAppColors.surface2, RagAppColors.muted),
    FileStatus.success  => (const Color(0xFFE8F5EE), RagAppColors.green),
    FileStatus.error    => (RagAppColors.redDim, RagAppColors.red),
    FileStatus.uploading || FileStatus.indexing =>
                           (const Color(0xFFE8F0FF), RagAppColors.blue),
  };

  String get _statusLabel => switch (item.status) {
    FileStatus.ready    => 'READY',
    FileStatus.uploading => 'UPLOADING',
    FileStatus.indexing  => 'INDEXING',
    FileStatus.success   => item.statusLabel,
    FileStatus.error     => 'ERROR',
  };

  @override
  Widget build(BuildContext context) {
    final (bgColor, fgColor) = _statusColors;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: RagAppColors.border),
      ),
      child: Row(
        children: [
          Icon(_fileIcon, size: 18, color: RagAppColors.muted),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item.name,
                  style: RagAppTextStyles.fileItemName,
                  overflow: TextOverflow.ellipsis,
                  maxLines: 1,
                ),
                const SizedBox(height: 2),
                Text(_formattedSize, style: RagAppTextStyles.fileItemSize),
              ],
            ),
          ),
          const SizedBox(width: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
            decoration: BoxDecoration(
              color: bgColor,
              borderRadius: BorderRadius.circular(4),
            ),
            child: Text(
              _statusLabel,
              style: RagAppTextStyles.badgeText.copyWith(
                color: fgColor,
                fontSize: 10,
              ),
            ),
          ),
          const SizedBox(width: 8),
          GestureDetector(
            onTap: onRemove,
            child: const Padding(
              padding: EdgeInsets.all(4),
              child: Icon(Icons.close, size: 16, color: RagAppColors.muted),
            ),
          ),
        ],
      ),
    );
  }
}

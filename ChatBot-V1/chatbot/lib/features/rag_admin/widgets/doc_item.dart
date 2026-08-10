import 'package:flutter/material.dart';
import '../models/rag_models.dart';
import '../models/rag_app_colors.dart';
import '../models/rag_app_text_styles.dart';

class DocItem extends StatelessWidget {
  final IndexedDocument doc;
  final VoidCallback onDelete;

  const DocItem({
    super.key,
    required this.doc,
    required this.onDelete,
  });

  IconData get _fileIcon {
    final ext = doc.source.split('.').last.toLowerCase();
    return switch (ext) {
      'pdf'              => Icons.picture_as_pdf_outlined,
      'docx'             => Icons.description_outlined,
      'csv' || 'xlsx'    => Icons.table_chart_outlined,
      'json'             => Icons.data_object_outlined,
      _                  => Icons.insert_drive_file_outlined,
    };
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: RagAppColors.border),
      ),
      child: Row(
        children: [
          Icon(_fileIcon, size: 22, color: RagAppColors.muted),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  doc.source,
                  style: RagAppTextStyles.docName,
                  overflow: TextOverflow.ellipsis,
                  maxLines: 1,
                ),
                const SizedBox(height: 3),
                Text(
                  '${doc.chunkCount} chunks indexed',
                  style: RagAppTextStyles.docChunks,
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          GestureDetector(
            onTap: onDelete,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: RagAppColors.border2),
              ),
              child: const Icon(Icons.delete_outline, size: 16, color: RagAppColors.muted),
            ),
          ),
        ],
      ),
    );
  }
}

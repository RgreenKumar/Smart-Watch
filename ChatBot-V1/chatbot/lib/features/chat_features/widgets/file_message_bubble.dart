// lib/features/chat_features/widgets/file_message_bubble.dart
// Renders a file/image message bubble in the chat.
// Content format: {"type":"FILE","url":"...","filename":"...","size":12345,"ext":"pdf"}

import 'dart:convert';
import 'package:flutter/material.dart';
import '../../../core/services/api_client.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../services/chat_features_service.dart';

/// Call this to check if a chat message content is a file payload.
bool isFileMessage(String content) {
  try {
    final j = jsonDecode(content) as Map<String, dynamic>;
    return j['type'] == 'FILE';
  } catch (_) { return false; }
}

/// Parse the file payload from message content.
UploadedFile? parseFileMessage(String content) {
  try {
    final j = jsonDecode(content) as Map<String, dynamic>;
    if (j['type'] != 'FILE') return null;
    return UploadedFile(
      url:      j['url']      as String,
      filename: j['filename'] as String,
      size:     (j['size']    as num).toInt(),
      ext:      j['ext']      as String? ?? '',
    );
  } catch (_) { return null; }
}

/// Build file content JSON string to embed in chat message.
String buildFileMessageContent(UploadedFile file) {
  return jsonEncode({
    'type':     'FILE',
    'url':      file.url,
    'filename': file.filename,
    'size':     file.size,
    'ext':      file.ext,
  });
}

class FileBubble extends StatelessWidget {
  final String   content;
  final bool     isAgent;

  const FileBubble({super.key, required this.content, required this.isAgent});

  @override
  Widget build(BuildContext context) {
    final file = parseFileMessage(content);
    if (file == null) {
      return Text(content, style: TextStyle(
          color: isAgent ? Colors.white : AppColors.textPrimary));
    }

    final fileUrl = '${springBaseUrl}${file.url}';
    final bgColor = isAgent ? AppColors.primary : AppColors.surfaceBg;

    // Image — show inline preview
    if (file.isImage) {
      return ClipRRect(
        borderRadius: BorderRadius.circular(10),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Image.network(
              fileUrl,
              width: 220,
              fit: BoxFit.cover,
              errorBuilder: (_, __, ___) => Container(
                width: 220, height: 120,
                color: AppColors.surfaceBg,
                child: const Icon(Icons.broken_image_outlined,
                    color: AppColors.textSecondary),
              ),
              loadingBuilder: (_, child, progress) {
                if (progress == null) return child;
                return Container(
                  width: 220, height: 120, color: AppColors.surfaceBg,
                  child: const Center(child: CircularProgressIndicator()),
                );
              },
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              color: bgColor.withOpacity(0.85),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.image_outlined,
                      size: 14, color: isAgent ? Colors.white70 : AppColors.textSecondary),
                  const SizedBox(width: 4),
                  Text(file.filename,
                      style: TextStyle(
                          fontSize: 12,
                          color: isAgent ? Colors.white70 : AppColors.textSecondary),
                      maxLines: 1, overflow: TextOverflow.ellipsis),
                  const SizedBox(width: 6),
                  Text(file.sizeLabel,
                      style: TextStyle(
                          fontSize: 11,
                          color: isAgent ? Colors.white54 : AppColors.textHint)),
                ],
              ),
            ),
          ],
        ),
      );
    }

    // Other file types — download card
    return Container(
      padding: const EdgeInsets.all(12),
      constraints: const BoxConstraints(maxWidth: 240),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 40, height: 40,
            decoration: BoxDecoration(
              color: isAgent ? Colors.white.withOpacity(0.2) : AppColors.primary.withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(
              _iconForExt(file.ext),
              color: isAgent ? Colors.white : AppColors.primary,
              size: 22,
            ),
          ),
          const SizedBox(width: 10),
          Flexible(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  file.filename,
                  style: TextStyle(
                    fontSize: 13, fontWeight: FontWeight.w600,
                    color: isAgent ? Colors.white : AppColors.textPrimary,
                  ),
                  maxLines: 2, overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 2),
                Text(
                  '${file.ext.toUpperCase()}  •  ${file.sizeLabel}',
                  style: TextStyle(
                    fontSize: 11,
                    color: isAgent ? Colors.white70 : AppColors.textSecondary,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          Icon(
            Icons.download_rounded,
            size: 18,
            color: isAgent ? Colors.white70 : AppColors.textSecondary,
          ),
        ],
      ),
    );
  }

  IconData _iconForExt(String ext) {
    switch (ext.toLowerCase()) {
      case 'pdf':   return Icons.picture_as_pdf_outlined;
      case 'doc':
      case 'docx':  return Icons.description_outlined;
      case 'xls':
      case 'xlsx':  return Icons.table_chart_outlined;
      case 'zip':   return Icons.folder_zip_outlined;
      case 'txt':   return Icons.text_snippet_outlined;
      default:      return Icons.insert_drive_file_outlined;
    }
  }
}

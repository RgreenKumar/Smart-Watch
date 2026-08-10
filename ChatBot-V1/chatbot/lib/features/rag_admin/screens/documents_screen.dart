// lib/features/rag_admin/screens/documents_screen.dart  (MODIFIED)
// ─────────────────────────────────────────────────────────────────────────────
// Changes vs original:
//   1. Removed hardcoded _documents list
//   2. _refresh() calls RagService.instance.getSources()
//   3. _deleteDocument() calls RagService.instance.deleteSource(source)
//   4. All UI structure, DocItem widget, DeleteConfirmSheet UNCHANGED
// ─────────────────────────────────────────────────────────────────────────────

import 'package:flutter/material.dart';
import '../models/rag_models.dart';
import '../services/rag_service.dart';
import '../widgets/doc_item.dart';
import '../widgets/rag_card.dart';
import '../models/rag_app_colors.dart';
import '../models/rag_app_text_styles.dart';

class DocumentsScreen extends StatefulWidget {
  const DocumentsScreen({super.key});

  @override
  State<DocumentsScreen> createState() => _DocumentsScreenState();
}

class _DocumentsScreenState extends State<DocumentsScreen> {
  bool _isLoading = false;
  List<IndexedDocument> _documents = [];
  String? _error;

  @override
  void initState() {
    super.initState();
    _refresh();
  }

  // ── CHANGED: real API call ─────────────────────────────────────────────────
  Future<void> _refresh() async {
    setState(() { _isLoading = true; _error = null; });
    try {
      final sources = await RagService.instance.getSources();
      if (!mounted) return;
      setState(() {
        _documents = sources
            .map((s) => IndexedDocument(source: s.source, chunkCount: s.chunkCount))
            .toList();
        _isLoading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() { _error = e.toString(); _isLoading = false; });
    }
  }

  // ── CHANGED: real delete API call ─────────────────────────────────────────
  void _deleteDocument(int index) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (_) => _DeleteConfirmSheet(
        docName: _documents[index].source,
        onConfirm: () async {
          Navigator.pop(context);
          try {
            await RagService.instance.deleteSource(_documents[index].source);
            await _refresh(); // reload from server
            if (mounted) {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Source deleted')),
              );
            }
          } catch (e) {
            if (mounted) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('Delete failed: $e')),
              );
            }
          }
        },
        onCancel: () => Navigator.pop(context),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(16, 20, 16, 100),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Expanded(
                child: SectionHeader(
                  title: 'Documents',
                  subtitle: 'Indexed in vector store',
                ),
              ),
              const SizedBox(width: 12),
              GestureDetector(
                onTap: _refresh,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: RagAppColors.border2),
                  ),
                  child: Row(
                    children: [
                      if (_isLoading)
                        const SizedBox(
                          width: 12, height: 12,
                          child: CircularProgressIndicator(strokeWidth: 1.5, color: Colors.black),
                        )
                      else
                        const Icon(Icons.refresh, size: 14, color: Colors.black),
                      const SizedBox(width: 4),
                      const Text('Refresh',
                          style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Colors.black)),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          if (_error != null)
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFFFFF5F5),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: RagAppColors.red.withOpacity(0.3)),
              ),
              child: Text(_error!,
                  style: const TextStyle(color: RagAppColors.red, fontSize: 12)),
            )
          else if (_isLoading)
            const _LoadingState()
          else if (_documents.isEmpty)
            const _EmptyState()
          else
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _documents.length,
              separatorBuilder: (_, __) => const SizedBox(height: 8),
              itemBuilder: (_, i) => DocItem(
                doc: _documents[i],
                onDelete: () => _deleteDocument(i),
              ),
            ),
        ],
      ),
    );
  }
}

// ── Sub-widgets (unchanged from original) ─────────────────────────────────────

class _LoadingState extends StatelessWidget {
  const _LoadingState();
  @override
  Widget build(BuildContext context) {
    return const Center(
      child: Padding(
        padding: EdgeInsets.symmetric(vertical: 48),
        child: Text('Loading...', style: TextStyle(fontSize: 13, color: RagAppColors.muted)),
      ),
    );
  }
}

class _EmptyState extends StatelessWidget {
  const _EmptyState();
  @override
  Widget build(BuildContext context) {
    return const Center(
      child: Padding(
        padding: EdgeInsets.symmetric(vertical: 48),
        child: Column(
          children: [
            Icon(Icons.inbox_outlined, size: 36, color: RagAppColors.muted),
            SizedBox(height: 12),
            Text('No documents indexed yet',
                style: TextStyle(fontSize: 13, color: RagAppColors.muted)),
          ],
        ),
      ),
    );
  }
}

class _DeleteConfirmSheet extends StatelessWidget {
  final String docName;
  final VoidCallback onConfirm;
  final VoidCallback onCancel;

  const _DeleteConfirmSheet({
    required this.docName,
    required this.onConfirm,
    required this.onCancel,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        border: Border(
          top:   BorderSide(color: RagAppColors.border),
          left:  BorderSide(color: RagAppColors.border),
          right: BorderSide(color: RagAppColors.border),
        ),
      ),
      padding: EdgeInsets.fromLTRB(24, 24, 24, 24 + MediaQuery.of(context).padding.bottom),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 40, height: 4,
            margin: const EdgeInsets.only(bottom: 20),
            decoration: BoxDecoration(color: RagAppColors.border2, borderRadius: BorderRadius.circular(2)),
          ),
          Row(
            children: const [
              Icon(Icons.delete_outline, size: 20, color: RagAppColors.red),
              SizedBox(width: 10),
              Text('Delete Source', style: RagAppTextStyles.dialogTitle),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            'Delete all chunks from "$docName"?\n\nThis action cannot be undone. The chatbot will lose all knowledge from this document.',
            style: RagAppTextStyles.dialogBody,
          ),
          const SizedBox(height: 24),
          GestureDetector(
            onTap: onConfirm,
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 13),
              decoration: BoxDecoration(
                color: Colors.transparent,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: RagAppColors.red.withOpacity(0.6)),
              ),
              child: const Text('Delete All Chunks',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: RagAppColors.red)),
            ),
          ),
          const SizedBox(height: 10),
          GestureDetector(
            onTap: onCancel,
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 13),
              decoration: BoxDecoration(
                color: RagAppColors.surface2,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: RagAppColors.border2),
              ),
              child: const Text('Cancel',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Colors.black)),
            ),
          ),
        ],
      ),
    );
  }
}

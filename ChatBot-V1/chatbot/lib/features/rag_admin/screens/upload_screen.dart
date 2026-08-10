// lib/features/rag_admin/screens/upload_screen.dart  (MODIFIED — web-safe)
// Uses file_picker bytes API (no dart:io File). Works on Web, Windows, all platforms.

import 'dart:typed_data';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import '../models/rag_models.dart';
import '../services/rag_service.dart';
import '../widgets/alert_banner.dart';
import '../widgets/file_queue_item.dart';
import '../widgets/mode_option_card.dart';
import '../widgets/rag_card.dart';
import '../widgets/upload_zone.dart';
import '../models/rag_app_colors.dart';
import '../models/rag_app_text_styles.dart';

class UploadScreen extends StatefulWidget {
  const UploadScreen({super.key});

  @override
  State<UploadScreen> createState() => _UploadScreenState();
}

class _UploadScreenState extends State<UploadScreen> {
  IngestMode _selectedMode = IngestMode.ingest;
  final List<_FileEntry> _fileQueue = [];
  bool _isIngesting    = false;
  String _progressText = 'Preparing...';
  AlertData? _ingestAlert;
  String _ingestSummary = '';

  // ── Pick files (web-safe: uses bytes, no dart:io) ─────────────────────────
  Future<void> _pickFiles() async {
    final result = await FilePicker.platform.pickFiles(
      allowMultiple: true,
      type: FileType.custom,
      allowedExtensions: ['txt', 'pdf', 'docx', 'csv', 'xlsx', 'json'],
      withData: true,          // ensures bytes are populated on all platforms
    );
    if (result == null || result.files.isEmpty) return;

    setState(() {
      for (final pf in result.files) {
        if (pf.bytes == null) continue;            // skip if no bytes
        if (_fileQueue.any((e) => e.name == pf.name)) continue; // deduplicate
        _fileQueue.add(_FileEntry(
          name:  pf.name,
          bytes: pf.bytes!,
          item:  FileQueueItem(name: pf.name, sizeBytes: pf.size),
        ));
      }
    });
  }

  void _removeFile(int index) => setState(() => _fileQueue.removeAt(index));

  void _clearQueue() => setState(() {
    _fileQueue.clear();
    _ingestAlert  = null;
    _ingestSummary = '';
  });

  // ── Run ingestion pipeline ────────────────────────────────────────────────
  Future<void> _runIngest() async {
    if (_fileQueue.isEmpty) return;
    setState(() {
      _isIngesting   = true;
      _ingestAlert   = null;
      _ingestSummary = '';
      _progressText  = 'Preparing...';
    });

    // Reset mode: wipe vector store first
    if (_selectedMode == IngestMode.reset) {
      setState(() => _progressText = 'Resetting vector store...');
      try {
        await RagService.instance.resetVectorStore();
      } catch (e) {
        setState(() {
          _isIngesting = false;
          _ingestAlert = AlertData(message: 'Reset failed: $e', type: AlertType.error);
        });
        return;
      }
    }

    int totalChunks  = 0;
    int successCount = 0;

    for (int i = 0; i < _fileQueue.length; i++) {
      final entry = _fileQueue[i];

      setState(() {
        entry.item.status      = FileStatus.uploading;
        entry.item.statusLabel = 'uploading...';
        _progressText = '[${i + 1}/${_fileQueue.length}] Uploading ${entry.name}...';
      });

      try {
        final chunks = await RagService.instance.uploadAndIngest(
          entry.bytes,
          entry.name,
          onProgress: (status) {
            if (!mounted) return;
            setState(() {
              if (status.contains('Indexing')) {
                entry.item.status      = FileStatus.indexing;
                entry.item.statusLabel = 'indexing...';
              }
              _progressText = '[${i + 1}/${_fileQueue.length}] $status';
            });
          },
        );
        setState(() {
          entry.item.status      = FileStatus.success;
          entry.item.statusLabel = '$chunks chunks';
        });
        totalChunks += chunks;
        successCount++;
      } catch (e) {
        setState(() {
          entry.item.status      = FileStatus.error;
          entry.item.statusLabel = 'failed';
        });
      }
    }

    setState(() {
      _isIngesting   = false;
      _ingestSummary = '$successCount/${_fileQueue.length} file(s) · $totalChunks chunks';
      _ingestAlert   = AlertData(
        message: successCount == _fileQueue.length
            ? 'Done! $successCount file(s) · $totalChunks chunks indexed.'
            : '$successCount/${_fileQueue.length} succeeded. Check failed files.',
        type: successCount == _fileQueue.length ? AlertType.success : AlertType.warn,
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(16, 20, 16, 100),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SectionHeader(
            title: 'Upload Docs',
            subtitle: 'Add new knowledge to the RAG store',
          ),
          const SizedBox(height: 16),
          RagCard(
            label: 'Ingest Mode',
            children: [
              ModeOptionCard(
                title: 'Ingest Only',
                badgeLabel: 'SAFE',
                isSafe: true,
                description: 'Adds chunks to existing store. Old documents are kept.',
                isSelected: _selectedMode == IngestMode.ingest,
                onTap: () => setState(() => _selectedMode = IngestMode.ingest),
              ),
              const SizedBox(height: 10),
              ModeOptionCard(
                title: 'Ingest + Reset',
                badgeLabel: 'WIPES DATA',
                isSafe: false,
                description: 'Wipes ALL existing chunks first, then ingests fresh.',
                isSelected: _selectedMode == IngestMode.reset,
                onTap: () => setState(() => _selectedMode = IngestMode.reset),
              ),
              const SizedBox(height: 14),
            ],
          ),
          const SizedBox(height: 16),
          RagCard(
            label: 'Select Files',
            children: [
              UploadZone(onTap: _pickFiles),
              if (_fileQueue.isNotEmpty) ...[
                const SizedBox(height: 14),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('QUEUE · ${_fileQueue.length} FILES', style: RagAppTextStyles.queueCount),
                    _SmallButton(label: 'Clear', onTap: _clearQueue),
                  ],
                ),
                const SizedBox(height: 10),
                ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: _fileQueue.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 8),
                  itemBuilder: (_, i) => FileQueueItemWidget(
                    item: _fileQueue[i].item,
                    onRemove: () => _removeFile(i),
                  ),
                ),
              ],
            ],
          ),
          const SizedBox(height: 16),
          RagCard(
            label: 'Run Ingestion',
            children: [
              if (_isIngesting) ...[
                Text(_progressText, style: RagAppTextStyles.progressText),
                const SizedBox(height: 8),
                _IndeterminateProgressBar(),
                const SizedBox(height: 14),
              ],
              if (_ingestAlert != null) ...[
                AlertBanner(alert: _ingestAlert),
                const SizedBox(height: 14),
              ],
              _BlackButton(
                label: 'Start Ingestion',
                onTap: _fileQueue.isEmpty || _isIngesting ? null : _runIngest,
              ),
              if (_ingestSummary.isNotEmpty) ...[
                const SizedBox(height: 12),
                Text(
                  _ingestSummary,
                  style: const TextStyle(
                    fontSize: 11, color: RagAppColors.muted,
                    fontFamily: 'monospace', height: 1.8,
                  ),
                ),
              ],
            ],
          ),
        ],
      ),
    );
  }
}

// ── Web-safe file entry (bytes, not File) ─────────────────────────────────────

class _FileEntry {
  final String        name;
  final Uint8List     bytes;
  final FileQueueItem item;
  _FileEntry({required this.name, required this.bytes, required this.item});
}

// ── Progress bar & buttons (unchanged from original) ─────────────────────────

class _IndeterminateProgressBar extends StatefulWidget {
  @override
  State<_IndeterminateProgressBar> createState() => _IndeterminateProgressBarState();
}

class _IndeterminateProgressBarState extends State<_IndeterminateProgressBar>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl;
  late final Animation<double>   _anim;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 1200))..repeat();
    _anim = CurvedAnimation(parent: _ctrl, curve: Curves.easeInOut);
  }

  @override
  void dispose() { _ctrl.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 4,
      decoration: BoxDecoration(color: RagAppColors.border, borderRadius: BorderRadius.circular(2)),
      child: AnimatedBuilder(
        animation: _anim,
        builder: (_, __) => FractionallySizedBox(
          alignment: Alignment((_anim.value * 2) - 1, 0),
          widthFactor: 0.4,
          child: Container(
            decoration: BoxDecoration(color: Colors.black, borderRadius: BorderRadius.circular(2)),
          ),
        ),
      ),
    );
  }
}

class _BlackButton extends StatelessWidget {
  final String label;
  final VoidCallback? onTap;
  const _BlackButton({required this.label, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedOpacity(
        duration: const Duration(milliseconds: 200),
        opacity: onTap != null ? 1.0 : 0.35,
        child: Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(vertical: 13),
          decoration: BoxDecoration(color: Colors.black, borderRadius: BorderRadius.circular(12)),
          child: Text(label, textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: Colors.white)),
        ),
      ),
    );
  }
}

class _SmallButton extends StatelessWidget {
  final String label;
  final VoidCallback onTap;
  const _SmallButton({required this.label, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: RagAppColors.border2),
        ),
        child: const Text('Clear',
            style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Colors.black)),
      ),
    );
  }
}

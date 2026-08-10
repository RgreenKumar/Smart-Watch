enum IngestMode { ingest, reset }

enum LlmBackend { local, openrouter, auto }

enum FileStatus { ready, uploading, indexing, success, error }

class FileQueueItem {
  final String name;
  final int sizeBytes;
  FileStatus status;
  String statusLabel;

  FileQueueItem({
    required this.name,
    required this.sizeBytes,
    this.status = FileStatus.ready,
    this.statusLabel = 'ready',
  });
}

class IndexedDocument {
  final String source;
  final int chunkCount;

  const IndexedDocument({
    required this.source,
    required this.chunkCount,
  });
}

enum AlertType { success, error, warn, info }

class AlertData {
  final String message;
  final AlertType type;

  const AlertData({required this.message, required this.type});
}

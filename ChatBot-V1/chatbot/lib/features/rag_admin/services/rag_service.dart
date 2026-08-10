// lib/features/rag_admin/services/rag_service.dart
// Web-safe: uses Uint8List bytes instead of dart:io File.

import 'dart:typed_data';
import '../../../core/services/api_client.dart';
import '../models/rag_models.dart';

// ── DTOs ──────────────────────────────────────────────────────────────────────

class RagSourceDto {
  final String source;
  final int    chunkCount;
  const RagSourceDto({required this.source, required this.chunkCount});
  factory RagSourceDto.fromJson(Map<String, dynamic> j) => RagSourceDto(
    source:     j['source']  as String,
    chunkCount: (j['count']  as num).toInt(),
  );
}

class RagSettingsDto {
  final bool   apiKeySet;
  final String apiKeyMasked;
  final String model;
  final String backend;
  const RagSettingsDto({
    required this.apiKeySet,
    required this.apiKeyMasked,
    required this.model,
    required this.backend,
  });
  factory RagSettingsDto.fromJson(Map<String, dynamic> j) => RagSettingsDto(
    apiKeySet:    j['api_key_set']    as bool?   ?? false,
    apiKeyMasked: j['api_key_masked'] as String? ?? '',
    model:        j['model']          as String? ?? '',
    backend:      j['backend']        as String? ?? 'openrouter',
  );
}

class RagStatsDto {
  final int    totalChunks;
  final String llmBackend;
  final String llmModel;
  const RagStatsDto({
    required this.totalChunks,
    required this.llmBackend,
    required this.llmModel,
  });
  factory RagStatsDto.fromJson(Map<String, dynamic> j) => RagStatsDto(
    totalChunks: (j['total_chunks'] as num?)?.toInt() ?? 0,
    llmBackend:  j['llm_backend']   as String? ?? '',
    llmModel:    j['llm_model']     as String? ?? '',
  );
}

// ── Service ───────────────────────────────────────────────────────────────────

class RagService {
  RagService._();
  static final RagService instance = RagService._();

  // ── Health ────────────────────────────────────────────────────────────────

  Future<bool> isOnline() async {
    try {
      final data = await ApiClient.instance.get('/health', rag: true);
      return (data as Map?)?['status'] == 'ok';
    } catch (_) { return false; }
  }

  Future<RagStatsDto?> getStats() async {
    try {
      final data = await ApiClient.instance.get('/api/stats', rag: true);
      return RagStatsDto.fromJson(data as Map<String, dynamic>);
    } catch (_) { return null; }
  }

  // ── Sources / Documents ───────────────────────────────────────────────────

  Future<List<RagSourceDto>> getSources() async {
    final data = await ApiClient.instance.get('/api/sources', rag: true)
        as Map<String, dynamic>;
    final list = data['sources'] as List? ?? [];
    return list.map((j) => RagSourceDto.fromJson(j as Map<String, dynamic>)).toList();
  }

  Future<int> deleteSource(String source) async {
    final data = await ApiClient.instance.delete(
      '/api/delete-source',
      body: {'source': source},
      rag: true,
    ) as Map<String, dynamic>;
    return (data['deleted'] as num?)?.toInt() ?? 0;
  }

  // ── Upload + Ingest (web-safe: bytes + filename) ──────────────────────────

  Future<String> uploadBytes(Uint8List bytes, String filename) async {
    final data = await ApiClient.instance.uploadBytes(
      '/api/upload', bytes, filename, 'file', rag: true,
    ) as Map<String, dynamic>;
    return data['file_path'] as String;
  }

  Future<int> ingestFile(String filePath) async {
    final data = await ApiClient.instance.post(
      '/api/ingest', {'file_path': filePath}, rag: true,
    ) as Map<String, dynamic>;
    return (data['chunks_added'] as num?)?.toInt() ?? 0;
  }

  /// Full pipeline: upload bytes → ingest → return chunk count.
  Future<int> uploadAndIngest(
    Uint8List bytes,
    String filename, {
    void Function(String status)? onProgress,
  }) async {
    onProgress?.call('Uploading $filename...');
    final filePath = await uploadBytes(bytes, filename);
    onProgress?.call('Indexing $filename...');
    return ingestFile(filePath);
  }

  // ── Settings ──────────────────────────────────────────────────────────────

  Future<RagSettingsDto> getSettings() async {
    final data = await ApiClient.instance.get('/api/admin/settings', rag: true)
        as Map<String, dynamic>;
    return RagSettingsDto.fromJson(data);
  }

  Future<RagSettingsDto> saveSettings({
    required String backend,
    String? apiKey,
    String? model,
  }) async {
    final data = await ApiClient.instance.post(
      '/api/admin/settings',
      {
        'llm_backend': backend,
        if (apiKey != null && apiKey.isNotEmpty) 'api_key': apiKey,
        if (model  != null && model.isNotEmpty)  'model':   model,
      },
      rag: true,
    ) as Map<String, dynamic>;
    return RagSettingsDto.fromJson(data);
  }

  Future<void> resetVectorStore() async {
    await ApiClient.instance.delete('/api/reset?confirm=true', rag: true);
  }
}

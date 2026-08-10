// lib/core/services/api_client.dart
// ─────────────────────────────────────────────────────────────────────────────
// Central HTTP client for all Spring Boot and Python RAG REST calls.
// Web-safe: uses dart:typed_data instead of dart:io File.
//
// uploadFile() accepts raw bytes + filename so it works on Web, Windows,
// Android, iOS, and Desktop uniformly.
// ─────────────────────────────────────────────────────────────────────────────

import 'dart:convert';
import 'dart:typed_data';
import 'package:http/http.dart' as http;
import 'auth_store.dart';

/// Override at build time: flutter run --dart-define=SPRING_URL=https://...
const String _kSpringBase = String.fromEnvironment(
  'SPRING_URL',
  defaultValue: 'http://localhost:8080',
);
const String _kRagBase = String.fromEnvironment(
  'RAG_URL',
  defaultValue: 'http://localhost:5000',
);

String get springBaseUrl => _kSpringBase;
String get ragBaseUrl    => _kRagBase;

class ApiException implements Exception {
  final int    statusCode;
  final String message;
  ApiException(this.statusCode, this.message);

  @override
  String toString() => 'ApiException($statusCode): $message';
}

class ApiClient {
  ApiClient._();
  static final ApiClient instance = ApiClient._();

  final Duration _timeout = const Duration(seconds: 30);

  // ── Headers ───────────────────────────────────────────────────────────────

  Map<String, String> _headers({bool json = true}) {
    final token = AuthStore.instance.token;
    return {
      if (json) 'Content-Type': 'application/json',
      'Accept': 'application/json',
      if (token != null) 'Authorization': token.startsWith('Bearer ') ? token.substring(7) : token,
    };
  }

  Map<String, String> _formHeaders() {
    final token = AuthStore.instance.token;
    return {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept':       'application/json',
      if (token != null) 'Authorization': token.startsWith('Bearer ') ? token.substring(7) : token,
    };
  }

  Map<String, String> _multipartHeaders() {
    final token = AuthStore.instance.token;
    return {
      'Accept': 'application/json',
      if (token != null) 'Authorization': token.startsWith('Bearer ') ? token.substring(7) : token,
    };
  }

  // ── GET ───────────────────────────────────────────────────────────────────

  Future<dynamic> get(String path, {bool rag = false}) async {
    final uri = Uri.parse('${rag ? _kRagBase : _kSpringBase}$path');
    final res = await http.get(uri, headers: _headers()).timeout(_timeout);
    return _parse(res);
  }

  // ── POST (JSON) ───────────────────────────────────────────────────────────

  Future<dynamic> post(String path, Map<String, dynamic> body,
      {bool rag = false}) async {
    final uri = Uri.parse('${rag ? _kRagBase : _kSpringBase}$path');
    final res = await http
        .post(uri, headers: _headers(), body: jsonEncode(body))
        .timeout(_timeout);
    return _parse(res);
  }

  // ── POST (form-encoded) ───────────────────────────────────────────────────

  Future<dynamic> postForm(String path, Map<String, String> fields,
      {bool rag = false}) async {
    final uri = Uri.parse('${rag ? _kRagBase : _kSpringBase}$path');
    final res = await http
        .post(uri, headers: _formHeaders(), body: fields)
        .timeout(_timeout);
    return _parse(res);
  }

  Future<dynamic> patchForm(String path, Map<String, String> fields,
      {bool rag = false}) async {
    final uri = Uri.parse('${rag ? _kRagBase : _kSpringBase}$path');
    final req = http.Request('PATCH', uri)
      ..headers.addAll(_formHeaders())
      ..bodyFields = fields;
    final streamed = await req.send().timeout(_timeout);
    final res = await http.Response.fromStream(streamed);
    return _parse(res);
  }

  // ── PATCH (multipart) ────────────────────────────────────────────────────

  Future<dynamic> patchUploadBytes(
    String path,
    Uint8List bytes,
    String filename,
    String fieldName, {
    Map<String, String>? fields,
    bool rag = false,
  }) async {
    final uri = Uri.parse('${rag ? _kRagBase : _kSpringBase}$path');
    final req = http.MultipartRequest('PATCH', uri)
      ..headers.addAll(_multipartHeaders());
    if (fields != null) req.fields.addAll(fields);
    req.files.add(http.MultipartFile.fromBytes(
      fieldName,
      bytes,
      filename: filename,
    ));
    final streamed = await req.send().timeout(_timeout);
    final res = await http.Response.fromStream(streamed);
    return _parse(res);
  }

  // ── PATCH (multipart) ────────────────────────────────────────────────────

  // ── PATCH (JSON) ──────────────────────────────────────────────────────────

  Future<dynamic> patch(String path, Map<String, dynamic> body) async {
    final uri = Uri.parse('$_kSpringBase$path');
    final res = await http
        .patch(uri, headers: _headers(), body: jsonEncode(body))
        .timeout(_timeout);
    return _parse(res);
  }

  // ── DELETE ────────────────────────────────────────────────────────────────

  Future<dynamic> delete(String path,
      {Map<String, dynamic>? body, bool rag = false}) async {
    final uri = Uri.parse('${rag ? _kRagBase : _kSpringBase}$path');
    final req = http.Request('DELETE', uri)
      ..headers.addAll(_headers());
    if (body != null) req.body = jsonEncode(body);
    final streamed = await req.send().timeout(_timeout);
    final res = await http.Response.fromStream(streamed);
    return _parse(res);
  }

  // ── Multipart upload (web-safe: accepts bytes + filename) ─────────────────
  //
  // Pass file bytes and the original filename.
  // Works on Web, Windows, Android, iOS — no dart:io File needed.

  Future<dynamic> uploadBytes(
    String path,
    Uint8List bytes,
    String filename,
    String fieldName, {
    Map<String, String>? fields,
    bool rag = false,
  }) async {
    final uri = Uri.parse('${rag ? _kRagBase : _kSpringBase}$path');
    final req = http.MultipartRequest('POST', uri)
      ..headers.addAll(_multipartHeaders());
    if (fields != null) req.fields.addAll(fields);
    req.files.add(http.MultipartFile.fromBytes(
      fieldName,
      bytes,
      filename: filename,
    ));
    final streamed = await req.send().timeout(_timeout);
    final res = await http.Response.fromStream(streamed);
    return _parse(res);
  }

  // ── Response parser ───────────────────────────────────────────────────────

  dynamic _parse(http.Response res) {
    final body = res.body;

    if (res.statusCode >= 200 && res.statusCode < 300) {
      if (body.isEmpty) return null;
      try {
        return jsonDecode(body);
      } catch (_) {
        return body;
      }
    }

    // 401 → session expired
    if (res.statusCode == 401) {
      AuthStore.instance.clearSync();
      throw ApiException(401, 'Session expired. Please log in again.');
    }

    String message = 'Request failed';
    try {
      final decoded = jsonDecode(body);
      if (decoded is Map) {
        message = decoded['message'] ?? decoded['error'] ?? body;
      } else {
        message = body;
      }
    } catch (_) {
      message = body.isNotEmpty ? body : 'HTTP ${res.statusCode}';
    }

    throw ApiException(res.statusCode, message);
  }
}

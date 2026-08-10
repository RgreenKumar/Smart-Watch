// lib/features/administration/services/profile_service.dart
// Web-safe: uses Uint8List instead of dart:io File.

import 'dart:typed_data';
import '../../../core/services/api_client.dart';
import '../../../core/services/auth_store.dart';
import 'package:http/http.dart' as http;

class ProfileDto {
  final int?   id;
  final String name;
  final bool   status;
  final String url;
  const ProfileDto({this.id, required this.name, required this.status, required this.url});
  factory ProfileDto.fromJson(Map<String, dynamic> j) => ProfileDto(
    id:     j['id'] != null ? (j['id'] as num).toInt() : null,
    name:   j['name']   as String? ?? '',
    status: j['status'] as bool?   ?? false,
    url:    j['url']    as String? ?? '',
  );
}

class ProfileService {
  ProfileService._();
  static final ProfileService instance = ProfileService._();

  Future<ProfileDto?> getProfile() async {
    try {
      final data = await ApiClient.instance.get('/api/profiles');
      if (data == null) return null;
      return ProfileDto.fromJson(data as Map<String, dynamic>);
    } on ApiException catch (e) {
      if (e.statusCode == 204) return null;
      rethrow;
    }
  }

  Future<ProfileDto> saveProfile({
    required String   name,
    required bool     status,
    required String   url,
    Uint8List?        imageBytes,
    String?           imageFilename,
    bool              clearImage = false,
  }) async {
    final fields = <String, String>{
      'name':   name,
      'status': status.toString(),
      'url':    url,
      if (clearImage) 'clearImage': 'true',
    };
    dynamic result;
    if (imageBytes != null && imageFilename != null) {
      result = await ApiClient.instance.uploadBytes(
        '/api/profiles', imageBytes, imageFilename, 'image', fields: fields,
      );
    } else {
      result = await ApiClient.instance.postForm('/api/profiles', fields);
    }
    return ProfileDto.fromJson(result as Map<String, dynamic>);
  }

  Future<Uint8List?> getProfileImage() async {
    try {
      final uri   = Uri.parse('$springBaseUrl/api/profiles/image');
      final token = AuthStore.instance.token;
      final res   = await http.get(uri, headers: {
        'Accept': 'image/jpeg',
        if (token != null) 'Authorization': 'Bearer $token',
      });
      if (res.statusCode == 204 || res.bodyBytes.isEmpty) return null;
      return res.bodyBytes;
    } catch (_) { return null; }
  }
}

import 'dart:convert';
import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import 'package:ott_project/pages/login_page.dart';
import 'package:ott_project/url.dart';

class Service {
  final _storage = const FlutterSecureStorage();

  Future<String?> getLoggedInUserId() async {
    return await _storage.read(key: 'user_id');
  }

  Future<bool> loginUser1(BuildContext context, String email, String password) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email, 'password': password}),
      );
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final token = data['token'] ?? data['jwt'];
        final userId = data['userId']?.toString() ?? data['id']?.toString();
        if (token != null) {
          await _storage.write(key: 'auth_token', value: token);
          await _storage.write(key: 'token', value: token);
        }
        if (userId != null) {
          await _storage.write(key: 'user_id', value: userId);
          await _storage.write(key: 'userId', value: userId);
        }
        return true;
      }
      return false;
    } catch (e) {
      print('Login error: $e');
      return false;
    }
  }

  Future<Map<String, dynamic>> createUser([
    dynamic arg1, dynamic arg2, dynamic arg3,
    dynamic arg4, dynamic arg5, dynamic arg6, dynamic arg7,
  ]) async {
    try {
      // arg1=context, arg2=username, arg3=email, arg4=mobile, arg5=password, arg6=confirmPassword, arg7=imageFile
      // Deployed API expects multipart/form-data at /userregister
      final request = http.MultipartRequest('POST', Uri.parse('$baseUrl/userregister'))
        ..fields['username'] = arg2?.toString() ?? ''
        ..fields['email'] = arg3?.toString() ?? ''
        ..fields['mobnum'] = arg4?.toString() ?? ''
        ..fields['password'] = arg5?.toString() ?? ''
        ..fields['confirmPassword'] = (arg6 ?? arg5)?.toString() ?? '';
      final streamedResponse = await request.send();
      if (streamedResponse.statusCode == 200) {
        return {'success': true};
      }
      String message = 'Registration failed. Please try again.';
      try {
        final body = jsonDecode(await streamedResponse.stream.bytesToString());
        message = body['message'] ?? message;
      } catch (_) {}
      return {'success': false, 'message': message};
    } catch (e) {
      print('Registration error: $e');
      return {'success': false, 'message': 'Cannot reach the server. Is the backend running?'};
    }
  }

  Future<Map<String, dynamic>> createUserTV([
    dynamic arg1, dynamic arg2, dynamic arg3,
    dynamic arg4, dynamic arg5, dynamic arg6,
  ]) async {
    try {
      // Deployed API expects multipart/form-data at /userregister
      final request = http.MultipartRequest('POST', Uri.parse('$baseUrl/userregister'))
        ..fields['username'] = arg2?.toString() ?? ''
        ..fields['email'] = arg3?.toString() ?? ''
        ..fields['mobnum'] = arg4?.toString() ?? ''
        ..fields['password'] = arg5?.toString() ?? ''
        ..fields['confirmPassword'] = (arg6 ?? arg5)?.toString() ?? '';
      final streamedResponse = await request.send();
      if (streamedResponse.statusCode == 200) {
        return {'success': true};
      }
      String message = 'Registration failed. Please try again.';
      try {
        final body = jsonDecode(await streamedResponse.stream.bytesToString());
        message = body['message'] ?? message;
      } catch (_) {}
      return {'success': false, 'message': message};
    } catch (e) {
      print('Registration error: $e');
      return {'success': false, 'message': 'Cannot reach the server. Is the backend running?'};
    }
  }

  Future<bool> changePassword({
    String? currentPassword,
    String? newPassword,
    String? oldPassword,
  }) async {
    try {
      final userId = await getLoggedInUserId();
      if (userId == null) return false;
      final password = newPassword ?? oldPassword;
      if (password == null) return false;
      final response = await http.patch(
        Uri.parse('$baseUrl/Update/user/$userId?password=$password'),
      );
      return response.statusCode == 200;
    } catch (e) {
      print('Change password error: $e');
      return false;
    }
  }

  Future<bool> updateUserProfile({
    String? name,
    String? email,
    String? phone,
    dynamic data,
  }) async {
    try {
      final userId = await getLoggedInUserId();
      if (userId == null) return false;
      final response = await http.put(
        Uri.parse('$baseUrl/updateUser/$userId'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'username': name,
          'email': email,
          'mobnum': phone,
        }),
      );
      return response.statusCode == 200;
    } catch (e) {
      print('Update profile error: $e');
      return false;
    }
  }

  Future<void> logoutUser(BuildContext context) async {
    await _storage.deleteAll();
    if (context.mounted) {
      Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(builder: (context) => const LoginPage()),
            (route) => false,
      );
    }
  }

  Future<Map<String, dynamic>?> fetchUserProfile() async {
    try {
      final userId = await getLoggedInUserId();
      if (userId == null) return null;
      final response = await http.get(Uri.parse('$baseUrl/GetUserById/$userId'));
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
      return null;
    } catch (e) {
      print('Fetch profile error: $e');
      return null;
    }
  }

  Future<Uint8List?> fetchProfileImage() async {
    try {
      final userId = await getLoggedInUserId();
      if (userId == null) return null;
      final response = await http.get(Uri.parse('$baseUrl/GetProfileImage/$userId'));
      if (response.statusCode == 200) {
        return response.bodyBytes;
      }
      return null;
    } catch (e) {
      print('Fetch profile image error: $e');
      return null;
    }
  }

  Future<bool> uploadProfileImage(Uint8List imageBytes) async {
    try {
      final userId = await getLoggedInUserId();
      if (userId == null) return false;
      var request = http.MultipartRequest('PUT', Uri.parse('$baseUrl/updateUser/$userId'));
      request.files.add(http.MultipartFile.fromBytes('profileImage', imageBytes, filename: 'profile.jpg'));
      var streamedResponse = await request.send();
      return streamedResponse.statusCode == 200;
    } catch (e) {
      print('Upload profile image error: $e');
      return false;
    }
  }
}

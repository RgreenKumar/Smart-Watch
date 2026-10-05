import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:ott_project/pages/app_icon.dart';
import 'package:ott_project/url.dart';

class IconService {
  static Future<AppIcon> fetchIcon() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/GetsiteSettings'));
      if (response.statusCode == 200) {
        List<dynamic> jsonResponse = json.decode(response.body);
        if (jsonResponse.isNotEmpty && jsonResponse[0]['icon'] != null && (jsonResponse[0]['icon'] as String).isNotEmpty) {
          String icon = (jsonResponse[0]['icon']);
          return AppIcon(icon: icon);
        } else {
          return AppIcon(icon: '');
        }
      } else {
        return AppIcon(icon: '');
      }
    } on Exception {
      return AppIcon(icon: '');
    }
  }
}

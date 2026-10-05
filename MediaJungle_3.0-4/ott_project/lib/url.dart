//  API base URL — points at the local Node backend (server.js, port 3000).
//  All Node routes are mounted under /api/v2, so baseUrl already includes it.
//
//  - Android emulator reaches the host PC via 10.0.2.2.
//  - Web (Chrome/Edge) and desktop use localhost.
//  - Real phone on the same Wi-Fi: change to your PC's LAN IP, e.g.
//      const String baseUrl = 'http://192.168.x.x:3000/api/v2/';
//  - To use the hosted demo instead of local, uncomment the production line.
import 'dart:io' show Platform;
import 'package:flutter/foundation.dart' show kIsWeb;

String get baseUrl {
  // Production (hosted) alternative:
  // return 'https://mjdemo.vsmartengine.com/';

  final String host;
  if (kIsWeb) {
    // Browser — the backend + web build run on the same machine.
    host = 'localhost';
  } else if (Platform.isAndroid) {
    // Android emulator loopback to the host machine.
    host = '10.0.2.2';
  } else {
    host = 'localhost';
  }
  return 'http://$host:3000/api/v2/';
}

import 'dart:async';
import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:web_socket_channel/status.dart' as ws_status;
import 'package:web_socket_channel/web_socket_channel.dart';

/// A command pushed by the Wear OS watch through the relay server.
///
/// `action` is one of: togglePlayPause | previous | next | stop |
/// seekBackward | seekForward | volumeUp | volumeDown.
class MediaCommand {
  const MediaCommand({required this.action, this.value});

  final String action;
  final double? value;

  /// Parses a raw [MediaCommand] into the canonical action name + value.
  factory MediaCommand.fromRaw(String action, dynamic value) {
    switch (action) {
      case 'togglePlayPause':
      case 'previous':
      case 'next':
      case 'stop':
      case 'seekBackward':
      case 'seekForward':
      case 'volumeUp':
      case 'volumeDown':
        return MediaCommand(
          action: action,
          value: value is num ? value.toDouble() : null,
        );
      default:
        return MediaCommand(action: action, value: null);
    }
  }
}

/// The player (mobile app or website) resolves a watch command.
abstract class MediaCommandHandler {
  void onCommand(MediaCommand command);
}

/// WebSocket client through which the app advertises itself as a "page" on the
/// relay server (backend/relay.js, default ws://<host>:8080?role=page).
///
///  - Broadcasts current playback state and started/stopped events to watches.
///  - Receives commands from Wear OS watches and forwards them to the
///    registered [MediaCommandHandler].
///
/// Default URLs:
///  - emulator / host loopback: ws://10.0.2.2:8080?role=page
///  - web (same machine):       ws://localhost:8080?role=page
///  - real device:              ws://<pc-lan-ip>:8080?role=page
class MediaControlService {
  MediaControlService._();
  static final MediaControlService instance = MediaControlService._();

  static String get defaultUrl {
    if (kIsWeb) return 'ws://localhost:8080?role=page';
    // Android emulator reaches the host PC via 10.0.2.2.
    if (defaultTargetPlatform == TargetPlatform.android) {
      return 'ws://10.0.2.2:8080?role=page';
    }
    return 'ws://localhost:8080?role=page';
  }

  WebSocketChannel? _channel;
  Timer? _reconnectTimer;
  bool _manuallyClosed = false;
  int _reconnectDelayMs = 1000;

  MediaCommandHandler? handler;

  final ValueNotifier<bool> connected = ValueNotifier<bool>(false);
  final ValueNotifier<String> serverUrl = ValueNotifier<String>(defaultUrl);

  void configure(String url) {
    final normalized = url.trim().isEmpty ? defaultUrl : url.trim();
    if (!normalized.contains('role=')) {
      serverUrl.value = '$normalized?role=page';
    } else {
      serverUrl.value = normalized;
    }
    _reconnectDelayMs = 1000;
    _teardown();
    connect();
  }

  void connect() {
    if (_channel != null || _manuallyClosed) return;
    try {
      _channel = WebSocketChannel.connect(Uri.parse(serverUrl.value));
    } catch (e) {
      debugPrint('[MediaControl] connect error: $e');
      _scheduleReconnect();
      return;
    }
    debugPrint('[MediaControl] connecting to ${serverUrl.value}');

    _channel!.stream.listen(
      (data) => _handleMessage(data),
      onDone: () {
        _channel = null;
        connected.value = false;
        _scheduleReconnect();
      },
      onError: (_) {
        _channel = null;
        connected.value = false;
        _scheduleReconnect();
      },
      cancelOnError: true,
    );

    _channel!.ready.then((_) {
      connected.value = true;
      _reconnectDelayMs = 1000;
      debugPrint('[MediaControl] connected');
    }).catchError((Object e) {
      debugPrint('[MediaControl] handshake failed: $e');
      connected.value = false;
    });
  }

  void _handleMessage(dynamic data) {
    if (data is! String) return;
    Map<String, dynamic> msg;
    try {
      msg = jsonDecode(data) as Map<String, dynamic>;
    } catch (_) {
      return;
    }
    if (msg['type'] != 'command') return;
    final cmd = MediaCommand.fromRaw(
      (msg['action'] as String?) ?? '',
      msg['value'],
    );
    handler?.onCommand(cmd);
  }

  void _send(Map<String, dynamic> payload) {
    final channel = _channel;
    if (channel == null || channel.closeCode != null) return;
    channel.sink.add(jsonEncode(payload));
  }

  /// Push the current playback state so the watch screen reflects it.
  void broadcastState({
    required String status,
    String title = '',
    String subtitle = '',
    double positionSec = 0,
    double durationSec = 0,
  }) {
    _send({
      'type': 'state',
      'status': status,
      'title': title,
      'subtitle': subtitle,
      'positionSec': positionSec,
      'durationSec': durationSec,
    });
  }

  /// Announce 'started' / 'stopped' events (drives watch notifications).
  void broadcastEvent(String event, {String title = ''}) {
    _send({'type': 'event', 'event': event, 'title': title});
  }

  void _scheduleReconnect() {
    if (_reconnectTimer?.isActive == true || _manuallyClosed) return;
    _reconnectTimer = Timer(Duration(milliseconds: _reconnectDelayMs), () {
      _reconnectDelayMs = (_reconnectDelayMs * 2).clamp(1000, 15000);
      connect();
    });
  }

  void _teardown() {
    try {
      _channel?.sink.close(ws_status.goingAway);
    } catch (_) {}
    _channel = null;
    connected.value = false;
  }

  Future<void> dispose() async {
    _manuallyClosed = true;
    _reconnectTimer?.cancel();
    _teardown();
  }
}

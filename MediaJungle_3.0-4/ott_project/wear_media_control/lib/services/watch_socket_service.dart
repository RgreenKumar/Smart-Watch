import 'dart:async';
import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:web_socket_channel/status.dart' as ws_status;
import 'package:web_socket_channel/web_socket_channel.dart';

/// Playback state pushed by the OTT web page through the relay server.
class PlaybackState {
  const PlaybackState({
    required this.status,
    this.title = '',
    this.subtitle = '',
    this.positionSec = 0,
    this.durationSec = 0,
  });

  factory PlaybackState.fromJson(Map<String, dynamic> j) => PlaybackState(
        status: (j['status'] as String?) ?? 'stopped',
        title: (j['title'] as String?) ?? '',
        subtitle: (j['subtitle'] as String?) ?? '',
        positionSec: ((j['positionSec'] as num?) ?? 0).toDouble(),
        durationSec: ((j['durationSec'] as num?) ?? 0).toDouble(),
      );

  final String status; // playing | paused | stopped
  final String title;
  final String subtitle;
  final double positionSec;
  final double durationSec;

  bool get isPlaying => status == 'playing';
}

/// Remote media events ('started' | 'paused' | 'stopped').
class PlaybackEvent {
  const PlaybackEvent(this.event, this.title);
  final String event;
  final String title;
}

/// Connects to the media relay server running on the PC.
///
///   `ws://10.0.2.2:8080?role=watch`     — from the Android emulator
///   `ws://<pc-lan-ip>:8080?role=watch`  — from a real watch on Wi-Fi
class WatchSocketService {
  WatchSocketService._();
  static final WatchSocketService instance = WatchSocketService._();

  /// Emulator default: 10.0.2.2 is the host PC's loopback.
  static const String defaultUrl = 'ws://10.0.2.2:8080?role=watch';

  WebSocketChannel? _channel;
  Timer? _reconnectTimer;
  bool _manuallyClosed = false;
  int _reconnectDelayMs = 1000;

  final ValueNotifier<bool> connected = ValueNotifier<bool>(false);
  final ValueNotifier<int> pagesOnline = ValueNotifier<int>(0);
  final ValueNotifier<String> serverUrl =
      ValueNotifier<String>(defaultUrl);

  final StreamController<PlaybackState> _stateController =
      StreamController<PlaybackState>.broadcast();
  final StreamController<PlaybackEvent> _eventController =
      StreamController<PlaybackEvent>.broadcast();

  Stream<PlaybackState> get stateStream => _stateController.stream;
  Stream<PlaybackEvent> get eventStream => _eventController.stream;

  void configure(String url) {
    final normalized = url.trim().isEmpty ? defaultUrl : url.trim();
    if (!normalized.contains('role=')) {
      serverUrl.value = '$normalized?role=watch';
    } else {
      serverUrl.value = normalized;
    }
    // Reconnect immediately against the new address.
    _reconnectDelayMs = 1000;
    _teardown();
    connect();
  }

  void connect() {
    if (_channel != null || _manuallyClosed) return;
    try {
      _channel = WebSocketChannel.connect(Uri.parse(serverUrl.value));
    } catch (e) {
      debugPrint('[WatchSocket] connect error: $e');
      _scheduleReconnect();
      return;
    }
    debugPrint('[WatchSocket] connecting to ${serverUrl.value}');

    _channel!.stream.listen(
      (data) => _handleMessage(data),
      onDone: () {
        _channel = null;
        connected.value = false;
        pagesOnline.value = 0;
        _scheduleReconnect();
      },
      onError: (_) {
        _channel = null;
        connected.value = false;
        pagesOnline.value = 0;
        _scheduleReconnect();
      },
      cancelOnError: true,
    );

    // Resolve as soon as the WebSocket handshake completes — do not wait
    // for the first message.
    _channel!.ready.then((_) {
      connected.value = true;
      _reconnectDelayMs = 1000;
      debugPrint('[WatchSocket] connected');
    }).catchError((Object e) {
      debugPrint('[WatchSocket] handshake failed: $e');
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

    switch (msg['type']) {
      case 'state':
        _stateController.add(PlaybackState.fromJson(msg));
        break;
      case 'event':
        _eventController.add(PlaybackEvent(
          (msg['event'] as String?) ?? '',
          (msg['title'] as String?) ?? '',
        ));
        break;
      case 'peers':
        pagesOnline.value = ((msg['pages'] as num?) ?? 0).toInt();
        break;
      default:
        break; // 'hello' and anything else — connectivity handled via ready
    }
  }

  void sendCommand(String action, {double? value}) {
    final channel = _channel;
    if (channel == null || channel.closeCode != null) {
      debugPrint('[WatchSocket] not connected — dropped $action');
      return;
    }
    final payload = <String, dynamic>{
      'type': 'command',
      'action': action,
      'value': ?value,
    };
    channel.sink.add(jsonEncode(payload));
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
    await _stateController.close();
    await _eventController.close();
  }
}

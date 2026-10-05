// ─────────────────────────────────────────────────────────────────────────────
// WatchRemoteService
//
// Lets a Wear OS watch control the audio playing inside this app (web/TV UI)
// through the media relay server, and pushes playback state back to the watch
// so it can raise "song started" / "song stopped" notifications.
//
//   watch ──► relay server ──► this service ──► active WatchPlaybackHandler
//   (player page)  ──► publishState()  ──► relay server ──► watch
// ─────────────────────────────────────────────────────────────────────────────

import 'dart:async';
import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:web_socket_channel/status.dart' as ws_status;
import 'package:web_socket_channel/web_socket_channel.dart';

/// Remote actions that can arrive from the watch.
enum WatchRemoteAction {
  play,
  pause,
  togglePlayPause,
  next,
  previous,
  seekForward,
  seekBackward,
  volumeUp,
  volumeDown,
  stop,
  unknown;

  static WatchRemoteAction fromName(String? name) => switch (name) {
        'play' => play,
        'pause' => pause,
        'togglePlayPause' => togglePlayPause,
        'next' => next,
        'previous' => previous,
        'seekForward' => seekForward,
        'seekBackward' => seekBackward,
        'volumeUp' => volumeUp,
        'volumeDown' => volumeDown,
        'stop' => stop,
        _ => unknown,
      };
}

/// A parsed command received from the watch. [value] carries the seek amount
/// in seconds or a volume delta (0..1) depending on [action].
class WatchRemoteCommand {
  const WatchRemoteCommand(this.action, {this.value});
  final WatchRemoteAction action;
  final double? value;
}

/// Implemented by whichever screen/service currently owns an active media
/// player (e.g. TVMusicPlayerPage, mobile AudioProvider, mobile video pages).
/// Handlers are kept in a stack: the watch controls the most recently
/// registered handler, and when it unregisters (page closed) control falls
/// back to the previous one (e.g. background music).
abstract class WatchPlaybackHandler {
  String get watchTrackTitle;
  String get watchTrackSubtitle;
  bool get watchIsPlaying;
  Duration get watchPosition;
  Duration get watchDuration;

  void onWatchCommand(WatchRemoteCommand command);
}

/// Singleton bridge between the app and the relay server.
class WatchRemoteService {
  WatchRemoteService._();
  static final WatchRemoteService instance = WatchRemoteService._();

  /// Override only when auto-detection cannot guess correctly.
  static String? serverUrlOverride;

  WebSocketChannel? _channel;
  Timer? _reconnectTimer;
  bool _manuallyClosed = false;
  int _reconnectDelayMs = 1000;

  /// Stack of active players — last element is the top-of-stack owner.
  final List<WatchPlaybackHandler> _handlers = [];

  /// Last status pushed to the watch ('playing' | 'paused' | 'stopped').
  String lastStatus = 'stopped';
  String lastTitle = '';

  WatchPlaybackHandler? get _activeHandler =>
      _handlers.isEmpty ? null : _handlers.last;

  bool get isConnected => _channel != null &&
      (_channel!.closeCode == null);

  /// Call once at app startup (after `runApp` is safe to call any time).
  void start() {
    if (_channel != null || _manuallyClosed) return;
    _connect();
  }

  void registerHandler(WatchPlaybackHandler handler) {
    _handlers.remove(handler);
    _handlers.add(handler);
    // Tell the watch what is already on screen.
    final hasTrack = handler.watchTrackTitle.isNotEmpty;
    publishState(
      status: hasTrack
          ? (handler.watchIsPlaying ? 'playing' : 'paused')
          : 'stopped',
      title: handler.watchTrackTitle,
      subtitle: handler.watchTrackSubtitle,
      positionSec: handler.watchPosition.inMilliseconds / 1000.0,
      durationSec: handler.watchDuration.inMilliseconds / 1000.0,
    );
  }

  void unregisterHandler(WatchPlaybackHandler handler) {
    if (!_handlers.remove(handler)) return;
    // Hand control back to the previous player, if any.
    final fallback = _activeHandler;
    final hasTrack = fallback != null && fallback.watchTrackTitle.isNotEmpty;
    if (fallback != null && hasTrack) {
      publishState(
        status: fallback.watchIsPlaying ? 'playing' : 'paused',
        title: fallback.watchTrackTitle,
        subtitle: fallback.watchTrackSubtitle,
        positionSec: fallback.watchPosition.inMilliseconds / 1000.0,
        durationSec: fallback.watchDuration.inMilliseconds / 1000.0,
      );
    } else {
      publishState(status: 'stopped');
    }
  }

  String _resolveUrl() {
    final override = serverUrlOverride;
    if (override != null && override.isNotEmpty) {
      return override.endsWith('?role=page') ? override : '$override?role=page';
    }
    if (kIsWeb) {
      // Web page served from the PC → same host as the page.
      return 'ws://${Uri.base.host}:8080?role=page';
    }
    // Android emulator → host loopback. Real device on LAN: set
    // [serverUrlOverride] to ws://<pc-lan-ip>:8080.
    return 'ws://10.0.2.2:8080?role=page';
  }

  void _connect() {
    final url = _resolveUrl();
    try {
      _channel = WebSocketChannel.connect(Uri.parse(url));
    } catch (e) {
      debugPrint('[WatchRemoteService] connect failed: $e');
      _scheduleReconnect();
      return;
    }

    _channel!.stream.listen(
      (data) => _onMessage(data),
      onDone: () {
        _channel = null;
        _scheduleReconnect();
      },
      onError: (_) {
        _channel = null;
        _scheduleReconnect();
      },
      cancelOnError: true,
    );
    debugPrint('[WatchRemoteService] connecting to $url ...');
    _reconnectDelayMs = 1000; // reset backoff after a successful attempt
  }

  void _scheduleReconnect() {
    if (_reconnectTimer?.isActive == true || _manuallyClosed) return;
    _reconnectTimer = Timer(Duration(milliseconds: _reconnectDelayMs), () {
      _reconnectDelayMs =
          (_reconnectDelayMs * 2).clamp(1000, 15000);
      _connect();
    });
  }

  void _onMessage(dynamic data) {
    if (data is! String) return;
    Map<String, dynamic> msg;
    try {
      msg = jsonDecode(data) as Map<String, dynamic>;
    } catch (_) {
      return;
    }
    if (msg['type'] != 'command') return;
    final action = WatchRemoteAction.fromName(msg['action'] as String?);
    final value = (msg['value'] as num?)?.toDouble();
    final command = WatchRemoteCommand(action, value: value);

    final handler = _activeHandler;
    if (handler == null) {
      debugPrint('[WatchRemoteService] no player registered for $action');
      return;
    }
    handler.onWatchCommand(command);
  }

  /// Push playback state to every connected watch. When the status changes,
  /// an explicit event ('started' | 'stopped') is emitted first so the watch
  /// can show its notification.
  void publishState({
    required String status, // 'playing' | 'paused' | 'stopped'
    String title = '',
    String subtitle = '',
    double positionSec = 0,
    double durationSec = 0,
  }) {
    final statusChanged = status != lastStatus;
    lastStatus = status;
    if (title.isNotEmpty) lastTitle = title;

    _send({
      'type': 'state',
      'status': status,
      'title': title.isEmpty ? lastTitle : title,
      'subtitle': subtitle,
      'positionSec': positionSec,
      'durationSec': durationSec,
    });

    if (statusChanged) {
      final event =
          (status == 'playing') ? 'started' : (status == 'stopped' ? 'stopped' : 'paused');
      _send({'type': 'event', 'event': event, 'title': lastTitle});
    }
  }

  void _send(Map<String, dynamic> payload) {
    final channel = _channel;
    if (channel == null || channel.closeCode != null) return;
    try {
      channel.sink.add(jsonEncode(payload));
    } catch (e) {
      debugPrint('[WatchRemoteService] send failed: $e');
    }
  }

  Future<void> stop() async {
    _manuallyClosed = true;
    _reconnectTimer?.cancel();
    await _channel?.sink.close(ws_status.normalClosure);
    _channel = null;
  }
}

import 'package:flutter/foundation.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

/// Raises local notifications on the watch when songs start / stop.
class NotificationService {
  NotificationService._();
  static final NotificationService instance = NotificationService._();

  final FlutterLocalNotificationsPlugin _plugin =
      FlutterLocalNotificationsPlugin();

  bool _initialized = false;
  int _notificationId = 100;

  Future<void> init() async {
    if (_initialized) return;

    const androidInit =
        AndroidInitializationSettings('@mipmap/ic_launcher');
    const initSettings = InitializationSettings(android: androidInit);

    await _plugin.initialize(settings: initSettings);
    _initialized = true;

    await requestPermission();
  }

  /// Android 13+ requires POST_NOTIFICATIONS to be granted at runtime.
  Future<void> requestPermission() async {
    if (defaultTargetPlatform != TargetPlatform.android) return;
    final android = _plugin
        .resolvePlatformSpecificImplementation<
            AndroidFlutterLocalNotificationsPlugin>();
    if (android == null) return;
    try {
      final granted = await android.areNotificationsEnabled();
      if (granted != true) {
        await android.requestNotificationsPermission();
      }
    } catch (e) {
      debugPrint('[Notify] permission error: $e');
    }
  }

  Future<void> show({
    required String title,
    required String body,
  }) async {
    if (!_initialized) return;

    const androidDetails = AndroidNotificationDetails(
      'media_events',
      'Media events',
      channelDescription: 'Song started / stopped notifications',
      importance: Importance.max,
      priority: Priority.high,
      onlyAlertOnce: false,
      playSound: true,
      enableVibration: true,
      ongoing: false,
      autoCancel: true,
    );
    const details = NotificationDetails(android: androidDetails);

    try {
      await _plugin.show(
        id: _notificationId++,
        title: title,
        body: body,
        notificationDetails: details,
      );
    } catch (e) {
      debugPrint('[Notify] show failed: $e');
    }
  }

  /// Convenience wrappers for the two required events.
  Future<void> songStarted(String title) => show(
        title: '▶ Now Playing',
        body: title.isEmpty ? 'A song started playing' : title,
      );

  Future<void> songStopped(String title) => show(
        title: '⏹ Playback Stopped',
        body: title.isEmpty ? 'Playback has stopped' : 'Stopped · $title',
      );
}

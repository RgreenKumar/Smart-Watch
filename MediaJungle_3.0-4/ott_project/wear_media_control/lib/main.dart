import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'services/notification_service.dart';
import 'services/watch_socket_service.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setEnabledSystemUIMode(SystemUiMode.immersiveSticky);
  runApp(const WearMediaControlApp());
}

class WearMediaControlApp extends StatelessWidget {
  const WearMediaControlApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Media Watch Remote',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: Colors.black,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF8FE400),
          brightness: Brightness.dark,
        ),
        useMaterial3: true,
      ),
      home: const WatchHomeScreen(),
    );
  }
}

class WatchHomeScreen extends StatefulWidget {
  const WatchHomeScreen({super.key});

  @override
  State<WatchHomeScreen> createState() => _WatchHomeScreenState();
}

class _WatchHomeScreenState extends State<WatchHomeScreen> {
  StreamSubscription<PlaybackState>? _stateSub;
  StreamSubscription<PlaybackEvent>? _eventSub;

  PlaybackState _last = const PlaybackState(status: 'stopped');

  @override
  void initState() {
    super.initState();
    NotificationService.instance.init();
    WatchSocketService.instance.connect();

    _stateSub = WatchSocketService.instance.stateStream.listen((s) {
      if (mounted) setState(() => _last = s);
    });

    // ── Required notifications: song started & stopped ──
    _eventSub = WatchSocketService.instance.eventStream.listen((e) async {
      switch (e.event) {
        case 'started':
          await NotificationService.instance.songStarted(e.title);
          break;
        case 'stopped':
          await NotificationService.instance.songStopped(e.title);
          break;
        default:
          break;
      }
    });
  }

  @override
  void dispose() {
    _stateSub?.cancel();
    _eventSub?.cancel();
    super.dispose();
  }

  void _send(String action, {double? value}) =>
      WatchSocketService.instance.sendCommand(action, value: value);

  Future<void> _editServerUrl() async {
    final controller =
        TextEditingController(text: WatchSocketService.instance.serverUrl.value);
    final url = await showDialog<String>(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF1E1E1E),
        title: const Text('Relay server', style: TextStyle(fontSize: 14)),
        content: TextField(
          controller: controller,
          autofocus: true,
          keyboardType: TextInputType.url,
          style: const TextStyle(fontSize: 12),
          decoration: const InputDecoration(
            hintText: 'ws://10.0.2.2:8080?role=watch',
            border: OutlineInputBorder(),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, controller.text),
            child: const Text('Save'),
          ),
        ],
      ),
    );
    if (url != null) {
      WatchSocketService.instance.configure(url);
      setState(() {});
    }
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;
    final isPlaying = _last.isPlaying;
    final hasTrack = _last.status != 'stopped' || _last.title.isNotEmpty;

    return Scaffold(
      body: Center(
        child: Padding(
          padding: EdgeInsets.symmetric(horizontal: size.width * 0.10),
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // ── Header: connection + server config ──
                ValueListenableBuilder<bool>(
                  valueListenable: WatchSocketService.instance.connected,
                  builder: (context, isConnected, child) =>
                      ValueListenableBuilder<int>(
                    valueListenable:
                        WatchSocketService.instance.pagesOnline,
                    builder: (context, pages, child) {
                      final String label;
                      final Color color;
                      if (!isConnected) {
                        label = 'Offline · tap to setup';
                        color = Colors.red;
                      } else if (pages == 0) {
                        label = 'No webpage open';
                        color = Colors.orangeAccent;
                      } else {
                        label = '● Connected';
                        color = Colors.lightGreenAccent;
                      }
                      return Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.watch,
                            size: 12,
                            color: color,
                          ),
                          const SizedBox(width: 4),
                          GestureDetector(
                            onTap: _editServerUrl,
                            child: Text(
                              label,
                              style: TextStyle(
                                fontSize: 10,
                                color: color == Colors.red
                                    ? Colors.white54
                                    : color,
                              ),
                            ),
                          ),
                        ],
                      );
                    },
                  ),
                ),

                // ── Track info ──
                const SizedBox(height: 6),
                SizedBox(
                  width: double.infinity,
                  child: Text(
                    hasTrack ? _last.title : 'Media Jungle',
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                Text(
                  hasTrack ? _last.subtitle : 'no track',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  textAlign: TextAlign.center,
                  style: const TextStyle(fontSize: 10, color: Colors.white54),
                ),
                Text(
                  isPlaying
                      ? 'PLAYING'
                      : (_last.status == 'paused' ? 'PAUSED' : 'STOPPED'),
                  style: TextStyle(
                    fontSize: 10,
                    letterSpacing: 2,
                    fontWeight: FontWeight.bold,
                    color: isPlaying
                        ? Colors.lightGreenAccent
                        : Colors.orangeAccent,
                  ),
                ),

                // ── Transport controls row ──
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    _WatchButton(
                      icon: Icons.skip_previous,
                      onPressed: () => _send('previous'),
                    ),
                    const SizedBox(width: 8),
                    _WatchButton(
                      icon: isPlaying ? Icons.pause : Icons.play_arrow,
                      big: true,
                      accent: Colors.lightGreenAccent,
                      onPressed: () => _send('togglePlayPause'),
                    ),
                    const SizedBox(width: 8),
                    _WatchButton(
                      icon: Icons.skip_next,
                      onPressed: () => _send('next'),
                    ),
                  ],
                ),

                // ── Seek + stop row ──
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    _WatchButton(
                      icon: Icons.replay_10,
                      onPressed: () => _send('seekBackward', value: 10),
                    ),
                    const SizedBox(width: 8),
                    _WatchButton(
                      icon: Icons.stop,
                      accent: Colors.redAccent,
                      onPressed: () => _send('stop'),
                    ),
                    const SizedBox(width: 8),
                    _WatchButton(
                      icon: Icons.forward_10,
                      onPressed: () => _send('seekForward', value: 10),
                    ),
                  ],
                ),

                // ── Volume row ──
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    _WatchButton(
                      icon: Icons.volume_down,
                      small: true,
                      onPressed: () => _send('volumeDown', value: 0.1),
                    ),
                    const SizedBox(width: 8),
                    _WatchButton(
                      icon: Icons.volume_up,
                      small: true,
                      onPressed: () => _send('volumeUp', value: 0.1),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

/// Circular button sized for round watch faces.
class _WatchButton extends StatelessWidget {
  const _WatchButton({
    required this.icon,
    required this.onPressed,
    this.big = false,
    this.small = false,
    this.accent,
  });

  final IconData icon;
  final VoidCallback onPressed;
  final bool big;
  final bool small;
  final Color? accent;

  @override
  Widget build(BuildContext context) {
    final diameter = big ? 58.0 : (small ? 40.0 : 48.0);
    return InkWell(
      onTap: () {
        HapticFeedback.selectionClick();
        onPressed();
      },
      customBorder: const CircleBorder(),
      child: Container(
        width: diameter,
        height: diameter,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: accent?.withAlpha(46) ?? Colors.white.withAlpha(24),
          border: Border.all(color: accent ?? Colors.white38, width: 1.5),
        ),
        child: Icon(icon, size: diameter * 0.55, color: Colors.white),
      ),
    );
  }
}

// Temporary end-to-end test of the relay protocol.
// Simulates BOTH ends: a web page and a watch, against the real relay server.
import 'dart:async';
import 'dart:convert';
import 'dart:io';

final List<String> _pageLog = [];
final List<String> _watchLog = [];
WebSocket? _page;
WebSocket? _watch;

Future<void> main() async {
  const url = 'ws://127.0.0.1:8081';
  final completer = Completer<void>();

  // ── Page side ──
  _page = await WebSocket.connect('$url?role=page');
  _page!.listen((data) {
    final msg = jsonDecode(data as String) as Map<String, dynamic>;
    _pageLog.add('${msg['type']}');
    if (msg['type'] == 'command') {
      // Page "plays" → replies with state + started event.
      _page!.add(jsonEncode({
        'type': 'state',
        'status': 'playing',
        'title': 'Test Song',
        'subtitle': 'Test Movie',
        'positionSec': 3.0,
        'durationSec': 200.0,
      }));
      _page!.add(jsonEncode(
          {'type': 'event', 'event': 'started', 'title': 'Test Song'}));
    }
  });

  await Future<void>.delayed(const Duration(milliseconds: 300));

  // ── Watch side ──
  _watch = await WebSocket.connect('$url?role=watch');
  _watch!.listen((data) {
    final msg = jsonDecode(data as String) as Map<String, dynamic>;
    _watchLog.add('${msg['type']}'
        '${msg['type'] == 'event' ? ':${msg['event']}' : ''}'
        '${msg['type'] == 'state' ? ':${msg['status']}:${msg['title']}' : ''}');
    if (_watchLog.length >= 4 && !completer.isCompleted) {
      completer.complete();
    }
  });

  await Future<void>.delayed(const Duration(milliseconds: 300));

  // ── Watch presses PLAY ──
  _watch!.add(jsonEncode({'type': 'command', 'action': 'togglePlayPause'}));

  await completer.future.timeout(const Duration(seconds: 5));
  await Future<void>.delayed(const Duration(milliseconds: 200));

  stdout.writeln('PAGE received : $_pageLog');
  stdout.writeln('WATCH received: $_watchLog');

  final ok = _pageLog.contains('command') &&
      _watchLog.any((e) => e.startsWith('hello')) &&
      _watchLog.any((e) => e.startsWith('peers')) &&
      _watchLog.any((e) => e.startsWith('state:playing')) &&
      _watchLog.any((e) => e.contains('event:started'));

  stdout.writeln(ok ? '\nE2E TEST PASSED' : '\nE2E TEST FAILED');
  exit(ok ? 0 : 1);
}

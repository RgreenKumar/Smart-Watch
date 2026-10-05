// ─────────────────────────────────────────────────────────────────────────────
// Media Relay Server (zero dependencies — plain Dart)
//
// Bridges the OTT web page (browser) and the Wear OS watch app.
//
//   Watch app  ──ws──►  THIS SERVER  ──ws──►  Web page (OTT app)
//   commands:           relays:               executes on player,
//   play/pause/...      watch → page          broadcasts playback state
//                       page  → watch         back to the watch.
//
// Run it with:   dart run tool/media_relay_server.dart
// Page connects : ws://<pc-ip>:8080?role=page
// Watch connect : ws://<pc-ip>:8080?role=watch   (from Android emulator use
//                                                 ws://10.0.2.2:8080?role=watch)
// ─────────────────────────────────────────────────────────────────────────────
import 'dart:async';
import 'dart:convert';
import 'dart:io';

const int kPort = 8080;

final Map<WebSocket, String> _clients = {}; // socket -> role ('page'|'watch')

Future<void> main(List<String> args) async {
  final port = args.isNotEmpty ? int.tryParse(args[0]) ?? kPort : kPort;
  final server = await HttpServer.bind(InternetAddress.anyIPv4, port);
  _printInterfaces(port);
  stdout.writeln('Media relay server listening on port $port ...');
  stdout.writeln('');

  server.listen((HttpRequest req) async {
    if (!WebSocketTransformer.isUpgradeRequest(req)) {
      // Plain HTTP GET — tiny health endpoint.
      req.response.statusCode = HttpStatus.ok;
      req.response.headers.contentType = ContentType.text;
      req.response.write(
          'Media relay is running.\nPages: ws://<host>:$port?role=page\n'
          'Watch: ws://<host>:$port?role=watch\nConnected pages: '
          '${_countRole('page')}  watches: ${_countRole('watch')}\n');
      await req.response.close();
      return;
    }

    final role =
        (req.uri.queryParameters['role'] == 'page') ? 'page' : 'watch';
    final socket = await WebSocketTransformer.upgrade(req);
    socket.pingInterval = const Duration(seconds: 20);
    _clients[socket] = role;
    stdout.writeln('[+] $role connected (${_countRole(role)} $role(s) now)');

    // Greet the newcomer immediately so its UI can show "Connected".
    socket.add(jsonEncode({'type': 'hello', 'role': role}));
    // And tell everyone the new peer counts.
    _broadcastPeers();

    socket.listen(
      (data) => _onMessage(socket, role, data),
      onDone: () {
        _clients.remove(socket);
        stdout.writeln(
            '[-] $role disconnected (${_countRole(role)} $role(s) left)');
        _broadcastPeers();
      },
      onError: (_) {
        _clients.remove(socket);
        _broadcastPeers();
      },
      cancelOnError: true,
    );
  }, onError: (Object e) => stderr.writeln('Server error: $e'));
}

void _broadcastPeers() {
  final payload = jsonEncode({
    'type': 'peers',
    'pages': _countRole('page'),
    'watches': _countRole('watch'),
  });
  _clients.forEach((socket, _) {
    if (socket.readyState == WebSocket.open) socket.add(payload);
  });
}

void _onMessage(WebSocket sender, String role, dynamic data) {
  if (data is! String) return;
  // Everything a watch sends goes to all pages; everything a page sends
  // goes to all watches.
  final targetRole = role == 'watch' ? 'page' : 'watch';
  var forwarded = 0;
  _clients.forEach((socket, clientRole) {
    if (identical(socket, sender)) return;
    if (clientRole != targetRole) return;
    if (socket.readyState != WebSocket.open) return;
    socket.add(data);
    forwarded++;
  });

  // Human-friendly log line.
  try {
    final msg = jsonDecode(data) as Map<String, dynamic>;
    final type = msg['type'];
    final detail = type == 'command'
        ? 'command=${msg['action']}'
        : type == 'event'
            ? 'event=${msg['event']}'
            : type == 'state'
                ? 'state=${msg['status']} title=${msg['title']}'
                : data;
    stdout.writeln('[relay] $role → $targetRole ($forwarded): $detail');
  } catch (_) {}
}

int _countRole(String role) =>
    _clients.values.where((r) => r == role).length;

void _printInterfaces(int port) {
  stdout.writeln('');
  stdout.writeln('═══════════════════════════════════════════════════════');
  stdout.writeln(' Connect the WEB PAGE to:');
  final interfaces = NetworkInterface.list(
      type: InternetAddressType.IPv4, includeLoopback: false);
  interfaces.then((list) {
    for (final i in list) {
      for (final addr in i.addresses) {
        stdout.writeln('   ws://${addr.address}:$port?role=page');
      }
    }
    stdout.writeln('   ws://localhost:$port?role=page   (same PC browser)');
    stdout.writeln('');
    stdout.writeln(' Connect the WATCH APP to:');
    stdout.writeln('   ws://10.0.2.2:$port?role=watch   (Android emulator)');
    for (final i in list) {
      for (final addr in i.addresses) {
        stdout.writeln('   ws://${addr.address}:$port?role=watch   (real watch)');
      }
    }
    stdout.writeln('═══════════════════════════════════════════════════════');
  }).catchError((_) {});
}

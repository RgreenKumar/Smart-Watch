// Relay server — bridges Wear OS watches (role=watch) with player clients
// (role=page). Player clients are the Flutter app running as the Mobile app
// (Android) and as the Website/TV UI (web). Any client can be a "page".
//
// Message protocol (JSON text frames):
//   page  -> relay : { type:'state',  status, title, subtitle,
//                      positionSec, durationSec }
//   page  -> relay : { type:'event',  event:'started'|'stopped', title }
//   watch -> relay : { type:'command', action, value }
//   relay -> watch : forwards state / event / peers
//   relay -> page  : forwards command
//
// The relay remembers the latest state from every page so a newly connected
// watch immediately receives the current playback state (not just future ones).
const { WebSocketServer, WebSocket } = require('ws');

const RELAY_PORT = process.env.RELAY_PORT || 8080;

function log(...args) {
  console.log(`[relay]`, ...args);
}

/**
 * Start the WebSocket relay server on RELAY_PORT.
 * Shares nothing with Express; it is an indepurately listening WebSocket
 * endpoint so watches/clients use ws://<host>:8080.
 */
function startRelayServer({ port = RELAY_PORT } = {}) {
  const wss = new WebSocketServer({ port }, () => {
    log(`listening on ws://0.0.0.0:${port}`);
  });

  /** @type {Set<WebSocket>} */
  const watches = new Set();
  /** @type {Set<WebSocket>} */
  const pages = new Set();
  /** @type {Map<WebSocket, object>} last serializable state per page */
  const pageStates = new Map();

  function roleOf(socketUrl) {
    // req.url is a path+query, e.g. "/?role=page" — parse relative to a base.
    try {
      const parsed = new URL(socketUrl, 'ws://localhost');
      const role = parsed.searchParams.get('role');
      return role === 'page' ? 'page' : 'watch';
    } catch {
      return 'watch';
    }
  }

  function broadcastPeers() {
    const msg = JSON.stringify({ type: 'peers', pages: pages.size });
    for (const w of watches) {
      try { w.send(msg); } catch {}
    }
  }

  function sendLatestStateTo(watch) {
    // Send each page's latest state (usually just one active player).
    for (const state of pageStates.values()) {
      try { watch.send(JSON.stringify(state)); } catch {}
    }
  }

  function send(who, data) {
    try { who.send(JSON.stringify(data)); } catch {}
  }

  wss.on('connection', (socket, req) => {
    const role = roleOf(req.url);
    if (role === 'page') {
      pages.add(socket);
      log(`page connected (${pages.size} pages online)`);
      broadcastPeers();
    } else {
      watches.add(socket);
      log(`watch connected (${watches.size} watches online)`);
      send(socket, { type: 'hello' });
      send(socket, { type: 'peers', pages: pages.size });
      sendLatestStateTo(socket);
    }

    socket.on('message', (raw) => {
      let msg;
      try {
        msg = JSON.parse(raw.toString());
      } catch {
        return;
      }
      if (!msg || typeof msg !== 'object') return;

      const type = msg.type;
      if (role === 'page') {
        if (type === 'state') {
          const state = {
            type: 'state',
            status: msg.status || 'stopped',
            title: msg.title || '',
            subtitle: msg.subtitle || '',
            positionSec: Number(msg.positionSec) || 0,
            durationSec: Number(msg.durationSec) || 0,
          };
          pageStates.set(socket, state);
          for (const w of watches) send(w, state);
        } else if (type === 'event') {
          const event = {
            type: 'event',
            event: msg.event || '',
            title: msg.title || '',
          };
          for (const w of watches) send(w, event);
        }
      } else {
        // watch role — commands are forwarded to every connected page
        if (type === 'command') {
          const command = {
            type: 'command',
            action: msg.action,
            value: msg.value ?? null,
          };
          for (const p of pages) send(p, command);
        }
      }
    });

    socket.on('close', () => {
      if (role === 'page') {
        pages.delete(socket);
        pageStates.delete(socket);
        log(`page disconnected (${pages.size} pages online)`);
      } else {
        watches.delete(socket);
        log(`watch disconnected (${watches.size} watches online)`);
      }
      if (role === 'page') broadcastPeers();
    });

    socket.on('error', () => {
      socket.close();
    });
  });

  return wss;
}

module.exports = { startRelayServer };

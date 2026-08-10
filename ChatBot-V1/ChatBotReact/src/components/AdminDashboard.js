/**
 * src/components/AdminDashboard.jsx
 * Web-based agent admin panel.
 * Mirrors Flutter admin — both see the same sessions in real time.
 */
import { useState, useEffect, useRef } from 'react';
import { useChatAdmin } from '../hooks/useChatAdmin';

const AGENT_ID = localStorage.getItem('agentId') || 'agent-web-001';

/* ── Badge ───────────────────────────────────────────────────────── */
function Badge({ state }) {
  const map = {
    AI_MODE:      { label: 'AI Bot',  color: '#15803d', bg: '#dcfce7' },
    PENDING:      { label: 'Waiting', color: '#b45309', bg: '#fef3c7' },
    AGENT_ACTIVE: { label: 'Agent',   color: '#1d4ed8', bg: '#dbeafe' },
  };
  const { label, color, bg } = map[state] || map.AI_MODE;
  return (
    <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px',
      borderRadius: 10, color, background: bg }}>{label}</span>
  );
}

/* ── Session row ─────────────────────────────────────────────────── */
function SessionRow({ session, isActive, onClick, onTakeover }) {
  const lastMsg = session.lastMessage;
  return (
    <div onClick={onClick} style={{
      padding: '14px 16px', borderBottom: '1px solid #f3f4f6',
      background: isActive ? '#eff6ff' : '#fff', cursor: 'pointer',
      display: 'flex', gap: 12, alignItems: 'flex-start', transition: 'background .15s',
    }}
      onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#f9fafb'; }}
      onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = isActive ? '#eff6ff' : '#fff'; }}
    >
      <div style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
        background: session.state === 'PENDING' ? '#fef3c7'
          : isActive ? '#dbeafe' : '#f0fdf4',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
        {session.state === 'PENDING' ? '⏳' : session.state === 'AGENT_ACTIVE' ? '🎧' : '🤖'}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontWeight: 600, fontSize: 14 }}>{session.visitorId || 'Visitor'}</span>
          <Badge state={session.state} />
        </div>
        {lastMsg && (
          <div style={{ fontSize: 12, color: '#6b7280',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {lastMsg.sender === 'bot' ? '🤖 ' : lastMsg.sender === 'agent' ? '🎧 ' : ''}
            {lastMsg.text}
          </div>
        )}
        <div style={{ display: 'flex', gap: 8, marginTop: 4, alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: '#9ca3af' }}>{session.msgCount || 0} messages</span>
          {session.state === 'PENDING' && (
            <button onClick={e => { e.stopPropagation(); onTakeover(); }}
              style={{ fontSize: 11, padding: '3px 10px', borderRadius: 6, border: 'none',
                background: '#2563eb', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>
              Take over →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Message bubble ──────────────────────────────────────────────── */
function Bubble({ msg }) {
  const sender = msg.sender || 'visitor';
  const isRight = sender === 'agent';
  const colors = {
    agent:   { bg: '#2563eb', text: '#fff' },
    bot:     { bg: '#f3f4f6', text: '#111827' },
    visitor: { bg: '#fff',    text: '#111827' },
  };
  const { bg, text } = colors[sender] || colors.visitor;
  return (
    <div style={{ display: 'flex', flexDirection: 'column',
      alignItems: isRight ? 'flex-end' : 'flex-start', marginBottom: 8 }}>
      {sender === 'bot' && <span style={{ fontSize: 10, color: '#7c3aed', marginBottom: 2, fontWeight: 600 }}>AI Bot</span>}
      {sender === 'agent' && <span style={{ fontSize: 10, color: '#1d4ed8', marginBottom: 2, fontWeight: 600 }}>You (Agent)</span>}
      <div style={{ maxWidth: '72%', padding: '10px 14px', borderRadius: 12,
        background: bg, color: text, fontSize: 14, lineHeight: 1.5,
        boxShadow: '0 1px 3px rgba(0,0,0,.07)',
        border: msg.isHandoffTrigger ? '1.5px solid #fbbf24' : 'none' }}>
        {msg.text}
        {msg.isHandoffTrigger && (
          <div style={{ fontSize: 10, color: '#b45309', marginTop: 4 }}>⚠ AI handed off</div>
        )}
      </div>
    </div>
  );
}

/* ── Agent chat panel ────────────────────────────────────────────── */
function ChatPanel({ session, messages, onTakeover, onSend }) {
  const [text, setText] = useState('');
  const scrollRef       = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = () => { if (!text.trim()) return; onSend(session.sessionId, text.trim()); setText(''); };

  const isAgent   = session.state === 'AGENT_ACTIVE';
  const isPending = session.state === 'PENDING';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#f9fafb' }}>
      {/* Header */}
      <div style={{ padding: '12px 20px', background: '#fff', borderBottom: '1px solid #e5e7eb',
        display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#ede9fe',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
          {(session.visitorId?.[0] || 'V').toUpperCase()}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{session.visitorId}</div>
          <div style={{ fontSize: 11, color: isAgent ? '#2563eb' : isPending ? '#b45309' : '#16a34a' }}>
            {isAgent ? '🎧 You are handling' : isPending ? '⏳ Waiting for agent' : '🤖 AI is handling'}
          </div>
        </div>
      </div>

      {/* Takeover banner */}
      {isPending && (
        <div style={{ background: '#fffbeb', borderBottom: '1px solid #fde68a',
          padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ flex: 1, fontSize: 13, color: '#92400e' }}>
            AI could not answer. Visitor is waiting.
          </span>
          <button onClick={() => onTakeover(session.sessionId)} style={{
            padding: '7px 16px', background: '#2563eb', color: '#fff',
            border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
            Take over
          </button>
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: '#9ca3af', marginTop: 40, fontSize: 13 }}>
            No messages yet
          </div>
        )}
        {messages.map((m, i) => <Bubble key={i} msg={m} />)}
      </div>

      {/* Input */}
      {isAgent ? (
        <div style={{ padding: '12px 16px', background: '#fff', borderTop: '1px solid #e5e7eb',
          display: 'flex', gap: 8 }}>
          <input value={text} onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Reply as agent…"
            style={{ flex: 1, padding: '10px 14px', border: '1px solid #d1d5db',
              borderRadius: 24, fontSize: 14, outline: 'none' }} />
          <button onClick={handleSend} style={{ width: 44, height: 44, borderRadius: '50%',
            border: 'none', background: '#2563eb', color: '#fff', fontSize: 18, cursor: 'pointer' }}>
            ↑
          </button>
        </div>
      ) : (
        <div style={{ padding: '10px 20px', background: '#fff', borderTop: '1px solid #e5e7eb',
          textAlign: 'center', fontSize: 12, color: '#9ca3af' }}>
          {isPending ? 'Take over the chat to start replying' : '🤖 AI is handling this conversation'}
        </div>
      )}
    </div>
  );
}

/* ── Main dashboard ──────────────────────────────────────────────── */
export default function AdminDashboard() {
  const { connected, sessions, pendingCount, aiCount, agentCount,
          pendingAlert, chatMessages, takeoverSession, sendAgentMessage, fetchHistory }
    = useChatAdmin(AGENT_ID);

  const [activeId, setActiveId] = useState(null);
  const activeSession  = sessions.find(s => s.sessionId === activeId);
  const activeMessages = activeId ? (chatMessages[activeId] || []) : [];

  const openSession = s => { setActiveId(s.sessionId); fetchHistory(s.sessionId); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh',
      fontFamily: 'Inter, system-ui, sans-serif', background: '#f9fafb' }}>

      {/* Top bar */}
      <div style={{ height: 56, background: '#1e293b', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '0 20px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>💬</span>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>Chat Admin</span>
          {pendingCount > 0 && (
            <span style={{ background: '#f59e0b', color: '#fff', fontSize: 11,
              fontWeight: 700, padding: '2px 8px', borderRadius: 10 }}>
              {pendingCount} waiting
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 12, color: '#94a3b8' }}>AI: {aiCount} · Pending: {pendingCount} · Agent: {agentCount}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%',
              background: connected ? '#16a34a' : '#ef4444', display: 'inline-block' }} />
            <span style={{ color: '#94a3b8', fontSize: 12 }}>{connected ? 'Live' : 'Offline'}</span>
          </div>
        </div>
      </div>

      {/* Pending toast */}
      {pendingAlert && (
        <div style={{ position: 'fixed', top: 70, right: 20, zIndex: 9999,
          background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 10,
          padding: '12px 18px', boxShadow: '0 4px 12px rgba(0,0,0,.12)',
          display: 'flex', alignItems: 'center', gap: 10, maxWidth: 320 }}>
          <span style={{ fontSize: 20 }}>🔔</span>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13, color: '#92400e' }}>New chat waiting</div>
            <div style={{ fontSize: 12, color: '#a16207' }}>
              {pendingAlert.session?.visitorId} needs an agent
            </div>
          </div>
        </div>
      )}

      {/* Main layout */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Session list */}
        <div style={{ width: 320, flexShrink: 0, overflowY: 'auto',
          borderRight: '1px solid #e5e7eb', background: '#fff' }}>
          <div style={{ padding: '10px 16px', borderBottom: '1px solid #f3f4f6',
            fontSize: 12, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em' }}>
            All Sessions ({sessions.length})
          </div>
          {sessions.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
              No active chats yet
            </div>
          ) : sessions.map(s => (
            <SessionRow key={s.sessionId} session={s}
              isActive={s.sessionId === activeId}
              onClick={() => openSession(s)}
              onTakeover={() => takeoverSession(s.sessionId)} />
          ))}
        </div>

        {/* Chat panel */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          {activeSession ? (
            <ChatPanel session={activeSession} messages={activeMessages}
              onTakeover={takeoverSession} onSend={sendAgentMessage} />
          ) : (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', color: '#9ca3af', gap: 12 }}>
              <span style={{ fontSize: 48 }}>💬</span>
              <div style={{ fontSize: 16, fontWeight: 600 }}>Select a chat to view</div>
              <div style={{ fontSize: 13 }}>
                {pendingCount > 0 ? `${pendingCount} visitor(s) waiting for an agent` : 'All chats handled by AI'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

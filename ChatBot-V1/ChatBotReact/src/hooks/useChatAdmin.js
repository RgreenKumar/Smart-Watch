/**
 * src/hooks/useChatAdmin.js
 * React hook — WebSocket + REST for the admin panel.
 * npm install @stomp/stompjs sockjs-client
 */
import { useEffect, useRef, useState, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import VITE_API_URL from '../Config';

const BASE_URL = process.env.REACT_APP_BACKEND_URL || VITE_API_URL;

export function useChatAdmin(agentId) {
  const clientRef = useRef(null);
  const subsRef   = useRef({});

  const [connected,    setConnected]    = useState(false);
  const [sessions,     setSessions]     = useState([]);
  const [pendingAlert, setPendingAlert] = useState(null);
  const [chatMessages, setChatMessages] = useState({});

  const appendMsg = useCallback((sessionId, msg) => {
    setChatMessages(prev => ({ ...prev, [sessionId]: [...(prev[sessionId] || []), msg] }));
  }, []);

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS(`${BASE_URL}/ws`),
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        setConnected(true);
        client.subscribe('/topic/admin/sessions', f => {
          const d = JSON.parse(f.body);
          setSessions(d.sessions || []);
        });
        client.subscribe('/topic/admin/pending', f => {
          const a = JSON.parse(f.body);
          setPendingAlert(a);
          setTimeout(() => setPendingAlert(null), 6000);
        });
      },
      onDisconnect: () => setConnected(false),
    });
    client.activate();
    clientRef.current = client;
    fetch(`${BASE_URL}/api/chat/sessions`).then(r=>r.json())
      .then(d => setSessions(d.sessions || [])).catch(()=>{});
    return () => client.deactivate();
  }, []);

  const subscribeSession = useCallback((sessionId) => {
    if (!clientRef.current?.connected || subsRef.current[sessionId]) return;
    const sub = clientRef.current.subscribe(`/topic/chat/${sessionId}`, f => {
      appendMsg(sessionId, JSON.parse(f.body));
    });
    subsRef.current[sessionId] = sub;
  }, [appendMsg]);

  const takeoverSession = useCallback((sessionId) => {
    clientRef.current?.publish({
      destination: '/app/chat.takeover',
      body: JSON.stringify({ sessionId, agentId }),
    });
    subscribeSession(sessionId);
  }, [agentId, subscribeSession]);

  const sendAgentMessage = useCallback((sessionId, message) => {
    clientRef.current?.publish({
      destination: '/app/chat.agent.send',
      body: JSON.stringify({ sessionId, agentId, message }),
    });
  }, [agentId]);

  const fetchHistory = useCallback(async (sessionId) => {
    try {
      const r = await fetch(`${BASE_URL}/api/chat/sessions/${sessionId}/history`);
      const d = await r.json();
      const msgs = d.messages || [];
      setChatMessages(prev => ({ ...prev, [sessionId]: msgs }));
      subscribeSession(sessionId);
      return msgs;
    } catch { return []; }
  }, [subscribeSession]);

  const pendingCount = sessions.filter(s => s.state === 'PENDING').length;
  const aiCount      = sessions.filter(s => s.state === 'AI_MODE').length;
  const agentCount   = sessions.filter(s => s.state === 'AGENT_ACTIVE').length;

  return { connected, sessions, pendingCount, aiCount, agentCount,
           pendingAlert, chatMessages, takeoverSession, sendAgentMessage, fetchHistory };
}

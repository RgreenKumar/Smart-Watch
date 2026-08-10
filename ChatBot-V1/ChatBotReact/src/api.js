// src/api.js
// ─────────────────────────────────────────────────────────────────────────────
// REST helpers for Spring Boot API calls.
// All WebSocket/STOMP communication is handled inside individual components
// using @stomp/stompjs + sockjs-client directly.
// ─────────────────────────────────────────────────────────────────────────────
import VITE_API_URL from './Config'

/**
 * Fetch visible chat sessions for the logged-in agent.
 * Used as a fallback / initial load in SecondColumn.
 */
export const getChatSessions = async (agentId) => {
  try {
    const res = await fetch(`${VITE_API_URL}/chat/sessions/visible?agentId=${agentId}`)
    if (!res.ok) throw new Error('Failed to fetch sessions')
    return await res.json()
  } catch (err) {
    console.error('[api] getChatSessions error:', err)
    return []
  }
}

/**
 * Load full message history for a given session.
 * Called by ThirdColumn after a session is selected.
 */
export const getChatHistory = async (sessionId) => {
  try {
    const res = await fetch(`${VITE_API_URL}/chat/history/${sessionId}`)
    if (!res.ok) throw new Error('Failed to fetch history')
    return await res.json()
  } catch (err) {
    console.error('[api] getChatHistory error:', err)
    return []
  }
}

/**
 * Agent claims a pending session via REST.
 * ThirdColumn calls this first, then publishes a STOMP take-over message.
 */
export const claimSession = async (sessionId, agentEmail) => {
  try {
    const res = await fetch(
      `${VITE_API_URL}/chat/claim?sessionId=${encodeURIComponent(sessionId)}&agentEmail=${encodeURIComponent(agentEmail)}`,
      { method: 'POST' }
    )
    return res.status // 200 = success, 409 = already claimed
  } catch (err) {
    console.error('[api] claimSession error:', err)
    return 500
  }
}

/**
 * Close (or reopen) a chat session.
 */
export const setSessionStatus = async (sessionId, status) => {
  try {
    const formData = new FormData()
    formData.append('sessionId', sessionId)
    formData.append('Status', status)
    const res = await fetch(`${VITE_API_URL}/chat/setStatusForSessionID`, {
      method: 'POST',
      body: formData,
    })
    return res.ok
  } catch (err) {
    console.error('[api] setSessionStatus error:', err)
    return false
  }
}

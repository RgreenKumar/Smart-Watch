import React, { useState, useEffect, useRef, useCallback } from 'react'
import { CCardHeader, CButton } from '@coreui/react'
import axios from 'axios'
import img from '../../assets/images/avatars/1.jpg'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import VITE_API_URL from '../../Config'

// ── File-type helpers ─────────────────────────────────────────────────────────
const ALLOWED_MIME = new Set([
  'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/zip', 'application/x-zip-compressed',
])
const BLOCKED_EXT = ['.exe', '.bat', '.sh', '.cmd', '.msi', '.ps1', '.vbs', '.jar', '.com', '.pif', '.scr', '.reg', '.dll']
const MAX_SIZE_BYTES = 10 * 1024 * 1024   // 10 MB — must match backend

const isImage = (type) => type && type.startsWith('image/')
const fmtSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

const fileIcon = (type) => {
  if (!type) return '📄'
  if (isImage(type))           return '🖼️'
  if (type.includes('pdf'))    return '📕'
  if (type.includes('word'))   return '📘'
  if (type.includes('excel') || type.includes('spreadsheet')) return '📗'
  if (type.includes('zip'))    return '🗜️'
  if (type.includes('text'))   return '📝'
  return '📄'
}

// ─────────────────────────────────────────────────────────────────────────────
// AttachmentMessage — renders a file bubble inside the chat
// ─────────────────────────────────────────────────────────────────────────────
const AttachmentMessage = ({ msg, isAgent }) => {
  const { fileName, fileType, fileSize, fileUrl } = msg

  const bubbleStyle = {
    maxWidth: '72%',
    wordBreak: 'break-word',
    borderRadius: '12px',
    overflow: 'hidden',
    border: isAgent ? 'none' : '1px solid #dee2e6',
    background: isAgent ? '#0d6efd' : '#fff',
    color: isAgent ? '#fff' : '#212529',
  }

  if (isImage(fileType)) {
    return (
      <div style={bubbleStyle}>
        <a href={fileUrl} target="_blank" rel="noreferrer" style={{ display: 'block' }}>
          <img
            src={fileUrl}
            alt={fileName}
            style={{ maxWidth: '100%', maxHeight: '200px', display: 'block', borderRadius: '12px' }}
          />
        </a>
        <div style={{ padding: '4px 8px', fontSize: '11px', opacity: 0.75 }}>
          {fileName} · {fmtSize(fileSize)}
        </div>
      </div>
    )
  }

  return (
    <div style={{ ...bubbleStyle, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
      <span style={{ fontSize: '24px', lineHeight: 1 }}>{fileIcon(fileType)}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {fileName}
        </div>
        <div style={{ fontSize: '11px', opacity: 0.75 }}>{fmtSize(fileSize)}</div>
      </div>
      <a
        href={fileUrl}
        target="_blank"
        rel="noreferrer"
        download={fileName}
        style={{
          fontSize: '18px',
          textDecoration: 'none',
          color: isAgent ? '#fff' : '#0d6efd',
          flexShrink: 0,
        }}
        title="Download"
      >
        ⬇
      </a>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// FilePreviewBar — shown above the input once a file is selected
// ─────────────────────────────────────────────────────────────────────────────
const FilePreviewBar = ({ file, preview, progress, error, onRemove }) => {
  if (!file) return null

  return (
    <div
      style={{
        padding: '8px 12px',
        borderTop: '1px solid #dee2e6',
        background: '#f8f9fa',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontSize: '13px',
      }}
    >
      {/* Thumbnail or icon */}
      {preview
        ? <img src={preview} alt="" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} />
        : <span style={{ fontSize: 28 }}>{fileIcon(file.type)}</span>
      }

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {file.name}
        </div>
        <div style={{ color: '#6c757d', fontSize: '11px' }}>{fmtSize(file.size)}</div>
        {error && <div style={{ color: '#dc3545', fontSize: '11px', marginTop: 2 }}>{error}</div>}

        {/* Upload progress bar */}
        {progress !== null && progress >= 0 && (
          <div style={{ marginTop: 4, height: 4, background: '#dee2e6', borderRadius: 4, overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: progress + '%',
                background: progress === 100 ? '#198754' : '#0d6efd',
                transition: 'width 0.2s ease',
                borderRadius: 4,
              }}
            />
          </div>
        )}
      </div>

      <button
        onClick={onRemove}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: '18px', color: '#6c757d', flexShrink: 0, lineHeight: 1,
        }}
        title="Remove file"
      >
        ✕
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ThirdColumn (main component)
// ─────────────────────────────────────────────────────────────────────────────
const ThirdColumn = ({
  sessionDetails,
  adminName,
  adminEmail,
  adminId,
  jwtToken,
  chatJoined,
  onSessionClaimed,
}) => {
  const {
    sessionId,
    name: userName,
    senderid: userId,
    senderemail,
    receiveremail,
    status,
    departmentId,
  } = sessionDetails || {}

  const [messages,      setMessages]      = useState([])
  const [inputMsg,      setInputMsg]      = useState('')
  const [joined,        setJoined]        = useState(false)
  const [isClosed,      setIsClosed]      = useState(false)
  const [visitorTyping, setVisitorTyping] = useState(false)
  const [agentIsTyping, setAgentIsTyping] = useState(false)
  const [closingChat,   setClosingChat]   = useState(false)

  // ── File attachment state ─────────────────────────────────────────────────
  const [pendingFile,    setPendingFile]    = useState(null)   // File object
  const [filePreview,    setFilePreview]    = useState(null)   // data-URL for images
  const [uploadProgress, setUploadProgress] = useState(null)  // 0-100 | null
  const [uploadError,    setUploadError]    = useState(null)
  const [isDragOver,     setIsDragOver]     = useState(false)
  const [isUploading,    setIsUploading]    = useState(false)

  const messagesEndRef     = useRef(null)
  const stompClient        = useRef(null)
  const visitorTypingTimer = useRef(null)
  const agentTypingTimer   = useRef(null)
  const agentIsTypingRef   = useRef(false)
  const fileInputRef       = useRef(null)

  // ── Reset when session changes ────────────────────────────────────────────
  useEffect(() => {
    setMessages([])
    setJoined(false)
    setIsClosed(status === true || status === 'true')
    setInputMsg('')
    setVisitorTyping(false)
    setAgentIsTyping(false)
    agentIsTypingRef.current = false
    clearTimeout(visitorTypingTimer.current)
    clearTimeout(agentTypingTimer.current)
    clearPendingFile()

    if (stompClient.current) {
      stompClient.current.deactivate()
      stompClient.current = null
    }
  }, [sessionId, status])

  // ── File validation ───────────────────────────────────────────────────────
  const validateFile = (file) => {
    const lowerName = file.name.toLowerCase()
    for (const ext of BLOCKED_EXT) {
      if (lowerName.endsWith(ext)) return `File type "${ext}" is not allowed.`
    }
    if (!ALLOWED_MIME.has(file.type)) {
      return `File type "${file.type || 'unknown'}" is not supported.`
    }
    if (file.size > MAX_SIZE_BYTES) {
      return `File exceeds the 10 MB size limit (${fmtSize(file.size)}).`
    }
    return null
  }

  const applyFile = (file) => {
    const err = validateFile(file)
    if (err) {
      setUploadError(err)
      return
    }
    setUploadError(null)
    setPendingFile(file)
    setUploadProgress(null)

    if (isImage(file.type)) {
      const reader = new FileReader()
      reader.onload = (e) => setFilePreview(e.target.result)
      reader.readAsDataURL(file)
    } else {
      setFilePreview(null)
    }
  }

  const clearPendingFile = () => {
    setPendingFile(null)
    setFilePreview(null)
    setUploadProgress(null)
    setUploadError(null)
    setIsUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // ── Drag-and-drop ─────────────────────────────────────────────────────────
  const handleDragOver  = (e) => { e.preventDefault(); setIsDragOver(true)  }
  const handleDragLeave = ()  => { setIsDragOver(false) }
  const handleDrop      = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    if (!joined || isClosed) return
    const file = e.dataTransfer.files?.[0]
    if (file) applyFile(file)
  }

  // ── Publish agent typing ──────────────────────────────────────────────────
  const publishTyping = (state) => {
    if (!stompClient.current?.connected || !sessionId) return
    stompClient.current.publish({
      destination: '/app/typing',
      body: JSON.stringify({ sessionId, sender: adminEmail, role: 'AGENT', typing: state }),
    })
  }

  // ── Connect & claim after agent joins ─────────────────────────────────────
  useEffect(() => {
    if (!chatJoined || !sessionId || !departmentId || !adminEmail) return

    const client = new Client({
      webSocketFactory: () => new SockJS(`${VITE_API_URL}/chat`),
      reconnectDelay: 5000,

      onConnect: async () => {
        try {
          const res = await axios.post(`${VITE_API_URL}/chat/claim`, null, {
            params: { sessionId, agentEmail: adminEmail },
          })

          if (res.status === 200) {
            setJoined(true)
            onSessionClaimed?.()

            client.publish({
              destination: '/app/chat.takeover',
              body: JSON.stringify({ sessionId, departmentId, agentEmail: adminEmail }),
            })

            client.subscribe(`/topic/messages/${sessionId}`, (msg) => {
              const message = JSON.parse(msg.body)
              if (message.role === 'USER') {
                setVisitorTyping(false)
                clearTimeout(visitorTypingTimer.current)
              }
              setMessages((prev) => [...prev, message])
            })

            client.subscribe(`/topic/typing/${sessionId}`, (msg) => {
              const payload = JSON.parse(msg.body)
              if (payload.role === 'USER') {
                setVisitorTyping(payload.typing)
                clearTimeout(visitorTypingTimer.current)
                if (payload.typing) {
                  visitorTypingTimer.current = setTimeout(() => setVisitorTyping(false), 4000)
                }
              }
            })

            const [historyRes, attachRes] = await Promise.all([
                axios.get(`${VITE_API_URL}/chat/history/${sessionId}`),
                axios.get(`${VITE_API_URL}/chat/attachments/${sessionId}`)
              ])
              // Build lookup: messageId → attachment metadata
              const attMap = {}
              attachRes.data.forEach(a => { if (a.messageId) attMap[a.messageId] = a })
              // Merge: inject attachment fields into [FILE:...] messages
              const merged = historyRes.data.map(m => {
                if (m.content && m.content.startsWith('[FILE:') && attMap[m.id]) {
                  const a = attMap[m.id]
                  return { ...m, messageType: 'ATTACHMENT', fileName: a.fileName, fileType: a.fileType, fileSize: a.fileSize, fileUrl: a.fileUrl }
                }
                return m
              })
              setMessages(merged)
          }
        } catch (err) {
          if (err?.response?.status === 409) {
            console.warn('[ThirdColumn] Session already claimed by another agent.')
          } else {
            console.error('[ThirdColumn] Claim error:', err)
          }
        }
      },

      onStompError: (frame) => console.error('[ThirdColumn] STOMP error:', frame),
    })

    client.activate()
    stompClient.current = client

    return () => { client.deactivate(); stompClient.current = null }
  }, [chatJoined, sessionId, departmentId, adminEmail])

  // ── Auto-scroll ───────────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, visitorTyping])

  // ── Typing debounce ───────────────────────────────────────────────────────
  const handleInputChange = (e) => {
    setInputMsg(e.target.value)
    if (!joined || !sessionId) return
    if (!agentIsTypingRef.current) {
      agentIsTypingRef.current = true
      setAgentIsTyping(true)
      publishTyping(true)
    }
    clearTimeout(agentTypingTimer.current)
    agentTypingTimer.current = setTimeout(() => {
      agentIsTypingRef.current = false
      setAgentIsTyping(false)
      publishTyping(false)
    }, 2000)
  }

  // ── Send text message ─────────────────────────────────────────────────────
  const sendMessage = () => {
    if (!inputMsg.trim() || !joined || !sessionId) return
    clearTimeout(agentTypingTimer.current)
    if (agentIsTypingRef.current) {
      agentIsTypingRef.current = false
      setAgentIsTyping(false)
      publishTyping(false)
    }
    stompClient.current?.publish({
      destination: '/app/send',
      body: JSON.stringify({
        sessionId,
        sender:   adminEmail,
        receiver: receiveremail,
        content:  inputMsg,
        role:     'AGENT',
      }),
    })
    setInputMsg('')
  }

  // ── Upload & send file ────────────────────────────────────────────────────
  const sendFile = useCallback(async () => {
    if (!pendingFile || !joined || !sessionId || isUploading) return

    // Re-validate before upload
    const err = validateFile(pendingFile)
    if (err) { setUploadError(err); return }

    setIsUploading(true)
    setUploadProgress(0)
    setUploadError(null)

    const formData = new FormData()
    formData.append('file',       pendingFile)
    formData.append('sessionId',  sessionId)
    formData.append('uploadedBy', adminEmail)
    formData.append('role',       'AGENT')

    try {
      await axios.post(`${VITE_API_URL}/chat/upload-file`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (evt) => {
          if (evt.total) {
            setUploadProgress(Math.round((evt.loaded / evt.total) * 100))
          }
        },
      })
      // Success: server broadcasts via WebSocket so message appears automatically
      clearPendingFile()
    } catch (uploadErr) {
      const msg = uploadErr?.response?.data || 'Upload failed. Please try again.'
      setUploadError(typeof msg === 'string' ? msg : 'Upload failed. Please try again.')
      setUploadProgress(null)
      setIsUploading(false)
    }
  }, [pendingFile, joined, sessionId, isUploading, adminEmail])

  // ── Close chat ────────────────────────────────────────────────────────────
  const handleCloseChat = async () => {
    if (!sessionId || isClosed || closingChat) return
    setClosingChat(true)
    try {
      const formData = new FormData()
      formData.append('sessionId', sessionId)
      formData.append('Status', true)
      const res = await axios.post(`${VITE_API_URL}/chat/setStatusForSessionID`, formData)
      if (res.status === 200) setIsClosed(true)
    } catch (err) {
      console.error('[ThirdColumn] Close chat error:', err)
      alert('Failed to close chat. Please try again.')
    } finally {
      setClosingChat(false)
    }
  }

  // ── Render individual message ─────────────────────────────────────────────
  const renderMessage = (msg, index) => {
    const isAgent  = msg.role === 'AGENT' || msg.role === 'ADMIN'
    const isSystem = msg.role === 'SYSTEM'

    if (isSystem) {
      return (
        <div key={index} className="text-center text-muted small my-2">
          — {msg.content} —
        </div>
      )
    }

    // Attachment bubble (WS broadcast or history)
    if (msg.messageType === 'ATTACHMENT' || msg.fileName) {
      return (
        <div key={index} className={`d-flex mb-2 ${isAgent ? 'justify-content-end' : 'justify-content-start'}`}>
          <AttachmentMessage msg={msg} isAgent={isAgent} />
        </div>
      )
    }

    return (
      <div key={index} className={`d-flex mb-2 ${isAgent ? 'justify-content-end' : 'justify-content-start'}`}>
        <div
          className={`p-2 rounded ${isAgent ? 'bg-primary text-white' : 'bg-light text-dark'}`}
          style={{ maxWidth: '70%', wordBreak: 'break-word' }}
        >
          {msg.content}
        </div>
      </div>
    )
  }

  // ── Empty state ───────────────────────────────────────────────────────────
  if (!sessionDetails) {
    return (
      <div
        className="d-flex align-items-center justify-content-center"
        style={{ width: '74%', borderLeft: '1px solid #dee2e6', color: '#6c757d' }}
      >
        <div className="text-center">
          <div style={{ fontSize: '48px' }}>💬</div>
          <p>Select a conversation to start chatting</p>
        </div>
      </div>
    )
  }

  const canInteract = joined && !isClosed

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        width: '74%',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        borderLeft: '1px solid #dee2e6',
      }}
      onDragOver={canInteract ? handleDragOver : undefined}
      onDragLeave={canInteract ? handleDragLeave : undefined}
      onDrop={canInteract ? handleDrop : undefined}
    >
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <CCardHeader className="d-flex justify-content-between align-items-center px-3 py-2">
        <div className="d-flex align-items-center">
          <img
            src={img}
            alt="User"
            className="rounded-circle"
            style={{ width: '40px', height: '40px', objectFit: 'cover' }}
          />
          <div className="ms-2">
            <div className="fw-semibold">{userName || 'Visitor'}</div>
            <div className={`small ${joined ? 'text-success' : 'text-warning'}`}>
              {isClosed
                ? '🔒 Chat closed'
                : joined
                  ? '● Live Agent Connected'
                  : '⏳ Click Join to start chatting'}
            </div>
          </div>
        </div>
        <CButton
          color="danger"
          size="sm"
          onClick={handleCloseChat}
          disabled={isClosed || closingChat}
          title={isClosed ? 'This chat is already closed' : 'Close this chat session'}
        >
          {closingChat ? 'Closing…' : isClosed ? 'Chat Closed' : 'Close Chat'}
        </CButton>
      </CCardHeader>

      {/* ── Closed banner ───────────────────────────────────────────────── */}
      {isClosed && (
        <div
          className="text-center py-2 small fw-semibold"
          style={{ background: '#fff3cd', color: '#856404', borderBottom: '1px solid #ffc107' }}
        >
          🔒 This chat session has been closed
        </div>
      )}

      {/* ── Drag overlay ─────────────────────────────────────────────────── */}
      {isDragOver && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 50,
            background: 'rgba(13,110,253,0.12)',
            border: '3px dashed #0d6efd',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <div style={{ fontSize: '32px', color: '#0d6efd', fontWeight: 700 }}>
            📎 Drop file to attach
          </div>
        </div>
      )}

      {/* ── Messages ────────────────────────────────────────────────────── */}
      <div
        className="flex-grow-1 p-3 overflow-auto"
        style={{ backgroundColor: '#f8f9fa', position: 'relative' }}
      >
        {messages.length === 0 && !joined && (
          <div className="text-center text-muted mt-4">
            <p>
              Click <strong>Join</strong> in the notification to view and respond to this conversation.
            </p>
          </div>
        )}

        {messages.map((msg, i) => renderMessage(msg, i))}

        {/* Visitor typing indicator */}
        {visitorTyping && (
          <div className="d-flex justify-content-start mb-1">
            <div
              style={{
                backgroundColor: '#e9ecef',
                color: '#6c757d',
                fontSize: '12px',
                fontStyle: 'italic',
                padding: '6px 12px',
                borderRadius: '12px',
                display: 'inline-block',
              }}
            >
              Typing...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── File preview bar (shown when a file is staged) ───────────────── */}
      <FilePreviewBar
        file={pendingFile}
        preview={filePreview}
        progress={uploadProgress}
        error={uploadError}
        onRemove={clearPendingFile}
      />

      {/* ── Input row ───────────────────────────────────────────────────── */}
      <div
        className="d-flex align-items-center p-2 border-top gap-2"
        style={{ backgroundColor: '#ECEFF5' }}
      >
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          style={{ display: 'none' }}
          accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.txt,.xls,.xlsx,.zip"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) applyFile(file)
          }}
        />

        {/* Attachment button */}
        <button
          type="button"
          onClick={() => canInteract && fileInputRef.current?.click()}
          disabled={!canInteract || isUploading}
          title={!canInteract ? 'Join or open chat to send files' : 'Attach a file'}
          style={{
            background: 'none',
            border: '1px solid #ced4da',
            borderRadius: '8px',
            width: '38px',
            height: '38px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: canInteract ? 'pointer' : 'not-allowed',
            fontSize: '18px',
            opacity: canInteract ? 1 : 0.45,
            flexShrink: 0,
            backgroundColor: '#fff',
            transition: 'background 0.15s',
          }}
        >
          📎
        </button>

        {/* Text input */}
        <input
          type="text"
          className="form-control"
          placeholder={
            isClosed    ? 'Chat has been closed'
            : joined    ? 'Type a message…'
                        : 'Join the chat to reply…'
          }
          value={inputMsg}
          onChange={handleInputChange}
          onKeyDown={(e) => { if (e.key === 'Enter') sendMessage() }}
          disabled={!canInteract}
        />

        {/* Send file button (only when file is staged) */}
        {pendingFile && canInteract && (
          <CButton
            color="success"
            onClick={sendFile}
            disabled={isUploading || !!uploadError}
            style={{ flexShrink: 0, whiteSpace: 'nowrap' }}
          >
            {isUploading
              ? `${uploadProgress ?? 0}%`
              : '⬆ Send'}
          </CButton>
        )}

        {/* Send text button */}
        {!pendingFile && (
          <CButton
            color="primary"
            onClick={sendMessage}
            disabled={!canInteract}
            style={{ flexShrink: 0 }}
          >
            ➤
          </CButton>
        )}
      </div>

      {/* ── Upload hint ──────────────────────────────────────────────────── */}
      {canInteract && !pendingFile && (
        <div
          className="text-center small text-muted py-1"
          style={{ backgroundColor: '#ECEFF5', fontSize: '10px' }}
        >
          📎 Attach a file or drag & drop · Max 10 MB · Images, PDF, Word, Excel, ZIP
        </div>
      )}
    </div>
  )
}

export default ThirdColumn
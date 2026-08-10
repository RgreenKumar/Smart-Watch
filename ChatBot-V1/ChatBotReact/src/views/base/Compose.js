import React, { useState, useEffect, useRef } from 'react'
import {
  CButton,
  CSpinner,
  CAlert,
  CBadge,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from '@coreui/react'
import axios from 'axios'
import VITE_API_URL from '../../Config'

// ── File helpers ──────────────────────────────────────────────────────────────
const ALLOWED_EXT = '.jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.txt,.xls,.xlsx,.zip'
const MAX_BYTES   = 10 * 1024 * 1024
const fmtSize     = (b) => b < 1048576 ? (b / 1024).toFixed(1) + ' KB' : (b / 1048576).toFixed(1) + ' MB'
const fileIcon    = (t) => {
  if (!t) return '📄'
  if (t.startsWith('image/'))                         return '🖼️'
  if (t.includes('pdf'))                              return '📕'
  if (t.includes('word'))                             return '📘'
  if (t.includes('excel') || t.includes('spreadsheet')) return '📗'
  if (t.includes('zip'))                              return '🗜️'
  if (t.includes('text'))                             return '📝'
  return '📄'
}

const TOOLBAR = [
  { cmd: 'bold',               icon: 'B',   title: 'Bold',          style: { fontWeight: 700 } },
  { cmd: 'italic',             icon: 'I',   title: 'Italic',        style: { fontStyle: 'italic' } },
  { cmd: 'underline',          icon: 'U',   title: 'Underline',     style: { textDecoration: 'underline' } },
  { cmd: 'insertUnorderedList',icon: '≡',   title: 'Bullet list',   style: {} },
  { cmd: 'insertOrderedList',  icon: '1.',  title: 'Numbered list', style: {} },
  { cmd: 'createLink',         icon: '🔗',  title: 'Insert link',   style: {} },
]

const EMOJIS = ['😊','😄','👍','❤️','🙏','🎉','✅','⚠️','📌','🔥','💡','📎']

// ─────────────────────────────────────────────────────────────────────────────
const Compose = () => {
  const agentEmail = sessionStorage.getItem('email') || ''
  const agentName  = sessionStorage.getItem('name')  || ''

  const [recipientEmail,  setRecipientEmail]  = useState('')
  const [recipientName,   setRecipientName]   = useState('')
  const [subject,         setSubject]         = useState('')
  const [createTicket,    setCreateTicket]    = useState(false)
  const [attachments,     setAttachments]     = useState([])
  const [userSuggestions, setUserSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [sending,         setSending]         = useState(false)
  const [savingDraft,     setSavingDraft]     = useState(false)
  const [draftId,         setDraftId]         = useState(null)
  const [alert,           setAlert]           = useState(null)
  const [showDrafts,      setShowDrafts]      = useState(false)
  const [drafts,          setDrafts]          = useState([])
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [charCount,       setCharCount]       = useState(0)

  const editorRef    = useRef(null)
  const fileInputRef = useRef(null)
  const draftTimer   = useRef(null)

  // Auto-save draft every 10s
  useEffect(() => {
    draftTimer.current = setInterval(() => {
      const content = editorRef.current?.innerHTML || ''
      if (recipientEmail || subject || content) {
        triggerSaveDraft(content, false)
      }
    }, 10000)
    return () => clearInterval(draftTimer.current)
  }, [recipientEmail, recipientName, subject, createTicket, draftId])

  // Dismiss alert after 4s
  useEffect(() => {
    if (!alert) return
    const t = setTimeout(() => setAlert(null), 4000)
    return () => clearTimeout(t)
  }, [alert])

  const handleRecipientInput = async (val) => {
    setRecipientEmail(val)
    if (val.length < 2) { setUserSuggestions([]); setShowSuggestions(false); return }
    try {
      const res = await axios.get(`${VITE_API_URL}/compose/search-users?q=${encodeURIComponent(val)}`)
      setUserSuggestions(res.data || [])
      setShowSuggestions(true)
    } catch {
      setUserSuggestions([])
    }
  }

  const selectSuggestion = (user) => {
    setRecipientEmail(user.email)
    setRecipientName(user.name)
    setUserSuggestions([])
    setShowSuggestions(false)
  }

  const execCmd = (cmd) => {
    if (cmd === 'createLink') {
      const url = prompt('Enter URL:')
      if (url) document.execCommand('createLink', false, url)
    } else {
      document.execCommand(cmd, false, null)
    }
    editorRef.current?.focus()
  }

  const handleEditorInput = () => {
    const text = editorRef.current?.innerText || ''
    setCharCount(text.length)
  }

  const insertEmoji = (emoji) => {
    editorRef.current?.focus()
    document.execCommand('insertText', false, emoji)
    setShowEmojiPicker(false)
  }

  const handleFileSelect = (e) => {
    Array.from(e.target.files || []).forEach(addFile)
    e.target.value = ''
  }

  const addFile = (file) => {
    if (file.size > MAX_BYTES) {
      setAlert({ type: 'danger', msg: `${file.name} exceeds 10 MB limit.` })
      return
    }
    const preview = file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    setAttachments(prev => [...prev, { file, preview, uploading: false, url: null, id: null, error: null }])
  }

  const removeAttachment = (idx) => {
    setAttachments(prev => {
      const item = prev[idx]
      if (item.preview) URL.revokeObjectURL(item.preview)
      return prev.filter((_, i) => i !== idx)
    })
  }

  const uploadAttachment = async (idx) => {
    const item = attachments[idx]
    if (item.uploading || item.url) return
    setAttachments(prev => prev.map((a, i) => i === idx ? { ...a, uploading: true } : a))
    try {
      const fd = new FormData()
      fd.append('file', item.file)
      fd.append('agentEmail', agentEmail)
      const res = await axios.post(`${VITE_API_URL}/compose/upload-attachment`, fd)
      setAttachments(prev => prev.map((a, i) => i === idx
        ? { ...a, uploading: false, url: res.data.fileUrl, id: res.data.attachmentId }
        : a))
    } catch (err) {
      const msg = err?.response?.data || 'Upload failed'
      setAttachments(prev => prev.map((a, i) => i === idx ? { ...a, uploading: false, error: msg } : a))
    }
  }

  const uploadAllPending = async () => {
    const pending = attachments.map((a, i) => (!a.url && !a.uploading ? i : -1)).filter(i => i >= 0)
    await Promise.all(pending.map(uploadAttachment))
  }

  const triggerSaveDraft = async (content, showFeedback = true) => {
    if (!agentEmail) return
    setSavingDraft(true)
    try {
      const params = new URLSearchParams({
        agentEmail, recipientEmail, recipientName, subject,
        content: content || editorRef.current?.innerHTML || '',
        createTicket: String(createTicket),
        ...(draftId ? { draftId } : {}),
      })
      const res = await axios.post(`${VITE_API_URL}/compose/save-draft`, params)
      setDraftId(res.data.draftId)
      if (showFeedback) setAlert({ type: 'info', msg: 'Draft saved.' })
    } catch {
      if (showFeedback) setAlert({ type: 'danger', msg: 'Failed to save draft.' })
    } finally {
      setSavingDraft(false)
    }
  }

  const loadDrafts = async () => {
    try {
      const res = await axios.get(`${VITE_API_URL}/compose/drafts/${encodeURIComponent(agentEmail)}`)
      setDrafts(res.data || [])
      setShowDrafts(true)
    } catch {
      setAlert({ type: 'danger', msg: 'Failed to load drafts.' })
    }
  }

  const restoreDraft = (draft) => {
    setRecipientEmail(draft.recipientEmail || '')
    setRecipientName(draft.recipientName   || '')
    setSubject(draft.subject               || '')
    setCreateTicket(draft.createTicket     || false)
    setDraftId(draft.id)
    if (editorRef.current) editorRef.current.innerHTML = draft.content || ''
    setCharCount((editorRef.current?.innerText || '').length)
    setShowDrafts(false)
    setAlert({ type: 'info', msg: 'Draft loaded.' })
  }

  const deleteDraft = async (id) => {
    try {
      await axios.delete(`${VITE_API_URL}/compose/drafts/${id}`)
      setDrafts(prev => prev.filter(d => d.id !== id))
    } catch {
      setAlert({ type: 'danger', msg: 'Failed to delete draft.' })
    }
  }

  const resetForm = () => {
    setRecipientEmail(''); setRecipientName(''); setSubject('')
    setCreateTicket(false); setDraftId(null); setCharCount(0)
    setAttachments([])
    if (editorRef.current) editorRef.current.innerHTML = ''
  }

  const handleSend = async () => {
    const content = editorRef.current?.innerHTML || ''
    if (!recipientEmail.trim()) {
      setAlert({ type: 'danger', msg: 'Please enter a recipient email address.' }); return
    }
    if (!content.trim() || content === '<br>') {
      setAlert({ type: 'danger', msg: 'Message cannot be empty.' }); return
    }
    setSending(true)
    try {
      await uploadAllPending()
      const params = new URLSearchParams({
        agentEmail, recipientEmail, recipientName, subject, content,
        createTicket: String(createTicket),
      })
      const res = await axios.post(`${VITE_API_URL}/compose/create-conversation`, params)
      if (draftId) axios.delete(`${VITE_API_URL}/compose/drafts/${draftId}`).catch(() => {})
      const ticketInfo = res.data.ticketId ? ` · Ticket: ${res.data.ticketId}` : ''
      setAlert({ type: 'success', msg: `Message sent successfully!${ticketInfo}` })
      resetForm()
    } catch (err) {
      const msg = err?.response?.data || 'Failed to send message. Please try again.'
      setAlert({ type: 'danger', msg: typeof msg === 'string' ? msg : JSON.stringify(msg) })
    } finally {
      setSending(false)
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* ── Drafts Modal ─────────────────────────────────────────────────── */}
      <CModal visible={showDrafts} onClose={() => setShowDrafts(false)} size="lg">
        <CModalHeader><CModalTitle>Saved Drafts</CModalTitle></CModalHeader>
        <CModalBody>
          {drafts.length === 0
            ? <p className="text-muted text-center py-3">No drafts saved yet.</p>
            : drafts.map(d => (
              <div key={d.id} style={{
                border: '1px solid #e4e6ef', borderRadius: '8px',
                padding: '12px 16px', marginBottom: '8px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: 2 }}>
                    {d.subject || '(No subject)'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6c757d' }}>To: {d.recipientEmail || '—'}</div>
                  <div style={{ fontSize: '11px', color: '#adb5bd', marginTop: 2 }}>
                    {d.updatedAt ? new Date(d.updatedAt).toLocaleString() : '—'}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginLeft: 12 }}>
                  <CButton size="sm" color="primary" onClick={() => restoreDraft(d)}>Restore</CButton>
                  <CButton size="sm" color="danger" variant="outline" onClick={() => deleteDraft(d.id)}>Delete</CButton>
                </div>
              </div>
            ))
          }
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowDrafts(false)}>Close</CButton>
        </CModalFooter>
      </CModal>

      {/* ── Header bar — matches SecondColumn header style ────────────────── */}
      <div style={{
        padding: '14px 20px',
        borderBottom: '1px solid #dee2e6',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#fff',
        flexShrink: 0,
      }}>
        <div>
          <strong style={{ fontSize: '18px', color: '#212529' }}>New Conversation</strong>
          <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '1px' }}>
            From: <span style={{ fontWeight: 600, color: '#495057' }}>{agentName || agentEmail}</span>
          </div>
        </div>
        <button
          onClick={loadDrafts}
          style={{
            background: '#f8f9fa',
            border: '1px solid #dee2e6',
            borderRadius: '6px',
            padding: '5px 12px',
            fontSize: '12px',
            fontWeight: 500,
            color: '#495057',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
          }}
        >
          📝 Drafts
          {draftId && (
            <span style={{
              background: '#0162C4', color: '#fff',
              borderRadius: '50%', width: 8, height: 8,
              display: 'inline-block',
            }} />
          )}
        </button>
      </div>

      {/* ── Alert ────────────────────────────────────────────────────────── */}
      {alert && (
        <div style={{ padding: '0 20px', paddingTop: '10px', flexShrink: 0 }}>
          <CAlert color={alert.type} dismissible onClose={() => setAlert(null)}
            style={{ borderRadius: '6px', fontSize: '13px', marginBottom: 0 }}>
            {alert.msg}
          </CAlert>
        </div>
      )}

      {/* ── Form body ────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto', background: '#fff' }}>

        {/* To field */}
        <div style={fieldRow}>
          <span style={fieldLabel}>To</span>
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              type="email"
              placeholder="customer@email.com"
              value={recipientEmail}
              onChange={e => handleRecipientInput(e.target.value)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              style={fieldInput}
            />
            {recipientName && (
              <CBadge color="info" style={{ fontSize: '11px', padding: '3px 7px', marginLeft: 8 }}>
                {recipientName}
              </CBadge>
            )}
            {showSuggestions && userSuggestions.length > 0 && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, right: 0,
                background: '#fff', border: '1px solid #dee2e6',
                borderRadius: '6px', zIndex: 1000,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                maxHeight: '180px', overflowY: 'auto',
              }}>
                {userSuggestions.map((u, i) => (
                  <div
                    key={i}
                    onMouseDown={() => selectSuggestion(u)}
                    style={{
                      padding: '8px 12px', cursor: 'pointer',
                      borderBottom: '1px solid #f0f2f5',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f0f6ff'}
                    onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                  >
                    <div style={{ fontWeight: 600, fontSize: '12px' }}>{u.name}</div>
                    <div style={{ fontSize: '11px', color: '#6c757d' }}>{u.email}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div style={divider} />

        {/* Subject field */}
        <div style={fieldRow}>
          <span style={fieldLabel}>Subject</span>
          <input
            type="text"
            placeholder="Enter subject..."
            value={subject}
            onChange={e => setSubject(e.target.value)}
            style={fieldInput}
          />
        </div>
        <div style={divider} />

        {/* Toolbar */}
        <div style={{
          padding: '6px 16px',
          background: '#f8f9fa',
          borderBottom: '1px solid #dee2e6',
          display: 'flex',
          alignItems: 'center',
          gap: '2px',
          flexWrap: 'wrap',
        }}>
          {TOOLBAR.map(({ cmd, icon, title, style }) => (
            <button
              key={cmd}
              title={title}
              onMouseDown={e => { e.preventDefault(); execCmd(cmd) }}
              style={{
                background: 'none',
                border: '1px solid transparent',
                borderRadius: '4px',
                padding: '3px 7px',
                cursor: 'pointer',
                fontSize: '13px',
                color: '#495057',
                minWidth: '28px',
                textAlign: 'center',
                ...style,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#e9ecef'; e.currentTarget.style.borderColor = '#dee2e6' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.borderColor = 'transparent' }}
            >
              {icon}
            </button>
          ))}
          <div style={{ width: '1px', height: '18px', background: '#dee2e6', margin: '0 3px' }} />
          {/* Emoji */}
          <div style={{ position: 'relative' }}>
            <button
              title="Insert emoji"
              onMouseDown={e => { e.preventDefault(); setShowEmojiPicker(p => !p) }}
              style={{
                background: 'none', border: '1px solid transparent',
                borderRadius: '4px', padding: '3px 7px',
                cursor: 'pointer', fontSize: '14px',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#e9ecef'; e.currentTarget.style.borderColor = '#dee2e6' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.borderColor = 'transparent' }}
            >
              😊
            </button>
            {showEmojiPicker && (
              <div style={{
                position: 'absolute', top: '110%', left: 0, zIndex: 500,
                background: '#fff', border: '1px solid #dee2e6',
                borderRadius: '8px', padding: '6px',
                display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '3px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}>
                {EMOJIS.map(emoji => (
                  <button
                    key={emoji}
                    onMouseDown={e => { e.preventDefault(); insertEmoji(emoji) }}
                    style={{
                      border: 'none', background: 'none',
                      cursor: 'pointer', fontSize: '18px',
                      padding: '2px', borderRadius: '4px',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f0f6ff'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
          <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#adb5bd' }}>
            {charCount} chars
          </span>
        </div>

        {/* Editor */}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleEditorInput}
          style={{
            minHeight: '200px',
            padding: '14px 20px',
            outline: 'none',
            fontSize: '13px',
            lineHeight: '1.6',
            color: '#212529',
            wordBreak: 'break-word',
          }}
          data-placeholder="Write your message here..."
        />
        <style>{`[contenteditable]:empty:before{content:attr(data-placeholder);color:#adb5bd;pointer-events:none}`}</style>

        <div style={divider} />

        {/* Attachments */}
        <div style={{ padding: '10px 20px' }}>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={ALLOWED_EXT}
            style={{ display: 'none' }}
            onChange={handleFileSelect}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              background: 'none',
              border: '1px dashed #ced4da',
              borderRadius: '6px',
              padding: '6px 12px',
              cursor: 'pointer',
              color: '#6c757d',
              fontSize: '12px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#0162C4'; e.currentTarget.style.color = '#0162C4' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#ced4da'; e.currentTarget.style.color = '#6c757d' }}
          >
            📎 Attach files
          </button>
          <span style={{ fontSize: '11px', color: '#adb5bd', marginLeft: '10px' }}>
            Max 10 MB · Images, PDF, Word, Excel, ZIP
          </span>

          {attachments.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
              {attachments.map((att, idx) => (
                <div key={idx} style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  border: '1px solid #e4e6ef', borderRadius: '6px',
                  padding: '5px 8px', background: '#f8f9fa', maxWidth: '220px',
                }}>
                  {att.preview
                    ? <img src={att.preview} alt="" style={{ width: 30, height: 30, objectFit: 'cover', borderRadius: 3 }} />
                    : <span style={{ fontSize: '18px' }}>{fileIcon(att.file.type)}</span>
                  }
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {att.file.name}
                    </div>
                    <div style={{ fontSize: '10px', color: '#6c757d' }}>
                      {fmtSize(att.file.size)}
                      {att.uploading && <span style={{ color: '#0162C4' }}> · Uploading…</span>}
                      {att.url      && <span style={{ color: '#198754' }}> · ✓</span>}
                      {att.error    && <span style={{ color: '#dc3545' }}> · Error</span>}
                    </div>
                  </div>
                  <button
                    onClick={() => removeAttachment(idx)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#adb5bd', fontSize: '14px', padding: 0 }}
                  >✕</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Footer — always pinned at bottom ──────────────────────────────── */}
      <div style={{
        padding: '12px 20px',
        borderTop: '1px solid #dee2e6',
        background: '#f8f9fa',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px',
        flexShrink: 0,
      }}>
        {/* Ticket toggle */}
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none' }}>
          <div
            onClick={() => setCreateTicket(p => !p)}
            style={{
              width: 34, height: 20, borderRadius: 10,
              background: createTicket ? '#0162C4' : '#dee2e6',
              position: 'relative', transition: 'background 0.2s', cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <div style={{
              position: 'absolute', top: 2, left: createTicket ? 16 : 2,
              width: 16, height: 16, borderRadius: '50%', background: '#fff',
              transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }} />
          </div>
          <span style={{ fontSize: '12px', color: '#495057', fontWeight: 500 }}>
            🎫 Create support ticket
          </span>
          {createTicket && (
            <CBadge color="primary" style={{ fontSize: '10px' }}>Will be created</CBadge>
          )}
        </label>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <CButton
            color="light"
            size="sm"
            disabled={savingDraft || sending}
            onClick={() => triggerSaveDraft(editorRef.current?.innerHTML || '', true)}
            style={{ borderRadius: '6px', fontWeight: 500, fontSize: '12px', border: '1px solid #dee2e6' }}
          >
            {savingDraft ? <><CSpinner size="sm" /> Saving…</> : '💾 Save Draft'}
          </CButton>

          <CButton
            color="primary"
            size="sm"
            disabled={sending || savingDraft}
            onClick={handleSend}
            style={{ borderRadius: '6px', fontWeight: 600, fontSize: '12px', padding: '6px 20px' }}
          >
            {sending
              ? <><CSpinner size="sm" style={{ marginRight: 5 }} /> Sending…</>
              : '✉️ Send Message'}
          </CButton>
        </div>
      </div>

    </div>
  )
}

// ── Shared styles ─────────────────────────────────────────────────────────────
const fieldRow = {
  display: 'flex',
  alignItems: 'center',
  padding: '10px 20px',
  gap: '12px',
}

const fieldLabel = {
  width: '55px',
  fontWeight: 600,
  fontSize: '12px',
  color: '#6c757d',
  flexShrink: 0,
  textAlign: 'right',
}

const fieldInput = {
  flex: 1,
  border: 'none',
  outline: 'none',
  fontSize: '13px',
  color: '#212529',
  background: 'transparent',
  padding: '2px 0',
}

const divider = {
  height: '1px',
  background: '#dee2e6',
  margin: '0 20px',
}

export default Compose
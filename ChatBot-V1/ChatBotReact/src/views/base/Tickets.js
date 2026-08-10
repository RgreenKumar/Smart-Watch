import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import {
  CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter,
  CButton, CSpinner,
} from '@coreui/react'
import VITE_API_URL from '../../Config'

// ── Helpers ───────────────────────────────────────────────────────────────────
const STATUS_META = {
  OPEN:    { label: 'Open',    bg: '#dbeafe', color: '#1d4ed8' },
  PENDING: { label: 'Pending', bg: '#fef9c3', color: '#854d0e' },
  CLOSED:  { label: 'Closed',  bg: '#d1fae5', color: '#065f46' },
}
const PRIORITY_META = {
  LOW:    { label: 'Low',    color: '#6b7280' },
  MEDIUM: { label: 'Medium', color: '#d97706' },
  HIGH:   { label: 'High',   color: '#dc2626' },
  URGENT: { label: 'Urgent', color: '#7c3aed' },
}
const fmtTime = (d) => {
  if (!d) return '—'
  const dt = new Date(d)
  return dt.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' +
         dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
const initials = (name) => {
  if (!name) return '?'
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

// ── Badge chip ────────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const m = STATUS_META[status] || STATUS_META.OPEN
  return (
    <span style={{
      fontSize: '11px', fontWeight: 600, padding: '3px 8px', borderRadius: '12px',
      background: m.bg, color: m.color, whiteSpace: 'nowrap',
    }}>{m.label}</span>
  )
}
const PriorityDot = ({ priority }) => {
  const m = PRIORITY_META[priority] || PRIORITY_META.MEDIUM
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '12px', color: m.color }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: m.color, display: 'inline-block' }} />
      {m.label}
    </span>
  )
}
const Avatar = ({ name, size = 32, bg = '#e0e7ff', color = '#4338ca' }) => (
  <div style={{
    width: size, height: size, borderRadius: '50%',
    background: bg, color, display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: size * 0.38, fontWeight: 700, flexShrink: 0,
  }}>
    {initials(name)}
  </div>
)

// ─────────────────────────────────────────────────────────────────────────────
// Tickets Page
// ─────────────────────────────────────────────────────────────────────────────
const Tickets = () => {
  const agentEmail = sessionStorage.getItem('email') || ''
  const agentName  = sessionStorage.getItem('name')  || ''
  const role       = sessionStorage.getItem('role')  || ''

  // ── State ──────────────────────────────────────────────────────────────────
  const [tickets,        setTickets]        = useState([])
  const [selected,       setSelected]       = useState(null)   // full ticket detail
  const [detail,         setDetail]         = useState(null)   // {ticket, messages}
  const [stats,          setStats]          = useState({})
  const [statusFilter,   setStatusFilter]   = useState('ALL')
  const [search,         setSearch]         = useState('')
  const [loading,        setLoading]        = useState(true)
  const [detailLoading,  setDetailLoading]  = useState(false)
  const [replyText,      setReplyText]      = useState('')
  const [noteText,       setNoteText]       = useState('')
  const [replyMode,      setReplyMode]      = useState('reply')  // 'reply' | 'note'
  const [sending,        setSending]        = useState(false)
  const [showCreate,     setShowCreate]     = useState(false)
  const [newBadge,       setNewBadge]       = useState(0)
  const [agents,         setAgents]         = useState([])
  const [attachFile,     setAttachFile]     = useState(null)

  // Create form state
  const [form, setForm] = useState({
    subject: '', customerEmail: '', customerName: '',
    priority: 'MEDIUM', tags: '', message: '',
  })

  const messagesEndRef  = useRef(null)
  const stompClient     = useRef(null)
  const fileInputRef    = useRef(null)
  const searchTimeout   = useRef(null)

  // ── Fetch tickets ──────────────────────────────────────────────────────────
  const fetchTickets = useCallback(async (q = search, sf = statusFilter) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (sf && sf !== 'ALL') params.set('status', sf)
      if (q && q.trim()) params.set('q', q.trim())
      const res = await fetch(`${VITE_API_URL}/tickets?${params}`)
      const data = await res.json()
      setTickets(data)
    } catch (e) {
      console.error('[Tickets] fetchTickets:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  // ── Fetch stats ────────────────────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${VITE_API_URL}/tickets/stats`)
      setStats(await res.json())
    } catch (e) {
      console.error('[Tickets] fetchStats:', e)
    }
  }, [])

  // ── Fetch agents (for assign dropdown) ────────────────────────────────────
  const fetchAgents = useCallback(async () => {
    try {
      const res = await fetch(`${VITE_API_URL}/admin/all`)
      const data = await res.json()
      setAgents(Array.isArray(data) ? data : [])
    } catch {}
  }, [])

  // ── Fetch ticket detail ────────────────────────────────────────────────────
  const fetchDetail = useCallback(async (id) => {
    setDetailLoading(true)
    try {
      const res = await fetch(`${VITE_API_URL}/tickets/${id}`)
      const data = await res.json()
      setDetail(data)
    } catch (e) {
      console.error('[Tickets] fetchDetail:', e)
    } finally {
      setDetailLoading(false)
    }
  }, [])

  // ── Initial load ───────────────────────────────────────────────────────────
  useEffect(() => {
    fetchTickets('', 'ALL')
    fetchStats()
    fetchAgents()
  }, [])

  // ── WebSocket for real-time updates ───────────────────────────────────────
  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS(`${VITE_API_URL}/chat`),
      reconnectDelay: 5000,
      onConnect: () => {
        // New ticket badge
        client.subscribe('/topic/tickets/new', () => {
          setNewBadge(p => p + 1)
          fetchTickets('', statusFilter)
          fetchStats()
        })
        // Live updates on open ticket
        if (selected) {
          client.subscribe(`/topic/tickets/${selected}`, (msg) => {
            const payload = JSON.parse(msg.body)
            if (payload.type === 'REPLY' || payload.type === 'NOTE') {
              fetchDetail(selected)
            }
            if (payload.type === 'STATUS' || payload.type === 'ASSIGN') {
              fetchDetail(selected)
              fetchTickets('', statusFilter)
              fetchStats()
            }
          })
        }
      },
    })
    client.activate()
    stompClient.current = client
    return () => client.deactivate()
  }, [selected, statusFilter])

  // ── Auto-scroll ────────────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [detail?.messages])

  // ── Debounced search ───────────────────────────────────────────────────────
  const handleSearch = (val) => {
    setSearch(val)
    clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => fetchTickets(val, statusFilter), 350)
  }

  // ── Select ticket ──────────────────────────────────────────────────────────
  const handleSelect = (ticket) => {
    setSelected(ticket.id)
    fetchDetail(ticket.id)
    setNewBadge(0)
  }

  // ── Status filter ──────────────────────────────────────────────────────────
  const handleFilterChange = (sf) => {
    setStatusFilter(sf)
    fetchTickets(search, sf)
  }

  // ── Send reply ─────────────────────────────────────────────────────────────
  const handleSendReply = async () => {
    if (!replyText.trim() || !selected) return
    setSending(true)
    try {
      const fd = new FormData()
      fd.append('agentEmail', agentEmail)
      fd.append('agentName',  agentName)
      fd.append('message',    replyText)
      if (attachFile) fd.append('attachment', attachFile)
      await fetch(`${VITE_API_URL}/tickets/${selected}/reply`, { method: 'POST', body: fd })
      setReplyText('')
      setAttachFile(null)
      await fetchDetail(selected)
      await fetchTickets(search, statusFilter)
      await fetchStats()
    } catch (e) {
      console.error('[Tickets] reply:', e)
    } finally {
      setSending(false)
    }
  }

  // ── Add note ───────────────────────────────────────────────────────────────
  const handleAddNote = async () => {
    if (!noteText.trim() || !selected) return
    setSending(true)
    try {
      const fd = new FormData()
      fd.append('agentEmail', agentEmail)
      fd.append('agentName',  agentName)
      fd.append('note',       noteText)
      await fetch(`${VITE_API_URL}/tickets/${selected}/note`, { method: 'POST', body: fd })
      setNoteText('')
      await fetchDetail(selected)
    } catch (e) {
      console.error('[Tickets] note:', e)
    } finally {
      setSending(false)
    }
  }

  // ── Change status ──────────────────────────────────────────────────────────
  const handleStatusChange = async (status) => {
    if (!selected) return
    const fd = new FormData()
    fd.append('status', status)
    await fetch(`${VITE_API_URL}/tickets/${selected}/status`, { method: 'PATCH', body: fd })
    await fetchDetail(selected)
    await fetchTickets(search, statusFilter)
    await fetchStats()
  }

  // ── Assign agent ───────────────────────────────────────────────────────────
  const handleAssign = async (email) => {
    if (!selected) return
    const fd = new FormData()
    fd.append('agentEmail', email)
    await fetch(`${VITE_API_URL}/tickets/${selected}/assign`, { method: 'POST', body: fd })
    await fetchDetail(selected)
    await fetchTickets(search, statusFilter)
  }

  // ── Create ticket ──────────────────────────────────────────────────────────
  const handleCreate = async () => {
    if (!form.subject.trim() || !form.customerEmail.trim()) return
    setSending(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      fd.append('createdBy', agentEmail)
      fd.append('source', 'MANUAL')
      const res = await fetch(`${VITE_API_URL}/tickets`, { method: 'POST', body: fd })
      const ticket = await res.json()
      setShowCreate(false)
      setForm({ subject: '', customerEmail: '', customerName: '', priority: 'MEDIUM', tags: '', message: '' })
      await fetchTickets(search, statusFilter)
      await fetchStats()
      handleSelect(ticket)
    } catch (e) {
      console.error('[Tickets] create:', e)
    } finally {
      setSending(false)
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ height: '600px', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#fff' }}>

      {/* ── Create Ticket Modal ──────────────────────────────────────────── */}
      <CModal visible={showCreate} onClose={() => setShowCreate(false)} size="lg">
        <CModalHeader>
          <CModalTitle>New Ticket</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: 'Subject *',        key: 'subject',       type: 'text',  placeholder: 'Brief description of the issue' },
              { label: 'Customer Email *',  key: 'customerEmail', type: 'email', placeholder: 'customer@email.com' },
              { label: 'Customer Name',     key: 'customerName',  type: 'text',  placeholder: 'Full name' },
              { label: 'Tags',              key: 'tags',          type: 'text',  placeholder: 'billing, urgent, ...' },
            ].map(({ label, key, type, placeholder }) => (
              <div key={key}>
                <label style={labelSt}>{label}</label>
                <input
                  type={type}
                  placeholder={placeholder}
                  value={form[key]}
                  onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                  style={inputSt}
                />
              </div>
            ))}
            <div>
              <label style={labelSt}>Priority</label>
              <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))} style={inputSt}>
                {['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label style={labelSt}>Initial Message</label>
              <textarea
                rows={4}
                placeholder="Describe the issue..."
                value={form.message}
                onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                style={{ ...inputSt, resize: 'vertical' }}
              />
            </div>
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowCreate(false)}>Cancel</CButton>
          <CButton color="primary" onClick={handleCreate} disabled={sending}>
            {sending ? <CSpinner size="sm" /> : 'Create Ticket'}
          </CButton>
        </CModalFooter>
      </CModal>

      {/* ── Stats bar ────────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 24,
        padding: '10px 20px', borderBottom: '1px solid #dee2e6',
        background: '#fff', flexShrink: 0, flexWrap: 'wrap',
      }}>
        <strong style={{ fontSize: 18 }}>
          Tickets
          {newBadge > 0 && (
            <span style={{
              marginLeft: 8, background: '#dc3545', color: '#fff',
              borderRadius: 12, fontSize: 11, padding: '2px 7px', fontWeight: 600,
            }}>{newBadge} new</span>
          )}
        </strong>

        <div style={{ display: 'flex', gap: 16, flex: 1 }}>
          {[
            { key: 'ALL', label: 'All', count: stats.TOTAL },
            { key: 'OPEN', label: 'Open', count: stats.OPEN },
            { key: 'PENDING', label: 'Pending', count: stats.PENDING },
            { key: 'CLOSED', label: 'Closed', count: stats.CLOSED },
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => handleFilterChange(key)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 500, padding: '4px 2px',
                color: statusFilter === key ? '#0162C4' : '#6c757d',
                borderBottom: statusFilter === key ? '2px solid #0162C4' : '2px solid transparent',
                display: 'flex', alignItems: 'center', gap: 5,
              }}
            >
              {label}
              {count !== undefined && (
                <span style={{
                  background: statusFilter === key ? '#0162C4' : '#e9ecef',
                  color: statusFilter === key ? '#fff' : '#495057',
                  borderRadius: 10, fontSize: 10, padding: '1px 6px', fontWeight: 600,
                }}>{count}</span>
              )}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Search */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            border: '1px solid #dee2e6', borderRadius: 20,
            padding: '4px 12px', background: '#f8f9fa',
          }}>
            <span style={{ fontSize: 11, color: '#adb5bd' }}>🔍</span>
            <input
              placeholder="Search tickets..."
              value={search}
              onChange={e => handleSearch(e.target.value)}
              style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 12, width: 150 }}
            />
          </div>
          <button
            onClick={() => setShowCreate(true)}
            style={{
              background: '#0162C4', color: '#fff', border: 'none',
              borderRadius: 6, padding: '6px 14px', fontSize: 12,
              fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
            }}
          >
            + New Ticket
          </button>
        </div>
      </div>

      {/* ── Main content: list + detail ───────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* ── Ticket List Panel ────────────────────────────────────────── */}
        <div style={{
          width: '36%', borderRight: '1px solid #dee2e6',
          overflowY: 'auto', flexShrink: 0,
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#adb5bd', fontSize: 13 }}>Loading...</div>
          ) : tickets.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#adb5bd' }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>🎫</div>
              <div style={{ fontSize: 13 }}>No tickets found</div>
            </div>
          ) : (
            tickets.map(ticket => (
              <TicketRow
                key={ticket.id}
                ticket={ticket}
                isSelected={selected === ticket.id}
                onClick={() => handleSelect(ticket)}
              />
            ))
          )}
        </div>

        {/* ── Ticket Detail Panel ──────────────────────────────────────── */}
        {!selected ? (
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#adb5bd', flexDirection: 'column', gap: 8,
          }}>
            <div style={{ fontSize: 44 }}>🎫</div>
            <div style={{ fontSize: 13 }}>Select a ticket to view conversation</div>
          </div>
        ) : detailLoading ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CSpinner color="primary" />
          </div>
        ) : detail ? (
          <TicketDetail
            detail={detail}
            agentEmail={agentEmail}
            agentName={agentName}
            role={role}
            agents={agents}
            replyText={replyText}
            noteText={noteText}
            replyMode={replyMode}
            sending={sending}
            attachFile={attachFile}
            fileInputRef={fileInputRef}
            messagesEndRef={messagesEndRef}
            onReplyChange={setReplyText}
            onNoteChange={setNoteText}
            onModeChange={setReplyMode}
            onSendReply={handleSendReply}
            onAddNote={handleAddNote}
            onStatusChange={handleStatusChange}
            onAssign={handleAssign}
            onAttachChange={setAttachFile}
          />
        ) : null}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// TicketRow
// ─────────────────────────────────────────────────────────────────────────────
const TicketRow = ({ ticket, isSelected, onClick }) => (
  <div
    onClick={onClick}
    style={{
      padding: '12px 16px',
      borderBottom: '1px solid #f0f2f5',
      cursor: 'pointer',
      background: isSelected ? '#eff6ff' : '#fff',
      borderLeft: isSelected ? '3px solid #0162C4' : '3px solid transparent',
      transition: 'background 0.15s',
    }}
    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#f8faff' }}
    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = '#fff' }}
  >
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
      <Avatar name={ticket.customerName} size={34} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginBottom: 2 }}>
          <div style={{
            fontWeight: 600, fontSize: 13, color: '#212529',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
          }}>
            {ticket.subject}
          </div>
          <StatusBadge status={ticket.status} />
        </div>
        <div style={{ fontSize: 11, color: '#6c757d', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {ticket.customerName} · {ticket.customerEmail}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <PriorityDot priority={ticket.priority} />
          <span style={{ fontSize: 10, color: '#adb5bd' }}>{fmtTime(ticket.updatedAt)}</span>
        </div>
        {ticket.assignedAgentName && (
          <div style={{ fontSize: 10, color: '#0162C4', marginTop: 2 }}>
            👤 {ticket.assignedAgentName}
          </div>
        )}
      </div>
    </div>
  </div>
)

// ─────────────────────────────────────────────────────────────────────────────
// TicketDetail
// ─────────────────────────────────────────────────────────────────────────────
const TicketDetail = ({
  detail, agentEmail, agentName, role, agents,
  replyText, noteText, replyMode, sending, attachFile,
  fileInputRef, messagesEndRef,
  onReplyChange, onNoteChange, onModeChange,
  onSendReply, onAddNote, onStatusChange, onAssign, onAttachChange,
}) => {
  const { ticket, messages } = detail
  const isClosed = ticket.status === 'CLOSED'

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* ── Detail Header ────────────────────────────────────────────── */}
      <div style={{
        padding: '12px 20px', borderBottom: '1px solid #dee2e6',
        background: '#fff', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 11, color: '#adb5bd', fontFamily: 'monospace' }}>#{ticket.id}</span>
              <StatusBadge status={ticket.status} />
              <PriorityDot priority={ticket.priority} />
            </div>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#212529', marginBottom: 2 }}>
              {ticket.subject}
            </div>
            <div style={{ fontSize: 12, color: '#6c757d' }}>
              {ticket.customerName} · {ticket.customerEmail}
              {ticket.assignedAgentName && <> · <span style={{ color: '#0162C4' }}>👤 {ticket.assignedAgentName}</span></>}
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Status */}
            <select
              value={ticket.status}
              onChange={e => onStatusChange(e.target.value)}
              style={{ ...inputSt, width: 'auto', fontSize: 11, padding: '4px 8px', cursor: 'pointer' }}
            >
              {['OPEN', 'PENDING', 'CLOSED'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {/* Assign */}
            <select
              value={ticket.assignedAgent || ''}
              onChange={e => onAssign(e.target.value)}
              style={{ ...inputSt, width: 'auto', fontSize: 11, padding: '4px 8px', cursor: 'pointer' }}
            >
              <option value="">Unassigned</option>
              {agents.map(a => (
                <option key={a.email || a.id} value={a.email}>{a.name || a.email}</option>
              ))}
            </select>
          </div>
        </div>
        {/* Tags */}
        {ticket.tags && (
          <div style={{ marginTop: 6, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {ticket.tags.split(',').filter(Boolean).map(t => (
              <span key={t} style={{
                fontSize: 10, padding: '2px 7px', borderRadius: 10,
                background: '#f0f2f5', color: '#6c757d', border: '1px solid #e0e0e0',
              }}>{t.trim()}</span>
            ))}
          </div>
        )}
      </div>

      {/* ── Message Thread ───────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto', background: '#f8f9fa', padding: '16px 20px' }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: '#adb5bd', fontSize: 13, marginTop: 40 }}>
            No messages yet
          </div>
        )}
        {messages.map((msg, i) => (
          <MessageBubble key={i} msg={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Reply / Note Input ────────────────────────────────────────── */}
      <div style={{ flexShrink: 0, background: '#fff', borderTop: '1px solid #dee2e6' }}>
        {/* Mode tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #dee2e6', padding: '0 16px' }}>
          {[
            { key: 'reply', label: '✉️ Reply' },
            { key: 'note',  label: '📝 Note'  },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => onModeChange(key)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 12, fontWeight: 500, padding: '8px 12px',
                color: replyMode === key ? '#0162C4' : '#6c757d',
                borderBottom: replyMode === key ? '2px solid #0162C4' : '2px solid transparent',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <div style={{ padding: 12 }}>
          {replyMode === 'note' ? (
            <>
              <textarea
                rows={3}
                placeholder="Add an internal note (not visible to customer)..."
                value={noteText}
                onChange={e => onNoteChange(e.target.value)}
                disabled={isClosed}
                style={{ ...inputSt, resize: 'none', fontSize: 12, marginBottom: 8 }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={onAddNote}
                  disabled={sending || !noteText.trim() || isClosed}
                  style={sendBtnSt}
                >
                  {sending ? '...' : 'Add Note'}
                </button>
              </div>
            </>
          ) : (
            <>
              <textarea
                rows={3}
                placeholder={isClosed ? 'Ticket is closed' : 'Type your reply...'}
                value={replyText}
                onChange={e => onReplyChange(e.target.value)}
                disabled={isClosed}
                style={{ ...inputSt, resize: 'none', fontSize: 12, marginBottom: 8 }}
              />
              {/* Attach + send row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    style={{ display: 'none' }}
                    onChange={e => onAttachChange(e.target.files?.[0] || null)}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isClosed}
                    style={{
                      background: 'none', border: '1px solid #dee2e6',
                      borderRadius: 5, padding: '4px 8px', cursor: isClosed ? 'not-allowed' : 'pointer',
                      fontSize: 12, color: '#6c757d',
                    }}
                  >📎 Attach</button>
                  {attachFile && (
                    <span style={{ fontSize: 11, color: '#0162C4' }}>
                      {attachFile.name}
                      <button
                        onClick={() => onAttachChange(null)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc3545', marginLeft: 4 }}
                      >✕</button>
                    </span>
                  )}
                </div>
                <button
                  onClick={onSendReply}
                  disabled={sending || !replyText.trim() || isClosed}
                  style={sendBtnSt}
                >
                  {sending ? '...' : '✉️ Send Reply'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MessageBubble
// ─────────────────────────────────────────────────────────────────────────────
const MessageBubble = ({ msg }) => {
  const isAgent    = msg.senderType === 'AGENT'
  const isNote     = msg.senderType === 'NOTE'
  const isCustomer = msg.senderType === 'CUSTOMER'

  if (isNote) {
    return (
      <div style={{
        margin: '8px 0', padding: '10px 14px',
        background: '#fef9c3', border: '1px solid #fde68a',
        borderRadius: 8, fontSize: 12,
      }}>
        <div style={{ fontWeight: 600, color: '#92400e', marginBottom: 3, fontSize: 11 }}>
          📝 Internal Note · {msg.senderName}
        </div>
        <div style={{ color: '#78350f', whiteSpace: 'pre-wrap' }}>{msg.message}</div>
        <div style={{ fontSize: 10, color: '#a16207', marginTop: 4 }}>{fmtTime(msg.createdAt)}</div>
      </div>
    )
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: isAgent ? 'flex-end' : 'flex-start',
      marginBottom: 12,
      gap: 8,
      alignItems: 'flex-end',
    }}>
      {isCustomer && <Avatar name={msg.senderName} size={28} bg="#e0e7ff" color="#4338ca" />}
      <div style={{ maxWidth: '72%' }}>
        <div style={{ fontSize: 10, color: '#adb5bd', marginBottom: 3,
          textAlign: isAgent ? 'right' : 'left' }}>
          {msg.senderName} · {fmtTime(msg.createdAt)}
        </div>
        <div style={{
          padding: '10px 14px', borderRadius: 12, fontSize: 13,
          background: isAgent ? '#0162C4' : '#fff',
          color: isAgent ? '#fff' : '#212529',
          border: isAgent ? 'none' : '1px solid #dee2e6',
          wordBreak: 'break-word', whiteSpace: 'pre-wrap',
        }}>
          {msg.message}
          {msg.attachmentUrl && (
            <div style={{ marginTop: 6, paddingTop: 6, borderTop: isAgent ? '1px solid rgba(255,255,255,0.3)' : '1px solid #dee2e6' }}>
              <a
                href={msg.attachmentUrl}
                target="_blank"
                rel="noreferrer"
                style={{ fontSize: 11, color: isAgent ? '#bfdbfe' : '#0162C4', textDecoration: 'none' }}
              >
                📎 {msg.attachmentName || 'Attachment'}
              </a>
            </div>
          )}
        </div>
      </div>
      {isAgent && <Avatar name={msg.senderName} size={28} bg="#dbeafe" color="#1d4ed8" />}
    </div>
  )
}

// ── Shared micro styles ───────────────────────────────────────────────────────
const inputSt = {
  width: '100%', padding: '7px 10px',
  border: '1px solid #dee2e6', borderRadius: 6,
  fontSize: 13, outline: 'none', background: '#fff', color: '#212529',
  boxSizing: 'border-box',
}
const labelSt = {
  display: 'block', fontSize: 11, fontWeight: 600,
  color: '#6c757d', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em',
}
const sendBtnSt = {
  background: '#0162C4', color: '#fff', border: 'none',
  borderRadius: 6, padding: '6px 16px', fontSize: 12,
  fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
  opacity: 1,
}

export default Tickets
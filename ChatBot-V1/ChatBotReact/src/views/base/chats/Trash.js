import React, { useState, useEffect } from 'react'
import {
  CTable, CTableHead, CTableRow, CTableHeaderCell,
  CTableBody, CTableDataCell,
  CButton,
  CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter,
} from '@coreui/react'
import { FaSearch, FaTrash, FaUndo } from 'react-icons/fa'
import VITE_API_URL from '../../../Config'

const Trash = () => {
  const [sessions,        setSessions]        = useState([])
  const [searchTerm,      setSearchTerm]      = useState('')
  const [loading,         setLoading]         = useState(true)
  const [deleteModal,     setDeleteModal]     = useState(false)
  const [sessionToDelete, setSessionToDelete] = useState(null)
  const [deleting,        setDeleting]        = useState(false)
  const [restoring,       setRestoring]       = useState(null)

  const agentId = sessionStorage.getItem('userid')

  const fetchTrashedSessions = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${VITE_API_URL}/chat/sessions/trash?agentId=${agentId}`)
      if (!res.ok) throw new Error('Failed to fetch trash')
      const data = await res.json()
      setSessions(data.map((item) => ({
        username:  item.username  || 'Unknown',
        useremail: item.useremail || '',
        sessionId: item.sessionId,
        agents:    item.adminemail || 'Unassigned',
        status:    item.status,
        time:      item.timestamp ? new Date(item.timestamp).toLocaleString() : '—',
      })))
    } catch (err) {
      console.error('[Trash] fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTrashedSessions() }, [agentId])

  const handleRestore = async (sessionId) => {
    setRestoring(sessionId)
    try {
      const res = await fetch(`${VITE_API_URL}/chat/sessions/${sessionId}/restore`, { method: 'POST' })
      if (res.ok) setSessions(prev => prev.filter(s => s.sessionId !== sessionId))
      else alert('Failed to restore session. Please try again.')
    } catch (err) {
      console.error('[Trash] restore error:', err)
      alert('Error restoring session.')
    } finally {
      setRestoring(null)
    }
  }

  const confirmPermanentDelete = (session) => {
    setSessionToDelete(session)
    setDeleteModal(true)
  }

  const handlePermanentDelete = async () => {
    if (!sessionToDelete) return
    setDeleting(true)
    try {
      const res = await fetch(`${VITE_API_URL}/chat/sessions/${sessionToDelete.sessionId}`, { method: 'DELETE' })
      if (res.ok) setSessions(prev => prev.filter(s => s.sessionId !== sessionToDelete.sessionId))
      else alert('Failed to delete. Please try again.')
    } catch (err) {
      console.error('[Trash] delete error:', err)
      alert('Error deleting session.')
    } finally {
      setDeleting(false)
      setDeleteModal(false)
      setSessionToDelete(null)
    }
  }

  const filtered = sessions.filter(s =>
    (s.username  || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.useremail || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* ── Permanent-delete confirmation modal ─────────────────────────── */}
      <CModal visible={deleteModal} onClose={() => setDeleteModal(false)} alignment="center">
        <CModalHeader>
          <CModalTitle>Permanently Delete</CModalTitle>
        </CModalHeader>
        <CModalBody>
          Permanently delete the session for <strong>{sessionToDelete?.username}</strong>?
          <br />
          <span className="text-danger small fw-semibold">
            ⚠ This will remove all messages and cannot be undone.
          </span>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setDeleteModal(false)} disabled={deleting}>
            Cancel
          </CButton>
          <CButton color="danger" onClick={handlePermanentDelete} disabled={deleting}>
            {deleting ? 'Deleting…' : 'Delete Forever'}
          </CButton>
        </CModalFooter>
      </CModal>

      {/* ── Header — matches site style ─────────────────────────────────── */}
      <div style={{
        padding: '14px 20px',
        borderBottom: '1px solid #dee2e6',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#fff',
        flexShrink: 0,
      }}>
        <strong style={{ fontSize: '18px', color: '#212529' }}>
          Trash
          {filtered.length > 0 && (
            <span style={{
              marginLeft: '8px',
              background: '#dc3545',
              color: '#fff',
              borderRadius: '12px',
              fontSize: '11px',
              padding: '2px 7px',
              fontWeight: 600,
            }}>
              {filtered.length}
            </span>
          )}
        </strong>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Search bar — matches SecondColumn search style */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            border: '1px solid #dee2e6',
            borderRadius: '20px',
            padding: '4px 12px',
            background: '#f8f9fa',
            gap: '6px',
          }}>
            <FaSearch style={{ color: '#adb5bd', fontSize: '11px' }} />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: '12px',
                color: '#212529',
                width: '140px',
              }}
            />
          </div>
          <button
            onClick={fetchTrashedSessions}
            style={{
              background: '#f8f9fa',
              border: '1px solid #dee2e6',
              borderRadius: '6px',
              padding: '5px 10px',
              fontSize: '12px',
              cursor: 'pointer',
              color: '#6c757d',
            }}
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto', background: '#fff', padding: '0' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#adb5bd', fontSize: '13px' }}>
            Loading...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#adb5bd' }}>
            <div style={{ fontSize: '40px', marginBottom: '8px' }}>🗑️</div>
            <div style={{ fontSize: '13px' }}>Trash is empty</div>
          </div>
        ) : (
          <CTable hover responsive style={{ marginBottom: 0 }}>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell style={thStyle}>Visitor</CTableHeaderCell>
                <CTableHeaderCell style={thStyle}>Session ID</CTableHeaderCell>
                <CTableHeaderCell style={thStyle}>Agent</CTableHeaderCell>
                <CTableHeaderCell style={thStyle}>Status</CTableHeaderCell>
                <CTableHeaderCell style={thStyle}>Last Activity</CTableHeaderCell>
                <CTableHeaderCell style={{ ...thStyle, textAlign: 'center' }}>Actions</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {filtered.map((session, index) => (
                <CTableRow key={index} style={{ fontSize: '13px' }}>
                  <CTableDataCell>
                    <div style={{ fontWeight: 600, color: '#212529' }}>{session.username}</div>
                    <div style={{ fontSize: '11px', color: '#6c757d' }}>{session.useremail}</div>
                  </CTableDataCell>
                  <CTableDataCell>
                    <span style={{ fontSize: '11px', color: '#adb5bd', fontFamily: 'monospace' }}>
                      {session.sessionId ? session.sessionId.substring(0, 12) + '…' : '—'}
                    </span>
                  </CTableDataCell>
                  <CTableDataCell style={{ color: '#495057' }}>{session.agents}</CTableDataCell>
                  <CTableDataCell>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      padding: '3px 8px',
                      borderRadius: '12px',
                      background: session.status ? '#d1fae5' : '#fef9c3',
                      color:      session.status ? '#065f46' : '#713f12',
                    }}>
                      {session.status ? 'Closed' : 'Pending'}
                    </span>
                  </CTableDataCell>
                  <CTableDataCell style={{ fontSize: '12px', color: '#6c757d' }}>{session.time}</CTableDataCell>
                  <CTableDataCell style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                      <button
                        title="Restore session"
                        disabled={restoring === session.sessionId}
                        onClick={() => handleRestore(session.sessionId)}
                        style={{
                          background: 'none',
                          border: '1px solid #198754',
                          borderRadius: '5px',
                          padding: '4px 8px',
                          cursor: 'pointer',
                          color: '#198754',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#d1fae5' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'none' }}
                      >
                        {restoring === session.sessionId ? '…' : <FaUndo size={11} />}
                      </button>
                      <button
                        title="Permanently delete"
                        onClick={() => confirmPermanentDelete(session)}
                        style={{
                          background: 'none',
                          border: '1px solid #dc3545',
                          borderRadius: '5px',
                          padding: '4px 8px',
                          cursor: 'pointer',
                          color: '#dc3545',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#fee2e2' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'none' }}
                      >
                        <FaTrash size={11} />
                      </button>
                    </div>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        )}
      </div>
    </div>
  )
}

const thStyle = {
  backgroundColor: '#f8f9fa',
  fontSize: '11px',
  fontWeight: 700,
  color: '#6c757d',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  padding: '10px 16px',
  borderBottom: '1px solid #dee2e6',
}

export default Trash
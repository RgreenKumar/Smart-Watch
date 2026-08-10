import React, { useState, useEffect } from 'react'
import {
  CCardHeader,
  CCardBody,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CButton,
  CRow,
  CCol,
  CInputGroup,
  CInputGroupText,
  CFormInput,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from '@coreui/react'
import { FaSearch, FaTrash } from 'react-icons/fa'
import VITE_API_URL from '../../Config'

const GridTable = ({ currentAdminEmail, onBack }) => {
  const [sessionDetails,   setSessionDetails]   = useState([])
  const [searchTerm,       setSearchTerm]       = useState('')
  const [loading,          setLoading]          = useState(true)
  const [deleteModal,      setDeleteModal]      = useState(false)
  const [sessionToDelete,  setSessionToDelete]  = useState(null)
  const [deleting,         setDeleting]         = useState(false)

  const agentId = sessionStorage.getItem('userid')

  // ── Fetch active (non-deleted) sessions ───────────────────────────────────
  const fetchSessionDetails = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${VITE_API_URL}/chat/sessions/visible?agentId=${agentId}`)
      if (!res.ok) throw new Error('Failed to fetch sessions')
      const data = await res.json()

      const mapped = data.map((item) => ({
        username:  item.username  || 'Unknown',
        useremail: item.useremail || '',
        sessionId: item.sessionId,
        agents:    item.adminemail || 'Unassigned',
        status:    item.status,
        time:      item.timestamp
          ? new Date(item.timestamp).toLocaleString()
          : '—',
      }))

      setSessionDetails(mapped)
    } catch (err) {
      console.error('[GridTable] fetchSessionDetails:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSessionDetails()
  }, [agentId])

  // ── Soft-delete: move to Trash ─────────────────────────────────────────────
  const confirmDelete = (session) => {
    setSessionToDelete(session)
    setDeleteModal(true)
  }

  const handleSoftDelete = async () => {
    if (!sessionToDelete) return
    setDeleting(true)
    try {
      const res = await fetch(
        `${VITE_API_URL}/chat/sessions/${sessionToDelete.sessionId}/soft-delete`,
        { method: 'POST' }
      )
      if (res.ok) {
        // Remove from the active list — it now lives in Trash
        setSessionDetails((prev) =>
          prev.filter((s) => s.sessionId !== sessionToDelete.sessionId)
        )
      } else {
        console.error('[GridTable] Soft-delete failed:', res.status)
        alert('Failed to move session to trash. Please try again.')
      }
    } catch (err) {
      console.error('[GridTable] Soft-delete error:', err)
      alert('Error moving session to trash.')
    } finally {
      setDeleting(false)
      setDeleteModal(false)
      setSessionToDelete(null)
    }
  }

  // ── Filter ─────────────────────────────────────────────────────────────────
  const filtered = sessionDetails.filter((s) =>
    (s.username  || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.useremail || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <>
      {/* ── Move-to-Trash confirmation modal ──────────────────────────── */}
      <CModal visible={deleteModal} onClose={() => setDeleteModal(false)} alignment="center">
        <CModalHeader>
          <CModalTitle>Move to Trash</CModalTitle>
        </CModalHeader>
        <CModalBody>
          Move the session for <strong>{sessionToDelete?.username}</strong> to Trash?
          <br />
          <span className="text-muted small">
            You can restore or permanently delete it from the Trash page.
          </span>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setDeleteModal(false)} disabled={deleting}>
            Cancel
          </CButton>
          <CButton color="danger" onClick={handleSoftDelete} disabled={deleting}>
            {deleting ? 'Moving…' : 'Move to Trash'}
          </CButton>
        </CModalFooter>
      </CModal>

      {/* ── Header ────────────────────────────────────────────────────── */}
      <CCardHeader>
        <CRow className="align-items-center">
          <CCol xs="12" sm="5" className="mb-2 mb-sm-0">
            <h6 className="fw-bold mb-0">Visitor Sessions</h6>
          </CCol>

          <CCol xs="12" sm="4" className="mb-2 mb-sm-0">
            <CInputGroup className="p-0">
              <CInputGroupText>
                <FaSearch />
              </CInputGroupText>
              <CFormInput
                placeholder="Search visitors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </CInputGroup>
          </CCol>

          <CCol xs="12" sm="3" className="text-sm-end d-flex justify-content-end gap-2">
            {onBack && (
              <CButton color="secondary" size="sm" onClick={onBack}>
                ← Back
              </CButton>
            )}
            <CButton color="light" size="sm" onClick={fetchSessionDetails}>
              ↻ Refresh
            </CButton>
          </CCol>
        </CRow>
      </CCardHeader>

      {/* ── Table ─────────────────────────────────────────────────────── */}
      <CCardBody style={{ maxHeight: '520px', overflowY: 'auto' }}>
        {loading ? (
          <p className="text-center text-muted">Loading...</p>
        ) : (
          <CTable hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell style={{ backgroundColor: '#F3F4F7', width: '25%' }}>
                  Visitor
                </CTableHeaderCell>
                <CTableHeaderCell style={{ backgroundColor: '#F3F4F7' }}>
                  Session ID
                </CTableHeaderCell>
                <CTableHeaderCell style={{ backgroundColor: '#F3F4F7' }}>
                  Agent
                </CTableHeaderCell>
                <CTableHeaderCell style={{ backgroundColor: '#F3F4F7' }}>
                  Status
                </CTableHeaderCell>
                <CTableHeaderCell style={{ backgroundColor: '#F3F4F7' }}>
                  Last Activity
                </CTableHeaderCell>
                <CTableHeaderCell style={{ backgroundColor: '#F3F4F7', textAlign: 'center' }}>
                  Action
                </CTableHeaderCell>
              </CTableRow>
            </CTableHead>

            <CTableBody>
              {filtered.length > 0 ? (
                filtered.map((session, index) => (
                  <CTableRow key={index}>
                    <CTableDataCell>
                      <div className="fw-bold">{session.username}</div>
                      <div className="text-muted small">{session.useremail}</div>
                    </CTableDataCell>
                    <CTableDataCell>
                      <span className="text-muted" style={{ fontSize: '0.78rem' }}>
                        {session.sessionId
                          ? session.sessionId.substring(0, 12) + '...'
                          : '—'}
                      </span>
                    </CTableDataCell>
                    <CTableDataCell>{session.agents}</CTableDataCell>
                    <CTableDataCell>
                      <span
                        className={`badge ${
                          session.status ? 'bg-success' : 'bg-warning text-dark'
                        }`}
                      >
                        {session.status ? 'Active' : 'Pending'}
                      </span>
                    </CTableDataCell>
                    <CTableDataCell>{session.time}</CTableDataCell>
                    <CTableDataCell style={{ textAlign: 'center' }}>
                      <CButton
                        color="danger"
                        size="sm"
                        variant="outline"
                        title="Move to Trash"
                        onClick={() => confirmDelete(session)}
                        style={{ padding: '3px 8px' }}
                      >
                        <FaTrash size={13} />
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                ))
              ) : (
                <CTableRow>
                  <CTableDataCell colSpan="6" className="text-center text-muted">
                    No sessions found.
                  </CTableDataCell>
                </CTableRow>
              )}
            </CTableBody>
          </CTable>
        )}
      </CCardBody>
    </>
  )
}

export default GridTable
import React, { useEffect, useState } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import CIcon from '@coreui/icons-react'
import { cilGrid, cilSearch } from '@coreui/icons'
import { CCard, CCardBody } from '@coreui/react'
import img from '../../assets/images/avatars/1.jpg'
import VITE_API_URL from '../../Config'

const SecondColumn = ({ onUserSelect, currentAdminEmail, onGridClick, departmentId, role }) => {
  const [chatRooms,      setChatRooms]      = useState([])
  const [selectedChatId, setSelectedChatId] = useState(null)
  const [searchTerm,     setSearchTerm]     = useState('')
  const [filterType,     setFilterType]     = useState('all')

  const agentId = sessionStorage.getItem('userid')
  const isAdmin = role === 'ADMIN'

  // ── Sanitize departmentId: "null" string from sessionStorage must be treated as absent ──
  // sessionStorage.setItem('departmentId', null) stores the string "null" which is truthy.
  // Without this guard an agent subscribes to /topic/department/null and never receives events.
  const safeDeptId = departmentId && departmentId !== 'null' && departmentId !== 'undefined'
    ? departmentId
    : null

  // ── Fetch sessions from REST ──────────────────────────────────────────────
  const fetchChatRooms = async () => {
    try {
      const res = await fetch(`${VITE_API_URL}/chat/sessions/visible?agentId=${agentId}`)
      if (!res.ok) throw new Error('Failed to fetch chat rooms')
      const data = await res.json()
      setChatRooms(data)
    } catch (err) {
      console.error('[SecondColumn] fetchChatRooms:', err)
    }
  }

  // ── Fetch all department IDs for ADMIN (subscribes to all dept topics) ────
  const fetchAllDepartments = async () => {
    if (!isAdmin) return []
    try {
      const res = await fetch(`${VITE_API_URL}/chatbot/getAllDepartment`)
      if (!res.ok) return []
      const data = await res.json()
      return data.map((d) => d.id)
    } catch {
      return []
    }
  }

  // ── WebSocket + polling lifecycle ─────────────────────────────────────────
  useEffect(() => {
    fetchChatRooms()
    const intervalId = setInterval(fetchChatRooms, 5000)

    let client

    const setupWebSocket = async () => {
      let deptIds = []

      if (isAdmin) {
        // Admin subscribes to ALL department topics
        deptIds = await fetchAllDepartments()
      } else if (safeDeptId) {
        // Agent subscribes to their own department only
        deptIds = [safeDeptId]
      }
      // If agent has no department yet, they still get the global /topic/admin/pending

      client = new Client({
        webSocketFactory: () => new SockJS(`${VITE_API_URL}/chat`),
        reconnectDelay: 5000,
        onConnect: () => {
          console.log('[SecondColumn] WS connected | role =', role, '| depts =', deptIds)

          // Subscribe to each department topic for new sessions
          deptIds.forEach((dId) => {
            client.subscribe(`/topic/department/${dId}`, () => {
              fetchChatRooms()
            })

            // When a session is claimed, refresh the list
            client.subscribe(`/topic/session-claimed/${dId}`, (msg) => {
              try {
                const { sessionId } = JSON.parse(msg.body)
                if (isAdmin) {
                  fetchChatRooms()
                } else {
                  setChatRooms((prev) => prev.filter((r) => r.sessionId !== sessionId))
                }
              } catch {
                fetchChatRooms()
              }
            })
          })

          // All agents & admins get the global pending topic as a fallback
          // This ensures agents without a department still get notified
          client.subscribe('/topic/admin/pending', () => {
            fetchChatRooms()
          })
        },
        onStompError: (frame) => {
          console.error('[SecondColumn] STOMP error:', frame)
        },
      })

      client.activate()
    }

    setupWebSocket()

    return () => {
      clearInterval(intervalId)
      if (client) client.deactivate()
    }
  }, [safeDeptId, role])

  // ── Select a chat room ────────────────────────────────────────────────────
  const handleSelect = (room) => {
    setSelectedChatId(room.sessionId)
    onUserSelect?.({
      name:          room.username,
      sessionId:     room.sessionId,
      senderid:      room.userid,
      senderemail:   room.adminemail,
      receiveremail: room.useremail,
      status:        room.status,
      departmentId:  room.departmentId,
    })
  }

  // ── Filter helpers ────────────────────────────────────────────────────────
  const filterChats = (statusFilter) =>
    chatRooms
      .filter((r) => (r.username || '').toLowerCase().includes(searchTerm.toLowerCase()))
      .filter((r) => filterType === 'mine' ? r.adminemail === currentAdminEmail : true)
      .filter((r) => r.status === statusFilter)

  const renderMessageList = (rooms) => {
    if (rooms.length === 0)
      return <p className="text-center text-muted small">No messages found</p>

    return rooms.map((room, index) => {
      const isSelected = room.sessionId === selectedChatId
      return (
        <CCard
          key={index}
          onClick={() => handleSelect(room)}
          className="mb-2"
          style={{
            cursor: 'pointer',
            backgroundColor: isSelected ? '#d0e7ff' : 'white',
            overflow: 'hidden',   // prevent card itself from overflowing
          }}
        >
          <CCardBody className="p-2" style={{ overflow: 'hidden' }}>
            {/* overflow:hidden on the flex row stops children from bursting out */}
            <div className="d-flex align-items-start" style={{ overflow: 'hidden' }}>
              {/* Avatar — fixed size, never shrinks */}
              <img
                src={img}
                alt="avatar"
                className="rounded-circle me-2 flex-shrink-0"
                style={{ width: '36px', height: '36px', objectFit: 'cover' }}
              />
              {/* Text block — minWidth:0 is REQUIRED for text-truncate inside flex */}
              <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                <div
                  className="fw-semibold"
                  style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                >
                  {room.username || 'Unknown Visitor'}
                </div>
                <div
                  className="text-muted small"
                  style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                >
                  {room.message || 'No message yet'}
                </div>
                {isAdmin && room.departmentId && (
                  <div style={{ fontSize: '0.65rem', color: '#888' }}>
                    Dept #{room.departmentId}
                  </div>
                )}
              </div>
              {/* Timestamp — fixed width, never wraps */}
              <div
                className="text-muted flex-shrink-0 ms-1"
                style={{ fontSize: '0.68rem', whiteSpace: 'nowrap' }}
              >
                {room.timestamp &&
                  new Date(room.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
              </div>
            </div>
          </CCardBody>
        </CCard>
      )
    })
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      className="border-end pe-2 ps-2 pt-3 d-flex flex-column"
      style={{ width: '20%' }}
    >
      <div className="d-flex justify-content-between align-items-center mb-3 mt-2">
        <strong style={{ fontSize: '20px' }}>
          Chats {isAdmin && <span className="badge bg-primary ms-1" style={{ fontSize: '0.6rem' }}>All Depts</span>}
        </strong>
        <CIcon icon={cilGrid} style={{ cursor: 'pointer' }} onClick={onGridClick} />
      </div>

      <div className="input-group input-group-sm mb-3">
        <span className="input-group-text border-end-0" style={{ borderRadius: '20px 0 0 20px' }}>
          <CIcon icon={cilSearch} />
        </span>
        <input
          type="text"
          className="form-control border-start-0"
          placeholder="Search..."
          style={{ borderRadius: '0 20px 20px 0' }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="text-center mb-2">
        <div className="d-flex justify-content-center">
          <span
            style={{ cursor: 'pointer', fontWeight: '500', marginRight: '40px',
              color: filterType === 'all' ? '#007bff' : 'inherit' }}
            onClick={() => setFilterType('all')}
          >
            All
          </span>
          <span
            style={{ cursor: 'pointer', fontWeight: '500',
              color: filterType === 'mine' ? '#007bff' : 'inherit' }}
            onClick={() => setFilterType('mine')}
          >
            Mine
          </span>
        </div>
        <hr className="mt-2 mb-0" />
      </div>

      <div className="mt-3 px-2">
        <h6 className="fw-bold">
          Incoming{' '}
          {filterChats(false).length > 0 && (
            <span className="badge bg-danger ms-1">{filterChats(false).length}</span>
          )}
        </h6>
      </div>
      <div style={{ maxHeight: '180px', overflowY: 'auto' }}>
        {renderMessageList(filterChats(false))}
      </div>

      <div className="mt-4 px-2">
        <h6 className="fw-bold">All</h6>
      </div>
      <div style={{ maxHeight: '180px', overflowY: 'auto' }}>
        {renderMessageList(filterChats(true))}
      </div>
    </div>
  )
}

export default SecondColumn
import React, { useState } from 'react'
import { CCard, CCardBody, CButton } from '@coreui/react'
import FirstColumn  from './FirstColumn'
import SecondColumn from './SecondColumn'
import ThirdColumn  from './ThirdColumn'
import GridTable    from './GridTable'
import Trash        from '../base/chats/Trash'
import Tickets      from '../base/Tickets'
import Compose      from '../base/Compose'
import chatimage    from '../../assets/images/avatars/chat.png'
import img          from '../../assets/images/avatars/1.jpg'

const Chats = () => {
  const adminName    = sessionStorage.getItem('name')
  const adminEmail   = sessionStorage.getItem('email')
  const token        = sessionStorage.getItem('token')
  const adminId      = sessionStorage.getItem('userid')
  const role         = sessionStorage.getItem('role')
  const departmentId = sessionStorage.getItem('departmentId')

  const [selectedUser,   setSelectedUser]   = useState(null)
  const [showGridTable,  setShowGridTable]  = useState(false)
  const [showTrash,      setShowTrash]      = useState(false)
  const [showCompose,    setShowCompose]    = useState(false)  
  const [showTickets,    setShowTickets]    = useState(false)
  const [showJoinPrompt, setShowJoinPrompt] = useState(false)
  const [chatJoined,     setChatJoined]     = useState(false)
  const [activeTab,      setActiveTab]      = useState('Chat')

  const handleUserSelect = (user) => {
    setSelectedUser(user)
    setChatJoined(false)

    const alreadyClosed  = user.status === true || user.status === 'true'
    const alreadyClaimed = !!user.senderemail

    if (alreadyClosed || alreadyClaimed) {
      setShowJoinPrompt(false)
    } else {
      setShowJoinPrompt(true)
    }
  }

  const handleJoinChat = () => {
    setSelectedUser((prev) => ({ ...prev, senderemail: adminEmail }))
    setChatJoined(true)
    setShowJoinPrompt(false)
  }

  const handleRejectChat = () => {
    setSelectedUser(null)
    setShowJoinPrompt(false)
    setChatJoined(false)
  }

  // ── Centralised tab-change handler ────────────────────────────────────────
  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setShowGridTable(false)
    setShowTrash(false)
    setShowCompose(false)
    setShowTickets(false)

    if (tab === 'Trash') {
      setShowTrash(true)
    } else if (tab === 'Compose') {
      setShowCompose(true)
    } else if (tab === 'Tickets') {
      setShowTickets(true)
    }
  }

  // ── Determine what to render in the main area ─────────────────────────────
  const renderMainArea = () => {
    if (showCompose) {
      return (
        <div style={{ flex: 1, overflowY: 'auto', padding: '0' }}>
          <Compose />
        </div>
      )
    }

    if (showTickets) {  
      return (
        <div style={{ flex: 1, overflowY: 'auto', padding: '0' }}>
          <Tickets />
        </div>
      )
    }

    if (showTrash) {
      return (
        <div style={{ width: '100%', overflowY: 'auto' }}>
          <Trash />
        </div>
      )
    }

    if (showGridTable) {
      return (
        <div style={{ width: '100%' }}>
          <GridTable
            currentAdminEmail={adminEmail}
            role={role}
            onBack={() => {
              setShowGridTable(false)
              setActiveTab('Chat')
            }}
          />
        </div>
      )
    }

    return (
      <>
        <SecondColumn
          currentAdminEmail={adminEmail}
          role={role}
          onUserSelect={handleUserSelect}
          onGridClick={() => {
            setShowGridTable(true)
            setActiveTab('Chat')
          }}
          departmentId={selectedUser?.departmentId || departmentId}
        />

        <ThirdColumn
          sessionDetails={selectedUser}
          adminEmail={adminEmail}
          adminName={adminName}
          adminId={adminId}
          jwtToken={token}
          chatJoined={chatJoined}
          onSessionClaimed={handleJoinChat}
        />
      </>
    )
  }

  return (
    <CCard>
      <CCardBody className="p-0" style={{ height: '600px' }}>
        <div className="d-flex h-100 position-relative">

          <FirstColumn
            chatimage={chatimage}
            ChatID={selectedUser?.sessionId}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />

          {renderMainArea()}

          {/* Join / Reject prompt */}
          {showJoinPrompt && selectedUser && (
            <CCard
              className="position-absolute shadow"
              style={{
                bottom: '20px',
                right: '20px',
                zIndex: 1000,
                minWidth: '300px',
                borderRadius: '12px',
              }}
            >
              <CCardBody>
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div className="d-flex">
                    <img
                      src={img}
                      alt="User"
                      className="rounded-circle me-3"
                      style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                    />
                    <div>
                      <div className="fw-semibold">
                        {selectedUser.name || 'Visitor'}
                      </div>
                      <div className="text-muted small">
                        {selectedUser.receiveremail || selectedUser.useremail || ''}
                      </div>
                    </div>
                  </div>
                  <button onClick={handleRejectChat} className="btn-close" />
                </div>
                <div className="d-flex justify-content-between gap-2">
                  <CButton className="w-100" color="light" onClick={handleRejectChat}>
                    Reject
                  </CButton>
                  <CButton className="w-100" color="primary" onClick={handleJoinChat}>
                    Join
                  </CButton>
                </div>
              </CCardBody>
            </CCard>
          )}

        </div>
      </CCardBody>
    </CCard>
  )
}

export default Chats
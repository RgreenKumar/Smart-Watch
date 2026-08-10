import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilPencil,
  cilChatBubble,
  cilTags,
  cilWarning,
  cilTrash,
} from '@coreui/icons'
import { useNavigate } from 'react-router-dom'

// route: null  → handled inside Chats layout (no navigation)
// route: '...' → navigate away to that page
const NAV_ITEMS = [
  { icon: cilPencil,     label: 'Compose', route: null               },
  { icon: cilChatBubble, label: 'Chat',    route: null               },
  { icon: cilTags,       label: 'Tickets',  route: null    },
  { icon: cilWarning,    label: 'Spam',    route: null       },
  { icon: cilTrash,      label: 'Trash',   route: null               },
]

const FirstColumn = ({ chatimage, ChatID, activeTab, onTabChange }) => {
  const navigate = useNavigate()

  const handleNav = (item) => {
    if (onTabChange) onTabChange(item.label)
    if (item.route) navigate(item.route)
  }

  return (
    <div
      className="border-end d-flex flex-column align-items-center pt-3 h-100"
      style={{ width: '75px', minWidth: '75px', flexShrink: 0 }}
    >
      {/* Logo */}
      <div style={{ marginBottom: '8px' }}>
        <img
          src={chatimage}
          alt="Chatbot"
          style={{
            width: '48px', height: '48px', padding: '5px', objectFit: 'contain',
            borderRadius: '5px', border: '1px solid #B3B3B3', marginTop: '2px',
          }}
        />
      </div>

      {/* Nav buttons */}
      <div className="flex-grow-1 d-flex flex-column justify-content-center">
        {NAV_ITEMS.map(({ icon, label, route }) => {
          const isActive = activeTab === label
          return (
            <div
              className="d-flex flex-column align-items-center mb-2"
              key={label}
              style={{ cursor: 'pointer' }}
              onClick={() => handleNav({ label, route })}
              title={label}
            >
              <div
                className="d-flex justify-content-center align-items-center"
                style={{
                  width: '50px', height: '50px', borderRadius: '6px',
                  border: isActive ? 'none' : '1px solid #B3B3B3',
                  backgroundColor: isActive ? '#0162C4' : '#ffffff',
                  color: isActive ? '#ffffff' : '#000000',
                  transition: 'background 0.2s, color 0.2s',
                }}
              >
                <CIcon icon={icon} title={label}
                  style={{ fontSize: '18px', color: isActive ? '#fff' : 'inherit' }} />
              </div>
              <span style={{
                fontSize: '11px', marginTop: '4px',
                fontWeight: isActive ? '600' : '400',
                color: isActive ? '#0162C4' : '#555',
              }}>
                {label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default FirstColumn
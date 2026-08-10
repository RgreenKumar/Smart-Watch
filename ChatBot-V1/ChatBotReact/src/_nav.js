// import React from 'react'
// import CIcon from '@coreui/icons-react'
// import {
//   cilDescription,
//   cilListRich,
//   cilSettings,
//   cilHome,
//   cilChatBubble,
//   cilGroup,
//   cilInbox
// } from '@coreui/icons'
// import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

// const _nav = [
//   {
//     component: CNavItem,
//     name: 'Dashboard',
//     to: '/dashboard',
//     icon: <CIcon icon={cilHome} customClassName="nav-icon" />,
//     badge: {
//       color: 'info',
//       text: 'NEW',
//     },
//   },
//   {
//     component: CNavTitle,
//     name: 'Inbox',
//   },
//   {
//       component: CNavGroup,
//       name: 'Inbox',
//       to: '/base',
//       icon: <CIcon icon={cilInbox} customClassName="nav-icon" />,
//       items: [
//         {
//           component: CNavItem,
//           name: 'Chats',
//           to: '/base/Chats',
//           icon: <CIcon icon={cilChatBubble} customClassName="nav-icon" />,
//         },
//       ]
    
//   },
//   {
//     component: CNavTitle,
//     name: 'Administration',
//   },
//   {
//     component: CNavItem,
//     name: 'Overview',
//     to : '/overview',
//     icon: <CIcon icon={cilDescription} customClassName="nav-icon" />,
//   },
//   {
//           component: CNavItem,
//           name: 'Channels',
//           to: '/base/Channels',
//           icon: <CIcon icon={cilListRich} customClassName="nav-icon" />,
//   },
//   {
//     component: CNavItem,
//     name: 'Settings',
//     href:'#',
//     icon: <CIcon icon={cilSettings} customClassName="nav-icon" />,
//   },
//   {
//     component: CNavItem,
//     name: 'User Management',
//     href:'#',
//     icon: <CIcon icon={cilGroup} customClassName="nav-icon" />,
//   },
// ]

// export default _nav


import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilDescription,
  cilListRich,
  cilSettings,
  cilHome,
  cilChatBubble,
  cilGroup,
  cilInbox,
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

const _nav = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilHome} customClassName="nav-icon" />,
    badge: {
      color: 'info',
      text: 'NEW',
    },
  },
  {
    component: CNavTitle,
    name: 'Inbox',
  },
  {
    component: CNavGroup,
    name: 'Inbox',
    to: '/base',
    icon: <CIcon icon={cilInbox} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Chats',
        to: '/base/Chats',
        icon: <CIcon icon={cilChatBubble} customClassName="nav-icon" />,
      },
    ],
  },
  {
    component: CNavTitle,
    name: 'Administration',
  },
  {
    component: CNavItem,
    name: 'Overview',
    to: '/administration/overview',
    icon: <CIcon icon={cilDescription} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Channels',
    to: '/administration/chat-widget',
    icon: <CIcon icon={cilListRich} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Settings',
    to: '/administration/Trigger',
    icon: <CIcon icon={cilSettings} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'User Management',
    to: '/administration/property-members',
    icon: <CIcon icon={cilGroup} customClassName="nav-icon" />,
  },
]

export default _nav

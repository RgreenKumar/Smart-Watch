import React from 'react'
import AdministrationLayout from './layout/AdministrationLayout'
const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const ProfileForm = React.lazy(() => import('./views/property/widgets/WidgetBody'))
const Channels = React.lazy(() => import('./views/property/widgets/MainWidget'))
// const Compose = React.lazy(() => import('./views/base/Compose'))
const Tickets = React.lazy(() => import('./views/base/Tickets'))
const Chats = React.lazy(() => import('./views/Chats/Chats'))
// const Overview = React.lazy(() => import('./views/Overview/Overview'))

const routes = [
  // { path: '/', exact: true, name: 'Home' },
  // { path: '/base/Compose', name: 'Compose', element: Compose },
  { path: '/base/Tickets', name: 'Tickets', element: Tickets },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/base/Chats', name: 'Chats', element: Chats },
  { path: '/base/Channels', name: 'Channels', element: Channels },
  { path: '/administration/:section', name: 'Administration', element: AdministrationLayout },
  { path: '/profile', name: 'Profile', element: ProfileForm }
]

export default routes
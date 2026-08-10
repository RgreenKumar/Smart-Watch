import React from 'react'
import { Navigate } from 'react-router-dom'

const ProtectedRoute = ({ children }) => {
  const token = sessionStorage.getItem('token')
  const isAuthenticated = !!token

  return isAuthenticated ? children : <Navigate to="/login" />
}

export default ProtectedRoute

// import React, { useState, useEffect } from 'react'
// import { Navigate } from 'react-router-dom'
// import axios from 'axios'

// const ProtectedRoute = ({ children }) => {
//   const token = sessionStorage.getItem('token')
//   const isAuthenticated = !!token
//   const [isAdminPresent, setIsAdminPresent] = useState(null) // null = loading

//   useEffect(() => {
//     fetchAdmin()
//   }, [])

//   const fetchAdmin = async () => {
//     try {
//       const response = await axios.get('http://localhost:8080/chatbot/check-admin-exists')
//       setIsAdminPresent(response.data) // true or false
//     } catch (error) {
//       console.error('Error fetching admins:', error)
//       setIsAdminPresent(false)
//     }
//   }

//   // Wait until the admin presence check is done
//   if (isAdminPresent === null) {
//     return <div>Loading...</div>
//   }

//   // If no admin exists, go to register screen
//   if (!isAdminPresent) {
//     return <Navigate to="/register" replace />
//   }

//   // If admin exists but user is not authenticated
//   if (!isAuthenticated) {
//     return <Navigate to="/login" replace />
//   }

//   // Admin exists and user is authenticated
//   return children
// }

// export default ProtectedRoute


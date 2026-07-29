import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminRouteGuard = ({ element }) => {
  const initialSignupStatus = sessionStorage.getItem('initialsignup');

  if (initialSignupStatus === 'true') {
    // Admin exists; navigate to the admin page
    return <Navigate to="/admin" />;
  } else if (initialSignupStatus === 'false') {
    return element;
  } else if (initialSignupStatus === 'error') {
    return <Navigate to="/admin" />;
  }

  // Default: Show loading or fallback UI
  return <div>Loading...</div>;
};

export default AdminRouteGuard;

// PrivateRoute.js
import React from 'react';
import { Route, Navigate } from 'react-router-dom';

const PrivateRoute = ({ element, isAuthenticated, ...rest }) => 
{
  return  isAuthenticated ? element : <Navigate to="/admin" />;
};

export default PrivateRoute;

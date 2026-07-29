import React from 'react';
import { Navigate } from 'react-router-dom';

const UserPrivateRouter = ({ element, isAuthenticated }) => {
  const initial = sessionStorage.getItem('initialsignup');
  console.log(initial);
  
  if (initial === "false") {
    return <Navigate to="/AdminSignin" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/UserLogin" />;
  }

  return element;
};

export default UserPrivateRouter;



// import React from 'react'
// import { Route, Navigate } from 'react-router-dom';

// const UserPrivateRouter = ({ element, isAuthenticated, ...rest }) => {

    
    
  
//     return  isAuthenticated==="true" ? element : <Navigate to="/UserLogin" />;
  
// }

// export default UserPrivateRouter
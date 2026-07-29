import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './sidebar';
import Navbar from './navbar';

const AdminLayout = () => {
  const [activeLink, setActiveLink] = useState(localStorage.getItem('activeLink') || '/admin/Dashboard');

  useEffect(() => {
    localStorage.setItem('activeLink', activeLink);
  }, [activeLink]);

  return (
    <div id="content-wrapper"  className="d-flex flex-column samp" style={{ marginLeft: '13rem' }}>
      <Sidebar activeLink={activeLink} setActiveLink={setActiveLink} />
      
      <Navbar />
        <div className="container-fluid ">
          <Outlet />
        </div>
      </div>

  );
};

export default AdminLayout;

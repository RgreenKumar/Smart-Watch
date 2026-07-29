import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// import '../App.css';
import Navbar from './navbar';
import Sidebar from './sidebar';
import axios from 'axios';


const Setting = () => {
  
  return (

    <ul className='breadcrumb-item' style={{paddingLeft: '0px',backgroundColor:'beige'}}>
    {/* <li className="breadcrumb-item" > */}
  <Link className="nav-link text-info" to="/admin/SiteSetting" style={{paddingLeft: '8px'}}>
      {/* <i className="fas fa-tachometer-alt"></i> */}
    <span> Site Settings</span>
  </Link>
  <Link className="nav-link text-info" to="/admin/Video_Setting"  style={{paddingLeft: '8px'}}>
      {/* <i className="fas fa-tachometer-alt"></i> */}
    <span>Video Settings</span>
  </Link>
  <Link className="nav-link text-info" to="/admin/Social_setting"  style={{paddingLeft: '8px'}}>
      {/* <i className="fas fa-tachometer-alt"></i> */}
    <span>Social Settings</span>
  </Link>
  <Link className="nav-link text-info" to="/admin/Payment_setting"  style={{paddingLeft: '8px'}}>
      {/* <i className="fas fa-tachometer-alt"></i> */}
    <span>Payment Settings</span>
  </Link>
  <Link className="nav-link text-info" to="/admin/Email_setting"  style={{paddingLeft: '8px'}}>
      {/* <i className="fas fa-tachometer-alt"></i> */}
    <span>Email Settings</span>
  </Link>
  <Link className="nav-link text-info" to="/admin/Siteurl_setting"  style={{paddingLeft: '8px'}}>
      {/* <i className="fas fa-tachometer-alt"></i> */}
    <span>Company Site Url's</span>
  </Link>
  <Link className="nav-link text-info" to="/admin/_setting"  style={{paddingLeft: '8px'}}>
      {/* <i className="fas fa-tachometer-alt"></i> */}
    <span> Mobile Settings</span>
  </Link>
  <Link className="nav-link text-info" to="/admin/SEO_setting"  style={{paddingLeft: '8px'}}>
      {/* <i className="fas fa-tachometer-alt"></i> */}
    <span> SEO Settings</span>
  </Link>
  <Link className="nav-link text-info" to="/admin/Contact_setting"  style={{paddingLeft: '8px'}}>
      {/* <i className="fas fa-tachometer-alt"></i> */}
    <span> Contact Settings</span>
  </Link>
  <Link className="nav-link text-info" to="/admin/Other_setting"  style={{paddingLeft: '8px'}}>
      {/* <i className="fas fa-tachometer-alt"></i> */}
    <span> Other Settings</span>
  </Link>

    </ul>
  );
};

export default Setting;

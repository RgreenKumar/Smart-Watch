import React from 'react';
// import '../App.css';
import { Link } from 'react-router-dom';
// import Navbar from './navbar';


const Admin_Sidebar = () => {
  const name=sessionStorage.getItem('username');
  const b=3;
  // alert(name);
  return (
    
    <ul className="navbar-nav  sidebar sidebar-dark accordion" id="content-wrapper">
     
      <div className="sb-sidenav-menu-heading bg-primary text-white text-center">
        <div className="sidebar-brand-text mx-3">Menu </div>
      </div>
      <li className="nav-item ">
      <Link className="nav-link text-white" to="/Dashboard">
          <i className="fas fa-tachometer-alt"></i>
        <span> Dashboard</span>
      </Link>
  </li> 
      {
      name=="admin" ?<li className="nav-item ">
      <Link className="nav-link text-white" to="AddUser">
          <i className="fas fa-tachometer-alt"></i>
        <span>User</span>
      </Link>
  </li> 
    : 
    <li className="nav-item ">
    </li>   
    }
    
      <li className="nav-item">
          <Link className="nav-link text-white" to="/Profile">
              <i className="fas fa-user"></i>
            <span> Profile</span>
          </Link>
      </li>
      <div className="sb-sidenav-menu-heading bg-primary text-white text-center">
        <div className="sidebar-brand-text mx-3">Video</div>
      </div>
      <li className="nav-item">
          <Link className="nav-link text-white" to="/Video">
              <i className="fas fa-video"></i>
            <span> Video</span>
          </Link>
      </li>  
      <li className="nav-item">
          <Link className="nav-link text-white" to="/AddVideo">
              <i className="fas fa-upload"></i>
            <span> Add Video</span>
          </Link>
      </li>
      <div className="sb-sidenav-menu-heading bg-primary text-white text-center">
        <div className="sidebar-brand-text mx-3">Audio</div>
      </div>
      <li className="nav-item">
          <Link className="nav-link text-white" to="/Audio">
              <i className="fas fa-music"></i>
            <span> Audio</span>
          </Link>
      </li>
      <li className="nav-item">
          <Link className="nav-link text-white" to="/AddAudio">
              <i className="fas fa-upload"></i>
            <span> Add Audio</span>
          </Link>
      </li>
      {/* <div className="sb-sidenav-menu-heading bg-primary text-white text-center">
        <div className="sidebar-brand-text mx-3">Photo</div>
      </div> */}
      {/* <li className="nav-item">
          <Link className="nav-link text-white" to="/Photo">
              <i className="fas fa-photo-video"></i>
            <span> Photo</span>
          </Link>
      </li> */}
      {/* <li className="nav-item">
          <Link className="nav-link text-white" to="/AddPhoto">
              <i className="fas fa-upload"></i>
            <span> Add Photo</span>
          </Link>
      </li> */}
      <div className="sb-sidenav-menu-heading bg-primary text-white text-center">
        <div className="sidebar-brand-text mx-3">Category</div>
      </div>
      <li className="nav-item">
          <Link className="nav-link text-white" to="/AddCategory">
              <i className="fas fa-photo-video"></i>
            <span> Add Category</span>
          </Link>
      </li>
      <li className="nav-item">
          <Link className="nav-link text-white" to="/ViewCategory">
              <i className="fas fa-upload"></i>
            <span> View Category</span>
          </Link>
      </li>
      {/* <div className="sb-sidenav-menu-heading bg-primary text-white text-center">
        <div className="sidebar-brand-text mx-3">CastCrew</div>
      </div>
      <li className="nav-item">
          <Link className="nav-link text-white" to="/AddTag">
              <i className="fas fa-photo-video"></i>
            <span> Add Category</span>
          </Link>
      </li>
      <li className="nav-item">
          <Link className="nav-link text-white" to="/ViewTag">
              <i className="fas fa-upload"></i>
            <span> View Category</span>
          </Link>
      </li> */}
      <div className="sb-sidenav-menu-heading bg-primary text-white text-center">
        <div className="sidebar-brand-text mx-3">Cast & Crew</div>
      </div>
      <li className="nav-item">
          <Link className="nav-link text-white" to="/AddCastCrew">
              <i className="fas fa-photo-video"></i>
            <span> Add Cast & Crew</span>
          </Link>
      </li>
      <li className="nav-item">
          <Link className="nav-link text-white" to="#">
              <i className="fas fa-upload"></i>
            <span> View Cast & Crew</span>
          </Link>
      </li>
      <div className="sb-sidenav-menu-heading bg-primary text-white text-center">
        <div className="sidebar-brand-text mx-3">Payments</div>
      </div>
      <li className="nav-item">
          <Link className="nav-link text-white" to="/SubscriptionPayments">
              <i className="fas fa-photo-video"></i>
            <span> Subscription Payments</span>
          </Link>
      </li>
      <div className="sb-sidenav-menu-heading bg-primary text-white text-center">
        <div className="sidebar-brand-text mx-3">Settings</div>
      </div>
      <li className="nav-item">
          <Link className="nav-link text-white" to="/Setting">
              <i className="fas fa-photo-video"></i>
            <span> Settings</span>
          </Link>
      </li>
      
    </ul>

  
    
  );
};

export default Admin_Sidebar;

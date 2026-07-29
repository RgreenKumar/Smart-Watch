import Swal from 'sweetalert2';
import API_URL from '../Config';
import React, { useState,useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Notification from '../Notification';
import axios from 'axios';
import notificationIcon from '../admin/icon/notification.png'
// import userImage from '../admin/icon/samantha.png'


const Navbar = () => {
const [isopen,setisopen]=useState(false);
const [dropdownOpen, setDropdownOpen] = useState(false);
const navigate = useNavigate();
const [isActive, setIsActive] = useState(false);
const[count,setcount]=useState(0);
const [userImage, setUserImage] = useState(null);


  const toggleSidebar = () => {
    setIsActive(!isActive);
  };

  const token = sessionStorage.getItem("tokenn");
  // console.log("token", token);

  const handleLogout = async () => {
    try {
      // Ensure you're getting the correct token key
      const token = sessionStorage.getItem("tokenn");
  
      if (!token) {
        // console.error("Token not found");
        return;
      }
  
      const confirmLogout = await Swal.fire({
        title: "Are you sure?",
        text: "You are about to logout.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#FBC740",
        cancelButtonColor: "#FBC740",
        confirmButtonText: "Yes, logout",
        cancelButtonText: "Cancel",
      });
  
      if (confirmLogout.isConfirmed) {
        const response = await fetch(`${API_URL}/api/v2/logout/admin`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`, // Assuming Bearer token authentication
            "Content-Type": "application/json",
          },
        });
  
        if (response.ok) {
          // Clear session and local storage
          sessionStorage.removeItem("tokenn");
          sessionStorage.removeItem("adminId");
          sessionStorage.removeItem("username");
          localStorage.clear();
          sessionStorage.setItem('name', false);
  
          // Redirect to the admin page
          navigate('/admin');
          // console.log("Logged out successfully");
        } else {
          // console.error("Logout failed. Server responded with status:", response.status);
          // Swal.fire({
          //   icon: 'error',
          //   title: 'Logout failed',
          //   text: 'Please try again later.',
          // });
        }
      }
    } catch (error) {
      console.error("An error occurred during logout:", error);
      // throw error;
      // Swal.fire({
      //   icon: 'error',
      //   title: 'Error',
      //   text: 'An error occurred while logging out. Please try again later.',
      // });
    }
  };
  
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/v2/unreadCount`, {
        headers: {
          Authorization: token,
        },
      });
  
      if (response.status === 200) {
        const data = response.data;
        setcount(data);
        // console.log("count",data)
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
      // throw error;
    }
  };

  const handlemarkallasRead = async () => {
    try {
        const markread = await axios.post(`${API_URL}/api/v2/markAllAsRead`, {}, {
            headers: {
                Authorization: token,
            },
        });
        
        if (markread.status === 200) {
            fetchUnreadCount();
        }
    } catch (error) {
        console.error("Error marking all notifications as read:", error);
        // throw error;
    }
};


  useEffect(() => {
  
  
  
    // Fetch initially
    fetchUnreadCount();
  
    // Cleanup for interval
  }, [count]); 

  


  return (
       <nav className="sb-topnav custom-navbar custom-expand navbar-dark logo" style={{ backgroundColor: '#d2d0d0'}} >
    <a className="navbar-brand ps-3" href="./Dashboard.js" style={{ margin: '0px', padding: '0px'   }}></a>
    <button className="btn btn-link btn-sm order-1 order-lg-0 me-4 me-lg-0" id="sidebarToggle" href="#!" onClick={toggleSidebar}>
      <i className="fas fa-bars"></i>
    </button>

   

{/* <div class="row height d-flex justify-content-center align-items-center">

  <div class="col-md-6">

    <div class="form">
      <i class="fa fa-search"></i>
      <input type="text" class="form-control form-input" placeholder="Search..." />
    </div>
    
  </div>
  
</div> */}


<div className="notification-icon ">
  <button className="notification-button"  type="button">
    <a onClick={() => { setisopen(!isopen); }} href="#">
      <img src={notificationIcon} alt='notification Icon' style={{width:'24px',height:'24px'}} />
    </a>
    {count > 0 && (
      <span className="notification-count position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
        {count}
      </span>
    )}
  </button>
</div>


        
<ul className="navbar-nav ms-auto ms-md-0 me-3 me-lg-4" >
            <li className={`nav-item dropdown ${dropdownOpen ? 'show' : ''}`}>
                <a>
                    {userImage ? (
                        <img
                            src={userImage}
                            alt="User"
                            className="adminprofile"
                            onClick={toggleDropdown}
                            aria-expanded={dropdownOpen}
                        />
                    ) : (
                        <i className="fas fa-user fa-fw adminprofile adminfafauser"
                        onClick={toggleDropdown}
                        aria-expanded={dropdownOpen}></i>
                    )}
                </a>
                <ul
                    className={`dropdown-menu dropdown-menu-end ${dropdownOpen ? 'show' : ''}`}
                    aria-labelledby="navbarDropdown"
                >
                    <li>
                        <a className="dropdown-item" href="change-password.php">
                            Change Password
                        </a>
                    </li>
                    <li>
                        <button
                            className="dropdown-item"
                            onClick={handleLogout}
                            style={{ cursor: 'pointer' }}
                        >
                            Logout
                        </button>
                    </li>
                </ul>
            </li>
        </ul>
    
    {isopen && <div>
        <Notification setisopen={setisopen} isopen={isopen} setcount={setcount} handlemarkallasRead={handlemarkallasRead}/>
      
    </div>}
  </nav> 

  

  );
};

export default Navbar;

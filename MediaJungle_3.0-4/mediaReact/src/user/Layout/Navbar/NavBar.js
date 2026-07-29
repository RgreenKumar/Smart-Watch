import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FaHeart, FaSearch, FaBell, FaBars, FaUser } from 'react-icons/fa';
import { CgUser } from 'react-icons/cg';
import { useNavigate } from 'react-router-dom';
import API_URL from '../../../Config';
import Swal from 'sweetalert2';
import axios from 'axios';
import UserNotification from '../../Screens/UserNotification';
import { LazyLoadImage } from 'react-lazy-load-image-component';
// import 'react-lazy-load-image-component/src/effects/blur.css';

const NavBar = () => {
    const hover = 'hover:text-subMain transitions text-white';
    const Hover = ({ isActive }) => (isActive ? 'text-subMain' : hover);
    const navigate = useNavigate();
    const [count, setcount] = useState(0);
    const [isopen, setisopen] = useState(false);
    const [user, setUser] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [getall, setGetAll] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [menuOpen, setMenuOpen] = useState(false);
    const currentDate = new Date();
    const jwtToken = sessionStorage.getItem("token");
    const userId = Number(sessionStorage.getItem("userId"));

    const token = sessionStorage.getItem("token");

    useEffect(() => {
        if (!jwtToken) {
            setLoading(false); 
            return;
        }

        fetch(`${API_URL}/api/v2/GetUserById/${userId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch user');
                }
                return response.json();
            })
            .then(data => {
                setUser(data);
                setLoading(false);
            })
            .catch(error => {
                // ✅ FIX 3: Removed "throw error" — error already handled via setError()
                console.error('Error fetching user:', error);
                setError(error.message);
                setLoading(false);
            });
    }, [jwtToken, userId]);

    useEffect(() => {
        fetch(`${API_URL}/api/v2/GetsiteSettings`)
          .then(response => {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            return response.json();
          })
          .then(data => {
            setGetAll(data);
          })
          .catch(error => {
            // ✅ FIX 4: Removed "throw error" — unhandled rejection crashed the page
            console.error('Error fetching data:', error);
          });
    }, []);

    const handleprofile = () => {
        navigate('/UserProfileScreen');
    };

    const handleRenew = () => {
        Swal.fire({
            title: 'Confirm Renewal',
            text: 'Are you sure you want to renew your subscription?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#FBC740',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, renew it!',
            cancelButtonText: 'Cancel',
        }).then((result) => {
            if (result.isConfirmed) {
                navigate('/PlanDetails'); 
            }
        });
    };

    const handleLogout = async () => {
        try {
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
                const response = await fetch(`${API_URL}/api/v2/logout`, {
                    method: "POST",
                    headers: {
                        Authorization: token,
                        "Content-Type": "application/json",
                    },
                });
    
                if (response.ok) {
                    sessionStorage.clear();
                    localStorage.clear();
                    window.location.href = "/UserLogin";
                // } else {
                //     Swal.fire({
                //         icon: 'error',
                //         title: 'Logout failed',
                //         text: 'Please try again later.',
                //     });
                }
            }
        } catch (error) {
            // ✅ FIX 5: Removed "throw error" and uncommented Swal error alert
            console.error('Logout error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'An error occurred while logging out. Please try again later.',
            });
        }
    };

    const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
    };

    
  const handlemarkallasRead = async () => {
  };

    const fetchUnreadCount = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/v2/unreadCountuser`, {
                headers: {
                    Authorization: token,
                },
            });
            if (response.status === 200) {
                setcount(response.data);
            }
        } catch (error) {
            // ✅ FIX 6: Removed "throw error" — unhandled rejection crashed the page
            console.error("Error fetching unread count:", error);
        }
    };

    useEffect(() => { 
        // ✅ FIX 7: Removed "count" from the dependency array.
        // Having "count" here caused an infinite loop:
        // fetchUnreadCount → setcount(n) → count changes → effect re-runs → repeat forever.
        // The fetch only needs to run once on mount (when token is available).
        if (token) {
            fetchUnreadCount();
        }
    }, []);

    const isFreshUser = !user || !user.paymentId || !user.paymentId.expiryDate;
    const expiryDate = user?.paymentId?.expiryDate ? new Date(user.paymentId.expiryDate) : null;
    const isExpired = expiryDate ? expiryDate < currentDate : false;

    return (
      <>
      {/* Navbar Wrapper */}
      <div className="bg-custom-color shadow-md sticky top-0 z-20 w-full transition-all duration-300 ease-out h-20">
          <div className="con5 mx-auto px-4 lg:px-6 flex justify-between items-center h-20 lg:h-25">
              {/* Logo Section */}
              <div className="flex items-center">
                  {getall.length > 0 && getall[0].logo ? (
                      <Link to="/">
                          <img
                              src={`data:image/png;base64,${getall[0].logo}`}
                              alt="logo"
                              loading="lazy"
                              className="h-20 lg:h-20 w-auto object-contain "
                          />
                      </Link>
                  ) : null}
              </div>
               {/* Search Bar - Only visible on Desktop */}
              <div className="hidden lg:flex flex-grow justify-center">
                  <form className="w-full max-w-md bg-gray-100 rounded flex items-center">
                      <button type="submit" className="p-2 text-gray-600">
                          <FaSearch />
                      </button>
                      <input
                          type="text"
                          placeholder="Search..."
                          className="w-full px-2 py-2 text-gray-700 bg-transparent outline-none"
                      />
                      </form>
                      </div>

                         {/* Center Menu (for Desktop) */}
              <div className="hidden lg:flex gap-8 flex-grow justify-center space-x-6">
                  <NavLink to="/" className={Hover}>Movies</NavLink>
                  <NavLink to="/AudioHomeScreen" className={Hover}>Music</NavLink>
                  <NavLink to="/libraryScreen" className={Hover}>Library</NavLink>
              </div>
              
           

              {/* Search Bar - Always Visible on Mobile */}
              <div className="flex-grow flex justify-center lg:hidden">
                  <form className="w-full max-w-md bg-gray-100 rounded flex items-center">
                      <button type="submit" className="p-2 text-gray-600">
                          <FaSearch />
                      </button>
                      <input
                          type="text"
                          placeholder="Search..."
                          className="w-full px-2 py-2 text-gray-700 bg-transparent outline-none"
                      />
                  </form>
              </div>


            {/* Notification and Profile Icons */}
<div className="flex items-center gap-4 lg:gap-8">
    {/* Subscription / Renewal Button */}
    {isFreshUser ? (
    <NavLink
        to="/PlanDetails"
        className="bg-new hover:bg-red-900 text-white py-2 px-4 rounded-lg transition duration-300 ease-in-out hidden lg:block"
    >
        SUBSCRIBE
    </NavLink>
) : isExpired ? (
    <button
        onClick={handleRenew}
        className="bg-new hover:bg-red-900 text-white py-2 px-4 rounded-lg transition duration-300 ease-in-out hidden lg:block"
    >
        RENEW
    </button>
) : null}
                  {/* Notification Icon */}
                  <div className="relative cursor-pointer" onClick={() => { setisopen(!isopen); }}>
                      {count > 0 && (
                          <span className="absolute -top-2 -right-3 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                              {count}
                          </span>
                      )}
                      <FaBell className="w-6 h-6 text-white hover:text-red-900 transition duration-300 ease-in-out" />
                  </div>
                  {/* Profile Icon */}
                  {token ? (
                      <div className="relative">
                          <div className="flex items-center gap-2" onClick={toggleDropdown}>
                              <CgUser className="w-8 h-8" />
                          </div>
                          {showDropdown && (
                              <div className="absolute right-0 mt-2 bg-red-600 rounded shadow-lg">
                                  <button className="block w-full py-2 px-4 text-left text-white" onClick={handleprofile}>Profile</button>
                                  <button className="block w-full py-2 px-4 text-left text-white" onClick={handleLogout}>Logout</button>
                              </div>
                          )}
                      </div>
                  ) : (
                      <NavLink to="/UserLogin" className={hover}><FaUser /></NavLink>
                  )}
              </div>
               {/* Burger Icon for Mobile */}
   <div className="lg:hidden flex items-left">
                  <button
                      onClick={() => setMenuOpen(!menuOpen)}
                      className="text-white text-2xl focus:outline-none"
                  >
                      <FaBars />
                  </button>
              </div>
          </div>
  
          {/* Mobile Menu Items - Toggle Visibility */}
          {menuOpen && (
              <div className="lg:hidden bg-custom-color w-full absolute top-16 left-0 z-10 transition-all duration-300 ease-out">
                  <div className="flex flex-col items-center py-4 space-y-4">
                      <NavLink to="/" className={Hover}>Movies</NavLink>
                      <NavLink to="/AudioHomeScreen" className={Hover}>Music</NavLink>
                      <NavLink to="/libraryScreen" className={Hover}>Library</NavLink>
                      {isFreshUser ? (
                          <NavLink to="/PlanDetails" className="bg-new hover:bg-red-900 text-white py-2 px-4 rounded-lg transition duration-300 ease-in-out">SUBSCRIBE</NavLink>
                      ) : isExpired ? (
                          <NavLink to="/PlanDetails" className="bg-new hover:bg-red-900 text-white py-2 px-4 rounded-lg transition duration-300 ease-in-out" onClick={handleRenew}>RENEW</NavLink>
                      ) : null}
                  </div>
              </div>
          )}
      </div>

      {/* Notifications Modal */}
      {isopen && (
          <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-50 flex justify-center items-center">
             <UserNotification setisopen={setisopen} isopen={isopen} setcount={setcount} handlemarkallasRead={handlemarkallasRead}/>
          </div>
      )}
  </>
      );
};

export default NavBar;
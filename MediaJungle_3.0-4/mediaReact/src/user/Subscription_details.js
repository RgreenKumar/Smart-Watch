import React, { useEffect, useState } from 'react'
import Usersidebar from './usersidebar'
import Footer from './Footer'
import Layout from './Layout/Layout'
import API_URL from '../Config';
import { FaBell, FaKey, FaPen, FaUserEdit } from 'react-icons/fa';
import { Link, NavLink } from 'react-router-dom';
import { FiLogIn } from 'react-icons/fi';

function Subscription_details() {
  const name = sessionStorage.getItem("name");
  const jwtToken = sessionStorage.getItem("token");
  const userId = Number(sessionStorage.getItem("userId")); // Convert to number

  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [getall, setGetAll] = useState('');
  const [planDetails, setPlanDetails] = useState(null); // Define state for plan details
  // Check if subscription has expired
  const currentDate = new Date();
  const expiryDate = new Date(user?.paymentId?.expiryDate);
  const isExpired =expiryDate < currentDate;

  useEffect(() => {
      if (!jwtToken) {
          setLoading(false); // If no token, don't make the fetch request
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
              console.log(data);
              setLoading(false);
          })
          .catch(error => {
              setError(error.message);
              setLoading(false);
    throw error;

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
              console.log(data);
          })
          .catch(error => {
              console.error('Error fetching data:', error);
    throw error;

          });
  }, []);

  if (loading) {
      return <div>Loading...</div>;
  }

  if (error) {
      return <div>Error: {error}</div>;
  }

  return (
    <Layout className='container mx-auto min-h-screen overflow-y-auto'>
        <div> {jwtToken && user ? <h1  className='ml-4 text-xl font-medium text-white' >Welcome    {user.username}      !!</h1> : "Welcome User"}</div>
    <div className='banner-container px-10 my-24 flex flex-col items-left' >
      
 
        {/* Separate div for User Information */}
        <div>
        {jwtToken && user ? (
                    <>
                        <div className="mb-6">
                            <label className="flex text-yellow-600 text-lg font-medium">
                                <span className="ml-4 text-lg font-medium text-gray-500">  Subscription Plan: {user.paymentId ? user.paymentId.subscriptionTitle : 'Free'}</span>
                            </label>
                        </div>
                        <div className="mb-6">
                            <label className="flex text-yellow-600 text-lg font-medium mb-2">
                                <span className="ml-4 text-lg font-medium text-gray-500">Expiry Date: {user.paymentId ? user.paymentId.expiryDate : 'N/A'}</span>
                            </label>
                        </div>
                         {/* Display message if subscription has expired */}
              {isExpired && (
                <div className="mb-4 text-red-500 text-lg">
                  Your subscription has expired. Please renew your subscription.
                </div>
              )}
  {isExpired && (
              <div className="flex justify-center">
                <NavLink
                  to='/PlanDetails'
                  className='bg-red-500 text-white p-2 rounded-lg text-sm hover:bg-red-800'
                >
                  Get Subscription
                </NavLink>
              </div>)}
            </>
          ) : (
            <NavLink to='/UserLogin' className='bg-subMain transitions hover:bg-main flex-rows gap-4 text-white p-4 rounded-lg w-full text-center'>
              <FiLogIn /> Sign In
            </NavLink>
          )} 
            </div>
        </div>
    </Layout>
  )
}

export default Subscription_details
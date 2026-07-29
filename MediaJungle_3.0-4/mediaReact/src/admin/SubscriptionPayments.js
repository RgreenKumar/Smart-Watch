import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import "../css/Sidebar.css";
import API_URL from '../Config';

const SubscriptionPayments = () => {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  // Function to handle navigation to Payment History page
  const handleNavigate = (userId, userName) => {
    // Use absolute path to ensure correct navigation
    navigate(`/admin/paymentHistory/${userId}`, { state: { userName, userId } });
  };
  useEffect(() => {
    // Fetch user data from the backend
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/v2/GetAllUsers`);
        setUsers(response.data);
      } catch (error) {
        console.log('Error fetching users:', error);
        throw error;
      }
    };

    fetchUsers();
  }, []);

  const handleDeleteUser = async (userId) => {
    const confirmDelete = window.confirm('Do you really want to delete this user?');
    if (confirmDelete) {
      try {
        const response = await axios.delete(`${API_URL}/api/v2/DeleteUser/${userId}`);
        if (response.status === 200) {
          console.log('User deleted successfully');
          // Remove the deleted user from the local state
          setUsers(users.filter((user) => user.id !== userId));
        } else {
          console.log('Error deleting user');
        }
      } catch (error) {
        console.log('Error deleting user:', error);
        throw error;
      }
    }
  };

  return (
    
    <div className='container3 mt-10'>
          <ol className="breadcrumb mb-4 d-flex my-0">
             <li className="breadcrumb-item text-white">
            <Link to="/admin/SubscriptionPayments">Manage Users</Link>
          </li>
          <li className="ms-auto text-end text-white">
        Bulk Action
        <button className="ms-2">
          <i className="bi bi-chevron-down"></i>
        </button>
      </li>
          </ol>
          <div class="outer-container">
          <div className="table-container">
      <table className="table table-striped ">
        <thead>
          <tr className='table-header'>
            <th style={{border: 'none' }}>
              <input type="checkbox" />
            </th>
                  <th style={{border: 'none' }}>ID</th>
                  <th style={{border: 'none' }}>User Name</th>
                  <th style={{border: 'none' }}>Mobile Number</th>
                  <th style={{border: 'none' }}>Email</th>
                  <th style={{border: 'none' }}>Payment History</th>
                </tr>
              </thead>
              <tbody>
                {users && users.length > 0 ? (
                  users.map((user, index) => (
                    <tr key={user.id} className={index % 2 === 0 ? 'even-row' : 'odd-row'}>
                      <td>
                <input type="checkbox" />
              </td>
                      <td>{index + 1}</td>
                      <td>{user.username}</td>
                      <td>{user.mobnum}</td>
                      <td>{user.email}</td>
 <td>       
                      <button onClick={() => handleNavigate(user.id, user.username)}>
                        View Payment History
                      </button>
                    </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5">No users found</td>
                  </tr>
                )}
              </tbody>

            </table>
          </div>
        </div>
      </div>
    
   
  );
};

export default SubscriptionPayments;


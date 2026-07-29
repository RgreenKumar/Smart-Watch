import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import API_URL from '../Config';

const Profile = () => {
  // ---------------------Admin functions -------------------------------
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();
  const token = sessionStorage.getItem("tokenn");
  const role = sessionStorage.getItem("role");
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showBulkOptions, setShowBulkOptions] = useState(false);

  const toggleBulkOptions = () => {
    setShowBulkOptions(prevState => !prevState);
  };

  // Handle the "select all" checkbox click
  const handleSelectAll = (e) => {
    const checked = e.target.checked;
    setSelectAll(checked);

    if (checked) {
      // Select all user IDs
      const allIds = users.map((user) => user.id);
      setSelectedIds(allIds);
    } else {
      // Deselect all
      setSelectedIds([]);
    }
  };

  
  // Handle individual checkbox click
  const handleCheckboxChange = (id) => {
    setSelectedIds((prevSelectedIds) =>
      prevSelectedIds.includes(id)
        ? prevSelectedIds.filter((userId) => userId !== id) // Deselect
        : [...prevSelectedIds, id] // Select
    );
  };

  console.log("selectedIds",selectedIds);
  useEffect(() => {

    // Fetch user data from the backend
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/v2/GetAllUser`);
        setUsers(response.data.userList);
        console.log(response.data.userList)
      } catch (error) {
        console.log('Error fetching users:', error);
        throw error;
      }
    };

       fetchUsers();
        }, []);
        



        const handleDeleteUser = (userId) => {
          Swal.fire({
            title: 'Are you sure?',
            text: 'Do you really want to delete this user?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, keep it',
          }).then(async (result) => {
            if (result.isConfirmed) {
              console.log(`Deleting user with ID: ${userId}`);
        
              try {
                // Check if token is available
                if (!token) {
                  throw new Error('Authorization token is missing');
                }
        
                // API call to delete the user
                const response = await fetch(`${API_URL}/api/v2/DeleteUser/${userId}`, {
                  method: 'DELETE',
                  headers: {
                    Authorization: token,
                  }
                });
        
                // Handle successful deletion
                if (response.ok) {
                  // Attempt to parse the JSON response
                  const resBody = await response.json().catch(() => null);
        
                  Swal.fire({
                    title: 'Deleted!',
                    text: resBody?.message || 'User deleted successfully!',
                    icon: 'success',
                    confirmButtonText: 'OK',
                  });
        
                  // Update local state to remove the deleted user
                  setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
                } else {
                  // Handle unsuccessful deletion and parse response
                  const resBody = await response.json().catch(() => null);
        
                  // Swal.fire({
                  //   title: 'Error!',
                  //   text: resBody?.message || 'An error occurred while deleting the user.',
                  //   icon: 'error',
                  //   confirmButtonText: 'OK',
                  // });
                }
              } catch (error) {
                console.error('Error deleting user:', error);
                throw error;
                // Swal.fire({
                //   title: 'Error!',
                //   text: error.message || 'An error occurred. Please try again later.',
                //   icon: 'error',
                //   confirmButtonText: 'OK',
                // });
              }
            }
          });
        };
        
        
    const handlEdit = async (userId) => {
      localStorage.setItem('items',userId);
      navigate('/admin/EditComponent');
    };

    const deleteMultipleUsers = (userIds) => {
      fetch(`${API_URL}/api/v2/DeletemultipleAdmins`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token, // Ensure the token is formatted correctly
        },
        body: JSON.stringify(userIds), // Pass the array directly
      })
        .then((response) => {
          if (response.ok) {
            // If there's no content, return a default message
            if (response.status <= 205) {
              return { message: 'Admins deleted successfully' }; // No content response
            }
          } else {
            throw new Error('Network response was not ok.');
          }

        })
        .then((data) => {
          Swal.fire({
            title: 'Deleted!',
            text: data.message || 'Admins deleted successfully!',
            icon: 'success',
            confirmButtonText: 'OK',
            
          });
          // Optionally, refresh the user list or update the state here
           // Update local state to remove the deleted users
      setUsers((prevUsers) => prevUsers.filter((user) => !userIds.includes(user.id)));
        })
        .catch((error) => {
          console.error('Error:', error);
          throw error;
          // Swal.fire({
          //   title: 'Error!',
          //   text: 'An error occurred while deleting the users. Please try again.',
          //   icon: 'error',
          //   confirmButtonText: 'OK',
          // });
        });
    };
    
    
    
  return (

    <div className="marquee-container">
  <div className='AddArea'>
    <Link to="/admin/AddUser">
      <button className='btn btn-custom'>Add SubAdmin</button>
    </Link>
  </div>
  <br/>
  {/* <Sample /> */}
  <div className='container3'>
  <ol className="breadcrumb mb-4 d-flex my-0">
      <li className="breadcrumb-item text-white">Manage SubAdmin</li>
      <li className="ms-auto text-end text-white position-relative">
        Bulk Action
        <button className="ms-2" onClick={toggleBulkOptions}>
          <i className="bi bi-chevron-down"></i>
        </button>
        {showBulkOptions && (
          <div className="bulk-options">
            <button className="btn btn-danger" style={{color:'black'}} onClick={() => deleteMultipleUsers(selectedIds)}>Delete</button>
          </div>
        )}
      </li>
    </ol>
    <div class="outer-container">
    <div className="table-container2">
      <table className="table table-striped ">
        <thead>
          <tr className='table-header'>
            <th style={{border: 'none' }}>
            <input 
              type="checkbox" 
              checked={selectAll} 
              onChange={handleSelectAll} 
            />
            </th>
            <th style={{border: 'none' }}>S.No</th>
            <th style={{border: 'none' }}>User Name</th>
            <th style={{border: 'none' }}>Mobile Number</th>
            <th style={{border: 'none' }}>Address</th>
            <th style={{border: 'none' }}>Pincode</th>
            <th style={{border: 'none' }}>Email</th>
            <th style={{border: 'none' }}>Company Name</th>
            <th style={{border: 'none' }}>Country</th>
            <th style={{border: 'none' }}>Action</th>
          </tr> 
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr key={user.id} className={index % 2 === 0 ? 'even-row' : 'odd-row'}>
              <td>
              <input
                type="checkbox"
                checked={selectedIds.includes(user.id)}
                onChange={() => handleCheckboxChange(user.id)}
              />
              </td>
              <td className="truncate">{index + 1}</td>
              <td className="truncate"  title={user.username}>{user.username.length> 20 ? `${user.username.substring(0, 10)}...` : user.username}</td>
              <td className="truncate" title={user.mobnum}>{user.mobnum.length> 20 ? `${user.mobnum.substring(0, 10)}...` : user.mobnum}</td>
              <td className="truncate" title={user.address}>  {user.address.length > 15 ? `${user.address.substring(0, 10)}...` : user.address}</td>
              <td className="truncate" title={user.pincode}> {user.pincode.length > 10 ? `${user.pincode.substring(0, 10)}...` : user.pincode}</td>
              <td className="truncate" title={user.email}>{user.email.length > 15 ? user.email.substring(0, 10) + "..." : user.email}</td>
              <td className="truncate" title={user.compname}>{user.compname.length > 15 ? user.compname.substring(0, 10) + "..." : user.compname}</td>
              <td className="truncate" title={user.country}>{user.country.length > 15 ? user.country.substring(0, 10) + "..." : user.country}</td>
              <td>
                <button 
                  onClick={() => handlEdit(user.id)} 
                  className={`btn btn-primary me-2 ${role !== "ADMIN" ? "disabled" : ""}`}
                  disabled={role !== "ADMIN"} // Disable for subadmin
                >
                  <i className="fas fa-edit" aria-hidden="true"></i>
                </button>              
                
                <button 
                  onClick={() => handleDeleteUser(user.id)} 
                  className={`btn btn-danger ${role !== "ADMIN" ? "disabled" : ""}`}
                  disabled={role !== "ADMIN"} // Disable for subadmin
                >
                  <i className="fa fa-trash" aria-hidden="true"></i>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
</div>
</div>

      
    
  );
};

export default Profile;
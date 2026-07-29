import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2'
import { useLocation, Link } from 'react-router-dom';
import "../css/Sidebar.css";
import API_URL from '../Config';

function EditComponent() {
  const id=localStorage.getItem('items');
  const profileID=id
  console.log(profileID)
  const [updatedUser, setUpdatedUser] = useState('');
  const [errors, setErrors] = useState({});
  const token = sessionStorage.getItem('tokenn')
  const [showBulkOptions, setShowBulkOptions] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const toggleBulkOptions = () => {
    setShowBulkOptions(prevState => !prevState);
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: undefined,
    }));
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
  const validateForm = () => {
    let isValid = true;
    const newErrors = {};

    // Validate username
    if (!updatedUser.username.trim()) {
      newErrors.username = 'Username is required';
      isValid = false;
    }

    // Validate mobile number
    if (!updatedUser.mobnum.trim()) {
      newErrors.mobnum = 'Mobile number is required';
      isValid = false;
    } else if (!/^\d{10}$/.test(updatedUser.mobnum)) {
      newErrors.mobnum = 'Invalid mobile number';
      isValid = false;
    }

    // Validate address
    if (!updatedUser.address.trim()) {
      newErrors.address = 'Address is required';
      isValid = false;
    }

    // Validate pincode
    if (!updatedUser.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
      isValid = false;
    } else if (!/^\d{6}$/.test(updatedUser.pincode)) {
      newErrors.pincode = 'Invalid pincode';
      isValid = false;
    }

    // Validate email
    if (!updatedUser.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(updatedUser.email)) {
      newErrors.email = 'Invalid email address';
      isValid = false;
    }

    // Validate company name
    if (!updatedUser.compname.trim()) {
      newErrors.compname = 'Company name is required';
      isValid = false;
    }

    // Validate country
    if (!updatedUser.country.trim()) {
      newErrors.country = 'Country is required';
      isValid = false;
    }

    // Validate password
    if (!updatedUser.password.trim()) {
      newErrors.password = 'Password is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  useEffect(() => {
    const fetchUserData = async () => {
        try {
            const response = await fetch(`${API_URL}/api/v2/GetUserId/${profileID}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            console.log(data); // Check the value of data received from the API
            if (data.userList && data.userList.length > 0) {
                setUpdatedUser(data.userList[0]); // Assuming userList is an array containing user objects
            }
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
            throw error;
        }
    };

    fetchUserData();

    // Clean-up function (optional)
    return () => {
        // Perform any clean-up tasks if needed
    };
}, [profileID]); // Dependency array, useEffect will re-run if profileID changes
 



const handleSubmit = (e) => {
  e.preventDefault();
  const userId = id; // Assuming id is defined somewhere
  if (validateForm()) {
    fetch(`${API_URL}/api/v2/UpdateUser/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedUser), // Make sure updatedUser is defined
    })
      .then((response) => {
        if (response.ok) {
          console.log('User updated successfully');
          Swal.fire({
            title: 'Success!',
            text: 'User details successfully updated',
            icon: 'success',
            confirmButtonText: 'OK',
          });
          // Assuming you're using React hooks, update state here
          // Example: setUpdatedUser(data);
        } else {
          console.log('Error updating user');
          // Swal.fire({
          //   title: 'Error!',
          //   text: 'Error updating user',
          //   icon: 'error',
          //   confirmButtonText: 'OK',
          // });
        }
      })
      .catch((error) => {
        console.log('Error updating user:', error);
        throw error;
        // Swal.fire({
        //   title: 'Error!',
        //   text: 'An error occurred while updating user. Please try again.',
        //   icon: 'error',
        //   confirmButtonText: 'OK',
        // });
      });
  }
};
  
  

  return (
    <div className="marquee-container">
    <div className='AddArea'>
      {/* <Link to="/admin/AddUser">
        <button className='btn btn-custom'>Add SubAdmin</button>
      </Link> */}
    </div>
 
    <div className='container3 mt-16'>
    <ol className="breadcrumb mb-4 d-flex my-0">
          <li className="breadcrumb-item"><Link to="/admin/Profile">Sub Admin</Link>
          </li>
            <li className="breadcrumb-item active  text-white">Edit Sub Admin</li>
          </ol>
   
      {/* <li className="ms-auto text-end text-white position-relative">
        Bulk Action
        <button className="ms-2" onClick={toggleBulkOptions}>
          <i className="bi bi-chevron-down"></i>
        </button>
        {showBulkOptions && (
          <div className="bulk-options">
            <button className="btn btn-danger" style={{color:'black'}} onClick={() => deleteMultipleUsers(selectedIds)}>Delete</button>
          </div>
        )}
      </li> */}

    <div class="outer-container">
    <div className="table-container">
              <form onSubmit={handleSubmit}>
                <table className="table">
                  <tbody>
                    <tr>
                      <th>User Name</th>
                      <td>
                        <input
                          type="text"
                          name="username"
                          value={updatedUser.username}
                          onChange={handleChange}
                          className="form-control"
                        />
                        {errors.username && <div className="error">{errors.username}</div>}
                      </td>
                    </tr>
                    <tr>
                      <th>Mobile Number</th>
                      <td>
                        <input
                          type="text"
                          name="mobnum"
                          value={updatedUser.mobnum}
                          onChange={handleChange}
                          className="form-control"
                        />
                        {errors.mobnum && <div className="error">{errors.mobnum}</div>}
                      </td>
                    </tr>
                    <tr>
                      <th>Pincode</th>
                      <td>
                        <input
                          type="text"
                          name="pincode"
                          value={updatedUser.pincode}
                          onChange={handleChange}
                          className="form-control"
                        />
                        {errors.pincode && <div className="error">{errors.pincode}</div>}
                      </td>
                    </tr>
                    <tr>
                      <th>Email</th>
                      <td>
                        <input
                          type="text"
                          name="email"
                          value={updatedUser.email}
                          onChange={handleChange}
                          className="form-control"
                        />
                        {errors.email && <div className="error">{errors.email}</div>}
                      </td>
                    </tr>
                    <tr>
                      <th>Company Name</th>
                      <td>
                        <input
                          type="text"
                          name="compname"
                          value={updatedUser.compname}
                          onChange={handleChange}
                          className="form-control"
                        />
                        {errors.compname && <div className="error">{errors.compname}</div>}
                      </td>
                    </tr>
                    <tr>
                      <th>Country</th>
                      <td>
                        <input
                          type="text"
                          name="country"
                          value={updatedUser.country}
                          onChange={handleChange}
                          className="form-control"
                        />
                        {errors.country && <div className="error">{errors.country}</div>}
                      </td>
                    </tr>
                    {/* <tr>
                      <th>Password</th>
                      <td>
                        <input
                          type="password"
                          name="password"
                          value={updatedUser.password}
                          onChange={handleChange}
                          className="form-control"
                        />
                        {errors.password && <div className="error">{errors.password}</div>}
                      </td>
                    </tr> */}
                    <tr>
  <th>Address</th>
  <td>
    <textarea
      name="address"
      value={updatedUser.address}
      onChange={handleChange}
      className="form-control"
    />
    {errors.address && <div className="error">{errors.address}</div>}
  </td>
</tr>
                  </tbody>
                </table>
                <div className='button-container'>
                <button type="submit" className="btn btn-custom" style={{margin:"20px"}}>
                  Update
                </button>
                </div>
              </form>
            </div>
          </div>
          </div>
        
        /*<div className="col-lg-4">
          <div className="row">
            <div className="col-xl-12 col-md-6 mt-3">
              <div className="card bg-warning text-white mb-4">
              <div className="card-body">
              <h4>Video</h4>
              <div className="card-footer d-flex align-items-center justify-content-between">
                <Link to="/Video" className="small text-white stretched-link">
                  View Details
                </Link>
                <div className="small text-white"><i className="fas fa-angle-right"></i></div>
              </div>
            </div>
              </div>
            </div>
            <div className="col-xl-12 col-md-6 mt-3">
              <div className="card bg-success text-white mb-4">
              <div className="card-body">
              <h4>Audio</h4>
              <div className="card-footer d-flex align-items-center justify-content-between">
                <Link to="/Audio" className="small text-white stretched-link">
                  View Details
                </Link>
                <div className="small text-white"><i className="fas fa-angle-right"></i></div>
              </div>
            </div>
              </div>
            </div>
            <div className="col-xl-12 col-md-6 mt-3">
              <div className="card bg-primary text-white mb-4">
              <div className="card-body">
              <h4>Photo</h4>
              <div className="card-footer d-flex align-items-center justify-content-between">
                <Link to="/Photo" className="small text-white stretched-link">
                  View Details
                </Link>
                <div className="small text-white"><i className="fas fa-angle-right"></i></div>
              </div>
            </div>
              </div>
            </div>
          </div>
        </div>*/
 </div>
  );
}

export default EditComponent;
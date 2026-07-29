import React, { useState } from 'react';
import Navbar from './navbar';
import Sidebar from './sidebar';
import { useLocation, Link } from 'react-router-dom';
import "../css/Sidebar.css";
import API_URL from '../Config';

function EditUserdetails() {
  const location = useLocation();
  const { user } = location.state;
  const [updatedUser, setUpdatedUser] = useState(user);
  const [errors, setErrors] = useState({});
  const token = sessionStorage.getItem('tokenn')

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

  const handleSubmit = (e) => {
    e.preventDefault();
    const userId = user.id;
    if (validateForm()) {
      fetch(`${API_URL}/api/v2/UpdateUser/${userId}`, {  // Use backticks (`) for string interpolation
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedUser),
      })
        .then((response) => {
          if (response.ok) {
            console.log('User updated successfully');
            window.alert('User details successfully updated');
          } else {
            console.log('Error updating user');
          }
        })
        .catch((error) => {
          console.log('Error updating user:', error);
          throw error;
        });
    }
  };
  

  return (
    <div id="content-wrapper" class="d-flex flex-column samp" style={{ marginLeft: "13rem"}}>

    <Sidebar />
    <div className="container-fluid">
    
      

      <h1 className="mt-4 text-white">{updatedUser.username}'s Profile</h1>
      <ol className="breadcrumb mb-4">
        <li className="breadcrumb-item">
          <Link to="/Dashboard">Dashboard</Link>
        </li>
        <li className="breadcrumb-item active">Edit</li>
      </ol>
      <div className="row">
        <div className="col-lg-8">
          <div className="card mb-4">
            <div className="card-body">
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
                    <tr>
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
                    </tr>
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
                <button type="submit" className="btn btn-info">
                  Update
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}

export default EditUserdetails;

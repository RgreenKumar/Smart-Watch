import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import API_URL from '../Config';

import { Link } from 'react-router-dom';
import "../css/Sidebar.css";

const AddUser = () => {
  // const history = useHistory();
  // const navigate = useNavigate();
  const [data, setData] = useState({
    username: '',
    mobnum: '',
    address: '',
    pincode: '',
    confirm_Password: '',
    email: '',
    compname: '',
    country: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const token = sessionStorage.getItem("tokenn")

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {};

    // Validate username
    if (!data.username.trim()) {
      newErrors.username = 'Username is required';
      isValid = false;
    }

    // Validate mobile number
    if (!data.mobnum.trim()) {
      newErrors.mobnum = 'Mobile number is required';
      isValid = false;
    } else if (!/^\d{10}$/.test(data.mobnum)) {
      newErrors.mobnum = 'Invalid mobile number';
      isValid = false;
    }

    // Validate address
    if (!data.address.trim()) {
      newErrors.address = 'Address is required';
      isValid = false;
    }

    // Validate pincode
    if (!data.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
      isValid = false;
    } else if (!/^\d{6}$/.test(data.pincode)) {
      newErrors.pincode = 'Invalid pincode';
      isValid = false;
    }

    // Validate email
    if (!data.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
      newErrors.email = 'Invalid email address';
      isValid = false;
    }

    // Validate company name
    if (!data.compname.trim()) {
      newErrors.compname = 'Company name is required';
      isValid = false;
    }

    // Validate country
    if (!data.country.trim()) {
      newErrors.country = 'Country is required';
      isValid = false;
    }

    // Validate password
    if (!data.password.trim()) {
      newErrors.password = 'Password is required';
      isValid = false;
    }

    if (!data.confirm_Password.trim()) {
      newErrors.confirm_Password = 'Confirm Password is required';
      isValid = false;
    } else if (data.password !== data.confirm_Password) {
      newErrors.confirm_Password = 'Passwords do not match';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const submitForm = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const sendData = {
          username: data.username,
          mobnum: data.mobnum,
          address: data.address,
          confirmPassword:data.confirm_Password,
          pincode: data.pincode,
          email: data.email,
          compname: data.compname,
          country: data.country,
          password: data.password,
          
        };
  
        console.log('Sending data:', sendData);
  
        const response = await axios.post(
          `${API_URL}/api/v2/AddUser`,
          sendData,
          {
            headers: {
              Authorization: token,
            }
          }
        );
        
  
        console.log('API Response:', response);
  
        if (response.status === 200) {
          const message = response.data.message|| 'User registered successfully';
          Swal.fire({
            title: 'Success!',
            text: message,
            icon: 'success',
            confirmButtonText: 'OK'
          });
          setData({
            username: '',
            mobnum: '',
            address: '',
            pincode: '',
            email: '',
            compname: '',
            country: '',
            password: '',
            confirm_Password: ''
          });
          console.log(data)
        }
      } catch (error) {
        console.error('Error:', error);
        throw error;
        // Swal.fire({
        //   title: 'Error!',
        //   text: error.response?.data?.message || 'An error occurred while registering. Please try again.',
        //   icon: 'error',
        //   confirmButtonText: 'OK'
        // });
      }
    }
  };
  
  
  
  return (
    <div className="marquee-container">
    <div className='AddArea'>
      {/* <button className='btn btn-custom' onClick={() => handleClick("/admin/addAudio")}>Add Audio</button> */}
    </div><br/>
    
<div className='container3 mt-10'>
      
          <ol className="breadcrumb mb-4 d-flex my-0">
          <li className="breadcrumb-item"><Link to="/admin/Profile">Sub Admin</Link>
          </li>
            <li className="breadcrumb-item active  text-white">Add Sub Admin</li>
          </ol>
   
          <div className="outer-container">
          <div className="table-container">
      <form onSubmit={submitForm} method="post" className="registration-form">
        <h1 className='text-center' style={{ maxWidth: '400px', margin: '0 auto', padding: '20px',color:'#1D0F6E', borderRadius: '5px', backgroundColor: '#f9f9f9',textAlign: 'center', marginBottom: '20px', fontFamily: 'Poppins', fontWeight: 'bold' }}>Registration Form</h1>
        <div className="temp">
          <div className="col-md-6">
            <div className="form-group">
              <label className="custom-label">
                Username
                {errors.username && <span className="error-icon">!</span>}
              </label>
              <input
                type="text"
                name="username"
                className={`form-control ${errors.username ? 'error' : ''}`}
                onChange={handleChange}
                value={data.username}
              />
              {errors.username && <div className="error-message error">{errors.username}</div>}
            </div>
            <div className="form-group">
              <label className="custom-label">
                Mobile Number
                {errors.mobnum && <span className="error-icon">!</span>}
              </label>
              <input
                type="text"
                name="mobnum"
                className={`form-control ${errors.mobnum ? 'error' : ''}`}
                onChange={handleChange}
                value={data.mobnum}
              />
              {errors.mobnum && <div className="error-message error">{errors.mobnum}</div>}
            </div>
            <div className="form-group">
              <label className="custom-label">
                Pincode
                {errors.pincode && <span className="error-icon">!</span>}
              </label>
              <input
                type="text"
                name="pincode"
                className={`form-control ${errors.pincode ? 'error' : ''}`}
                onChange={handleChange}
                value={data.pincode}
              />
              {errors.pincode && <div className="error-message error">{errors.pincode}</div>}
            </div>
            <div className="form-group">
              <label className="custom-label">
                Password
                {errors.password && <span className="error-icon">!</span>}
              </label>
              <input
                type="password"
                name="password"
                className={`form-control ${errors.password ? 'error' : ''}`}
                onChange={handleChange}
                value={data.password}
              />
              {errors.password && <div className="error-message error">{errors.password}</div>}
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-group">
              <label className="custom-label">
                Email
                {errors.email && <span className="error-icon">!</span>}
              </label>
              <input
                type="email"
                name="email"
                className={`form-control ${errors.email ? 'error' : ''}`}
                onChange={handleChange}
                value={data.email}
              />
              {errors.email && <div className="error-message error">{errors.email}</div>}
            </div>
            <div className="form-group">
              <label className="custom-label">
                Company Name
                {errors.compname && <span className="error-icon">!</span>}
              </label>
              <input
                type="text"
                name="compname"
                className={`form-control ${errors.compname ? 'error' : ''}`}
                onChange={handleChange}
                value={data.compname}
              />
              {errors.compname && <div className="error-message error">{errors.compname}</div>}
            </div>
            <div className="form-group">
              <label className="custom-label">
                Country
                {errors.country && <span className="error-icon">!</span>}
              </label>
              <input
                type="text"
                name="country"
                className={`form-control ${errors.country ? 'error' : ''}`}
                onChange={handleChange}
                value={data.country}
              />
              {errors.country && <div className="error-message error">{errors.country}</div>}
            </div>
            <div className="form-group">
              <label className="custom-label">
                Confirm Password
                {errors.confirm_Password && <span className="error-icon">!</span>}
              </label>
              <input
                type="password"
                name="confirm_Password"
                className={`form-control ${errors.confirm_Password ? 'error' : ''}`}
                onChange={handleChange}
                value={data.confirm_Password}
              />
              {errors.confirm_Password && <div className="error-message error">{errors.confirm_Password}</div>}
            </div>
          </div>
        </div>
        <div className="temp">
          <div className="col-md-12">
            <div className="form-group">
              <label className="custom-label">
                Address
                {errors.address && <span className="error-icon">!</span>}
              </label>
              <textarea
                name="address"
                className={`form-control ${errors.address ? 'error' : ''}`}
                onChange={handleChange}
                value={data.address}
                rows={4}
              />
              {errors.address && <div className="error-message error">{errors.address}</div>}
            </div>
          </div>
        </div>
        <div className="temp">
          <div className="col-md-12 text-right">
            <input type="submit" className="btn btn-custom" name="submit" value="Register" />     <br/>
          </div>
     
        </div>
      </form>
   
      </div>
      </div>
      </div>
      
    </div>
  );
};

export default AddUser;

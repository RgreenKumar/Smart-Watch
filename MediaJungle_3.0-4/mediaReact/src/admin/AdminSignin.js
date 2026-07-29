import React, { useState } from 'react';
import axios from 'axios';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import API_URL from '../Config';
import swal from 'sweetalert2';
const AdminSignin = () => {
    const navigate = useNavigate();
    const [data, setData] = useState({
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
      const [errors, setErrors] = useState({});
    
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
              confirmPassword: data.confirm_Password,
              pincode: data.pincode,
              email: data.email,
              compname: data.compname,
              country: data.country,
              password: data.password
            };
      
            console.log('Sending data:', sendData);
      
            const response = await axios.post(
              `${API_URL}/api/v2/AdminRegister`,
              sendData
            );
      
            console.log('API Response:', response);
      
            if (response.status === 200) {
              swal.fire('Success', 'Registration successful!', 'success');
              navigate('/admin');
            } else {
              console.log('Invalid User');
              swal.fire('Error', 'Invalid user. Please try again.', 'error');
            }
          } catch (error) {
            console.error('Error:', error);
            // swal.fire('Error', 'An error occurred while registering. Please try again.', 'error');
            throw error;
          }
        }
      };


  return (
    <div id="content-wrapper" class="d-flex flex-column samp" style={{ marginLeft: "13rem"}} >
  
<div className='container2 mt-20 ml-15'>
    
        <ol className="breadcrumb mb-4">
          <li className="breadcrumb-item active">Add User</li>
        </ol>
 
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
              {errors.confirmPassword && <span className="error-icon">!</span>}
            </label>
            <input
              type="password"
              name="confirm_Password"
              className={`form-control ${errors.confirmPassword ? 'error' : ''}`}
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
        <div className="col-md-12 text-center">
          <input type="submit" className="btn btn-info" name="submit" value="Register" />     <br/>
        </div>
   
      </div>
    </form>
  </div>
  </div>
  
  )
}

export default AdminSignin



// import React, { useState } from 'react';
// import axios from 'axios';
// import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
// import API_URL from '../Config';
// import Swal from 'sweetalert2';
// const AdminSignin = () => {
//     const navigate = useNavigate();
//     const [data, setData] = useState({
//         username: '',
//         mobnum: '',
//         address: '',
//         pincode: '',
//         email: '',
//         compname: '',
//         country: '',
//         password: '',
//         confirm_Password: ''
//       });
//       const [code,setcode] = useState('');
//       const [errors, setErrors] = useState({});
    
//       const handleChange = (e) => {
//         setData({ ...data, [e.target.name]: e.target.value });
//         setErrors({ ...errors, [e.target.name]: undefined });
//       };
    
//       const validateForm = () => {
//         let isValid = true;
//         const newErrors = {};
    
//         // Validate username
//         if (!data.username.trim()) {
//           newErrors.username = 'Username is required';
//           isValid = false;
//         }
    
//         // Validate mobile number
//         if (!data.mobnum.trim()) {
//           newErrors.mobnum = 'Mobile number is required';
//           isValid = false;
//         } else if (!/^\d{10}$/.test(data.mobnum)) {
//           newErrors.mobnum = 'Invalid mobile number';
//           isValid = false;
//         }
    
//         // Validate address
//         if (!data.address.trim()) {
//           newErrors.address = 'Address is required';
//           isValid = false;
//         }
    
//         // Validate pincode
//         if (!data.pincode.trim()) {
//           newErrors.pincode = 'Pincode is required';
//           isValid = false;
//         } else if (!/^\d{6}$/.test(data.pincode)) {
//           newErrors.pincode = 'Invalid pincode';
//           isValid = false;
//         }
    
//         // Validate email
//         if (!data.email.trim()) {
//           newErrors.email = 'Email is required';
//           isValid = false;
//         } else if (!/\S+@\S+\.\S+/.test(data.email)) {
//           newErrors.email = 'Invalid email address';
//           isValid = false;
//         }
    
//         // Validate company name
//         if (!data.compname.trim()) {
//           newErrors.compname = 'Company name is required';
//           isValid = false;
//         }
    
//         // Validate country
//         if (!data.country.trim()) {
//           newErrors.country = 'Country is required';
//           isValid = false;
//         }
    
//         // Validate password
//         if (!data.password.trim()) {
//           newErrors.password = 'Password is required';
//           isValid = false;
//         }
    
//         if (!data.confirm_Password.trim()) {
//           newErrors.confirm_Password = 'Confirm Password is required';
//           isValid = false;
//         } else if (data.password !== data.confirm_Password) {
//           newErrors.confirm_Password = 'Passwords do not match';
//           isValid = false;
//         }
    
//         setErrors(newErrors);
//         return isValid;
//       };

//       const SendCode = async (e) => {
//         e.preventDefault();
//         let isValid = true;
//         const newErrors = {};
    
//         // Step 1: Prepare FormData
//         const info = new FormData();
//         info.append('email', data.email);

//         if (!data.email.trim()) {   
//             newErrors.email = 'Email is required';
//             isValid = false;
//         } else if (!/\S+@\S+\.\S+/.test(data.email)) {
//             newErrors.email = 'Invalid email address';
//             isValid = false;
//         }
//         setErrors(newErrors); 
    
//         try {
//             // Show loading Swal
//             if(isValid){
//             Swal.fire({
//                 title: 'Sending...',
//                 text: 'Please wait while we send the verification code.',
//                 allowOutsideClick: false,
//                 didOpen: () => {
//                     Swal.showLoading();
//                 },
//             });
        
    
//             // Step 2: Send Verification Code
//             const sendCodeResponse = await axios.post(
//                 `${API_URL}/api/v2/send-code`,
//                 info,
//                 {
//                     headers: {
//                         'Content-Type': 'multipart/form-data',
//                     },
//                 }
//             );
    
//             // Close the loading Swal
//             Swal.close();
        
    
//             // Step 3: Handle Response
//             if (sendCodeResponse.status === 200) {
//                 Swal.fire({
//                     icon: 'success',
//                     title: 'Verification code sent!',
//                     text: 'Please check your email for the verification code.',
//                 });
//             } else {
//                 Swal.fire({
//                     icon: 'info',
//                     title: 'Verification cancelled',
//                     text: 'You cancelled the verification process.',
//                 });
//             }
//         }
//         } catch (sendError) {
//             // Close the loading Swal
//             Swal.close();
    
//             // Handle errors
//             if (sendError.response) {
//                 Swal.fire({
//                     icon: 'error',
//                     title: 'Failed to send verification code',
//                     text: sendError.response.data.message || 'An error occurred while sending the verification code.',
//                 });
//             } else {
//                 Swal.fire({
//                     icon: 'error',
//                     title: 'Unexpected error',
//                     text: 'An unexpected error occurred. Please try again.',
//                 });
//             }
//         }
//     };

      
//       const verifyCode = async (e) => {
//         e.preventDefault();
//         const verifyData = new FormData();
//         verifyData.append('email', data.email);
//         verifyData.append('code', code);
    
//         try {
//             const verifyResponse = await axios.post(`${API_URL}/api/v2/verify-code`, verifyData, {
//                 headers: {
//                     'Content-Type': 'multipart/form-data',
//                 },
//             });
    
//             if (verifyResponse.status === 200) {
//                 Swal.fire({
//                     icon: 'success',
//                     title: 'Code verified successfully!',
//                     text: 'Proceeding to registration...',
//                 });
//                 return true; // Indicate verification success
                 
//             } else {
//                 Swal.fire({
//                     icon: 'error',
//                     title: 'Invalid verification code',
//                     text: 'The code you entered is incorrect. Please try again.',
//                 });
//                 return false; // Indicate verification failure
//             }
//         } catch (error) {
//             Swal.fire({
//                 icon: 'error',
//                 title: 'An error occurred',
//                 text: error.response?.data?.message || 'Failed to verify the code. Please try again later.',
//             });
//             return false; // Indicate verification failure
//         }
//     };
    
//       const submitForm = async (e) => {
//         e.preventDefault();
      
//         if (validateForm()) {
//           try {
//             const sendData = {
//               username: data.username,
//               mobnum: data.mobnum,
//               address: data.address,
//               confirmPassword: data.confirm_Password,
//               pincode: data.pincode,
//               email: data.email,
//               compname: data.compname,
//               country: data.country,
//               password: data.password
//             };
      
//             console.log('Sending data:', sendData);
      
//             const response = await axios.post(
//               `${API_URL}/api/v2/AdminRegister`,
//               sendData
//             );
      
//             console.log('API Response:', response);
      
//             if (response.status === 200) {
//               Swal.fire('Success', 'Registration successful!', 'success');
//               navigate('/admin');
//             } else {
//               console.log('Invalid User');
//               Swal.fire('Error', 'Invalid user. Please try again.', 'error');
//             }
//           } catch (error) {
//             console.error('Error:', error);
//             Swal.fire('Error', 'An error occurred while registering. Please try again.', 'error');
//           }
//         }
//       };


//   return (
//     // <div className='admin-screen'>
//       <div className="admin-container">
//       <div className="welcome-section">
//         <h1>Welcome</h1>
//         <p>
//           To New <span className="admin-highlight">Admin</span>
//         </p>
//       </div>
//       {/* Main Content */}
//       <div className="admin-main-content">
//         {/* Left Section: Form */}
//         <div className="admin-form-container">
//           <form method='POST' onSubmit={submitForm}>
//             <div className="admin-row">
//               <input 
//                 type="text" 
//                 name='username'
//                 placeholder="Username" 
//                 onChange={handleChange}
//                 value={data.username}
//                 required 
//               />
//               {errors.username && <div className="error-message error">{errors.username}</div>}
//               <div className="input-with-button">
//   <input
//     type="email"
//     name="email"
//     placeholder="Email"
//     value={data.email}
//     onChange={handleChange}
//     required
//   />
//   <button type="button" onClick={SendCode} className="otp-btn">Get OTP</button>
// </div>
// </div>
//             <div className="admin-row">
//               <input 
//                 type="text" 
//                 name='mobnum'
//                 placeholder="Phone Number" 
//                 onChange={handleChange}
//                 value={data.mobnum}
//               />
//             {errors.mobnum && <div className="error-message error">{errors.mobnum}</div>}
              
//               <input 
//                 type="text" 
//                 name='code'
//                 placeholder="Enter OTP" 
//                 className='otp-button' 
//                 value={code}
//                 onChange={(e) => setcode(e.target.value)} // Corrected here
//                 />
//               <button type="button" onClick={verifyCode} className="verify-btn">Verify</button>
//             </div>
//             <div className="admin-row">
//             <input 
//               type="text" 
//               name='compname'
//               placeholder="Company Name" 
//               onChange={handleChange}
//               value={data.compname}
//               />
//               {errors.compname && <div className="error-message error">{errors.compname}</div>}
//             <input 
//               type="text" 
//               name='country'
//               placeholder="Country" 
//               onChange={handleChange}
//               value={data.country}
//               />
//               {errors.country && <div className="error-message error">{errors.country}</div>}
//             </div>
//             <div className="admin-row">
//             <input 
//               type="password"
//               name='password' 
//               placeholder="Password" 
//               onChange={handleChange}
//               value={data.password}
//               />
//               {errors.password && <div className="error-message error">{errors.password}</div>}
//             <input 
//               type="password" 
//               name='confirm_Password'
//               placeholder="Confirm Password" 
//               onChange={handleChange}
//               value={data.confirm_Password}
//               />
//               {errors.confirm_Password && <div className="error-message error">{errors.confirm_Password}</div>}
//             </div>
//             <input 
//               type="text" 
//               name='address'
//               placeholder="Address" 
//               onChange={handleChange}
//               value={data.address}
//               />
//               {errors.address && <div className="error-message error">{errors.address}</div>}
//             <button type="submit"  className="signup-btn">Sign Up</button>
//           </form>
//         </div>

//         <div className="admin-image-section">
//           <img src="/media-jungle-logo.png" alt="Media Jungle Logo" />
//         </div>
//       </div>
//     </div>
//     // </div>
  
//   )
// }

// export default AdminSignin




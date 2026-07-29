import React, { useState } from 'react';
// import axios from 'axios';
import { useHistory, Link } from 'react-router-dom';
import "../Admin/Admin.css"

const Admin_login = ({}) => {
//   const history = useHistory();
//   const [user, setUser] = useState({ username: '', password: '' });
//   const handleChange = (e) => {
//     setUser({ ...user, [e.target.name]: e.target.value });
//   };
  

//   const handleLogin = async () => {
//     // Perform login logic here
//     // ...
//     // After successful login, redirect to dashboard
//     history.push('/Dashboard');
//   };

//   const submitForm = async (e) => {
//     e.preventDefault();
//    try {
//       const sendData = {
//         username: user.username,
//         password: user.password
//       };
//       const adminresponse = await axios.post('http://localhost/mediareact/src/php/login.php', sendData);
//     //   console.log(adminresponse); // Add this line to inspect the response object

//       const userresponse = await axios.post('http://localhost/mediareact/src/php/userlogin.php', sendData);
//     //   console.log(userresponse);

      
//       if (adminresponse.data.data.status === 200  ) {
//         // handleLogin();;
//         sessionStorage.setItem('username',sendData.username);

//         history.push('/Dashboard');
//       } 
//        else if (userresponse.data.status === 'success' ) {
//         // alert('Invalid User');
//         sessionStorage.setItem('id', userresponse.data.id);
//         sessionStorage.setItem('username', userresponse.data.username);
//         sessionStorage.setItem('mobnum', userresponse.data.mobnum); // Store mobile number
//         // Store other values in the sessionStorage
//         sessionStorage.setItem('address', userresponse.data.address);
//         sessionStorage.setItem('pincode', userresponse.data.pincode);
//         sessionStorage.setItem('email', userresponse.data.email);
//         sessionStorage.setItem('compname', userresponse.data.compname);
//         sessionStorage.setItem('country', userresponse.data.country);
//         sessionStorage.setItem('password', userresponse.data.password);
//         alert(sessionStorage.getItem('username'))
//         history.push('/Dashboard');
//       }
//       else {
//         alert('Enter the Correct Username or Password');
//       }
//     } catch (error) {
//       console.error('Error:', error);
//       alert('An error occurred while logging in. Please try again.');
//     }
//   };

  return (
     
    <div className="contain">
      <div className="row justify-content-center">
        <div className="col-lg-5">
          <div className="card shadow-lg border-0 rounded-lg mt-5">
            <div className="bg-image" style={{ backgroundImage: "url('img/bg.jpg')" }}>
              <div className="card-header">
                <h3 className="text-center text-black font-weight-light my-4">Admin Login </h3>
              </div>
              <div className="card-body">
                <form onSubmit={''}>
                  <div className="form-floating mb-3">
                    <input
                      className="form-control"
                      name="username"
                      type="text"
                      placeholder="Username"
                      value={""}
                      onChange={""}
                      required
                    />
                    {/* <label htmlFor="inputUsername">Username</label> */}
                  </div>
                  <div className="form-floating mb-3">
                    <input
                      className="form-control"
                      name="password"
                      type="password"
                      placeholder="Password"
                      value={""}
                      onChange={""}
                      required
                    />
                    {/* <label htmlFor="inputPassword">Password</label> */}
                  </div>
                  <div className="d-flex align-items-center justify-content-between mt-4 mb-0">
                    <a className="small" href="password-recovery.php">
                      Forgot Password?
                    </a>
                    <button className="btn btn-primary" type="submit">Login</button>
                  </div>
                  <div className="small text-center">
                    <Link to="/">Back to Home</Link>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  );
};

export default Admin_login;

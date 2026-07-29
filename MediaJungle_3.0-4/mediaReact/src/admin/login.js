import axios from 'axios';
import React, { useEffect, useState } from 'react';
import {Outlet, useLocation, useNavigate } from 'react-router-dom';
import API_URL from '../Config';
import Swal from 'sweetalert2';

const Login = () => {
  const [user, setUser] = useState({ username: '', password: '' });
  const [samp1, setsamp] = useState(1);
  const [users, setUsers] = useState([]);
  const [valid, setValid] = useState();
  let value = 1;
  const [isEmpty, setIsEmpty] = useState();
  // var isEmpty;
  const location = useLocation();
  const navigate = useNavigate();




  useEffect(() => {
    // console.log(`${API_URL}/api`);

    fetchUsers();

    if (location.pathname === '/admin') {
      setsamp(0);
    } else {
      setsamp(1);
    }
  }, [location.pathname]);



  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
    // fetchUsers();




  };
  const hide = () => {
    // setsamp(1);
    setValid('');
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/v2/GetAllUser`);
      setUsers(response.data.userList);
      // console.log(response.data.userList)
      setIsEmpty(response.data.empty);
      setValid(response.data.valid);
      // console.log("Is empty: " + isEmpty); // Corrected from empty to isEmpty
      // console.log("Valid: " + valid);
      // console.log("--------------------------------------------------------------------");
      // After setting the users state, check if the username exists
      // const userFound = response.data.find(userData => userData.username === user.username);
    } catch (error) {
      console.log('Error fetching users:', error);
      throw error;
    }

  }

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     try {
//         const sendData = {
//             username: user.username,
//             password: user.password
//         };

//         const response = await fetch(`${API_URL}/api/v2/login/admin`, {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//             },
//             body: JSON.stringify(sendData),
//         });

//         if (response.ok) {
//             sessionStorage.setItem('username', user.username);
//             sessionStorage.setItem('name', true);

//             // Navigate to the dashboard after successful login
//             navigate('/admin/Dashboard');
//         } else {
//             // Handle invalid username or password
//             Swal.fire({
//                 icon: 'error',
//                 title: 'Login Failed',
//                 text: 'Invalid username or password',
//             });
//         }
//     } catch (error) {
//         console.error('Error during login:', error);
//         // Show a generic error message using SweetAlert
//         Swal.fire({
//             icon: 'error',
//             title: 'Login Error',
//             text: 'An error occurred during login. Please try again later.',
//         });
//     }
// };


const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const sendData = {
      username: user.username,
      password: user.password
    };

    const response = await fetch(`${API_URL}/api/v2/login/admin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sendData),
    });

    if (response.ok) {
      try {
        const data = await response.json(); // Attempt to parse JSON response
        const jwtToken = data.Token; // Use the correct key based on your API response
        const name = data.UserName; // Use the correct key based on your API response
        const userId = data.AdminId; // Use the correct key based on your API response
        const message = data.message;
        const role = data.Role;

        // Store token in session storage
        sessionStorage.setItem("username", name);
        sessionStorage.setItem('tokenn', jwtToken);
        sessionStorage.setItem('adminId', userId);
        sessionStorage.setItem('name', true);
        sessionStorage.setItem('role', role);

        // console.log(name, jwtToken, userId,role);

        // Navigate to the dashboard after successful login
        navigate('/admin/Dashboard');
      } catch (jsonError) {
        console.error('Error parsing JSON:', jsonError);
        throw jsonError;
        // Swal.fire({
        //   icon: 'error',
        //   title: 'Login Error',
        //   text: 'An error occurred while processing the response. Please try again later.',
        // });
      }
    } else {
      // Handle invalid username or password based on status code
      const errorData = await response.json().catch(() => ({})); // Handle cases where response is not JSON
      const message = errorData.message || 'Invalid username or password';

      // Swal.fire({
      //   icon: 'error',
      //   title: 'Login Failed',
      //   text: message,
      // });
    }
  } catch (error) {
    console.error('Error during login:', error);
    throw error;
    // Swal.fire({
    //   icon: 'error',
    //   title: 'Login Error',
    //   text: 'An error occurred during login. Please try again later.',
    // });
  }
};



  const Submit = (e) => {
    e.preventDefault();
    fetchUsers();
    

    const userFound = users.find(userData => (
      user.username === userData.username && user.password === userData.password
    ));

    // && !isEmpty && valid
    if (userFound ) {
      hide();

      // handleLogin();
      sessionStorage.setItem('username', user.username);

      navigate('/admin/Dashboard');
      let ab = true;
      sessionStorage.setItem("name", ab);
    }
      
      // If needed, perform navigation or any other action here
    // } else if (isEmpty) {
    //   alert("Licence required")
    //   navigate('/licence');
    // } else if (!valid) {

    //   alert("Licence Expired")
    //   navigate('/licence');
    // }
    else {
      alert("Invalid username or password");
    }
    
    // if(
    //   // user.username==users.username
    //   //  && 
    //    user.password==users.password
    //    ){
    //   // navigate('Dashboard'); 
    //   navigate('/admin/Dashboard', { state: { username: user.username, password: user.password } });
    // }
    // else{
    //   alert("invalid");
    // }

  }
  return (
    <>
      {samp1 === 0 ? (
        <div className="contain">
          <div className="row justify-content-center">
            <div className="col-lg-5">
              <div className="card shadow-lg border-0 rounded-lg mt-5">
                <div className="bg-image" style={{ backgroundImage: "url('img/bg.jpg')" }}>
                  <div className="card-header">
                    <h3 className="text-center text-black font-weight-light my-4">Login </h3>
                  </div>
                  <div className="card-body">
                    <form onSubmit={handleSubmit}>
                      <div className="form-floating mb-3">
                        <input
                          className="form-control"
                          name="username"
                          type="text"
                          placeholder="Username"
                          value={user.username}
                          onChange={handleChange}
                          required
                        />
                        <label htmlFor="inputUsername">Username</label>
                      </div>
                      <div className="form-floating mb-3">
                        <input
                          className="form-control"
                          name="password"
                          type="password"
                          placeholder="Password"
                          value={user.password}
                          onChange={handleChange}
                          required
                        />
                        <label htmlFor="inputPassword">Password</label>
                      </div>
                      <div className="d-flex btn  align-items-center justify-content-between mt-4 mb-0">
                        {/* <a className="small colour" href="/AdminSignin">
                          Admin SignIn
                        </a> */}
                        <button className="btn btn-primary" type="submit" style={{ color: "black" }}>LOGIN</button>
                      </div>
                      <div className="small text-center">
                        {/* <Link to="Dashboard" onClick={hide}>Back to Home</Link> */}
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
      <Outlet />
    </>
  );
};

export default Login;









// import axios from 'axios';
// import React, { useEffect, useState } from 'react';
// import {Outlet, useLocation, useNavigate } from 'react-router-dom';
// import API_URL from '../Config';

// const Login = () => {
//   const [user, setUser] = useState({ username: '', password: '' });
//   const [samp1, setsamp] = useState(1);
//   const [users, setUsers] = useState([]);
//   const [valid, setValid] = useState();
//   let value = 1;
//   const [isEmpty, setIsEmpty] = useState();
//   // var isEmpty;
//   const location = useLocation();
//   const navigate = useNavigate();

  


//   useEffect(() => {
//     // console.log(`${API_URL}/api`);

//     fetchUsers();

//     if (location.pathname === '/admin') {
//       setsamp(0);
//     } else {
//       setsamp(1);
//     }
//   }, [location.pathname]);



//   const handleChange = (e) => {
//     setUser({ ...user, [e.target.name]: e.target.value });
//     // fetchUsers();




//   };
//   const hide = () => {
//     // setsamp(1);
//     setValid('');
//   };

//   const fetchUsers = async () => {
//     try {
//       const response = await axios.get(`${API_URL}/api/v2/GetAllUser`);
//       setUsers(response.data.userList);
//       console.log(response.data.userList)
//       setIsEmpty(response.data.empty); // Corrected from setisEmpty to setIsEmpty
//       setValid(response.data.valid);
//       // console.log("Is empty: " + isEmpty); // Corrected from empty to isEmpty
//       // console.log("Valid: " + valid);
//       // console.log("--------------------------------------------------------------------");
//       // After setting the users state, check if the username exists
//       // const userFound = response.data.find(userData => userData.username === user.username);
//     } catch (error) {
//       console.log('Error fetching users:', error);
//     }

//   }


//   const Submit = (e) => {
//     e.preventDefault();
//     fetchUsers();
    

//     const userFound = users.find(userData => (
//       user.username === userData.username && user.password === userData.password
//     ));

//     // && !isEmpty && valid
//     if (userFound ) {
//       hide();

//       // handleLogin();
//       sessionStorage.setItem('username', user.username);

//       navigate('/admin/Dashboard');
//       let ab = true;
//       sessionStorage.setItem("name", ab);
//     }
      
//       // If needed, perform navigation or any other action here
//     // } else if (isEmpty) {
//     //   alert("Licence required")
//     //   navigate('/licence');
//     // } else if (!valid) {

//     //   alert("Licence Expired")
//     //   navigate('/licence');
//     // }
//     else {
//       alert("Invalid username or password");
//     }
    
//     // if(
//     //   // user.username==users.username
//     //   //  && 
//     //    user.password==users.password
//     //    ){
//     //   // navigate('Dashboard'); 
//     //   navigate('/admin/Dashboard', { state: { username: user.username, password: user.password } });
//     // }
//     // else{
//     //   alert("invalid");
//     // }

//   }
//   return (
//     <>
//       {samp1 === 0 ? (
//         <div className="contain">
//           <div className="row justify-content-center">
//             <div className="col-lg-5">
//               <div className="card shadow-lg border-0 rounded-lg mt-5">
//                 <div className="bg-image" style={{ backgroundImage: "url('img/bg.jpg')" }}>
//                   <div className="card-header">
//                     <h3 className="text-center text-black font-weight-light my-4">Login </h3>
//                   </div>
//                   <div className="card-body">
//                     <form onSubmit={Submit}>
//                       <div className="form-floating mb-3">
//                         <input
//                           className="form-control"
//                           name="username"
//                           type="text"
//                           placeholder="Username"
//                           value={user.username}
//                           onChange={handleChange}
//                           required
//                         />
//                         <label htmlFor="inputUsername">Username</label>
//                       </div>
//                       <div className="form-floating mb-3">
//                         <input
//                           className="form-control"
//                           name="password"
//                           type="password"
//                           placeholder="Password"
//                           value={user.password}
//                           onChange={handleChange}
//                           required
//                         />
//                         <label htmlFor="inputPassword">Password</label>
//                       </div>
//                       <div className="d-flex btn  align-items-center justify-content-between mt-4 mb-0">
//                         <a className="small colour" href="/AdminSignin">
//                           Admin SignIn
//                         </a>
//                         <button className="btn btn-primary" type="submit" style={{ color: "black" }}>LOGIN</button>
//                       </div>
//                       <div className="small text-center">
//                         {/* <Link to="Dashboard" onClick={hide}>Back to Home</Link> */}
//                       </div>
//                     </form>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       ) : null}
//       <Outlet />
//     </>
//   );
// };

// export default Login;





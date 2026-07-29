import { Link, Route  } from 'react-router-dom';
import React, { useState } from 'react';
// import "./css/style_user.css";

const Userlogin=({})=> {
  const [user, setUser] = useState({ username: '', password: '' });
  // const history = useHistory();
  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };
  const Submitform = async (e) => {
    if(user.username=="Admin" && user.password=="4321")
    {
      // history.push('/UserProfile');
    }
    else{
      alert("Enter the correct Username & Password");
    }

  };
  return (
    <div class="work_user">
        <div class="row">
            <div className="log-user">
            <div className="bg-image-user">
              <div className='row'>
      <div className="col-6 card-image-user">
        
        <img src="/1542216179.svg" class="imag-user" alt="Responsive image" />
      </div>
      <div className="col-6 card-body-user">
      <h3 className="text-center text-white font-weight-light my-4">LOG-IN </h3>
        <form onSubmit={Submitform} className='login-user'>
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
          <div className="d-flex align-items-center justify-content-between mt-4 mb-0">
            <a className="small">
              Forgot Password?
            </a>
            <button className="btn btn-primary" type="submit">Login</button>
          </div>
          <div className="d-flex align-items-center justify-content-between mt-4 mb-0">
            <h5 style={{color: "#ffffff",}}>New_user?</h5>
            </div>
            <br></br>
            <Link className="Link" to="/login">
            <button className="btn btn-primary" >Sign-in</button>
            </Link>
          <div className="small text-center">
            {/* <Link to="/">Back to Home</Link> */}
          </div>
        </form>
      </div>
      </div>
    </div>
                 </div>
            


        </div>
    </div>
  )
};

export default Userlogin;
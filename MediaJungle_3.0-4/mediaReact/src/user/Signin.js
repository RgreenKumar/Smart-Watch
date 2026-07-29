import React from 'react'

function Signin() {
  return (
    <div class="work_user">
        <div class="row">
            <div className='log-user'>
            <div className="bg-image-user">
              <div className='row'>
      <div className="col-6 card-image-user">
        
        <img src="/1542216179.svg" class="imag-user" alt="Responsive image" />
      </div>
      <div className="col-6 card-body-user">
      <h3 className="text-center text-white font-weight-light my-4">SIGN-IN </h3>
        <form onSubmit='#' className='login-user'>
          <div className="form-floating mb-3">
            <input
              className="form-control"
              name="username"
              type="text"
              placeholder="Username"
              value={''}
              onChange={''}
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
              value={''}
              onChange={''}
              required
            />
            <label htmlFor="inputPassword">Enter Password</label>
          </div>
          <div className="form-floating mb-3">
            <input
              className="form-control"
              name="password"
              type="password"
              placeholder="Password"
              value={''}
              onChange={''}
              required
            />
            <label htmlFor="inputPassword">Confirm Password</label>
          </div>
          <div className="d-flex align-items-center justify-content-between mt-4 mb-0">
            {/* <a className="small" href="password-recovery.php">
              Forgot Password?
            </a> */}
            <button className="btn btn-primary" type="submit">SIGN-IN</button>
          </div>
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
}

export default Signin
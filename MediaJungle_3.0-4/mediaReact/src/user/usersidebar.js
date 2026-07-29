import React from 'react'
import { Link} from 'react-router-dom';

function usersidebar() {
  return (
    <div class="header__logo_user">
      <img src="img/logo.png" alt="" />
        <div className='side_value_user'>
        <h5 className="text-center text-white font-weight-light my-4 Wording_user">
        <Link className="Link" to="/login1">
        <span> Profile</span>
      </Link>
          
          </h5>
        <h5 className="text-center text-white font-weight-light my-4 Wording_user">
         
        <Link className="Link" to="/">
        <span> Home</span>
      </Link> 
          </h5>
        <h5 className="text-center text-white font-weight-light my-4 Wording_user">
          
        <Link className="Link" to="/search">
        <span> Search</span>
      </Link>
          </h5>
        <h5 className="text-center text-white font-weight-light my-4 Wording_user">
          
        <Link className="Link" to="/VideoHomescreen">
        <span> Videos</span>
      </Link>
          </h5> 
        </div>

    </div>
  )
}

export default usersidebar
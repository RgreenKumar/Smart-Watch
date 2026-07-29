import React from 'react'
import Usersidebar from './usersidebar'
import Footer from './Footer'

function Userprofile() {
  return (
            <div class="work_user">
                <div class="row">
                < Usersidebar/>
                <div className='body-m-user'>
        <section className='head-1-user'>
        <form className='profile-data-user'>
            <h2>Profile</h2>
            <br></br>
            <label> Name :</label>
            <label>***********</label><br></br>
            <label> Mobile-No :</label>
            <label>***********</label><br></br>
            <label> Plan :</label>
            <label>***********</label><br></br>


        </form>

        </section>
        <Footer/>
                </div>
       
    
    
    </div>
            </div>
  )
}

export default Userprofile
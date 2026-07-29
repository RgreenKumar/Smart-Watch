import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// import '../App.css';
import Navbar from './navbar';
import Sidebar from './sidebar';
import axios from 'axios';
import Setting_sidebar from './Setting_sidebar';
import Employee from './Employee'
import "../css/Sidebar.css";

const Siteurl_setting = () => {
  //===========================================API--G================================================================
  const [Facebook_Link, setFacebook_Link] = useState('');
  const changeFacebook_LinkHandler = (event) => {
    const newValue = event.target.value;
    setFacebook_Link(newValue); // Updating the state using the setter function
  };
  const [LinkedIn_Link, setLinkedIn_Link] = useState('');
  const changeLinkedIn_LinkHandler = (event) => {
    const newValue = event.target.value;
    setLinkedIn_Link(newValue); // Updating the state using the setter function
  };
  const [Twitter_Link, setTwitter_Link] = useState('');
  const changeTwitter_LinkHandler = (event) => {
    const newValue = event.target.value;
    setTwitter_Link(newValue); // Updating the state using the setter function
  };
  const [Google_Plus_Link, setGoogle_Plus_Link] = useState('');
  const changeGoogle_Plus_LinkHandler = (event) => {
    const newValue = event.target.value;
    setGoogle_Plus_Link(newValue); // Updating the state using the setter function
  };
  const [Pinterest_Link, setPinterest_Link] = useState('');
  const changePinterest_LinkHandler = (event) => {
    const newValue = event.target.value;
    setPinterest_Link(newValue); // Updating the state using the setter function
  };
  const save = (e) => {
    e.preventDefault();
    let SiteSetting = { facebook_link: Facebook_Link, linkedin_link: LinkedIn_Link, twitter_link: Twitter_Link, google_plus_link: Google_Plus_Link, pinterest_link: Pinterest_Link };
    console.log("employee =>"+JSON.stringify(SiteSetting));
    Employee.setCompanysiteurl(SiteSetting).then(res => {
      setFacebook_Link('');
      setLinkedIn_Link('');
      setTwitter_Link('');
      setGoogle_Plus_Link('');
      setPinterest_Link('');
    })
  }

  return (

    <div className='container2 mt-20'>
        <ol className="breadcrumb mb-4">
          <li className="breadcrumb-item">
            <Link to="/admin/Setting">Settings</Link>
          </li>
          <li className="breadcrumb-item active text-white">Site URL Settings</li>
        </ol>
        <div className="card md-8" style={{ maxWidth: '91rem', paddingLeft: '0px' }}>
          <div className="container card-body">
            <div class="temp">
              <div class="col col-lg-2">
                <Setting_sidebar />
              </div>
              <div class="col col-lg-9">
                <ul className='breadcrumb-item' style={{ paddingLeft: '0px' }}>

                  <form onSubmit="" method="post" className="registration-form">
                    <div className="temp">

                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="custom-label">
                            Facebook Link
                          </label>
                          <input type="text" placeholder="Facebook Link" name="Facebook Link" value={Facebook_Link} onChange={changeFacebook_LinkHandler} />

                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="custom-label">
                            LinkedIn Link
                          </label>
                          <input type="text" placeholder="LinkedIn Link" name="LinkedIn Link" value={LinkedIn_Link} onChange={changeLinkedIn_LinkHandler} />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="custom-label">
                            Twitter Link
                          </label>
                          <input type="text" placeholder="Twitter Link" name="Twitter Link" value={Twitter_Link} onChange={changeTwitter_LinkHandler} />
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="custom-label">
                            Google Plus Link
                          </label>
                          <input type="text" placeholder=" Google Plus Link" name=" Google Plus Link" value={Google_Plus_Link} onChange={changeGoogle_Plus_LinkHandler} />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="custom-label">
                            Pinterest Link
                          </label>
 </div>
                      </div>
                      <div className="col-md-12">
                       
                          <div className="form-group">
                            <input type="submit" className="btn btn-info" name="submit" value="Submit" onClick={save} />
                          
                        </div>
                      </div>
                    </div>
                  </form>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
  
 
  );
};

export default Siteurl_setting;

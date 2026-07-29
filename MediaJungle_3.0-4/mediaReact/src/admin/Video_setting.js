import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// import '../App.css';
import Navbar from './navbar';
import Sidebar from './sidebar';
import axios from 'axios';
import Setting_sidebar from './Setting_sidebar';
import Employee from './Employee'
import "../css/Sidebar.css";
const Site = () => {
  
  //===========================================API--G================================================================
  const [socket_url, setsocket_url] = useState('');
  const changesocket_urlHandler = (event) => {
    const newValue = event.target.value;
    setsocket_url(newValue); // Updating the state using the setter function from useState
};
const [streaming_url, setstreaming_url] = useState('');
  const changestreaming_urlHandler = (event) => {
    const newValue = event.target.value;
    setstreaming_url(newValue); // Updating the state using the setter function from useState
};
const save=(e)=>{
  e.preventDefault();
  let SiteSetting={socket_Url: socket_url,streaming_URL: streaming_url};
  console.log("'employee =>'+JSON.stringify(SiteSetting)");
  Employee.setVideoSetting(SiteSetting).then(res =>{
    setsocket_url('');
    setstreaming_url('');
  })

  
}

  return (

  

    <div className='container2 mt-20'>
        <ol className="breadcrumb mb-4">
          <li className="breadcrumb-item">
            <Link to="/admin/Setting">Settings</Link>
          </li>
          <li className="breadcrumb-item active  text-white">Video Settings</li>
        </ol>
        <div className="card md-8" style={{maxWidth: '91rem',paddingLeft: '0px'}}>           
          <div className="container card-body">
          <div class="temp">
          <div class="col col-lg-2">
        <Setting_sidebar />
        </div>
        <div class="col col-lg-9">
        <ul className='breadcrumb-item' style={{paddingLeft: '0px'}}>
        <form onSubmit="" method="post" className="registration-form">
        <div className="temp">
        <div className="col-md-12">
        <div className="form-group">
              <label className="custom-label" style={{color:'black'}}>
              Configuration
              </label>
              </div>
          </div>
        <div className="col-md-6">
        <div className="form-group">
              <label className="custom-label">
              Socket Url
              </label>
              <input type="text" placeholder="Socket Url" name="Socket Url" value={socket_url} onChange={changesocket_urlHandler} />
              
            </div>
          </div>
          <div className="col-md-6">
          <div className="form-group">
              <label className="custom-label">
                Streaming URL
              </label>
              <input type="text" placeholder="Streaming URL" name="Streaming URL" value={streaming_url} onChange={changestreaming_urlHandler} />
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

export default Site;

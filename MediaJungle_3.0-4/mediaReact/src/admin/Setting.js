import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './navbar';
import Sidebar from './sidebar'; // You can remove this if no longer needed.
import axios from 'axios';
import { Dropdown } from 'react-bootstrap'; // Import Bootstrap dropdown component

const Setting = () => {
  const [selectedSetting, setSelectedSetting] = useState("Site Settings"); // Default selected setting

  const settingsOptions = [
    { name: "Site Settings", path: "/admin/SiteSetting" },
    { name: "Social Settings", path: "/admin/Social_setting" },
    { name: "Payment Settings", path: "/admin/Payment_setting" },
    { name: "Banner Settings", path: "/admin/Banner_setting" },
    { name: "Footer Settings", path: "/admin/Footer_setting" },
    { name: "Contact Settings", path: "/admin/Contact_setting" },
    { name : "Container Settings", path: "/admin/videocontainer" }
  ];


  const handleSettingChange = (setting) => {
    setSelectedSetting(setting.name);
  };

  return (
    <div className="marquee-container">
    <div className='AddArea'>
      {/* Dropdown for settings */}
      <Dropdown className="mb-4">
    <Dropdown.Toggle  id="dropdown-basic" className='bg-custom-color hover:bg-custom-color hover:text-orange-600'>
    {selectedSetting}
  </Dropdown.Toggle>
  <Dropdown.Menu>
          {settingsOptions.map((setting, index) => (
            <Dropdown.Item as={Link} to={setting.path} key={index} onClick={() => handleSettingChange(setting)}>
              {setting.name}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu></Dropdown>
    </div>
    <br />
   
    <div className="container2 mt-20">

      {/* Your container content */}
      <div className="card md-8" style={{ margin: '0px', maxWidth: '91rem', padding: '0px' }}>
        <div className="container card-body">
          {/* Additional content or components can be placed here */}
          <h2>{selectedSetting} Content</h2>
          {/* Content for the selected setting */}
        </div>
      </div>
    </div></div>
  );
};

export default Setting;

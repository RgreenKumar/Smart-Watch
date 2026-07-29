import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Dropdown } from 'react-bootstrap';
import "../css/Sidebar.css";
import Navbar from './navbar';
import Sidebar from './sidebar';
import Setting_sidebar from './Setting_sidebar';
import Employee from './Employee';

const Social_setting = () => {
  const [selectedSetting, setSelectedSetting] = useState("Social Settings");
  const [FBclientid, setFBclientid] = useState('');
  const [xurl, setXurl] = useState('');
  const [linkedinurl, setLinkedInUrl] = useState('');
  const [youtubeurl, setYouTubeUrl] = useState('');
  const [id, setId] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const settingsOptions = [
    { name: "Site Settings", path: "/admin/SiteSetting" },
    { name: "Social Settings", path: "/admin/Social_setting" },
    { name: "Payment Settings", path: "/admin/Payment_setting" },
    { name: "Banner Settings", path: "/admin/Banner_setting" },
    { name: "Footer Settings", path: "/admin/Footer_setting" },
    { name: "Contact Settings", path: "/admin/Contact_setting" },
    { name: "Container Settings", path: "/admin/container" }
  ];

  useEffect(() => {
    axios.get('http://localhost:8080/api/v2/social-settings/first')
      .then(response => {
        const data = response.data;
        if (data) {
          setFBclientid(data.fbUrl || '');
          setXurl(data.xurl || '');
          setLinkedInUrl(data.linkedinUrl || '');
          setYouTubeUrl(data.youtubeUrl || '');
          setId(data.id);
        }
      })
      .catch(error => {
        if (error.response && error.response.status === 404) {
          // No social settings saved yet — form stays empty for new entry
          console.log('No social settings found, ready for new entry.');
        } else {
          console.error('Error fetching social settings:', error);
        }
      });
  }, []);

  const save = (e) => {
    e.preventDefault();

    const siteSetting = {
      fbUrl: FBclientid,
      linkedinUrl: linkedinurl,
      youtubeUrl: youtubeurl,
      xurl: xurl
    };

    if (id) {
      axios.put(`http://localhost:8080/api/v2/social-settings/${id}`, siteSetting)
        .then(response => {
          console.log('Updated successfully:', response.data);
        })
        .catch(error => {
          console.error('Error updating settings:', error);
        });
    } else {
      axios.post('http://localhost:8080/api/v2/social-settings', siteSetting)
        .then(response => {
          console.log('Created successfully:', response.data);
          setId(response.data.id);
        })
        .catch(error => {
          console.error('Error creating new settings:', error);
        });
    }
  };

  const handleSettingChange = (setting) => {
    setSelectedSetting(setting.name);
    setIsOpen(false);
  };

  return (
    <div className="marquee-container">
      <div className='AddArea'>
        <Dropdown
          show={isOpen}
          onToggle={() => setIsOpen(!isOpen)}
        >
          <Dropdown.Toggle
            className={`${
              isOpen ? 'bg-custom-color text-orange-600' : 'bg-custom-color'
            } hover:bg-custom-color hover:text-orange-600`}
          >
            {selectedSetting}
          </Dropdown.Toggle>

          <Dropdown.Menu>
            {settingsOptions.map((setting, index) => (
              <Dropdown.Item
                as={Link}
                to={setting.path}
                key={index}
                onClick={() => handleSettingChange(setting)}
              >
                {setting.name}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
      </div>

      <br />
      <div className="container3">
        <ol className="breadcrumb mb-4 d-flex my-0">
          <li className="breadcrumb-item">
            <Link to="/admin/SiteSetting">Settings</Link>
          </li>
          <li className="breadcrumb-item active text-white">Social Settings</li>
        </ol>
        <div className='outer-container ml-2 mt-3'>
          <form onSubmit={save} method="post" className="registration-form1">

            <div className="form-group">
              <label style={{ paddingRight: "110px" }}>FB URL</label>
              <input
                type="text"
                placeholder="FB URL"
                value={FBclientid}
                onChange={(e) => setFBclientid(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label style={{ paddingRight: "120px" }}>X URL</label>
              <input
                type="text"
                placeholder="X URL"
                value={xurl}
                onChange={(e) => setXurl(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label style={{ paddingRight: "60px" }}>LinkedIn URL</label>
              <input
                type="text"
                placeholder="LinkedIn URL"
                value={linkedinurl}
                onChange={(e) => setLinkedInUrl(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label style={{ paddingRight: "60px" }}>YouTube URL</label>
              <input
                type="text"
                placeholder="YouTube URL"
                value={youtubeurl}
                onChange={(e) => setYouTubeUrl(e.target.value)}
              />
            </div>

            <div className='button-container1'>
              <input
                type="submit"
                className="btn btn-info"
                value={id ? "Update" : "Submit"}
              />
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default Social_setting;
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API_URL from '../Config';
import Swal from 'sweetalert2';
import axios from 'axios';
import "../css/Sidebar.css"; // You can replace with your own CSS if needed
import { Dropdown } from 'react-bootstrap';

const SiteSetting = () => {
  
  const [sitename, setsitename] = useState('');
  const [appurl, setappurl] = useState('');
  const [tagname, settagname] = useState('');
  const [icon, seticon] = useState('');
  const [logo, setlogo] = useState('');
  const [iconUrl, setIconUrl] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [buttonText, setButtonText] = useState('ADD');
  const [id, setId] = useState(null);
  const token = sessionStorage.getItem('tokenn');
  const [error, setErrors] = useState({});
  
  const [sitenamePlaceholder, setsitenamePlaceholder] = useState('SiteName');
  const [appurlPlaceholder, setappurlPlaceholder] = useState('App URL');
  const [tagnamePlaceholder, settagnamePlaceholder] = useState('Tag Name');

  useEffect(() => {
    fetch(`${API_URL}/api/v2/GetsiteSettings`)
      .then(response => response.json())
      .then(data => {
        if (data.length > 0) {
          setButtonText('UPDATE');
          setsitenamePlaceholder(data[0].sitename);
          setappurlPlaceholder(data[0].appurl);
          settagnamePlaceholder(data[0].tagName);
          setId(data[0].id);
          setIconUrl(`data:image/jpeg;base64,${data[0].icon}`);
          setLogoUrl(`data:image/jpeg;base64,${data[0].logo}`);
        }
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        throw error;
      });
  }, []);

  const validateForm = () => {
    let isValid = true;
    const newErrors = {};

    if (!sitename.trim()) {
      newErrors.sitename = 'Site name is required';
      isValid = false;
    }

    if (!appurl.trim()) {
      newErrors.appurl = 'App URL is required';
      isValid = false;
    }

    if (!tagname.trim()) {
      newErrors.tagname = 'Tag name is required';
      isValid = false;
    }

    if (!icon) {
      newErrors.icon = 'Icon is required';
      isValid = false;
    }

    if (!logo) {
      newErrors.logo = 'Logo is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const Data = new FormData();
      Data.append('sitename', sitename);
      Data.append('appurl', appurl);
      Data.append('tagName', tagname);
      Data.append('icon', icon);
      Data.append('logo', logo);

      const response = await axios.post(`${API_URL}/api/v2/SiteSetting`, Data, {
        headers: {
          Authorization: token,
          'Content-Type': 'multipart/form-data',
        },
      });

      setId(response.data.id);
      setButtonText('EDIT');
      setsitenamePlaceholder(response.data.sitename);
      setappurlPlaceholder(response.data.appurl);
      settagnamePlaceholder(response.data.tagName);
      setIconUrl(`${API_URL}/uploads/${response.data.icon}`);
      setLogoUrl(`${API_URL}/uploads/${response.data.logo}`);

      Swal.fire({
        title: 'Success!',
        text: 'Added successfully.',
        icon: 'success',
        confirmButtonText: 'OK',
      });
    } catch (error) {
      // Swal.fire({
      //   title: 'Error!',
      //   text: 'There was an error adding settings.',
      //   icon: 'error',
      //   confirmButtonText: 'OK',
      // });
      throw error;
    }
  };

  const changeIconHandler = (e) => {
    const file = e.target.files[0];
    seticon(file);
    setIconUrl(URL.createObjectURL(file));
  };

  const changeLogoHandler = (e) => {
    const file = e.target.files[0];
    setlogo(file);
    setLogoUrl(URL.createObjectURL(file));
  };

  const [isOpen, setIsOpen] = useState(false);
  const [selectedSetting, setSelectedSetting] = useState("Site Settings"); // Default selected setting

  const settingsOptions = [
    { name: "Site Settings", path: "/admin/SiteSetting" },
    { name: "Social Settings", path: "/admin/Social_setting" },
    { name: "Payment Settings", path: "/admin/Payment_setting" },
    { name: "Banner Settings", path: "/admin/Banner_setting" },
    { name: "Footer Settings", path: "/admin/Footer_setting" },
    { name: "Contact Settings", path: "/admin/Contact_setting" },
    { name : "Container Settings", path: "/admin/container" },
    { name:"Mail Settings",path:'/admin/mailSetting'}
  ];

  const handleSettingChange = (setting) => {
    setSelectedSetting(setting.name);
    setIsOpen(false);
    
  };
  return (
    <div className="marquee-container">
    <div className='AddArea'>
      {/* Dropdown for settings */}
      <Dropdown 
   
      show={isOpen} 
      onToggle={() => setIsOpen(!isOpen)} // Toggle the dropdown
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
    <div className='container3'>
    <ol className="breadcrumb mb-4 d-flex my-0">
      <li className="breadcrumb-item">
        <Link to="/admin/SiteSetting">Settings</Link>
      </li>
      <li className="breadcrumb-item active  text-white">SiteSettings</li>
    </ol>
    <div className='outer-container mt-10 ml-5'>
    <div className='table-container'>
          <form onSubmit={handleSubmit} method="post">
            <div className="flex-container">
              <div className="input-group">
                <label className="custom-label">Site Name</label>
                <input
                  type="text"
                  placeholder={sitenamePlaceholder}
                  name="sitename"
                  value={sitename}
                  onChange={(e) => setsitename(e.target.value)}
                />
                {error.sitename && <div className="error-message error">{error.sitename}</div>}
              </div>  
              <div className="input-group">
                <label className="custom-label">Tag Name</label>
                <input
                  type="text"
                  placeholder={tagnamePlaceholder}
                  name="tagname"
                  value={tagname}
                  onChange={(e) => settagname(e.target.value)}
                />
                {error.tagname && <div className="error-message error">{error.tagname}</div>}
              </div>
            </div>

            <div className="flex-container">
            <div className="input-group">
                <label className="custom-label">App URL</label>
                <input
                  type="text"
                  placeholder={appurlPlaceholder}
                  name="appurl"
                  value={appurl}
                  onChange={(e) => setappurl(e.target.value)}
                />
                {error.appurl && <div className="error-message error">{error.appurl}</div>}
              </div>
            </div>

            <div className="flex-container">
              <div className="input-group">
                <label className="custom-label">Icon</label>
                <input type="file" onChange={changeIconHandler} />
                {iconUrl && <img src={iconUrl} alt="Icon Preview" className="uploaded-image" />}
                {error.icon && <div className="error-message error">{error.icon}</div>}
              </div>

              <div className="input-group">
                <label className="custom-label">Site Logo</label>
                <input type="file" onChange={changeLogoHandler} />
                {logoUrl && <img src={logoUrl} alt="Logo Preview" className="uploaded-image" />}
                {error.logo && <div className="error-message error">{error.logo}</div>}
              </div>
            </div>

            <div className="button-container" >
  <button className="btn btn-info" type="submit">
    {buttonText}
  </button>
</div>

          </form>
        </div>
      </div>
    </div></div>
  );
};

export default SiteSetting;

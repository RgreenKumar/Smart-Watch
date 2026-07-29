import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Dropdown } from 'react-bootstrap';
import "../css/Sidebar.css";
import API_URL from '../Config';

const Footer_setting = () => {
  const [formData, setFormData] = useState({
    aboutUsHeaderScript: '',
    aboutUsBodyScript: '',
    featureBox1HeaderScript: '',
    featureBox1BodyScript: '',
    featureBox2HeaderScript: '',
    featureBox2BodyScript: '',
    aboutUsImage: null,
    contactUsEmail: '',
    contactUsBodyScript: '',
    callUsPhoneNumber: '',
    callUsBodyScript: '',
    locationMapUrl: '',
    locationAddress: '',
    contactUsImage: null,
    appUrlPlaystore: '',
    appUrlAppStore: '',
    copyrightInfo: '',
  });

  const [step, setStep] = useState(1);
  const [isUpdating, setIsUpdating] = useState(false);
  const [existingId, setExistingId] = useState(null); // FIX: track DB record id for updates

  useEffect(() => {
    const fetchFooterSettings = async () => {
      try {
        const response = await fetch(`${API_URL}/api/v2/footer-settings`);

        // FIX: If 404 (no record yet), just leave form empty — don't try to parse the body
        if (response.status === 404) {
          setIsUpdating(false);
          return;
        }

        if (!response.ok) {
          console.error('Error fetching footer settings, status:', response.status);
          return;
        }

        // FIX: Only call .json() when we know the response is actually JSON
        const data = await response.json();
        if (data) {
          setFormData({
            ...data,
            aboutUsImage: null,   // Don't pre-fill file inputs — browsers block it for security
            contactUsImage: null,
          });
          setExistingId(data.id);
          setIsUpdating(true);
        }
      } catch (error) {
        // FIX: Removed "throw error" — just log it so the app doesn't crash
        console.error('Error fetching footer settings:', error);
      }
    };
    fetchFooterSettings();
  }, []);

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files.length > 0) {
      setFormData((prevData) => ({ ...prevData, [name]: files[0] }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const save = async (event) => {
    event.preventDefault();
    const formDataToSend = new FormData();

    for (const key in formData) {
      if (key === 'aboutUsImage' || key === 'contactUsImage') {
        // Only append file fields if the user actually selected a new file
        if (formData[key] instanceof File) {
          formDataToSend.append(key, formData[key]);
        }
        // If no new file selected, don't append — backend has required=false so it's fine
      } else {
        formDataToSend.append(key, formData[key] ?? '');
      }
    }

    // FIX: Send the record id when updating so the backend knows which row to update
    if (isUpdating && existingId != null) {
      formDataToSend.append('id', existingId);
    }

    try {
      const url = isUpdating
        ? `${API_URL}/api/v2/footer-settings/update`
        : `${API_URL}/api/v2/footer-settings/submit`;

      const response = await fetch(url, {
        method: 'POST',
        body: formDataToSend,
      });

      if (response.ok) {
        alert(isUpdating ? 'Footer settings updated successfully!' : 'Footer settings submitted successfully!');
        if (!isUpdating) {
          setIsUpdating(true);
        }
      } else {
        // FIX: Backend now returns null body on error, so guard before calling .json()
        const contentType = response.headers.get('content-type');
        const errorMsg = contentType && contentType.includes('application/json')
          ? (await response.json()).message
          : await response.text();
        alert(`Failed to save footer settings: ${errorMsg || 'Unknown error'}`);
      }
    } catch (error) {
      // FIX: Removed "throw error" — just show a user-friendly message
      console.error('Error saving footer settings:', error);
      alert('Could not connect to the server. Please try again.');
    }
  };

  const [isOpen, setIsOpen] = useState(false);
  const [selectedSetting, setSelectedSetting] = useState("Footer Settings");

  const settingsOptions = [
    { name: "Site Settings", path: "/admin/SiteSetting" },
    { name: "Social Settings", path: "/admin/Social_setting" },
    { name: "Payment Settings", path: "/admin/Payment_setting" },
    { name: "Banner Settings", path: "/admin/Banner_setting" },
    { name: "Footer Settings", path: "/admin/Footer_setting" },
    { name: "Contact Settings", path: "/admin/Contact_setting" },
    { name: "Container Settings", path: "/admin/container" }
  ];

  const handleSettingChange = (setting) => {
    setSelectedSetting(setting.name);
    setIsOpen(false);
  };

  const goToNextStep = () => setStep((prev) => Math.min(prev + 1, 3));
  const goToPreviousStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const sectionTitles = ['About Us', 'Contact Us', 'App URLs'];

  return (
    <div className="marquee-container">
      <div className='AddArea'>
        <Dropdown show={isOpen} onToggle={() => setIsOpen(!isOpen)}>
          <Dropdown.Toggle className={`bg-custom-color ${isOpen ? 'text-orange-600' : ''} hover:bg-custom-color hover:text-orange-600`}>
            {selectedSetting}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {settingsOptions.map((setting, index) => (
              <Dropdown.Item as={Link} to={setting.path} key={index} onClick={() => handleSettingChange(setting)}>
                {setting.name}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
      </div>
      <br />
      <div className='container2'>
        <ol className="breadcrumb mb-4 d-flex my-0">
          <li className="breadcrumb-item">
            <Link to="/admin/SiteSetting">Settings</Link>
          </li>
          <li className="breadcrumb-item active text-white">Footer Settings</li>
        </ol>
        <div className="table-container">
          <div className="card-body">
            <div className="modern-progress-bar">
              <div className="steps">
                {sectionTitles.map((title, index) => (
                  <div key={index} className={`step ${index < step ? 'completed' : ''}`}>
                    <span>{title}</span>
                  </div>
                ))}
              </div>
              <div className="progress-indicator" style={{ width: `${(step / sectionTitles.length) * 100}%` }} />
            </div>

            <form onSubmit={save} className="registration-form">
              {step === 1 && (
                <>
                  <h3>About Us</h3>
                  <label>Header Script</label>
                  <input type="text" name="aboutUsHeaderScript" className="form-control mb-3" value={formData.aboutUsHeaderScript} onChange={handleInputChange} />
                  <label>Body Script</label>
                  <input type="text" name="aboutUsBodyScript" className="form-control mb-3" value={formData.aboutUsBodyScript} onChange={handleInputChange} />
                  <h4>Feature Box 1</h4>
                  <label>Header Script</label>
                  <input type="text" name="featureBox1HeaderScript" className="form-control mb-3" value={formData.featureBox1HeaderScript} onChange={handleInputChange} />
                  <label>Body Script</label>
                  <input type="text" name="featureBox1BodyScript" className="form-control mb-3" value={formData.featureBox1BodyScript} onChange={handleInputChange} />
                  <h4>Feature Box 2</h4>
                  <label>Header Script</label>
                  <input type="text" name="featureBox2HeaderScript" className="form-control mb-3" value={formData.featureBox2HeaderScript} onChange={handleInputChange} />
                  <label>Body Script</label>
                  <input type="text" name="featureBox2BodyScript" className="form-control mb-3" value={formData.featureBox2BodyScript} onChange={handleInputChange} />
                  <label>About Us Image</label>
                  {formData.aboutUsImage instanceof File
                    ? <p>Selected file: {formData.aboutUsImage.name}</p>
                    : <p>No new image selected (existing image kept if updating)</p>
                  }
                  <input type="file" name="aboutUsImage" className="form-control mb-3" onChange={handleFileChange} />
                </>
              )}

              {step === 2 && (
                <>
                  <h3>Contact Us</h3>
                  <label>Email</label>
                  <input type="email" name="contactUsEmail" className="form-control mb-3" value={formData.contactUsEmail} onChange={handleInputChange} />
                  <label>Body Script</label>
                  <input type="text" name="contactUsBodyScript" className="form-control mb-3" value={formData.contactUsBodyScript} onChange={handleInputChange} />
                  <h4>Call Us</h4>
                  <label>Phone Number</label>
                  <input type="text" name="callUsPhoneNumber" className="form-control mb-3" value={formData.callUsPhoneNumber} onChange={handleInputChange} />
                  <label>Body Script</label>
                  <input type="text" name="callUsBodyScript" className="form-control mb-3" value={formData.callUsBodyScript} onChange={handleInputChange} />
                  <h4>Location</h4>
                  <label>Map URL</label>
                  <input type="text" name="locationMapUrl" className="form-control mb-3" value={formData.locationMapUrl} onChange={handleInputChange} />
                  <label>Address</label>
                  <input type="text" name="locationAddress" className="form-control mb-3" value={formData.locationAddress} onChange={handleInputChange} />
                  <label>Header Image</label>
                  {formData.contactUsImage instanceof File
                    ? <p>Selected file: {formData.contactUsImage.name}</p>
                    : <p>No new image selected (existing image kept if updating)</p>
                  }
                  <input type="file" name="contactUsImage" className="form-control mb-3" onChange={handleFileChange} />
                </>
              )}

              {step === 3 && (
                <>
                  <h4>App URL</h4>
                  <label>Playstore URL</label>
                  <input type="url" name="appUrlPlaystore" className="form-control mb-3" value={formData.appUrlPlaystore} onChange={handleInputChange} />
                  <label>App Store URL</label>
                  <input type="url" name="appUrlAppStore" className="form-control mb-3" value={formData.appUrlAppStore} onChange={handleInputChange} />
                  <h4>Copyright Content</h4>
                  <label>Copyright Info</label>
                  <input type="text" name="copyrightInfo" className="form-control mb-3" value={formData.copyrightInfo} onChange={handleInputChange} />
                </>
              )}

              <div className="d-flex justify-content-between mt-3">
                {step > 1 && (
                  <button type="button" className="btn btn-primary" style={{ backgroundColor: "#007bff" }} onClick={goToPreviousStep}>
                    Previous
                  </button>
                )}
                {step < 3 && (
                  <button type="button" className="btn btn-primary ml-auto" style={{ backgroundColor: "#007bff" }} onClick={goToNextStep}>
                    Next
                  </button>
                )}
                {step === 3 && (
                  <button type="submit" className="btn btn-primary ml-auto" style={{ backgroundColor: "#007bff" }}>
                    {isUpdating ? 'Update' : 'Submit'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer_setting;
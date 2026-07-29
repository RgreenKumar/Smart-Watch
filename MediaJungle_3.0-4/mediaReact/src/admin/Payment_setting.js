import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Setting_sidebar from './Setting_sidebar';
import "../css/Sidebar.css";
import API_URL from '../Config';
import Swal from 'sweetalert2'
import { Dropdown } from 'react-bootstrap';

const Payment_setting = () => {
  const [razorpay_key, setRazorpayKey] = useState('');
  const [razorpay_secret_key, setRazorpaySecretKey] = useState('');
  const [buttonText, setButtonText] = useState('ADD');
  const [keyPlaceholder, setKeyPlaceholder] = useState('Razorpay Key');
  const [secretKeyPlaceholder, setSecretKeyPlaceholder] = useState('Razorpay Secret Key');
  const [getall, setGetAll] = useState([]);
  const [id, setId] = useState('');
  const [error,setErrors] = useState('');
  const token = sessionStorage.getItem('tokenn');
  const [selectedSetting, setSelectedSetting] = useState("Payment Settings"); 
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
    fetch(`${API_URL}/api/v2/getrazorpay`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setGetAll(data);
        console.log(data);
        if (data.length > 0) {
          setButtonText('UPDATE');
          setKeyPlaceholder(data[0].razorpay_key);
          setSecretKeyPlaceholder(data[0].razorpay_secret_key);
          setId(data[0].id);
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
  
    // Validate razorpay_key
    if (!razorpay_key.trim()) {
      newErrors.razorpay_key = 'Razorpay Key is required';
      isValid = false;
    }
    // Validate razorpay_secret_key
    if (!razorpay_secret_key.trim()) {
      newErrors.razorpay_secret_key = 'Razorpay Secret Key is required';
      isValid = false;
    }
  
    // Update state with errors
    setErrors(newErrors);
    return isValid;
  };
  const handleSettingChange = (setting) => {
    setSelectedSetting(setting.name);
    setIsOpen(false);
    
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!validateForm()) {
      return;
    }
  
    try {
      const razerpayData = {
        razorpay_key: razorpay_key,
        razorpay_secret_key: razorpay_secret_key,
      };
  
      const response = await axios.post(`${API_URL}/api/v2/AddrazorpayId`, razerpayData, {
        headers: {
          Authorization : token,
          'Content-Type': 'multipart/form-data',
        },
      });
  
      console.log(response.data);
      setId(response.data.id);
      setButtonText('UPDATE');
      setKeyPlaceholder(response.data.razorpay_key);
      setSecretKeyPlaceholder(response.data.razorpay_secret_key);
  
      // Show success message
      Swal.fire({
        title: 'Success!',
        text: 'Razorpay settings added successfully.',
        icon: 'success',
        confirmButtonText: 'OK',
      });
    } catch (error) {
      console.error('Error uploading:', error);
      throw error;
      // Show error message
      // Swal.fire({
      //   title: 'Error!',
      //   text: 'There was an error adding Razorpay settings.',
      //   icon: 'error',
      //   confirmButtonText: 'OK',
      // });
    }
  };
  

  const handleSub = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const updatedData = {
        razorpay_key: razorpay_key,
        razorpay_secret_key: razorpay_secret_key,
      };

      const response = await axios.patch(`${API_URL}/api/v2/Editrazorpay/${id}`, updatedData, {
        headers: {
          Authorization : token,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        console.log('updated successfully');
        Swal.fire({
          title: 'Success!',
          text: 'successfully updated.',
          icon: 'success',
          confirmButtonText: 'OK',
        });
      } else {
        console.log('Error updating razorpay');
        Swal.fire({
          title: 'Error!',
          text: 'There was an error updating the razorpay.',
          icon: 'error',
          confirmButtonText: 'OK',
        });
      }
    } catch (error) {
      console.log('Error updating razorpay:', error);
      throw error;
      // Swal.fire({
      //   title: 'Error!',
      //   text: 'There was an error updating the razorpay.',
      //   icon: 'error',
      //   confirmButtonText: 'OK',
      // });
    }
  };

  const changeRazorpayKeyHandler = (e) => {
    setRazorpayKey(e.target.value);
  };

  const changeRazorpaySecretKeyHandler = (e) => {
    setRazorpaySecretKey(e.target.value);
  };

  const handleFormSubmit = (e) => {
    if (buttonText === 'ADD') {
      handleSubmit(e);
    } else if (buttonText === 'UPDATE') {
      handleSub(e);
    }
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
            <li className="breadcrumb-item active  text-white">Payment Settings</li>
          </ol>
          <div className='outer-container mt-10 ml-80'>

                {/* <div className="col col-lg-2">
                  <Setting_sidebar />
                </div> */}
                  <ul className=' breadcrumb-item' style={{ paddingLeft: '0px' }}>
                    <form onSubmit={handleFormSubmit} method="post" className="registration-form1" style={{ height: '44rem' }}>
             
                        <div className="col-md-12">
                          <div className="form-group">
                            <label className="custom-label" style={{ color: 'black' }}>
                              Razorpay Settings
                            </label>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="custom-label">
                              Razorpay Key
                            </label>
                            <input
                              type="text"
                              placeholder={keyPlaceholder}
                              name="Razorpay Key"
                              value={razorpay_key}
                              onChange={changeRazorpayKeyHandler}
                            />
                            {error.razorpay_key && <div className="error-message error">{error.razorpay_key}</div>}
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="custom-label">
                              Razorpay Secret Key
                            </label>
                            <input
                              type="text"
                              placeholder={secretKeyPlaceholder}
                              name="Razorpay Secret Key"
                              value={razorpay_secret_key}
                              onChange={changeRazorpaySecretKeyHandler}
                            />
                            {error.razorpay_secret_key && <div className="error-message error">{error.razorpay_secret_key}</div>}
                          </div>
                        </div>
                        <div className='col-lg-12'>
                          <div className="d-flex justify-content-end" style={{ marginTop: "120px", marginRight:"30px" }}>
                            <button className='text-center btn btn-info'>
                              {buttonText}
                            </button>
                          </div>
                        </div>
                     
                    </form>
                  </ul>
                </div>
              </div>
            </div>
        
  

  );
};

export default Payment_setting;







{/* <div className="col-md-12">
                        <div className="form-group">
                          <label className="custom-label" style={{color:'black'}}>
                            PayPal Settings
                          </label>
                        </div>
                      </div>  */}
                      {/* <div className="col-md-6">
                        <div className="form-group">
                          <label className="custom-label">
                            Paypal Id
                          </label>
                          <input type="text" placeholder="Paypal Id" name="Paypal Id" value={Paypal_Id} onChange={changePaypal_IdHandler} />
                        </div>
                      </div> */}
                      {/* <div className="col-md-6">
                        <div className="form-group">
                          <label className="custom-label">
                            Paypal Secret
                          </label>
                          <input type="text" placeholder="Paypal Secret" name="Paypal Secret" value={Paypal_Secret} onChange={changePaypal_SecretHandler} />
                        </div>
                      </div> */}
                      {/* <div className="col-md-12">
                        <div className="form-group">
                          <label className="custom-label" style={{color:'black'}}>
                            Stripe Settings
                          </label>
                        </div>
                      </div> */}
                      {/* <div className="col-md-6">
                        <div className="form-group">
                          <label className="custom-label">
                            Stripe Publishable Key
                          </label>
                          <input type="text" placeholder="Stripe Publishable Key" name="Stripe Publishable Key" value={Stripe_Publishable_Key} onChange={changeStripe_Publishable_KeyHandler} />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="custom-label">
                            Stripe Secret Key
                          </label>
                          <input type="text" placeholder="Stripe Secret Key" name="Stripe Secret Key" value={Stripe_Secret_Key} onChange={changeStripe_Secret_KeyHandler} />
                        </div>
                      </div> */}
                      {/* <div className="col-md-12">
                        <div className="form-group">
                          <label className="custom-label" style={{color:'black'}}>
                            Paystack Settings
                          </label>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="custom-label">
                            Paystack Key
                          </label>
                          <input type="text" placeholder="Paystack Key" name="Paystack Key" value={Paystack_Key} onChange={changePaystack_KeyHandler} />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="custom-label">
                            Paystack Secret Key
                           </label>
                           <input type="text" placeholder="Paystack Secret Key" name="Paystack Secret Key" value={Paystack_Secret_Key} onChange={changePaystack_Secret_KeyHandler} />
                         </div>
                      </div> */}
                      {/* <div className="col-md-12">
                      {valid?
                          <div className="form-group">
                          <input type="submit" className="btn btn-info" name="submit" value="Submit" onClick={save} />
                         
                        </div>
                         :<div></div>
                        }
                      </div> */}

                      // useEffect(() => {
                      //   data==="false"?setValid(false):setValid(true)
                      // }, []);
                      //   //===========================================API--G================================================================
                      //   const [Paypal_Id, setPaypal_Id] = useState('');
                      //   const changePaypal_IdHandler = (event) => {
                      //     const newValue = event.target.value;
                      //     setPaypal_Id(newValue); // Updating the state using the setter function from useState
                      //   };
                      //   const [Paypal_Secret, setPaypal_Secret] = useState('');
                      //   const changePaypal_SecretHandler = (event) => {
                      //     const newValue = event.target.value;
                      //     setPaypal_Secret(newValue); // Updating the state using the setter function from useState
                      //   };
                      //   const [Stripe_Publishable_Key, setStripe_Publishable_Key] = useState('');
                      //   const changeStripe_Publishable_KeyHandler = (event) => {
                      //     const newValue = event.target.value;
                      //     setStripe_Publishable_Key(newValue); // Updating the state using the setter function from useState
                      //   };
                      //   const [Stripe_Secret_Key, setStripe_Secret_Key] = useState('');
                      //   const changeStripe_Secret_KeyHandler = (event) => {
                      //     const newValue = event.target.value;
                      //     setStripe_Secret_Key(newValue); // Updating the state using the setter function from useState
                      //   };
                      //   const [Razorpay_Key, setRazorpay_Key] = useState('');
                      //   const changeRazorpay_KeyHandler = (event) => {
                      //     const newValue = event.target.value;
                      //     setRazorpay_Key(newValue); // Updating the state using the setter function from useState
                      //   };
                      //   const [Razorpay_Secret_Key, setRazorpay_Secret_Key] = useState('');
                      //   const changeRazorpay_Secret_KeyHandler = (event) => {
                      //     const newValue = event.target.value;
                      //     setRazorpay_Secret_Key(newValue); // Updating the state using the setter function from useState
                      //   };
                      //   const [Paystack_Key, setPaystack_Key] = useState('');
                      //     const changePaystack_KeyHandler = (event) => {
                      //       const newValue = event.target.value;
                      //       setPaystack_Key(newValue); // Updating the state using the setter function from useState
                      //   };
                      //   const [Paystack_Secret_Key, setPaystack_Secret_Key] = useState('');
                      //     const changePaystack_Secret_KeyHandler = (event) => {
                      //       const newValue = event.target.value;
                      //       setPaystack_Secret_Key(newValue); // Updating the state using the setter function from useState
                      //   };
                      

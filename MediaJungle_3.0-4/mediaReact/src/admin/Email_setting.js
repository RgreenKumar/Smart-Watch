import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// import '../App.css';
import Navbar from './navbar';
import Sidebar from './sidebar';
import axios from 'axios';
import Setting_sidebar from './Setting_sidebar';
import Employee from './Employee'
import "../css/Sidebar.css";
const Email_setting = () => {


  // ---------------------Admin functions -------------------------------
  const [userIdToDelete, setUserIdToDelete] = useState('');
  const [users, setUsers] = useState([]);
  const name = sessionStorage.getItem('username');

  

 
  // ---------------------User functions -------------------------------

  const [id, setId] = useState(sessionStorage.getItem('id') || '');
  const [username, setUsername] = useState(sessionStorage.getItem('username') || '');
  const [mobnum, setMobnum] = useState(sessionStorage.getItem('mobnum') || '');
  const [address, setAddress] = useState(sessionStorage.getItem('address') || '');
  const [pincode, setPincode] = useState(sessionStorage.getItem('pincode') || '');
  const [email, setEmail] = useState(sessionStorage.getItem('email') || '');
  const [compname, setCompname] = useState(sessionStorage.getItem('compname') || '');
  const [country, setCountry] = useState(sessionStorage.getItem('country') || '');
  const [password, setPassword] = useState(sessionStorage.getItem('password') || '');

  useEffect(() => {
    // Retrieve user data from sessionStorage on component mount
    setId(sessionStorage.getItem('id') || '');
    setUsername(sessionStorage.getItem('username') || '');
    setMobnum(sessionStorage.getItem('mobnum') || '');
    setAddress(sessionStorage.getItem('address') || '');
    setPincode(sessionStorage.getItem('pincode') || '');
    setEmail(sessionStorage.getItem('email') || '');
    setCompname(sessionStorage.getItem('compname') || '');
    setCountry(sessionStorage.getItem('country') || '');
    setPassword(sessionStorage.getItem('password') || '');
  }, []);
  const handleChange = (e) => {
    const { name, value } = e.target;
    switch (name) {
      case 'username':
        setUsername(value);
        break;
      case 'mobnum':
        setMobnum(value);
        break;
      case 'address':
        setAddress(value);
        break;
      case 'pincode':
        setPincode(value);
        break;
      case 'email':
        setEmail(value);
        break;
      case 'compname':
        setCompname(value);
        break;
      case 'country':
        setCountry(value);
        break;
      case 'password':
        setPassword(value);
        break;
      default:
        break;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Save the edited user details to sessionStorage
    sessionStorage.setItem('id', id);
    sessionStorage.setItem('username', username);
    sessionStorage.setItem('mobnum', mobnum);
    sessionStorage.setItem('address', address);
    sessionStorage.setItem('pincode', pincode);
    sessionStorage.setItem('email', email);
    sessionStorage.setItem('compname', compname);
    sessionStorage.setItem('country', country);
    sessionStorage.setItem('password', password);

    // API call to update user data
    try {
      const response = await axios.post('http://localhost/mediareact/src/php/update.php', {
        id: id,
        username: username,
        mobnum: mobnum,
        address: address,
        pincode: pincode,
        email: email,
        compname: compname,
        country: country,
        password: password,
      });

      if (response.status === 200) {
        // Data updated successfully
        console.log(response.data.message);
      } else {
        // Error occurred while updating data
        console.error('Error:', response.data.message);
      }
    } catch (error) {
      console.error('Error:', error);
      throw error;
      // Handle the error here
    }
  };
  //===========================================API--G================================================================
  const [Mail_Drive, setMail_Drive] = useState('');
  const changeMail_DriveHandler = (event) => {
    const newValue = event.target.value;
    setMail_Drive(newValue); // Updating the state using the setter function from useState
  };
  const [Mail_Username, setMail_Username] = useState('');
  const changeMail_UsernameHandler = (event) => {
    const newValue = event.target.value;
    setMail_Username(newValue); // Updating the state using the setter function from useState
  };
  const [Mail_Host, setMail_Host] = useState('');
  const changeMail_HostHandler = (event) => {
    const newValue = event.target.value;
    setMail_Host(newValue); // Updating the state using the setter function from useState
  };
  const [Mail_Password, setMail_Password] = useState('');
  const changeMail_PasswordHandler = (event) => {
    const newValue = event.target.value;
    setMail_Password(newValue); // Updating the state using the setter function from useState
  };
  const [Mail_Port, setMail_Port] = useState('');
  const changeMail_PortHandler = (event) => {
    const newValue = event.target.value;
    setMail_Port(newValue); // Updating the state using the setter function from useState
  };
  const [Mail_Encryption, setMail_Encryption] = useState('');
  const changeMail_EncryptionHandler = (event) => {
    const newValue = event.target.value;
    setMail_Encryption(newValue); // Updating the state using the setter function from useState
  };
  const save = (e) => {
    e.preventDefault();
    let SiteSetting = { mail_driver:Mail_Drive , mail_username: Mail_Username,mail_password: Mail_Password, mail_host: Mail_Host,mail_port: Mail_Port, mail_encryption: Mail_Encryption};
    console.log("'employee =>'+JSON.stringify(SiteSetting)");
    Employee.setEmailsettings(SiteSetting).then(res => {
      setMail_Drive('');
      setMail_Username('');
      setMail_Password('');
      setMail_Host('');
      setMail_Port('');
      setMail_Encryption('');
    })
  }
  return (

    <div className='container2 mt-20'>
        <ol className="breadcrumb mb-4">
          <li className="breadcrumb-item">
            <Link to="/admin/Setting">Settings</Link>
          </li>
          <li className="breadcrumb-item active  text-white">Email Settings</li>
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
                            Mail Drive
                          </label>
                          <input type="text" placeholder="Mail Drive" name="Mail Drive" value={Mail_Drive} onChange={changeMail_DriveHandler} />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="custom-label">
                          Mail Username
                          </label>
                          <input type="text" placeholder=" Mail Username" name=" Mail Username" value={ Mail_Username} onChange={changeMail_UsernameHandler} />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="custom-label">
                          Mail Host
                          </label>
                          <input type="text" placeholder="Mail Host" name="Mail Host" value={Mail_Host} onChange={changeMail_HostHandler} />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="custom-label">
                          Mail Password
                          </label>
                          <input type="text" placeholder="Mail Password" name="Mail Password" value={Mail_Password} onChange={changeMail_PasswordHandler} />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="custom-label">
                          Mail Port
                          </label>
                          <input type="text" placeholder="Mail Port" name="Mail Port" value={Mail_Port} onChange={changeMail_PortHandler} />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="custom-label">
                          Mail Encryption
                          </label>
                          <input type="text" placeholder="Mail Encryption" name="Mail Encryption" value={Mail_Encryption} onChange={changeMail_EncryptionHandler} />
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

export default Email_setting;

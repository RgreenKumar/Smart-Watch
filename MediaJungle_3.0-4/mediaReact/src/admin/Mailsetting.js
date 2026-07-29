import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API_URL from '../Config';
import Swal from 'sweetalert2';
import axios from 'axios';
import "../css/Sidebar.css";
import { Dropdown } from 'react-bootstrap';

const Mailsetting = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSetting, setSelectedSetting] = useState("Mail Settings");
  const [isEditing, setIsEditing] = useState(false);

  const settingsOptions = [
    { name: "Site Settings", path: "/admin/SiteSetting" },
    { name: "Social Settings", path: "/admin/Social_setting" },
    { name: "Payment Settings", path: "/admin/Payment_setting" },
    { name: "Banner Settings", path: "/admin/Banner_setting" },
    { name: "Footer Settings", path: "/admin/Footer_setting" },
    { name: "Contact Settings", path: "/admin/Contact_setting" },
    { name: "Container Settings", path: "/admin/container" },
    { name: "Mail Settings", path: "/admin/mailSetting" },
  ];

  const handleSettingChange = (setting) => {
    setSelectedSetting(setting.name);
    setIsOpen(false);
  };

  const [mailhostname, setmailhostname] = useState("");
  const [mailportname, setmailportname] = useState("");
  const [emailid, setemailid] = useState("");
  const [password, setpassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("mailhostname", mailhostname);
      formData.append("mailportname", mailportname);
      formData.append("emailid", emailid);
      formData.append("password", password);

      const response = await axios.post(`${API_URL}/api/v2/configuremail`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status === 200) {
        Swal.fire({
          title: "Success!",
          text: "Mail configured successfully.",
          icon: "success",
          confirmButtonText: "OK",
        });
        setIsEditing(false);
      } else {
        Swal.fire({
          title: "Failed!",
          text: "Mail configuration failed. Please try again.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    } catch (error) {
      // Do NOT rethrow — show user-friendly error instead
      console.error("Error configuring mail:", error);
      Swal.fire({
        title: "Error!",
        text: "There was an error configuring the mail settings. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  const fetchMailConfig = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/v2/getmailconfig`);
      if (response.status === 200) {
        setmailhostname(response.data.mailhostname || "");
        setmailportname(response.data.mailportname || "");
        setemailid(response.data.emailid || "");
        setpassword(response.data.password || "");
      }
    } catch (err) {
      // Do NOT rethrow — a 404 here just means no config saved yet, which is fine
      console.error("Error fetching mail configuration:", err);
    }
  };

  useEffect(() => {
    fetchMailConfig();
  }, []);

  return (
    <div className="marquee-container">
      <div className='AddArea'>
        <Dropdown
          show={isOpen}
          onToggle={() => setIsOpen(!isOpen)}
        >
          <Dropdown.Toggle
            className={`${isOpen ? 'bg-custom-color text-orange-600' : 'bg-custom-color'} hover:bg-custom-color hover:text-orange-600`}
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

      <div className="container2">
        <ol className="breadcrumb mb-4 d-flex my-0">
          <li className="breadcrumb-item">
            <Link to="/admin/SiteSetting">Settings</Link>
          </li>
          <li className="breadcrumb-item active text-white">MailSettings</li>
        </ol>

        <form>
          <div className="outer-container">
            <div className="table-container">
              {[
                { label: "Mail Host Name", value: mailhostname, setter: setmailhostname },
                { label: "Mail Port Name", value: mailportname, setter: setmailportname },
                { label: "Email ID", value: emailid, setter: setemailid },
                { label: "Password", value: password, setter: setpassword },
              ].map(({ label, value, setter }, idx) => (
                <div key={idx} className="row py-3 my-3 align-items-center w-100">
                  <div className="col-md-3">
                    <label className="custom-label">{label}</label>
                  </div>
                  <div className="col-md-4">
                    <input
                      type={label === "Password" ? "password" : "text"}
                      className="form-control border border-dark border-2"
                      value={value}
                      disabled={!isEditing}
                      onChange={(e) => setter(e.target.value)}
                      placeholder={label}
                    />
                  </div>
                </div>
              ))}

              <div className="row py-1 my-1 w-100 mt-5">
                <div className="col-md-8 ms-auto text-end">
                  {!isEditing ? (
                    <button
                      className="border border-dark border-2 p-1.5 w-20 text-white rounded-lg"
                      type="button"
                      style={{ backgroundColor: "blue" }}
                      onClick={() => setIsEditing(true)}
                    >
                      Edit
                    </button>
                  ) : (
                    <>
                      <button
                        className="border border-dark border-2 p-1.5 w-20 mr-5 text-black me-2 rounded-lg"
                        type="button"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </button>
                      <button
                        className="border border-dark border-2 p-1.5 w-20 text-white rounded-lg"
                        type="submit"
                        style={{ backgroundColor: "blue" }}
                        onClick={handleSubmit}
                      >
                        Submit
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Mailsetting;
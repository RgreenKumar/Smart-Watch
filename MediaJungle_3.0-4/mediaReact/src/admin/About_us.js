import React, { useState, useEffect } from 'react';
import axios from 'axios';
//import '../csstemp/AudioStyle.css';
import Navbar from './navbar';
import Sidebar from './sidebar';
import { Link } from 'react-router-dom';
import ReactPlayer from 'react-player';
import AudioPlayer from 'react-audio-player';
import "../css/Sidebar.css";
import { useNavigate } from 'react-router-dom';
import API_URL from '../Config';

const About_us = () => {
    const [audioFile, setAudioFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [isDataList, setIsDataList] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [lastModifiedDate, setLastModifiedDate] = useState(null);
  useEffect(() => {


    fetch(`${API_URL}/api/v2/GetAllUser`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        // const type = data.dataList;
       
        setIsDataList(data.dataList);



      })
      .catch(error => {
        console.error('Error fetching data:', error);
        throw error
      });
  }, []);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    setLastModifiedDate(file ? new Date(file.lastModified).toLocaleString() : null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      const audioData = {
        audioFile: audioFile,
        lastModifiedDate: lastModifiedDate,

      };
      for (const key in audioData) {
        formData.append(key, audioData[key]);
      }

      const response = await fetch(`${API_URL}/api/v2/uploadfile`, {
        method: 'POST',
        body: formData,
        // headers: { // Uncomment these headers if needed
        //   'Content-Type': 'multipart/form-data',
        // },
      });

      if (!response.ok) {
        throw new Error('Failed to upload audio file');
      }

      // Handle response if needed
      const data = await response.json();
      console.log('Upload successful:', data);
    } catch (error) {
      console.error('Error uploading audio:', error);
      throw error
    }

    // Reset state after upload

    setAudioFile(null);
    window.location.href = "/admin";
    // navigate('/admin'); // Uncomment if navigation is needed
  };
  return (
    <div className="marquee-container">
    <div className='AddArea'>
         {/* <Link to="/admin/AddUser">
      <button className='btn btn-custom'>Add SubAdmin</button>
    </Link> */}
      </div>
       <div className="container3 mt-14">
       <ol className="breadcrumb mb-4 d-flex my-0">
         <li className="breadcrumb-item text-white "><Link to="/admin/About_us">About Us</Link>
         </li>
         {/* <li className="breadcrumb-item active">About_us</li> */}
       </ol>

       <div className='outer-container'>
       <div className="table-container"> 

                <div className='row'>
                  <div className='col-6'>
                      <label className='labl' >Product name </label>
                      <span>:</span>
                      <label >{isDataList && isDataList.length > 0?isDataList[0].ProductName:""}</label>
                  </div>
                  <div className='col-6'>
                    <div className='inputgrp'>
                      <label className='lab'  >HotFix Installed (if any) </label>
                      <span>:</span>
                      <label  >NO </label>
                    </div>
                  </div>
                </div>
                <br></br>
                <div className='row'>
                  <div className='col-6'>
                    <div className='inputgrp'>
                      <label className='labl' >Company Name </label>
                      <span>:</span>
                      <label  >{isDataList && isDataList.length > 0?isDataList[0].CompanyName:""}</label>
                    </div>
                  </div>
                  <div className='col-6'>
                    <div className='inputgrp'>
                      <label className='lab' >Contact Support No </label>
                      <span>:</span>
                      <label >{isDataList && isDataList.length> 0?isDataList[0].Contact:""} </label>
                    </div>
                  </div>
                </div>
                <br></br>
                <div className='row'>
                  <div className='col-6'>
                    <div className='inputgrp'>
                      <label className='labl'  >Product Version </label>
                      <span>:</span>
                      <label >{isDataList && isDataList.length> 0?isDataList[0].version:""} </label>
                    </div>
                  </div>
                  <div className='col-6'>
                    <div className='inputgrp'>
                      <label className='lab' >Contact E-Mail </label>
                      <span>:</span>
                      <label >{isDataList && isDataList.length > 0?isDataList[0].Email:""}</label>
                    </div>
                  </div>
                </div>
                <br></br>
                <div className='row'>
                  <div className='col-6'>
                    <div className='inputgrp'>
                      <label className='labl' >Start Date </label>
                      <span>:</span>
                      <label >{isDataList && isDataList.length > 0?(isDataList[0].StartDate===""?"NA":isDataList[0].StartDate):""}</label>
                    </div>
                  </div>
                  <div className='col-6'>
                    <div className='inputgrp'>
                      <label className='lab'>End Date </label>
                      <span>:</span>
                      <label >{isDataList && isDataList.length > 0?(isDataList[0].EndDate===""?"NA":isDataList[0].EndDate):""}</label>
                    </div>
                  </div>
                </div>
                <br></br>
                <div className='row'>
                  <div className='col-6'>
                    <div className='inputgrp '>
                      <label className='labl' >Version</label>
                      <span>:</span>
                      <label  >{isDataList && isDataList.length > 0?isDataList[0].Type:""}</label>
                    </div>
                  </div>

                </div>
                <br></br>
                <form className='form-container' onSubmit={handleSubmit}>
                  <div className='row'>
                    <div className='col-6'>
                      <div className='inputgrp'>
                        <label className='labl' >Add New License File </label>
                        <span>:</span>
                        <br></br>
                        <input
                          type='file'
                          className=''
                          placeholder='Choose  File'
                          name='audioFile'
                          onChange=
                            {(e) => {
                              setAudioFile(e.target.files[0]);
                              handleFileChange(e);
                            }}
                          style={{ padding: "0px", width: "20rem" }}
                        />
                      </div>
                    </div>
                    <div className='col-6'>
                      <div className='inputgrp'>
                        <label className='lab' > Feedback</label>
                        <span>:</span>
                        <br></br>
                        <input
                          className='disabledbox'
                          readOnly
                          value=" " />
                      </div>
                    </div>
                  </div>
                  {/* <div className='modal-body text-center'>
                  <br />
                  <br />
                  <h5 className='modal-title modal-header bg-info' id='exampleModalLongTitle'>
                    Add New License File
                  </h5>
                  <input
                    type='file'
                    className='form-control'
                    placeholder='Choose Audio File'
                    name='audioFile'
                    onChange={(e) => setAudioFile(e.target.files[0])}
                  />
                  {errors.audioFile && <div className="error-message">{errors.audioFile}</div>}
                  <br />
                </div> */}
                  <div className='modal-footer'>
                    <input
                      type='submit'
                      value='Upload'
                      className='btn' style={{ backgroundColor: "#17a2b8", color: "White", fontWeight: "500" }}
                    />
                  </div>
                </form>


              </div>

              </div>
             </div>
                  </div>
     

   
  )
}

export default About_us
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './navbar';
import Sidebar from './sidebar';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import API_URL from '../Config';
const Licence = () => {
    //.....................................Admin Function............................................
 
  const [categoryName, setCategoryName] = useState('');
  const [tagName, setTagName] = useState('');
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [categoryId, setCategoryId] = useState('');
  const [audioFile, setAudioFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [lastModifiedDate, setLastModifiedDate] = useState(null);
  const navigate = useNavigate();


  const generateAudioTitle = () => {
    const fileName = audioFile ? audioFile.name : 'Untitled Audio';
    return fileName;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLastModifiedDate(audioFile ? new Date(audioFile.lastModified).toLocaleString() : null);
    console.log("audioFile.lastModified "+Date(audioFile.lastModified).toLocaleString())
    try {
      const formData = new FormData();
      const audioData = {
        audioFile: audioFile,
      };
      console.log(audioData)
      for (const key in audioData) {
        formData.append(key, audioData[key]);
      }
  
      const response = await axios.post(`${API_URL}/api/v2/uploadfile`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      console.log(response.data);
      console.log("audio updated successfully");
    } catch (error) {
      console.error('Error uploading audio:', error);
      throw error;
    }
    setCategoryId('')
    setAudioFile(null)
    setThumbnail(null)
    // navigate('/admin');
  };

    const validateForm = () => {
    let isValid = true;
    const errors = {};
    setErrors(errors);
    return isValid;
  };


    return (
        <div className="contain">
            <div className="row justify-content-center">
                <div className="col-lg-5">
                    <div className="card shadow-lg border-0 rounded-lg mt-5">
                        <div className="bg-image" style={{ backgroundImage: "url('img/bg.jpg')" }}>
                            <div className="card-header">
                                <h6 className="text-center" style={{ fontSize:"30px" }}>licence file</h6>
                            </div>
                            <br></br>
                            <br></br>
                            <div className="card-body">
                            <form className='form-container' onSubmit={handleSubmit}>
                <div className='modal-body text-center'>
                  <br />
                  <br />
                  <h5 className='modal-title modal-header bg-info' id='exampleModalLongTitle'>
                    Add New Audio File
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
                </div>
                <div className='modal-footer'>
                  <input
                    type='submit'
                    value='Upload'
                    className='btn'style={{ backgroundColor:"#17a2b8",color:"White",fontWeight:"500" }}
                  />
                </div>
              </form>



                                </div>
                                <br></br>
                                <br></br>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Licence
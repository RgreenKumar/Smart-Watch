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

const Audio = () => {
  // ...................................Admin Functions.............................................

  const [audios, setAudios] = useState([]);
  const [image, setImage] = useState([]);
  const [selectedAudio, setSelectedAudio] = useState(null);
  const [audios_u, setAudios_u] = useState([]);
  const [selectedAudio_u, setSelectedAudio_u] = useState(null);
  const [users_u, setUsers] = useState([]);
  const [categories_u, setCategories_u] = useState([]);
  const [tags_u, setTags_u] = useState([]);
  const userid_u = parseInt(sessionStorage.getItem('id'), 10); // Get user ID from session storage
  const userid = parseInt(sessionStorage.getItem('id'), 10); // Get user ID from session storage
  const name = sessionStorage.getItem('username');
  let Id;
  const navigate = useNavigate();


  useEffect(() => {
    // Fetch audios from the backend API
    fetchAudios();
    // fetchAudios_u();
    // fetchCategories_u();
    // fetchTags_u();
  }, []);

  const fetchAudios = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/v2/audio/list`);
      setAudios(response.data);
      console.log('Fetched Audios:', response.data); // Added console.log()
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  };

  


  const handleDelete = async (audioId) => {
    const  audId=audioId
    console.log(audId)
    try {
      const response = await fetch(`${API_URL}/api/v2/audio/${audioId}`);
  
      if (response.ok) {
        // fetchAudios();
        // setDeleteStatus('Audio deleted successfully');
      // setGetall((prevGetAll) => {
      //   const updatedGetAll = [...prevGetAll];
      //   updatedGetAll.splice(index, 1);
      //   return updatedGetAll;
      // });
      fetchAudios();
        console.log('deleteStatus');
       
      } else {
        // setDeleteStatus('Error deleting audio');
        console.log('deleteStatus');
      }
    } catch (error) {
      console.error('Error:', error);
      // setDeleteStatus('Error deleting audio');
      throw error;
    }
    
  };


  

  const handlEdit = async (audioId) => {
    localStorage.setItem('items', audioId);
    navigate('/admin/Editaudio1');
  };

  // const openAudioModal = (audio) => {
  //   const audioLocation = `${audio.file_location}`;
  //   setSelectedAudio({ ...audio, file_location: audioLocation });
  // };

  // const closeAudioModal = () => {
  //   setSelectedAudio(null);
  // };
  

  return (
    <div id="content-wrapper" class="d-flex flex-column samp" style={{ marginLeft: "13rem"}}>

   <Sidebar />
   <div className="container-fluid">
      
      

      <h1 className="mt-4 text-white">{name=="admin"?"Admin-Audios":"User-Audios"}</h1>
      <ol className="breadcrumb mb-4">
        <li className="breadcrumb-item"><Link to="/Dashboard">Dashboard</Link>
        </li>
        <li className="breadcrumb-item active">Audios</li>
      </ol>
      <div className="card-1 mb-4" style={{height: "auto"}}>
          <div className="card-header">
            <i className="fas fa-table me-1"></i>
            Registered User Details
          </div>
      {/* {name=="admin"
      ? */}
      <div className="card-body profile-card-body">
              <table id="datatablesSimple">
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>songname</th>
                    <th>category</th>
                  </tr>
                </thead>
                <tbody>
                 {audios.map((audio, index) => (
                   <tr key={audio.id}>
                   <td>{index + 1}</td>
                   <td>{audio.filename}</td>
                   <td>{audio.category}</td>
                   <td>
                   <button onClick={() => handlEdit(audio.id)} >
                          <i className="fas fa-edit" aria-hidden="true"></i>
                        </button>
                        <button onClick={() => handleDelete(audio.id)} >
                          <i className="fa fa-trash" aria-hidden="true"></i>
                        </button>
                        
                      </td>
                      </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
                 </div>
    </div>
    </div>
  );
};

export default Audio;
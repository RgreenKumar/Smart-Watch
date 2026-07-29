import React, { useState, useEffect } from 'react';
import axios from 'axios';
// import '../csstemp/VideoStyle.css';
import Swal from 'sweetalert2';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import API_URL from '../Config';
// import '../csstemp/VideoStyle.css';
import "../css/Sidebar.css";

const ListAudio = () => {

  // ------------------------------ Admin Functions  -----------------------------------------
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const userid = parseInt(sessionStorage.getItem('id'), 10); // Get user ID from session storage
  const name = sessionStorage.getItem('username');
  const [Audiodata, setAudiodata] = useState([]);
  let Id;
  const navigate = useNavigate();
  const [dataToSend, setDataToSend] = useState('');
  const [paid, setpaid] = useState('');
  const token= sessionStorage.getItem('tokenn')
  localStorage.setItem('audioId', null);
 
  const handleClick = (link) => {
    localStorage.removeItem('items'); // Clear the stored videoId
    navigate(link);
  }
 
 
 
  useEffect(() => {
    // Fetch videos from the backend API
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/v2/getaudiodetailsdto`);
        setAudiodata(response.data); 
        console.log(response.data) 
      } catch (error) {
        console.log('Error fetching users:', error);
        throw error;
      }
    };
    
    fetchUsers();
  }, []);
  console.log('Audiodata')
  console.log(Audiodata)
 
  const handleDelete = async (audioid) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = 1;
          await fetch(`${API_URL}/api/v2/testaudio/${audioid}`, {
            method: 'DELETE',
            // headers: {
            //   Authorization: token,
            // }
          });
  
          if (response==1) {
            const updatedData = Audiodata.filter(audio => audio.id !== audioid);
            setAudiodata(updatedData);
  
            Swal.fire(
              'Deleted!',
              'The video has been deleted.',
              'success'
            );
          // } else {
          //   Swal.fire(
          //     'Error!',
          //     'There was a problem deleting the video.',
          //     'error'
          //   );
          }
        } catch (error) {
          console.error('Error:', error);
          throw error;
          // Swal.fire(
          //   'Error!',
          //   'There was a problem deleting the video.',
          //   'error'
          // );
        }
      }
    });
  };
  
  const handlEdit = async (audioid) => {
    localStorage.setItem('audioId', audioid);
    navigate('/admin/addAudio');
  };
  
  
 // ------------------------------ User Functions ----------------------------------------------
 
 
  return (
 
    <div className="marquee-container">
        <div className='AddArea'>
          <button className='btn btn-custom' onClick={() => handleClick("/admin/addAudio")}>Add Audio</button>
        </div><br/>
      <div className='container3'>
      <ol className="breadcrumb mb-4 d-flex my-0">
        <li className="breadcrumb-item text-white">Audio
        </li>
        <li className="ms-auto text-end text-white">
        Bulk Action
        <button className="ms-2">
          <i className="bi bi-chevron-down"></i>
        </button>
      </li>
       
      </ol>
    
         
      <div class="outer-container">
    <div className="table-container">
      <table className="table table-striped ">
        <thead>
          <tr className='table-header'>
            <th style={{border: 'none' }}>
              <input type="checkbox" />
            </th>
            <th style={{border: 'none' }}>S.No</th>
            <th style={{border: 'none' }}>Audio Title</th>
            <th style={{border: 'none' }}>Category</th>
            <th style={{border: 'none' }}>Production</th>
            <th style={{border: 'none' }}>Rating</th>
            <th style={{border: 'none' }}>Video Access Type</th>
            <th style={{border: 'none' }}>Action</th>
                    
          </tr>
        </thead>
        <tbody>
          {Audiodata.map((Audiodata, index) => (

            <tr key={Audiodata.id} className={index % 2 === 0 ? 'even-row' : 'odd-row'}>
              <td>
                <input type="checkbox" />
              </td>
              <td className='truncate' title={index}>{index + 1}</td>
              <td className='truncate' title={Audiodata.audioTitle}>{Audiodata.audioTitle.length> 15 ? `${Audiodata.audioTitle.substring(0, 10)}...` : Audiodata.audioTitle}</td>
               <td className='truncate' title={Audiodata.categories}>{Audiodata.categories.length> 15 ? `${Audiodata.categories.substring(0, 10)}...` : Audiodata.categories} ...</td>
               <td className='truncate' title={Audiodata.production_company}>{Audiodata.production_company.length> 10 ? `${Audiodata.production_company.substring(0, 10)}...` : Audiodata.production_company}</td>
              <td className='truncate' title={Audiodata.rating}>{Audiodata.rating.length> 10 ? `${Audiodata.rating.substring(0, 10)}...` : Audiodata.rating}/10</td>
            
              <td className='truncate'>{Audiodata.paid===true ? "Paid" : "Free"}</td>

             




              <td>
                
                <button onClick={() => handlEdit(Audiodata.id)} className="btn btn-primary me-2">
                  <i className="fas fa-edit" aria-hidden="true"></i>
                </button>
                <button onClick={() => handleDelete(Audiodata.id)} className="btn btn-danger">
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

export default ListAudio;

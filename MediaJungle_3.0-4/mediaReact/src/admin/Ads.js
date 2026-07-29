import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import "../css/Sidebar.css";
import API_URL from '../Config';

const Ads = () => {
    const navigate = useNavigate();
    const token = sessionStorage.getItem('tokenn')
    const [ad, setAd] = useState([]);
    
    const handleClick = (link) => {
      localStorage.removeItem('items');
      navigate(link);
    }
  
  
    useEffect(() => {
      // Fetch ads data from the backend
      fetch(`${API_URL}/api/v2/GetAllAds`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token, // Include token if required for authentication
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Failed to fetch ads');
          }
          return response.json();
        })
        .then((data) => {
          setAd(data); // Update the state with the fetched ads
        })
        .catch((error) => {
          console.error('Error fetching ads:', error);
          throw error;
        });
    }, []);
  
    const handleDeleteAd = (adId) => {
      Swal.fire({
        title: 'Are you sure?',
        text: 'You are about to delete this ad. This action cannot be undone.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'No, cancel'
      }).then((result) => {
        if (result.isConfirmed) {
          fetch(`${API_URL}/api/v2/deleteAd/${adId}`, {
            method: 'DELETE',
            headers: {
              Authorization: token,
            },
          })
          
            .then((response) => {
              if (!response.ok) {
                throw new Error('Network response was not ok');
              }
              // Return null if the status is 204 (No Content)
              return response.status === 200 ? null : response.json();
            })
            .then((data) => {

              if (data === null) {
                // Successfully deleted
                setAd((prevAd) => prevAd.filter((ad) => ad.id !== adId));
                Swal.fire('Deleted!', 'Your ad has been deleted.', 'success');
              } else {
                // Handle unexpected cases
                console.error('Error deleting ad:', data.error);
                Swal.fire(
                  'Error!',
                  `Failed to delete ad: ${data.error}`,
                  'error'
                );
              }
            })
            .catch((error) => {
              console.error('Error deleting ad:', error);
              // Swal.fire(
              //   'Error!',
              //   'There was a problem deleting your ad. Please try again later.',
              //   'error'         
              // );
              throw error;
            });
        }
      });
    };
  
    const handleEdit = async (adId) => {
      localStorage.setItem('items', adId);
      navigate('/admin/AddAds');
    };
    

  return (
    <div className="marquee-container">
      <div className='AddArea'>
        <button className='btn btn-custom' onClick={() => handleClick("/admin/AddAds")}>Add Ads</button>
      </div><br/>
      <div className='container3'>
        <ol className="breadcrumb mb-4 d-flex  my-0">
          <li className="breadcrumb-item text-white">Ads</li>
          <li className="ms-auto text-end text-white">
          Bulk Action
          <button className="ms-2">
            <i className="bi bi-chevron-down"></i>
          </button>
          </li>
        </ol>
        <div class="outer-container">
        <div className="table-container">
        <table class="table table-striped">
        <thead>
            <tr className='table-header'>
              < th style={{border: 'none' }}>
                <input type="checkbox" />
              </th>
              <th style={{border: 'none' }}>S.No</th>
              <th style={{border: 'none' }}>Ads Video Title</th>
              <th style={{border: 'none' }}>No of Views</th>
              <th style={{border: 'none' }}>Ads Roll</th>
              <th style={{border: 'none' }}>Certificate</th>
              <th style={{border: 'none' }}>Year</th>
              <th style={{border: 'none' }}>Action</th>
            </tr>
          </thead>
          <tbody>
  {Array.isArray(ad) && ad.length > 0 ? (
    ad.map((adv, index) => (
      <tr key={adv.id}>
        <td><input type="checkbox" /></td>
        <td className='truncate' title={index}>{index + 1}</td>
        <td className='truncate' title={adv.adName}>{adv.adName.length> 10 ? `${adv.adName.substring(0, 10)}...` : adv.adName}</td>
        <td className='truncate' title={adv.views}>{adv.views.length> 10 ? `${adv.views.substring(0, 10)}...` : adv.views}</td>
        <td className='truncate' title={adv.rollType}>{adv.rollType.length> 10 ? `${adv.rollType.substring(0, 10)}...` : adv.rollType}</td>
        <td className='truncate' title={adv.certificateName}>{adv.certificateName.length> 10 ? `${adv.certificateName.substring(0, 10)}...` : adv.certificateName}</td>
        <td className='truncate' title={adv.createdAt}>{new Date(adv.createdAt).getFullYear()}</td>
        <td className='truncate'>
          <button onClick={() => handleEdit(adv.id)} className="btn btn-primary me-2">
            <i className="fas fa-edit"></i> Edit
          </button>
          <button onClick={() => handleDeleteAd(adv.id)} className="btn btn-danger">
            <i className="fa fa-trash"></i> Delete
          </button>
          </td>
        </tr>
      ))
    ) : (
      <tr>
        <td colSpan="8" className="text-center">No ads available</td>
      </tr>
    )}
  </tbody>
  </table>
      </div>
      </div>
      </div>
      </div>
   
  );
};

export default Ads;


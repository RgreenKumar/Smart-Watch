import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "../css/Sidebar.css";
import API_URL from '../Config';
import Swal from 'sweetalert2';

const PlanFeature = () => {
  //.......................................Admin functiuons.....................................
  
  const [features, setFeatures] = useState([]);
  const navigate = useNavigate();
  const token = sessionStorage.getItem('tokenn')



  useEffect(() => {
    // fetch feature data from the backend
    fetch(`${API_URL}/api/v2/GetAllFeatures`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setFeatures(data);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        throw error;
      });
  }, []);
  const handleClick = (link) => {
    navigate(link);
  }

  

const handleDeleteFeature = (featureId) => {
  Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'No, keep it'
  }).then((result) => {
    if (result.isConfirmed) {
      fetch(`${API_URL}/api/v2/DeleteFeature/${featureId}`, {
        method: 'DELETE',
        headers: {
          Authorization: token,
      }
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        // If the response status is OK, don't attempt to parse JSON from an empty response
        return response.status === 204 ? null : response.json();
      })
      .then(data => {
        if (data) {
          console.log('Feature deleted successfully', data);
        } else {
          console.log('Feature deleted successfully (no content)');
        }
        // Remove the deleted feature from the local state
        setFeatures(prevFeatures => prevFeatures.filter(feature => feature.id !== featureId));
        Swal.fire(
          'Deleted!',
          'Your feature has been deleted.',
          'success'
        );
      })
      .catch(error => {
        console.error('Error deleting feature:', error);
        throw error;
        // Swal.fire(
        //   'Error!',
        //   'There was a problem deleting your feature. Please try again later.',
        //   'error'
        // );
      });
    }
  });
};

  const handlEdit = async (featureId) => {
    localStorage.setItem('items', featureId);
    navigate('/admin/EditFeature');
  };
  

  return (
    

    <div className="marquee-container">
    <div className='AddArea'>
      <button className='btn btn-custom' onClick={() => handleClick("/admin/AddFeature")}>Add Features</button>
    </div><br/>
    
    <div className='container3'>
      <ol className="breadcrumb mb-4 d-flex  my-0">
        <li className="breadcrumb-item text-white">Features</li>
        <li className="ms-auto text-end text-white">
          Bulk Action
          <button className="ms-2">
            <i className="bi bi-chevron-down"></i>
          </button>
        </li>
      </ol>
      
      <div className="table-container">
      <table class="table table-striped">
          <thead>
            <tr className='table-header'>
              < th style={{border: 'none' }}>
                <input type="checkbox" />
              </th>
              <th style={{border: 'none' }}>S.No</th>
              <th style={{border: 'none' }}>Feature Name</th>
              <th style={{border: 'none' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {features.map((feature, index) => (
              <tr key={feature.id} className={index % 2 === 0 ? 'even-row' : 'odd-row'}>
                <td>
                  <input type="checkbox" />
                </td>
                <td className='truncate' title={index}>{index + 1}</td>
                <td className='truncate' title={feature.features}>{feature.features.length> 15 ? `${feature.features.substring(0, 10)}...` : feature.features}</td>
                <td>
                  <button onClick={() => handlEdit(feature.id)} className="btn btn-primary me-2">
                    <i className="fas fa-edit" aria-hidden="true"></i> Edit
                  </button>
                  
                  <button onClick={() => handleDeleteFeature(feature.id)} className="btn btn-danger">
                    <i className="fa fa-trash" aria-hidden="true"></i> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </div>
 
  

 
  );
};

export default PlanFeature;


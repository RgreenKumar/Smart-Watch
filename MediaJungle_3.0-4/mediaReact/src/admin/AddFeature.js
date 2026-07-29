import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { Link } from 'react-router-dom';
import "../css/Sidebar.css";
import API_URL from '../Config';

const AddFeature = () => {
  
    //.....................................Admin Function............................................
  const [featureName, setFeatureName] = useState('');
  const token = sessionStorage.getItem("tokenn")


  const handleSubmit = (e) => {
    e.preventDefault();
  
    // Create the data object
    const data = {
      features: featureName
    };
  
    console.log(data);
  
    // Send the feature name to the server using a POST request
    fetch(`${API_URL}/api/v2/PlanFeatures`, {
      method: 'POST',
      headers: {
        Authorization: token, // Pass the token in the Authorization header
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    .then(response => response.text())
    .then(data => {
      console.log(data);
      if (data === 'success') {
        setFeatureName('');
  
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Feature inserted successfully!',
        });
      } else {
        
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error occurred while inserting feature.',
        });
      }
    })
    .catch(error => {
      console.error('Error:', error);
      throw error;
      // Swal.fire({
      //   icon: 'error',
      //   title: 'Error',
      //   text: 'Error occurred while inserting feature.',
      // });
    });
  };
  

  return (
    <div className="marquee-container">
    <div className='AddArea'>
      {/* <button className='btn btn-custom' onClick={() => handleClick("/admin/addAudio")}>Add Audio</button> */}
    </div><br/>
    <div className='container3 mt-10'>
  <ol className="breadcrumb mb-4">
    <li className="breadcrumb-item"><Link to="/admin/PlanFeatures">Features</Link></li>
    <li className="breadcrumb-item active text-white">Add Features</li>
  </ol>
  <div className="container mt-3">
    <div className="row py-3 my-3 align-items-center">
      <div className="col-md-3">
        <label className="custom-label">Feature Name</label>
      </div>
      <div className="col-md-4">
        <input 
          type='text'
          name='feature_name'
          id='name'
          required
          value={featureName}
          onChange={(e) => setFeatureName(e.target.value)}
          className="form-control border border-dark " 
          placeholder="Enter Feature" 
        />
      </div>
    </div>
    <div className="row py-3 my-5">
      <div className="col-md-12" style={{ height: '200px' }}></div> {/* Placeholder div for spacing */}
    </div>
    <div className="row py-3 my-5">
      <div className="col-md-8 ms-auto text-end">
      <button className="border border-dark  p-1.5 w-20 mr-5 text-black me-2 rounded-lg">Cancel</button>
        <button className="border border-dark  p-1.5 w-20 mr-10 text-white rounded-lg " onClick={handleSubmit} style={{backgroundColor:'#2b2a52'}}
        >Submit</button>
      </div>
    </div>
  </div>
</div>
</div>
  );
};

export default AddFeature;


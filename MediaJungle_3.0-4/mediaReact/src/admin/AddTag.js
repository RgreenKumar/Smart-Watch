import React, { useState,useEffect } from 'react';
import { Link } from 'react-router-dom';
import "../css/Sidebar.css";
import API_URL from '../Config';
import Swal from 'sweetalert2';

const AddTag = () => {
   //.......................................Admin functiuons.....................................
  const [tagName, setTagName] = useState('');
  const token = sessionStorage.getItem("tokenn")


const handleSubmit = (e) => {
  e.preventDefault();

  const data = {
    tag: tagName
  };
  console.log(data);

  // Send the tag name to the server using a POST request
  fetch(`${API_URL}/api/v2/AddTag`, {
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
      setTagName('');

      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Tag inserted successfully!',
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error occurred while inserting tag.',
      });
    }
  })
  .catch(error => {
    console.error('Error:', error);
    throw error;
    // Swal.fire({
    //   icon: 'error',
    //   title: 'Error',
    //   text: 'An error occurred while inserting the tag.',
    // });
  });
};


 /* edit mode */
 const [isEditMode, setIsEditMode] = useState(false);

 const tagId = localStorage.getItem('items');
 console.log("tagId",tagId);
 
 useEffect(() => {
   if (tagId) {
     setIsEditMode(true);
 
     // Fetch the video details based on videoId
     fetch(`${API_URL}/api/v2/GetTagById/${tagId}`)
       .then(response => response.json())
       .then(data => {
         console.log('Video Details:', data); // Log the video details
         setTagName(data.tag);
       })
       .catch(error => {console.error('Error fetching video details:', error);throw error;});
   }
 }, [tagId]);
 

 const handleUpdate = (e) => {
  e.preventDefault();

  const data = {
    tag: tagName
  };
 
  fetch(`${API_URL}/api/v2/editTag/${tagId}`, {
    method: 'PATCH',
    headers: {
       Authorization: token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  .then((response) => {
    if (response.ok) {
      console.log('Tag updated successfully');
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Tag details successfully updated',
      });
    } else {
      console.log('Error updating Tag');
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error updating tag',
      });
    }
  })
  .catch((error) => {
    console.log('Error updating tag:', error);
    throw error;
    // Swal.fire({
    //   icon: 'error',
    //   title: 'Error',
    //   text: 'An error occurred while updating the tag',
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
    <li className="breadcrumb-item"><Link to="/admin/ViewTag">Tags</Link></li>
    <li className="breadcrumb-item active  text-white">{isEditMode ? 'Edit Tag' : 'Add Tag' }</li>
  </ol>
  <div className="container mt-3">
    <div className="row py-3 my-3 align-items-center">
      <div className="col-md-3">
        <label className="custom-label">Name Tags</label>
      </div>
      <div className="col-md-4">
        <input 
          type='text'
          name='Tag'
          id='name'
          required
          value={tagName}
          onChange={(e) =>  setTagName(e.target.value)}
          className="form-control border border-dark" 
          placeholder="Tags" 
        />
      </div>
    </div>
    <div className="row py-3 my-5">
      <div className="col-md-12" style={{ height: '200px' }}></div> {/* Placeholder div for spacing */}
    </div>
    <div className="row py-3 my-5">
      <div className=" mt-2 col-md-8 ms-auto text-end">
      <button className="border border-dark p-1.5 w-20 mr-5 text-black me-2 rounded-lg">Cancel</button>
        <button className="border border-dark p-1.5 /w-20 mr-10 text-white rounded-lg " onClick={isEditMode ? handleUpdate : handleSubmit} style={{backgroundColor:'#2b2a52'}}
        >Submit</button>
      </div>
    </div>
  </div>
</div>
      </div>
    

      );
};

export default AddTag;


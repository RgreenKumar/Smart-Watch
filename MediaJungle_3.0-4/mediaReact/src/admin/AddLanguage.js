import React, { useState,useEffect} from 'react';
import Swal from 'sweetalert2';
import { Link } from 'react-router-dom';
import "../css/Sidebar.css";
import API_URL from '../Config';


const AddLanguage = () => {
  
    //.....................................Admin Function............................................
  const [languageName, setlanguageName] = useState('');
  const token = sessionStorage.getItem("tokenn")



const handleSubmit = (e) => {
  e.preventDefault();

  const data = {
    language: languageName
  };
  console.log(data);

  // Send the language name to the server using a POST request
  fetch(`${API_URL}/api/v2/AddLanguage`, {
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
      setlanguageName('');
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Language inserted successfully!',
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error occurred while inserting language.',
      });
    }
  })
  .catch(error => {
    console.error('Error:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'An error occurred while inserting the language.',
    });
  });
};

 /* edit mode */
 const [isEditMode, setIsEditMode] = useState(false);

 const languageId = localStorage.getItem('items');
 console.log("languageId",languageId);
 
 useEffect(() => {
   if (languageId) {
     setIsEditMode(true);
 
     // Fetch the video details based on videoId
     fetch(`${API_URL}/api/v2/GetLanguageById/${languageId}`)
       .then(response => response.json())
       .then(data => {
         setlanguageName(data.language);  
       })
       .catch(error => { console.error('Error fetching language details:', error); });
   }
 }, [languageId]);
 
 const handleUpdate = (e) => {
  e.preventDefault();

  const data = {
    language: languageName
  };
  console.log(data);

  fetch(`${API_URL}/api/v2/editLanguage/${languageId}`, {
    method: 'PATCH',
    headers: {
      Authorization:token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  .then((response) => {
    if (response.ok) {
      console.log('Language updated successfully');
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Language details successfully updated',
      });
    } else {
      console.log('Error updating language');
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error updating language',
      });
    }
  })
  .catch((error) => {
    console.log('Error updating language:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'An error occurred while updating the language',
    });
  });
};

  return (
    <div className="marquee-container">
    <div className='AddArea'>
      {/* <button className='btn btn-custom' onClick={() => handleClick("/admin/addAudio")}>Add Audio</button> */}
    </div><br/>
    <div className='container3 mt-10'>
      <ol className="breadcrumb mb-4">
        <li className="breadcrumb-item"><Link to="/admin/ViewLanguage">Languages</Link></li>
        <li className="breadcrumb-item active  text-white">{isEditMode ? 'Edit Language':'Add Language'}</li>
      </ol>
      <div className="container mt-3">
        <div className="row py-3 my-3 align-items-center">
          <div className="col-md-3">
            <label className="custom-label">Category Name</label>
          </div>
          <div className="col-md-4">
            <input 
              type='text'
              name='language_name'
              id='name'
              required
              value={languageName}
              onChange={(e) => setlanguageName(e.target.value)}
              className="form-control border border-dark" 
              placeholder="Language" 
            />
      </div>
    </div>
    <div className="row py-2 my-5">
      <div className="col-md-12" style={{ height: '200px' }}></div> {/* Placeholder div for spacing */}
    </div>
  
      <div className="mt-20 col-md-8 ms-auto text-end">
      <button className="border border-dark p-1.5 w-20 mr-5 text-black me-2 rounded-lg">Cancel</button>
        <button className="border border-dark p-1.5 w-20 mr-10 text-white rounded-lg " onClick={isEditMode ? handleUpdate :handleSubmit} style={{backgroundColor:'#2b2a52'}}
      >{isEditMode ? "Update" : "Submit"}</button>
      </div>
    </div>
  </div>
</div>
  
    

  );
};

export default AddLanguage;
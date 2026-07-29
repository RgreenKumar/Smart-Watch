import React, { useState, useEffect } from 'react';
import Navbar from './navbar';
import Sidebar from './sidebar';
import API_URL from '../Config';
import { useLocation,Link} from 'react-router-dom';
import axios from 'axios';
import "../css/Sidebar.css";
const EditAudio = () => {

  const location = useLocation();
  const { get } = location.state;
  console.log(get)
  const [updatedget, setUpdatedget] = useState(get);
  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [audioFile, setAudioFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoriesResponse = await axios.get(`${API_URL}/api/v2/GetAllCategories`);
        setCategories(categoriesResponse.data);
      } catch (error) {
        console.error(error);
        throw error;
      }
    };
    fetchData();
  }, []);

  // const handleFileChange = (e, setFile) => {
  //   const file = e.target.files[0];
  //   setFile(file);
  // };
  const handleInputChange = (e, setFile) => {
    const { name, value, files } = e.target;
  
    if (name === 'audioFile' || name === 'thumbnail') {
      const file = files[0];
      setFile(file);
    } else {
      setUpdatedget((prevCategory) => ({
        ...prevCategory,
        [name]: value,
      }));
  
      // Reset error for the field when it's changed
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: undefined,
      }));
    }
  };


  const handleUpdate = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('category', updatedget.category);
    formData.append('audioFile', audioFile);
    formData.append('thumbnail', thumbnail);

    fetch(`${API_URL}/api/v2/updateaudio/update/${get.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
      .then((response) => {
        if (response.ok) {
          console.log('Updated successfully');
          window.alert('Details successfully updated');
        } else {
          console.log('Error updating');
        }
      })
      .catch((error) => {
        console.log('Error updating category:', error);
        throw error;
        // Handle errors more specifically as needed
      });
  };

  
  return (
    <div id="content-wrapper" className="d-flex flex-column samp" style={{ marginLeft: "13rem"}}>

     <Sidebar />
    <div className="container-fluid">
  
      {/* <h1 className="mt-4 text-black">{updatedget.categories}'s Profile</h1> */}

      <ol className="breadcrumb mb-4">
        <li className="breadcrumb-item">
          <Link to="/Dashboard">Dashboard</Link>
        </li>
        <li className="breadcrumb-item active">Edit</li>
      </ol>
      <div className="row">
        <div className="col-lg-8">
          <div className="card mb-4">
            <div className="card-body">

            {/* <form onSubmit={handleSubmit}> */}
            <form>
            <div className='modal-header bg-info'>
                  <h5 className='modal-title' id='exampleModalLongTitle'>
                    Update Audio
                  </h5>
                </div>
                <div className='modal-body text-center'>
                    <label htmlFor="text">Category</label>
                    <select
                      className='form-control'
                      name='category'
                      value={updatedget.category}
                      onChange={handleInputChange}
                    >
                      <option value=''>{updatedget.category.categories}</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.categories}>
                          {category.categories}
                        </option>
                      ))}
                    </select>
                    <br />
                    <h5 className='modal-title modal-header bg-info' id='exampleModalLongTitle'>
                      Add New Audio File
                    </h5>
                    <input
                      type="file"
                      className='form-control'
                      name="audioFile"
                      
                      onChange={(e) => handleInputChange(e, setAudioFile)}
                    />
                    <br />
                    <h5 className='modal-title modal-header bg-info' id='exampleModalLongTitle'>
                      Add Thumbnail
                    </h5>
                    <input
                      type='file'
                      className='form-control'
                      name='thumbnail'
                      onChange={(e) => handleInputChange(e, setThumbnail)}
                    />
                     <div className='modal-footer'>
                      <input
                        type='submit'
                        onClick={handleUpdate}
                        name='but_upload'
                        value='Update'
                        className='btn btn-info'
                      />
                    </div>
                </div>
            </form>

            </div>
            </div>
            </div>
            </div>
     </div>
     </div> 
  )
}

export default EditAudio
import React, { useState, useEffect } from 'react';
import { useLocation,Link} from 'react-router-dom';
import Swal from 'sweetalert2';
import axios from 'axios';
import AudioPlayer from 'react-audio-player';
import API_URL from '../Config';


const Editaudio1 = () => {
  const id=localStorage.getItem('items');
    const  audioId=id
    const category = id && id.category && id.category.categories;
    const fileName = audioId.fileName;

    

  const [updatedget, setUpdatedget] = useState(audioId);
  console.log(updatedget.fileName)
  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [audioFile, setAudioFile] = useState(null);
  const [thumbnail, setThumbnail] = useState();
  const [filename, setfilename] = useState(fileName);
  const [categoryId, setCategoryId] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [audio,setaudio]=useState('')
  const token = sessionStorage.getItem('tokenn')

  
  


  useEffect(() => {
   
    

fetch(`${API_URL}/api/v2/GetAllCategories`)


  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    setCategories(data);
  })
  .catch(error => {
    console.error('Error fetching data:', error);
    throw error;
  });
}, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch image data
        const response = await fetch(`${API_URL}/api/v2/GetThumbnailsById/${audioId}`);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        // if (data && Array.isArray(data)) {
        //   setImage(data);
        if(response.ok){
            setThumbnail(`data:image/jpeg;base64,${data}`);

        } else {
          console.error('Invalid or empty data received:', data);
        }
      } catch (error) {
        console.error('Error fetching or processing image data:', error);
        throw error;
      }
    };
    fetchData();
}, [audioId]);

useEffect(() => {
  const fetchData = async () => {
    try {
      // Fetch audio data
      const response = await fetch(`${API_URL}/api/v2/audio/${audioId}`);

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setUpdatedget(data);
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    }
  };

  fetchData();
}, [audioId]);


useEffect(() => {
const fetchAudio = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/api/v2/${updatedget.fileName}/file`,
      {
        responseType: 'arraybuffer', // Set the response type to arraybuffer for binary data
      }
    );

    // Use the response data directly for arraybuffer
    const audioData = response.data;
    setAudioFile(audioData);
    console.log(audioData);

    // Now you can do something with the audioData, for example, set it to state or process it further.

  } catch (error) {
    console.error('Error fetching audio:', error);
    throw error;
  }
};
fetchAudio(); // Replace 'yourDefaultFileName' with the desired default file name
  }, [updatedget.fileName]);

  const handleChange = (e) => {
    const selectedCategoryId = e.target.value;
    setSelectedCategoryId(selectedCategoryId);
    setUpdatedget((updatedget) => ({ ...updatedget, category: Number(selectedCategoryId) }));
  };
  

  // const handleChange = (e) => {
  //   const { name, value } = e.target;

  //   setUpdatedget({ ...updatedget, [name]: value });
  // };

  // Function to convert file to Base64
  const convertImageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleAudioFChange = (e) => {
    const selectedFile = e.target.files[0];
    console.log("selectedfile",selectedFile)
    const name = e.target.files[0].name;
  
    if (selectedFile) {
      // Create a Blob from the selected file
      const blob = new Blob([selectedFile], { type: 'audio/mpeg' });
      console.log("blob is",blob)
  
      // Create a data URL from the Blob
      const fileURL = URL.createObjectURL(blob);
      console.log("fileurl",fileURL)
  
      // Set the file URL to state
      setUpdatedget((updatedget) => ({ ...updatedget, fileName: name }))
      setUpdatedget((updatedget) => ({ ...updatedget, audioFile:selectedFile  }))
  
      // Optionally, set the blob to a state for later use
      setAudioFile(blob);
      setfilename(name)
    } else {
      console.error("No file selected");
    }
  };
  

  // Handle file input change
  const handleFileChange = (e) => {
    // Update formData with the new file
    const file = e.target.files[0];

    // Convert the file to base64

    // Update formData with the new file
    setUpdatedget((updatedget) => ({ ...updatedget, thumbnail: file }));
    convertImageToBase64(file)
      .then((base64Data) => {
        // Set the base64 encoded image in the state
        setThumbnail(base64Data);
      })
      .catch((error) => {
        console.error("Error converting image to base64:", error);
      });
  };

  // Inside the handleupdate function
  const handleupdate = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
  
    // Appending thumbnail and audioFile to formData
    if (updatedget.thumbnail) {
      formData.append("thumbnail", updatedget.thumbnail);
    }
    if (updatedget.audioFile) {
      formData.append("audioFile", updatedget.audioFile);
    }
  
    // Appending category ID to formData
    if (updatedget.category && updatedget.category.id) {
      formData.append("category", updatedget.category.id); // Ensure this is the correct category ID
    }
  
    try {
      const response = await fetch(`${API_URL}/api/v2/updateaudio/update/${audioId}`, {
        method: "PATCH",
        body: formData,
        headers: {
          Authorization: token,
      }
      });
  
      const data = await response.json();
  
      if (response.ok) {
        // Handle successful response
        console.log("Update successful");
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Audio updated successfully!',
        });
      } else {
        // Handle error response
        console.error("Update failed", data);
        // Swal.fire({
        //   icon: 'error',
        //   title: 'Error',
        //   text: `Update failed: ${data.message || 'Unknown error'}`,
        // });
      }
    } catch (error) {
      // Handle network errors or other exceptions
      console.error("Error:", error);
      throw error;
      // Swal.fire({
      //   icon: 'error',
      //   title: 'Error',
      //   text: 'An error occurred while updating the audio.',
      // });
    }
  };

  return (

   
     
<div className='container2 mt-20'>
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
            <form>
            <div className='modal-header bg-info'>
                  <h5 className='modal-title' id='exampleModalLongTitle'>
                    Update Audio
                  </h5>
                </div>
                <div className='modal-body text-center'>
                <div className="form-group">
                <div className='col-lg-6'>
                      <label >category</label>
                    <select
                  className='form-control'
                  name='category'
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                >
                <option value=''>Select Category</option>
                    {categories.map((category) => (
                     <option key={category.id} value={category.id}>
                    {category.categories}
                </option>
                ))}
               </select>
                  {errors.categoryId && <div className="error-message">{errors.categoryId}</div>}
                  <br />
                    </div>
                    </div>
                    <h5 className='modal-title modal-header bg-info' id='exampleModalLongTitle'>
                      Add New thumbnail File
                    </h5>
              <label htmlFor="Audioname" className="color">
                Audio Image
              </label>
              
              <img
                src={thumbnail}
                alt="selected pic of course"
                style={{
                    display: 'block', // Ensure the image is displayed as a block element
                    margin: 'auto',   // Center the image horizontally
                    width: '50%',     // Set the width to 100% to ensure it takes up the full container width
                    height: '50%',    // Set the height to 100% to maintain the aspect ratio
                    objectFit: 'cover', // Use 'cover' to make sure the image covers the entire container without stretching
                    borderRadius: '8px',
                  }}
              />
              
              <br/>
              <input
                type="file"
                name="thumbnail"
                id="thumbnail"
                accept="image/png"
                placeholder="Upload Image"
                onChange={handleFileChange}
                
              />{" "}
              <br />
              <br/>
              <h5 className='modal-title modal-header bg-info' id='exampleModalLongTitle'>
                    Add New Audio File
                  </h5>
                  <label htmlFor="Audioname" className="color">
                Audio 
              </label>
              <p>{updatedget?.fileName?.replace(/^.*[\\\/]/, '').replace(/^.*_/, '').replace(/\.mp3$/, '')}</p>
              {audioFile ? (
              <AudioPlayer
                src={URL.createObjectURL(new Blob([audioFile], { type: 'audio/mpeg' }))}
                controls
                className="selected-audio"
                style={{
                  width: '100%',
                }}
                
              />
              ) : (
                <p>Loading audio...</p>
              )}
              
              <br />
              <input
                type="file"
                name="audioFile"
                id="audioFile"
                accept="audio/mpeg"
                placeholder="Upload Audio"
                onChange={handleAudioFChange}
                
              />{" "}
              <br />
              <div>
              <div className='modal-footer'>
                      <input
                        type='submit'
                        onClick={handleupdate}
                        name='but_upload'
                        value='Update'
                        className='btn btn-info'
                      />
                    </div>
              </div>
                </div>
            </form>

            </div> 
           </div>
          </div>
         </div>   
    </div>
    
  )
}

export default Editaudio1
import axios from 'axios';
import { Link } from 'react-router-dom';
import API_URL from '../Config';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'
import React, { useState, useEffect } from 'react';

const EditVideo = (receivedData) => {

    const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [categoryId, setCategoryId] = useState('');
  const [Certificate, setCertificate] = useState([]);
  const [certificateId, setCertificateId] = useState('');
  const [Language, setLanguage] = useState([]);
  const [LanguageId, setLanguageId] = useState('');
  const [Tag, setTag] = useState([]);
  const [TagId, setTagId] = useState('');
  const [thumbnail, setThumbnail] = useState(null);
  const [updatedata, setUpdatedata] = useState([]);
  const [paid, setpaid] =useState('');
  const [selectedOption, setSelectedOption] = useState('free');
  const [getall,setgetall] = useState('');
  const id=localStorage.getItem('items');
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [castandcrewlist, setcastandcrewlist] = useState([]);
  const [Getall,setGetall] = useState('');
  const token = sessionStorage.getItem('tokenn')

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };


  const handleCheckboxChange = (option) => {
    setcastandcrewlist(prevList => {
      if (prevList.some(person => person.id === option.id)) {
        return prevList.filter(person => person.id !== option.id);
      } else {
        return [...prevList, option];
      }
    });
  };


// // Function to handle checkbox change
// const handleCheckboxChange = (option) => (event) => {
//   const checked = event.target.checked;
//   if (checked) {
//     setcastandcrewlist([...castandcrewlist, option.id]);
//   } else {
//     setcastandcrewlist(castandcrewlist.filter(id => id !== option.id));
//   }
// };


  useEffect(() => {
    fetch(`${API_URL}/api/v2/GetAllcastandcrew`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setGetall(data);
        console.log(data);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        throw error;
      });
  }, []);


  useEffect(() => {
    fetch(`${API_URL}/api/v2/GetAllPlans`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setgetall(data);
        console.log(data)
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        throw error;
      });
  }, []);

  const handleRadioChange = (e) => {
    setSelectedOption(e.target.value);
};

const handlePaidRadioHover = () => {
  if (!hasPaymentPlan()) {
    Swal.fire({
      title: 'Error!',
      text: 'You first need to add a payment plan to enable this option.',
      icon: 'error',
      showCancelButton: true,
      confirmButtonText: 'Go to Add plan page',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        navigate('/admin/Adminplan');
      } else if (result.isDismissed) {
        console.log('Cancel was clicked');
      }
    });
  }
};


const hasPaymentPlan = () => {
     return getall.length > 0;
    // return false;
};

  // const fetchData = async () => {
    useEffect(() => {
   
        console.log("EditVideo="+id);
        
    
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

    fetch(`${API_URL}/api/v2/GetAllCertificate`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setCertificate(data);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        throw error;
      });

      fetch(`${API_URL}/api/v2/GetAllLanguage`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setLanguage(data);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        throw error;
      });

      fetch(`${API_URL}/api/v2/GetAllTag`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setTag(data);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        throw error;
      });

      const fetchData = async () => {
        try {
            const response = await fetch(`${API_URL}/api/GetvideoDetail/${id}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            
            const data = await response.json();
            console.log(data)
            setUpdatedata(data);
            setMovie_name(data.moviename);
            setCategoryId(data.category);
            setCertificateId(data.certificate);
            setDescription(data.description);
            setDuration(data.duration);
            setLanguageId(data.language)
            setTagId(data.tags);
            setYear(data.year);
            setSelectedOption(data.paid ? 'paid' : 'free');

            
        // Log the movie name here
        } catch (error) {
            console.error('Error fetching data:', error);
            throw error;
        }
    };

    fetchData();
  
    

      


    }, []);

  // fetchData();
  const handleFileChange = (event) => {


   
    // changeCast_Crew();
    // changeDescription();
    // changeDuration();
    // changeYear();
    // changeMovie_name();

  };
  const [Movie_name, setMovie_name] = useState('');
  const changeMovie_name = (event) => {
    const newValue = event.target.value;
    setMovie_name(newValue); // Updating the state using the setter function
  };
  const [Year, setYear] = useState('');
  const changeYear = (event) => {
    const newValue = event.target.value;
    setYear(newValue); // Updating the state using the setter function
  };
  const [Duration, setDuration] = useState('');
  const changeDuration = (event) => {
    const newValue = event.target.value;
    setDuration(newValue); // Updating the state using the setter function
  };
  const [Description, setDescription] = useState('');
  const changeDescription = (event) => {
    const newValue = event.target.value;
    setDescription(newValue); // Updating the state using the setter function
  };
  const [Cast_Crew, setCast_Crew] = useState('');
  const changeCast_Crew = (event) => {
    const newValue = event.target.value;
    setCast_Crew(newValue); // Updating the state using the setter function
  };

  // const handleFileChange = (event) => {
  //   // changeCast_Crew();
  //   // changeDescription();
  //   // changeDuration();
  //   // changeYear();
  //   // changeMovie_name();

  // };
  const handleFile = (event) => {
    // setThumbnail(event.target.files[0]);
    setFile(event.target.files[0]);
  };

  const Upload = async (props) => {
    try {
      const formData = new FormData();
      formData.append('video', file);

      const response = await axios.post(`${API_URL}/api/v2/postit`, formData, {

      headers: {
        'Content-Type': 'multipart/form-data',
      },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
          setUploadProgress(progress);
        }
      });
      console.log(response.data);

      console.log('Upload successful!', response.data);
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };
  
  
  

  
  const save = async (e) => {
    e.preventDefault();

    try {
        const formData = new FormData();
        formData.append('Movie_name', Movie_name);
        formData.append('description', Description);
        formData.append('tags', TagId);
        formData.append('category', categoryId);
        formData.append('certificate', certificateId);
        formData.append('Language', LanguageId);
        formData.append('Duration', Duration);
        formData.append('Year', Year);
        formData.append('paid', selectedOption === 'paid' ? 'true' : 'false');
        formData.append('id', updatedata.id);

        const response = await axios.post(`${API_URL}/api/v2/updatedescriprioni`, formData, {
            headers: {
                Authorization: token,
                'Content-Type': 'multipart/form-data'
            },
            onUploadProgress: (progressEvent) => {
                const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
                setUploadProgress(progress);
            }
        });

        console.log(response.data);
        Swal.fire({
            title: 'Success',
            text: 'The video description has been updated successfully!',
            icon: 'success',
            confirmButtonText: 'OK'
        });
    } catch (error) {
        console.error('Error updating video description:', error);
        throw error;
        // Swal.fire({
        //     title: 'Error',
        //     text: 'There was an error updating the video description.',
        //     icon: 'error',
        //     confirmButtonText: 'OK'
        // });
    }
};




  return (
      
    <div className='container2 mt-20'>
          {/* <h1 className="mt-4 text-white">Add Video</h1> */}
          <ol className="breadcrumb mb-4">
          <li className="breadcrumb-item"><Link to="/admin/Video">Videos</Link>
            </li>
            <li className="breadcrumb-item active  text-white">Update Video</li>
          </ol>
          <div className='row justify-content-center'>
            <div className='col-lg-12'>
              <div className="card shadow-lg border-0 rounded-lg mt-5" style={{ marginLeft: "0px", marginRight: "0px",minWidth: "100%" }} >
                <div className='card-header'>
                  <h2 className='text-center'>Add Movie</h2>
                </div>
                <div className='card-body'>
                  {/* <form className='form-container'> */}
                  <div className='modal-body '>
                    <div className='row'>
                    <div className='col-lg-6'>
                      <label >Movie_name</label>
                    <input
                      type="text"
                      name="Movie_name"
                      // className={`form-control ${errors.confirmPassword ? 'error' : ''}`}
                      className="form-control"
                      onChange={changeMovie_name}
                      value={Movie_name}
                    />
                    </div>
                    <div className='col-lg-6'>
                      <label >Year</label>
                    <input
                      type="text"
                      name="Movie_name"
                      // className={`form-control ${errors.confirmPassword ? 'error' : ''}`}
                      className="form-control"
                      onChange={changeYear}
                      value={Year}
                    />
                    </div>
                    </div>
                    <br></br>
                    <div className='row'>
                    <div className='col-lg-6'>
                      <label >Tag</label>
                      <select
                  className='form-control'
                  name='category'
                  value={TagId}
                  onChange={(e) => setTagId(e.target.value)}
                >
                <option value=''>Select Tag</option>
                    {Tag.map((Tags) => (
                     <option key={Tags.id} value={Tags.tag}>
                    {Tags.tag}
                </option>
                ))}
               </select>
                  {errors.categoryId && <div className="error-message">{errors.categoryId}</div>}
                  <br />
                    </div>
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
                     <option key={category.id} value={category.categories}>
                    {category.categories}
                </option>
                ))}
               </select>
                  {errors.categoryId && <div className="error-message">{errors.categoryId}</div>}
                  <br />
                    </div>
                    </div>
                    <br></br>
                    <div className='row'>
                    <div className='col-lg-6'>
                      <label >Certificate</label>
                      <select
                  className='form-control'
                  name='category'
                  value={certificateId}
                  onChange={(e) => setCertificateId(e.target.value)}
                >
                <option value=''>Select Certificate</option>
                    {Certificate.map((certificate) => (
                     <option key={certificate.id} value={certificate.certificate}>
                    {certificate.certificate}
                </option>
                ))}
               </select>
                  {errors.certificateId && <div className="error-message">{errors.certificateId}</div>}
                  <br />
                    </div>
                    <div className='col-lg-6'>
                      <label >Language</label>
                      <select
                  className='form-control'
                  name='category'
                  value={LanguageId}
                  onChange={(e) => setLanguageId(e.target.value)}
                >
                <option value=''>Select Language</option>
                    {Language.map((language) => (
                     <option key={language.id} value={language.language}>
                    {language.language}
                </option>
                ))}
               </select>
                  {errors.certificateId && <div className="error-message">{errors.certificateId}</div>}
                  <br />
                    </div>
                    </div>
                    <br></br>
                    <div className='row'>
                    <div className='col-lg-6'>
                      <label >Duration</label>
                    <input
                      type="text"
                      name="Movie_name"
                      // className={`form-control ${errors.confirmPassword ? 'error' : ''}`}
                      className="form-control"
                      onChange={changeDuration}
                      value={Duration}
                    />
                    </div>
                    <div className='col-lg-6'>
                      <label >Description</label>
                    <input
                      type="text"
                      name="Description"
                      // className={`form-control ${errors.confirmPassword ? 'error' : ''}`}
                      className="form-control"
                      onChange={changeDescription}
                      value={Description}
                    />
                    </div>
                    </div>
                    <br></br>
                    <div className='row'>
                    {/* <div className='col-lg-6'>
                      <label >Cast&Crew</label>
                    <input
                      type="text"
                      name="Tags"
                      // className={`form-control ${errors.confirmPassword ? 'error' : ''}`}
                      className="form-control"
                      onChange={changeCast_Crew}
                      value={Cast_Crew}
                    />
                    </div> */}

<br />

{/* <div className='temp'>
  <div className="col-lg-6">
    <label>Cast & Crew</label>
    <div className="dropdown-container">
      <div className="dropdown">
        <button
          type="button"
          className="btn btn-secondary dropdown-toggle form-control"
          onClick={toggleDropdown}
        >
          {castandcrewlist.length > 0 ? 'Selected' : 'Select Cast & Crew'}
        </button>
        {isOpen && (
          <div className="dropdown-menu show">
            {Getall.map(option => (
              <div key={option.id} className="dropdown-item">
                <input
                  type="checkbox"
                  value={option.name}
                  checked={castandcrewlist.includes(option.id)}
                  onChange={handleCheckboxChange(option)}
                />
                <label className="ml-2">{option.name}</label>
              </div>
            ))}
          </div>
        )}
      </div>
      {castandcrewlist.length > 0 && (
        <div className="selected-items">
          <label>Selected:</label>
          {castandcrewlist.map(person => (
            <div key={person.id}>
              {person.name}
            </div>
          ))}
        </div>
      )}
  
    </div>
  </div>
</div> */}


{/* <div className='temp'>
      <div className="col-lg-6">
        <label>Cast & Crew</label>
        <div className="dropdown-container">
          <div className="dropdown">
            <button
              type="button"
              className="btn btn-secondary dropdown-toggle form-control"
              onClick={toggleDropdown}
            >
              {castandcrewlist.length > 0 ? 'Selected' : 'Select Cast & Crew'}
            </button>
            {isOpen && (
              <div className="dropdown-menu show">
                {Getall.map(option => (
                  <div key={option.id} className="dropdown-item">
                    <input
                      type="checkbox"
                      value={option.name}
                      checked={castandcrewlist.some(person => person.id === option.id)}
                      onChange={() => handleCheckboxChange(option)}
                    />
                    <label className="ml-2">{option.name}</label>
                  </div>
                ))}
              </div>
            )}
          </div>
          {castandcrewlist.length > 0 && (
            <div className="selected-items">
              <label>Selected:</label>
              {castandcrewlist.map(person => (
                <div key={person.id}>
                  {person.name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div> */}

<h5 className='modal-title modal-header' style={{ fontFamily: 'Poppins' }}>
                      Choose Pricing Option
                  </h5>
                  <div className='temp'>
    <div className='col-lg-1'>
        <label>
            <input
                type="radio"
                value="free"
                checked={selectedOption === 'free'}
                onChange={handleRadioChange}
            />
            Free
        </label>
    </div>
    <div className='col-lg-1'>
        <label>
        <div
          className={`radio-button${selectedOption === 'paid' ? ' selected' : ''}`}
          onMouseEnter={handlePaidRadioHover}
          onClick={() => {
              if (hasPaymentPlan()) {
                  setSelectedOption('paid');
              }
          }}
      >
            <input
                type="radio"
                value="paid"
                checked={selectedOption === 'paid'}
                disabled={!hasPaymentPlan()}
                onChange={() => {
                    if (hasPaymentPlan()) {
                        setSelectedOption('paid');
                    }
                }}
               
            />
            Paid
            </div>
        </label>
    </div>
</div>


                    {/* <div className='col-lg-6'>
                      <label >Name</label>
                    <input
                      type="text"
                      name="confirmPassword"
                      // className={`form-control ${errors.confirmPassword ? 'error' : ''}`}
                      className="form-control"
                      onChange={""}
                      value={"categoryName"}
                    />
                    </div>*/}
                    </div> 
                    
                    {/* <br></br>
                    <input
                      type="text"
                      name="confirmPassword"
                      // className={`form-control ${errors.confirmPassword ? 'error' : ''}`}
                      className="form-control"
                      onChange={''}
                      value={'categoryName'}
                    /> */}
                    <br></br>
                    {/* <input
                      type="text"
                      name="confirmPassword"
                      // className={`form-control ${errors.confirmPassword ? 'error' : ''}`}
                      className="form-control"
                      onChange={''}
                      value={'categoryName'}
                    /> */} 
                    {/* <label >Thumbnail</label>
                    <br></br>
                    <input
          type='file'
          className='form-control'
          placeholder='Choose Thumbnail'
          name='thumbnail'
          onChange={(e) => setThumbnail(e.target.files[0])}
        /> */}
        {/* <label >AddMovie</label> */}
         <br></br>
                    {/* <input type="file" accept="video/*" onChange={handleFile} />
                    {uploadProgress > 0 && <p>Upload Progress: {uploadProgress}%</p>} */}
                    <br></br>
                    {/* <br></br>
                    <button className='text-center btn btn-info' onClick={save}>Add_Details</button>&nbsp;&nbsp; */}
                    {/* <Link to="/admin/AddMovie" className="btn btn-info">Add</Link>&nbsp;&nbsp; */}
                    {/* <button className='text-center btn btn-info' onClick={Upload}>Upload</button>&nbsp;&nbsp; */}
                   
                    {/* <button className='text-center btn btn-info' > */}
                    {/* <Link to="/admin/Watch" className="btn btn-info">Play</Link> */}
                    {/* <Link to="#" className="btn btn-info"></Link> */}
                    <button className='text-center btn btn-info' onClick={save}>Save</button>
                    {/* </button> */}
                    {uploadProgress > 0 && <p>Updating Progress: {uploadProgress}%</p>}

                  </div>

                  {/* </form> */}
                </div>
              </div>
            </div>
          </div>
        </div>
    
  
  )
}

export default EditVideo
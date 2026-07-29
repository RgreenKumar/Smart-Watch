import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { Link } from 'react-router-dom';
import "../css/Sidebar.css";
import API_URL from '../Config';
import ReactPlayer from 'react-player';

const AddAds = () => {
  const [adName, setAdName] = useState('');
  const token = sessionStorage.getItem("tokenn");

  const [Certificate, setCertificate] = useState([]);
  const [Certificateid, setCertificateid] = useState('');
  const [Certificatename, setCertificatename] = useState('');
  const [error, setError] = useState('');
  const [Certificate_no, setCertificate_no] = useState('');
  const [rollad, setRollAd] = useState('');
  const [Views, setViews] = useState('');
  const [videoUrl, setVideoUrl] = useState(null);
  const [videofile, setVideofile] = useState(null);

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleVideoDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('video/')) {
      setVideofile(file);
      setVideoUrl(URL.createObjectURL(file));
    } else {
      alert('Please drop a valid video file!');
    }
  };

  const handleVideoFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('video/')) {
      setVideofile(file);
      setVideoUrl(URL.createObjectURL(file));
      setError('');
    } else {
      setError('Only video files are accepted.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append("adName", adName);
    formData.append("certificateNumber", Certificate_no);
    formData.append("certificateName", Certificatename);
    formData.append("numberOfViews", Views);
    formData.append("rollType", rollad);
    formData.append("videoFile", videofile);

    fetch(`${API_URL}/api/v2/AddAds`, {
        method: 'POST',
        headers: {
            Authorization: token,
        },
        body: formData,
    })
    .then(response => {
        if (response.ok) {
            return response.json(); // Convert the response to JSON
        } else {
            throw new Error('Failed to insert ad');
        }
    })
    .then(data => {
        console.log("Response Data:", data); // Log the response data

        // Check if the response contains ad details and an ID (indicating success)
        if (data && data.id) {
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: 'Ad inserted successfully!',
            });

            // Reset form fields
            setAdName('');
            setCertificateid('');
            setCertificatename('');
            setViews('');
            setRollAd('');
            setVideofile(null);
            setVideoUrl(null);
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error occurred while inserting Ad.',
            });
        }
    })
    .catch(error => {
        console.error('Error:', error); // Log any error during the fetch
        // Swal.fire({
        //     icon: 'error',
        //     title: 'Error',
        //     text: 'An error occurred while inserting the ad.',
        // });
        throw error
    });
};

  
  const showAdPreview = () => {
    Swal.fire({
      title: adName,
      html: `
        <p>Certificate Number: ${Certificate_no}</p>
        <p>Certificate Name: ${Certificatename}</p>
        <p>Views: ${Views}</p>
        <p>Roll Type: ${rollad}</p>
        <div style="position: relative; width: 100%; height: 0; padding-top: 56.25%; background: black;">
          <video controls style="position: absolute; top: 0; left: 0; width: 100%; height: 100%">
            <source src="${videoUrl}" type="video/mp4">
            Your browser does not support the video tag.
          </video>
        </div>
      `,
      showCloseButton: true,
      focusConfirm: false,
    });
  };
  
  // Edit mode
  const [isEditMode, setIsEditMode] = useState(false);
  const adId = localStorage.getItem('items');

  useEffect(() => {
    // Fetching data from the API
    fetch(`${API_URL}/api/v2/GetAllCertificate`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        setCertificate(data); // Storing the fetched data in the state
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        throw error
      });
  }, []);
  useEffect(() => {
    if (adId) {
      setIsEditMode(true);
      fetch(`${API_URL}/api/v2/GetAdById/${adId}`)
        .then(response => response.json())
        .then(data => {
          console.log(data); // Log the full data response
          setAdName(data.adName || '');
          setCertificate_no(data.certificateNumber || '');
          setCertificatename(data.certificateName || '');
          setViews(data.views || '');
          setRollAd(data.rollType || ''); // Ensure default value for rollad
          setVideoUrl(`${API_URL}/${data.videoFilePath.replace(/\\/g, '/')}`); // For preview
          setVideofile(null); // Reset file input
        })
        .catch(error => {console.error('Error fetching ad details:', error);throw error; })
    }
  }, [adId]);
  
  const handleUpdate = (e) => {
    e.preventDefault();
  
    const formData = new FormData();
    formData.append("adName", adName);
    formData.append("certificateNumber", Certificate_no);
    formData.append("certificateName", Certificatename);
    formData.append("numberOfViews", Views);
    formData.append("rollType", rollad);
  
    // If a new video file is selected, append it
    if (videofile) {
      formData.append("videoFile", videofile);
    }
  
    fetch(`${API_URL}/api/v2/editAd/${adId}`, {
      method: 'PATCH',
      headers: {
        Authorization: token,
      },
      body: formData, // Send FormData with video file if available
    })
      .then(response => {
        if (response.ok) {
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Ad details successfully updated',
          });
        } 
      })
      .catch(error => {
        // Swal.fire({
        //   icon: 'error',
        //   title: 'Error',
        //   text: 'An error occurred while updating the ad',
        // });
        throw error;
      });
  };
  

  return (
    <div className="marquee-container">
      <div className="AddArea"></div><br />
      <div className="container3 mt-10">
        <ol className="breadcrumb mb-4">
          <li className="breadcrumb-item"><Link to="/admin/Ads">Ads</Link></li>
          <li className="breadcrumb-item active text-white">{isEditMode ? 'Edit Ads' : 'Add Ads'}</li>
        </ol>
        <div className="container mt-3">
          <div className="row py-3 my-3">
            <div className="col-md-6">
              {/* Left Side Inputs */}
              <div className="form-group d-flex align-items-center mb-8">
                <label className="custom-label me-3" style={{ width: '50%' }}>Ads Video Title</label>
                <input
                  type='text'
                  name='adname'
                  id='adname'
                  required
                  value={adName}
                  onChange={(e) => setAdName(e.target.value)}
                  className="form-control border border-dark"
                  placeholder="Ad Name"
                />
              </div>
              <div className="form-group d-flex align-items-center mb-8">
                <label className="custom-label me-3" style={{ width: '50%' }}>Certificate No</label>
                <input
                  type='text'
                  name='certificate_no'
                  id='certificate_no'
                  className="form-control border border-dark"
                  placeholder="Certificate Number"
                  value={Certificate_no}
                  onChange={(e) => setCertificate_no(e.target.value)}
                />
              </div>
              <div className="form-group d-flex align-items-center mb-8">
                <label className="custom-label me-3" style={{ width: '50%' }}>Original Video</label>
                <div className="flex-grow-1">
    <div className="d-flex align-items-center">
      <div
        className="drag-drop-area border border-dark text-center"
        onDrop={handleVideoDrop}
        onDragOver={handleDragOver}
        style={{ backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        {videoUrl ? (
          <ReactPlayer
            url={videoUrl}
            controls
            width="100%"
            height="100%"
            config={{
              file: {
                attributes: { controlsList: 'nodownload' },
              },
            }}
          />
        ) : (
          <span>Drag and drop</span>
        )}
      </div>
      <button
        type="button"
        className="border border-dark p-1 bg-silver ml-2 choosefile"
        onClick={() => document.getElementById('fileInputvideofile').click()}
      >
        Choose File
      </button>
      <input
        type="file"
        id="fileInputvideofile"
        style={{ display: 'none' }}
        onChange={handleVideoFileChange} // Handle file changes
      />
    </div>
    <div className="mt-2">
      <span>Please choose mp4 format only*</span>
    </div>
    {error && <div className="text-danger">{error}</div>}
  </div>

              </div>
            </div>
            <div className="col-md-6">
              {/* Right Side Inputs */}
              <div className="form-group d-flex align-items-center mb-8">
                <label className="custom-label me-3" style={{ width: '50%' }}>Certificate Name</label>
                <select
                  name='certificate_name'
                  id='certificate_name'
                  required
                  className="form-control border border-dark input-width"
                  value={Certificatename}
                  onChange={(e) => {
                    const selectedIndex = e.target.options.selectedIndex;
                    setCertificateid(e.target.value);
                    setCertificatename(e.target.options[selectedIndex].text);
                  }}
                >
                   <option value="">Select certificate</option>
        {Certificate.map(cert => (
          <option key={cert.id} value={cert.value}>
            {cert.certificate}
          </option>
        ))}
                </select>
              </div>
              <div className="form-group d-flex align-items-center mb-8">
                <label className="custom-label me-3" style={{ width: '50%' }}>No of Views</label>
                <input
                  type='number'
                  name='views'
                  id='views'
                  className="form-control border border-dark"
                  value={Views}
                  onChange={(e) => setViews(e.target.value)}
                />
              </div>

              {/* Roll Ads */}
              <div className="form-group d-flex align-items-center mb-8">
                <label className="custom-label me-3" style={{ width: '30%' }}>Roll Ads</label>
                <div className="d-flex">
                  <div className="form-check me-3">
                    <input
                      type="radio"
                      name="rollad"
                      id="rolladSkip"
                      value="skip"
                      checked={rollad === 'skip'}
                      onChange={(e) => setRollAd(e.target.value)}
                      className="form-check-input"
                    />
                    <label className="form-check-label" htmlFor="rolladSkip">Skip Ads</label>
                  </div>
                  <div className="form-check">
                    <input
                      type="radio"
                      name="rollad"
                      id="rolladNonSkip"
                      value="nonSkip"
                      checked={rollad === 'nonSkip'}
                      onChange={(e) => setRollAd(e.target.value)}
                      className="form-check-input"
                    />
                    <label className="form-check-label" htmlFor="rolladNonSkip">Non Skip Ads</label>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-20 col-md-8 ms-auto text-end">
            <button className="border border-dark p-1.5 w-20 mr-5 text-black me-2 rounded-lg">Cancel</button>
            <button
              className="border border-dark p-1.5 w-20 mr-10 text-white rounded-lg"
              onClick={isEditMode ? handleUpdate : handleSubmit}
              style={{ backgroundColor: '#2b2a52' }}
            >
              {isEditMode ? "Update" : "Submit"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddAds;
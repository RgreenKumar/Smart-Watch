import axios from 'axios';
import { Link } from 'react-router-dom';
import API_URL from '../Config';
import "../css/Sidebar.css";
import "../App.css"
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'
import React, { useState, useEffect, useRef } from 'react';
import ReactPlayer from 'react-player';


const AddVideo = () => {

  /* submit mode */
  const [videoTitle, setVideoTitle] = useState('');
  const [mainVideoDuration, setMainVideoDuration] = useState('');
  const [language, setLanguage] = useState('');
  const [languageOptions, setLanguageOptions] = useState([]);
  const [trailerDuration, setTrailerDuration] = useState('');
  const [certificateName, setCertificateName] = useState('');
  const [Certificate, setCertificate] = useState([]);
  const [rating, setRating] = useState('');
  const [certificateNumber, setCertificateNumber] = useState('');
  const [videoAccessType, setVideoAccessType] = useState('free');
  const [castandcrewlist, setcastandcrewlist] = useState([]);
  const [castandcrewlistvalue, setcastandcrewlistvalue] = useState([]);
  const [description, setdescription] = useState('');
  const [productionCompany, setProductionCompany] = useState('');

  const [taglist, settaglist] = useState([]);
  const [Tag, setTag] = useState([]);
  const [taglistvalue, settaglistvalue] = useState([]);

  const [getall, setgetall] = useState([]);
  const [Getall, setGetall] = useState([]);

  const [category, setCategory] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoriesvaluelist, setcategoriesvaluelist] = useState([]);

  const [currentStep, setCurrentStep] = useState(1);

  const [videothumbnail, setvideothumbnail] = useState(null);
  const [videothumbnailUrl, setvideothumbnailUrl] = useState(null);

  const [trailerthumbnail, settrailerthumbnail] = useState(null);
  const [trailerthumbnailUrl, settrailerthumbnailUrl] = useState(null);

  const [userbanner, setuserbanner] = useState(null);
  const [userbannerUrl, setuserbannerUrl] = useState(null);

  const [error, setError] = useState('');
  // ✅ FIX: Read token correctly (consistent key)
  const token = sessionStorage.getItem("tokenn");

  const [isOpencast, setIsOpencast] = useState(false);
  const [isOpentag, setIsOpentag] = useState(false);
  const [isOpencategory, setIsOpencategory] = useState(false);
  const [numOfAds, setNumOfAds] = useState("");
  const [adTimes, setAdTimes] = useState([]);

  const addAdTime = () => {
    const adsToCreate = parseInt(numOfAds, 10);
    if (!isNaN(adsToCreate) && adsToCreate >= 0) {
      if (adsToCreate < adTimes.length) {
        alert("The value must not be less than the current number of ads.");
      } else if (adsToCreate > adTimes.length) {
        const additionalAds = Array(adsToCreate - adTimes.length).fill("00:00:00");
        setAdTimes([...adTimes, ...additionalAds]);
      }
    } else {
      alert("Please enter a valid number of ads.");
    }
  };

  const [editingIndex, setEditingIndex] = useState(null);
  const [tempAdTime, setTempAdTime] = useState("");

  const editAdTime = (index) => {
    setEditingIndex(index);
    setTempAdTime(adTimes[index]);
  };

  const saveAdTime = (index) => {
    const updatedAdTimes = [...adTimes];
    updatedAdTimes[index] = tempAdTime;
    setAdTimes(updatedAdTimes);
    setEditingIndex(null);
  };

  const cancelEditAdTime = () => {
    setEditingIndex(null);
  };

  const deleteAdTime = (index) => {
    const updatedAdTimes = adTimes.filter((_, i) => i !== index);
    setAdTimes(updatedAdTimes);
  };

  const nextStep = () => setCurrentStep(currentStep + 1);
  const prevStep = () => setCurrentStep(currentStep - 1);

  const navigate = useNavigate();

  const dropdownRefcast = useRef(null);
  const dropdownReftag = useRef(null);
  const dropdownRefcategory = useRef(null);

  useEffect(() => {
    const handleClickOutsidecast = e => {
      if (dropdownRefcast.current && !dropdownRefcast.current.contains(e.target)) setIsOpencast(false);
    };
    document.addEventListener('mousedown', handleClickOutsidecast);
    return () => document.removeEventListener('mousedown', handleClickOutsidecast);
  }, []);

  useEffect(() => {
    const handleClickOutsidetag = e => {
      if (dropdownReftag.current && !dropdownReftag.current.contains(e.target)) setIsOpentag(false);
    };
    document.addEventListener('mousedown', handleClickOutsidetag);
    return () => document.removeEventListener('mousedown', handleClickOutsidetag);
  }, []);

  useEffect(() => {
    const handleClickOutsidecategory = e => {
      if (dropdownRefcategory.current && !dropdownRefcategory.current.contains(e.target)) setIsOpencategory(false);
    };
    document.addEventListener('mousedown', handleClickOutsidecategory);
    return () => document.removeEventListener('mousedown', handleClickOutsidecategory);
  }, []);

  const toggleDropdowncast = () => setIsOpencast(!isOpencast);
  const toggleDropdowntag = () => setIsOpentag(!isOpentag);
  const toggleDropdowncategory = () => setIsOpencategory(!isOpencategory);

  const handleCheckboxChange = (option) => (e) => {
    const isChecked = e.target.checked;
    const id = option.id;
    const selectedCastName = option.name;
    setcastandcrewlist(prev => isChecked ? [...prev, id] : prev.filter(item => item !== id));
    setcastandcrewlistvalue(prev => isChecked ? [...prev, selectedCastName] : prev.filter(n => n !== selectedCastName));
  };

  const handleCheckboxChangetag = (option) => (e) => {
    const isChecked = e.target.checked;
    const id = option.tag_id;
    const selectedTagName = option.tag;
    settaglist(prev => isChecked ? [...prev, id] : prev.filter(item => item !== id));
    settaglistvalue(prev => isChecked ? [...prev, selectedTagName] : prev.filter(n => n !== selectedTagName));
  };

  const handleCheckboxChangecategory = (option) => (e) => {
    const isChecked = e.target.checked;
    const id = option.category_id;
    const selectedName = option.categories;
    setCategory(prev => isChecked ? [...prev, id] : prev.filter(item => item !== id));
    setcategoriesvaluelist(prev => isChecked ? [...prev, selectedName] : prev.filter(n => n !== selectedName));
  };

  // Fetch cast and crew
  useEffect(() => {
    fetch(`${API_URL}/api/v2/GetAllcastandcrew`)
      .then(r => r.ok ? r.json() : Promise.reject('Failed'))
      .then(data => setGetall(data))
      .catch(err => console.error('Error fetching cast and crew:', err));
    // ✅ FIX: Removed "throw error" from all catch blocks
  }, []);

  // Fetch payment plans
  useEffect(() => {
    fetch(`${API_URL}/api/v2/GetAllPlans`)
      .then(r => r.ok ? r.json() : Promise.reject('Failed'))
      .then(data => setgetall(data))
      .catch(err => console.error('Error fetching plans:', err));
  }, []);

  // Fetch categories, certificates, tags
  useEffect(() => {
    fetch(`${API_URL}/api/v2/GetAllCategories`)
      .then(r => r.ok ? r.json() : Promise.reject('Failed'))
      .then(data => setCategories(data))
      .catch(err => console.error('Error fetching categories:', err));

    fetch(`${API_URL}/api/v2/GetAllCertificate`)
      .then(r => r.ok ? r.json() : Promise.reject('Failed'))
      .then(data => setCertificate(data))
      .catch(err => console.error('Error fetching certificates:', err));

    fetch(`${API_URL}/api/v2/GetAllTag`)
      .then(r => r.ok ? r.json() : Promise.reject('Failed'))
      .then(data => setTag(data))
      .catch(err => console.error('Error fetching tags:', err));

    // ✅ FIX: Fetch language options so user can select instead of type
    fetch(`${API_URL}/api/v2/GetAllLanguage`)
      .then(r => r.ok ? r.json() : Promise.reject('Failed'))
      .then(data => setLanguageOptions(data))
      .catch(err => console.error('Error fetching languages:', err));
  }, []);

  const handleRadioChange = (e) => setVideoAccessType(e.target.value);

  const hasPaymentPlan = () => getall.length > 0;

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
        if (result.isConfirmed) navigate('/admin/Adminplan');
      });
    }
  };

  // File handlers
  const handleFile = (file) => {
    if (!file) return;
    setvideothumbnail(file);
    const reader = new FileReader();
    reader.onloadend = () => setvideothumbnailUrl(reader.result);
    reader.readAsDataURL(file);
  };
  const handleFileInput = (e) => handleFile(e.target.files[0]);
  const handleDrop = (e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); };
  const handleDragOver = (e) => e.preventDefault();

  const handleFileuserbanner = (file) => {
    if (!file) return;
    setuserbanner(file);
    const reader = new FileReader();
    reader.onloadend = () => setuserbannerUrl(reader.result);
    reader.readAsDataURL(file);
  };
  const handleFileInputuserbanner = (e) => handleFileuserbanner(e.target.files[0]);
  const handleDropuserbanner = (e) => { e.preventDefault(); handleFileuserbanner(e.dataTransfer.files[0]); };

  const handleFiletrailerthumbnail = (file) => {
    if (!file) return;
    settrailerthumbnail(file);
    const reader = new FileReader();
    reader.onloadend = () => settrailerthumbnailUrl(reader.result);
    reader.readAsDataURL(file);
  };
  const handleFileInputtrailerthumbnail = (e) => handleFiletrailerthumbnail(e.target.files[0]);
  const handleDroptrailerthumbnail = (e) => { e.preventDefault(); handleFiletrailerthumbnail(e.dataTransfer.files[0]); };

  const [videoUrl, setVideoUrl] = useState(null);
  const [videofile, setvideofile] = useState(null);
  const [trailerUrl, settrailerUrl] = useState(null);
  const [trailerfile, setTrailerfile] = useState(null);

  const handletrailerFileChange = (e) => {
    const file = e.target.files[0];
    setTrailerfile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      settrailerUrl(url);
      // ✅ FIX: Extract trailer duration (was missing — trailerDuration stayed blank)
      const videoEl = document.createElement("video");
      videoEl.src = url;
      videoEl.onloadedmetadata = () => setTrailerDuration(formatDuration(videoEl.duration));
    }
  };

  const formatDuration = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    return [h, m, s].map(u => String(u).padStart(2, "0")).join(":");
  };

  const handleVideoFileChange = (e) => {
    const file = e.target.files[0];
    setvideofile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      const videoEl = document.createElement("video");
      videoEl.src = url;
      videoEl.onloadedmetadata = () => setMainVideoDuration(formatDuration(videoEl.duration));
    }
  };

  const handleVideoDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    setvideofile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      const videoEl = document.createElement("video");
      videoEl.src = url;
      videoEl.onloadedmetadata = () => setMainVideoDuration(formatDuration(videoEl.duration));
    }
  };

  const handletrailerDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    setTrailerfile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      settrailerUrl(url);
      // ✅ FIX: Extract trailer duration on drop too
      const videoEl = document.createElement("video");
      videoEl.src = url;
      videoEl.onloadedmetadata = () => setTrailerDuration(formatDuration(videoEl.duration));
    }
  };

  // ✅ FIX: Corrected save() - fixed Swal.mixin usage (removed invalid "timer" from update call)
  // and removed "throw error" from catch so error dialog shows instead of crashing
  // ─── DASH status poller ────────────────────────────────────────────────────
  // After the upload API returns (instantly now), we poll GET /dashstatus/{id}
  // every 5 s and update the Swal dialog so the admin can see live progress.
  // When status = READY or FAILED we stop polling and show the final result.
  const pollDashStatus = (videoId) => {
    let attempts = 0;
    const MAX_ATTEMPTS = 120; // 120 × 5 s = 10 min max wait

    // Show a persistent "Processing..." dialog that stays open during polling
    Swal.fire({
      icon: 'info',
      title: 'Processing...',
      html: 'Video uploaded ✓ &mdash; Processing video in background&hellip;',
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => Swal.showLoading(),
    });

    const interval = setInterval(async () => {
      attempts++;
      try {
        const res = await fetch(`${API_URL}/api/v2/dashstatus/${videoId}`, {
          headers: { Authorization: token },
        });
        if (!res.ok) return; // transient error — keep polling

        const data = await res.json();
        const status = data.dashStatus;

        if (status === 'READY') {
          clearInterval(interval);
          Swal.fire({
            icon: 'success',
            title: 'Video Ready!',
            text: 'Video saved successfully.',
            timer: 2500,
            showConfirmButton: false,
          }).then(() => navigate('/admin/Video'));

        } else if (status === 'FAILED') {
          clearInterval(interval);
          Swal.fire({
            icon: 'warning',
            title: 'Processing Issue',
            text: 'Video was saved but DASH processing failed. Please re-upload or contact support.',
          }).then(() => navigate('/admin/Video'));

        } else {
          // Still PROCESSING — update the html content of the open dialog
          const elapsed = Math.round((attempts * 5) / 60);
          const htmlContainer = Swal.getHtmlContainer();
          if (htmlContainer) {
            htmlContainer.textContent = elapsed < 1
              ? 'Video uploaded ✓ — Processing video in background…'
              : `Video uploaded ✓ — Processing video in background… (~${elapsed} min elapsed)`;
          }
        }
      } catch {
        // Network hiccup — keep polling silently
      }

      if (attempts >= MAX_ATTEMPTS) {
        clearInterval(interval);
        Swal.fire({
          icon: 'info',
          title: 'Still Processing',
          text: 'The video was saved. Background processing is taking longer than expected — it will complete shortly.',
        }).then(() => navigate('/admin/Video'));
      }
    }, 5000); // poll every 5 seconds
  };

  const save = async (e) => {
    e.preventDefault();

    Swal.fire({
      icon: 'info',
      title: 'Uploading...',
      text: 'Please wait while the video is being uploaded',
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const countResponse = await fetch(`${API_URL}/api/v2/count`);
      if (!countResponse.ok) {
        Swal.fire({ icon: 'warning', title: 'Limit Reached', text: 'The upload limit has been reached.' });
        return;
      }

      const formData = new FormData();
      formData.append('videoTitle', videoTitle);
      formData.append('mainVideoDuration', mainVideoDuration);
      formData.append('language', language);
      formData.append('trailerDuration', trailerDuration);
      formData.append('rating', rating);
      formData.append('certificateNumber', certificateNumber);
      formData.append('videoAccessType', videoAccessType === 'free' ? 0 : 1);
      formData.append('description', description);
      formData.append('productionCompany', productionCompany);
      formData.append('certificateName', certificateName);
      if (videothumbnail) formData.append('videoThumbnail', videothumbnail);
      if (trailerthumbnail) formData.append('trailerThumbnail', trailerthumbnail);
      if (userbanner) formData.append('userBanner', userbanner);
      formData.append('castandcrewlist', castandcrewlist);
      formData.append('taglist', taglist);
      formData.append('categorylist', category);
      if (videofile) formData.append('video', videofile);
      if (trailerfile) formData.append('trailervideo', trailerfile);
      formData.append('advertisementTimings', adTimes);

      // ── Upload files to server (this returns fast now — no FFmpeg blocking) ──
      const response = await axios.post(`${API_URL}/api/v2/uploaddescription`, formData, {
        headers: { Authorization: token, 'Content-Type': 'multipart/form-data' },
        timeout: 0, // disable axios timeout for large file uploads
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
          if (progress < 100) {
            Swal.update({ text: `Uploading file: ${progress}%` });
          } else {
            // File reached server — now server processes metadata & starts FFmpeg async
            Swal.update({ text: 'Upload complete ✓  —  Starting background video processing…' });
          }
        },
      });

      // ── API returns immediately with savedDescription.id ──────────────────
      const savedVideoId = response.data?.videoDescription?.id;

      if (savedVideoId) {
        // Close the upload Swal and hand off to pollDashStatus which opens its own persistent dialog
        Swal.close();
        pollDashStatus(savedVideoId);
      } else {
        // Fallback: no ID returned — just show success and navigate
        Swal.fire({ icon: 'success', title: 'Saved!', text: 'Video saved successfully.', timer: 2000, showConfirmButton: false })
          .then(() => navigate('/admin/Video'));
      }

    } catch (error) {
      console.error('Upload error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Upload Failed',
        text: error?.response?.data?.message || error.message || 'An error occurred while uploading. Please try again.',
      });
    }
  };

  const [showVideo, setShowVideo] = useState(false);
  const handleClick = () => setShowVideo(true);

  /* edit mode */
  const [isEditMode, setIsEditMode] = useState(false);

  // ✅ FIX: Read videoId correctly — Video.js stores it as plain ID string, not JSON
  const videoId = localStorage.getItem('items');
  console.log("videoId", videoId);

  useEffect(() => {
    if (!videoId) return;
    setIsEditMode(true);

    fetch(`${API_URL}/api/v2/GetvideoDetail/${videoId}`)
      .then(r => r.json())
      .then(data => {
        setVideoTitle(data.videoTitle);
        setLanguage(data.language || 'English');
        setMainVideoDuration(data.mainVideoDuration);
        setTrailerDuration(data.trailerDuration);
        setRating(data.rating);
        setCertificateNumber(data.certificateNumber);
        setVideoAccessType(data.videoAccessType ? 'paid' : 'free');
        setdescription(data.description);
        setProductionCompany(data.productionCompany);
        setCertificateName(data.certificateName);
        setcastandcrewlist(data.castandcrewlist || []);
        settaglist(data.taglist || []);
        setAdTimes(data.advertisementTimings || []);
        setCategory(data.categorylist || []);

        if (data.vidofilename) setVideoUrl(`${API_URL}/api/v2/${videoId}/videofile`);
        if (data.videotrailerfilename) settrailerUrl(`${API_URL}/api/v2/${videoId}/trailerfile`);

        if (data.categorylist?.length > 0) {
          fetch(`${API_URL}/api/v2/categorylist/category?categoryIds=${data.categorylist.join(',')}`)
            .then(r => r.json())
            .then(names => setcategoriesvaluelist(names))
            .catch(err => console.error('Error fetching category names:', err));
        }

        if (data.castandcrewlist?.length > 0) {
          fetch(`${API_URL}/api/v2/castlist/castandcrew?castIds=${data.castandcrewlist.join(',')}`)
            .then(r => r.json())
            .then(names => setcastandcrewlistvalue(names))
            .catch(err => console.error('Error fetching cast names:', err));
        }

        if (data.taglist?.length > 0) {
          fetch(`${API_URL}/api/v2/taglist/tag?tagIds=${data.taglist.join(',')}`)
            .then(r => r.json())
            .then(names => settaglistvalue(names))
            .catch(err => console.error('Error fetching tag names:', err));
        }
      })
      .catch(err => console.error('Error fetching video details:', err));

    fetch(`${API_URL}/api/v2/videoimage/${videoId}`)
      .then(r => r.json())
      .then(data => {
        setvideothumbnailUrl(`data:image/png;base64,${data.videoThumbnail}`);
        settrailerthumbnailUrl(`data:image/png;base64,${data.trailerThumbnail}`);
        setuserbannerUrl(`data:image/png;base64,${data.userBanner}`);
      })
      .catch(err => console.error('Error fetching video images:', err));
  }, [videoId]);


  // ✅ FIX: handleUpdate with same Swal fix applied
  const handleUpdate = async (e) => {
    e.preventDefault();

    Swal.fire({
      icon: 'info',
      title: 'Updating...',
      text: 'Please wait while the video is being updated',
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const countResponse = await fetch(`${API_URL}/api/v2/count`);
      if (!countResponse.ok) {
        Swal.fire({ icon: 'warning', title: 'Limit Reached', text: 'The upload limit has been reached.' });
        return;
      }

      const formData = new FormData();
      formData.append('videoTitle', videoTitle);
      formData.append('mainVideoDuration', mainVideoDuration);
      formData.append('trailerDuration', trailerDuration);
      formData.append('rating', rating);
      formData.append('language', language);
      formData.append('certificateNumber', certificateNumber);
      formData.append('videoAccessType', videoAccessType === 'free' ? 0 : 1);
      formData.append('description', description);
      formData.append('productionCompany', productionCompany);
      formData.append('certificateName', certificateName);
      if (videothumbnail) formData.append('videoThumbnail', videothumbnail);
      if (trailerthumbnail) formData.append('trailerThumbnail', trailerthumbnail);
      if (userbanner) formData.append('userBanner', userbanner);
      formData.append('castandcrewlist', castandcrewlist);
      formData.append('taglist', taglist);
      formData.append('categorylist', category);
      if (videofile) formData.append('video', videofile);
      if (trailerfile) formData.append('trailervideo', trailerfile);
      formData.append('advertisementTimings', adTimes);

      await axios.patch(`${API_URL}/api/v2/updateVideoDescription/${videoId}`, formData, {
        headers: { Authorization: token, 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
          Swal.update({ text: `Progress: ${progress}%` });
        },
      });

      Swal.fire({ icon: 'success', title: 'Updated!', text: 'Video updated successfully', timer: 2000, showConfirmButton: false });
      navigate('/admin/Video');

    } catch (error) {
      // ✅ FIX: Show error dialog instead of re-throwing
      console.error('Update error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: error?.response?.data?.message || error.message || 'An error occurred while updating. Please try again.',
      });
    }
  };


  return (
    <div className="marquee-container">
      <div className='AddArea'></div><br />
      <div className='container3 mt-10'>
        <ol className="breadcrumb mb-4 d-flex my-0">
          <li className="breadcrumb-item"><Link to="/admin/Video">Videos</Link></li>
          <li className="breadcrumb-item active text-white">{isEditMode ? 'Edit Video' : 'Add Video'}</li>
        </ol>

        <div className="outer-container">
          <div className="table-container">

            {/* ===== STEP 1 ===== */}
            {currentStep === 1 && (
              <>
                <div className="row py-2 my-3 align-items-center w-100">
                  <div className="col-md-6">
                    <div className="d-flex align-items-center">
                      <div className="label-width"><label className="custom-label">Video Title</label></div>
                      <div className="flex-grow-1">
                        <input type='text' required className="form-control border border-dark input-width"
                          placeholder="Video Title" value={videoTitle} onChange={e => setVideoTitle(e.target.value)} />
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex align-items-center">
                      <div className="label-width"><label className="custom-label">Language</label></div>
                      <div className="flex-grow-1">
                        {/* ✅ FIX: Changed from plain text input to a select dropdown
                            fetching from /api/v2/GetAllLanguage, same pattern as Certificate */}
                        <select required className="form-control border border-dark input-width"
                          value={language} onChange={e => setLanguage(e.target.value)}>
                          <option value="">Select Language</option>
                          {languageOptions.map(lang => (
                            <option key={lang.language_id} value={lang.language}>{lang.language}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row py-2 my-3 align-items-center w-100">
                  <div className="col-md-6">
                    <div className="d-flex align-items-center">
                      <div className="label-width"><label className="custom-label">Video Duration</label></div>
                      <div className="flex-grow-1">
                        <input type='text' required className="form-control border border-dark input-width"
                          placeholder="Video Duration" value={trailerDuration} onChange={e => setTrailerDuration(e.target.value)} />
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex align-items-center">
                      <div className="label-width"><label className="custom-label">Certificate Name</label></div>
                      <div className="flex-grow-1">
                        <select required className="form-control border border-dark input-width"
                          value={certificateName} onChange={e => setCertificateName(e.target.value)}>
                          <option value="">Select certificate</option>
                          {Certificate.map(cert => (
                            <option key={cert.id} value={cert.value}>{cert.certificate}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row py-2 my-3 align-items-center w-100">
                  <div className="col-md-6">
                    <div className="d-flex align-items-center">
                      <div className="label-width"><label className="custom-label">Certificate No</label></div>
                      <div className="flex-grow-1">
                        <input type='text' required className="form-control border border-dark input-width"
                          placeholder="Certificate No" value={certificateNumber} onChange={e => setCertificateNumber(e.target.value)} />
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex align-items-center">
                      <div className="label-width"><label className="custom-label">Cast and Crew</label></div>
                      <div className="dropdown flex-grow-1 dropdown-container" ref={dropdownRefcast}>
                        <button type="button" className="form-control border border-dark input-width" onClick={toggleDropdowncast}>
                          {castandcrewlist.length > 0 ? 'Selected' : 'Select Cast & Crew'}
                        </button>
                        {isOpencast && (
                          <div className="dropdown-menu show" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                            {Getall.map(option => (
                              <div key={option.id} className="dropdown-item">
                                <input type="checkbox" value={option.name}
                                  checked={castandcrewlist.includes(option.id)}
                                  onChange={handleCheckboxChange(option)} />
                                <label className="ml-2">{option.name}</label>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row py-2 my-3 align-items-center w-100">
                  <div className="col-md-6" style={{ marginBottom: '80px' }}>
                    <div className="d-flex align-items-center">
                      <div className="label-width"><label className="custom-label">Rating</label></div>
                      <div className="flex-grow-1">
                        <input type='text' required className="form-control border border-dark input-width"
                          placeholder="/10" value={rating} onChange={e => setRating(e.target.value)} />
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex align-items-center">
                      <div className="flex-grow-1 border border-dark p-3" style={{ borderRadius: '13px', height: '130px', overflowY: 'auto' }}>
                        {castandcrewlist.map(id => (
                          <div key={id}>{Getall.find(o => o.id === id)?.name}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row py-1 my-1 w-100">
                  <div className="col-md-8 ms-auto text-end">
                    <button className="border border-dark p-1.5 w-20 mr-5 text-black me-2 rounded-lg" type="button">Cancel</button>
                    <button className="border border-dark p-1.5 w-20 text-white rounded-lg" type="button"
                      style={{ backgroundColor: '#2b2a52' }} onClick={nextStep}>Next</button>
                  </div>
                </div>
              </>
            )}

            {/* ===== STEP 2 ===== */}
            {currentStep === 2 && (
              <>
                <div className="row py-3 my-3 align-items-center w-100">
                  <div className="col-md-6">
                    <div className="d-flex align-items-center">
                      <div className="label-width"><label className="custom-label">Description</label></div>
                      <div className="flex-grow-1">
                        <textarea required className="form-control border border-dark input-width" rows="2"
                          placeholder="description" value={description} onChange={e => setdescription(e.target.value)} />
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex align-items-center">
                      <div className="label-width"><label className="custom-label">Production Company</label></div>
                      <div className="flex-grow-1">
                        <input type='text' required className="form-control border border-dark input-width"
                          placeholder="Production Company" value={productionCompany} onChange={e => setProductionCompany(e.target.value)} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row py-3 my-3 align-items-center w-100">
                  <div className="col-md-6">
                    <div className="d-flex align-items-center">
                      <div className="label-width"><label className="custom-label">Tag</label></div>
                      <div className="dropdown flex-grow-1 dropdown-container" ref={dropdownReftag}>
                        <button type="button" className="form-control border border-dark input-width" onClick={toggleDropdowntag}>
                          {taglist.length > 0 ? 'Selected' : 'Select Tag'}
                        </button>
                        {isOpentag && (
                          <div className="dropdown-menu show" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                            {Tag.map(option => (
                              <div key={option.tag_id} className="dropdown-item">
                                <input type="checkbox" value={option.tag}
                                  checked={taglist.includes(option.tag_id)}
                                  onChange={handleCheckboxChangetag(option)} />
                                <label className="ml-2">{option.tag}</label>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex align-items-center">
                      <div className="label-width"><label className="custom-label">Category</label></div>
                      <div className="dropdown flex-grow-1 dropdown-container" ref={dropdownRefcategory}>
                        <button type="button" className="form-control border border-dark input-width" onClick={toggleDropdowncategory}>
                          {category.length > 0 ? 'Selected' : 'Select categories'}
                        </button>
                        {isOpencategory && (
                          <div className="dropdown-menu show" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                            {categories.map(option => (
                              <div key={option.category_id} className="dropdown-item">
                                <input type="checkbox" value={option.categories}
                                  checked={category.includes(option.category_id)}
                                  onChange={handleCheckboxChangecategory(option)} />
                                <label className="ml-2">{option.categories}</label>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row py-3 my-3 align-items-center w-100">
                  <div className="col-md-6">
                    <div className="flex-grow-1 border border-dark p-3" style={{ borderRadius: '13px', height: '130px', overflowY: 'auto' }}>
                      {taglist.map(id => <div key={id}>{Tag.find(o => o.tag_id === id)?.tag}</div>)}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="flex-grow-1 border border-dark p-3" style={{ borderRadius: '13px', height: '130px', overflowY: 'auto' }}>
                      {category.map(id => <div key={id}>{categories.find(o => o.category_id === id)?.categories}</div>)}
                    </div>
                  </div>
                </div>

                <div className="row py-1 my-1 w-100">
                  <div className="col-md-8 ms-auto text-end">
                    <button className="border border-dark p-1.5 w-20 mr-5 text-black me-2 rounded-lg" type="button" onClick={prevStep}>Back</button>
                    <button className="mt-16 border border-dark p-1.5 w-20 text-white rounded-lg" type="button"
                      style={{ backgroundColor: '#2b2a52' }} onClick={nextStep}>Next</button>
                  </div>
                </div>
              </>
            )}

            {/* ===== STEP 3 ===== */}
            {currentStep === 3 && (
              <>
                <div className="row py-1 my-3 align-items-center w-100">
                  <div className="col-md-6">
                    <div className="d-flex align-items-center">
                      <div className="label-width"><label className="custom-label">Original Video</label></div>
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center">
                          <div className="drag-drop-area border border-dark text-center" onDrop={handleVideoDrop} onDragOver={handleDragOver}>
                            {videoUrl ? (
                              <ReactPlayer key={videoUrl} url={videoUrl} controls width="100%" height="100%"
                                config={{ file: { attributes: { controlsList: 'nodownload' } } }} />
                            ) : <span>Drag and drop</span>}
                          </div>
                          <button type="button" className="border border-dark p-1 bg-silver ml-2 choosefile"
                            onClick={() => document.getElementById('fileInputvideofile').click()}>Choose File</button>
                          <input type="file" id="fileInputvideofile" style={{ display: 'none' }} onChange={handleVideoFileChange} />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex align-items-center">
                      <div className="label-width"><label className="custom-label">Video Thumbnail</label></div>
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center">
                          <div className="drag-drop-area border border-dark text-center" onDrop={handleDrop} onDragOver={handleDragOver}
                            style={{ backgroundImage: `url(${videothumbnailUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                            {!videothumbnailUrl && <span>Drag and drop</span>}
                          </div>
                          <button type="button" className="border border-dark p-1 bg-silver ml-2 choosefile"
                            onClick={() => document.getElementById('fileInputthumbnailvideo').click()}>Choose File</button>
                          <input type="file" id="fileInputthumbnailvideo" style={{ display: 'none' }} onChange={handleFileInput} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row py-1 my-3 align-items-center w-100">
                  <div className="col-md-6">
                    <div className="d-flex align-items-center">
                      <div className="label-width"><label className="custom-label">Trailer Video</label></div>
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center">
                          <div className="drag-drop-area border border-dark text-center" onDrop={handletrailerDrop} onDragOver={handleDragOver}>
                            {trailerUrl ? (
                              <ReactPlayer key={trailerUrl} url={trailerUrl} controls width="100%" height="100%"
                                config={{ file: { attributes: { controlsList: 'nodownload' } } }} />
                            ) : <span>Drag and drop</span>}
                          </div>
                          <button type="button" className="border border-dark p-1 bg-silver ml-2 choosefile"
                            onClick={() => document.getElementById('fileInputtrailerfile').click()}>Choose File</button>
                          <input type="file" id="fileInputtrailerfile" style={{ display: 'none' }} onChange={handletrailerFileChange} />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex align-items-center">
                      <div className="label-width"><label className="custom-label">Trailer Thumbnail</label></div>
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center">
                          <div className="drag-drop-area border border-dark text-center" onDrop={handleDroptrailerthumbnail} onDragOver={handleDragOver}
                            style={{ backgroundImage: `url(${trailerthumbnailUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                            {!trailerthumbnailUrl && <span>Drag and drop</span>}
                          </div>
                          <button type="button" className="border border-dark p-1 bg-silver ml-2 choosefile"
                            onClick={() => document.getElementById('fileInputtrailerthumbnail').click()}>Choose File</button>
                          <input type="file" id="fileInputtrailerthumbnail" style={{ display: 'none' }} onChange={handleFileInputtrailerthumbnail} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row py-1 my-3 align-items-center w-100">
                  <div className="col-md-6">
                    <div className="d-flex align-items-center">
                      <div className="label-width"><label className="custom-label">User Banner</label></div>
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center">
                          <div className="drag-drop-area border border-dark text-center" onDrop={handleDropuserbanner} onDragOver={handleDragOver}
                            style={{ backgroundImage: `url(${userbannerUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                            {!userbannerUrl && <span>Drag and Drop</span>}
                          </div>
                          <button type="button" className="border border-dark p-1 bg-silver ml-2 choosefile"
                            onClick={() => document.getElementById('fileInputuserbanner').click()}>Choose File</button>
                          <input type="file" id="fileInputuserbanner" style={{ display: 'none' }} onChange={handleFileInputuserbanner} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row py-1 my-1 w-100">
                  <div className="col-md-8 ms-auto text-end">
                    <button className="border border-dark p-1.5 w-20 mr-5 text-black me-2 rounded-lg" type="button" onClick={prevStep}>Back</button>
                    <button className="border border-dark p-1.5 w-20 text-white rounded-lg" type="button"
                      style={{ backgroundColor: '#2b2a52' }} onClick={nextStep}>Next</button>
                  </div>
                </div>
              </>
            )}

            {/* ===== STEP 4 ===== */}
            {currentStep === 4 && (
              <>
                <div className="row py-1 my-3 align-items-center w-100">
                  <div className="col-md-6 d-flex align-items-center">
                    <div className="label-width"><label className="custom-label">Total Duration</label></div>
                    <div className="flex-grow-1 me-3">
                      <input type='text' required className="form-control border border-dark input-width"
                        placeholder="Main Video Duration" value={mainVideoDuration}
                        onChange={e => setMainVideoDuration(e.target.value)} disabled />
                    </div>
                  </div>
                  {videoAccessType === "free" && (
                    <div className="col-md-6 d-flex align-items-center">
                      <div className="label-width"><label className="custom-label">No of Ads</label></div>
                      <div className="flex-grow-1 me-3">
                        <input type="text" className="form-control border border-dark input-width"
                          placeholder="enter no of ads" value={numOfAds} onChange={e => setNumOfAds(e.target.value)} />
                      </div>
                      <button className="border border-dark p-1.5 w-20 text-white rounded-lg"
                        style={{ backgroundColor: 'blue' }} type="button" onClick={addAdTime}>Create</button>
                    </div>
                  )}
                </div>

                <div className="row py-1 my-3 align-items-center w-100">
                  <div className="col-md-6">
                    <div className="d-flex align-items-center">
                      <div className="label-width"><label className="custom-label">Video Access Type</label></div>
                      <div className="flex-grow-1">
                        <div className="d-flex">
                          <div className="form-check form-check-inline">
                            <input className="form-check-input" type="radio" name="videoAccessType" id="free" value="free"
                              checked={videoAccessType === 'free'} onChange={handleRadioChange} />
                            <label className="form-check-label" htmlFor="free">Free</label>
                          </div>
                          <div className="form-check form-check-inline ms-3">
                            <input className="form-check-input" type="radio" name="videoAccessType" id="Paid" value="paid"
                              checked={videoAccessType === 'paid'} disabled={!hasPaymentPlan()}
                              onChange={() => { if (hasPaymentPlan()) setVideoAccessType('paid'); }} />
                            <label className="form-check-label" htmlFor="Paid"
                              onMouseEnter={handlePaidRadioHover}
                              onClick={() => { if (hasPaymentPlan()) setVideoAccessType('paid'); }}>Paid</label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row py-1 align-items-center w-100">
                  <div className="col-md-6">
                    <img src={videothumbnailUrl} alt="Video Thumbnail" className="img-fluid p-3 border border-dark" style={{ height: "300px" }} />
                  </div>
                  <div className="col-md-6">
                    {videoAccessType === "free" && (
                      <div className="border border-dark p-3" style={{ borderRadius: "13px", height: "300px", overflowY: "auto" }}>
                        <ul className="list-group">
                          {adTimes.map((time, index) => (
                            <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                              {editingIndex === index ? (
                                <div className="d-flex align-items-center w-100">
                                  <input type="text" className="form-control me-2" value={tempAdTime}
                                    onChange={e => setTempAdTime(e.target.value)} />
                                  <button className="btn btn-sm btn-success me-2" onClick={() => saveAdTime(index)}>Save</button>
                                  <button className="btn btn-sm btn-secondary" onClick={cancelEditAdTime}>Cancel</button>
                                </div>
                              ) : (
                                <div className="d-flex justify-content-between w-100">
                                  <span>{time}</span>
                                  <div>
                                    <button className="btn btn-sm btn-primary me-2" onClick={() => editAdTime(index)}>
                                      <i className="fas fa-edit"></i>
                                    </button>
                                    <button className="btn btn-sm btn-danger" onClick={() => deleteAdTime(index)}>
                                      <i className="fas fa-trash-alt"></i>
                                    </button>
                                  </div>
                                </div>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                <div className="row py-1 my-1 w-100">
                  <div className="col-md-8 ms-auto text-end">
                    <button className="border border-dark p-1.5 w-20 mr-5 text-black me-2 rounded-lg" type="button" onClick={prevStep}>Back</button>
                    <button className="border border-dark p-1.5 w-20 text-white rounded-lg" type="button"
                      style={{ backgroundColor: '#2b2a52' }} onClick={nextStep}>Next</button>
                  </div>
                </div>
              </>
            )}

            {/* ===== STEP 5 - PREVIEW + SUBMIT ===== */}
            {currentStep === 5 && (
              <>
                <div className="preview-container d-flex justify-content-center align-items-center">
                  <div className="d-flex">
                    <div className="flex-grow-1">
                      <div className='text-black'>Movie Name: {videoTitle}</div>
                      <div className="video-container mt-3 text-center">
                        {showVideo ? (
                          <ReactPlayer key={videoUrl} url={videoUrl} controls width='100%' height='100%'
                            config={{ file: { attributes: { controlsList: 'nodownload' } } }} />
                        ) : (
                          <div className="thumbnail-container" onClick={handleClick}>
                            <img src={videothumbnailUrl} alt="Video Thumbnail" className="thumbnail-image" />
                            <div className="play-icon">&#9654;</div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="details-box ml-4 p-3 border border-dark">
                      <div className="col-6">
                        <table>
                          <tbody>
                            <tr><th>Video Title:</th><td>{videoTitle}</td></tr>
                            <tr><th>Main Video Duration:</th><td>{mainVideoDuration}</td></tr>
                            <tr><th>Trailer Duration:</th><td>{trailerDuration}</td></tr>
                            <tr><th>Cast and Crew:</th><td>{castandcrewlistvalue.join(', ')}</td></tr>
                            <tr><th>Certificate No:</th><td>{certificateNumber}</td></tr>
                            <tr><th>Certificate Name:</th><td>{certificateName}</td></tr>
                            <tr><th>Video Access Type:</th><td>{videoAccessType}</td></tr>
                            <tr><th>Category:</th><td>{categoriesvaluelist.join(', ')}</td></tr>
                            <tr><th>Tag:</th><td>{taglistvalue.join(', ')}</td></tr>
                            <tr><th>Production Company:</th><td>{productionCompany}</td></tr>
                            <tr><th>Description:</th><td>{description}</td></tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row py-1 my-1 w-100">
                  <div className="col-md-8 ms-auto text-end">
                    <button className="border border-dark p-1.5 w-20 mr-5 text-black me-2 rounded-lg" type="button" onClick={prevStep}>Back</button>
                    <button className="border border-dark p-1.5 w-20 text-white rounded-lg" type="button"
                      style={{ backgroundColor: '#2b2a52' }} onClick={isEditMode ? handleUpdate : save}>
                      {isEditMode ? 'Update' : 'Submit'}
                    </button>
                  </div>
                </div>
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

export default AddVideo;
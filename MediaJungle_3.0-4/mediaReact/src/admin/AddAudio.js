import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import ReactPlayer from 'react-player';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import "../App.css";
import API_URL from '../Config';
import "../css/Sidebar.css";


// ═══════════════════════════════════════════════════════════════════════════════
// REUSABLE MINI-COMPONENTS — defined OUTSIDE AddAudio so React does not treat
// them as new component types on every render (which caused the cursor-loss bug).
// ═══════════════════════════════════════════════════════════════════════════════

// Every field row: col-md-6 > d-flex > label-width + flex-grow-1
const FormRow = ({ label, children }) => (
  <div className="col-md-6">
    <div className="d-flex align-items-center">
      <div className="label-width"><label className="custom-label">{label}</label></div>
      <div className="flex-grow-1">{children}</div>
    </div>
  </div>
);

// Single text input — onChange passed as prop so it can reference the parent handler
const TextInput = ({ name, placeholder, value, onChange }) => (
  <input
    type="text" name={name} required
    className="form-control border border-dark border-2 input-width"
    placeholder={placeholder}
    value={value}
    onChange={onChange}
  />
);

// Thumbnail / Banner upload box
const ImageUploadBox = ({ label, imageUrl, inputId, onChange }) => (
  <div className="col-md-6">
    <div className="d-flex align-items-center">
      <div className="label-width col-md-4"><label className="custom-label">{label}</label></div>
      <div className="flex-grow-1 col-md-7">
        <div
          className="drag-drop-area border border-dark border-2 text-center"
          style={{ backgroundImage: imageUrl ? `url(${imageUrl})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', height: '10rem' }}
        >
          {!imageUrl && <span>Drag and drop</span>}
        </div>
        <div className="mt-2"><span style={{ whiteSpace: 'nowrap' }}>Please choose PNG format only*</span></div>
        <div className="mt-2">
          <button type="button" className="border border-dark border-2 p-1 bg-silver ml-2 choosefile"
            onClick={() => document.getElementById(inputId).click()}>Choose File</button>
          <input type="file" id={inputId} style={{ display: 'none' }} onChange={onChange} />
        </div>
      </div>
    </div>
  </div>
);

// Cast / Category / Tag checkbox dropdown
const CheckboxDropdown = ({ label, isOpen, onToggle, dropRef, items, idKey, nameKey, selectedIds, onCheck }) => (
  <div className="col-md-6">
    <div className="d-flex align-items-center">
      <div className="label-width"><label className="custom-label">{label}</label></div>
      <div className="dropdown flex-grow-1 dropdown-container" ref={dropRef}>
        <button type="button" className="form-control border border-dark border-2 input-width" onClick={onToggle}>
          {selectedIds.length > 0 ? 'Selected' : `Select ${label}`}
        </button>
        {isOpen && (
          <div className="dropdown-menu show">
            {items.map(option => (
              <div key={option[idKey]} className="dropdown-item">
                <input type="checkbox" checked={selectedIds.includes(option[idKey])} onChange={onCheck(option)} />
                <label className="ml-2">{option[nameKey]}</label>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
);

// Step 4 summary table row
const SummaryRow = ({ label, value }) => (
  <tr style={{ border: 'none' }}>
    <td style={{ border: 'none' }}>{label}</td>
    <td style={{ border: 'none' }}>{value}</td>
  </tr>
);

const AddAudio = () => {

  // ─── Auth & Mode ────────────────────────────────────────────────────────────
  const token      = sessionStorage.getItem("tokenn");
  const audioId    = localStorage.getItem('audioId');
  const isEditMode = !(audioId === 'null' || audioId === "" || audioId === null);
  const navigate   = useNavigate();

  // ─── Step State ─────────────────────────────────────────────────────────────
  const [currentStep, setCurrentStep] = useState(1);

  // ─── Form Fields (all text inputs in ONE object) ─────────────────────────────
  // REFACTOR: Previously each field had its own useState('') AND its own
  // changeXxx handler — that was 8 states + 8 identical handler functions.
  // Now ONE state object holds all text fields and ONE handler updates any of them
  // by matching the input's `name` attribute.
  const [fields, setFields] = useState({
    audio_title:        '',
    Audio_Duration:     '',
    Movie_name:         '',
    Certificate_name:   '',
    Certificate_no:     '',
    Rating:             '',
    Production_Company: '',
    Description:        '',
  });
  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setFields(prev => ({ ...prev, [name]: value }));
  };

  // ─── Select / Radio ──────────────────────────────────────────────────────────
  const [selectedOption, setSelectedOption] = useState('free');
  const [Certificateid,  setCertificateid]  = useState('');

  // ─── File / Image States ──────────────────────────────────────────────────────
  const [audioFile,         setAudioFile]         = useState(null);
  const [audioFileedited,   setAudioFileedited]   = useState(false);
  const [thumbnail,         setThumbnail]         = useState(null);
  const [thumbnailedited,   setThumbnailedited]   = useState(false);
  const [Bannerthumbnail,   setBannerthumbnail]   = useState(null);
  const [Banneredited,      setBanneredited]      = useState(false);
  const [audioUrl,          setAudioUrl]          = useState(null);
  const [BannerimageUrl,    setBannerimageUrl]    = useState(null);
  const [ThumbnailimageUrl, setThumbnailimageUrl] = useState(null);
  const [audiofilename,     setaudiofilename]     = useState('');

  // ─── API Data ──────────────────────────────────────────────────────────────
  const [getallplan,    setgetallplan]    = useState([]);
  const [Certificate,   setCertificate]  = useState([]);
  const [Getall,        setGetall]        = useState([]);  // cast & crew
  const [Getallcategory,setGetallcategory]= useState([]);
  const [Getalltag,     setGetalltag]     = useState([]);
  const [movieOptions,  setMovieOptions]  = useState([]);
  const [getalldata,    setgetalldata]    = useState(null);

  // ─── Multi-select lists ───────────────────────────────────────────────────────
  const [castandcrewlist,     setcastandcrewlist]     = useState([]);
  const [castandcrewlistName, setcastandcrewlistName] = useState([]);
  const [categorylist,        setcategorylist]        = useState([]);
  const [categorylistName,    setcategorylistName]    = useState([]);
  const [taglist,             settaglist]             = useState([]);
  const [taglistName,         settaglistName]         = useState([]);

  // ─── Dropdown open/close ──────────────────────────────────────────────────────
  const [isOpenCast,     setisOpenCast]     = useState(false);
  const [isOpencat,      setIsOpencat]      = useState(false);
  const [isOpentag,      setIsOpentag]      = useState(false);
  const [movieDropdown,  setMovieDropdown]  = useState(false);
  const [filteredMovies, setFilteredMovies] = useState([]);

  // ─── Refs ──────────────────────────────────────────────────────────────────────
  const dropdownRef          = useRef(null);
  const dropdownRefcat       = useRef(null);
  const dropdownReftag       = useRef(null);
  const dropdownRefmoviename = useRef(null);


  // ═══════════════════════════════════════════════════════════════════════════════
  // REFACTOR: simpleFetch helper
  // The same fetch + error-check + .json() + setter + .catch() pattern
  // was repeated 8 times. Now it lives in one place.
  // ═══════════════════════════════════════════════════════════════════════════════
  const simpleFetch = (url, setter) => {
    fetch(url)
      .then(r => { if (!r.ok) throw new Error('Network response was not ok'); return r.json(); })
      .then(data => setter(data))
      .catch(err => console.error(`Error fetching ${url}:`, err));
  };


  // ─── Initial Data Fetches ────────────────────────────────────────────────────
  // REFACTOR: GetAllCategories was fetched TWICE before (once unused, once useful).
  // Now fetched exactly ONCE. All 5 lookups share the simpleFetch helper.
  useEffect(() => {
    simpleFetch(`${API_URL}/api/v2/GetAllPlans`,       setgetallplan);
    simpleFetch(`${API_URL}/api/v2/GetAllCertificate`, setCertificate);
    simpleFetch(`${API_URL}/api/v2/GetAllcastandcrew`, setGetall);
    simpleFetch(`${API_URL}/api/v2/GetAllCategories`,  setGetallcategory);
    simpleFetch(`${API_URL}/api/v2/GetAllTag`,         setGetalltag);
    simpleFetch(`${API_URL}/api/v2/movename`, data => {
      const names = data.map(item => item.movie_name);
      setMovieOptions(names);
      setFilteredMovies(names);
    });
  }, []);


  // ─── Edit Mode: Load Existing Audio ──────────────────────────────────────────
  useEffect(() => {
    if (!isEditMode) return; // Guard: skip when adding new audio

    simpleFetch(`${API_URL}/api/v2/getaudio/${audioId}`, data => {
      setgetalldata(data);
      setaudiofilename(data.audio_file_name);
    });

    fetch(`${API_URL}/api/v2/getaudiothumbnailsbyid/${audioId}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(data => {
        setThumbnail(data.thumbnail);
        setThumbnailimageUrl(data.thumbnail ? `data:image/jpeg;base64,${data.thumbnail}` : null);
      })
      .catch(e => console.error('Error fetching thumbnail:', e));

    fetch(`${API_URL}/api/v2/getbannerthumbnailsbyid/${audioId}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(data => {
        setBannerthumbnail(data);
        setBannerimageUrl(data ? `data:image/jpeg;base64,${data}` : null);
      })
      .catch(e => console.error('Error fetching banner:', e));
  }, []);


  // ─── Pre-fill Form When Editing ──────────────────────────────────────────────
  useEffect(() => {
    if (!getalldata) return;

    // Fill all text fields at once
    setFields({
      audio_title:        getalldata.audioTitle         ?? '',
      Audio_Duration:     getalldata.audio_Duration     ?? '',
      Movie_name:         getalldata.movie_name         ?? '',
      Certificate_name:   getalldata.certificate_name   ?? '',
      Certificate_no:     getalldata.certificate_no     ?? '',
      Rating:             getalldata.rating             ?? '',
      Production_Company: getalldata.production_company ?? '',
      Description:        getalldata.description        ?? '',
    });

    setSelectedOption(getalldata.paid === false ? 'free' : 'paid');
    setAudioUrl(`${API_URL}/api/v2/${audiofilename}/file`);

    const matchedCert = Certificate.find(c => c.certificate === getalldata.certificate_name);
    if (matchedCert) setCertificateid(matchedCert.id);

    // REFACTOR: Previously 3 identical forEach blocks for category, tag, castandCrew.
    // One helper now handles all three.
    const prefillList = (arr, idKey, nameKey, setIds, setNames) => {
      if (!arr) return;
      arr.forEach(item => {
        setIds(prev   => [...prev, item[idKey]]);
        setNames(prev => [...prev, `${item[nameKey]},`]);
      });
    };
    prefillList(getalldata.category,    'category_id', 'categories', setcategorylist,   setcategorylistName);
    prefillList(getalldata.tag,         'tag_id',      'tag',        settaglist,         settaglistName);
    prefillList(getalldata.castandCrew, 'id',          'name',       setcastandcrewlist, setcastandcrewlistName);
  }, [getalldata]);


  // ─── Click-Outside (all dropdowns in ONE listener) ────────────────────────────
  // REFACTOR: Previously 3 separate useEffects each adding their own listener.
  // Now one useEffect, one listener, checks all 4 refs.
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current          && !dropdownRef.current.contains(e.target))          setisOpenCast(false);
      if (dropdownRefcat.current       && !dropdownRefcat.current.contains(e.target))       setIsOpencat(false);
      if (dropdownReftag.current       && !dropdownReftag.current.contains(e.target))       setIsOpentag(false);
      if (dropdownRefmoviename.current && !dropdownRefmoviename.current.contains(e.target)) setMovieDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);


  // ─── Image Upload Handler (factory) ──────────────────────────────────────────
  // REFACTOR: handleBannerImageChange and handleThumbnailimageChange were two
  // functions with identical logic. Now one factory returns the handler for either.
  const handleImageChange = (setFile, setEdited, setPreviewUrl) => (e) => {
    const file = e.target.files[0];
    setFile(file);
    setEdited(true);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  // ─── Audio File Handler ───────────────────────────────────────────────────────
  const handleAudioFileChange = (e) => {
    const file = e.target.files[0];
    setAudioFile(file);
    setAudioFileedited(true);
    if (file) setAudioUrl(URL.createObjectURL(file));
  };

  // ─── Checkbox Toggle (factory) ────────────────────────────────────────────────
  // REFACTOR: 3 identical checkbox handlers replaced by one factory function.
  const handleCheckboxToggle = (id, name, setIds, setNames) => (e) => {
    if (e.target.checked) {
      setIds(prev   => [...prev, id]);
      setNames(prev => [...prev, `${name},`]);
    } else {
      setIds(prev   => prev.filter(i => i !== id));
      setNames(prev => prev.filter(i => i !== `${name},`));
    }
  };

  // ─── Movie Dropdown Handlers ──────────────────────────────────────────────────
  const handleMovieInputChange = (e) => {
    const value = e.target.value;
    setFields(prev => ({ ...prev, Movie_name: value }));
    const lower    = value.toLowerCase();
    const starts   = movieOptions.filter(o => o.toLowerCase().startsWith(lower));
    const contains = movieOptions.filter(o => o.toLowerCase().includes(lower) && !o.toLowerCase().startsWith(lower));
    setFilteredMovies([...starts, ...contains]);
    setMovieDropdown(true);
  };
  const handleMovieToggle = () => {
    setMovieDropdown(p => !p);
    if (fields.Movie_name) {
      setFilteredMovies(movieOptions.filter(o => o.toLowerCase().startsWith(fields.Movie_name.toLowerCase())));
    }
  };
  const handleMovieOptionClick = (option) => {
    setFields(prev => ({ ...prev, Movie_name: option }));
    setMovieDropdown(false);
  };

  // ─── Payment Plan ─────────────────────────────────────────────────────────────
  const hasPaymentPlan = () => getallplan.length > 0;
  const handlePaidRadioHover = () => {
    if (!hasPaymentPlan()) {
      Swal.fire({
        title: 'Error!', icon: 'error', showCancelButton: true,
        text: 'You first need to add a payment plan to enable this option.',
        confirmButtonText: 'Go to Add plan page', cancelButtonText: 'Cancel',
      }).then(r => { if (r.isConfirmed) navigate('/admin/Adminplan'); });
    }
  };

  // ─── Step Navigation ──────────────────────────────────────────────────────────
  const prevStep = () => setCurrentStep(s => Math.max(1, s - 1));
  const nextStep = () => setCurrentStep(s => Math.min(4, s + 1));

  // ─── Save ─────────────────────────────────────────────────────────────────────
  const save = async (e) => {
    e.preventDefault();
    try {
      // Only check upload limit when adding new audio (not editing)
      if (!isEditMode) {
        const countRes = await fetch(`${API_URL}/api/v2/count`);
        if (!countRes.ok) {
          Swal.fire({ title: 'Limit Reached', text: 'The upload limit has been reached', icon: 'warning', confirmButtonText: 'OK' });
          return;
        }
      }
      const AudioData = new FormData();
      AudioData.append('audio_id',          isEditMode ? audioId : null);
      AudioData.append('audio_title',        fields.audio_title);
      AudioData.append('Movie_name',         fields.Movie_name);
      AudioData.append('Audio_Duration',     fields.Audio_Duration);
      AudioData.append('Certificate_no',     fields.Certificate_no);
      AudioData.append('Certificate_name',   fields.Certificate_name);
      AudioData.append('Rating',             fields.Rating);
      AudioData.append('paid',               selectedOption === 'paid');
      AudioData.append('production_company', fields.Production_Company);
      AudioData.append('Description',        fields.Description);
      AudioData.append('thumbnail',       (!isEditMode || thumbnailedited) ? thumbnail       : null);
      AudioData.append('Bannerthumbnail', (!isEditMode || Banneredited)    ? Bannerthumbnail : null);
      AudioData.append('audioFile',       (!isEditMode || audioFileedited) ? audioFile       : null);
      castandcrewlist.forEach(id => AudioData.append('castAndCrewIds', id));
      categorylist.forEach(id    => AudioData.append('category',       id));
      taglist.forEach(id         => AudioData.append('tag',            id));

      const res = await axios.post(
        `${API_URL}/api/v2/${isEditMode ? 'update' : 'test'}`,
        AudioData,
        { headers: { Authorization: token, 'Content-Type': 'multipart/form-data' } }
      );
      if (res.status === 200) {
        Swal.fire({ title: 'Success!', text: 'Audio saved successfully', icon: 'success', confirmButtonText: 'OK' });
      }
    } catch (error) {
      console.error('Error saving audio:', error);
      Swal.fire({ title: 'Error!', text: 'An error occurred while saving.', icon: 'error', confirmButtonText: 'OK' });
    }
  };


  // Shared dropdown list style used by movie name dropdown
  const dropdownListStyle = {
    position: 'absolute', top: '40px', left: 0, width: '100%',
    maxHeight: '150px', overflowY: 'auto', backgroundColor: 'white',
    border: '1px solid #ccc', zIndex: 1,
  };


  // ═══════════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════════
  return (
    <div className='container3 mt-20'>
      <ol className="breadcrumb mb-4 d-flex my-0">
        <li className="breadcrumb-item"><Link to="/admin/ListAudio">Audios</Link></li>
        <li className="breadcrumb-item active text-white">{isEditMode ? "Edit Audio" : "Add Audio"}</li>
      </ol>

      <div className="outer-container">
        <div className="table-container" style={{ height: '63vh' }}>


          {/* ── STEP 1 ─────────────────────────────────────────────────────── */}
          {currentStep === 1 && (
            <>
              <div className="row py-3 my-3 align-items-center w-100">
                <FormRow label="Audio Title">
                  <TextInput name="audio_title" placeholder="Audio Title" value={fields.audio_title} onChange={handleFieldChange} />
                </FormRow>
                <FormRow label="Audio Duration">
                  <TextInput name="Audio_Duration" placeholder="Main Audio Duration" value={fields.Audio_Duration} onChange={handleFieldChange} />
                </FormRow>
              </div>

              <div className="row py-3 my-3 align-items-center w-100">
                <FormRow label="Movie Name">
                  <div style={{ position: 'relative', width: '100%' }} ref={dropdownRefmoviename}>
                    <input
                      type="text"
                      value={fields.Movie_name || ''}
                      onClick={handleMovieToggle}
                      onChange={handleMovieInputChange}
                      className="form-control border border-dark border-2 input-width"
                      placeholder="Select Movie Name"
                    />
                    {movieDropdown && filteredMovies.length > 0 && (
                      <div style={dropdownListStyle}>
                        {filteredMovies.map((option, idx) => (
                          <div key={idx} className="dropdown-item" style={{ padding: '10px', cursor: 'pointer' }}
                            onClick={() => handleMovieOptionClick(option)}>
                            {option}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </FormRow>

                <FormRow label="Certificate Name">
                  <select
                    name="certificate_name" required
                    className="form-control border border-dark border-2 input-width"
                    value={Certificateid}
                    onChange={(e) => {
                      setCertificateid(e.target.value);
                      setFields(prev => ({ ...prev, Certificate_name: e.target.options[e.target.options.selectedIndex].text }));
                    }}
                  >
                    <option value="">Select Certificate</option>
                    {Certificate.map(cert => (
                      <option key={cert.id} value={cert.id}>{cert.certificate}</option>
                    ))}
                  </select>
                </FormRow>
              </div>

              <div className="row py-3 my-3 align-items-center w-100">
                <FormRow label="Rating">
                  <TextInput name="Rating" placeholder="/10" value={fields.Rating} onChange={handleFieldChange} />
                </FormRow>
                <FormRow label="Certificate No">
                  <TextInput name="Certificate_no" placeholder="Certificate No" value={fields.Certificate_no} onChange={handleFieldChange} />
                </FormRow>
              </div>

              <div className="row py-3 my-3 align-items-center w-100">
                <FormRow label="Audio Access Type">
                  <div className="d-flex">
                    <div className="form-check form-check-inline">
                      <input type="radio" value="free" checked={selectedOption === 'free'} onChange={e => setSelectedOption(e.target.value)} />
                      <label className="form-check-label">Free</label>
                    </div>
                    <div className="form-check form-check-inline ms-3">
                      <input
                        type="radio" value="paid"
                        checked={selectedOption === 'paid'}
                        disabled={!hasPaymentPlan()}
                        onChange={() => { if (hasPaymentPlan()) setSelectedOption('paid'); }}
                      />
                      <label className="form-check-label" onMouseEnter={handlePaidRadioHover}
                        onClick={() => { if (hasPaymentPlan()) setSelectedOption('paid'); }}>
                        Paid
                      </label>
                    </div>
                  </div>
                </FormRow>

                <CheckboxDropdown
                  label="Cast and Crew"
                  isOpen={isOpenCast}
                  onToggle={() => setisOpenCast(p => !p)}
                  dropRef={dropdownRef}
                  items={Getall}
                  idKey="id" nameKey="name"
                  selectedIds={castandcrewlist}
                  onCheck={option => handleCheckboxToggle(option.id, option.name, setcastandcrewlist, setcastandcrewlistName)}
                />
              </div>

              {castandcrewlist.length > 0 && (
                <div className="row">
                  <div className="col-md-6 offset-md-6">
                    <label className="custom-label">Selected Cast:</label>
                    {castandcrewlist.map(id => <div key={id}>{Getall.find(o => o.id === id)?.name}</div>)}
                  </div>
                </div>
              )}
            </>
          )}


          {/* ── STEP 2 ─────────────────────────────────────────────────────── */}
          {currentStep === 2 && (
            <>
              <div className="row py-3 my-3 align-items-center w-100">
                <FormRow label="Description">
                  <TextInput name="Description" placeholder="Description" value={fields.Description} onChange={handleFieldChange} />
                </FormRow>
                <FormRow label="Production Company">
                  <TextInput name="Production_Company" placeholder="Production Company" value={fields.Production_Company} onChange={handleFieldChange} />
                </FormRow>
              </div>

              <div className="row py-3 my-3 align-items-center w-100">
                <CheckboxDropdown
                  label="Tag"
                  isOpen={isOpentag}
                  onToggle={() => setIsOpentag(p => !p)}
                  dropRef={dropdownReftag}
                  items={Getalltag}
                  idKey="tag_id" nameKey="tag"
                  selectedIds={taglist}
                  onCheck={option => handleCheckboxToggle(option.tag_id, option.tag, settaglist, settaglistName)}
                />
                <CheckboxDropdown
                  label="Category"
                  isOpen={isOpencat}
                  onToggle={() => setIsOpencat(p => !p)}
                  dropRef={dropdownRefcat}
                  items={Getallcategory}
                  idKey="category_id" nameKey="categories"
                  selectedIds={categorylist}
                  onCheck={option => handleCheckboxToggle(option.category_id, option.categories, setcategorylist, setcategorylistName)}
                />
              </div>

              <div className="row">
                <div className="col-md-6">
                  {taglist.length > 0 && (
                    <div className="selected-items">
                      <label>Selected Tags:</label>
                      {taglist.map(id => <div key={id}>{Getalltag.find(o => o.tag_id === id)?.tag}</div>)}
                    </div>
                  )}
                </div>
                <div className="col-md-6">
                  {categorylist.length > 0 && (
                    <div className="selected-items">
                      <label>Selected Categories:</label>
                      {categorylist.map(id => <div key={id}>{Getallcategory.find(o => o.category_id === id)?.categories}</div>)}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}


          {/* ── STEP 3 ─────────────────────────────────────────────────────── */}
          {currentStep === 3 && (
            <>
              <div className="row py-3 my-3 align-items-center w-100">
                <ImageUploadBox
                  label="Audio Thumbnail" imageUrl={ThumbnailimageUrl} inputId="Thumbnail"
                  onChange={handleImageChange(setThumbnail, setThumbnailedited, setThumbnailimageUrl)}
                />
                <ImageUploadBox
                  label="User Banner" imageUrl={BannerimageUrl} inputId="Banner"
                  onChange={handleImageChange(setBannerthumbnail, setBanneredited, setBannerimageUrl)}
                />
              </div>

              <div className="row py-3 align-items-center w-100">
                <div className="col-md-6">
                  <div className="d-flex align-items-center">
                    <div className="label-width col-md-4">
                      <label className="custom-label">Original Audio</label>
                    </div>
                    <div className="flex-grow-1 col-md-7">
                      <ReactPlayer url={audioUrl} controls width="280px" height="40px"
                        config={{ file: { attributes: { controlsList: 'nodownload' } } }} />
                      <div className="mt-2">
                        <button type="button" className="border border-dark border-2 p-1 bg-silver ml-2 choosefile"
                          onClick={() => document.getElementById('fileInput1').click()}>Choose File</button>
                        <input type="file" accept="audio/*" id="fileInput1" style={{ display: 'none' }} onChange={handleAudioFileChange} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}


          {/* ── STEP 4 ─────────────────────────────────────────────────────── */}
          {currentStep === 4 && (
            <div className="row p-2 align-items-center w-100">
              <div className="col-md-6">
                <div className='text-black'>Movie Name: {fields.Movie_name}</div>
                <div style={{ width: '500px', height: '300px', backgroundImage: `url(${ThumbnailimageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '10px', overflow: 'hidden' }}>
                  <ReactPlayer url={audioUrl} controls width="100%" height="100%"
                    config={{ file: { attributes: { controlsList: 'nodownload' } } }} />
                </div>
              </div>
              <div className="col-md-6" style={{ height: '390px' }}>
                <div className="details-box ml-4 p-3 border border-dark border-2">
                  <div style={{ maxHeight: '400px', overflowY: 'scroll' }}>
                    <table className="table table-bordered" style={{ width: '400px', border: 'none' }}>
                      <tbody>
                        <SummaryRow label="Audio Title"        value={fields.audio_title} />
                        <SummaryRow label="Audio Duration"     value={fields.Audio_Duration} />
                        <SummaryRow label="Cast and Crew"      value={castandcrewlistName} />
                        <SummaryRow label="Certificate No"     value={fields.Certificate_no} />
                        <SummaryRow label="Certificate Name"   value={fields.Certificate_name} />
                        <SummaryRow label="Audio Access Type"  value={selectedOption} />
                        <SummaryRow label="Category"           value={categorylistName} />
                        <SummaryRow label="Tag"                value={taglistName} />
                        <SummaryRow label="Production Company" value={fields.Production_Company} />
                        <SummaryRow label="Description"        value={fields.Description} />
                        <SummaryRow label="Rating"             value={fields.Rating} />
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* ── Navigation Buttons ─────────────────────────────────────────────── */}
        {/* REFACTOR: Back button was copy-pasted in both branches. Now rendered once. */}
        <div className="row py-1 my-1 w-100">
          <div className="col-md-8 ms-auto text-end">
            <button className="border border-dark border-2 p-1.5 w-20 mr-5 text-black me-2 rounded-lg"
              type="button" onClick={prevStep}>Back</button>

            {currentStep <= 3 ? (
              <button className="border border-dark border-2 p-1.5 w-20 text-white rounded-lg"
                type="button" style={{ backgroundColor: 'blue' }} onClick={nextStep}>Next</button>
            ) : (
              <button className="border border-dark border-2 p-1.5 w-20 text-white rounded-lg"
                type="submit" style={{ backgroundColor: 'blue' }} onClick={save}>Submit</button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AddAudio;
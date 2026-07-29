import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import "../css/Sidebar.css";
import { Dropdown } from 'react-bootstrap';
import API_URL from '../Config';
import { useRef } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const Banner_setting= () => {

  const [isOpen, setIsOpen] = useState(false);
  const [selectedSetting, setSelectedSetting] = useState("Banner Settings"); // Default selected setting
  const [activeView, setActiveView] = useState('movie');
  const token = sessionStorage.getItem("tokenn");

  const style = {
    videodropdownContainer: {
      width: "100%",
      position: "relative",
    },
    videodropdownInput: {
      width: "100%",
      padding: "8px",
      boxSizing: "border-box",
    },
    videodropdownList: {
      position: "absolute",
      top: "40px",
      left: "0",
      width: "100%",
      maxHeight: "150px", // Maximum height for scrollable dropdown
      overflowY: "auto", // Enable scrolling
      backgroundColor: "white",
      border: "1px solid #ccc",
      zIndex: 1,
      scrollbarColor: "#2b2a52",
    },
    videodropdownItem: {
      padding: "8px",
      cursor: "pointer",
    },
  };

const [videotitle,setvideotitle] = useState([]);
const [videoContainer, setVideoContainer] = useState(0);  // Actual state used for audioTitle
const [videoinputValue, setVideoInputValue] = useState('');  // Internal input value
const [videotableData, setvideoTableData] = useState([]);  // Data for the table
const [videofilteredOptions, setvideoFilteredOptions] = useState([]);
const [videoinputValues, setvideoInputValues] = useState([]); // Track input values for each row
const [videodropdownStates, setvideoDropdownStates] = useState([]); // Track dropdown open/close states for each row
const [videocontainer, setvideocontainere] = useState('');  // Internal input value
const videodropdownRef = useRef(null); // Create a ref for the dropdown container
const [videoexistIndexvalue, setvideoExistIndexvalue] = useState([]);
const [videoexistingData, setvideoExistingData] = useState([]); // Create a ref for the dropdown container

// Handle drag and drop
   const handleOnDragEnd = (result) => {
    const { destination, source } = result;

    // Check if the item was dropped outside the list
    if (!destination) return;

    // Create a copy of the current state
    const updatedVideoData = Array.from(videotableData);

    // Swap videoId values between the source and destination
    const sourceVideoId = updatedVideoData[source.index].videoId;
    updatedVideoData[source.index].videoId = updatedVideoData[destination.index].videoId;
    updatedVideoData[destination.index].videoId = sourceVideoId;

    const reorderedTitles = updatedVideoData.map(item => {
          const titleObject = videotitle.find(cat => cat.id === item.videoId);
          return titleObject ? titleObject.videoTitle : "";  // Get the title or empty string if no match
        });
      
        // Store the reordered titles in videoinputValues
        setvideoInputValues(reorderedTitles);

    // Update the state with the swapped data
    setvideoTableData(updatedVideoData);
  };



  console.log("afterdrag",videotableData)

  const settingsOptions = [
    { name: "Site Settings", path: "/admin/SiteSetting" },
    { name: "Social Settings", path: "/admin/Social_setting" },
    { name: "Payment Settings", path: "/admin/Payment_setting" },
    { name: "Banner Settings", path: "/admin/Banner_setting" },
    { name: "Footer Settings", path: "/admin/Footer_setting" },
    { name: "Contact Settings", path: "/admin/Contact_setting" },
    {name: "Container Settings", path: "/admin/container"}
  ];

  const handleSettingChange = (setting) => {
    setSelectedSetting(setting.name);
    setIsOpen(false);
    
  };

  const handleViewChange = (view) => {
    setActiveView(view);
  };

  useEffect(() => {
    fetch(`${API_URL}/api/v2/video/getall`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        const videoNames = data.map(item => item.videoTitle);
        setvideotitle(data);
        setvideoFilteredOptions(videoNames); 
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        throw error;
      });
    fetchbannerContainers();
  }, []);

  // console.log("videotitle",videotitle);

  const fetchbannerContainers = async () => {
    fetch(`${API_URL}/api/v2/getallvideobanners`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        const categoryNames = data.map(item => item.categories);
        setvideocontainere(data);
        setVideoInputValue(data.length);
        setvideoTableData(data);
        setvideoExistingData(data);
        setVideoInputValue(data.length);
        setVideoContainer(data.length);
        setvideoDropdownStates(Array(data.length).fill(false)); // Initialize dropdown states
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        throw error;
      });
    };

    // console.log("videocontainer",videocontainer);
    // console.log("videoinputvalue",videoinputValue);
    // console.log("table",videotableData);
    // console.log("existing",videoexistingData);
    // console.log("input",videoinputValue);
    // console.log("videocontainer",videoContainer);
    // console.log("drop",videodropdownStates);


    useEffect(() => {
      if (videocontainer.length && videotitle.length) {
        // Map through videocontainer and find matching video title using videoId and id
        const categoryNamesList = videocontainer.map(container => {
          const matchedVideo = videotitle.find(video => video.id === container.videoId); // Find matching video
          return matchedVideo ? matchedVideo.videoTitle : 'Unknown'; // Return the videoTitle if found, otherwise 'Unknown'
        });
    
        console.log("Category Names List:", categoryNamesList);
    
        // Store only the category names in state
        setvideoInputValues(categoryNamesList);
      }
    }, [videocontainer, videotitle]);
    
    // console.log("input values", videoinputValues);

    // Handle input change for filtering options
const handlevideoInputChanget = (e, index) => {
  const value = e.target.value.toLowerCase();  // Convert the input to lowercase
  const updatedInputValues = [...videoinputValues];
  updatedInputValues[index] = value;
  setvideoInputValues(updatedInputValues);
  
  const value2=e.target.value;
  const category = videotitle.find(cat => cat.videoTitle === value2);
  const data=category ? category.id : null;
  
  
  const updatedData = videotableData.map((row, i) => {
    if (i === index) {
      return { ...row, videoId: data };  // Dynamically update the field
    }
    return row;  // Return other rows unchanged
  });
  setvideoTableData(updatedData);
  
  const categoryNames = videotitle.map(item => item.videoTitle);
  // Separate options that start with the value from those that contain it elsewhere
  const startsWithValue = categoryNames.filter(option =>
    option.toLowerCase().startsWith(value)  // Options that start with the input
  );
  
  const containsValue = categoryNames.filter(option =>
    option.toLowerCase().includes(value) && !option.toLowerCase().startsWith(value)  // Options that contain but don't start with the input
  );
  
  // Combine the two lists, with starting matches first
  const filtered = [...startsWithValue, ...containsValue];
  
  setvideoFilteredOptions(filtered);  // Update the filtered options
  };







  


// Toggle dropdown for specific row
const handlevideoDropdownToggle = (index) => {
  setvideoExistIndexvalue(index)
  
  
  if(index==videoexistIndexvalue){
    const updatedDropdownStatesToFalse = videodropdownStates.map(() => false);
  setvideoDropdownStates(updatedDropdownStatesToFalse);
  setvideoExistIndexvalue(null)
  
  }else{
  setvideoDropdownStates(prevvideoDropdownStates => 
    prevvideoDropdownStates.map((state, i) => (i === index ? !state : false))
    
  );
  }
  
  };


  
  // Handle selecting an option
  const handlevideoOptionClick = (option, index) => {
  const updatedInputValues = [...videoinputValues];
  updatedInputValues[index] = option;
  setvideoInputValues(updatedInputValues);
  
  const updatedDropdownStates = [...videodropdownStates];
  updatedDropdownStates[index] = false;
  setvideoDropdownStates(updatedDropdownStates);
  const newValue = option;
  
  const category = videotitle.find(cat => cat.videoTitle === newValue);
  const data=category ? category.id : null;
  
  
  const updatedData = videotableData.map((row, i) => {
    if (i === index) {
      return { ...row, videoId: data };  // Dynamically update the field
    }
    return row;  // Return other rows unchanged
  });
  setvideoTableData(updatedData);
  const categoryNames = videotitle.map(item => item.videoTitle);
  setvideoFilteredOptions(categoryNames)
  
  };

  const handleSubmit = async () => {
    try {
        // Send the POST request using Axios
        const saveResponse = await axios.post(`${API_URL}/api/v2/addvideobanner`, videotableData, {
            headers: {
                Authorization: token, // Your token here
                'Content-Type': 'application/json',  // JSON content type
            },
        });

        if (saveResponse.status === 200) {
            Swal.fire({
                title: 'Success!',
                text: 'Videobanners  saved successfully',
                icon: 'success',
                confirmButtonText: 'OK'
            }).then((result) => {
                if (result.isConfirmed) {
                    fetchbannerContainers();
                }
            });
        // } else {
        //     Swal.fire({
        //         title: 'Error!',
        //         text: 'Error saving Videobanners',
        //         icon: 'error',
        //         confirmButtonText: 'OK'
        //     });
        }
    } catch (error) {
        console.error('Error uploading data:', error);
        throw error;
        // Swal.fire({
        //     title: 'Error!',
        //     text: 'Error uploading data',
        //     icon: 'error',
        //     confirmButtonText: 'OK'
        // });
    }
};

  console.log("videotableData",videotableData)


  const handleVideoUpdatecontainervalue = () => {
    const newValue = parseInt(videoinputValue, 10);
    
    if (videoinputValue === '') {
      alert('Please enter a valid number');
      return;
    }
    
    if (newValue <= videoContainer) {
      // Alert if the new value is less than the existing audioContainer
      alert('New value cannot be less than the existing value');
    
      // console.log(" new value  lesser than === audioContainer value")
      setVideoInputValue(videoContainer);
    } else {
      // Update audioContainer only if the new value is valid
      if (videoContainer <= 0) {
    
        // console.log("audio less than === 0")
        setVideoContainer(newValue);
        const rows = Array.from({ length:  videoinputValue }, (_, index) => ({
          videoId: ''
        }));
        setvideoTableData(rows);
        setVideoInputValue(newValue);
        setVideoContainer(newValue);
        setvideoDropdownStates(Array(newValue).fill(false)); // Initialize dropdown states
        setvideoInputValues(Array(newValue).fill("")); // Initialize input values
      }
      else if (videoContainer >= 0) {
    
        // console.log("audio greater than === 0")
        setvideoTableData((prevData) => {
          // Check if the current inputValue exceeds the existing rows in tableData
          if (newValue > prevData.length) {
            // Add new rows while keeping the existing ones intact
            const newRows = Array.from({ length: newValue - prevData.length }, () => ({
              videoId: ''
            }));
            return [...prevData, ...newRows]; // Combine old rows with new empty rows      
          }
          return prevData; // If inputValue is less than or equal, return existing data
        });
    
        setvideoDropdownStates((prevDropdownStates) => {
          // Check if inputValue exceeds the current length of dropdownStates
          if (newValue > prevDropdownStates.length) {
            // Add 'false' values to the end of dropdownStates
            const extraStates = Array(newValue - prevDropdownStates.length).fill(false);
            return [...prevDropdownStates, ...extraStates]; // Combine old states with new 'false' values
          }
          return prevDropdownStates; // If inputValue is less than or equal, return existing data
        });
        setvideoInputValues((prevInputValues) => {
          // Check if inputValue exceeds the current length of dropdownStates
          if (newValue > prevInputValues.length) {
            // Add 'false' values to the end of dropdownStates
            const extraValues = Array(newValue - prevInputValues.length).fill("");
            return [...prevInputValues, ...extraValues]; // Combine old states with new 'false' values
          }
          return prevInputValues; // If inputValue is less than or equal, return existing data
        });
    
        setVideoInputValue(newValue);
        setVideoContainer(newValue);
      }
    }
    };

    // Handle row deletion
const handleVideoDelete = async (index) => {
  // console.log('inside function')
  // console.log(tableData)
  if (index >= 0 && index < videotableData.length) {
    const data = videotableData[index];
    if(data.id!=null){
      try {
        const response = await axios.delete(`${API_URL}/api/v2/videobanner/${data.id}`, {
          headers: {
            Authorization: token, // Your token here
          }
        });
        // console.log(response.data); // AudioContainer deleted successfully
        Swal.fire({
          title: 'Deleted!',
          text: 'VideoBanner deleted successfully',
          icon: 'success',
          confirmButtonText: 'OK'
        }).then(() => {
          // window.location.reload(); // Refresh page after deletion
          fetchbannerContainers();
        });
      } catch (error) {
        console.error(error);
        throw error;
        // Swal.fire({
        //   title: 'Error!',
        //   text: 'Failed to delete the VideoContainer',
        //   icon: 'error',
        //   confirmButtonText: 'OK'
        // });
      }
    }
    else{
      Swal.fire({
        title: 'Deleted',
        text: 'VideoContainers and Categoryes  data deleted ',
        icon: 'warning',
        confirmButtonText: 'OK'
      });
    }
  } 
  
  
  
  const updatedData = videotableData.filter((_, i) => i !== index);
  
  const updatedDropdownStates = videodropdownStates.filter((_, i) => i !== index);
  setvideoDropdownStates(updatedDropdownStates);
  
  // Delete the item at the specific index from inputValues
  const updatedInputValues = videoinputValues.filter((_, i) => i !== index);
  setvideoInputValues(updatedInputValues);
  
  setvideoTableData(updatedData);
  setVideoContainer(videoContainer - 1); // Reduce the count
  setVideoInputValue(updatedData.length);
  
  };

  console.log("videoinputValues",videoinputValues)
    

//-------------------------------------------------------------audio screen ---------------------------------------------

const [audiotitle,setaudiotitle] = useState([]);
const [audioContainer, setaudioContainer] = useState(0);  // Actual state used for audioTitle
const [audioinputValue, setaudioInputValue] = useState('');  // Internal input value
const [audiotableData, setaudioTableData] = useState([]);  // Data for the table
const [audiofilteredOptions, setaudioFilteredOptions] = useState([]);
const [audioinputValues, setaudioInputValues] = useState([]); // Track input values for each row
const [audiodropdownStates, setaudioDropdownStates] = useState([]); // Track dropdown open/close states for each row
const [audiocontainer, setaudiocontainere] = useState('');  // Internal input value
const audiodropdownRef = useRef(null); // Create a ref for the dropdown container
const [audioexistIndexvalue, setaudioExistIndexvalue] = useState([]);
const [audioexistingData, setaudioExistingData] = useState([]); // Create a ref for the dropdown container

// Handle drag and drop
const handleOnDragEndaudio = (result) => {
  const { destination, source } = result;

  // Check if the item was dropped outside the list
  if (!destination) return;

  // Create a copy of the current state
  const updatedVideoData = Array.from(audiotableData);

  // Swap videoId values between the source and destination
  const sourceVideoId = updatedVideoData[source.index].movienameID;
  updatedVideoData[source.index].movienameID = updatedVideoData[destination.index].movienameID;
  updatedVideoData[destination.index].movienameID = sourceVideoId;

  const reorderedTitles = updatedVideoData.map(item => {
        const titleObject = audiotitle.find(cat => cat.id === item.movienameID);
        return titleObject ? titleObject.movie_name : "";  // Get the title or empty string if no match
      });
    
      // Store the reordered titles in videoinputValues
      setaudioInputValues(reorderedTitles);

  // Update the state with the swapped data
  setaudioTableData(updatedVideoData);
};

useEffect(() => {
  fetch(`${API_URL}/api/v2/movename`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      const movieNames = data.map(item => item.movie_name);
      setaudiotitle(data);
      setaudioFilteredOptions(movieNames); 
    })
    .catch(error => {
      console.error('Error fetching data:', error);
      throw error;
    });
    fetchAudiobanner();
}, []);

console.log("audiotitle",audiotitle);
console.log("audiofiletr",audiofilteredOptions);

const fetchAudiobanner = async () => {
  fetch(`${API_URL}/api/v2/getallaudiobanner`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      const categoryNames = data.map(item => item.categories);
      setaudiocontainere(data);
      setaudioInputValue(data.length);
      setaudioTableData(data);
      setaudioExistingData(data);
      setaudioInputValue(data.length);
      setaudioContainer(data.length);
      setaudioDropdownStates(Array(data.length).fill(false)); // Initialize dropdown states
    })
    .catch(error => {
      console.error('Error fetching data:', error);
      throw error;
    });
  };

  // console.log("audioocontainer",audiocontainer);
  //   console.log("audioinputvalue",audioinputValue);
  //   console.log("audiotable",audiotableData);
  //   console.log("audioexisting",audioexistingData);
  //   console.log("audioinput",audioinputValue);
  //   console.log("audiocontainer",audioContainer);
  //   console.log("audiodrop",audiodropdownStates);


    useEffect(() => {
      if (audiocontainer.length && audiotitle.length) {
        // Map through videocontainer and find matching video title using videoId and id
        const categoryNamesList = audiocontainer.map(container => {
          const matchedVideo = audiotitle.find(video => video.id === container.movienameID); // Find matching video
          return matchedVideo ? matchedVideo.movie_name : 'Unknown'; // Return the videoTitle if found, otherwise 'Unknown'
        });
    
        console.log("Category Names List:", categoryNamesList);
    
        // Store only the category names in state
        setaudioInputValues(categoryNamesList);
      }
    }, [audiocontainer, audiotitle]);
    
    // console.log("input values", audioinputValues);



const handleAudioUpdatecontainervalue = () => {
  const newValue = parseInt(audioinputValue, 10);
  
  if (audioinputValue === '') {
    alert('Please enter a valid number');
    return;
  }
  
  if (newValue <= audioContainer) {
    // Alert if the new value is less than the existing audioContainer
    alert('New value cannot be less than the existing value');
  
    // console.log(" new value  lesser than === audioContainer value")
    setaudioInputValue(audioContainer);
  } else {
    // Update audioContainer only if the new value is valid
    if (audioContainer <= 0) {
  
      // console.log("audio less than === 0")
      setaudioContainer(newValue);
      const rows = Array.from({ length:  audioinputValue }, (_, index) => ({
        movienameID: ''
      }));
      setaudioTableData(rows);
      setaudioInputValue(newValue);
      setaudioContainer(newValue);
      setaudioDropdownStates(Array(newValue).fill(false)); // Initialize dropdown states
      setaudioInputValues(Array(newValue).fill("")); // Initialize input values
    }
    else if (audioContainer >= 0) {
  
      // console.log("audio greater than === 0")
      setaudioTableData((prevData) => {
        // Check if the current inputValue exceeds the existing rows in tableData
        if (newValue > prevData.length) {
          // Add new rows while keeping the existing ones intact
          const newRows = Array.from({ length: newValue - prevData.length }, () => ({
            movienameID: ''
          }));
          return [...prevData, ...newRows]; // Combine old rows with new empty rows      
        }
        return prevData; // If inputValue is less than or equal, return existing data
      });
  
      setaudioDropdownStates((prevDropdownStates) => {
        // Check if inputValue exceeds the current length of dropdownStates
        if (newValue > prevDropdownStates.length) {
          // Add 'false' values to the end of dropdownStates
          const extraStates = Array(newValue - prevDropdownStates.length).fill(false);
          return [...prevDropdownStates, ...extraStates]; // Combine old states with new 'false' values
        }
        return prevDropdownStates; // If inputValue is less than or equal, return existing data
      });
      setaudioInputValues((prevInputValues) => {
        // Check if inputValue exceeds the current length of dropdownStates
        if (newValue > prevInputValues.length) {
          // Add 'false' values to the end of dropdownStates
          const extraValues = Array(newValue - prevInputValues.length).fill("");
          return [...prevInputValues, ...extraValues]; // Combine old states with new 'false' values
        }
        return prevInputValues; // If inputValue is less than or equal, return existing data
      });
  
      setaudioInputValue(newValue);
      setaudioContainer(newValue);
    }
  }
  };


// Toggle dropdown for specific row
const handleaudioDropdownToggle = (index) => {
  setaudioExistIndexvalue(index)
  
  
  if(index==audioexistIndexvalue){
    const updatedDropdownStatesToFalse = audiodropdownStates.map(() => false);
  setaudioDropdownStates(updatedDropdownStatesToFalse);
  setaudioExistIndexvalue(null)
  
  }else{
  setaudioDropdownStates(prevvideoDropdownStates => 
    prevvideoDropdownStates.map((state, i) => (i === index ? !state : false))
    
  );
  }
  
  };

  // Handle input change for filtering options
const handleaudioInputChanget = (e, index) => {
  const value = e.target.value.toLowerCase();  // Convert the input to lowercase
  const updatedInputValues = [...audioinputValues];
  updatedInputValues[index] = value;
  setaudioInputValues(updatedInputValues);
  
  const value2=e.target.value;
  const category = audiotitle.find(cat => cat.movie_name === value2);
  const data=category ? category.id : null;
  
  
  const updatedData = audiotableData.map((row, i) => {
    if (i === index) {
      return { ...row, movienameID: data };  // Dynamically update the field
    }
    return row;  // Return other rows unchanged
  });
  setaudioTableData(updatedData);
  
  const categoryNames = audiotitle.map(item => item.movie_name);
  // Separate options that start with the value from those that contain it elsewhere
  const startsWithValue = categoryNames.filter(option =>
    option.toLowerCase().startsWith(value)  // Options that start with the input
  );
  
  const containsValue = categoryNames.filter(option =>
    option.toLowerCase().includes(value) && !option.toLowerCase().startsWith(value)  // Options that contain but don't start with the input
  );
  
  // Combine the two lists, with starting matches first
  const filtered = [...startsWithValue, ...containsValue];
  
  setaudioFilteredOptions(filtered);  // Update the filtered options
  };

// Handle selecting an option
const handleaudioOptionClick = (option, index) => {
  const updatedInputValues = [...audioinputValues];
  updatedInputValues[index] = option;
  setaudioInputValues(updatedInputValues);
  
  const updatedDropdownStates = [...audiodropdownStates];
  updatedDropdownStates[index] = false;
  setaudioDropdownStates(updatedDropdownStates);
  const newValue = option;
  
  const category = audiotitle.find(cat => cat.movie_name === newValue);
  const data=category ? category.id : null;
  
  
  const updatedData = audiotableData.map((row, i) => {
    if (i === index) {
      return { ...row, movienameID: data };  // Dynamically update the field
    }
    return row;  // Return other rows unchanged
  });
  setaudioTableData(updatedData);
  const categoryNames = audiotitle.map(item => item.movie_name);
  setaudioFilteredOptions(categoryNames) 
  };

  const handleAudioSubmit = async () => {
    try {
        // Send the POST request using Axios
        const saveResponse = await axios.post(`${API_URL}/api/v2/createaudiobanner`, audiotableData, {
            headers: {
                Authorization: token, // Your token here
                'Content-Type': 'application/json',  // JSON content type
            },
        });

        if (saveResponse.status === 200) {
            Swal.fire({
                title: 'Success!',
                text: 'Audiobanners  saved successfully',
                icon: 'success',
                confirmButtonText: 'OK'
            }).then((result) => {
                if (result.isConfirmed) {
                    fetchbannerContainers();
                }
            });
        // } else {
        //     Swal.fire({
        //         title: 'Error!',
        //         text: 'Error saving Audiobanners',
        //         icon: 'error',
        //         confirmButtonText: 'OK'
        //     });
        }
    } catch (error) {
        console.error('Error uploading data:', error);
        throw error;
        // Swal.fire({
        //     title: 'Error!',
        //     text: 'Error uploading data',
        //     icon: 'error',
        //     confirmButtonText: 'OK'
        // });
    }
};

  console.log("audiotableData",audiotableData)


  // Handle row deletion
const handleAudioDelete = async (index) => {
  // console.log('inside function')
  // console.log(tableData)
  if (index >= 0 && index < audiotableData.length) {
    const data = audiotableData[index];
    if(data.id!=null){
      try {
        const response = await axios.delete(`${API_URL}/api/v2/deleteaudiobanner/${data.id}`, {
          headers: {
            Authorization: token, // Your token here
          }
        });
        // console.log(response.data); // AudioContainer deleted successfully
        Swal.fire({
          title: 'Deleted!',
          text: 'AudioBanner deleted successfully',
          icon: 'success',
          confirmButtonText: 'OK'
        }).then(() => {
          fetchAudiobanner();
        });
      } catch (error) {
        console.error(error);
        throw error;
        // Swal.fire({
        //   title: 'Error!',
        //   text: 'Failed to delete the AudioBanner',
        //   icon: 'error',
        //   confirmButtonText: 'OK'
        // });
      }
    }
    else{
      Swal.fire({
        title: 'Deleted',
        text: 'AudioBanner data deleted ',
        icon: 'warning',
        confirmButtonText: 'OK'
      });
    }
  } 
  const updatedData = audiotableData.filter((_, i) => i !== index);
  
  const updatedDropdownStates = audiodropdownStates.filter((_, i) => i !== index);
  setaudioDropdownStates(updatedDropdownStates);
  
  // Delete the item at the specific index from inputValues
  const updatedInputValues = audioinputValues.filter((_, i) => i !== index);
  setaudioInputValues(updatedInputValues);
  
  setaudioTableData(updatedData);
  setaudioContainer(videoContainer - 1); // Reduce the count
  setaudioInputValue(updatedData.length);
  
  };

  console.log("audioinputValues",audioinputValues)





  

  return (
    <div className="marquee-container">
    <div className='AddArea'>
      <Dropdown 
      show={isOpen} 
      onToggle={() => setIsOpen(!isOpen)} // Toggle the dropdown
    >
      <Dropdown.Toggle
     
        className={`${
          isOpen ? 'bg-custom-color text-orange-600' : 'bg-custom-color'
        } hover:bg-custom-color hover:text-orange-600`}
      >
        {selectedSetting}
      </Dropdown.Toggle>

      <Dropdown.Menu>
        {settingsOptions.map((setting, index) => (
          <Dropdown.Item
            as={Link}
            to={setting.path}
            key={index}
            onClick={() => handleSettingChange(setting)}
          >
            {setting.name}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
    </div>
    <br />
    <div className='container3'>
        <ol className="breadcrumb mb-4 d-flex my-0">
          <li className="breadcrumb-item">
            <Link to="/admin/SiteSetting">Settings</Link>
          </li>
          <li className="breadcrumb-item active  text-white">Banner Settings</li>
        </ol>
        <div className="outer-container">

      {activeView === 'movie' && (
        <>
          <div className="row py-3" style={{ paddingLeft: '50px', paddingRight: '70px', marginTop: '10px' }}>
            

             <div className="col-lg-2 d-flex toggle" style={{ height: '50px', borderRadius: '55px' }}>
              <button
                className={`col-lg-6 custom-btn ${activeView === 'movie' ? 'active-btn' : 'inactive-btn'}`}
                onClick={() => handleViewChange('movie')}
                style={{ height: '35px' }}
              >
                Movie
              </button>
              <button
                className={`col-lg-6 custom-btn ${activeView === 'music' ? 'active-btn' : 'inactive-btn'}`}
                onClick={() => handleViewChange('music')}
                style={{ height: '35px' }}
              >
                Music
              </button> 
            </div> 

            <div className="col-lg-3"></div>
            <div className="col-lg-2 custom-label" style={{ paddingTop: '6px', textAlign: 'right' }}>
              No of Containers
            </div>
            <div className="col-lg-3">
              <small className="text-muted d-block" style={{ marginTop: '-19px' }}>
                Max 20 containers only*
              </small>
              <input
                type="number"
                name="Audio Title Count"
                id="audioContainer"
                required
                className="form-control border border-dark input-width"
                placeholder="Enter Number of Containers"
                value={videoinputValue === 0 ? '' : videoinputValue}
                min="0"
                max="20"
                step="1"
                onChange={(e) => {
                  const value = e.target.value;
                    // Remove leading zeros
                    const sanitizedValue = value.replace(/^0+(?=\d)/, '');
                    // Allow only digits and empty value
                    if (/^\d*$/.test(sanitizedValue)) {
                      setVideoInputValue(sanitizedValue === '' ? 0 : sanitizedValue);
                    }
                  }}
              />
            </div>
            <div className="col-lg-1">
              <button className="btn btn-primary" 
              onClick={handleVideoUpdatecontainervalue}
              >
                Create
              </button>
            </div>
          </div>
          <div className='row' style={{ margin: '0px',paddingTop:'0px',paddingBottom:'0px',paddingLeft:'50px',paddingRight:'75px'}}>
            <table className="table" style={{ margin: '0px'}}>
            <thead style={{ backgroundColor: '#2b2a52', color: 'white' }}>
                     <tr>
                       <th className='col-lg-1'></th>
                       <th className='col-lg-3'>Video Name</th>
                       <th className='col-lg-1'>Action</th>
                     </tr>
                   </thead>
                   </table>
                   </div>
            
  </>
          )}


{activeView === 'music' && (
        <>
          <div className="row py-3" style={{ paddingLeft: '50px', paddingRight: '70px', marginTop: '10px' }}>
            

             <div className="col-lg-2 d-flex toggle" style={{ height: '50px', borderRadius: '55px' }}>
              <button
                className={`col-lg-6 custom-btn ${activeView === 'movie' ? 'active-btn' : 'inactive-btn'}`}
                onClick={() => handleViewChange('movie')}
                style={{ height: '35px' }}
              >
                Movie
              </button>
              <button
                className={`col-lg-6 custom-btn ${activeView === 'music' ? 'active-btn' : 'inactive-btn'}`}
                onClick={() => handleViewChange('music')}
                style={{ height: '35px' }}
              >
                Music
              </button> 
            </div> 

            <div className="col-lg-3"></div>
            <div className="col-lg-2 custom-label" style={{ paddingTop: '6px', textAlign: 'right' }}>
              No of Containers
            </div>
            <div className="col-lg-3">
              <small className="text-muted d-block" style={{ marginTop: '-19px' }}>
                Max 20 containers only*
              </small>
              <input
                type="number"
                name="Audio Title Count"
                id="audioContainer"
                required
                className="form-control border border-dark input-width"
                placeholder="Enter Number of Containers"
                value={audioinputValue === 0 ? '' : audioinputValue}
                min="0"
                max="20"
                step="1"
                onChange={(e) => {
                  const value = e.target.value;
                    // Remove leading zeros
                    const sanitizedValue = value.replace(/^0+(?=\d)/, '');
                    // Allow only digits and empty value
                    if (/^\d*$/.test(sanitizedValue)) {
                      setaudioInputValue(sanitizedValue === '' ? 0 : sanitizedValue);
                    }
                  }}
              />
            </div>
            <div className="col-lg-1">
              <button className="btn btn-primary" 
              onClick={handleAudioUpdatecontainervalue}
              >
                Create
              </button>
            </div>
          </div>
          <div className='row' style={{ margin: '0px',paddingTop:'0px',paddingBottom:'0px',paddingLeft:'50px',paddingRight:'75px'}}>
            <table className="table" style={{ margin: '0px'}}>
            <thead style={{ backgroundColor: '#2b2a52', color: 'white' }}>
                     <tr>
                       <th className='col-lg-1'></th>
                       <th className='col-lg-3'>Movie</th>
                       <th className='col-lg-1'>Action</th>
                     </tr>
                   </thead>
                   </table>
                   </div>
            
  </>
          )}


          <div className="table-container mb-3" style={{ height: '40vh' }}>
  {activeView === 'movie' && (
    <DragDropContext onDragEnd={handleOnDragEnd}>
      <Droppable droppableId="videotableData">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="w-100 h-auto ml-auto mr-auto pl-4 pr-4"
          >
            <div className="row" style={{ marginLeft: '0px', marginRight: '0px', paddingTop: '0px', marginBottom: '0px' }}>
              {videoContainer > 0 && (
                <div className="w-100 h-auto ml-auto mr-auto pl-4 pr-4">
                  <table className="table" style={{ margin: '0px' }}>
                    <tbody>
                      {videotableData.map((row, index) => (
                        <Draggable key={index} draggableId={index.toString()} index={index}>
                          {(provided, snapshot) => (
                            <tr
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <td className="col-lg-1">{index + 1}</td>
                              <td className="col-lg-3">
                                <div className="dropdown-container" style={style.videodropdownContainer} ref={videodropdownRef}>
                                  <input
                                    type="text"
                                    value={videoinputValues[index] || ""}
                                    onClick={() => handlevideoDropdownToggle(index)}
                                    onChange={(e) => handlevideoInputChanget(e, index)}
                                    className="form-control border border-dark input-width col-lg-12"
                                    style={{
                                      ...style.videodropdownInput,
                                      backgroundColor: snapshot.isDragging ? 'skyblue' : 'white', // Change color when dragging
                                    }}
                                    placeholder="Select an option"
                                  />
                                  {videodropdownStates[index] && (
                                    <div className="col-lg-12 custom-scrollbar" style={style.videodropdownList}>
                                      {videofilteredOptions.map((option, idx) => (
                                        <div
                                          key={idx}
                                          className="dropdown-item col-lg-12"
                                          style={style.videodropdownItem}
                                          onClick={() => handlevideoOptionClick(option, index)}
                                        >
                                          {option}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </td>

                                 
                              <td className="col-lg-1">
                                <button onClick={() => handleVideoDelete(index)} className="btn btn-danger">
                                  <i className="bi bi-trash3"></i>
                                </button>
                              </td>
                            </tr>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </Droppable>
    </DragDropContext>
  )}



{activeView === 'music' && (
    <DragDropContext onDragEnd={handleOnDragEndaudio}>
      <Droppable droppableId="videotableData">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="w-100 h-auto ml-auto mr-auto pl-4 pr-4"
          >
            <div className="row" style={{ marginLeft: '0px', marginRight: '0px', paddingTop: '0px', marginBottom: '0px' }}>
              {audioContainer > 0 && (
                <div className="w-100 h-auto ml-auto mr-auto pl-4 pr-4">
                  <table className="table" style={{ margin: '0px' }}>
                    <tbody>
                      {audiotableData.map((row, index) => (
                        <Draggable key={index} draggableId={index.toString()} index={index}>
                          {(provided, snapshot) => (
                            <tr
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <td className="col-lg-1">{index + 1}</td>
                              <td className="col-lg-3">
                                <div className="dropdown-container" style={style.videodropdownContainer} ref={audiodropdownRef}>
                                  <input
                                    type="text"
                                    value={audioinputValues[index] || ""}
                                    onClick={() => handleaudioDropdownToggle(index)}
                                    onChange={(e) => handleaudioInputChanget(e, index)}
                                    className="form-control border border-dark input-width col-lg-12"
                                    style={{
                                      ...style.videodropdownInput,
                                      backgroundColor: snapshot.isDragging ? 'skyblue' : 'white', // Change color when dragging
                                    }}
                                    placeholder="Select an option"
                                  />
                                  {audiodropdownStates[index] && (
                                    <div className="col-lg-12 custom-scrollbar" style={style.videodropdownList}>
                                      {audiofilteredOptions.map((option, idx) => (
                                        <div
                                          key={idx}
                                          className="dropdown-item col-lg-12"
                                          style={style.videodropdownItem}
                                          onClick={() => handleaudioOptionClick(option, index)}
                                        >
                                          {option}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </td>

                                 
                              <td className="col-lg-1">
                                <button onClick={() => handleAudioDelete(index)} className="btn btn-danger">
                                  <i className="bi bi-trash3"></i>
                                </button>
                              </td>
                            </tr>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </Droppable>
    </DragDropContext>
  )}

</div>


 



        {activeView === 'movie' && (
              <>
              <div className='row py-3' style={{ marginLeft: '0px' ,marginRight: '0px',paddingRight:'70px'}} >
                       <div className='col-lg-9 '>
                          
                           </div>
                           <div className='col-lg-2'> 
                             <div className='col-lg-8'>
                           <button
                             className="btn border border-dark w-20 ml-11 text-black me-2 rounded-lg"  style={{ marginTop:'-50px',marginLeft: '65px' }}
                             // onClick={'handleUpdatecontainervalue'}  // Using the function here
                           >
                             Cancel
                           </button>
                           </div>
                           </div>
             
                           <div className='col-lg-1'><button
                             className="btn btn-primary"
                             style={{ marginTop:'-50px',backgroundColor: 'blue' }} onClick={handleSubmit}  // Using the function here
                           >
                             Submit
                           </button>
                           </div>
                         </div>
               </>
                       )}


{activeView === 'music' && (
              <>
              <div className='row py-3' style={{ marginLeft: '0px' ,marginRight: '0px',paddingRight:'70px'}} >
                       <div className='col-lg-9 '>
                          
                           </div>
                           <div className='col-lg-2'> 
                             <div className='col-lg-8'>
                           <button
                             className="btn border border-dark w-20 ml-11 text-black me-2 rounded-lg"  style={{ marginTop:'-50px',marginLeft: '65px' }}
                             // onClick={'handleUpdatecontainervalue'}  // Using the function here
                           >
                             Cancel
                           </button>
                           </div>
                           </div>
             
                           <div className='col-lg-1'><button
                             className="btn btn-primary"
                             style={{ marginTop:'-50px',backgroundColor: 'blue' }} onClick={handleAudioSubmit}  // Using the function here
                           >
                             Submit
                           </button>
                           </div>
                         </div>
               </>
                       )}


        </div>
        </div>
        </div>
  );
};

export default Banner_setting;







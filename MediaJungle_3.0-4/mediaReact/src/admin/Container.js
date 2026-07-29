import React, { useState, useEffect } from 'react';
import { Dropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import API_URL from '../Config';
import Swal from 'sweetalert2';
import { useRef } from 'react';
import axios from 'axios';

const Container = () => {
 
  const [activeView, setActiveView] = useState('movie');
  const [categories, setCategories] = useState([]);
  const token = sessionStorage.getItem("tokenn")


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


const [isOpen, setIsOpen] = useState(false);
const [selectedSetting, setSelectedSetting] = useState("Container Settings");
  const settingsOptions = [
    { name: "Site Settings", path: "/admin/SiteSetting" },
    { name: "Social Settings", path: "/admin/Social_setting" },
    { name: "Payment Settings", path: "/admin/Payment_setting" },
    { name: "Banner Settings", path: "/admin/Banner_setting" },
    { name: "Footer Settings", path: "/admin/Footer_setting" },
    { name: "Contact Settings", path: "/admin/Contact_setting" },
    { name: "Container Settings", path: "/admin/container" }
  ];

  const handleSettingChange = (setting) => {
    setSelectedSetting(setting.name);
    setIsOpen(false);
  };

  const handleViewChange = (view) => {
    setActiveView(view);
  };

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



useEffect(() => {
  fetch(`${API_URL}/api/v2/GetAllCategories`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      const categoryNames = data.map(item => item.categories);
      setCategories(data);
      setvideoFilteredOptions(categoryNames); 
    })
    .catch(error => {
      console.error('Error fetching data:', error);
      throw error;
    });
  fetchVideoContainers();
}, []);



  const fetchVideoContainers = async () => {
    fetch(`${API_URL}/api/v2/getvideocontainers`)
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

  useEffect(() => {
    if (videocontainer.length && categories.length) {
        // Get only the category names for matching categoryId
        const categoryNamesList = videocontainer.map(container => {
            // Convert both category_id and container.category to numbers for comparison
            const category = categories.find(cat => Number(cat.category_id) === Number(container.category));
            return category ? category.categories : 'Unknown'; // Return 'Unknown' if category doesn't exist
        });

        // Store only the category names in state
        setvideoInputValues(categoryNamesList);

        // Log videocontainer and category names list to the console
        console.log("Videocontainer:", videocontainer);
        console.log("Category Names List:", categoryNamesList);
    }
}, [videocontainer, categories]);





    // Handle input change for filtering options
const handlevideoInputChanget = (e, index) => {
  const value = e.target.value.toLowerCase();  // Convert the input to lowercase
  const updatedInputValues = [...videoinputValues];
  updatedInputValues[index] = value;
  setvideoInputValues(updatedInputValues);
  
  const value2=e.target.value;
  const category = categories.find(cat => cat.categories === value2);
  const data=category ? category.category_id : null;
  
  
  const updatedData = videotableData.map((row, i) => {
    if (i === index) {
      return { ...row, category: data };  // Dynamically update the field
    }
    return row;  // Return other rows unchanged
  });
  setvideoTableData(updatedData);
  
  const categoryNames = categories.map(item => item.categories);
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


  const handlevideoDropdownToggleselect =()=>{
  const updatedDropdownStatesToFalse = videodropdownStates.map(() => false);
  setvideoDropdownStates(updatedDropdownStatesToFalse);
  setvideoExistIndexvalue(null);
  }
  
   // Toggle dropdown for specific row
const handlevideoDropdownToggle = (index) => {
  setvideoExistIndexvalue(index)
  console.log("videodropdowm",videodropdownStates);
  
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
  
  const category = categories.find(cat => cat.categories === newValue);
  const data=category ? category.category_id : null;
  
  
  const updatedData = videotableData.map((row, i) => {
    if (i === index) {
      return { ...row, category: data };  // Dynamically update the field
    }
    return row;  // Return other rows unchanged
  });
  setvideoTableData(updatedData);
  const categoryNames = categories.map(item => item.categories);
  setvideoFilteredOptions(categoryNames)
  console.log("categoryNames",categoryNames)
  
  
  };


  // Handle input change in the table rows
const handleVideoInputChange = (e, index, field) => {


  const newValue = e.target.value;
  const updatedData = videotableData.map((row, i) => {
    if (i === index) {
      return { ...row, [field]: newValue };
    }
    return row;
  });
  setvideoTableData(updatedData);
  };
  
  const handleSubmit = async () => {
    try {
        // Send the POST request using Axios
        const saveResponse = await axios.post(`${API_URL}/api/v2/videocontainer`, videotableData, {
            headers: {
                Authorization: token, // Your token here
                'Content-Type': 'application/json',  // JSON content type
            },
        });

        if (saveResponse.status === 200) {
            Swal.fire({
                title: 'Success!',
                text: 'VideoContainers and Categories data saved successfully',
                icon: 'success',
                confirmButtonText: 'OK'
            }).then((result) => {
                if (result.isConfirmed) {
                    fetchVideoContainers();
                }
            });
        // } else {
        //     Swal.fire({
        //         title: 'Error!',
        //         text: 'Error saving VideoContainers and Categories data',
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

  console.log(videotableData)

  // Handle row deletion
const handleVideoDelete = async (index) => {
  // console.log('inside function')
  // console.log(tableData)
  if (index >= 0 && index < videotableData.length) {
    const data = videotableData[index];
    if(data.id!=null){
      try {
        const response = await axios.delete(`${API_URL}/api/v2/videocontainer/${data.id}`, {
          headers: {
            Authorization: token, // Your token here
          }
        });
        // console.log(response.data); // AudioContainer deleted successfully
        Swal.fire({
          title: 'Deleted!',
          text: 'VideoContainer deleted successfully',
          icon: 'success',
          confirmButtonText: 'OK'
        }).then(() => {
          // window.location.reload(); // Refresh page after deletion
          fetchVideoContainers();
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
        value: '',
        category: ''
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
            value: '',
            category: ''
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
  
  useEffect(() => {
  const handlevideoClickOutside = (event) => {
    // Check if the click happened outside the dropdown or the input
    if (videodropdownRef.current && !videodropdownRef.current.contains(event.target)) {
      const updatedDropdownStatesToFalse = videodropdownStates.map(() => false);
      setvideoDropdownStates(updatedDropdownStatesToFalse); // Call your function only if clicked outside
      console.log(videodropdownStates);
      console.log('dropdownStates-inside');
    }
  };
  console.log('dropdownStates-outside');
  // Add event listener
  document.addEventListener('mousedown', handlevideoClickOutside);
  
  // Cleanup event listener on component unmount
  return () => {
    document.removeEventListener('mousedown', handlevideoClickOutside);
  };
  }, [videodropdownStates]); // Add dropdownStates as dependency
  
// -----------------------------------------------------------------music-------- -------------------------------------------------------------  
const [audioContainer, setAudioContainer] = useState(0);  // Actual state used for audioTitle
const [inputValue, setInputValue] = useState('');  // Internal input value
const [tableData, setTableData] = useState([]);  // Data for the table
// const [categories, setCategories] = useState([]);
const [filteredOptions, setFilteredOptions] = useState([]);
const [inputValues, setInputValues] = useState([]); // Track input values for each row
const [dropdownStates, setDropdownStates] = useState([]); // Track dropdown open/close states for each row
// const token = sessionStorage.getItem("tokenn")
const [audiocontainer, setaudiocontainere] = useState('');  // Internal input value
const dropdownRef = useRef(null); // Create a ref for the dropdown container
const [existIndexvalue, setExistIndexvalue] = useState([]);
const [existingData, setExistingData] = useState([]); // Create a ref for the dropdown container

const styles = {
  audiodropdownContainer: {
    width: "100%",
    position: "relative",
  },
  audiodropdownInput: {
    width: "100%",
    padding: "8px",
    boxSizing: "border-box",
  },
  audiodropdownList: {
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
 
  audiodropdownItem: {
    padding: "8px",
    cursor: "pointer",
  },
};


// useEffect(() => {
//   fetch(`${API_URL}/api/v2/GetAllCategories`)
//     .then(response => response.ok ? response.json() : Promise.reject('Network response was not ok'))
//     .then(data => setCategories(data))
//     .catch(error => {
//       console.error('Error fetching data:', error);
//       setError(error);
//     });
// }, []);


// const handleSubmit = (e) => {
//   e.preventDefault();

//   // Perform validation if needed
//   if (containers.length === 0) {
//     alert('No containers to submit');
//     return;
//   }

//   // Submit the data (POST request)
//   fetch(`${API_URL}/api/v2/videocontainer`, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({ containers }),
//   })
//     .then(response => response.ok ? response.json() : Promise.reject('Error submitting containers'))
//     .then(data => {
//       console.log('Success:', data);
//       // Handle success response
//     })
//     .catch(error => {
//       console.error('Error submitting containers:', error);
//       setError(error);
//     });
// };
// --------------------------------------------------------------------------------------------------------------------------------
useEffect(() => {
fetch(`${API_URL}/api/v2/GetAllCategories`)
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    const categoryNames = data.map(item => item.categories);
    // setCategories(categoryNames);
    setCategories(data);
    setFilteredOptions(categoryNames);

    
  })
  .catch(error => {
    console.error('Error fetching data:', error);
    throw error;
  });
  fetchAudioContainers();
}, []);

const fetchAudioContainers = async () => {
fetch(`${API_URL}/api/v2/audiocontainer`)
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    const categoryNames = data.map(item => item.categories);
    setaudiocontainere(data);
    setInputValue(data.length);
    setTableData(data);
    setExistingData(data);
    setInputValue(data.length);
    setAudioContainer(data.length);
    setDropdownStates(Array(data.length).fill(false)); // Initialize dropdown states
  })
  .catch(error => {
    console.error('Error fetching data:', error);
    throw error;
  });
};


useEffect(() => {
if (audiocontainer.length && categories.length) {
// Get only the category names for matching categoryId
const categoryNamesList = audiocontainer.map(container => {
const category = categories.find(cat => cat.category_id === container.categoryId);
return category ? category.categories : 'Unknown'; // Return 'Unknown' if category doesn't exist
});
setInputValues(categoryNamesList); // Store only the category names in state
}
}, [audiocontainer, categories]);


// Handle input change for filtering options
const handleInputChanget = (e, index) => {
const value = e.target.value.toLowerCase();  // Convert the input to lowercase
const updatedInputValues = [...inputValues];
updatedInputValues[index] = value;
setInputValues(updatedInputValues);

const value2=e.target.value;
const category = categories.find(cat => cat.categories === value2);
const data=category ? category.category_id : null;


const updatedData = tableData.map((row, i) => {
  if (i === index) {
    return { ...row, categoryId: data };  // Dynamically update the field
  }
  return row;  // Return other rows unchanged
});
setTableData(updatedData);

const categoryNames = categories.map(item => item.categories);
// Separate options that start with the value from those that contain it elsewhere
const startsWithValue = categoryNames.filter(option =>
  option.toLowerCase().startsWith(value)  // Options that start with the input
);

const containsValue = categoryNames.filter(option =>
  option.toLowerCase().includes(value) && !option.toLowerCase().startsWith(value)  // Options that contain but don't start with the input
);

// Combine the two lists, with starting matches first
const filtered = [...startsWithValue, ...containsValue];

setFilteredOptions(filtered);  // Update the filtered options
};
const handleDropdownToggleselect =()=>{
const updatedDropdownStatesToFalse = dropdownStates.map(() => false);
setDropdownStates(updatedDropdownStatesToFalse);
setExistIndexvalue(null);
}


// Toggle dropdown for specific row
const handleDropdownToggle = (index) => {
setExistIndexvalue(index)

if(index==existIndexvalue){
  const updatedDropdownStatesToFalse = dropdownStates.map(() => false);
setDropdownStates(updatedDropdownStatesToFalse);
setExistIndexvalue(null)

}else{
setDropdownStates(prevDropdownStates => 
  prevDropdownStates.map((state, i) => (i === index ? !state : false))
  
);
}

};

// Handle selecting an option
const handleOptionClick = (option, index) => {
const updatedInputValues = [...inputValues];
updatedInputValues[index] = option;
setInputValues(updatedInputValues);

const updatedDropdownStates = [...dropdownStates];
updatedDropdownStates[index] = false;
setDropdownStates(updatedDropdownStates);
const newValue = option;

const category = categories.find(cat => cat.categories === newValue);
const data=category ? category.category_id : null;


const updatedData = tableData.map((row, i) => {
  if (i === index) {
    return { ...row, categoryId: data };  // Dynamically update the field
  }
  return row;  // Return other rows unchanged
});
setTableData(updatedData);
const categoryNames = categories.map(item => item.categories);
setFilteredOptions(categoryNames)


};

// Handle input change in the table rows
const handleInputChange = (e, index, field) => {


const newValue = e.target.value;
const updatedData = tableData.map((row, i) => {
  if (i === index) {
    return { ...row, [field]: newValue };
  }
  return row;
});
setTableData(updatedData);
};




const handleSubmitAudio =async () => {
  try {
    // Send the POST request using Axios
    const AudioData = new FormData();
    tableData.forEach((container) => {
      AudioData.append(`container_name`, container.container_name);
      AudioData.append(`categoryId`, container.categoryId);
    });
    
    const saveResponse = await axios.post(`${API_URL}/api/v2/audiocontainer`, tableData, {
      headers: {
        Authorization: token, // Your token here
        'Content-Type': 'application/json',  // JSON content type
      },
    });
    // console.log(tableData)
    if (saveResponse.status === 200) {
     
      Swal.fire({
        title: 'Success!',
        text: 'Containers and Categories data saved successfully',
        icon: 'success',
        confirmButtonText: 'OK'
      }).then((result) => {
        if (result.isConfirmed) {
          // The 'OK' button was clicked, now refresh the page
          // window.location.reload();
          fetchAudioContainers();
        }
      });
    // } else {
    //   Swal.fire({
    //     title: 'Error!',
    //     text: 'Error saving Containers and Categoryes  data',
    //     icon: 'error',
    //     confirmButtonText: 'OK'
    //   });
    }
  } catch (error) {
    console.error('Error uploading data:', error);
    throw error;
    // Swal.fire({
    //   title: 'Error!',
    //   text: 'Error uploading data',
    //   icon: 'error',
    //   confirmButtonText: 'OK'
    // });
  }

};

// Handle row deletion
const handleDelete = async (index) => {
// console.log('inside function')
// console.log(tableData)
if (index >= 0 && index < tableData.length) {
  const data = tableData[index];
  if(data.id!=null){
    try {
      const response = await axios.delete(`${API_URL}/api/v2/audiocontainer/${data.id}`, {
        headers: {
          Authorization: token, // Your token here
        }
      });
      // console.log(response.data); // AudioContainer deleted successfully
      Swal.fire({
        title: 'Deleted!',
        text: 'AudioContainer deleted successfully',
        icon: 'success',
        confirmButtonText: 'OK'
      }).then(() => {
        // window.location.reload(); // Refresh page after deletion
        fetchAudioContainers();
      });
    } catch (error) {
      console.error(error);
      throw error;
      // Swal.fire({
      //   title: 'Error!',
      //   text: 'Failed to delete the AudioContainer',
      //   icon: 'error',
      //   confirmButtonText: 'OK'
      // });
    }
  }
  else{
    Swal.fire({
      title: 'Deleted',
      text: 'Containers and Categoryes  data deleted ',
      icon: 'warning',
      confirmButtonText: 'OK'
    });
  }
} 



const updatedData = tableData.filter((_, i) => i !== index);

const updatedDropdownStates = dropdownStates.filter((_, i) => i !== index);
setDropdownStates(updatedDropdownStates);

// Delete the item at the specific index from inputValues
const updatedInputValues = inputValues.filter((_, i) => i !== index);
setInputValues(updatedInputValues);

setTableData(updatedData);
setAudioContainer(audioContainer - 1); // Reduce the count
setInputValue(updatedData.length);

};
const handleUpdatecontainervalue = () => {
const newValue = parseInt(inputValue, 10);

if (inputValue === '') {
  alert('Please enter a valid number');
  return;
}

if (newValue <= audioContainer) {
  // Alert if the new value is less than the existing audioContainer
  alert('New value cannot be less than the existing value');

  // console.log(" new value  lesser than === audioContainer value")
  setInputValue(audioContainer);
} else {
  // Update audioContainer only if the new value is valid
  if (audioContainer <= 0) {

    // console.log("audio less than === 0")
    setAudioContainer(newValue);
    const rows = Array.from({ length: inputValue }, (_, index) => ({
      container_name: '',
      categoryId: ''
    }));
    setTableData(rows);
    setInputValue(newValue);
    setAudioContainer(newValue);
    setDropdownStates(Array(newValue).fill(false)); // Initialize dropdown states
    setInputValues(Array(newValue).fill("")); // Initialize input values
  }
  else if (audioContainer >= 0) {

    // console.log("audio greater than === 0")
    setTableData((prevData) => {
      // Check if the current inputValue exceeds the existing rows in tableData
      if (newValue > prevData.length) {
        // Add new rows while keeping the existing ones intact
        const newRows = Array.from({ length: newValue - prevData.length }, () => ({
          container_name: '',
          categoryId: ''
        }));
        return [...prevData, ...newRows]; // Combine old rows with new empty rows      
      }
      return prevData; // If inputValue is less than or equal, return existing data
    });

    setDropdownStates((prevDropdownStates) => {
      // Check if inputValue exceeds the current length of dropdownStates
      if (newValue > prevDropdownStates.length) {
        // Add 'false' values to the end of dropdownStates
        const extraStates = Array(newValue - prevDropdownStates.length).fill(false);
        return [...prevDropdownStates, ...extraStates]; // Combine old states with new 'false' values
      }
      return prevDropdownStates; // If inputValue is less than or equal, return existing data
    });
    setInputValues((prevInputValues) => {
      // Check if inputValue exceeds the current length of dropdownStates
      if (newValue > prevInputValues.length) {
        // Add 'false' values to the end of dropdownStates
        const extraValues = Array(newValue - prevInputValues.length).fill("");
        return [...prevInputValues, ...extraValues]; // Combine old states with new 'false' values
      }
      return prevInputValues; // If inputValue is less than or equal, return existing data
    });

    setInputValue(newValue);
    setAudioContainer(newValue);
  }
}




};

useEffect(() => {
const handleClickOutside = (event) => {
  // Check if the click happened outside the dropdown or the input
  if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
    const updatedDropdownStatesToFalse = dropdownStates.map(() => false);
    setDropdownStates(updatedDropdownStatesToFalse); // Call your function only if clicked outside
    console.log(dropdownStates);
    console.log('dropdownStates-inside');
  }
};
console.log('dropdownStates-outside');
// Add event listener
document.addEventListener('mousedown', handleClickOutside);

// Cleanup event listener on component unmount
return () => {
  document.removeEventListener('mousedown', handleClickOutside);
};
}, [dropdownStates]); // Add dropdownStates as dependency





  return (
    <div className="marquee-container">
      <div className='AddArea'>
        <Dropdown className="mb-4" show={isOpen} onClick={() => setIsOpen(!isOpen)}>
          <Dropdown.Toggle className={`${isOpen ? 'bg-custom-color text-orange-600' : 'bg-custom-color'} hover:bg-custom-color hover:text-orange-600`}>
            {selectedSetting}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {settingsOptions.map((setting, index) => (
              <Dropdown.Item as={Link} to={setting.path} key={index} onClick={() => handleSettingChange(setting)}>
                {setting.name}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
      </div>

      <div className='container3'>
        <ol className="breadcrumb mb-4 d-flex my-0">
          <li className="breadcrumb-item"><Link to="/admin/SiteSetting">Settings</Link></li>
          <li className="breadcrumb-item active text-white">Container Settings</li>
        </ol>

        <div className="outer-container">
          {/* <div className="table-container"> */}
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
              >
                Music
              </button>
            </div>
              <div className='col-lg-3'>
              </div> 
              <div className='col-lg-2 custom-label'style={{ paddingTop:'6px',textAlign:'right '}}>No of Container
              </div> 
              <div className='col-lg-3'> 
              <small className="text-muted d-block" style={{ marginTop: '-19px'}}>Max 20 containers only*</small>
                <input
                  type="number"
                  name="Video Title Count"
                  id="videoContainer"
                  required
                  className="form-control border border-dark input-width"
                  placeholder="Enter Number of Containers"
                  value={videoinputValue === 0 ? '' : videoinputValue}  // Show empty field when value is 0
                  min="0"  // Prevent negative numbers
                  step="1" // Only allow integers
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
              <div className='col-lg-1'><button
                className="btn btn-primary"
                onClick={handleVideoUpdatecontainervalue}  // Using the function here
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
                       <th className='col-lg-5' >Container</th>
                       <th className='col-lg-5'>Category Name</th>
                       <th className='col-lg-1'>Action</th>
                     </tr>
                   </thead>
                   </table>
                   </div>
            
  </>
          )}
           {activeView === 'music' && (
              <>
                      <div className='row py-3' style={{ marginLeft: '0px' ,marginRight: '0px',marginTop: '10px',paddingLeft:'50px',paddingRight:'70px'}} >
          <div className='col-lg-2 d-flex toggle' style={{ marginLeft: '0px' ,marginRight: '0px',marginTop: '0px',paddingBottom:'5px',paddingTop:'5px',borderRadius:'55px',height:'50px',paddingRight:'5px'}}>
            
              
              <button className={`col-lg-6  custom-btn  ${activeView === 'movie' ? 'active-btn' : 'inactive-btn'}`} onClick={() => handleViewChange('movie')} style={{ height:'35px'}}>
                Movie
              </button>
              <button className={`col-lg-6  custom-btn ${activeView === 'music' ? 'active-btn' : 'inactive-btn'}`} onClick={() => handleViewChange('music')}>
                Music
              </button>
             
              </div>
              <div className='col-lg-3'>
              </div> 
              <div className='col-lg-2 custom-label'style={{ paddingTop:'6px',textAlign:'right '}}>No of Container
              </div> 
              <div className='col-lg-3'> 
              <small className="text-muted d-block" style={{ marginTop: '-19px'}}>Max 20 containers only*</small>
                <input
                  type="number"
                  name="Audio Title Count"
                  id="audioContainer"
                  required
                  className="form-control border-dark border-2 input-width"
                  placeholder="Enter Number of Containers"
                  value={inputValue === 0 ? '' : inputValue}  // Show empty field when value is 0
                  min="0"  // Prevent negative numbers
                  step="1" // Only allow integers
                  onChange={(e) => {
                    const value = e.target.value;

                    // Remove leading zeros
                    const sanitizedValue = value.replace(/^0+(?=\d)/, '');

                    // Allow only digits and empty value
                    if (/^\d*$/.test(sanitizedValue)) {
                      setInputValue(sanitizedValue === '' ? 0 : sanitizedValue);
                    }
                  }}
                />
              </div>
              <div className='col-lg-1'><button
                className="btn btn-primary"
                onClick={handleUpdatecontainervalue}  // Using the function here
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
                       <th className='col-lg-5' >Container</th>
                       <th className='col-lg-5'>Category Name</th>
                       <th className='col-lg-1'>Action</th>
                     </tr>
                   </thead>
                   </table>
                   </div>
                   
              
              </>)}

              <div className="table-container mb-3" style={{ height: '40vh' }}>
                {activeView === 'movie' && (
              <div className='row' style={{ marginLeft: '0px' ,marginRight: '0px',paddingTop: '0px',marginBottom:'0px'}}>
    <div className='row' style={{ padding: '0px' }} >
    {videoContainer > 0 && (
      <div className="w-100 h-auto  ml-auto mr-auto  pl-4 pr-4" >
     <table className="table" style={{ margin: '0px' }}>
       
                    <tbody>
                      {videotableData.map((row, index) => (
           <tr key={index}>
             <td className='col-lg-1'>{index + 1}</td> {/* Automatically incremented S.No */}
             <td className='col-lg-5'>
               <input
                 type="text"
                 name="container"
                 className="form-control border border-dark input-width col-lg-12"
                 placeholder="Enter Container"
                 value={row.value}
                 onClick={() => handlevideoDropdownToggleselect()}
                 onChange={(e) => handleVideoInputChange(e, index, 'value')}
               />
             </td>
             <td className='col-lg-5' >
               <div className="dropdown-container"
               style={style.videodropdownContainer} 
               ref={videodropdownRef} >
                 <input
                   type="text"
                   value={videoinputValues[index] || ""}
                   onClick={() => handlevideoDropdownToggle(index)}
                   onChange={(e) => handlevideoInputChanget(e, index)}
                   className="form-control border border-dark input-width col-lg-12"
                   style={style.videodropdownInput}
                   placeholder="Select an option"
                  
                 />
                 {videodropdownStates[index] && (
                   <div className=" col-lg-12 custom-scrollbar" 
                   style={style.videodropdownList}  
                   ref={videodropdownRef}>
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
                 <br />
               </div>
             </td>
             <td className='col-lg-1'>
               <button  onClick={() => handleVideoDelete(index)}className="btn btn-danger bi bi-trash3">
               </button>
             </td>
           </tr>
          ))}
          </tbody>
        </table>
        </div>
      )}
    </div>
     </div>
   )}



{activeView === 'music' && (
<div className='row' style={{ marginLeft: '0px' ,marginRight: '0px',paddingTop: '0px',marginBottom:'0px'}}>
    <div className='row' style={{ padding: '0px' }} >
    
    {audioContainer > 0 && (
      <div className="w-100 h-auto  ml-auto mr-auto  pl-4 pr-4" >
     <table className="table" style={{ margin: '0px' }}>
       
       <tbody>
         {tableData.map((row, index) => (
           <tr key={index}>
             <td className='col-lg-1'>{index + 1}</td> {/* Automatically incremented S.No */}
             <td className='col-lg-5'>
               <input
                 type="text"
                 name="Container"
                 className="form-control border border-dark input-width col-lg-12"
                 placeholder="Enter Container"
                 value={row.container_name}
                 onClick={() => handleDropdownToggleselect()}
                 onChange={(e) => handleInputChange(e, index, 'container_name')}
               />
             </td>
             <td className='col-lg-5' >
               <div className="dropdown-container" style={styles.audiodropdownContainer} ref={dropdownRef} >
                 <input
                   type="text"
                   value={inputValues[index] || ""}
                   onClick={() => handleDropdownToggle(index)}
                   onChange={(e) => handleInputChanget(e, index)}
                   className="form-control border border-dark input-width col-lg-12"
                   style={styles.audiodropdownInput}
                   placeholder="Select an option"
                  
                 />
                 {dropdownStates[index] && (
                   <div className=" col-lg-12 custom-scrollbar" style={styles.audiodropdownList}  ref={dropdownRef}>
                     {filteredOptions.map((option, idx) => (
                       <div
                         key={idx}
                         className="dropdown-item col-lg-12"
                         style={styles.audiodropdownItem}
                         onClick={() => handleOptionClick(option, index)}
                       >
                         {option}
                       </div>
                     ))}
                   </div>
                 )}
                 <br />
               </div>
             </td>
             <td className='col-lg-1'>
               <button onClick={() => handleDelete(index)} className="btn btn-danger bi bi-trash3">
               </button>
             </td>
           </tr>
         ))}
       </tbody>
     </table>
     </div>
   )}
 </div>
  </div>
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
                className="btn border border-dark w-20 ml-11 text-black me-2 rounded-lg"  style={{ marginTop:'-50px', marginLeft: '65px' }}
                // onClick={'handleUpdatecontainervalue'}  // Using the function here
              >
                Cancel
              </button>
              </div>
              </div>

              <div className='col-lg-1'><button
                className="btn btn-primary"
                style={{ marginTop:'-50px',backgroundColor: 'blue' }} onClick={handleSubmitAudio}  // Using the function here
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

export default Container;


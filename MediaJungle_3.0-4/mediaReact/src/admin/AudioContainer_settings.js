import React, { useState, useEffect } from 'react';
import axios from 'axios';
// import '../csstemp/addAudio.css';
import ReactPlayer from 'react-player';
import API_URL from '../Config';
import { Link } from 'react-router-dom';
import "../css/Sidebar.css";
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import "../App.css"
import { useRef } from 'react';
import { Dropdown } from 'react-bootstrap';


const AudioContainer_settings = () => {
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
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSetting, setSelectedSetting] = useState("Container Settings");
  const [activeView, setActiveView] = useState('movie');
  const [containers, setContainers] = useState([]);
  const [numOfContainers, setNumOfContainers] = useState(0);
  // const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);



  
  const [audioContainer, setAudioContainer] = useState(0);  // Actual state used for audioTitle
  const [inputValue, setInputValue] = useState('');  // Internal input value
  const [tableData, setTableData] = useState([]);  // Data for the table
  const [categories, setCategories] = useState([]);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [inputValues, setInputValues] = useState([]); // Track input values for each row
  const [dropdownStates, setDropdownStates] = useState([]); // Track dropdown open/close states for each row
  const token = sessionStorage.getItem("tokenn")
  const [audiocontainer, setaudiocontainere] = useState('');  // Internal input value
  const dropdownRef = useRef(null); // Create a ref for the dropdown container
  const [existIndexvalue, setExistIndexvalue] = useState([]);
  const [existingData, setExistingData] = useState([]); // Create a ref for the dropdown container


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
// console.log(audiocontainer)
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




const handleSubmit1 =async () => {
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
        <div className='row py-3' style={{ marginLeft: '0px' ,marginRight: '0px',marginTop: '10px',paddingLeft:'50px',paddingRight:'70px'}} >
          <div className='col-lg-3 d-flex toggle' style={{ marginLeft: '0px' ,marginRight: '0px',marginTop: '0px',paddingBottom:'5px',paddingTop:'5px',borderRadius:'55px'}}>
            
              
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
                  className="form-control border border-dark border-2 input-width"
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
                       <th className='col-lg-1'></th>
                     </tr>
                   </thead>
                   </table>
                   </div>
          <div className="table-container" style={{ height: '40vh'}}>

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
                             className="form-control border border-dark border-2 input-width col-lg-12"
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
                               className="form-control border border-dark border-2 input-width col-lg-12"
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
            <div className='row py-3' style={{ marginLeft: '0px' ,marginRight: '0px',marginTop: '10px',paddingLeft:'50px',paddingRight:'70px'}} >
              <div className='col-lg-9'>
              </div> 
            
              <div className='col-lg-2'> 
                {/* <div className='col-lg-8'> */}
              <button
                className="btn border border-dark border-2  w-20  text-black me-2 rounded-lg" style={{ marginLeft: '70px' }}
                // onClick={'handleUpdatecontainervalue'}  // Using the function here
              >
                Cancel
              </button>
              {/* </div> */}
              </div>
              
              <div className='col-lg-1'><button
                className="btn btn-primary"
                style={{ backgroundColor: 'blue' }} onClick={handleSubmit1}  // Using the function here
              >
                Submit
              </button>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};




export default AudioContainer_settings

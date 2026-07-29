import React, { useState, useEffect } from 'react';
import API_URL from '../Config';

const AddAud = () => {
  const [categories, setCategories] = useState([]);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);

  // Fetch categories from the API
  useEffect(() => {
    fetch(`${API_URL}/api/v2/GetAllCategories`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        // Extract categories from the response
        const categoryNames = data.map(item => item.categories);
        setCategories(categoryNames);
        setFilteredOptions(categoryNames);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        throw error;
      });
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    // Filter options based on input
    const filtered = categories.filter(option =>
      option.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredOptions(filtered);
  };

  const handleDropdownToggle = () => {
    setDropdownOpen(!isDropdownOpen);
  };

  const handleOptionClick = (option) => {
    setInputValue(option);
    setDropdownOpen(false);
    setSelectedCategories(option);
  };

  return (
    <div className="row">
      <div className="dropdown-container" style={styles.dropdownContainer}>
        <input
          type="text"
          value={inputValue}
          onClick={handleDropdownToggle}
          onChange={handleInputChange}
          className="dropdown-input"
          style={styles.dropdownInput}
          placeholder="Select an option"
        />
        {isDropdownOpen && (
          <div className="dropdown-list" style={styles.dropdownList}>
            {filteredOptions.map((option, index) => (
              <div
                key={index}
                className="dropdown-item"
                style={styles.dropdownItem}
                onClick={() => handleOptionClick(option)}
              >
                {option}
              </div>
            ))}
          </div>
        )}
        <br />
      </div>
    </div>
  );
};

const styles = {
  dropdownContainer: {
    width: "100px",
    position: "relative",
    margin: "20px",
  },
  dropdownInput: {
    width: "100%",
    padding: "8px",
    boxSizing: "border-box",
  },
  dropdownList: {
    position: "absolute",
    top: "40px",
    left: "0",
    width: "100%",
    maxHeight: "150px", // Maximum height for scrollable dropdown
    overflowY: "auto", // Enable scrolling
    backgroundColor: "white",
    border: "1px solid #ccc",
    zIndex: 1,
  },
  dropdownItem: {
    padding: "8px",
    cursor: "pointer",
  },
};

export default AddAud;

import React, { useState } from "react";

const CustomDropdown = () => {
  const options = [
    "Action", "Adventure", "Comedy", "Drama", "Horror",
    "Science Fiction ", "sci-i", "Option H", "Option I", "Option J",
    "Option K", "Option L", "Option M", "Option N", "Option O",
    "Option P", "Option Q", "Option R", "Option S", "Option T"
  ];
  
  const [filteredOptions, setFilteredOptions] = useState(options);
  const [inputValue, setInputValue] = useState("");
  const [isDropdownOpen, setDropdownOpen] = useState(false);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    const filtered = options.filter((option) =>
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
  };

  return (
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
    overflowY: "auto",  // Enable scrolling
    backgroundColor: "white",
    border: "1px solid #ccc",
    zIndex: 1,
  },
  dropdownItem: {
    padding: "8px",
    cursor: "pointer",
  },
};

export default CustomDropdown;

import React from "react";

const DurationPickerEdit = ({ onChange, durationInMinutes, setDurationInMinutes, duration, setDuration }) => {
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Create an updated duration object
    const updatedDuration = { ...duration, [name]: value };

    // Compute total minutes using the updated values
    const totalMinutes = parseInt(updatedDuration.hours) * 60 + parseInt(updatedDuration.minutes);
    
    // Update state
    setDuration(updatedDuration);
    setDurationInMinutes(totalMinutes);

    // Call onChange with the correct totalMinutes value
    if (onChange) {
      onChange(totalMinutes);
    }
  };

  return (
    <div style={{ display: "flex", gap: "35px" }}>
      <select name="hours" value={duration.hours} onChange={handleChange} className="btn btn-light">
        {Array.from({ length: 7 }, (_, i) => (
          <option key={i} value={i}>{i} hr</option>
        ))}
      </select>

      <select name="minutes" value={duration.minutes} onChange={handleChange} className="btn btn-light">
        {Array.from({ length: 4 }, (_, i) => (
          <option key={i} value={i * 15}>{i * 15} min</option>
        ))}
      </select>
    </div>
  );
};

export default DurationPickerEdit;

import React, { useEffect, useState } from "react";

const DurationPicker = ({ onChange, durationInMinutes, setDurationInMinutes }) => {
  const [duration, setDuration] = useState({ hours: "0", minutes: "30" }); // Default to 30 minutes

  // Update total duration in minutes whenever hours/minutes change
  useEffect(() => {
    const totalMinutes = parseInt(duration.hours) * 60 + parseInt(duration.minutes);
    
    // Prevent setting duration to 0
    if (totalMinutes === 0) {
      setDuration({ hours: "0", minutes: "15" }); // Minimum 15 min
      setDurationInMinutes(15);
      onChange && onChange({ hours: "0", minutes: "15", totalMinutes: 15 });
      return;
    }

    setDurationInMinutes(totalMinutes);
    onChange && onChange({ ...duration, totalMinutes });
  }, [duration, onChange]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedDuration = { ...duration, [name]: value };

    const totalMinutes = parseInt(updatedDuration.hours) * 60 + parseInt(updatedDuration.minutes);

    // Prevent setting 0 hr 0 min
    if (totalMinutes === 0) return;

    setDuration(updatedDuration);
    setDurationInMinutes(totalMinutes);
    onChange && onChange({ ...updatedDuration, totalMinutes });
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

export default DurationPicker;

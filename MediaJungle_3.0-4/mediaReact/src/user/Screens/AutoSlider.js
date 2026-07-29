import React, { useState, useEffect } from 'react';

const AutoSlider = ({ images, API_URL }) => {
  const [currentIndexBanner, setCurrentIndexBanner] = useState(0); // Track the current index
  const delay = 3000; // Set the delay to 3 seconds

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndexBanner((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, delay);

    // Clean up the interval on component unmount
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="slider-container" >
      <div className="slider-track" style={{ display: 'flex', overflow: 'hidden' }}>
        <div className="slider-content" style={{ transition: 'transform 0.5s ease-in-out' }}>
          <div className="movie-card" style={{ width: '100%', textAlign: 'center' }}>
            <img
              src={`${API_URL}/api/v2/image/${images[currentIndexBanner].id}`}
              alt={images[currentIndexBanner].movieName}
              style={{ width: '90vw', height: '80vh' }}
            />
            <h3>{images[currentIndexBanner].audio_title}</h3>
            <p>{images[currentIndexBanner].certificate_name}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutoSlider;

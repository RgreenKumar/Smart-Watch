import React, { useState } from 'react';

const ManualSlider = ({ category, API_URL }) => {
  const [currentIndex, setCurrentIndex] = useState(0); // Manage the current slide index
  const slidesToShow = 6; // Show 6 images at a time
  const totalSlides = category.audiolist.length; // Calculate total slides for the current category

  // Move to the next slide
  const goNext = () => {
    if (currentIndex < totalSlides - slidesToShow) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  // Move to the previous slide
  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <div className="slider-container">
      <button className="prev-button" onClick={goPrev} disabled={currentIndex === 0}>
      <i class="bi bi-arrow-left-circle"></i> {/* Left caret icon */}
      
      </button>

      <div className="slider-track" style={{ display: 'flex', overflow: 'hidden' }}>
        <div
          className="slider-content"
          style={{
            display: 'flex',
            transform: `translateX(-${currentIndex * (100 / slidesToShow)}%)`,
            transition: 'transform 0.5s ease-in-out',
          }}
        >
          {category.audiolist.map((movie, index) => (
            <div key={movie.id} className="movie-card" style={{ flex: `0 0 ${100 / slidesToShow}%`, textAlign: 'center' }}>
              <img src={`${API_URL}/api/v2/image/${movie.id}`} alt={movie.movieName} style={{ width: '100%', height: '250px',padding: '10px',borderRadius: '20px' }} />
              {/* <h3>{movie.audio_title}</h3> */}
              <p style={{fontSize: '20px'}} >{movie.audio_title}</p>
            </div>
          ))}
        </div>
      </div>

      <button className="next-button" onClick={goNext} disabled={currentIndex >= totalSlides - slidesToShow}>
      <i class="bi bi-arrow-right-circle"></i> {/* right caret icon */}
      </button>
    </div>
  );
};

export default ManualSlider;

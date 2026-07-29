import React from 'react';
import AutoSlider from './AutoSlider';

const AudioBanner = () => {
  const images = [
    {
      id: 1,
      audio_title: 'Movie 1',
      certificate_name: 'PG-13',
    },
    {
      id: 2,
      audio_title: 'Movie 2',
      certificate_name: 'R',
    },
    {
      id: 3,
      audio_title: 'Movie 3',
      certificate_name: 'G',
    },
    // Add more images as needed
  ];

  const API_URL = 'https://www.example.com'; // Replace with your API URL

  return (
    <div>
      <AutoSlider images={images} API_URL={API_URL} />
    </div>
  );
};

export default AudioBanner;

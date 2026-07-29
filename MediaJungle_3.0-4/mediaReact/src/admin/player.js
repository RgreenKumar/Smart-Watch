import React, { useState, useEffect } from 'react';
import ReactPlayer from 'react-player';
import { useLocation } from 'react-router-dom';
import API_URL from '../Config';


const VideoPlayer = () => {
  const [videoUrl, setVideoUrl] = useState('');
  const location = useLocation();
  const id = localStorage.getItem('items');
  const get = location.state ? location.state.get : null; // Check if location.state exists
  
  useEffect(() => {
    console.log("EditVideo=" + id);
    
    const fetchAudio = async () => {
      if (get) { // Ensure get exists before using it
        console.log(get.id);
        // Fetch data using get...
      } else {
        console.log("No 'get' data found in the state.");
      }
    };
    fetchAudio();
  }, [get]);

  return (
    <div className="video-player">
          <div class="work_user">
        <div class="row">
          
      <ReactPlayer
        controls={true}
        url={`${API_URL}/api/v2/play/${id}`}
        config={{
          file: {
            attributes: {
              controlsList: 'nodownload'
            }
          }
        }}
      />
  
    
</div>
</div>
</div>
  );
};

export default VideoPlayer;

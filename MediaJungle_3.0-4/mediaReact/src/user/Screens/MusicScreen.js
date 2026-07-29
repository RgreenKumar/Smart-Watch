import React, { useState, useEffect, useRef } from 'react';
import Layout from '../Layout/Layout';
import axios from 'axios';
import API_URL from '../../Config';
import { FaPlay, FaPause, FaForward, FaBackward, FaTimes, FaRedo} from 'react-icons/fa';
import { Toaster, toast } from 'react-hot-toast';
import plus from '../UserIcon/plus button playlist.png';
import vector from '../UserIcon/list.png';
import pluslist from '../UserIcon/playlist.png';
import share from '../UserIcon/share.png';
import icon from '../UserIcon/like.png';
import repeat from '../UserIcon/Vector.png';
import suffle from '../UserIcon/Vector-1.png';
import { BsShuffle } from "react-icons/bs"; // Import Shuffle Icon from Bootstrap Icons
import { BiArrowRepeat } from "react-icons/bi"; // Repeat icon from Bootstrap Icons


const MusicScreen = () => {
  const musicid = localStorage.getItem('item');
  const [musiclist, setMusiclist] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [bottomBarSong, setBottomBarSong] = useState(null);
  const [showBottomBar, setShowBottomBar] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const userId = sessionStorage.getItem("userId");

  const audioRef = useRef(null);
  // const currentSong = musiclist[currentSongIndex];
  const [playlist, setPlaylist] = useState([]);
  const [currentSong,setCurrentSong] = useState('');
  const [isShuffle, setIsShuffle] = useState(false); // Shuffle state
  const [isRepeat, setIsRepeat] = useState(false); // Repeat state
  const [volume, setVolume] = useState(1); // Default volume is 1 (full volume)
  const [isSliderVisible, setIsSliderVisible] = useState(false); // State for volume slider visibility
  


  useEffect(() => {
    if (musiclist.length > 0 && currentSongIndex >= 0) {
      setCurrentSong(musiclist[currentSongIndex]);
    }
  }, [musiclist, currentSongIndex]);
  
  const fetchPlaylist = async () => {
    try {
      const user = Number(userId);
      const response = await axios.get(`${API_URL}/api/v2/user/${user}/playlists`);
      setPlaylist(response.data);
    } catch (error) {
      console.error('Error fetching Watch Later videos:', error);

    }
  };

  const fetchMusicList = async () => {
    try {
      const user = Number(userId);
      const response = await axios.get(`${API_URL}/api/v2/getaudiodetails/${musicid}/${user}`);
      setMusiclist(response.data);
      if (response.data.length > 0) {
        setBottomBarSong(response.data[0]);
      }
    } catch (error) {
      console.error('Error fetching music list:', error);

    }
  };

  useEffect(() => {
    fetchMusicList();
    fetchPlaylist();
  }, []);

  // Update audio source whenever the current song changes.
  // isPlaying is intentionally NOT in deps — we only reload src when the song
  // changes, not on every play/pause toggle. Playback starts via canplay event.
  useEffect(() => {
    if (!currentSong || !audioRef.current) return;
    const audio = audioRef.current;
    const audioSrc = `${API_URL}/api/v2/${currentSong.audio_file_name}/file`;

    audio.src = audioSrc;
    audio.load(); // Tell the browser to load the new source

    // Wait for the browser to confirm it can play before calling .play()
    // This prevents NotSupportedError when src hasn't loaded yet
    const handleCanPlay = () => {
      if (isPlaying) {
        audio.play().catch((err) => console.error("Error playing audio:", err));
      }
    };
    audio.addEventListener('canplay', handleCanPlay, { once: true });
    return () => audio.removeEventListener('canplay', handleCanPlay);
  }, [currentSong, API_URL]); // eslint-disable-line react-hooks/exhaustive-deps


  const toggleShuffle = () => {
    setIsShuffle((prev) => !prev);
  };

   // Function to handle repeat toggling
   const toggleRepeat = () => {
    setIsRepeat((prev) => !prev);
  };


  const playSong = () => {
    const audio = audioRef.current;
    if (!audio) return;

    // ✅ FIX: Read the real paused state from the element, not from React state.
    // React's isPlaying can lag behind, causing the first click to do nothing
    // when the audio hasn't been started yet.
    if (audio.paused) {
      audio.play().catch((err) => console.error("Error playing audio:", err));
      setIsPlaying(true);
    } else {
      audio.pause();
      setIsPlaying(false);
    }
    setShowBottomBar(true);
  };

  const playPrevious = () => {
    if (musiclist.length > 0) {
      const previousIndex =
        currentSongIndex > 0 ? currentSongIndex - 1 : musiclist.length - 1;
      setCurrentSongIndex(previousIndex);
    }
  };

  const playNext = () => {
    if (musiclist.length > 0) {
      if (isShuffle) {
        const randomIndex = Math.floor(Math.random() * musiclist.length);
        setCurrentSongIndex(randomIndex);
      } else {
        const nextIndex = (currentSongIndex + 1) % musiclist.length;
        setCurrentSongIndex(nextIndex);
      }
    }
  };


  const playSongFromList = (index) => {
    setCurrentSongIndex(index);
    setIsPlaying(true); // ✅ FIX: mark as playing so canplay handler starts the audio
    setShowBottomBar(true);
  };


  
  // Manage audio events for time update and duration
  useEffect(() => {
    const audio = audioRef.current;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const setAudioDuration = () => setDuration(audio.duration);

    // Add event listeners to handle time updates and song end
    const handleSongEnd = () => {
      if (isRepeat) {
        audio.currentTime = 0; // Reset to the beginning of the song
        audio.play(); // Play again
      } else {
        playNext(); // Proceed to the next song if repeat is not enabled
      }
    };

    if (audio) {
      audio.addEventListener("timeupdate", updateTime);
      audio.addEventListener("loadedmetadata", setAudioDuration);
      audio.addEventListener("ended", handleSongEnd); // Handle song end here

      return () => {
        audio.removeEventListener("timeupdate", updateTime);
        audio.removeEventListener("loadedmetadata", setAudioDuration);
        audio.removeEventListener("ended", handleSongEnd); // Clean up listener
      };
    }
  }, [currentSong, isRepeat]); // Dependencies to run when song or repeat changes
  

  
  
  
  
  const closeBottomBar = () => {
    setShowBottomBar(false);
    setIsPlaying(false);
  };

  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    const audio = audioRef.current;

    if (audio) {
      audio.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const progressPercentage = duration ? (currentTime / duration) * 100 : 0;

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes < 10 ? `0${minutes}` : minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
  };


  const songListStyle = {
    maxHeight: musiclist.length > 6 ? '450px' : 'auto', // Show scrollbar only if there are more than 6 songs
    overflowY: musiclist.length > 6 ? 'auto' : 'hidden', // Apply scrolling only if more than 6 songs
  };

  const handleAddToFavorites = async (audioId) => {
    try {
      const response = await axios.post(`${API_URL}/api/v2/favourite/audio`, {
        audioId,
        userId,
      });

      console.log(response.data); // Display success or error message from the backend
      toast.success("Added");
      fetchMusicList();
    } catch (error) {
      console.log('Error adding to favorites: ' + error.message); // Handle error
      toast.error("Already Added")

    } 
  };

  const handleRemoveFromFavorites = async (audioId) =>{
    try{
      const response = await axios.delete(
        `${API_URL}/api/v2/${userId}/removeFavoriteAudio`, // Adjust the endpoint if necessary
        {
          params: { audioId },
        }
      );
      console.log(response.data); // Display success or error message from the backend
      toast.success("Removed");
      fetchMusicList();
    } catch (error) {
      console.log('Error adding to favorites: ' + error.message); // Handle error

      
    } 
  };
  
  console.log("song",currentSong)

  const [openplaylistpopup,setopenplaylistpopup] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [popup,setpopup] = useState(false);
  const menuRef = useRef(null);

  const handleClickOutside = (event) => {
    if (menuRef.current && !menuRef.current.contains(event.target)) {
     setopenplaylistpopup(false);
     setpopup(false);


    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  

  const openCreatePlaylistPopup =() =>{
    setpopup(true);
    
  }

  const playlistpopup = () =>{
    setopenplaylistpopup(true);
    setpopup(false);
  }

  const closeplaylistpopup =() =>{
    setopenplaylistpopup(false);
  }

  const handleAddAudio = async (playlistIndex, audioId) => {
    // Assuming your playlist has an `id` field
   try {
     // Send a POST request to add the audio ID to the specified playlist
     const response = await axios.post(`${API_URL}/api/v2/${playlistIndex}/audio/${audioId}`);
     console.log('Audio added to playlist:', response.data);
     toast.success("Added");
     
     // Optionally, you can update the state to reflect the changes
     // e.g., you might want to refresh the playlists or update UI accordingly
 
   } catch (error) {
     console.error('Error adding audio to playlist:', error);
     toast.error("Error adding audio to playlist");

     // Optionally, show an error message to the user
   }
 };

 const handleSubmit = async (e) => {
  e.preventDefault();
  const user = Number(userId); // Ensure userid is a number
  const formData = new FormData();
  formData.append('title', title);
  formData.append('description', description);
  formData.append('userId', user);
  formData.append('audioId', currentSong.id);

  try {
      const response = await axios.post(`${API_URL}/api/v2/createplaylistid`, formData, {
          headers: {
              'Content-Type': 'multipart/form-data', // Automatically handled by axios with FormData
          },
      });
     // Display success toast in top-right corner
     console.log("success");
     toast.success("Successfully created");
     closeplaylistpopup(); // Close the pop-up after successful creation
      fetchPlaylist();
    } catch (error) {
      toast.error("Not created");
      console.error("Error creating playlist:", error.response?.data || error.message);

  
  }
};

console.log("issuffle",isShuffle)

const handleVolumeChange = (e) => {
  const newVolume = e.target.value;
  setVolume(newVolume);
  if (audioRef.current) {
    audioRef.current.volume = newVolume;
  }
};

const toggleSliderVisibility = () => {
  setIsSliderVisible((prev) => !prev);
};

const getVolumeIcon = () => {
  if (volume === 0) return '🔇';
  if (volume <= 0.5) return '🔉';
  return '🔊';
};


console.log("bottomBarSong",bottomBarSong);
  return (
    <Layout>
      <div className="music-player">
        {/* Left Side */}
        <div className="left-side">
          
          {currentSong ? (
            <>
            <span style={{ marginBottom: '30px',fontSize: '20px' }}>{currentSong.moviename}</span>
              <img
                src={`${API_URL}/api/v2/image/${currentSong.id}`}
                alt="Album Art"
                className="album-art"
              />
              <span style={{ fontSize: '20px' }}>{currentSong.audio_title}</span>
              <span style={{ fontSize: '20px' }}>({currentSong.moviename})</span>
            </>
          ) : (
            <p>Loading...</p>
          )}
          
          
          <div className="controls">
          <button
          className="control-button"
          onClick={toggleShuffle}
          style={{ color: isShuffle ? "red" : "white" }}
        >
          <BsShuffle style={{ fontSize: "20px" }} />
        </button>
            <button onClick={playPrevious} className="control-button"><FaBackward /></button>
            <button
  onClick={playSong}
  className="control-button"
  style={{ color: isPlaying ? "red" : "white" }}
>
  {isPlaying ? <FaPause /> : <FaPlay />}
</button>

            <button onClick={playNext} className="control-button"><FaForward /></button>
            <button 
            className='control-button'
            onClick={toggleRepeat}
            style={{color:isRepeat?'red':'white'}}
            >
            {/* <img src={repeat} alt='' style={{width:'20px',height:'20px'}}/> */}
            <i className="bi bi-arrow-repeat" style={{ fontSize: "20px" }}></i> {/* Repeat Icon */}
            </button>
          </div>

          <div className="actions">
          <button
    onClick={() => {
      if (currentSong && currentSong.id) {
        if (currentSong.like == true) {
          // If already liked, remove from favorites
          handleRemoveFromFavorites(currentSong.id);
        } else {
          // If not liked, add to favorites
          handleAddToFavorites(currentSong.id);
        }
      }
      
    }}
    className="action-button"
    style={{
      color: currentSong && currentSong.like == true ? 'red' : 'white', // Set color conditionally
    }}
  >
    <img
      src={icon}
      alt=""
      style={{ width: '15px', height: '15px' }}
    />
    {currentSong && currentSong.like == true ? 'Liked' : 'Like'} {/* Conditional text */}
  </button>
            {/* <button  className="action-button"><i class="fas fa-thumbs-up fs-10"></i> Like</button> */}
            <button  
            onClick={openCreatePlaylistPopup}
            className="action-button">
            <img src={pluslist} alt='' style={{width:'15px',height:'15px'}}/>Playlist
            </button>

            {popup && (
  <div
  ref={menuRef}
    style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: 'rgba(50, 50, 50, 0.5)',
      color: 'white',
      padding: '20px',
      borderRadius: '8px',
      zIndex: 20,
      width: '300px',
      textAlign: 'center',
    }}
  >
    {/* Centered "Create Playlist" Button */}
    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
      <button 
        onClick={playlistpopup}
        style={{
          backgroundColor: 'white',
          color: 'black',
          padding: '10px',
          borderRadius: '5px',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <img src={plus} alt="plus" style={{ width: '20px', height: '20px' }} />
        Create Playlist
      </button>
    </div>

    {/* Centered Playlist Items */}
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      overflowY: 'auto',
      maxHeight: '90px',
      scrollbarWidth: 'thin', // For Firefox
      scrollbarColor: 'black  transparent', // Track color (black) and thumb color (dark grey) for Firefox
    }}>
      <style>
        {`
        /* For WebKit browsers (Chrome, Safari, etc.) */
        div::-webkit-scrollbar {
            width: 8px;
        }
        div::-webkit-scrollbar-track {
            background: transparent; /* Scrollbar track color */
        }
        div::-webkit-scrollbar-thumb {
            background-color: black ; /* Scrollbar thumb color */
            border-radius: 4px;
        }
        `}
      </style>

      <style>
  {`
    .playlist-item {
      cursor: pointer;
      transition: background-color 0.3s;
    }

    .playlist-item:hover {
      background-color: rgba(255, 255, 255, 0.1); /* Change to desired hover color */
    }
  `}
</style>

      <ul style={{ listStyleType: 'none', padding: 0, width: '100%' }}>
        {playlist.map((title, index) => (
          <li 
            key={index} 
            className="playlist-item"  // Apply the className for hover effect

            onClick={() => {
              if (currentSong && currentSong.id) {
                handleAddAudio(title.id, currentSong.id);
              } else {
                console.error('Current song or song ID is not available');
              }
            }}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              width: '100%',
              marginBottom: '10px',
              padding: '10 20px'
            }}
          >
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
              <img 
                src={vector} 
                alt="icon" 
                style={{ width: '20px', height: '20px' }}
              />
            </div>
            <div style={{ flex: 1, textAlign: 'left' }}>
              {title.title}
            </div>
          </li>
        ))}
      </ul>
    </div>
  </div>
)}
            {/* Create New Playlist Pop-up */}
      {openplaylistpopup && (
        <div
        ref={menuRef}
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(50, 50, 50, 0.5)',
            color: 'white',
            padding: '20px',
            borderRadius: '8px',
            zIndex: 30,
            width: '300px',
          }}
        >
          <h4 style={{textAlign:'center'}}>New Playlist</h4>

          {/* Title Input */}
<div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
  <label className="mt-3" style={{ color: 'white', fontSize: '14px', marginRight: '60px' }}>Title</label>
  <input 
    type="text"
    value={title}
    onChange={(e) => setTitle(e.target.value)}
    style={{
      flex: 1, // Reduces the input width
      // maxWidth: '200px', // Optional: sets a maximum width
      border: 'none',
      borderBottom: '1px solid white',
      backgroundColor: 'transparent',
      color: 'white',
      outline: 'none',
      paddingBottom: '5px'
    }}
    required
  />
</div>



          {/* Description Input */}
<div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
  <label style={{ color: 'white', fontSize: '14px', marginRight: '10px' }}>Description</label>
  <input 
    type="text"
    value={description}
    onChange={(e) => setDescription(e.target.value)}
    style={{
      flex: 1, // Make input take available space
      border: 'none',
      borderBottom: '1px solid white',
      backgroundColor: 'transparent',
      color: 'white',
      outline: 'none',
      paddingBottom: '5px'
    }}
    required
  />
</div>

          {/* Cancel and Create Buttons */}
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
  <button 
    onClick={closeplaylistpopup}
    style={{
      padding: '10px',
      backgroundColor: 'rgb(43,42, 82)',
      color: 'white',
      border: '1px solid white',
      borderRadius: '5px',
      cursor: 'pointer'
    }}
  >
    Cancel
  </button>
  <button 
    onClick={handleSubmit} // Calls the handleSubmit function
    style={{
      padding: '10px',
      backgroundColor: 'blue',
      color: 'white',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer'
    }}
  >
    Create
  </button>
</div>

        </div>
      )}
            <button  className="action-button">
              <img src={share} alt='' style={{width:'15px', height:'15px'}}/>
              Copy link
            </button>
          </div>
        </div>

        {/* Right Side */}
        <div className="right-side">
          <ul className="song-list" style={songListStyle}>
            {musiclist.map((song, index) => (
              <li
                key={song.id}
                className={index === currentSongIndex ? 'active' : ''}
                onClick={() => playSongFromList(index)}
              >
                <div className="song-details">
                  <span>{index + 1}. {song.audio_title}</span>
                  <span className="song-duration">{song.audio_Duration}</span>
                </div>
                <div className="song-artist">{song.moviename}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom Bar — fixed full-width at the very bottom of the viewport */}
      {showBottomBar && currentSong && (
        <div
          className="bottom-bar"
          style={{
            /* ✅ FIX: Override whatever the .bottom-bar class sets.
               Previously it was anchored to the right corner only.
               These styles force it to span the full width at the bottom. */
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            width: '100%',
            zIndex: 1000,
            backgroundColor: '#1a1a2e',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            flexDirection: 'column',
            padding: 0,
            boxSizing: 'border-box',
          }}
        >
          {/* ── Progress bar row (full width, sits at the very top of the bar) ── */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '4px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              cursor: 'pointer',
            }}
          >
            {/* Red filled portion */}
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                height: '100%',
                width: `${progressPercentage}%`,
                backgroundColor: 'red',
                pointerEvents: 'none',
              }}
            />
            {/* Invisible range input for drag/click seeking */}
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: 0,
                cursor: 'pointer',
                margin: 0,
              }}
            />
          </div>

          {/* ── Main controls row ── */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '8px 20px',
              gap: '12px',
              width: '100%',
              boxSizing: 'border-box',
            }}
          >
            {/* Album art + song info — left side */}
            <img
              src={`${API_URL}/api/v2/image/${currentSong.id}`}
              alt="Album Art"
              style={{ width: '48px', height: '48px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0 }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: '0 0 180px' }}>
              <span style={{ color: 'white', fontSize: '14px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {currentSong.audio_title}
              </span>
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {currentSong.moviename}
              </span>
            </div>

            {/* Playback controls — centre */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, justifyContent: 'center' }}>
              <button
                onClick={toggleShuffle}
                style={{ background: 'none', border: 'none', color: isShuffle ? 'red' : 'white', cursor: 'pointer', fontSize: '18px' }}
              >
                <BsShuffle />
              </button>
              <button
                onClick={playPrevious}
                style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '18px' }}
              >
                <FaBackward />
              </button>
              <button
                onClick={playSong}
                style={{ background: 'none', border: 'none', color: isPlaying ? 'red' : 'white', cursor: 'pointer', fontSize: '22px' }}
              >
                {isPlaying ? <FaPause /> : <FaPlay />}
              </button>
              <button
                onClick={playNext}
                style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '18px' }}
              >
                <FaForward />
              </button>
              <button
                onClick={toggleRepeat}
                style={{ background: 'none', border: 'none', color: isRepeat ? 'red' : 'white', cursor: 'pointer', fontSize: '18px' }}
              >
                <i className="bi bi-arrow-repeat" />
              </button>
            </div>

            {/* Time + volume + close — right side */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '0 0 auto' }}>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', whiteSpace: 'nowrap' }}>
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>

              {/* Volume */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  onClick={toggleSliderVisibility}
                  style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '16px' }}
                >
                  {getVolumeIcon()}
                </button>
                {isSliderVisible && (
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={handleVolumeChange}
                    style={{ width: '80px', accentColor: 'red' }}
                  />
                )}
              </div>

              {/* Close */}
              <button
                onClick={closeBottomBar}
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '16px' }}
              >
                <FaTimes />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Audio Element */}
      <audio ref={audioRef} />
    </Layout>
  );
};

export default MusicScreen;
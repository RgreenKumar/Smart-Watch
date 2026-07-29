import React, { useEffect, useState , useRef} from 'react';
import axios from 'axios';
import API_URL from '../Config';
import Layout from '../user/Layout/Layout';
import Thumbs from '../user/UserIcon/Thumbs Up.png';
import vector from '../user/UserIcon/list.png';
import video from '../user/UserIcon/Video Playlist.png';
import plus from '../user/UserIcon/plus button playlist.png';
import { Toaster, toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const LibraryScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState("likedMusic");
  const [watchLater, setWatchlater] = useState([]);
  const [likedSongs,setLikesSongs] = useState([]);
  const [playlist, setPlaylist] = useState([]);
  const userid = sessionStorage.getItem("userId");
  const menuRef = useRef(null);
  
  const navigate=useNavigate();
  const fetchWatchLater = async () => {
    try {
      const user = Number(userid);
      const response = await axios.get(`${API_URL}/api/v2/${user}/Watchlater`);
      setWatchlater(response.data);
    } catch (error) {
      console.error('Error fetching Watch Later videos:', error);
      throw error;
    }
  };

  const fetchlikedmusic = async () => {
    try {
      const user = Number(userid);
      const response = await axios.get(`${API_URL}/api/v2/${user}/UserAudios`);
      setLikesSongs(response.data);
    } catch (error) {
      console.error('Error fetching Watch Later videos:', error);
      throw error;
    }
  };

  const fetchPlaylist = async () => {
    try {
      const user = Number(userid);
      const response = await axios.get(`${API_URL}/api/v2/user/${user}/playlists`);
      setPlaylist(response.data);
    } catch (error) {
      console.error('Error fetching Watch Later videos:', error);
      throw error;
    }
  };



  useEffect(() => {
    fetchWatchLater();
    fetchlikedmusic();
    fetchPlaylist();
  }, []);

  // console.log("watchLater",watchLater);
  // console.log("likedSongs",likedSongs);
  // console.log("playlist",playlist);

  const [visibleIndex, setVisibleIndex] = useState(null);
  const [watchLaterList, setWatchLaterList] = useState(watchLater); 
  const [likedsonglist,setlikedsonglist] = useState(likedSongs);
  const [openMenuIndex, setOpenMenuIndex] = useState(null);
  const [showPlaylistPopup, setShowPlaylistPopup] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);

  const [showCreatePlaylistPopup, setShowCreatePlaylistPopup] = useState(false);
  const [showplaylistpopup,setshowplaylistpopup] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const [visibleplaylist,setvisibleplaylist] = useState(null);
  const [playlistlist,setplaylistlist] = useState(playlist);
  const [editplaylistpopup,seteditplaylistpopup] = useState(false);
  const [displaysong,setdisplaysong] = useState(null);
  const [movetoplaylist,setmovetoplaylist] = useState(false);

  const Movetoplaylstfunction = () =>{
    setmovetoplaylist(true);
    setdisplaysong(null);
  }

  const closeMovetoplaylstfunction =() =>{
    setmovetoplaylist(false);
  }

  const closePlaylistPopup = () => {
    setshowplaylistpopup(false);
    setTitle(''); // Clear input on close
    setDescription('');
  };

  const openCreatePlaylistPopup = () => {
    setShowCreatePlaylistPopup(true);
    setShowPlaylistPopup(false);
  };

  const openeditplaylistpopup = () =>{
    seteditplaylistpopup(true);
  }

  const closeeditplaylistpopup = () =>{
    seteditplaylistpopup(false);
  }

  const openplaylistpopup = () =>{
    setshowplaylistpopup(true);
  }

  const closeCreatePlaylistPopup = (audioId) => {
    setShowCreatePlaylistPopup(false);
    setTitle(''); // Clear input on close
    setDescription('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = Number(userid); // Ensure userid is a number
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('userId', user);
    formData.append('audioId', selectedSong.audioId);

    try {
        const response = await axios.post(`${API_URL}/api/v2/createplaylistid`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data', // Automatically handled by axios with FormData
            },
        });
       // Display success toast in top-right corner
       console.log("success");
       toast.success("Successfully created");
        closeCreatePlaylistPopup(); // Close the pop-up after successful creation
        fetchPlaylist();
      } catch (error) {
        toast.error("Not created");
        console.error("Error creating playlist:", error.response?.data || error.message);
        throw error;
    
    }
};
const handleEdit = (id) => {
  localStorage.setItem('id', id);
};

const handleSubmitplaylist = async (e) => {
  e.preventDefault();
  const user = Number(userid); // Ensure userid is a number
  const formData = new FormData();
  formData.append('title', title);
  formData.append('description', description);
  formData.append('userId', user);

  try {
      const response = await axios.post(`${API_URL}/api/v2/createplaylist`, formData, {
          headers: {
              'Content-Type': 'multipart/form-data', // Automatically handled by axios with FormData
          },
      });
      console.log(`Playlist created with ID: ${response.data.id}`);
      toast.success('successfully created');
      // Optionally, close the pop-up or reset fields
      closePlaylistPopup(); // Close the pop-up after successful creation
      fetchPlaylist();
    } catch (error) {
      toast.error('Error creating playlist');
      console.error("Error creating playlist:", error.response?.data || error.message);
      throw error;
  
  }
};

const handleEditplaylistdetail = async (e, id) => {
  e.preventDefault(); // Prevent the default form behavior
  const formData = new FormData();
  formData.append('title', editplaylist.title);
  formData.append('description', editplaylist.description);

  try {
    const response = await axios.patch(`${API_URL}/api/v2/editplaylist/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data', // Automatically handled by axios with FormData
      },
    });
    console.log(`Playlist edited with ID: ${response.data.id}`);
    toast.success("successfully edited");
    // Optionally, close the pop-up or reset fields
    closePlaylistPopup(); // Close the pop-up after successful edit
    closeeditplaylistpopup();
    fetchPlaylist(); // Fetch the updated playlist
  } catch (error) {
    console.error("Error editing playlist:", error.response?.data || error.message);
    toast.error("Error editing playlist:", error.response?.data || error.message);
    throw error;
  }
};


const handleAddToPlaylistClick = (song) => {
    setSelectedSong(song); // Track which song is being added to the playlist
    setShowPlaylistPopup(true); // Show the playlist pop-up
    setOpenMenuIndex(false);
    console.log("selected song",song)
  };

  const closePopup = () => {
    setShowPlaylistPopup(false); // Close the playlist pop-up
    setSelectedSong(null); // Reset selected song
  };

const toggleRemovesongButton = (index) => {
  // Toggle the visibility of the menu for the specific item
  setOpenMenuIndex(openMenuIndex === index ? null : index);
};

const toggleRemovesongButtonplaylist=(index)=>{
  setvisibleplaylist(visibleplaylist === index ? null : index)
}
    const toggleRemoveButton = (index) => {
      setVisibleIndex(visibleIndex === index ? null : index);
    };

    const displayoption = (index) =>{
      setdisplaysong(displaysong === index ? null : index);
    }

    const closedisplayoption= () =>{
      setdisplaysong(null);
    }

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuIndex(null);
        setShowPlaylistPopup(false);
        setShowCreatePlaylistPopup(false);
        setVisibleIndex(null);
        setshowplaylistpopup(false)
        setdisplaysong(null);
        setmovetoplaylist(false);
        setvisibleplaylist(null);
        seteditplaylistpopup(false);


      }
    };
  
    useEffect(() => {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);

    // const handleClickOutsideplaylist = (event) => {
    //   if (menuRef.current && !menuRef.current.contains(event.target)) {
    //     setOpenMenuIndex(null);
    //     setShowPlaylistPopup(false);


    //   }
    // };
  
    // useEffect(() => {
    //   document.addEventListener("mousedown", handleClickOutsideplaylist);
    //   return () => {
    //     document.removeEventListener("mousedown", handleClickOutsideplaylist);
    //   };
    // }, []);
  

    const removeFavoriteAudio = async (userId, audioId) => {
      try {
        const formData = new FormData();
        formData.append("audioId", audioId); // Append audioId as a form field
    
        const response = await axios.delete(`${API_URL}/api/v2/${userId}/removeFavoriteAudio`, {
          data: formData, // Pass FormData as the request body
          headers: {
            "Content-Type": "multipart/form-data"
          }
        });
        if (response.status === 200) {
          toast.success('removed');
        console.log(response.data); // Show success message on completion
        fetchlikedmusic();
        return true;
        }
      } catch (error) {
        if (error.response) {
          alert(error.response.data); // Error response from server
        } else if (error.request) {
          toast.error('No response from server. Please try again.');
        } else {
          alert("Error occurred: " + error.message);
        }
        throw error;
      }
    };
    const [play, setPlay] = useState(false);
    const handlePlayClick = (videoid) => {
      handleEdit(videoid);
      setPlay(true);
      if (userid) {
        navigate("/play");
      } else {
        navigate("/UserLogin");
      }
    };
  

    const removeWatchLater = async (userId, videoId) => {
      try {
        const response = await axios.delete(`${API_URL}/api/v2/${userId}/removewatchlater`, {
          headers: {
            'Content-Type': 'application/json',
          },
          data: { videoId: videoId },  // Pass the videoId in the data object
        });
    
        if (response.status === 200) {
          console.log(response.data); // "Video removed from watchlater successfully"
          toast.success("Removed");
          fetchWatchLater();
          return true; // Indicate success
          
        } else {
          console.error(response.data); // Error message from the server
          toast.error("error")
          return false; // Indicate failure
        }
      } catch (error) {
        console.error("Error removing video from watchlater", error);
        toast.error("Error removing video from watchlater");
        
        return false;
        throw error;
      }
    };
    
    const RemoveSongfromPlaylist = async( audioId, playlistid) =>{
      console.log("console",audioId,"playlistid",playlistid)
      try {
        const id = Number(audioId);
        const playlist = Number(playlistid);
        const response = await axios.delete(`${API_URL}/api/v2/${playlist}/audio/${id}/delete`)
    
        if (response.status === 204) {
          console.log(response.data); // "Video removed from watchlater successfully"
          toast.success("Removed");
          fetchPlaylist();
          handleImageClick(playlist);
          closedisplayoption();
          return true; // Indicate success
          
        } else {
          console.error(response.data); // Error message from the server
          toast.error(response.data);
          return false; // Indicate failure
        }
      } catch (error) {
        console.error("Error removing video from watchlater", error);
        toast.error("Error removing song from playlist");
        return false;
        throw error;
      }
    };


    const handleMoveAudio = async(playlistid,audioid,movedplaylistid) =>{

      try {
        const response = await axios.patch(`${API_URL}/api/v2/${playlistid}/moveAudioToPlaylist/${audioid}/${movedplaylistid}`)
        if (response.status === 200) {
          console.log(response.data); // "Video removed from watchlater successfully"
          toast.success("Moved");
          fetchPlaylist();
          handleImageClick(playlistid);
          closeMovetoplaylstfunction();
          return true; // Indicate success
          
        } else {
          console.error(response.data); // Error message from the server
          toast.error(response.data)
          return false; // Indicate failure
        }
      } catch (error) {
        toast.error(error);
        console.error("Error removing video from watchlater", error);
        return false;
        throw error;
      }
    };

  
     // Handle removing a video and updating the UI
  const handleRemove = async (index) => {
    const user = Number(userid);
    console.log("user",index,user);
    // Call the API to remove the video
    const isRemoved = await removeWatchLater(user, index);

    if (isRemoved) {
      // Update the local state to remove the video from the UI
      const updatedList = watchLaterList.filter((_, i) => i !== index);
      setWatchLaterList(updatedList);
      setVisibleIndex(null);
    }
  };



  const handlesongRemove = async (index) => {
    const user = Number(userid);
    const isRemoved = await removeFavoriteAudio(user, index);
    if (isRemoved) {
      // Update the local state to remove the video from the UI
      const updatedList = likedsonglist.filter((_, i) => i !== index);
      setlikedsonglist(updatedList);
      setOpenMenuIndex(null);
    }
  }

  const handleRemovePlaylist = async (playId) => {
    try {
      const response = await axios.delete(`${API_URL}/api/v2/${playId}/delete/playlist`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (response.status === 200) {
        console.log(response.data); // "Video removed from watchlater successfully"
        toast.success("Removed");
        fetchPlaylist();
        return true; // Indicate success
        
      } else {
        console.error(response.data); // Error message from the server
        toast.error(response.data);
        return false; // Indicate failure
      }
    } catch (error) {
      console.error("Error removing playlist", error);
      toast.error(error);
      return false;
      throw error;
    }
  };


  const handleRemoveplaylist = async (index) => {
    const isRemoved = await handleRemovePlaylist(index);
    if(isRemoved){
      const updatedList = playlistlist.filter((_, i) => i !== index);
      setplaylistlist(updatedList);
      setvisibleplaylist(null);
    }
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
      throw error;
      // Optionally, show an error message to the user
    }
  };

  const [editplaylist,seteditplaylist] = useState(null);
  const [error, setError] = useState(null);
  const handleEditplaylist = async (id) =>{
    try {
                // Make a GET request to the endpoint
                const response = await axios.get(`${API_URL}/api/v2/${id}/playlists`);
                
                // Check if the data exists
                if (response.data) {
                    seteditplaylist(response.data);
                    openeditplaylistpopup();
                    setvisibleplaylist(null);
                }
            } catch (err) {
                // Handle errors, if any
                setError('Playlist not found');
                throw err;
            }
        };
        console.log("editplaylist",editplaylist);
  

   const [selectedPlaylist, setSelectedPlaylist] = useState(null);

  const handleImageClick = async (item) =>  {
    // Set the selected playlist to display its details
    console.log(item);
    try {
      const response = await axios.get(`${API_URL}/api/v2/${item}/getPlaylistWithAudioDetails`);
      setSelectedPlaylist(response.data);
      console.log("item",response.data)
    } catch (error) {
      console.error('Error fetching Watch Later videos:', error);
      throw error;
    }
  };

  const handleBackToPlaylists = () => {
    // Clear the selected playlist to show all playlists again
    setSelectedPlaylist(null);
  };


  
  
console.log("visibleplaylist",visibleplaylist)
  const renderContent = () => {
    switch (selectedCategory) {
      case "likedMusic":
        return (
          <div>
      <h3 className='playlisthead'>Liked Music</h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', marginTop: '30px', width: '1000px' }}>
        {likedSongs.map((item, index) => (
          <div
            key={index}
            style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}
          >
            {/* Image */}
            <img
              src={`${API_URL}/api/v2/image/${item.audioId}`}
              alt="video"
              style={{ width: '50px', height: '50px' }}
            />

            {/* Song Title */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flexGrow: 1, marginLeft: '10px' }}>
              <p style={{ color: 'white', fontSize: '14px', margin: '0' }}>{item.audio_title}</p>
            </div>

            {/* Three dots icon */}
            <div
              onClick={() => toggleRemovesongButton(index)}
              style={{
                cursor: 'pointer',
                color: 'white',
                fontSize: '20px',
                position: 'relative',
                marginLeft: 'auto',
              }}
            >
              ⋮
            </div>

            {/* Menu (Remove and Add to Playlist) */}
            {openMenuIndex === index && (
              <div
              ref={menuRef}
                style={{
                  position: 'absolute',
                  top: '1%', // Show it below the three dots
                  right: '13px', // Align it to the left of the three dots
                  backgroundColor: 'rgba(50, 50, 50, 0.5)',
                  color: 'white',
                  borderRadius: '5px',
                  textAlign:'center',
                }}
              >
                <p onClick={() => handlesongRemove(item.audioId)} style={{ cursor: 'pointer', margin: '0', padding: '5px 10px' }}>
                  Remove
                </p>
                <hr />
                <p
                  onClick={() => handleAddToPlaylistClick(item)}
                  style={{ cursor: 'pointer', margin: '0', padding: '5px 10px' }}
                >
                  Add to Playlist
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {showPlaylistPopup && (
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
    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }} className="create-playlist-container">
  <button 
    onClick={openCreatePlaylistPopup}
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
      scrollbarColor: 'black', // Track color (black) and thumb color (dark grey) for Firefox
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
            onClick={() => handleAddAudio(title.id, selectedSong.audioId)}
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
      {showCreatePlaylistPopup && (
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
    onClick={closeCreatePlaylistPopup}
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
    </div>
        );
        case "watchLater":
          return (
            <div>
              <h3>Watch Later</h3>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "40px",
                  marginTop: "30px",
                }}
              >
                {watchLater.map((item, index) => (
                  <div className="watchlater" key={index}>
                    {/* Wrap the image with a clickable action */}
                    <div
                      onClick={() => handlePlayClick(item.videoId)}
                      style={{ cursor: "pointer" }}
                    >
                      <img
                        src={`${API_URL}/api/v2/${item.videoId}/videothumbnail`}
                        alt="video"
                        style={{ width: "100%", borderRadius: "5px" }}
                      />
                    </div>
        
                    {/* Video Title */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        width: "100%",
                      }}
                    >
                      <p
                        style={{
                          color: "white",
                          fontSize: "14px",
                          marginRight: "auto",
                          cursor: "pointer",
                        }}
                        onClick={() => handlePlayClick(item.videoId)} // Make the title clickable too
                      >
                        {item.videoTitle}
                      </p>
        
                      {/* The three vertical dots */}
                      <div
                        onClick={() => toggleRemoveButton(index)}
                        style={{
                          cursor: "pointer",
                          color: "white",
                          fontSize: "20px",
                          marginLeft: "5px",
                          position: "relative",
                        }}
                      >
                        ⋮
                      </div>
        
                      {/* Display Remove button when visibleIndex matches */}
                      {visibleIndex === index && (
                        <button
                          className="remove"
                          ref={menuRef}
                          style={{
                            color: "white",
                            border: "none",
                            padding: "0px 10px",
                            borderRadius: "5px",
                            cursor: "pointer",
                            marginTop: "10px",
                            position: "absolute",
                            background: "rgba(50, 50, 50, 0.5)",
                            top: "95%",
                            left: "50%",
                            transform: "translateX(-50%)",
                            zIndex: 1,
                          }}
                          onClick={() => handleRemove(item.videoId)}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
      case "playlist":
        return (
          <div>
            <h3 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',gap:'800px' }} className='playlisthead'>
    {/* Create Playlist Button */}
    {/* Centered "Create Playlist" Button */}
    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
      <button 
        onClick={openplaylistpopup}
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
  </h3>

  
  {/* Create New Playlist Pop-up */}
  {showplaylistpopup  && (
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
onClick={closePlaylistPopup}
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
onClick={handleSubmitplaylist} // Calls the handleSubmit function
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
            {/* Add playlist rendering here */}
{selectedPlaylist ? ( <div>
          {/* Playlist content view */}
          <button onClick={handleBackToPlaylists}>
  <i className="fas fa-arrow-left" style={{ marginRight: '5px' }}></i>
</button>

           <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', marginTop: '30px', width: '1000px' }}>
      {selectedPlaylist[0].audioDetails && selectedPlaylist[0].audioDetails.length > 0 ? (
        selectedPlaylist[0].audioDetails.map((audio, index) => (
            <div
            key={index}
            style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}
          >
            {/* Image */}
            
            <img
              src={`${API_URL}/api/v2/image/${audio.audioId}`}
              alt="video"
              style={{ width: '50px', height: '50px' }}
            />

            {/* Song Title */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flexGrow: 1, marginLeft: '10px' }}>
              <p style={{ color: 'white', fontSize: '14px', margin: '0' }}>{audio.audio_title}</p>
            </div>

            {/* Three dots icon */}
            <div
              onClick={() => displayoption(index)}
              style={{
                cursor: 'pointer',
                color: 'white',
                fontSize: '20px',
                position: 'relative',
                marginLeft: 'auto',
              }}
            >
              ⋮
            </div>
            {/* Conditional rendering for options */}
          {displaysong === index && (
                  <div
                  ref={menuRef}
                    style={{
                      position: 'absolute',
                      top: '1%', // Show it below the three dots
                      right: '13px', // Align it to the left of the three dots
                      backgroundColor: 'rgba(50, 50, 50, 0.5)',
                      color: 'white',
                      borderRadius: '5px',
                      textAlign:'center',
                    }}
                  >
                    <p 
                    onClick={() => RemoveSongfromPlaylist(audio.audioId,selectedPlaylist[0].playlistId)} 
                    style={{ cursor: 'pointer', margin: '0', padding: '5px 10px' }}>
                      Remove
                    </p>
                    <hr />
                    <p
                       onClick={Movetoplaylstfunction}
                      style={{ cursor: 'pointer', margin: '0', padding: '5px 10px' }}
                    >
                      move to Playlist
                    </p>
                  </div>
                )}

{movetoplaylist && (
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

    {/* Centered Playlist Items */}
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      overflowY: 'auto',
      maxHeight: '90px',
      scrollbarWidth: 'thin', // For Firefox
      scrollbarColor: 'black', // Track color (black) and thumb color (dark grey) for Firefox
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
            onClick={() => handleMoveAudio(selectedPlaylist[0].playlistId,audio.audioId,title.id)}
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

           
          </div>
        ))
      ) : (
        <p>No audio details available.</p>
      )}
    </div>
        </div>): 
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', marginTop: '30px' }}>
            {playlist.map((item, index) => (
              <div className='watchlater' key={index}>
                {item.audioIds[0] ? (
                  <img
                    src={`${API_URL}/api/v2/image/${item.audioIds[0]}`}
                    alt="video"
                    onClick={() => handleImageClick(item.id)}
                    style={{ cursor: 'pointer' }}
                  />
                ) : (
                  <div
                    onClick={() => handleImageClick(item.id)}
                    style={{
                      width: '100%',  // Adjust width as needed
                      height: '150px',  // Adjust height as needed
                      backgroundColor: 'rgb(50,50,50,0.5)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    {/* <p style={{ color: 'white', fontSize: '14px' }}>No Image Available</p> */}
                  </div>
                )}
          
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                  <p style={{ color: 'white', fontSize: '14px', marginRight: 'auto' }}>{item.title}</p>
          
                  {/* The three vertical dots */}
                  <div
                    onClick={() => toggleRemovesongButtonplaylist(index)}
                    style={{
                      cursor: 'pointer',
                      color: 'white',
                      fontSize: '20px',
                      marginLeft: '5px',
                      position: 'relative'
                    }}
                  >
                    ⋮
                  </div>
               
          

          {/* Conditional rendering for options */}
          {visibleplaylist === index && (
                  <div 
                  ref={menuRef}
                  style={{
                    position: 'absolute',
                    width:'100%',
                    top: '100%', // Positioning below the three dots
                    left: '50%', // Center horizontally
                    transform: 'translateX(-50%)', // Adjust for centering
                    backgroundColor: 'rgba(50, 50, 50, 0.5)', // Background color for options
                    borderRadius: '5px',
                    padding: '5px 0',
                    
                    zIndex: 1,
                  }}>
                    <button 
                      onClick={() => handleRemoveplaylist(item.id)}// Add edit functionality
                      style={{
                        color: 'white',
                        border: 'none',
                        width: '100%',
                        textAlign: 'center',
                        background: 'none', // Transparent background
                      }}
                    >
                      Remove
                    </button>
                    <hr />
                    <button 
                      onClick={() => handleEditplaylist(item.id)} // Remove functionality
                      style={{
                        color: 'white',
                        border: 'none',
                        width: '100%',
                        textAlign: 'center',
                        background: 'none', // Transparent background
                      }}
                    >
                      Edit Playlist
                    </button>
                  </div>
                )}
                {/* Create New Playlist Pop-up */}
  {editplaylistpopup  && (
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
value={editplaylist.title}
// name="title"
onChange={(e) => seteditplaylist({ ...editplaylist, title: e.target.value })} // Update state on change


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
value={editplaylist.description}
// placeholder={editplaylist.description}
// name="Description"
onChange={(e) => seteditplaylist({ ...editplaylist, description: e.target.value })} // Update state on change

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
onClick={closeeditplaylistpopup}
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
  onClick={(e) => handleEditplaylistdetail(e, editplaylist.id)} // Pass both event and id
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
        </div>
      </div>
    ))}
  </div>
    }
</div>
        );
      default:
        return null;
    }
  };

  return (
    <Layout>

    {/* <div>
    className='sss'
      style={{
        marginTop: '50px',
        marginLeft: '410px',
      }}
      </div> */}
    

      <div style={{
        marginTop:'50px',
        marginLeft:'410px',
        fontSize:'25px',

      }}>

      Library
    </div>
    <div
      className="container d-flex"
      style={{
        height: '70vh',
        alignItems: 'flex-start',
        flexWrap: 'wrap', // Allow elements to wrap on smaller screens
      }}
    >
      {/* Left sidebar */}
      <div
        className="w-25 p-3 divss"
        style={{
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        <button
          className="p-3 icon"
          style={{
            height: '110px',
            width: '75%',
            backgroundColor:
              selectedCategory === 'likedMusic' ? '#2149B1' : 'rgba(50, 50, 50, 0.5)',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: '10px',
            margin: '0 auto',
            marginBottom: '50px',
            borderRadius: '10px',
          }}
          onClick={() => setSelectedCategory('likedMusic')}
        >
          <img src={Thumbs} alt="thumbs" style={{ width: '30px' }} />
          <span className="d-none d-sm-block">Liked Music</span>{' '}
          <span className="d-none d-sm-block">
            {likedSongs && likedSongs.length > 0 ? likedSongs.length : 0} Songs
          </span>
        </button>
  
        <button
          className="p-3 icon"
          style={{
            height: '110px',
            width: '75%',
            backgroundColor:
              selectedCategory === 'watchLater' ? '#2149B1' : 'rgba(50, 50, 50, 0.5)',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: '10px',
            margin: '0 auto',
            marginBottom: '50px',
            borderRadius: '10px',
          }}
          onClick={() => setSelectedCategory('watchLater')}
        >
          <img src={video} alt="video" style={{ width: '30px' }} />
          <span className="d-none d-sm-block">Watch Later</span>
          <span className="d-none d-sm-block">
            {watchLater && watchLater.length > 0 ? watchLater.length : 0} Videos
          </span>
        </button>
  
        <button
          className="mb-4 p-3 icon"
          style={{
            height: '110px',
            width: '75%',
            
            backgroundColor:
              selectedCategory === 'playlist' ? '#2149B1' : 'rgba(50, 50, 50, 0.5)',
            color: 'white',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: '10px',
            margin: '0 auto',
            marginBottom: '50px',
            borderRadius: '10px',
          }}
          onClick={() => setSelectedCategory('playlist')}
        >
          <img src={vector} alt="playlist" style={{ width: '30px' }} />
          <span className="d-none d-sm-block">Playlist</span>
          <span className="d-none d-sm-block">
            {playlist && playlist.length > 0 ? playlist.length : 0} lists
          </span>
        </button>
      </div>
  
      {/* Right content area */}
      <div
        className="content-area w-75 p-3"
        style={{
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          maxHeight: '500px',
          overflowY: 'auto',
          flex: '1 1 75%', // Takes 75% width on larger screens
        }}
      >
        {renderContent()}
      </div>
    </div>
  
    {/* Footer with buttons for mobile */}
    <div className="library-footer">
      <button
        onClick={() => setSelectedCategory('likedMusic')}
        className={selectedCategory === 'likedMusic' ? 'active-footer-btn' : ''}
      >
        Liked Music
      </button>
      <button
        onClick={() => setSelectedCategory('watchLater')}
        className={selectedCategory === 'watchLater' ? 'active-footer-btn' : ''}
      >
        Watch Later
      </button>
      <button
        onClick={() => setSelectedCategory('playlist')}
        className={selectedCategory === 'playlist' ? 'active-footer-btn' : ''}
      >
        Playlist
      </button>
    </div>
</Layout>  
  );
};

export default LibraryScreen;

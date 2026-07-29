import React, { useState, useEffect } from 'react';
import Layout from '../Layout/Layout';
import { Link, useNavigate } from 'react-router-dom';
import API_URL from '../../Config';
import axios from 'axios';
import leftarrowIcon from '../UserIcon/left slide icon.png';
import rightarrowIcon from '../UserIcon/right slide icon.png';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const WatchPage = () => {
  const [getall, setgetall] = useState({});
  const [play, setPlay] = useState(false);
  const navigate = useNavigate();
  const jwtToken = sessionStorage.getItem('token');
  const userid = sessionStorage.getItem('userId');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [videocast, setvideocast] = useState([]);
  const [id, setId] = useState(null);
  const [categoryid, setCategoryid] = useState(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const [isInWatchLater, setIsInWatchLater] = useState(null);
  const [index, setIndex] = useState(0);
  const DISPLAY_LIMIT = 5;

  // Read stored item from localStorage
  useEffect(() => {
    const items = localStorage.getItem('items');
    if (items) {
      try {
        const parsed = JSON.parse(items);
        // ✅ FIX: Handle both {id, categoryid} object AND plain number/string
        if (parsed && typeof parsed === 'object' && parsed.id !== undefined) {
          setId(parsed.id);
          setCategoryid(parsed.categoryid);
        } else {
          // parsed is a plain number (e.g. from old banner code)
          setId(parsed);
          setCategoryid(null);
        }
      } catch {
        // Not valid JSON — treat as a plain ID string
        setId(items);
        setCategoryid(null);
      }
    }
  }, []);

  // Fetch video details
  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/v2/videoscreen`, {
          params: { videoId: id, categoryId: categoryid },
        });
        setgetall(response.data);
        console.log('videoData', response.data);
      } catch (error) {
        // ✅ FIX: Removed "throw error"
        console.error('Error fetching video data:', error);
        setError('Failed to load video details.');
      }
    };
    fetchData();
  }, [id, categoryid]);

  // Fetch user subscription access
  useEffect(() => {
    if (!userid) return;
    const fetchUser = async () => {
      try {
        const response = await fetch(`${API_URL}/api/v2/access?userId=${userid}`);
        if (!response.ok) throw new Error('Failed to fetch user');
        const data = await response.text();
        setUser(data);
      } catch (error) {
        // ✅ FIX: Removed "throw error"
        console.error('Error fetching user access:', error);
      }
    };
    fetchUser();
  }, [userid]);

  // Fetch cast & crew
  useEffect(() => {
    if (!id) return;
    const fetchvideocastandcrew = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/v2/Getvideocast`);
        if (response.data) {
          setvideocast(response.data);
          const filteredCast = response.data.filter(
            (item) => item.videoDescription.id.toString() === String(id)
          );
          console.log('videocast', filteredCast);
        }
      } catch (error) {
        // ✅ FIX: Removed "throw error"
        console.error('Error fetching cast and crew:', error);
      }
    };
    fetchvideocastandcrew();
  }, [id]);

  // Check if video is in watch later
  useEffect(() => {
    if (!id || !userid) return;
    const checkWatchLater = async () => {
      setLoading(true);
      try {
        // ✅ FIX: Corrected URL (was missing slash between API_URL and api/v2)
        const response = await axios.get(`${API_URL}/api/v2/getwatchlater/video`, {
          params: { videoId: id, userId: userid },
        });
        setIsInWatchLater(response.data === true);
      } catch (error) {
        // ✅ FIX: Removed "throw error"
        console.error('Error checking watch later:', error);
        setIsInWatchLater(null);
      } finally {
        setLoading(false);
      }
    };
    checkWatchLater();
  }, [id, userid]);

  const handleEdit = (videoId) => {
    localStorage.setItem('id', videoId);
  };

  const handlePlayClick = (videoid) => {
    handleEdit(videoid);
    setPlay(true);
    if (userid) {
      navigate('/play');
    } else {
      navigate('/UserLogin');
    }
  };

  const handleEdit1 = (videoId, catId) => {
    localStorage.setItem('items', JSON.stringify({ id: videoId, categoryid: catId }));
    window.scrollTo(0, 0);
  };

  const handleAddToWatchLater = async (videoId, userId) => {
    try {
      await axios.post(`${API_URL}/api/v2/watchlater/video`, {
        videoId,
        userId: Number(userId),
      });
      toast.success('Added to Watchlist!', {
        position: 'top-center',
        autoClose: 3000,
      });
    } catch (error) {
      // ✅ FIX: Removed "throw error" — show friendly error instead
      console.error('Error adding to watch later:', error);
      toast.error('Already added to watchlist', {
        position: 'top-center',
        autoClose: 3000,
      });
    }
  };

  // Paginated suggestion videos
  const videos = getall?.videoDescriptions || [];
  const visibleVideos = videos.slice(index, index + DISPLAY_LIMIT);

  const handleNext = () => {
    if (index + DISPLAY_LIMIT < videos.length) setIndex(index + 1);
  };

  const handlePrev = () => {
    if (index > 0) setIndex(index - 1);
  };

  return (
    <Layout>
      <ToastContainer />

      {/* Thumbnail + Play Button */}
      <div className="videothumbnail position-relative">
        {/* ✅ FIX: Show trailer inline when trailer button is clicked */}
        {showTrailer ? (
          <div style={{ position: 'relative', background: '#000', width: '100%' }}>
            <video
              src={`${API_URL}/api/v2/${id}/trailerfile`}
              controls
              autoPlay
              controlsList="nodownload"
              style={{ width: '100%', height: '100%', display: 'block', aspectRatio: '16/9' }}
            />
            <button
              onClick={() => setShowTrailer(false)}
              style={{
                position: 'absolute', top: '10px', right: '14px',
                background: 'rgba(0,0,0,0.6)', border: 'none',
                color: '#fff', fontSize: '20px', cursor: 'pointer',
                borderRadius: '50%', width: '36px', height: '36px',
              }}
            >✕</button>
          </div>
        ) : (
          <img
            src={`${API_URL}/api/v2/${id}/videothumbnail`}
            alt="Video Thumbnail"
            className="img-fluid"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        )}

        <div className="overlay-buttons">
          {getall.videoAccessType === false ? (
            <button id="button1" className="me-4" onClick={() => handlePlayClick(id)}>
              Play
            </button>
          ) : user === 'Access granted' ? (
            <button id="button1" className="me-4" onClick={() => handlePlayClick(id)}>
              Play
            </button>
          ) : (
            <Link to="/PlanDetails">
              <button id="button1" className="me-4">Subscribe</button>
            </Link>
          )}

          {/* ✅ NEW: Trailer button — plays the trailer inline without navigating away */}
          <button
            id="button1"
            className="me-4"
            style={{ backgroundColor: '#555' }}
            onClick={() => setShowTrailer((prev) => !prev)}
          >
            {showTrailer ? 'Hide Trailer' : 'Trailer'}
          </button>

          <button
            id="button2"
            className="me-4"
            onClick={() => handleAddToWatchLater(id, userid)}
          >
            Add to Watch list
          </button>
          <i className="bi bi-share-fill share-icon"></i>
        </div>
        <span className="overlay-span">Duration:&nbsp;{getall.duration}</span>
      </div>

      {/* Video Info */}
      <div className="content h-100">
        <div className="title">
          <span>{getall.videotitle}</span>
        </div>

        {/* Categories */}
        {getall.category && getall.category.length > 0 && (
          <div style={{ marginTop: '30px' }}>
            <span>{getall.category.join('/')}</span>
          </div>
        )}

        {/* Cast & Crew */}
        <div className="castandcrew">
          <span>Cast &amp; Crew</span>
          {getall.castandcrew && getall.castandcrew.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'row', gap: '15px' }}>
              {getall.castandcrew.map((cast) => (
                <div key={cast.id} style={{ textAlign: 'center' }}>
                  <img
                    src={`${API_URL}/api/v2/getcastimage/${cast.id}`}
                    alt={cast.name}
                    style={{
                      width: '100px',
                      height: '100px',
                      borderRadius: '50px',
                      marginTop: '25px',
                    }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                  <p>{cast.name}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Story */}
        <div className="story">
          <span className="storyspan">Story</span>
          <div className="description">
            <span>{getall.description}</span>
          </div>
        </div>

        {/* Suggestions */}
        <div className="suggestion">
          <span>Suggestion</span>
          <div className="videoscreenitems">
            {videos.length > 0 && (
              <div className="videoscreenitem-row">
                <button onClick={handlePrev} disabled={index === 0}>
                  <img
                    src={leftarrowIcon}
                    alt="previous"
                    style={{ width: '30px', height: '30px' }}
                  />
                </button>

                {visibleVideos.map((video) => (
                  <div key={video.id} className="item">
                    <a
                      href={userid ? `/watchpage/${video.videoTitle}` : '/UserLogin'}
                      onClick={(e) => {
                        e.preventDefault();
                        if (userid) {
                          handleEdit1(video.id, categoryid);
                          window.location.href = `/watchpage/${video.videoTitle}`;
                        } else {
                          window.location.href = '/UserLogin';
                        }
                      }}
                    >
                      <img
                        src={`${API_URL}/api/v2/${video.id}/videothumbnail`}
                        alt={video.videoTitle}
                        className="videoscreenthumbnail"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </a>
                    <p>{video.videoTitle}</p>
                  </div>
                ))}

                <button
                  onClick={handleNext}
                  disabled={index + DISPLAY_LIMIT >= videos.length}
                >
                  <img
                    src={rightarrowIcon}
                    alt="next"
                    style={{ width: '30px', height: '30px' }}
                  />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default WatchPage;
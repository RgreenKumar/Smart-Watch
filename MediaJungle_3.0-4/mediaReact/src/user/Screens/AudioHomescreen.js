import React, { useState, useEffect } from 'react';
import Layout from '../Layout/Layout';
import API_URL from '../../Config';
import axios from 'axios';
import AudioPlayer from '../../admin/AudioPlayer';
import { Link } from 'react-router-dom';

const AudioHomescreen = () => {
  const [movies, setMovies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [videoBanners, setVideoBanners] = useState([]);
  const [currentIndexBanner, setCurrentIndexBanner] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filename, setFilename] = useState(null);
  const [audiotitle, setAudiotitle] = useState(null);
  const [bannerIndex, setBannerIndex] = useState(0);
  const userid = sessionStorage.getItem('userId');
  const delay = 3000;

  const handleEdit = (id) => {
    localStorage.setItem('item', id);
  };

  const fetchAudioBanners = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/v2/getallaudiobanner`);
      setVideoBanners(response.data);
    } catch (error) {
      // ✅ FIX: Removed "throw error" — banner failure should not crash the page
      console.error('Error fetching audio banners:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/api/v2/audioContainerDetails`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        setMovies(data);
        setCategories(data);
        fetchAudioBanners();
      } catch (error) {
        // ✅ FIX: Removed "throw error"
        console.error('Error fetching audio data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [API_URL]);

  const handleCategoryAction = (categoryName, AudioTitle) => {
    setAudiotitle(AudioTitle);
    setFilename(categoryName);
  };

  // Auto-advance banner slide
  useEffect(() => {
    if (videoBanners.length === 0) return;
    const interval = setInterval(() => {
      setBannerIndex((prev) => (prev + 1) % videoBanners.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [videoBanners.length]);

  // Secondary banner index (currentIndexBanner) auto-advance
  useEffect(() => {
    if (videoBanners.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndexBanner((prev) => (prev + 1) % videoBanners.length);
    }, delay);
    return () => clearInterval(interval);
  }, [videoBanners]);

  if (loading) {
    return <div>Loading...</div>;
  }

  const audioSrc = `${API_URL}/api/v2/${filename}/file`;

  return (
    <Layout>
      {categories.length === 0 ? (
        <div className="banner-container">Audio Container is empty</div>
      ) : (
        <div>
          {/* Banner */}
          {videoBanners.length === 0 ? (
            <div>No banners available</div>
          ) : (
            <div className="banner-container">
              <div
                className="banner-items"
                style={{ transform: `translateX(-${bannerIndex * 100}%)` }}
              >
                {videoBanners.map((banner, index) => (
                  <div
                    key={index}
                    className="banner-item"
                    style={{ cursor: 'pointer' }}
                  >
                    <Link
                      to={userid ? `/MusicPage` : '/UserLogin'}
                      onClick={() => handleEdit(banner.movienameID)}
                    >
                      <img
                        src={`${API_URL}/api/v2/getimage/banner/${banner.movienameID}`}
                        alt={`Banner ${index}`}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Categories */}
          <div>
            {categories.map((category, index) =>
              category.audiolist.length > 0 ? (
                <div key={index}>
                  <h2
                    className="custom-label"
                    style={{ paddingLeft: '20px', fontSize: '30px', margin: '0px' }}
                  >
                    {category.category_name}
                  </h2>
                  <div className="row" style={{ paddingLeft: '10px', paddingRight: '10px' }}>
                    <CategorySlider
                      category={category}
                      API_URL={API_URL}
                      handleCategoryAction={handleCategoryAction}
                    />
                  </div>
                </div>
              ) : null
            )}
          </div>

          {filename === null ? (
            <div></div>
          ) : (
            <AudioPlayer audioSrc={audioSrc} audiotitle={audiotitle} />
          )}
        </div>
      )}
    </Layout>
  );
};

// CategorySlider sub-component
// ✅ FIX: Use fixed pixel card width (same approach as Movies.js .item class)
//         instead of percentage-based flex which made cards tiny (100/6 = 16.6% wide)
const CARD_WIDTH = 200;  // px — matches the .item min-width in App.css
const CARD_GAP = 15;     // px — matches .items gap in App.css

const CategorySlider = ({ category, API_URL, handleCategoryAction }) => {
  const scrollRef = React.useRef(null);

  const goNext = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft += (CARD_WIDTH + CARD_GAP) * 3;
    }
  };

  const goPrev = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft -= (CARD_WIDTH + CARD_GAP) * 3;
    }
  };

  return (
    <div style={{ position: 'relative', padding: '0 50px' }}>
      {/* Prev button */}
      <button
        onClick={goPrev}
        style={{
          position: 'absolute', left: 0, top: '50%',
          transform: 'translateY(-50%)',
          background: 'transparent', border: 'none',
          color: 'white', fontSize: '24px', cursor: 'pointer', zIndex: 2,
        }}
      >
        <i className="bi bi-arrow-left-circle"></i>
      </button>

      {/* Scrollable track */}
      <div
        ref={scrollRef}
        style={{
          display: 'flex',
          gap: `${CARD_GAP}px`,
          overflowX: 'auto',
          scrollBehavior: 'smooth',
          scrollbarWidth: 'none',      /* Firefox — hide scrollbar */
          msOverflowStyle: 'none',     /* IE/Edge */
          paddingBottom: '8px',
        }}
        // Hide scrollbar in Chrome/Safari
        className="audio-slider-track"
      >
        {category.audiolist.map((movie) => (
          <div
            key={movie.id}
            onClick={() => handleCategoryAction(movie.audio_file_name, movie.audio_title)}
            style={{
              flex: '0 0 auto',
              width: `${CARD_WIDTH}px`,   /* ✅ Fixed width — same as movie .item */
              textAlign: 'center',
              cursor: 'pointer',
            }}
          >
            <img
              src={`${API_URL}/api/v2/image/${movie.id}`}
              alt={movie.audio_title}
              style={{
                width: `${CARD_WIDTH}px`,
                height: '280px',          /* ✅ Fixed height — matches movie thumbnail */
                objectFit: 'cover',       /* ✅ Crop to fill, no distortion */
                borderRadius: '8px',
                display: 'block',
              }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <p style={{ fontSize: '14px', marginTop: '6px', color: 'white' }}>
              {movie.audio_title}
            </p>
          </div>
        ))}
      </div>

      {/* Next button */}
      <button
        onClick={goNext}
        style={{
          position: 'absolute', right: 0, top: '50%',
          transform: 'translateY(-50%)',
          background: 'transparent', border: 'none',
          color: 'white', fontSize: '24px', cursor: 'pointer', zIndex: 2,
        }}
      >
        <i className="bi bi-arrow-right-circle"></i>
      </button>
    </div>
  );
};

export default AudioHomescreen;
import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import FlexMovieItems from '../FlexMovieItems';
import { FaHeart, FaPlay } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import API_URL from '../../../Config';

const Banner = () => {
    const [all, setAll] = useState(null);
    const [vimage, setVImage] = useState([]);
    const userid = sessionStorage.getItem('userId');
    const navigate = useNavigate();

    useEffect(() => { fetchData(); }, []);
    useEffect(() => { fetchAllMovies(); }, []);

    const fetchAllMovies = async () => {
        try {
            const response = await fetch(`${API_URL}/api/v2/videogetall`);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            setAll(data);
        } catch (error) {
            // ✅ FIX 1: Removed "throw error" — network failure no longer crashes HomeScreen
            console.error('Error fetching movies:', error);
        }
    };

    const fetchData = async () => {
        try {
            const response = await fetch(`${API_URL}/api/v2/GetvideoThumbnail`);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const data = await response.json();
            if (data && Array.isArray(data)) {
                setVImage(data);
            } else {
                console.error('Invalid or empty data received:', data);
            }
        } catch (error) {
            // ✅ FIX 2: Removed "throw error" — network failure no longer crashes HomeScreen
            console.error('Error fetching thumbnails:', error);
        }
    };

    // ✅ FIX 3: Store {id, categoryid} as JSON — same format as Movies.js handleEdit().
    // Old code stored a plain number string (e.g. "42").
    // WatchPage does JSON.parse(items) then reads parsed.id — so when a plain number
    // was stored, parsed.id was undefined, id stayed null, and the videoscreen API
    // call was never made → blank WatchPage every time the banner Watch button was clicked.
    const handlePage = (movie) => {
        if (!userid) {
            navigate('/UserLogin');
            return;
        }
        const categoryid =
            movie.categorylist && movie.categorylist.length > 0
                ? movie.categorylist[0]
                : null;
        localStorage.setItem('items', JSON.stringify({ id: movie.id, categoryid }));
        window.scrollTo(0, 0);
        navigate(`/watchpage/${movie.videoTitle || movie.moviename}`);
    };

    return (
        <div className='relative w-full xl:h-96 bg-dry lg:h-64 h-48 overflow-hidden'>
            <Swiper
                direction='vertical'
                spaceBetween={50}
                slidesPerView={1}
                loop={true}
                speed={1000}
                modules={[Autoplay]}
                autoplay={{ delay: 5000, disableOnInteraction: false }}
                className='w-full xl:h-96 bg-dry lg:h-64 h-48'
            >
                {all && all.length > 0 ? (
                    all.slice(0, 8).map((movie, index) => (
                        <SwiperSlide
                            key={index}
                            className='relative rounded overflow-hidden'
                            style={{ overflow: 'hidden' }}
                        >
                            <img
                                src={`data:image/png;base64,${vimage[index]}`}
                                alt={movie.videoTitle || movie.moviename}
                                className='w-full h-200 object-cover'
                            />
                            <div className='absolute linear-bg xl:pl-52 sm:pl-32 pl-8 top-0 bottom-0 right-0 left-0 flex flex-col justify-center lg:gap- md:gap-5 gap-4'>
                                <h1 className='xl:text-4xl truncate capitalize font-sans sm:text-2xl text-xl font-bold'>
                                    {/* ✅ FIX 4: Use videoTitle (correct field name) with moviename fallback */}
                                    {movie.videoTitle || movie.moviename}
                                </h1>
                                <div className='flex gap-5 items-center text-dryGray'>
                                    <FlexMovieItems movie={movie} />
                                </div>
                                <div className='flex gap-5 items-center'>
                                    {/* ✅ FIX 5: Pass full movie object so handlePage can extract categoryid */}
                                    <button
                                        className="bg-subMain hover:text-main transitions text-white px-8 py-3 rounded font-medium sm:text-sm text-xs flex items-center gap-2"
                                        onClick={() => handlePage(movie)}
                                    >
                                        <FaPlay className='w-3 h-3' /> Watch
                                    </button>
                                    <button className='hover:text-subMain'>
                                        <FaHeart />
                                    </button>
                                </div>
                            </div>
                        </SwiperSlide>
                    ))
                ) : (
                    <div />
                )}
            </Swiper>
        </div>
    );
};

export default Banner;
import React, { useState } from 'react'
import Titles from '../Titles';
import {BsBookmarkStarFill, BsCaretLeft, BsCaretLeftFill, BsCaretRight, BsCaretRightFill} from 'react-icons/bs'
import { Swiper, SwiperSlide } from 'swiper/react';
import { Movies } from '../../Data/MovieData';
import { Navigation, Autoplay } from 'swiper/modules';
import { FaHeart } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import Rating from './Stars';

const TopRated = () => {
  const [nextEl, setNextEl] = useState(null);
  const [prevEl, setPrevEl] = useState(null);
  const classNames = "hover:bg-dry transitions text-sm rounded w-8 h-8 flex-colo bg-subMain text-white";
  return (
    <div className='my-16'>
      <Titles title='Top Rated' Icon={BsBookmarkStarFill} />
      <div className='mt-10'>
      <Swiper 
          navigation={{ nextEl, prevEl }}
          autoplay={true}
          speed={1000}
          loop={true}
          modules={[Navigation, Autoplay]}
          breakpoints={{
            0: {
              slidesPerView: 1,
              spaceBetween:10
            },
            768: {
              slidesPerView: 2,
              spaceBetween:20,
            },
            1024: {
              slidesPerView: 3,
              spaceBetween:30,
            },
            1280: {
              slidesPerView: 4,
              spaceBetween: 40,
          },
        }}
        >
          {/* <div className='w-full px-1 flex-rows gap-6 pt-12'>*/}
          <div className='w-full px-1 flex-rows gap-6 pt-12'>
          {Movies.map((movie,index)=>(
            <SwiperSlide key={index}>
              <div className='p-4 h-rate hovered border border-border bg-dry rounded-lg overflow-hidden'>
                <img 
                src={`/images/movies/${movie.titleImage}`}
                alt={movie.name}
                className='w-full h-full object-cover rounded-lg' 
                />
                <div className='px-4 hoveres gap-6 text-center absolute bg-black bg-opacity-70 top-0 left-0 right-0 bottom-0'>
                  <Link 
                  className='font-semibold text-xl trancuted line-clamp-2' 
                  to={`/movie/${movie.name}`}
                  >
                    {movie.name}
                  </Link>
                  <div className='flex gap-2 text-star'>
                    <Rating value={movie.rate} />
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
          </div>
        </Swiper>
        
        
      </div>
    </div>
  )
}

export default TopRated



import React from 'react'
import { BiHomeAlt } from 'react-icons/bi'
import { Link } from 'react-router-dom'

const NotFound = () => {
  return (
    <div className='flex-colo gap-8 w-full min-h-screen text-white bg-main lg:py-20 py-10 px-6'>
    <img className='w-full h-96 object-contain'
    src='/images/404.png'
    alt='Not Found' />
    <h1 className='lg:text-4xl font-bold'>Page Not Found</h1>
    <p className='font-medium text-border italic leading-6'>
      The page you are looking for does not exists. You may have mistyped the URL
    </p>
    <Link 
    to='/'
    className='bg-subMain transitions text-white flex-rows gap-4 font-medium py-3 hover:text-main px-6 rounded-md'>
      <BiHomeAlt />Back Home
    </Link>
    </div>
  )
}

export default NotFound
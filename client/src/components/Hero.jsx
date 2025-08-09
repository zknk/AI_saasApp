import React from 'react'
import { useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets';

function Hero() {
    // Placeholder function for button click
    const navigate=useNavigate();

  return (
    <div className='px-4 sm:px-20 xl:px-32 relative inline-flex flex-col w-full justify-center
    bg-[url(/gradientBackground.png)] bg-cover bg-no-repeat min-h-screen'>
        <div className='text-center mb-6 '>
            <h1 className='text-3xl sm:text-5xl
             md:text-6xl 2xl:text-7xlfont-semibold mx-auto *:leadnung-[1.2]'>
             Create amazing content <br/>  with <span className='text-primary'>AI tools</span> </h1>
            <p> Transform your content with our premium AI tools.
             Whether you're a student, professional, or content creator,<br/> our platform is designed to 
             help you write better and faster.</p>

        </div>
        <div className='flex flex-wrap justify-center gap-4 text-sm max-sm:text-xs'>
         <button onClick={()=>navigate('/ai')} className='bg-primary text-white px-10 py-3 rounded-lg 
         hover:scale-102 active:scale-95 transition cursor-pointer' >Start creating now</button>
         <button    className='bg-white  px-10 py-3 rounded-lg border border-gray-300 
         hover:scale-102 active:scale-95 transition cursor-pointer' 
         >watch demo</button>
        </div>
        <div className='flex items-center gap-4 mt-8 mx-auto text-gray-600'>
            <img src={assets.user_group} className='h-8'/>
            Trusted by over 1000+ users
        </div>
    </div>
  )
}

export default Hero
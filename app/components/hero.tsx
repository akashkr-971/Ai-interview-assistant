import React from 'react'
import Image from 'next/image'

const Hero = () => {
  return (
    <>
        <section className="bg-gray-400 dark:bg-gray-900 p-3 m-3 rounded-lg ">
        <div className="container mx-auto p-6 flex flex-col md:flex-row items-center justify-center">
          <div className="w-full lg:w-1/2">
            <h2 className="text-3xl font-bold leading-tight mb-2 dark:text-white">
              Create an AI Interview Helper
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Easily create an AI Interview Helper with this online tool.
            </p>
            <button onClick={()=>{
              window.location.href="/create-interview"
            }} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4">
              Create an interview
            </button>
          </div>
          <div className="hidden sm:hidden md:block">
            <Image src="/robot.png" alt="Robot" width={500} height={200} />
          </div>
        </div>
      </section>
    </>
  )
}

export default Hero
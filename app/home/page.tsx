'use client'

import React from 'react'
import { useEffect, useState } from 'react'
import Navbar from '../components/navbar'
import Footer from '../components/footer'
import Hero from '../components/hero'
import InterviewCard from '../components/interviewcard'
import Testimonial from '../components/testimonial'

const Home = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
    
    useEffect(() => {
      const userId = localStorage.getItem("userId");
      if (userId) {
        setIsLoggedIn(true);
      }
    }, []);
  return (
    <>
      <Navbar />
      <Hero />
      <section
        id="interviews"
        className="bg-gray-100 dark:bg-gray-900 px-6 py-8 m-3 rounded-xl shadow-md"
      >
        <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white text-center">
          🎤 Past Interviews
        </h2>

        {isLoggedIn ? (
          <InterviewCard />
        ) : (
          <div className="flex flex-col items-center justify-center py-10">
            <p className="text-gray-600 dark:text-gray-300 text-lg mb-4">
              Please <span className="font-semibold text-blue-600 dark:text-blue-400">log in</span> to view your interviews.
            </p>
            <a
              href="/log-in"
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-6 py-2 rounded-full transition duration-200"
            >
              Log In
            </a>
            <p className="text-sm mt-4 text-gray-500 dark:text-gray-400">
              Don’t have an account?{" "}
              <a href="/sign-up" className="text-blue-500 hover:underline">
                Sign up here
              </a>
            </p>
          </div>
        )}
      </section>
      {isLoggedIn ? (
          <section id="interviews" className="bg-gray-200 dark:bg-gray-800 p-6 m-3 rounded-lg grid gap-2">
              <h2 className="text-2xl font-bold mb-4 dark:text-white">Pick your Interviews</h2>
              <InterviewCard />
          </section>
      ): ""}
      <section
        id="interviews"
        className="bg-gray-100 dark:bg-gray-900 px-6 py-8 m-3 rounded-xl shadow-md"
      >
      <Testimonial />
      </section>
      <Footer />
    </>
  )
}

export default Home
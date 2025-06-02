'use client'

import React from 'react'
import { useEffect, useState } from 'react'
import Navbar from '../components/navbar'
import Footer from '../components/footer'
import Hero from '../components/hero'
import InterviewCard from '../components/interviewcard'
import Testimonial from '../components/testimonial'
import AttendedInterviewCard from '../components/attendedcard'

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
        id="past-interviews"
        className="bg-gray-100 dark:bg-gray-900 px-6 py-8 m-3 rounded-xl shadow-md"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white text-center flex-1">
            🎤 Past Attended Interviews
          </h2>
          <span 
            className="text-blue-600 dark:text-blue-400 text-sm font-medium cursor-pointer ml-4 whitespace-nowrap"
            onClick={() => {
              window.location.href = '/interviews?type=attended';
            }}
            >
            Show all
          </span>
        </div>

        {isLoggedIn ? (
          <AttendedInterviewCard />
        ) : (
          <div className="flex flex-col items-center justify-center py-10">
            <p className="text-gray-600 dark:text-gray-300 text-lg mb-4">
              Please <span className="font-semibold text-blue-600 dark:text-blue-400">log in</span> to view your past interviews.
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

      {isLoggedIn && (
        <section
          id="created-interviews"
          className="bg-gray-100 dark:bg-gray-900 px-6 py-8 m-3 rounded-xl shadow-md"
        >
          <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white text-center flex-1">
          📝 Your Created Interviews
          </h2>
          <span 
            className="text-blue-600 dark:text-blue-400 text-sm font-medium cursor-pointer ml-4 whitespace-nowrap"
            onClick={() => {
              window.location.href = '/interviews?type=created';
            }}
            >
            Show all
          </span>
        </div>
          <InterviewCard/>
        </section>
      )}
      <section
        id="testimonials"
        className="bg-gray-100 dark:bg-gray-900 px-6 py-8 m-3 rounded-xl shadow-md"
      >
        <Testimonial />
      </section>

      <Footer />
    </>
  )
}

export default Home
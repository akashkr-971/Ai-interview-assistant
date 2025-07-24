'use client'

// ...existing code...
import { useEffect, useState } from 'react'
import Navbar from '../components/navbar'
import Footer from '../components/footer'
import Hero from '../components/hero'
import InterviewCard from '../components/interviewcard'
import Testimonial from '../components/testimonial'
import AttendedInterviewCard from '../components/attendedcard'
import Chatbot from '../components/Chatbot'

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
const FloatingChatbot = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-8 right-8 z-[1000]">
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="group relative flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-blue-500 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-white group-hover:scale-110 transition-transform"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
          <span className="absolute -top-2 -right-2 flex items-center justify-center w-6 h-6 rounded-full bg-white text-blue-600 text-xs font-bold shadow-sm">
            AI
          </span>
        </button>
      )}

      {open && (
        <div className="relative">
          <div className="absolute bottom-0 right-0 w-full sm:w-[420px] h-[800px] max-h-[100vh] bg-gray-900 rounded-2xl shadow-2xl shadow-gray-900/30 overflow-hidden flex flex-col z-[1001] animate-fade-in-up">
            {/* Header */}
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-800 to-gray-800 border-b border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Mistral AI</h1>
                  <p className="text-xs text-gray-400">Powered by Ollama</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-full hover:bg-gray-700/50 transition-colors text-gray-400 hover:text-white"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-hidden">
              <Chatbot />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
const HomeWithChatbot = () => {
  // ...existing Home component code...
  return (
    <>
      <Home />
      <FloatingChatbot />
    </>
  );
};

export default HomeWithChatbot;
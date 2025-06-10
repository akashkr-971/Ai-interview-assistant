'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabaseClient'
import ProductModal from './product'

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [coins,setCoins]= useState(0);
  const [showModal, setShowModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const fetchUserData = async () => {
      const userId = localStorage.getItem("userId");
      if (userId) {
        setIsLoggedIn(true);
  
        const { data, error } = await supabase
          .from("users")
          .select("coins")
          .eq("id", userId)
          .single(); // since we're expecting only one row
  
        if (error) {
          console.error("Failed to fetch coins:", error);
        } else {
          setCoins(data.coins || 0);
        }
      }
    };
  
    fetchUserData();
  }, []);
  

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("userId");
    setIsLoggedIn(false);
    window.location.href = "/";
    console.log("Logged out successfully");
  }

  return (
    <>
      <div className="flex items-center justify-between m-3 p-4 bg-gray-900 text-white rounded-2xl shadow-xl">
        {/* Logo Section */}
        <Link href="/" className="flex items-center space-x-3 transition-transform duration-200 hover:scale-105">
          <Image src="/logo.webp" className="rounded-full border-2 border-blue-400" alt="PrepWise Logo" width={50} height={50} />
          <h2 className="text-xl font-extrabold text-blue-300 tracking-wide">PrepWise</h2>
        </Link>

        {/* Hamburger Icon */}
        <button
          className="md:hidden block focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        {/* Desktop Nav */}
        <ul className="hidden md:flex space-x-4 items-center">
          <li>
            <Link 
              href="/about" 
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-full text-gray-300 hover:text-white transition-all duration-200 text-lg font-medium shadow-md"
            >
              About
            </Link>
          </li>
          {isLoggedIn ? (
            <>
              <li>
                <Link
                  href="/live-interview"
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-center text-white font-semibold text-lg shadow-md hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
                >
                  Live Interviews
                </Link>
              </li>
              <li>
                <Link 
                  href="/profile" 
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-full text-white font-medium text-lg shadow-md transition-all duration-200"
                >
                  Profile
                </Link>
              </li>
              <li>
                <button onClick={() => setShowModal(true)} className="relative group">
                  <div className="bg-orange-500 rounded-full p-2 flex items-center justify-center text-white font-bold text-base min-w-[120px] shadow-lg transition-transform duration-200 group-hover:scale-105">
                    <Image src="/coin.svg" alt="Coin" width={22} height={22} className="mr-2" />
                    <span>{coins} Coins</span>
                    <span className="ml-2 text-xl">+</span>
                  </div>
                </button>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 rounded-full text-white font-semibold text-base shadow-md hover:bg-red-700 transition-colors duration-200"
                >
                  Log Out
                </button>
              </li>
            </>
          ) : (
            <li>
              <Link
                href="/log-in"
                className="px-4 py-2 bg-blue-600 rounded-full text-white font-semibold text-lg shadow-md hover:bg-blue-700 transition-colors duration-200"
              >
                Login
              </Link>
            </li>
          )}
        </ul>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden absolute top-25 right-4 w-[90%] z-50 bg-gray-800 rounded-xl p-4 shadow-lg space-y-4">
            <Link href="/about" className="block text-center bg-gray-700 rounded-full p-2 text-gray-300 hover:text-white text-lg font-medium">
              About
            </Link>
            {isLoggedIn ? (
              <>
                <Link href="/live-interview" className="block px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-white font-semibold text-center text-lg">
                  Live Interviews
                </Link>
                <Link href="/profile" className="block bg-green-600 rounded-full p-2 text-center text-gray-300 hover:text-white text-lg font-medium">
                  Profile
                </Link>
                <button onClick={() => setShowModal(true)} className="w-full bg-orange-500 rounded-full p-2 text-white font-bold flex items-center justify-center">
                  <Image src="/coin.svg" alt="Coin" width={22} height={22} className="mr-2" />
                  {coins} Coins <span className="ml-2 text-xl">+</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 bg-red-600 rounded-full text-white font-semibold shadow-md hover:bg-red-700"
                >
                  Log Out
                </button>
              </>
            ) : (
              <Link href="/log-in" className="block px-4 py-2 bg-blue-600 rounded-full text-white font-semibold text-lg text-center">
                Login
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="backdrop-blur-xl fixed inset-0 flex items-center justify-center z-50 animate-fade-in">
          <ProductModal onClose={() => setShowModal(false)} />
        </div>
      )}
    </>
  )
}

export default Navbar
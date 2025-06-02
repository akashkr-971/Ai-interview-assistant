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
      <div className="flex items-center m-3 rounded-2xl p-4 bg-gray-900 text-white justify-between shadow-xl">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-3 transition-transform duration-200 hover:scale-105">
            <Image src="/logo.webp" className="rounded-full border-2 border-blue-400" alt="PrepWise Logo" width={55} height={55} />
            <h2 className="text-xl font-extrabold text-blue-300 tracking-wide">PrepWise</h2>
          </Link>
        </div>
        <div>
          <ul className="flex space-x-6 items-center">
            <li>
              <Link
                href="/about"
                className="text-gray-300 hover:text-white transition-colors duration-200 text-lg font-medium"
              >
                About
              </Link>
            </li>
            {isLoggedIn ? (
              <li className="flex items-center space-x-5">
                <Link
                  href="/live-interview"
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-white font-semibold text-lg shadow-md hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                >
                  Live Interviews
                </Link>
                <Link
                  href="/profile"
                  className="text-gray-300 hover:text-white transition-colors duration-200 text-lg font-medium"
                >
                  Profile
                </Link>
                <button
                  onClick={() => setShowModal(true)}
                  className='relative group'
                >
                  <div className="bg-orange-500 rounded-full p-2 flex items-center justify-center text-white font-bold text-base min-w-[120px] shadow-lg transition-transform duration-200 group-hover:scale-105">
                    <Image src="/coin.svg" alt="Coin" width={22} height={22} className='mr-2' />
                    <span>{coins} Coins</span>
                    <span className='ml-2 text-xl'>+</span>
                  </div>
                </button>
                <button
                  onClick={handleLogout}
                  className='px-4 py-2 bg-red-600 rounded-full text-white font-semibold text-base shadow-md hover:bg-red-700 transition-colors duration-200'
                >
                  Log Out
                </button>
              </li>
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
        </div>
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
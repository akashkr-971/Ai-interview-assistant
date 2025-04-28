'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabaseClient'

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("userId");
    setIsLoggedIn(false);
    window.location.href = "/";
    console.log("Logged out successfully");
  }

  return (
    <div className="flex items-center m-3 rounded-lg p-4 bg-gray-800 text-white justify-between">
      <div className="flex items-center space-x-5">
        <Link href="/"><Image src="/logo.webp" className='rounded-full' alt="Logo" width={50} height={50} /></Link>
        <h1 className="text-lg font-bold justify-left">PrepWise</h1>
      </div>
      <div>
        <ul className="flex space-x-4 items-center">
            <li><Link href="/about">About</Link></li> 
            {isLoggedIn ? 
            <li className="flex items-center space-x-2"><Link href="/profile">Profile</Link>  
              <button onClick={()=>{window.location.href="https://rzp.io/rzp/NRvJyqE"}} className='w-30'>
                <div className="bg-orange-500 rounded-full p-1 flex align-center justify-center text-white font-bold text-sm w-30">
                  <Image src="/coin.svg" alt="Coin" width={20} height={20} className='mr-2'></Image>
                  <span>5 Coins</span>
                  <span className='ml-2'>+</span>
                </div>
              </button>
              <button onClick={handleLogout} className='w-30 bg-red-500 rounded-full pl-3 pr-3 p-1 flex align-center justify-center text-white text-sm hover:bg-red-600'>Log Out</button>
            </li>  : 
            <li><Link href="/log-in">Login</Link></li>
            }
        </ul>
      </div>
    </div>
  )
}

export default Navbar
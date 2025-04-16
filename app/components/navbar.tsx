'use client'
import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

const isLoggedIn = true;
const navbar = () => {
  return (
    <div className="flex items-center p-4 bg-gray-800 text-white justify-between">
      <div className="flex items-center space-x-5">
        <Link href="/"><Image src="/logo.webp" className='rounded-full' alt="Logo" width={50} height={50} /></Link>
        <h1 className="text-lg font-bold justify-left">PrepWise</h1>
      </div>
      <div>
        <ul className="flex space-x-4 items-center">
            <li><Link href="/about">About</Link></li> 
            {isLoggedIn ? 
            <li className="flex items-center space-x-2"><Link href="/profile">Profile</Link>  
              <button onClick={() => alert("Clicked")} className='w-30'>
              <div className="bg-orange-500 rounded-full p-1 flex align-center justify-center text-white font-bold text-sm w-30">
                <Image src="/coin.svg" alt="Coin" width={20} height={20} className='mr-2'></Image>
                <span>5 Coins</span>
                <span className='ml-2'>+</span>
              </div>
              </button>
              <button className='w-30 bg-red-500 rounded-full pl-3 pr-3 p-1 flex align-center justify-center text-white text-sm hover:bg-red-600'>Log Out</button>
            </li>  : 
            
            <li><Link href="/log-in">Login</Link></li>}
        </ul>
      </div>
    </div>
  )
}

export default navbar
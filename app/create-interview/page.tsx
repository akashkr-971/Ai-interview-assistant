'use client'

import React from 'react'
import { useEffect, useState } from 'react'
import Navbar from '../components/navbar'
import Image from 'next/image'
import { supabase } from '@/lib/supabaseClient'

const CreateInterview = () => {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [talking, setTalking] = useState<'ai' | 'user' | 'none'>('none')
  const [status, setStatus] = useState('Interview Not Started')

  useEffect(() => {
    const fetchImage = async () => {
      const userId = localStorage.getItem("userId") 
      if (!userId) return

      const { data } = supabase
        .storage
        .from('avatar')
        .getPublicUrl(`${userId}.png`)
        setImageUrl(data.publicUrl)
    }

    fetchImage()
  }, [])

  return (
    <>
      <div className="min-h-screen bg-gray-900 text-white align-center justify-center">
      <Navbar />
        <div className="max-w-4xl bg-gray-800 rounded-2xl p-8 shadow-lg m-10 mx-auto">
          <div className="flex justify-between items-center mb-6">
            <span className="text-blue-400 font-medium text-lg">Create your Interview by answering the questions</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            {/* AI Interviewer Card */}
            <div className={`bg-gray-700 rounded-xl p-6 flex flex-col items-center justify-center text-center h-100 ${talking === 'ai' ? 'border-4 border-white-400 ' : ''}`}>
              <Image 
                src="/logo.webp" 
                alt="AI Interviewer" 
                width={80} 
                height={80} 
                className={`rounded-full ${talking === 'ai' ? 'animate-pulse-ring ' : ''}`} />
              <h3 className="text-lg font-semibold mt-4">Assistant</h3>
            </div>

            {/* User Card */}
            <div className={`bg-gray-700 rounded-xl p-6 flex flex-col items-center justify-center text-center  h-100 ${talking === 'user' ? 'border-4 border-white-400 ' : ''}`}>
              <Image
                src={imageUrl || '/avatar.jpg'}
                alt="User"
                width={80}
                height={80}
                className={`rounded-full ${talking === 'user' ? 'animate-pulse-ring' : ''}`}
              />
              <h3 className="text-lg font-semibold mt-4">You</h3>
            </div>
          </div>

          {/* Input Prompt */}
          <div className="bg-gray-700 rounded-lg px-4 py-3 mb-6 h-20 flex items-center justify-center">
            <p className="text-lg text-gray-300 text-center">
              &quot;As a frontend developer, how would you optimize a web application for performance?&quot;
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <button
              onClick={() => alert('Reported')}
              className="bg-gray-600 text-white px-6 py-2 rounded-full hover:bg-gray-500 text-sm transition"
            >
              🛡️ Report
            </button>
            { status === "Interview Not Started" ?
              <button
                onClick={() => { setStatus("Started"); setTalking('ai'); }}
                className="bg-green-600 text-white px-6 py-2 rounded-full text-sm hover:bg-green-500 transition"
              >
                Start Interview Creation
              </button> : <button
                onClick={() => {setStatus("Interview Not Started");setTalking('none');}}
                className="bg-red-600 text-white px-6 py-2 rounded-full hover:bg-red-500 text-sm transition"
              >
                Leave Interview Creation
              </button>
            }
          </div>
        </div>
      </div>
    </>
  )
}

export default CreateInterview

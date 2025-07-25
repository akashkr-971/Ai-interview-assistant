'use client';

import { useRouter } from 'next/navigation';
import React from 'react';

const HomeAptitudeTest = () => {
  const router = useRouter();

  return (
    <div className="p-8 rounded-3xl shadow-2xl bg-gradient-to-br from-blue-50 to-blue-200 m-3 min-h-[400px] flex flex-col items-center justify-center border-2 border-blue-300">
      <h2 className="text-3xl font-extrabold mb-4 text-blue-700 drop-shadow">Aptitude Test</h2>
      <p className="text-lg text-gray-700 mb-6">Challenge yourself with 10 multiple-choice questions in just 5 minutes. Test your logical reasoning, quantitative aptitude, and problem-solving skills!</p>
    <ul className="mb-8 text-center w-full flex flex-col justify-center items-center text-gray-800">
      <li className="mb-2 flex items-center flex-col sm:flex-row">
        <span className="inline-block w-3 h-3 bg-blue-400 rounded-full mr-2 mb-2 sm:mb-0"></span>
        <span>Great for interview preparation and self-assessment</span>
      </li>
      <li className="mb-2 flex items-center flex-col sm:flex-row">
        <span className="inline-block w-3 h-3 bg-blue-400 rounded-full mr-2 mb-2 sm:mb-0"></span>
        <span>Covers logical, quantitative, and verbal topics</span>
      </li>
      <li className="mb-2 flex items-center flex-col sm:flex-row">
        <span className="inline-block w-3 h-3 bg-blue-400 rounded-full mr-2 mb-2 sm:mb-0"></span>
        <span>See your score and performance summary</span>
      </li>
      <li className="mb-2 flex items-center flex-col sm:flex-row">
        <span className="inline-block w-3 h-3 bg-blue-400 rounded-full mr-2 mb-2 sm:mb-0"></span>
        <span>Instant feedback on your answers</span>
      </li>
    </ul>
      <button
        onClick={() => router.push('/aptitude-test')}
        className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-8 rounded-xl text-lg font-semibold shadow-lg transition-all duration-200"
      >
        Start Test
      </button>
      <div className="mt-8 text-sm text-gray-500">No registration required. Your results are private.</div>
    </div>
  );
};

export default HomeAptitudeTest;

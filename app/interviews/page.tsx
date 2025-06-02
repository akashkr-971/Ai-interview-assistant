'use client';

import { useSearchParams } from 'next/navigation';
import React from 'react';

const Interview = () => {
  const searchParams = useSearchParams();
  const type = searchParams.get('type');

  return (
    <div className="p-4 text-xl font-semibold text-gray-800">
      Page Type: {type}
    </div>
  );
};

export default Interview;

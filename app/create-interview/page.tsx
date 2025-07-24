import { Suspense } from 'react';
import CreateInterviewClient from './CreateInterviewClient';

export default function Page() {
  return (
    <Suspense fallback={<div className="text-center p-10 text-gray-600">Loading interview module...</div>}>
      <CreateInterviewClient />
    </Suspense>
  );
}

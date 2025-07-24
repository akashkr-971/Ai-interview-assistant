import { Suspense } from 'react';
import Interview from './interview';

export default function InterviewsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Interview />
    </Suspense>
  );
}

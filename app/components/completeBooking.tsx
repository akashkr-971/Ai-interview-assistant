import { useState } from 'react';
import toast from 'react-hot-toast';

type CompleteBookingModalProps = {
  show: boolean;
  onClose: () => void;
  interviewId: number;
};

const CompleteBookingModal: React.FC<CompleteBookingModalProps> = ({ show, onClose, interviewId }) => {
  const [score, setScore] = useState('');
  const [feedback, setFeedback] = useState('');
  const [strengths, setStrengths] = useState('');
  const [weaknesses, setWeaknesses] = useState('');

  const handleSubmit = async () => {
    const res = await fetch('/api/interview-results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        interviewId,
        score: parseInt(score),
        feedback,
        strengths,
        weaknesses,
      }),
    });

    const result = await res.json();
    if (result.success) {
      toast.success('Interview marked as complete ✅');
      onClose();
    } else {
      toast.error('Failed to complete interview ❌');
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 shadow-xl w-[90%] max-w-md">
        <h2 className="text-xl font-bold mb-4">Complete Interview</h2>
        <input
          placeholder="Score out of 100"
          type="number"
          value={score}
          onChange={(e) => setScore(e.target.value)}
          className="w-full border px-3 py-2 rounded mb-3"
        />
        <textarea
          placeholder="Feedback"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          className="w-full border px-3 py-2 rounded mb-3"
        />
        <textarea
          placeholder="Strengths"
          value={strengths}
          onChange={(e) => setStrengths(e.target.value)}
          className="w-full border px-3 py-2 rounded mb-3"
        />
        <textarea
          placeholder="Weaknesses"
          value={weaknesses}
          onChange={(e) => setWeaknesses(e.target.value)}
          className="w-full border px-3 py-2 rounded mb-3"
        />
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-black rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompleteBookingModal;

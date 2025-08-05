'use client';
import useSWR from 'swr';
import { supabase } from '@/lib/supabaseClient';
import { mutate } from 'swr'; 

const fetchInterviewers = async () => {
  const { data, error } = await supabase
    .from('interviewers')
    .select(`
      *,
      users (
        id, name, email, created_at
      )
    `)
    .eq('is_verified', false); 

  if (error) {
    console.error('Error fetching unverified interviewers:', error);
    throw error;
  }
  console.log('Unverified interviewers fetched successfully.');
  return data;
};

const InterviewerDetail = () => {
  const { data: interviewers, error, isLoading } = useSWR('unverified-interviewers', fetchInterviewers);

  const handleVerifyInterviewer = async (interviewerId: string) => {
    mutate('unverified-interviewers', (currentInterviewers: any) => {
      if (!currentInterviewers) return [];
      return currentInterviewers.filter((interviewer: any) => interviewer.id !== interviewerId);
    }, false); 

    try {
      const { error: updateError } = await supabase
        .from('interviewers')
        .update({ is_verified: true })
        .eq('id', interviewerId);

      if (updateError) {
        throw updateError;
      }
      console.log(`Interviewer ${interviewerId} successfully verified.`);
      
      mutate('unverified-interviewers');
    } catch (apiError: any) {
      console.error('Error verifying interviewer:', apiError.message);
      alert(`Failed to verify interviewer: ${apiError.message}`);
      
      mutate('unverified-interviewers'); 
    }
  };

  if (isLoading) return <div className="p-8 text-center text-gray-600 text-lg font-medium">Loading unverified interviewers...</div>;
  if (error) return <div className="p-8 text-red-600 text-center text-lg font-medium">Failed to load interviewer data. Please try again.</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-2">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-2 bg-gray-100 border-b border-gray-200">
          <p className="text-gray-600 mt-1">Review and verify new interviewer applications.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Email</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider">Experience</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider">Specialization</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider">Rating</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider">Price</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider">Resume</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider">Availability</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(interviewers ?? []).map((entry: any) => {
                const user = entry.users; 
                return (
                  <tr key={entry.id} className="hover:bg-gray-50 transition duration-150 ease-in-out">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user?.name || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:underline cursor-pointer">{user?.email || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-700">{entry.experience_level || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-700">{(entry.specialization || []).join(', ') || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-700">{entry.rating?.toFixed(1) || '0.0'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-700">₹{entry.price_per_session || '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {entry.resume_url ? (
                        <a
                          href={entry.resume_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline text-sm font-medium"
                        >
                          View Resume
                        </a>
                      ) : (
                        <span className="text-gray-400 text-sm">No Resume</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          entry.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {entry.is_available ? 'Available' : 'Unavailable'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleVerifyInterviewer(entry.id)}
                        className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-md shadow-sm transition duration-150 ease-in-out text-sm"
                      >
                        Verify
                      </button>
                    </td>
                  </tr>
                );
              })}
              {(interviewers?.length === 0 || !interviewers) && (
                <tr>
                  <td colSpan={9} className="px-6 py-6 text-center text-gray-500 text-md">No unverified interviewers found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InterviewerDetail;
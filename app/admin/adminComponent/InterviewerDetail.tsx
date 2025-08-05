'use client';
import useSWR from 'swr';
import { supabase } from '@/lib/supabaseClient';
import { mutate } from 'swr';

const fetchVerifiedInterviewers = async () => {
  const { data, error } = await supabase
    .from('interviewers')
    .select(`
      id,
      experience_level,
      specialization,
      rating,
      price_per_session,
      is_available,
      is_verified,
      resume_url,
      users (
        id, name, email, created_at, status
      )
    `)
    .eq('is_verified', true);

  if (error) {
    console.error('Error fetching verified interviewers:', error);
    throw error;
  }
  console.log('Verified interviewers fetched successfully.');
  return data;
};

const InterviewerDetail = () => {
  const { data: interviewers, error, isLoading } = useSWR('verified-interviewers', fetchVerifiedInterviewers);
  const handleBlockUnblockInterviewer = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Active' ? 'Blocked' : 'Active';
    mutate('verified-interviewers', (currentInterviewers: any) => {
      if (!currentInterviewers) return [];
      return currentInterviewers.map((entry: any) =>
        entry.users && entry.users.id === userId
          ? { ...entry, users: { ...entry.users, status: newStatus } }
          : entry
      );
    }, false);

    try {
      const { error: updateError } = await supabase
        .from('users')
        .update({ status: newStatus })
        .eq('id', userId);

      if (updateError) {
        throw updateError;
      }
      console.log(`User ${userId} (associated with interviewer) status updated to ${newStatus}`);
      mutate('verified-interviewers');
    } catch (apiError: any) {
      console.error('Error updating interviewer user status:', apiError.message);
      alert(`Failed to update interviewer user status: ${apiError.message}`);
      mutate('verified-interviewers');
    }
  };


  if (isLoading) return <div className="p-8 text-center text-gray-600 text-lg font-medium">Loading verified interviewers...</div>;
  if (error) return <div className="p-8 text-red-600 text-center text-lg font-medium">Failed to load interviewer data. Please try again.</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-2">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-2 bg-gray-100 border-b border-gray-200"><p className="text-gray-600 mt-1">Manage verified interviewers and their availability.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Email</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider">Resume</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider">Experience</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider">Specialization</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider">Rating</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider">Price</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider">Availability</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider">User Status</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(interviewers ?? []).map((entry: any) => {
                const user = entry.users;
                return (
                  <tr key={entry.id} className="hover:bg-gray-50 transition duration-150 ease-in-out">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user?.id || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user?.name || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:underline cursor-pointer">{user?.email || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-700">
                      {entry.resume_url ? (
                        <a
                          href={entry.resume_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          View Resume
                        </a>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-700">{entry.experience_level || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-700">{(entry.specialization || []).join(', ') || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-700">{entry.rating?.toFixed(1) || '0.0'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-700">₹{entry.price_per_session || '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          entry.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                      >
                        {entry.is_available ? 'Available' : 'Unavailable'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user?.status === 'Active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {user?.status || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleBlockUnblockInterviewer(user.id, user.status)}
                        className={`font-medium py-2 px-4 rounded-md shadow-sm transition duration-150 ease-in-out text-sm
                          ${user?.status === 'Active' ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-green-500 hover:bg-green-600 text-white'}
                        `}
                      >
                        {user?.status === 'Active' ? 'Block User' : 'Unblock User'}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {(interviewers?.length === 0 || !interviewers) && (
                <tr>
                  <td colSpan={10} className="px-6 py-6 text-center text-gray-500 text-md">No verified interviewers found.</td>
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
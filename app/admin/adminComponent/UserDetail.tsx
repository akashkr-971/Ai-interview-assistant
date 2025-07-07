'use client';
import useSWR, { mutate } from 'swr';
import { supabase } from '@/lib/supabaseClient';

const fetchUsers = async () => {
  const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .eq('role', 'user');

  if (error) {
    console.error('Error fetching users:', error);
    throw error;
  }

  // Fetch interview count per user
  const usersWithInterviewCounts = await Promise.all(
    (users || []).map(async (user) => {
      const { count, error: interviewError } = await supabase
        .from('interviews')
        .select('*', { count: 'exact', head: true })
        .eq('created_by', user.id);

      if (interviewError) {
        console.error(`Error fetching interview count for user ${user.id}:`, interviewError);
      }

      return {
        ...user,
        interviewCount: count ?? 0,
      };
    })
  );

  return usersWithInterviewCounts;
};

const UserDetail = () => {
  const { data: users, error, isLoading } = useSWR('users', fetchUsers);

  const handleBlockUser = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Active' ? 'Blocked' : 'Active';

    // Optimistic UI update
    mutate(
      'users',
      (currentUsers: any) =>
        currentUsers.map((user: any) =>
          user.id === userId ? { ...user, status: newStatus } : user
        ),
      false
    );

    try {
      const { error: updateError } = await supabase
        .from('users')
        .update({ status: newStatus })
        .eq('id', userId);

      if (updateError) throw updateError;

      mutate('users'); // Revalidate after successful update
    } catch (err: any) {
      console.error('Update failed:', err.message);
      alert(`Failed to update user status: ${err.message}`);
      mutate('users'); // Revert to server state
    }
  };

  if (isLoading)
    return (
      <div className="p-8 text-center text-gray-600 text-lg font-medium">
        Loading user data...
      </div>
    );
  if (error)
    return (
      <div className="p-8 text-red-600 text-center text-lg font-medium">
        Failed to load user data. Please try again.
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-2">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-2 bg-gray-100 border-b border-gray-200">
          <p className="text-gray-600 mt-1">Manage users and view their interview stats.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider">Coins</th>
                <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider">Created Interviews</th>
                <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider">Joined On</th>
                <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(users ?? []).map((user: any) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-800">{user.name}</td>
                  <td className="px-6 py-4 text-sm text-blue-600">{user.email}</td>
                  <td className="px-6 py-4 text-center text-sm">{user.coins || 0}</td>
                  <td className="px-6 py-4 text-center text-sm">{user.interviewCount || 0}</td>
                  <td className="px-6 py-4 text-center text-sm">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        user.status === 'Active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {user.status || 'Unknown'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleBlockUser(user.id, user.status)}
                      className={`text-sm font-medium px-4 py-2 rounded shadow-sm transition ${
                        user.status === 'Active'
                          ? 'bg-red-500 hover:bg-red-600 text-white'
                          : 'bg-green-500 hover:bg-green-600 text-white'
                      }`}
                    >
                      {user.status === 'Active' ? 'Block' : 'Unblock'}
                    </button>
                  </td>
                </tr>
              ))}
              {users?.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-6 text-gray-500">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserDetail;

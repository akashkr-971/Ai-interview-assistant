'use client';
import useSWR from 'swr';
import { supabase } from '@/lib/supabaseClient';
import { mutate } from 'swr';

const fetchReports = async () => {
  const { data, error } = await supabase
    .from('complaint')
    .select(`
      id,
      source,
      resolved,
      description,
      created_at,
      users(name)
    `);

  if (error) {
    console.error('Error fetching reports:', error);
    throw error;
  }
  console.log('Reports data fetched successfully:', data);
  return data;
};

const ReportDetail = () => {
  const { data: reports, error, isLoading } = useSWR('reports', fetchReports);


  const handleResolveToggle = async (reportId: number, currentResolvedStatus: string) => {
  
    const newResolvedStatus = currentResolvedStatus === 'Yes' ? 'No' : 'Yes';

  
    mutate('reports', (currentReports: any) => {
      if (!currentReports) return [];
      return currentReports.map((report: any) =>
        report.id === reportId ? { ...report, resolved: newResolvedStatus } : report
      );
    }, false);

    try {
    
      const { error: updateError } = await supabase
        .from('complaint')
        .update({ resolved: newResolvedStatus })
        .eq('id', reportId);

      if (updateError) {
        throw updateError;
      }
      console.log(`Report ${reportId} resolved status updated to ${newResolvedStatus}`);
    
      mutate('reports');
    } catch (apiError: any) {
      console.error('Error updating report resolved status:', apiError.message);
      alert(`Failed to update report status: ${apiError.message}`);
    
      mutate('reports');
    }
  };


  if (isLoading) return <div className="p-8 text-center text-gray-600 text-lg font-medium">Loading reports...</div>;
  if (error) return <div className="p-8 text-red-600 text-center text-lg font-medium">Failed to load report data. Please try again.</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 bg-gray-100 border-b border-gray-200">
          <h2 className="text-3xl font-bold text-gray-800">User Reports</h2>
          <p className="text-gray-600 mt-1">Review and manage issues reported by users.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Report ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Reported By</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Source</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Description</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider">Reported At</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider">Status</th> 
                <th scope="col" className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reports && reports.length > 0 ? (
                reports.map((report: any) => (
                  <tr key={report.id} className="hover:bg-gray-50 transition duration-150 ease-in-out">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{report.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{report.users?.name || 'Anonymous'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{report.source || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-800 max-w-xs overflow-hidden text-ellipsis">
                      {report.description || 'No description provided.'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-700">
                      {new Date(report.created_at).toLocaleString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        report.resolved === 'Yes'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {report.resolved === 'Yes' ? 'Resolved' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleResolveToggle(report.id, report.resolved)}
                        className={`text-sm font-medium py-2 px-4 rounded-md shadow-sm transition duration-150 ease-in-out
                          ${report.resolved === 'Yes'
                            ? 'bg-red-500 hover:bg-red-600 text-white'
                            : 'bg-green-500 hover:bg-green-600 text-white'
                          }`}
                      >
                        {report.resolved === 'Yes' ? 'Mark Pending' : 'Mark Resolved'}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-6 text-center text-gray-500 text-md"> {/* Adjusted colSpan */}
                    No reports found.
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

export default ReportDetail;
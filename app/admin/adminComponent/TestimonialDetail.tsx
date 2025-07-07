'use client';
import useSWR from 'swr';
import { supabase } from '@/lib/supabaseClient';

const fetchTestimonials = async () => {
  const { data, error } = await supabase
    .from('testimonials')
    .select(`
      id,
      testimonial,
      created_at,
      rating,
      users(name) // Join with the users table to get the user's name
    `);

  if (error) {
    console.error('Error fetching testimonials:', error);
    throw error;
  }
  console.log('Testimonials data fetched successfully:', data);
  return data;
};

const TestimonialDetail = () => {
  const { data: testimonials, error, isLoading } = useSWR('testimonials', fetchTestimonials);

  if (isLoading) return <div className="p-8 text-center text-gray-600 text-lg font-medium">Loading testimonials...</div>;
  if (error) return <div className="p-8 text-red-600 text-center text-lg font-medium">Failed to load testimonial data. Please try again.</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-2">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-2 bg-gray-100 border-b border-gray-200">
          <p className="text-gray-600 mt-1">Review feedback and ratings provided by users.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">User Name</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider">Rating</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Testimonial</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider">Submitted At</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {testimonials && testimonials.length > 0 ? (
                testimonials.map((testimonial: any) => (
                  <tr key={testimonial.id} className="hover:bg-gray-50 transition duration-150 ease-in-out">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{testimonial.users?.name || 'Anonymous'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-700">
                      {testimonial.rating ? (
                        <div className="flex items-center justify-center">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.538 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.783.57-1.838-.197-1.538-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.381-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
                            </svg>
                          ))}
                          {[...Array(5 - testimonial.rating)].map((_, i) => (
                            <svg key={i + testimonial.rating} className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.538 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.783.57-1.838-.197-1.538-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.381-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      ) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800 max-w-xs overflow-hidden text-ellipsis">
                      {testimonial.testimonial || 'No testimonial provided.'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-700">
                      {new Date(testimonial.created_at).toLocaleString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-6 text-center text-gray-500 text-md">
                    No testimonials found.
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

export default TestimonialDetail;
'use client';
import useSWR from 'swr';
import { supabase } from '@/lib/supabaseClient';

const fetchPayments = async () => {
  const { data, error } = await supabase
    .from('payments')
    .select(`
      payment_id,
      quantity,
      amount,
      payment_method,
      status,
      razorpay_payment_id,
      created_at,
      users(name)
    `);

  if (error) {
    console.error('Error fetching payments:', error);
    throw error;
  }
  console.log('Payments data fetched successfully:', data);
  return data;
};

const PaymentDetail = () => {
  const { data: payments, error, isLoading } = useSWR('payments', fetchPayments);

  if (isLoading) return <div className="p-8 text-center text-gray-600 text-lg font-medium">Loading payment data...</div>;
  if (error) return <div className="p-8 text-red-600 text-center text-lg font-medium">Failed to load payment data. Please try again.</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-2">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-2 bg-gray-100 border-b border-gray-200">
          <p className="text-gray-600 mt-1">Overview of all successful transactions on the platform.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">RazorPay Payment ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">User Name</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider">Quantity</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider">Payment Method</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider">Amount</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider">Purchased At</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payments && payments.length > 0 ? (
                payments.map((payment: any, index: number) => (
                  <tr key={payment.payment_id || `payment-${index}`} className="hover:bg-gray-50 transition duration-150 ease-in-out">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{payment.razorpay_payment_id || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{payment.users?.name || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-700">{payment.quantity || 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        payment.status === 'completed' || payment.status === 'success' 
                          ? 'bg-green-100 text-green-800' 
                          : payment.status === 'pending' 
                          ? 'bg-yellow-100 text-yellow-800'
                          : payment.status === 'failed'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {payment.status || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-700 capitalize">{payment.payment_method || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-700 font-semibold">
                      ₹{payment.amount?.toLocaleString('en-IN') || '0.00'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-700">
                      {payment.created_at ? new Date(payment.created_at).toLocaleString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      }) : 'N/A'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-6 text-center text-gray-500 text-md">
                    No payments found.
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

export default PaymentDetail;
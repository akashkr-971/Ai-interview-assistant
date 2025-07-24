"use client";

import React, { useEffect, useState } from "react";
import { supabase } from '@/lib/supabaseClient';
import Button from '../../components/button';

const PaymentRequest = () => {
  const [paymentRequests, setPaymentRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      const { data, error } = await supabase
        .from('payment_request')
        .select('*')
        .order('requested_at', { ascending: false });
      if (!error && data) {
        setPaymentRequests(data);
      }
      setLoading(false);
    };
    fetchRequests();
  }, []);

  const handleAccept = async (id: number) => {
    const { error } = await supabase
      .from('payment_request')
      .update({ status: 'Completed' })
      .eq('id', id);
    if (!error) {
      setPaymentRequests(prev => prev.map(req => req.id === id ? { ...req, status: 'Completed' } : req));
    } else {
      alert('Failed to update status: ' + error.message);
    }
  };

  if (loading) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">All Payment Requests</h1>
      {paymentRequests.length === 0 ? (
        <p className="text-gray-500">No payment requests found.</p>
      ) : (
        <div className="space-y-4">
          {paymentRequests.map(req => {
            const key = req.id !== undefined && req.id !== null
              ? String(req.id)
              : `${req.interviewer_id}-${req.requested_at}`;
            return (
              <div key={key} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between">
                <div>
                  <p className="font-semibold">Interviewer: {req.interviewer_id}</p>
                  <p>Amount: ₹{req.amount}</p>
                  <p>UPI ID: {req.upi_id}</p>
                  <p>Status: <span className={req.status === 'Requested' ? 'text-yellow-700' : req.status === 'Completed' ? 'text-green-600' : 'text-red-600'}>{req.status}</span></p>
                  <p className="text-xs text-gray-500">Requested At: {new Date(req.requested_at).toLocaleString()}</p>
                </div>
                {req.status !== 'Completed' && (
                  <Button text="Accept" onClick={() => handleAccept(req.id)} />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PaymentRequest;

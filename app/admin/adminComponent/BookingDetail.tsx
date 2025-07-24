"use client";

import React, { useEffect, useState } from "react";
import { supabase } from '@/lib/supabaseClient';

const BookingDetail = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, users(name, email), interviewers(users(name))')
        .order('date', { ascending: false });
      if (!error && data) {
        setBookings(data);
      }
      setLoading(false);
    };
    fetchBookings();
  }, []);

  if (loading) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">All Bookings</h1>
      {bookings.length === 0 ? (
        <p className="text-gray-500">No bookings found.</p>
      ) : (
        <div className="space-y-4">
          {bookings.map(booking => (
            <div key={String(booking.id)} className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <p className="font-semibold">User: {booking.users?.name ?? booking.user_id} ({booking.users?.email ?? '-'})</p>
                <p>Interviewer: {booking.interviewers?.users?.name ?? booking.interviewer_id}</p>
                <p>Date: {booking.date}</p>
                <p>Time: {booking.time}</p>
                <p>Status: <span className={
                  booking.status === 'Accepted' ? 'text-green-600' :
                  booking.status === 'Cancelled' ? 'text-red-600' :
                  booking.status === 'Completed' ? 'text-gray-600' : 'text-yellow-600'
                }>{booking.status}</span></p>
                <p className="text-xs text-gray-500">Created At: {new Date(booking.created_at).toLocaleString()}</p>
                {booking.updated_at && (
                  <p className="text-xs text-gray-500">Updated At: {new Date(booking.updated_at).toLocaleString()}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookingDetail;
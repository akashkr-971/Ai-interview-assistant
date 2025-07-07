'use client';
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Users, MessageSquare , Briefcase, Wallet, CalendarCheck2, CalendarClock, MessageCircle, FileText } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, color }: any) => (
  <div className="flex items-center gap-4 p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 ease-in-out border border-gray-100">
    <div className={`p-4 rounded-full ${color} bg-opacity-20 flex-shrink-0`}>
      <Icon className={`w-7 h-7 ${color}`} />
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
      <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    interviews:0,
    interviewers: 0,
    totalPayments: 0,
    pendingBookings: 0,
    completedBookings: 0,
    testimonials: 0,
    reports: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const [usersRes, interviewRes, interviewersRes, paymentsRes, bookingsPendingRes, bookingsDoneRes, testimonialsRes, reportsRes] =
        await Promise.all([
          supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'user'),
          supabase.from('interviews').select('*', { count: 'exact', head: true }),
          supabase.from('interviewers').select('*', { count: 'exact', head: true }).eq('is_verified', true),
          supabase.from('payments').select('amount'),
          supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
          supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
          supabase.from('testimonials').select('*', { count: 'exact', head: true }),
          supabase.from('complaint').select('*', { count: 'exact', head: true }),
        ]);

      const totalPayments = paymentsRes.data?.reduce((sum, payment: any) => sum + (payment.amount || 0), 0);

      setStats({
        users: usersRes.count || 0,
        interviews: interviewRes.count || 0,
        interviewers: interviewersRes.count || 0,
        totalPayments: totalPayments || 0,
        pendingBookings: bookingsPendingRes.count || 0,
        completedBookings: bookingsDoneRes.count || 0,
        testimonials: testimonialsRes.count || 0,
        reports: reportsRes.count || 0,
      });
    };

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        <p className="text-lg text-gray-600 mb-10 text-center">
          Overview of key metrics and activities across your platform.
        </p>

        <div className="grid gap-7 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <StatCard icon={Users} label="Total Users" value={stats.users} color="text-blue-600" />
          <StatCard icon={MessageSquare} label="Total Interviews" value={stats.interviews} color="text-purple-600" />
          <StatCard icon={Briefcase} label="Verified Interviewers" value={stats.interviewers} color="text-indigo-600" />
          <StatCard icon={Wallet} label="Total Payments" value={`₹${stats.totalPayments.toLocaleString('en-IN')}`} color="text-green-600" />
          <StatCard icon={CalendarClock} label="Pending Bookings" value={stats.pendingBookings} color="text-orange-500" />
          <StatCard icon={CalendarCheck2} label="Completed Bookings" value={stats.completedBookings} color="text-emerald-600" />
          <StatCard icon={MessageCircle} label="Testimonials" value={stats.testimonials} color="text-cyan-600" />
          <StatCard icon={FileText} label="Reports" value={stats.reports} color="text-red-500" />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
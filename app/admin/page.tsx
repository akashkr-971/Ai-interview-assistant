'use client';
import { useState , useEffect } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';
import {
  Menu,
  X,
  Users,
  Wallet,
  Briefcase,
  Calendar,
  FileText,
  MessageCircle,
  LogOut,
  UserPlus,
  LayoutDashboard
} from 'lucide-react';

import UserDetail from './adminComponent/UserDetail';
import InterviewerDetail from './adminComponent/InterviewerDetail';
import NewInterviewerRequest from './adminComponent/NewInterviewerRequest';
import PaymentDetail from './adminComponent/PaymentDetail';
import BookingDetail from './adminComponent/BookingDetail';
import ReportDetail from './adminComponent/ReportDetail';
import TestimonialDetail from './adminComponent/TestimonialDetail';
import Dashboard from './adminComponent/Dashboard';
import PaymentRequest from './adminComponent/PaymentRequest';




const Admin = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [drawerOpen, setDrawerOpen] = useState(false)
  const tabs = [
    { key: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { key: 'users', label: 'Users', icon: <Users className="w-4 h-4" /> },
    { key: 'interviewers', label: 'Interviewers', icon: <Briefcase className="w-4 h-4" /> },
    { key: 'new-interviewers', label: 'New Interviewers', icon: <UserPlus className="w-4 h-4" /> },
    { key: 'payments', label: 'Payments', icon: <Wallet className="w-4 h-4" /> },
    { key: 'paymentsRequest', label: 'Payments Request', icon: <Wallet className="w-4 h-4" /> },
    { key: 'bookings', label: 'Bookings', icon: <Calendar className="w-4 h-4" /> },
    { key: 'testimonials', label: 'Testimonials', icon: <MessageCircle className="w-4 h-4" /> },
    { key: 'reports', label: 'Reports', icon: <FileText className="w-4 h-4" /> },
  ];

  const handleLogout = async () => {
      console.log("Logging out...");
      await supabase.auth.signOut();
      localStorage.removeItem("userId");
      localStorage.removeItem('role');
      window.location.href = "/";
      console.log("Logged out successfully");
    }

  useEffect(() => {
    const IsLoggedIn = localStorage.getItem('userId');
    const role = localStorage.getItem('role');
    if (IsLoggedIn !== "9f3aa1e5-87b0-42f8-952b-2fb4b862bacb") {
      window.location.href = '/';
    }
    if(role !== 'admin') {
      window.location.href = '/';
    }
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'users':
        return <UserDetail />;
      case 'interviewers':
        return <InterviewerDetail/>;
      case 'new-interviewers':
        return <NewInterviewerRequest />;
      case 'bookings':
        return <BookingDetail />;
      case 'payments':
        return <PaymentDetail />;
      case 'reports':
        return <ReportDetail />;
      case 'testimonials':
        return <TestimonialDetail />;
      case 'paymentsRequest':
        return <PaymentRequest />;
      default:
        return <div>Select a tab</div>;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <nav className="bg-slate-900 text-white flex justify-between items-center px-6 py-4 shadow relative z-50">
        <div className="flex items-center gap-4">
          <Image
            src="/logo.webp"
            alt="PrepWise Logo"
            width={50}
            height={50}
            className="rounded-full border-2 border-blue-400"
          />
          <h2 className="text-xl font-extrabold text-blue-300 tracking-wide">RolePrep Admin</h2>
        </div>

        <button
          className="hidden md:block bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
          onClick={handleLogout}
        >
          Logout
        </button>

        <button className="md:hidden" onClick={() => setDrawerOpen(!drawerOpen)}>
          {drawerOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`fixed top-0 left-0 h-full w-64 bg-gray-100 border-r shadow-lg transform transition-transform duration-300 ease-in-out z-40
          ${drawerOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:h-auto`}
        >
          <div className="p-4 border-b flex items-center justify-between md:hidden">
            <h3 className="text-lg font-semibold">Navigation</h3>
            <button onClick={() => setDrawerOpen(false)}>
              <X className="w-5 h-5 text-gray-700" />
            </button>
          </div>

          <ul className="flex flex-col gap-1 p-4 text-sm">
            {tabs.map((tab) => (
              <li key={tab.key}>
                <button
                  onClick={() => {
                    setActiveTab(tab.key);
                    setDrawerOpen(false);
                  }}
                  className={`flex items-center gap-3 w-full px-4 py-2 rounded capitalize transition ${
                    activeTab === tab.key
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-blue-100 text-gray-800'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              </li>
            ))}

            <li className="md:hidden mt-4">
              <button
                className="flex items-center gap-2 w-full px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </li>
          </ul>
        </aside>

        {/* Content */}
        <main className="flex-1 p-4 bg-white overflow-y-auto">
          <h2 className="text-xl font-semibold mb-4 capitalize">{activeTab} Management</h2>
          <div className="p-4 border rounded-md bg-gray-50 shadow overflow-x-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Admin;

"use client";

import React, { useEffect, useState } from "react";
import { supabase } from '@/lib/supabaseClient';
import Modal from '../components/modal';
import InputField from '../components/InputField';
import Button from '../components/button';
import { toast } from 'react-hot-toast';
import CompleteBookingModal from "../components/completeBooking";

type InterviewReportModalProps = {
  isOpen: boolean;
  onClose: () => void;
  report: {
    score: number;
    feedback: string;
    strengths: string;
    weaknesses: string;
    created_at: string;
  } | null;
};

// WithdrawForm component
function WithdrawForm({ userId, walletAmount, onRequest }: { userId: string | null, walletAmount: number | null, onRequest?: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState("");
  const [upiId, setUpiId] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError("Enter a valid amount.");
      return;
    }
    if (!upiId || upiId.length < 5) {
      setError("Enter a valid UPI ID.");
      return;
    }
    if (!userId) {
      setError("User not found.");
      return;
    }
    if (walletAmount !== null && Number(amount) > walletAmount) {
      setError("Insufficient wallet balance.");
      return;
    }
    setLoading(true);
    const { error: dbError } = await supabase
      .from("payment_request")
      .insert([
        {
          interviewer_id: userId,
          amount: Number(amount),
          upi_id: upiId,
          status: "Requested",
          requested_at: new Date().toISOString()
        }
      ]);
    setLoading(false);
    if (dbError) {
      setError("Failed to request withdrawal: " + dbError.message);
    } else {
      setSuccess("Withdrawal request submitted!");
      setAmount("");
      setUpiId("");
      setShowForm(false);
      if (onRequest) onRequest();
    }
  };

  return (
    <div>
      <button
        className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-semibold transition mb-2"
        onClick={() => setShowForm((v) => !v)}
      >
        Withdraw Amount
      </button>
      {showForm && (
        <form className="flex flex-col gap-3 bg-yellow-50 p-4 rounded-lg shadow" onSubmit={handleSubmit}>
          <label className="font-medium text-sm">Amount to Withdraw</label>
          <input
            type="number"
            min="1"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-300"
            placeholder="Enter amount"
            required
          />
          <label className="font-medium text-sm">UPI ID</label>
          <input
            type="text"
            value={upiId}
            onChange={e => setUpiId(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-300"
            placeholder="Enter UPI ID"
            required
          />
          <button
            type="submit"
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-semibold transition"
            disabled={loading}
          >
            {loading ? "Requesting..." : "Submit Request"}
          </button>
          {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
          {success && <p className="text-green-600 text-sm mt-1">{success}</p>}
        </form>
      )}
    </div>
  );
}

const InterviewerDashboard = () => {
  // Handler for logout
  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    window.location.href = '/';
  };

  // Handler for form field changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // For new interviewer creation
  const handleSubmit = async (e: React.FormEvent) => {
    console.log("Form data:", formData);
    e.preventDefault();

    if (!userId) {
      alert("User ID not found");
      return;
    }

    // Check if resume file is selected
    if (!formData.resume) {
      alert("Please select a resume file");
      return;
    }

    const specializationArray = formData.specialization
      .split(',')
      .map(item => item.trim())
      .filter(Boolean);

    const resumeFile = formData.resume; // resume from input (File object)
    let resumeUrl = '';
    
    console.log("Starting resume upload...");
    console.log("Resume file:", resumeFile);
    
    try {
      const fileExt = resumeFile.name.split('.').pop();
      const fileName = `${userId}_${Date.now()}.${fileExt}`;
      const filePath = `resumes/${fileName}`;
      console.log("File path for upload:", filePath);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(filePath, resumeFile, {
          cacheControl: '3600',
          upsert: true,
          contentType: resumeFile.type
        });

      if (uploadError) {
        console.error("Resume upload error:", uploadError);
        alert('Resume upload failed: ' + uploadError.message);
        return;
      }

      console.log("Resume uploaded successfully:", uploadData);

      const { data: publicURLData } = supabase
        .storage
        .from('resumes')
        .getPublicUrl(filePath);

      resumeUrl = publicURLData?.publicUrl || '';
      console.log("Public URL of uploaded resume:", resumeUrl);

      // === Step 3: Insert Interviewer Data ===
      const { error } = await supabase.from('interviewers').insert([
        {
          user_id: userId,
          bio: formData.bio,
          experience_level: formData.experience_level,
          specialization: specializationArray,
          preferred_language: formData.preferred_language,
          price_per_session: formData.price_per_session,
          rating: 0,
          interview_count: 0,
          is_available: true,
          is_verified: false,
          resume_url: resumeUrl 
        }
      ]);

      if (!error) {
        console.log("Interviewer data saved successfully");
        setShowModal(false);
        setInterviewerData({
          ...formData,
          specialization: specializationArray,
          rating: 0,
          interview_count: 0,
          is_available: true,
          is_verified: false,
          resume_url: resumeUrl
        });
        // Reset form
        setFormData({
          bio: '',
          experience_level: '',
          specialization: '',
          preferred_language: '',
          price_per_session: '',
          resume: null
        });
      } else {
        console.error("Database error:", error);
        alert("Failed to save interviewer info: " + error.message);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      alert("An unexpected error occurred during resume upload");
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Updating interviewer profile with data:", formData);

    const specializationArray = formData.specialization
      .split(',')
      .map(item => item.trim())
      .filter(Boolean);

    let resumeUrl = interviewerData?.resume_url; // fallback to existing if not updated

    // If resume file is selected, upload it to Supabase storage
    if (formData.resume) {
      console.log("Uploading new resume file...");
      
      try {
        const fileExt = formData.resume.name.split('.').pop();
        const fileName = `${userId}_resume_${Date.now()}.${fileExt}`;
        const filePath = `resumes/${fileName}`;
        console.log("File path for upload:", filePath);

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('resumes') 
          .upload(filePath, formData.resume, {
            cacheControl: '3600',
            upsert: true,
            contentType: formData.resume.type
          });

        if (uploadError) {
          console.error("Resume upload error:", uploadError);
          alert("Resume upload failed: " + uploadError.message);
          return;
        }
        
        console.log("Resume uploaded successfully:", uploadData);

        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from('resumes')
          .getPublicUrl(filePath);
        resumeUrl = publicUrlData.publicUrl;
        console.log("Public URL of uploaded resume:", resumeUrl);
      } catch (error) {
        console.error("Unexpected error during resume upload:", error);
        alert("An unexpected error occurred during resume upload");
        return;
      }
    }

    try {
      const { error } = await supabase
        .from('interviewers')
        .update({
          bio: formData.bio,
          experience_level: formData.experience_level,
          specialization: specializationArray,
          preferred_language: formData.preferred_language,
          price_per_session: formData.price_per_session,
          resume_url: resumeUrl
        })
        .eq('user_id', userId);

      if (!error) {
        console.log("Profile updated successfully");
        setShowEditModal(false);
        setInterviewerData({
          ...interviewerData,
          ...formData,
          specialization: specializationArray,
          resume_url: resumeUrl
        });
        alert("Profile updated successfully!");
      } else {
        console.error("Database update error:", error);
        alert("Failed to update profile: " + error.message);
      }
    } catch (error) {
      console.error("Unexpected error during profile update:", error);
      alert("An unexpected error occurred during profile update");
    }
  };

  // Handler to accept a booking
  const handleAcceptBooking = async (bookingId: number) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'Accepted' })
      .eq('id', bookingId);
    if (!error) {
      setBookings(bookings.map(b => b.id === bookingId ? { ...b, status: 'Accepted' } : b));
    } else {
      alert('Failed to accept booking: ' + error.message);
    }
  };

  // Handler to cancel a booking
  const handleCancelBooking = async (bookingId: number) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'Cancelled' })
      .eq('id', bookingId);
    if (!error) {
      setBookings(bookings.map(b => b.id === bookingId ? { ...b, status: 'Cancelled' } : b));
    } else {
      alert('Failed to cancel booking: ' + error.message);
    }
  };

  const [interviewerData, setInterviewerData] = useState<any>(null);
  const [walletAmount, setWalletAmount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false); // For new interviewer creation
  const [showEditModal, setShowEditModal] = useState(false); // For editing interviewer profile
  const [showBookingHistory, setShowBookingHistory] = useState(false);
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);
  const [currentMail, setCurrentMail] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [showMailModal, setShowMailModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<InterviewReportModalProps['report']>(null);
  const [currentBookingId, setCurrentBookingId] = useState<number>(1);
  
  const [formData, setFormData] = useState({
    bio: '',
    experience_level: '',
    specialization: '',
    preferred_language: '',
    price_per_session: '',
    resume: null as File | null
  });
  const [bookings, setBookings] = useState<any[]>([]);
  const [paymentRequests, setPaymentRequests] = useState<any[]>([]);

  // Add userId and role state at the top level of the component
  const [userId, setUserId] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  // Initialize userId and role from localStorage on mount
  useEffect(() => {
    setUserId(localStorage.getItem('userId'));
    setRole(localStorage.getItem('role'));
  }, []);

  useEffect(() => {
    async function fetchInterviewer() {
      if (role !== 'interviewer') {
        window.location.href = `/${role}`;
        return;
      }
      if (!userId) return;
      const { data } = await supabase
        .from('interviewers')
        .select('*')
        .eq('user_id', userId)
        .single();
      if (data) {
        setInterviewerData(data);
        setWalletAmount(data.wallet ?? 0);
        if (showEditModal) {
          setFormData({
            bio: data.bio ?? '',
            experience_level: data.experience_level ?? '',
            specialization: Array.isArray(data.specialization) ? data.specialization.join(', ') : (data.specialization ?? ''),
            preferred_language: data.preferred_language ?? '',
            price_per_session: data.price_per_session ?? '',
            resume: null 
          });
        }
      } else {
        setShowModal(true);
      }
      setLoading(false);
    }

    async function fetchBookings() {
      if (!userId) return;
      const { data, error } = await supabase
        .from('bookings')
        .select('*, users(name, email)')
        .eq('interviewer_id', userId)
        .order('date', { ascending: true });
      if (!error && data) {
        setBookings(data);
      }
    }

    async function fetchPaymentRequests() {
      if (!userId) return;
      const { data, error } = await supabase
        .from('payment_request')
        .select('*')
        .eq('interviewer_id', userId)
        .order('requested_at', { ascending: false });
      if (!error && data) {
        setPaymentRequests(data);
      }
    }

    if (userId && role) {
      fetchInterviewer();
      fetchBookings();
      fetchPaymentRequests();
    }
  }, [userId, role, showModal, showEditModal]);

  const sendmail = (mailid:string) => {
    setCurrentMail(mailid);
    setShowMailModal(true); // open modal
  };

  const completeinterview = (bookingId: number) => {
    console.log("Complete interview for booking ID:", bookingId);
    setCurrentBookingId(bookingId);
    setShowCompleteModal(true);
  };

  const viewReport = async (bookingId: number) => {
    const report = await fetch(`/api/interview-report?bookingId=${bookingId}`);
    const data = await report.json();
    setSelectedReport(data);
    setIsReportOpen(true);
    setShowBookingHistory(false);
  };

  if (loading) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="w-full bg-white shadow-sm px-6 py-3 flex justify-between items-center">
        <div className="text-xl font-bold text-blue-700">Interviewer Dashboard</div>
        <div className="flex gap-4 items-center">
          <Button text="Logout" onClick={handleLogout} />
        </div>
      </nav>
      <div className="p-6">
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm" >
            {/* Modal for new interviewer creation */}
            <Modal title="Complete Your Interviewer Profile" onClose={() => setShowModal(false)}>
              <form onSubmit={handleSubmit} className="space-y-4">
                <InputField
                  label="Bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Tell us about yourself"
                  type="text"
                />
                <InputField
                  label="Experience Level (Years)"
                  name="experience_level"
                  value={formData.experience_level}
                  onChange={handleInputChange}
                  placeholder="e.g. 5"
                  type="number"
                />
                <InputField
                  label="Specialization"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleInputChange}
                  placeholder="e.g. DSA, System Design"
                  type="text"
                />
                <InputField
                  label="Preferred Language"
                  name="preferred_language"
                  value={formData.preferred_language}
                  onChange={handleInputChange}
                  placeholder="e.g. English"
                  type="text"
                />
                <InputField
                  label="Price per Session"
                  name="price_per_session"
                  value={formData.price_per_session}
                  onChange={handleInputChange}
                  placeholder="e.g. 500"
                  type="number"
                />
                <div className="flex flex-col space-y-2">
                  <label htmlFor="resume" className="text-sm font-medium text-gray-700">
                    Upload Resume (PDF) *
                  </label>

                  <input
                    id="resume"
                    name="resume"
                    type="file"
                    accept=".pdf"
                    required
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      console.log("Resume file selected:", file);
                      setFormData(prev => ({ ...prev, resume: file }));
                    }}
                    className="sr-only"
                  />

                  <label
                    htmlFor="resume"
                    className="cursor-pointer bg-gray-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-600 transition-colors"
                  >
                    Choose File
                  </label>

                  {formData.resume && (
                    <span className="text-xs text-green-600">Selected: {formData.resume.name}</span>
                  )}
                </div>

                <Button text="Save Details" onClick={() => {}} />
              </form>
            </Modal>
          </div>
        )}

        {showEditModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm" >
            {/* Modal for editing interviewer profile */}
            <Modal title="Edit Your Interviewer Profile" onClose={() => setShowEditModal(false)}>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <InputField
                  label="Bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Tell us about yourself"
                  type="text"
                />
                <InputField
                  label="Experience Level (Years)"
                  name="experience_level"
                  value={formData.experience_level}
                  onChange={handleInputChange}
                  placeholder="e.g. 5"
                  type="number"
                />
                <InputField
                  label="Specialization"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleInputChange}
                  placeholder="e.g. DSA, System Design"
                  type="text"
                />
                <InputField
                  label="Preferred Language"
                  name="preferred_language"
                  value={formData.preferred_language}
                  onChange={handleInputChange}
                  placeholder="e.g. English"
                  type="text"
                />
                <InputField
                  label="Price per Session"
                  name="price_per_session"
                  value={formData.price_per_session}
                  onChange={handleInputChange}
                  placeholder="e.g. 500"
                  type="number"
                />
                <div className="flex flex-col space-y-2">
                  <label htmlFor="editResume" className="text-sm font-medium text-gray-700">
                    Upload Resume (PDF) - Optional
                  </label>

                  <input
                    id="editResume"
                    name="resume"
                    type="file"
                    accept=".pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      console.log("Edit resume file selected:", file);
                      setFormData(prev => ({ ...prev, resume: file }));
                    }}
                    className="sr-only"
                  />

                  <label
                    htmlFor="editResume"
                    className="cursor-pointer bg-gray-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-600 transition-colors"
                  >
                    Choose File
                  </label>

                  {formData.resume && (
                    <span className="text-xs text-green-600">Selected: {formData.resume.name}</span>
                  )}
                  {interviewerData?.resume_url && !formData.resume && (
                    <span className="text-xs text-blue-600">Current resume uploaded</span>
                  )}
                </div>
                <Button text="Update Details" onClick={() => {}} />
              </form>
            </Modal>
          </div>
        )}

        {showMailModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xl">
            <div className="bg-white p-6 rounded-lg w-[90%] max-w-md shadow-lg border border-gray-300">
              <h2 className="text-xl font-semibold mb-4">Enter Meeting Link</h2>
              <input
                type="text"
                placeholder="https://meet.link/xyz"
                className="w-full p-2 border border-gray-300 font-semibold rounded mb-4"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowMailModal(false);
                    setMeetingLink('');
                  }}
                  className="px-4 py-2 bg-gray-300 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    const res = await fetch('/api/interviewMail', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        email: currentMail,
                        link: meetingLink,
                      }),
                    });

                    const result = await res.json();

                    if (result.success) {
                      toast.success('Mail sent successfully ✉️');
                      setShowMailModal(false);
                      setMeetingLink('');
                    } else {
                      toast.error('Failed to send mail ❌');
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}

        {showCompleteModal  && (
          <CompleteBookingModal
            show={showCompleteModal}
            onClose={() => setShowCompleteModal(false)}
            interviewId={currentBookingId}
          />
        )}

        {isReportOpen && (
          <Modal
            title="Interview Report"
            onClose={() => {
              setIsReportOpen(false);
              setSelectedReport(null);
              setShowBookingHistory(true);
            }}
          >
            {selectedReport ? (
              <div className="space-y-4">
                <p><strong>Score:</strong> {selectedReport.score}</p>
                <p><strong>Feedback:</strong> {selectedReport.feedback}</p>
                <p><strong>Strengths:</strong> {selectedReport.strengths}</p>
                <p><strong>Weaknesses:</strong> {selectedReport.weaknesses}</p>
                <p><strong>Date:</strong> {new Date(selectedReport.created_at).toLocaleDateString()}</p>
              </div>
            ) : (
              <p>No report available for this booking.</p>
            )}
          </Modal>
        )}

        {!showModal && interviewerData && (
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-800">Welcome, Interviewer 👋</h1>
              <p className="text-gray-600 mt-1">{interviewerData.bio}</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-sm text-gray-500">Experience</p>
                <p className="text-xl font-semibold">{interviewerData.experience_level} yrs</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-sm text-gray-500">Specializations</p>
                <p className="text-md">{Array.isArray(interviewerData.specialization) ? interviewerData.specialization.join(', ') : interviewerData.specialization}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-sm text-gray-500">Rating</p>
                <p className="text-xl font-semibold">{interviewerData.rating}/5 ⭐</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-sm text-gray-500">Sessions Taken</p>
                <p className="text-xl font-semibold">{interviewerData.interview_count}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-sm text-gray-500">Preferred Language</p>
                <p className="text-md">{interviewerData.preferred_language}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-sm text-gray-500">Price per Session</p>
                <p className="text-md">₹{interviewerData.price_per_session}</p>
              </div>
              {/* Wallet display */}
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-sm text-gray-500">Wallet Amount</p>
                <p className="text-xl font-semibold text-yellow-700">₹{walletAmount ?? 0}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-sm text-gray-500">Resume</p>
                {interviewerData.resume_url ? (
                  <a
                    href={interviewerData.resume_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xl text-yellow-700 underline hover:text-yellow-800"
                  >
                    View Resume
                  </a>
                ) : (
                  <p className="text-sm text-gray-400">No resume uploaded</p>
                )}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
              <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
              <div className="flex gap-4 mb-4">
                <Button text="Booking History" onClick={() => setShowBookingHistory(true)} />
                <Button text="Payment History" onClick={() => setShowPaymentHistory(true)} />
                <Button text="Edit Profile" onClick={() => setShowEditModal(true)} />
              </div>
              <div className="flex gap-4 mt-4">
                <WithdrawForm userId={userId} walletAmount={walletAmount} onRequest={() => {
                  // Refresh payment requests after new request
                  if (typeof window !== 'undefined') {
                    setTimeout(() => {
                      window.location.reload();
                    }, 1000);
                  }
                }} />
              </div>
              {/* Show only active payment requests in dashboard */}
              <div className="mt-8">
                <h3 className="text-lg font-bold mb-2 text-yellow-700">Active Payment Requests</h3>
                {paymentRequests.filter(req => req.status !== 'Completed').length === 0 ? (
                  <p className="text-gray-500">No active payment requests.</p>
                ) : (
                  <div className="space-y-3">
                    {paymentRequests.filter(req => req.status !== 'Completed').map((req) => (
                      <div key={req.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between">
                        <div>
                          <p className="font-semibold">Amount: ₹{req.amount}</p>
                          <p className="text-sm">UPI ID: {req.upi_id}</p>
                          <p className="text-sm">Status: <span className={req.status === 'Requested' ? 'text-yellow-700' : req.status === 'Completed' ? 'text-green-600' : 'text-red-600'}>{req.status}</span></p>
                          <p className="text-xs text-gray-500">Requested At: {new Date(req.requested_at).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Show only active bookings in dashboard */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
              <h2 className="text-xl font-bold mb-4">Active Bookings</h2>
              {bookings.filter(b => b.status !== 'Completed' && b.status !== 'Cancelled').length === 0 ? (
                <p className="text-gray-500">No active bookings.</p>
              ) : (
                <div className="space-y-4">
                  {bookings.filter(b => b.status !== 'Completed' && b.status !== 'Cancelled').map((booking) => (
                    <div key={booking.id} className="border p-4 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-2">
                      <div>
                        <p className="font-semibold">User: {booking.users?.name ?? '-'} ({booking.users?.email ?? '-'})</p>
                        <p>Interviewee Name: {booking.name}</p>
                        <p>Date: {booking.date}</p>
                        <p>Time: {booking.time}</p>
                        <p>Price: {booking.price - 50}</p>
                        <p>Status: <span className={booking.status === 'Accepted' ? 'text-green-600' : booking.status === 'Cancelled' ? 'text-red-600' : 'text-yellow-600'}>{booking.status}</span></p>
                        {booking.status !== 'Scheduled' && (
                          <p className="text-xs text-gray-500">Last updated: {new Date(booking.updated_at ?? booking.created_at).toLocaleString()}</p>
                        )}
                      </div>
                      <div className="flex gap-2 mt-2 md:mt-0">
                        {booking.status === 'Scheduled' ? (
                          <>
                            <Button text="Accept" onClick={() => handleAcceptBooking(booking.id)} />
                            <Button text="Cancel" onClick={() => handleCancelBooking(booking.id)} />
                          </>
                        ) : booking.status === 'Accepted' ? (
                          <>
                            <Button text="Start Interview" onClick={() => sendmail(booking.users?.email)} />
                            <button
                              onClick={() => completeinterview(booking.id)}
                              className="px-4 py-2 bg-green-600 text-white rounded"
                            >
                              Complete Booking
                            </button>
                          </>
                        ) : null}

                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Booking History Modal */}
            {showBookingHistory && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                <Modal title="Booking History" onClose={() => setShowBookingHistory(false)}>
                  {bookings.filter(b => b.interviewer_id === userId).length === 0 ? (
                    <p className="text-gray-500">No bookings yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {bookings.filter(b => b.interviewer_id === userId).map((booking) => (
                        <div key={booking.id} className="border p-4 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-2 bg-white bg-opacity-80">
                          <div>
                            <p className="font-semibold">User: {booking.users?.name ?? '-'} ({booking.users?.email ?? '-'})</p>
                            <p>Date: {booking.date}</p>
                            <p>Time: {booking.time}</p>
                            <p>Status: <span className={booking.status === 'Accepted' ? 'text-green-600' : booking.status === 'Cancelled' ? 'text-red-600' : 'text-yellow-600'}>{booking.status}</span></p>
                            {booking.status !== 'Scheduled' && (
                              <p className="text-xs text-gray-500">Last updated: {new Date(booking.updated_at ?? booking.created_at).toLocaleString()}</p>
                            )}
                            <p>Price: {booking.price - 50}</p>
                            
                            {booking.status === 'Completed' && (
                                <button
                                  onClick={() => viewReport(booking.id)} 
                                  className="bg-blue-500 text-white p-2 rounded mt-2 hover:bg-blue-600 transition">
                                  View Report
                                </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Modal>
              </div>
            )}

            {/* Payment History Modal */}
            {showPaymentHistory && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-transparent backdrop-blur-sm">
                <Modal title="Payment Request History" onClose={() => setShowPaymentHistory(false)}>
                  {paymentRequests.filter(r => r.interviewer_id === userId).length === 0 ? (
                    <p className="text-gray-500">No payment requests yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {paymentRequests.filter(r => r.interviewer_id === userId).map((req) => (
                        <div key={req.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between bg-opacity-80">
                          <div>
                            <p className="font-semibold">Amount: ₹{req.amount}</p>
                            <p className="text-sm">UPI ID: {req.upi_id}</p>
                            <p className="text-sm">Status: <span className={req.status === 'Requested' ? 'text-yellow-700' : req.status === 'Completed' ? 'text-green-600' : 'text-red-600'}>{req.status}</span></p>
                            <p className="text-xs text-gray-500">Requested At: {new Date(req.requested_at).toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Modal>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewerDashboard;
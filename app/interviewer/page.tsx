'use client'

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Modal from '../components/modal';
import InputField from '../components/InputField';
import Button from '../components/button';

const InterviewerDashboard = () => {
  const [interviewerData, setInterviewerData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    bio: '',
    experience_level: '',
    specialization: '',
    preferred_language: '',
    price_per_session: ''
  });

  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;

  useEffect(() => {
    const fetchInterviewer = async () => {
      if (!userId) return;
      const { data } = await supabase
        .from('interviewers')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (data) {
        setInterviewerData(data);
        setShowModal(false);
      } else {
        setShowModal(true);
      }

      setLoading(false);
    };

    fetchInterviewer();
  }, [userId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const specializationArray = formData.specialization
      .split(',')
      .map(item => item.trim())
      .filter(Boolean); // remove empty values

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
        is_verified: false
      }
    ]);

    if (!error) {
      setShowModal(false);
      setInterviewerData({
        ...formData,
        specialization: specializationArray,
        rating: 0,
        interview_count: 0,
        is_available: true,
        is_verified: false
      });
    } else {
      alert("Failed to save interviewer info: " + error.message);
    }
  };

  if (loading) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      {showModal && (
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
            <Button text="Save Details" onClick={() => {}} />
          </form>
        </Modal>
      )}

      {!showModal && (
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
              <p className="text-md">{interviewerData.specialization.join(', ')}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <p className="text-sm text-gray-500">Rating</p>
              <p className="text-xl font-semibold">{interviewerData.rating}/5 ⭐</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <p className="text-sm text-gray-500">Sessions Taken</p>
              <p className="text-xl font-semibold">{interviewerData.interview_count}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              <Button text="Start New Interview" onClick={() => alert("Coming Soon")} />
              <Button text="View Bookings" onClick={() => alert("Coming Soon")} />
              <Button text="Edit Profile" onClick={() => setShowModal(true)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewerDashboard;

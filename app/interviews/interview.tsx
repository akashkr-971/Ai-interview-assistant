'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import React from 'react';
import { supabase } from '@/lib/supabaseClient';
import Image from 'next/image';
import Navbar from '../components/navbar';
import Footer from '../components/footer';

interface Interview {
  id: number;
  coverImage: string;
  type: string;
  role: string;
  level: string;
  techstack: string[];
  amount: number;
  questions: string[];
  attendees: string[] | null;
  created_at: string;
  created_by: string;
}

interface Feedback {
  id: number;
  feedback?: any; // Added the missing feedback property
  overallScore: number;
  interview_id: number;
  updated_at: string;
}

const Interview = () => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const searchParams = useSearchParams();
  const type = searchParams.get('type');

  // Single useEffect to handle all data fetching based on type
  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    console.log("Stored User ID:", storedUserId);
    setUserId(storedUserId);

    if (!storedUserId) {
      setError("User not logged in.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        if (type === "attended") {
          // Fetch attended interviews and feedback
          const interviewQuery = supabase
            .from("interviews")
            .select("*")
            .contains("attendees", [storedUserId])
            .order("created_at", { ascending: false });

          const feedbackQuery = supabase
            .from("feedback")
            .select("id, feedback, interview_id, updated_at");

          const [{ data: interviewData, error: interviewError }, { data: feedbackData, error: feedbackError }] =
            await Promise.all([interviewQuery, feedbackQuery]);

          if (interviewError) {
            setError(interviewError.message);
            setLoading(false);
            return;
          }

          if (feedbackError) {
            console.error("Error fetching feedback:", feedbackError.message);
          }

          // Map feedback JSON and extract overallScore inside the feedback JSON object
          const parsedFeedbacks: Feedback[] = (feedbackData || []).map((item) => ({
            id: item.id,
            feedback: item.feedback, // full JSON object from DB
            overallScore: item.feedback?.overallScore || null, // extract overallScore
            interview_id: item.interview_id,
            updated_at: item.updated_at
          }));

          setInterviews(interviewData || []);
          setFeedbacks(parsedFeedbacks);
        } else {
          // Fetch created interviews (default case)
          const query = supabase
            .from("interviews")
            .select("*")
            .eq("created_by", storedUserId)
            .order("created_at", { ascending: false });

          const { data, error: fetchError } = await query;

          console.log("Fetched interviews:", data);

          if (fetchError) {
            console.error("Error fetching interviews:", fetchError.message);
            setError(fetchError.message);
            setInterviews([]);
          } else if (data) {
            setInterviews(data as Interview[]);
          }
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        setError("An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    if (type) {
      fetchData();
    }
  }, [type]); // Depend on type to refetch when it changes

  const getScoreForInterview = (interviewId: number) => {
    const match = feedbacks.find(f => f.interview_id === interviewId);
    return match ? match.overallScore : null;
  };

  const getFeedbackId = (interviewId: number) => {
    const match = feedbacks.find(f => f.interview_id === interviewId);
    return match ? match.id : null;
  };

  const getUpdatedDate = (interviewId: number) => {
    const match = feedbacks.find(f => f.interview_id === interviewId);
    if (match && match.updated_at) {
      const matchDate = new Date(match.updated_at).toLocaleDateString();
      return matchDate;
    }
    return null;
  };

  if (!type) {
    return <div className="text-center p-6">Loading...</div>;
  }

  if (loading) {
    return <div className="text-center p-6">Loading interviews...</div>;
  }

  if (error) {
    return <div className="text-center p-6 text-red-600">Error: {error}</div>;
  }

  if (interviews.length === 0) {
    const content = type === "attended" ? (
      <>
        <p>You haven&apos;t attended any interviews yet.</p>
        <p>Browse available interviews to get started.</p>
      </>
    ) : (
      <>
        <p>You haven&apos;t created any interviews yet.</p>
        <p>Click the &apos;Create Interview&apos; button to get started.</p>
        <button
          onClick={() => (window.location.href = "/create-interview")}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
        >
          Create Interview
        </button>
      </>
    );
    return <div className="text-center p-6 text-gray-500">{content}</div>;
  }

  return (
    <>
      <Navbar />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 p-6">
        <div className="col-span-full text-2xl font-bold mb-4 capitalize">{type} Interviews</div>
        {interviews.map((interview) => {
          let score, updated_at, feedbackId;
          if (type === 'attended') {
            score = getScoreForInterview(interview.id);
            updated_at = getUpdatedDate(interview.id);
            feedbackId = getFeedbackId(interview.id);
          }
          const created_date = new Date(interview.created_at).toLocaleDateString();

          return (
            <div key={interview.id} className="text-white p-6 border rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 min-h-[320px] flex flex-col justify-between" 
            style={{ backgroundImage: `url(nightstar.jpg)`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
              <div className="relative">
                <span className="absolute -top-4 -right-4 bg-gray-200 text-gray-700 text-xs font-semibold px-2 py-1 rounded">
                  {interview.type}
                </span>
              </div>

              <div className="flex flex-col items-center mb-4">
                <Image 
                  src={interview.coverImage ? `https://logo.clearbit.com/${interview.coverImage}.com` : 'https://logo.clearbit.com/default.com'}
                  alt="Interview Image" 
                  width={72} 
                  height={72} 
                  className="rounded-full mb-3" 
                />
                <p>{interview.coverImage}</p>
              </div>

              <h3 className="text-xl font-bold">{interview.role}</h3>
              <p className="text-gray-300 font-semibold mb-2">
                {interview.level} • {interview.questions.length} questions
              </p>
              
              <div className="flex flex-row items-center font-semibold justify-between mt-4 text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <Image src="/calendar.svg" width="20" height="20" alt="Calendar" />
                  {type === "created" && <span>{created_date}</span>}
                  {type === "attended" && <span>{updated_at || created_date}</span>}
                </div>
                <div className="flex items-center gap-1">
                  <Image src="/star.svg" width="20" height="20" alt="Score" />
                  {type === "created" && <span>{created_date}</span>}
                  {type === "attended" && <span>{score || 'N/A'}</span>}
                </div>
              </div>

              {/* Technology Stack Display */}
              <div className="flex items-center gap-6 mt-4">
                <div className="flex items-center relative">
                  {interview.techstack && interview.techstack.slice(0, 3).map((tech, index) => {
                    // Map technology names to their respective icons
                    const techIcons: { [key: string]: string } = {
                      'React': '/Technology-cover/react.svg',
                      'Python': '/Technology-cover/python.svg',
                      'JavaScript': '/Technology-cover/javascript.svg',
                      'TypeScript': '/Technology-cover/typescript.svg',
                      'Node.js': '/Technology-cover/nodejs.svg',
                      'Next.js': '/Technology-cover/nextjs.svg',
                      'Vue': '/Technology-cover/vue.svg',
                      'Angular': '/Technology-cover/angular.svg',
                      'Tailwind': '/Technology-cover/tailwind.svg',
                      'Html': '/Technology-cover/html.svg',
                      'CSS': '/Technology-cover/css.svg',
                      'CPP': '/Technology-cover/cpp.svg',
                      'C': '/Technology-cover/c.svg',
                      'Bootstrap': '/Technology-cover/bootstrap.svg',
                      'Java': '/Technology-cover/java.svg',
                      'Go': '/Technology-cover/go.svg',
                      'Ruby': '/Technology-cover/ruby.svg',
                      'PHP': '/Technology-cover/php.svg',
                      'Django': '/Technology-cover/django.svg',
                    };
                    
                    const iconPath = techIcons[tech] || '/Technology-cover/default.svg';
                    
                    return (
                      <Image
                        key={tech}
                        src={iconPath}
                        className={`rounded-full bg-gray-200 p-1 w-[30px] h-[30px] ${index > 0 ? '-ml-2' : ''}`}
                        width={30}
                        height={30}
                        alt={tech}
                        title={tech}
                        style={{ zIndex: 10 + index }}
                      />
                    );
                  })}
                  {interview.techstack && interview.techstack.length > 3 && (
                    <span className="ml-2 text-xs text-gray-400">
                      +{interview.techstack.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* Action Button */}
              {type === "created" && 
                <button 
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full mt-4"
                  onClick={() => {
                    console.log('View interview:', interview);
                    window.location.href = `/attend-interview/${interview.id}`;
                  }}
                >
                  Start Interview
                </button>              
              }
              {type === 'attended' && 
                <div className="grid grid-cols-2 mt-3 gap-2">
                  <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    onClick={() => window.location.href = `/attend-interview/${interview.id}`}
                  >
                    Retake Interview
                  </button>

                  {feedbackId && (
                    <button
                      className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                      onClick={() => window.location.href = `/feedback/${feedbackId}`}
                    >
                      View Feedback
                    </button>
                  )}
                </div>
              }
            </div>
          );
        })}
      </div>
      <Footer/>
    </>
  );
};

export default Interview;
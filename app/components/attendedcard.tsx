import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { supabase } from "@/lib/supabaseClient";

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
  overallScore: number;
  interview_id:number;
  updated_at:string;
}

const AttendedInterviewCard: React.FC = () => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      if (!storedUserId) {
        setError("User not logged in to view attended interviews.");
        setLoading(false);
        return;
      }

      const interviewQuery = supabase
        .from("interviews")
        .select("*")
        .contains("attendees", [storedUserId])
        .order("created_at", { ascending: false });

        const feedbackQuery = supabase
        .from("feedback")
        .select("id, feedback, interview_id, updated_at")
      
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
        interview_id:item.interview_id,
        updated_at:item.updated_at
      }));
      
      setInterviews(interviewData || []);
      setFeedbacks(parsedFeedbacks);
      setLoading(false);
    };

    fetchData();
  }, []);

  const getScoreForInterview = (interviewId: number) => {
    const match = feedbacks.find(f => f.interview_id === interviewId);
    return match ? match.overallScore : null;
  };

  const getFeedbackId = (interviewId: number) => {
    const match = feedbacks.find(f => f.interview_id === interviewId);
    return match ? match.id : null;
  };

  const getUpdatedDate = (interviewId:number)=>{
    const match = feedbacks.find(f => f.interview_id === interviewId);
    if(match && match.updated_at){
        const matchDate = new Date(match.updated_at).toLocaleDateString();
        return matchDate;
    }
    return null;
  }

  if (loading) return <div className="text-center p-6">Loading interviews...</div>;
  if (error) return <div className="text-center p-6 text-red-600">Error: {error}</div>;
  if (interviews.length === 0) return <div className="text-center p-6 text-gray-500">You haven&apos;t attended any interviews yet.</div>;

  return (
    <div className="bg-white grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 p-6">
      {interviews.map((interview) => {
        const score = getScoreForInterview(interview.id);
        const updated_at = getUpdatedDate(interview.id);
        const feedbackId = getFeedbackId(interview.id);

        return (
          <div key={interview.id} className="text-white p-6 border rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 min-h-[360px] flex flex-col justify-between"
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
              {interview.level} • {interview.amount} questions
            </p>

            <div className="flex flex-row items-center font-semibold justify-between mt-4 text-sm text-gray-400">
              <div className="flex items-center gap-1">
                <Image src="/calendar.svg" width="20" height="20" alt="Calendar" />
                <span>{updated_at}</span>
              </div>
              <div className="flex items-center gap-1">
                <Image src="/star.svg" width="20" height="20" alt="Score" />
                <span>{score}/100</span>
              </div>
            </div>

            {/* Tech stack icons */}
            <div className="flex items-center gap-6 mt-4">
              <div className="flex items-center relative">
                {interview.techstack && interview.techstack.slice(0, 3).map((tech, index) => {
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
                      className={`rounded-full bg-gray-200 p-1 w-[30px] h-[30px] ${index > 0 ? '-ml-2' : ''} z-${10 + index}`}
                      width={30}
                      height={30}
                      alt={tech}
                      title={tech}
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

            {/* Action Buttons */}
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
          </div>
        );
      })}
    </div>
  );
};

export default AttendedInterviewCard;

'use client'

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import Navbar from '../../components/navbar';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface AnswerAnalysis {
  question: string;
  answer: string;
  analysis: string;
  score: number;
}

interface Feedback {
  overallScore: number;
  overallRating: string;
  strengths: string[];
  areasForImprovement: string[];
  detailedFeedback: string;
  answerAnalysis: AnswerAnalysis[];
  recommendations: string[];
  technicalCompetency: { score: number; assessment: string; };
  communicationSkills: { score: number; assessment: string; };
  problemSolvingApproach: { score: number; assessment: string; };
}

interface InterviewResults {
  interviewId: string;
  feedback: Feedback;
  totalTime: number;
  completedAt: string;
  interviewDetails?: any;
}

const FeedbackPage: React.FC = () => {
  const [results, setResults] = useState<InterviewResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    const fetchFeedback = async () => {
      const interviewId = params.id as string;
      
      if (!interviewId) {
        setError('No interview ID provided');
        setLoading(false);
        return;
      }

      try {
        // Fetch feedback from Supabase
        const { data, error: supabaseError } = await supabase
          .from('feedback')
          .select('*')
          .eq('id', interviewId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (supabaseError) {
          console.error('Supabase error:', supabaseError);
          setError('Failed to fetch interview feedback');
          setLoading(false);
          return;
        }

        if (!data) {
          setError('No feedback found for this interview');
          setLoading(false);
          return;
        }

        // Transform the data to match the expected format
        const transformedResults: InterviewResults = {
          interviewId: data.interview_id,
          feedback: data.feedback,
          totalTime: data.total_time,
          completedAt: data.completed_at || data.created_at,
          interviewDetails: data.interview_details
        };

        setResults(transformedResults);
        setLoading(false);

      } catch (error) {
        console.error('Error fetching feedback:', error);
        setError('Failed to load interview feedback');
        setLoading(false);
      }
    };

    fetchFeedback();
  }, [params.id]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-400';
    if (score >= 6) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getRatingColor = (rating: string) => {
    switch (rating.toLowerCase()) {
      case 'strong hire':
        return 'text-green-400 bg-green-900/20';
      case 'hire':
        return 'text-green-300 bg-green-800/20';
      case 'lean hire':
        return 'text-yellow-400 bg-yellow-900/20';
      case 'no hire':
        return 'text-red-400 bg-red-900/20';
      default:
        return 'text-gray-400 bg-gray-800/20';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-lg">Fetching your feedback...</p>
        </div>
      </div>
    );
  }

  if (error || !results) {
    return (
      <div className="min-h-screen bg-gray-900 text-white" style={{ backgroundColor: 'rgb(125, 59, 211)' }}>
        <Navbar />
        <div className="max-w-4xl mx-auto p-8">
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-red-400 mb-2">Error Loading Feedback</h2>
            <p className="text-gray-300 mb-4">{error}</p>
            <button
              onClick={() => router.push('/')}
              className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-500 transition"
            >
              Back to Interviews
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { feedback } = results;

  return (
    <div className="min-h-screen bg-gray-900 text-white" style={{ backgroundColor: 'rgb(125, 59, 211)' }}>
      <Navbar />
      <div className="max-w-6xl mx-auto p-8">
        {/* Header */}
        <div className="bg-gray-800 rounded-2xl p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-blue-400 mb-2">Interview Feedback</h1>
              <p className="text-gray-400">Completed on {new Date(results.completedAt).toLocaleDateString()}</p>
              {results.interviewDetails && (
                <div className="mt-2 text-sm text-gray-400">
                  <span>{results.interviewDetails.role} • {results.interviewDetails.level} • {results.interviewDetails.company}</span>
                </div>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Total Time</p>
              <p className="text-xl font-semibold">{formatTime(results.totalTime)}</p>
            </div>
          </div>

          {/* Overall Score */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-700 rounded-xl p-6 text-center">
              <h3 className="text-lg font-semibold mb-2">Overall Score</h3>
              <div className={`text-4xl font-bold ${getScoreColor(feedback.overallScore / 10)}`}>
                {feedback.overallScore}/100
              </div>
            </div>
            <div className="bg-gray-700 rounded-xl p-6 text-center">
              <h3 className="text-lg font-semibold mb-2">Rating</h3>
              <div className={`text-2xl font-bold px-4 py-2 rounded-full ${getRatingColor(feedback.overallRating)}`}>
                {feedback.overallRating}
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Feedback */}
        <div className="bg-gray-800 rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-blue-400 mb-4">Overall Assessment</h2>
          <p className="text-gray-300 leading-relaxed">{feedback.detailedFeedback}</p>
        </div>

        {/* Skills Assessment */}
        <div className="bg-gray-800 rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-blue-400 mb-6">Skills Assessment</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Technical Competency */}
            <div className="bg-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-3">Technical Competency</h3>
              <div className={`text-2xl font-bold mb-2 ${getScoreColor(feedback.technicalCompetency.score)}`}>
                {feedback.technicalCompetency.score}/10
              </div>
              <p className="text-gray-300 text-sm">{feedback.technicalCompetency.assessment}</p>
            </div>

            {/* Communication Skills */}
            <div className="bg-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-3">Communication Skills</h3>
              <div className={`text-2xl font-bold mb-2 ${getScoreColor(feedback.communicationSkills.score)}`}>
                {feedback.communicationSkills.score}/10
              </div>
              <p className="text-gray-300 text-sm">{feedback.communicationSkills.assessment}</p>
            </div>

            {/* Problem Solving */}
            <div className="bg-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-3">Problem Solving</h3>
              <div className={`text-2xl font-bold mb-2 ${getScoreColor(feedback.problemSolvingApproach.score)}`}>
                {feedback.problemSolvingApproach.score}/10
              </div>
              <p className="text-gray-300 text-sm">{feedback.problemSolvingApproach.assessment}</p>
            </div>
          </div>
        </div>

        {/* Strengths and Areas for Improvement */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Strengths */}
          <div className="bg-gray-800 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-green-400 mb-4">Strengths</h2>
            <ul className="space-y-3">
              {feedback.strengths.map((strength, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  <span className="text-gray-300">{strength}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Areas for Improvement */}
          <div className="bg-gray-800 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-yellow-400 mb-4">Areas for Improvement</h2>
            <ul className="space-y-3">
              {feedback.areasForImprovement.map((area, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-yellow-400 mr-2">→</span>
                  <span className="text-gray-300">{area}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Answer Analysis */}
        <div className="bg-gray-800 rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-blue-400 mb-6">Answer Analysis</h2>
          <div className="space-y-6">
            {feedback.answerAnalysis.map((analysis, index) => (
              <div key={index} className="bg-gray-700 rounded-xl p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-blue-300">Question {index + 1}</h3>
                  <span className={`text-lg font-bold ${getScoreColor(analysis.score)}`}>
                    {analysis.score}/10
                  </span>
                </div>
                <p className="text-gray-300 mb-3 font-medium">{analysis.question}</p>
                <div className="bg-gray-600 rounded-lg p-4 mb-3">
                  <p className="text-sm text-gray-400 mb-1">Your Answer:</p>
                  <p className="text-gray-200">{analysis.answer || 'No answer provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Analysis:</p>
                  <p className="text-gray-300">{analysis.analysis}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-gray-800 rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-purple-400 mb-4">Recommendations</h2>
          <ul className="space-y-3">
            {feedback.recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start">
                <span className="text-purple-400 mr-2">💡</span>
                <span className="text-gray-300">{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white px-8 py-3 rounded-full hover:bg-blue-500 transition"
          >
            Back to Interviews
          </button>
          <button
            onClick={() => window.print()}
            className="bg-gray-600 text-white px-8 py-3 rounded-full hover:bg-gray-500 transition"
          >
            Print Feedback
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;
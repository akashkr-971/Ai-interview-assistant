'use client'

import React, { useEffect, useState, useRef } from 'react';
import Navbar from '../../components/navbar';
import Image from 'next/image';
import { cn } from "@/lib/utils";
import { useRouter } from 'next/navigation';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
const SpeechRecognition = typeof window !== 'undefined'
  ? window.SpeechRecognition || window.webkitSpeechRecognition
  : undefined;

interface InterviewData {
  id: number;
  role: string;
  level: string;
  type: string;
  techstack: string[];
  amount: number;
  questions: string[];
  created_by: string;
  company: string;
}

const AttendInterview: React.FC = () => {
  const [talking, setTalking] = useState<'ai' | 'user' | 'none'>('none');
  const [lastMessage, setLastMessage] = useState<string>('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [interviewCompleted, setInterviewCompleted] = useState(false);
  const [interviewTime, setInterviewTime] = useState<number>(0);
  const [isListening, setIsListening] = useState(false);
  const [canRetry, setCanRetry] = useState(false);
  const [answers, setAnswers] = useState<string[]>([]);
  const [interviewData, setInterviewData] = useState<InterviewData | null>(null);
  const [isAnswerComplete, setIsAnswerComplete] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState<string>('');

  const router = useRouter();

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const currentQuestionRef = useRef(currentQuestionIndex);
  const answersRef = useRef(answers);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const listeningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isProcessingRef = useRef(false);

  // Update refs when state changes
  useEffect(() => {
    currentQuestionRef.current = currentQuestionIndex;
  }, [currentQuestionIndex]);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    const interviewId = window.location.pathname.split('/').pop();
    if (interviewId) {
      fetchInterviewData(interviewId);
    }
  }, []);

  useEffect(() => {
    return () => {
      stopTimer();
      cleanupRecognition();
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      if (listeningTimeoutRef.current) {
        clearTimeout(listeningTimeoutRef.current);
      }
    };
  }, []);

  const fetchInterviewData = async (interviewId: string) => {
    try {
      const response = await fetch(`/api/interview/${interviewId}`);
      if (!response.ok) throw new Error('Failed to fetch interview data');
      const data: InterviewData = await response.json();
      console.log('Fetched interview data:', data);
      setInterviewData(data);
      setAnswers(new Array(data.questions.length).fill(''));
    } catch (error) {
      console.error('Error fetching interview data:', error);
      alert('Failed to load interview data. Please try again later.');
    }
  };

  const startTimer = () => {
    stopTimer();
    setInterviewTime(0);
    timerRef.current = setInterval(() => {
      setInterviewTime((prevTime) => prevTime + 1);
    }, 1000);
    console.log('Timer started');
  };

  const stopTimer = () => {
    if (timerRef.current) {
      console.log('Clearing timer interval:', timerRef.current);
      clearInterval(timerRef.current);
      timerRef.current = null;
      console.log('Timer stopped');
    }
  };

  const cleanupRecognition = () => {
    console.log('Cleaning up recognition');
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.onnomatch = null;
        recognitionRef.current.onspeechstart = null;
        recognitionRef.current.onspeechend = null;
        recognitionRef.current.stop();
      } catch (error) {
        console.error('Error stopping recognition:', error);
      }
      recognitionRef.current = null;
    }
    
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (listeningTimeoutRef.current) {
      clearTimeout(listeningTimeoutRef.current);
      listeningTimeoutRef.current = null;
    }
    
    setIsListening(false);
    isProcessingRef.current = false;
  };

  const speakQuestion = (questionIndex: number) => {
    if (!synth || !interviewData || questionIndex >= interviewData.questions.length) return;
    
    console.log(`Speaking question ${questionIndex + 1}: ${interviewData.questions[questionIndex]}`);
    setTalking('ai');
    setIsAnswerComplete(false);
    setCurrentAnswer('');
    
    const text = `${interviewData.questions[questionIndex]}`;
    setLastMessage(`${interviewData.questions[questionIndex]}`);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-GB';
    utterance.rate = 0.9;
    
    utterance.onend = () => {
      console.log('AI finished speaking, switching to user');
      setTalking('user');
      setTimeout(() => {
        listen();
      }, 500);
    };

    utterance.onerror = (error) => {
      console.error('Speech synthesis error:', error);
      setTalking('none');
    };

    synth.speak(utterance);
  };

  const listen = () => {
    if (!SpeechRecognition) {
      console.error('Speech recognition not supported');
      return;
    }

    cleanupRecognition();

    try {
      recognitionRef.current = new SpeechRecognition();
      const recognition = recognitionRef.current;
      recognition.lang = 'en-US';
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.continuous = true;

      setIsListening(true);
      setCanRetry(false);
      isProcessingRef.current = false;

      let finalTranscript = '';
      let interimTranscript = '';

      recognition.onspeechstart = () => {
        console.log('Speech detected');
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }
      };

      recognition.onresult = (event: any) => {
        if (isProcessingRef.current) return;
        
        finalTranscript = '';
        interimTranscript = '';

        for (let i = 0; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript.trim() + ' ';
          } else {
            interimTranscript += event.results[i][0].transcript.trim() + ' ';
          }
        }
        
        console.log('Final:', finalTranscript, 'Interim:', interimTranscript);
        
        // Update current answer state
        const completeAnswer = (finalTranscript + interimTranscript).trim();
        setCurrentAnswer(completeAnswer);
        
        // Show live transcript to user
        if (completeAnswer) {
          setLastMessage(`Your answer: "${completeAnswer}"`);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (!isProcessingRef.current) {
          setIsListening(false);
          setCanRetry(true);
          
          if (event.error === 'no-speech') {
            setLastMessage("I didn't hear anything. Click 'Continue Speaking' and speak clearly.");
          } else if (event.error === 'audio-capture') {
            setLastMessage("Microphone issue. Click 'Continue Speaking' and check your microphone.");
          } else if (event.error === 'not-allowed') {
            setLastMessage('Microphone access denied. Please allow microphone access.');
            setTalking('none');
            setCanRetry(false);
          } else if (event.error === 'network') {
            setLastMessage("Network error. Click 'Continue Speaking' to retry.");
          } else {
            setLastMessage("Recognition error. Click 'Continue Speaking' to retry.");
          }
        }
      };

      recognition.onend = () => {
        console.log('Recognition ended');
        if (!isProcessingRef.current) {
          setIsListening(false);
          if (!isAnswerComplete && talking === 'user') {
            setCanRetry(true);
          }
        }
      };

      recognition.onnomatch = () => {
        console.log('No match found');
        if (!isProcessingRef.current) {
          setIsListening(false);
          setCanRetry(true);
          setLastMessage("I couldn't understand that. Click 'Continue Speaking' and speak more clearly.");
        }
      };

      recognition.start();
      
      listeningTimeoutRef.current = setTimeout(() => {
        if (recognitionRef.current && isListening && !isProcessingRef.current) {
          console.log('Auto-stopping recognition after timeout');
          recognitionRef.current.stop();
        }
      }, 60000);
      
    } catch (error) {
      console.error('Error starting recognition:', error);
      setIsListening(false);
      setCanRetry(true);
      setTalking('none');
      setLastMessage("Error starting microphone. Click 'Continue Speaking' to retry.");
    }
  };

  // Helper function to count words
  const countWords = (text: string): number => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  // Check if answer is sufficient (8 or more words)
  const isAnswerSufficient = (): boolean => {
    return countWords(currentAnswer) >= 8;
  };

  const nextQuestion = () => {
    if (!interviewData || interviewCompleted || !interviewStarted) return;
    
    // Check if current answer is sufficient
    if (!isAnswerSufficient()) {
      setLastMessage("Please provide a more detailed answer (at least 8 words) before proceeding to the next question.");
      return;
    }
    
    // Process the current answer
    processAnswer(currentAnswer);
  };

  const processAnswer = (transcript: string) => {
    if (isProcessingRef.current) return;
    
    console.log('Processing answer:', transcript);
    isProcessingRef.current = true;
    cleanupRecognition();
    setCanRetry(false);
    setTalking('none');
    setIsAnswerComplete(true);
    
    const questionIndex = currentQuestionRef.current;
    const updatedAnswers = [...answersRef.current];
    updatedAnswers[questionIndex] = transcript;
    setAnswers(updatedAnswers);
    answersRef.current = updatedAnswers;
    
    // Don't show the processed answer in the transcript
    setLastMessage("Answer recorded successfully.");
    
    // Add delay before proceeding to next question
    setTimeout(() => {
      proceedToNextQuestion();
    }, 1500);
  };

  const proceedToNextQuestion = () => {
    if (!interviewData) return;
    
    const nextQuestionIndex = currentQuestionRef.current + 1;
    
    if (nextQuestionIndex < interviewData.questions.length) {
      console.log(`Moving to question ${nextQuestionIndex + 1}`);
      setCurrentQuestionIndex(nextQuestionIndex);
      isProcessingRef.current = false;
      speakQuestion(nextQuestionIndex);
    } else {
      console.log('All questions completed');
      completeInterview();
    }
  };

  const completeInterview = () => {
    console.log('Completing interview');
    setInterviewCompleted(true);
    setTalking('ai');
    stopTimer();
    
    const completionMessage = "Congratulations! You have completed the interview. Thank you for your time and responses.";
    const utterance = new SpeechSynthesisUtterance(completionMessage);
    utterance.lang = 'en-GB';
    utterance.rate = 0.9;
    
    utterance.onend = () => {
      setTalking('none');
      submitInterviewResults();
    };

    synth?.speak(utterance);
    setLastMessage(completionMessage);
  };

  const submitInterviewResults = async () => {
    if (!interviewData) return;
  
    const results = {
      questions: interviewData.questions,
      technicalAnswers: answersRef.current,
      questionsAndAnswers: interviewData.questions.map((question, index) => ({
        question: question,
        answer: answersRef.current[index] || ''
      })),
      interviewDetails: {
        role: interviewData.role,
        level: interviewData.level,
        type: interviewData.type,
        techstack: interviewData.techstack,
        company: interviewData.company
      },
      completedAt: new Date().toISOString(),
      userId: localStorage.getItem('userId') || '',
      totalTime: interviewTime,
      interview_id:interviewData.id
    };
    
    console.log('Interview Results:', results);
    
    try {
      // Show loading state
      setLastMessage('Generating your feedback...');
      
      const response = await fetch('/api/AI/generate-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(results),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const feedbackResponse = await response.json();
      
      if (feedbackResponse.success && feedbackResponse.feedback) {
        router.push(`/feedback/${feedbackResponse.feedbackId}`);
      } else {
        throw new Error('Invalid response from feedback API');
      }
      
    } catch (error) {
      console.error("API submission failed", error);
      setLastMessage('Failed to generate feedback. Please try again.');
      
      // Show retry option
      setTimeout(() => {
        setLastMessage('Feedback generation failed. You can still view your interview completion.');
      }, 3000);
    }
  };

  const retryListening = () => {
    if (interviewStarted && !interviewCompleted && !isAnswerComplete && !isProcessingRef.current) {
      console.log('Retrying listening');
      setTalking('user');
      setCanRetry(false);
      setTimeout(() => {
        listen();
      }, 500);
    }
  };

  const startInterview = async () => {
    if (interviewStarted || !interviewData) return;
    
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      console.log('Starting interview');
      setInterviewStarted(true);
      setCurrentQuestionIndex(0);
      setLastMessage('');
      setCanRetry(false);
      setIsAnswerComplete(false);
      setCurrentAnswer('');
      isProcessingRef.current = false;
      startTimer();
      speakQuestion(0);
    } catch (err) {
      console.error("Microphone access denied", err);
      alert("Microphone access is required for the interview. Please allow microphone access and try again.");
    }
  };

  const stopInterview = () => {
    console.log('Stopping interview');
    synth?.cancel();
    cleanupRecognition();
    stopTimer();
    setTalking('none');
    setInterviewStarted(false);
    setInterviewCompleted(false);
    setCurrentQuestionIndex(0);
    setCanRetry(false);
    setIsAnswerComplete(false);
    setCurrentAnswer('');
    isProcessingRef.current = false;
    setLastMessage('Interview stopped.');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!interviewData) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Loading interview...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white" style={{ backgroundColor: 'rgb(125, 59, 211)' }}>
      <Navbar />
      <div className="max-w-4xl bg-gray-800 rounded-2xl p-8 shadow-lg m-10 mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center w-full justify-between">
            <div>
              <span className="text-blue-400 font-medium text-lg">
                {interviewData.role} - {interviewData.type} Interview
              </span>
              <p className="text-gray-400 text-sm mt-1">
                Level: {interviewData.level} | Tech Stack: {interviewData.techstack.join(', ')}
              </p>
            </div>
            <div className="flex items-center justify-between mt-4 p-3 bg-gray-50 rounded-xl shadow-sm">
              <div className="flex items-center gap-2">
                <span className="text-blue-600 font-semibold text-md">🕒 Interview Time:</span>
                <span className="text-gray-700 text-md font-semibold">{formatTime(interviewTime)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <div className={`bg-gray-700 rounded-xl p-6 flex flex-col items-center justify-center text-center h-100 ${talking === 'ai' ? 'border-4 border-white-400' : ''}`}>
            <Image src="/logo.webp" alt="AI Interviewer" width={80} height={80} className={`rounded-full ${talking === 'ai' ? 'animate-pulse-ring' : ''}`} />
            <h3 className="text-lg font-semibold mt-4">Interviewer</h3>
            {talking === 'ai' && <p className="text-sm text-gray-300 mt-2">Speaking...</p>}
          </div>
          <div className={`bg-gray-700 rounded-xl p-6 flex flex-col items-center justify-center text-center h-100 ${talking === 'user' ? 'border-4 border-white-400' : ''}`}>
            <Image src="/avatar.jpg" alt="User" width={80} height={80} className={`rounded-full ${talking === 'user' ? 'animate-pulse-ring' : ''}`} />
            <h3 className="text-lg font-semibold mt-4">You</h3>
            {isListening && <p className="text-sm text-gray-300 mt-2">Listening...</p>}
          </div>
        </div>

        <div className="bg-gray-700 rounded-lg px-4 py-3 mb-6 min-h-20 flex items-center justify-center">
          <p className={cn("transition-opacity duration-500 opacity-0 text-center", "animate-fadeIn opacity-100")}>
            {lastMessage || `Welcome! Ready to start your ${interviewData.type.toLowerCase()} interview for ${interviewData.role}?`}
          </p>
        </div>

        <p>*If the question is not asked automatically by the interviewer, please click on the "Next Question" button.*</p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <button
            onClick={() => alert('Reported')}
            className="bg-gray-600 text-white px-6 py-2 rounded-full hover:bg-gray-500 text-sm transition"
          >
            🛡️ Report
          </button>
          {interviewStarted && !interviewCompleted ? (
            <>
              <button
                onClick={stopInterview}
                className="bg-red-600 text-white px-6 py-2 rounded-full hover:bg-red-500 transition"
              >
                End Interview
              </button>
              
              {/* Next Question button - always visible when user is talking and has sufficient answer */}
              {talking === 'user' && isAnswerSufficient() && (
                <button
                  onClick={nextQuestion}
                  className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-500 transition animate-pulse"
                >
                  Next Question
                </button>
              )}

              {canRetry && !isAnswerComplete && !isProcessingRef.current && (
                <button
                  onClick={retryListening}
                  className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-500 transition animate-pulse"
                >
                  🎤 Continue Speaking
                </button>
              )}
              <button
                onClick={completeInterview}
                className="bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-500 transition"
              >
                Complete Interview
              </button>
            </>
          ) : !interviewCompleted ? (
            <button
              onClick={startInterview}
              className="bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-500 transition"
            >
              Start Interview
            </button>
          ) : (
            <div className="text-center">
              <p className="text-green-400 text-lg font-semibold">Interview Completed!</p>
              <p className="text-gray-400 text-sm mt-2">Your responses have been submitted.</p>
              <p className="text-blue-400 text-sm mt-1">Total time: {formatTime(interviewTime)}</p>
            </div>
          )}
        </div>

        {interviewStarted && !interviewCompleted && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-400">
              Question {currentQuestionIndex + 1} of {interviewData.questions.length}
            </p>
            <div className="w-full bg-gray-600 rounded-full h-2 mt-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / (interviewData.questions.length)) * 100}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendInterview;
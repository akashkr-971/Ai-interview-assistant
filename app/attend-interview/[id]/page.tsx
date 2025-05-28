'use client'

import React, { useEffect, useState, useRef } from 'react';
import Navbar from '../../components/navbar';
import Image from 'next/image';
import { cn } from "@/lib/utils";

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
}

interface GeneralAnswers {
  name: string;
  experience: string;
  background: string;
}

const AttendInterview: React.FC = () => {
  const [talking, setTalking] = useState<'ai' | 'user' | 'none'>('none');
  const [lastMessage, setLastMessage] = useState<string>('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(-1);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [interviewCompleted, setInterviewCompleted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [canRetry, setCanRetry] = useState(false);
  const [answers, setAnswers] = useState<string[]>([]);
  const [generalAnswers, setGeneralAnswers] = useState<GeneralAnswers>({ name: '', experience: '', background: '' });
  const [interviewData, setInterviewData] = useState<InterviewData | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [isGeneralPhase, setIsGeneralPhase] = useState(true);
  const [currentGeneralQuestion, setCurrentGeneralQuestion] = useState<number>(-1);

  const recognitionRef = useRef<any>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const currentQuestionRef = useRef(currentQuestionIndex);
  const answersRef = useRef(answers);
  const generalAnswersRef = useRef(generalAnswers);
  const currentGeneralQuestionRef = useRef(currentGeneralQuestion);

  // General questions that come before technical questions
  const generalQuestions = [
    "Let's start with some general questions. Please tell me your full name.",
    "How many years of experience do you have in software development or related fields?",
    "Can you briefly describe your educational background and any relevant experience?"
  ];

  // Sample interview data - replace with actual data from props/API
  const sampleInterviewData: InterviewData = {
    id: 4,
    role: "Front End Developer",
    level: "entry level",
    type: "Technical",
    techstack: ['React', 'Python'],
    amount: 5,
    questions: [
      'Describe the React component lifecycle and explain the purpose of each phase (mounting, updating, unmounting).',
      'Explain the difference between state and props in React and how they are used to manage data within a component.',
      'How would you make an API call to a Python backend from a React application? What are some common methods for handling the response?',
      'What are some common techniques for optimizing React application performance, such as memoization or lazy loading?',
      'Explain the concept of JSX and how it relates to creating components in React. Provide a simple example of JSX code.'
    ],
    created_by: "8c063db3-c1d4-4648-ab48-5d0f22e96f41"
  }

  useEffect(() => {
    setInterviewData(sampleInterviewData);
    setAnswers(new Array(sampleInterviewData.questions.length).fill(''));
  }, []);

  useEffect(() => {
    currentQuestionRef.current = currentQuestionIndex;
  }, [currentQuestionIndex]);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    generalAnswersRef.current = generalAnswers;
  }, [generalAnswers]);

  useEffect(() => {
    currentGeneralQuestionRef.current = currentGeneralQuestion;
  }, [currentGeneralQuestion]);

  useEffect(() => {
    return () => {
      cleanupRecognition();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const cleanupRecognition = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.onnomatch = null;
        recognitionRef.current.stop();
      } catch (error) {
        console.error('Error stopping recognition:', error);
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  const startTimer = (minutes: number = 3) => {
    const totalSeconds = minutes * 60;
    setTimeRemaining(totalSeconds);
    setIsTimerActive(true);

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsTimerActive(false);
          // Auto-proceed to next question when time runs out
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    timerRef.current = timer;
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsTimerActive(false);
  };

  const handleTimeUp = () => {
    cleanupRecognition();
    setTalking('none');
    setLastMessage("Time's up! Moving to the next question.");
    
    setTimeout(() => {
      if (isGeneralPhase) {
        proceedToNextGeneralQuestion();
      } else {
        proceedToNextTechnicalQuestion();
      }
    }, 2000);
  };

  const speakQuestion = (questionIndex: number, isGeneral: boolean = false) => {
    if (!synth || !interviewData) return;
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setTalking('ai');
    
    let text = '';
    if (isGeneral) {
      if (questionIndex === 0) {
        text = `Welcome to your ${interviewData.type.toLowerCase()} interview for the ${interviewData.role} position. ${generalQuestions[questionIndex]}`;
      } else {
        text = generalQuestions[questionIndex];
      }
    } else {
      if (questionIndex === 0) {
        text = `Great! Now let's move to the technical questions. Question ${questionIndex + 1}: ${interviewData.questions[questionIndex]}`;
      } else {
        text = `Question ${questionIndex + 1}: ${interviewData.questions[questionIndex]}`;
      }
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-GB';
    utterance.rate = 0.9;
    
    utterance.onend = () => {
      setTalking('user');
      if (isGeneral) {
        setLastMessage(`General Question ${questionIndex + 1}: ${generalQuestions[questionIndex]}`);
      } else {
        setLastMessage(`Technical Question ${questionIndex + 1}: ${interviewData.questions[questionIndex]}`);
      }
      
      // Start timer - shorter for general questions
      startTimer(isGeneral ? 2 : 3);
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
    if (!SpeechRecognition) return;

    cleanupRecognition();

    try {
      recognitionRef.current = new SpeechRecognition();
      const recognition = recognitionRef.current;
      
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.continuous = false;

      setIsListening(true);
      setCanRetry(false);

      let finalTranscript = '';

      recognition.onresult = (event: any) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript.trim();
          }
        }
        
        console.log('Final transcript:', finalTranscript);
        
        if (finalTranscript && finalTranscript.length > 2) {
          setLastMessage(`Your answer: "${finalTranscript}"`);
          processAnswer(finalTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setCanRetry(true);
        
        if (event.error === 'no-speech') {
          setLastMessage("I didn't hear anything. Click 'Try Again' and speak clearly.");
        } else if (event.error === 'audio-capture') {
          setLastMessage("Microphone issue. Click 'Try Again' and check your microphone.");
        } else if (event.error === 'not-allowed') {
          setLastMessage('Microphone access denied. Please allow microphone access.');
          setTalking('none');
          setCanRetry(false);
        } else if (event.error === 'network') {
          setLastMessage("Network error. Click 'Try Again' to retry.");
        } else {
          setLastMessage("Recognition error. Click 'Try Again' to retry.");
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        if (talking === 'user' && !canRetry) {
          setCanRetry(true);
        }
      };

      recognition.onnomatch = () => {
        console.log('No match found');
        setIsListening(false);
        setCanRetry(true);
        setLastMessage("I couldn't understand that. Click 'Try Again' and speak more clearly.");
      };

      recognition.start();
      
      // Auto-stop after 30 seconds to prevent hanging
      setTimeout(() => {
        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }
      }, 30000);
      
    } catch (error) {
      console.error('Error starting recognition:', error);
      setIsListening(false);
      setCanRetry(true);
      setTalking('none');
      setLastMessage("Error starting microphone. Click 'Try Again' to retry.");
    }
  };

  const processAnswer = (transcript: string) => {
    cleanupRecognition();
    stopTimer();
    setCanRetry(false);
    setTalking('none');
    
    if (isGeneralPhase) {
      // Save general answer
      const questionIndex = currentGeneralQuestionRef.current;
      const updatedGeneralAnswers = { ...generalAnswersRef.current };
      
      switch (questionIndex) {
        case 0: updatedGeneralAnswers.name = transcript; break;
        case 1: updatedGeneralAnswers.experience = transcript; break;
        case 2: updatedGeneralAnswers.background = transcript; break;
      }
      
      setGeneralAnswers(updatedGeneralAnswers);
      generalAnswersRef.current = updatedGeneralAnswers;
      
      timeoutRef.current = setTimeout(() => {
        proceedToNextGeneralQuestion();
      }, 2000);
    } else {
      // Save technical answer
      const questionIndex = currentQuestionRef.current;
      const updatedAnswers = [...answersRef.current];
      updatedAnswers[questionIndex] = transcript;
      setAnswers(updatedAnswers);
      answersRef.current = updatedAnswers;

      timeoutRef.current = setTimeout(() => {
        proceedToNextTechnicalQuestion();
      }, 2000);
    }
  };

  const proceedToNextGeneralQuestion = () => {
    const nextQuestionIndex = currentGeneralQuestionRef.current + 1;
    
    if (nextQuestionIndex < generalQuestions.length) {
      setCurrentGeneralQuestion(nextQuestionIndex);
      speakQuestion(nextQuestionIndex, true);
    } else {
      // Move to technical questions
      setIsGeneralPhase(false);
      setCurrentQuestionIndex(0);
      speakQuestion(0, false);
    }
  };

  const proceedToNextTechnicalQuestion = () => {
    if (!interviewData) return;

    const nextQuestionIndex = currentQuestionRef.current + 1;
    
    if (nextQuestionIndex < interviewData.questions.length) {
      setCurrentQuestionIndex(nextQuestionIndex);
      speakQuestion(nextQuestionIndex, false);
    } else {
      // Interview completed
      completeInterview();
    }
  };

  const skipCurrentQuestion = () => {
    cleanupRecognition();
    stopTimer();
    setCanRetry(false);
    setTalking('none');
    
    if (isGeneralPhase) {
      setLastMessage("Skipping general question...");
      setTimeout(() => {
        proceedToNextGeneralQuestion();
      }, 1000);
    } else {
      setLastMessage("Skipping technical question...");
      setTimeout(() => {
        proceedToNextTechnicalQuestion();
      }, 1000);
    }
  };

  const completeInterview = () => {
    setInterviewCompleted(true);
    setTalking('ai');
    
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

  const submitInterviewResults = () => {
    const results = {
      interviewId: interviewData?.id,
      generalAnswers: generalAnswersRef.current,
      technicalAnswers: answersRef.current,
      completedAt: new Date().toISOString(),
      userId: localStorage.getItem('userId') || ''
    };
    
    console.log('Interview Results:', results);
    
    // Submit to API
    fetch('/api/interview/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(results),
    })
    .then(res => {
      if (!res.ok) throw new Error("Failed to submit");
      console.log("Interview results submitted successfully");
    })
    .catch(err => {
      console.error("API submission failed", err);
    });
  };

  const retryListening = () => {
    if (interviewStarted && !interviewCompleted) {
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
      
      setInterviewStarted(true);
      setIsGeneralPhase(true);
      setCurrentGeneralQuestion(0);
      setCurrentQuestionIndex(-1);
      setLastMessage('');
      setCanRetry(false);
      
      speakQuestion(0, true); // Start with first general question
    } catch (err) {
      console.error("Microphone access denied", err);
      alert("Microphone access is required for the interview. Please allow microphone access and try again.");
    }
  };

  const stopInterview = () => {
    synth?.cancel();
    cleanupRecognition();
    stopTimer();
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    setTalking('none');
    setInterviewStarted(false);
    setInterviewCompleted(false);
    setIsGeneralPhase(true);
    setCurrentGeneralQuestion(-1);
    setCurrentQuestionIndex(-1);
    setCanRetry(false);
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
          <div>
            <span className="text-blue-400 font-medium text-lg">
              {interviewData.role} - {interviewData.type} Interview
            </span>
            <p className="text-gray-400 text-sm mt-1">
              Level: {interviewData.level} | Tech Stack: {interviewData.techstack.join(', ')}
            </p>
            {isTimerActive && (
              <div className="bg-red-600 px-4 py-2 rounded-lg">
                <span className="font-mono text-lg">{formatTime(timeRemaining)}</span>
              </div>
            )}
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
              {canRetry && (
                <button
                  onClick={retryListening}
                  className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-500 transition animate-pulse"
                >
                  🎤 Continue Speaking
                </button>
              )}
              <button
                onClick={skipCurrentQuestion}
                className="bg-yellow-600 text-white px-6 py-2 rounded-full hover:bg-yellow-500 transition"
                disabled={interviewCompleted}
              >
                Skip Question
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
            </div>
          )}
        </div>

        {interviewStarted && !interviewCompleted && (
          <div className="mt-4 text-center">
            {isGeneralPhase ? (
              <p className="text-sm text-gray-400">
                General Question {currentGeneralQuestion + 1} of {generalQuestions.length}
              </p>
            ) : (
              <p className="text-sm text-gray-400">
                Technical Question {currentQuestionIndex + 1} of {interviewData.questions.length}
              </p>
            )}
            <div className="w-full bg-gray-600 rounded-full h-2 mt-2">
              {isGeneralPhase ? (
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentGeneralQuestion + 1) / generalQuestions.length) * 100}%` }}
                ></div>
              ) : (
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex + 1 + generalQuestions.length) / (interviewData.questions.length + generalQuestions.length)) * 100}%` }}
                ></div>
              )}
            </div>
          </div>
        )}

        {interviewCompleted && (
          <div className="mt-6 bg-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3 text-green-400">Interview Summary</h3>
            <div className="space-y-2">
              <div>
                <h4 className="font-medium text-blue-400">General Information:</h4>
                <p className="text-sm text-gray-300">Name: {generalAnswers.name || 'Not provided'}</p>
                <p className="text-sm text-gray-300">Experience: {generalAnswers.experience || 'Not provided'}</p>
                <p className="text-sm text-gray-300">Background: {generalAnswers.background || 'Not provided'}</p>
              </div>
              <div>
                <h4 className="font-medium text-green-400">Technical Questions:</h4>
                <p className="text-sm text-gray-300">
                  Questions Answered: {answers.filter(answer => answer.length > 0).length} of {interviewData.questions.length}
                </p>
                <p className="text-sm text-gray-300">Interview Type: {interviewData.type}</p>
                <p className="text-sm text-gray-300">Position: {interviewData.role}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendInterview;
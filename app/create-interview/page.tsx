'use client'

import React, { useEffect, useState, useRef } from 'react';
import Navbar from '../components/navbar';
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

const CreateInterview: React.FC = () => {

  const [talking, setTalking] = useState<'ai' | 'user' | 'none'>('none');
  const [lastMessage, setLastMessage] = useState<string>('');
  const [step, setStep] = useState<number>(-1);
  const [info, setInfo] = useState({ role: '', level: '', type: '', techstack: '', questions: '' });
  const [interviewStarted, setInterviewStarted] = useState(false);

  const recognitionRef = useRef<any>(null);

  const questions = [
    "Hi! Welcome to your personalized interview creator. What's the role you're hiring for?",
    "Awesome! What is the experience level for this role? Junior, Mid, Senior",
    "Great! Is it a full-time, part-time, or freelance role?",
    "Got it! What tech stack should the candidate be familiar with?",
    "Cool! How many questions should the interview have?",
    "Thanks! Your interview creation is complete. Good luck and have a great day!"
  ];

  const stepRef = useRef(step); // keep a stable ref for step in async callbacks

useEffect(() => {
  stepRef.current = step;
}, [step]);

const speakQuestion = (index: number) => {
  if (!synth) return;
  setTalking('ai');
  const text = questions[index];
  const utterance = new SpeechSynthesisUtterance(text);

  utterance.onend = () => {
    setTalking('user');
    if (index < questions.length - 1) {
      listen();
    }
  };

  synth.speak(utterance);
  setLastMessage(text);
};

const listen = () => {
  if (!SpeechRecognition) return;

  // Clear previous handlers
  if (recognitionRef.current) {
    recognitionRef.current.onresult = null;
    recognitionRef.current.onerror = null;
    recognitionRef.current.stop();
    recognitionRef.current = null;
  }

  recognitionRef.current = new SpeechRecognition();
  const recognition = recognitionRef.current;
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  interface InterviewInfo {
    role: string;
    level: string;
    type: string;
    techstack: string;
    questions: string;
  }

  interface SpeechRecognitionEventResult {
    [index: number]: {
      transcript: string;
    };
  }

  interface SpeechRecognitionEvent {
    results: SpeechRecognitionEventResult[];
  }

  interface SpeechRecognitionErrorEvent {
    error: string;
  }

  recognition.onresult = (event: SpeechRecognitionEvent) => {
    const transcript: string = event.results[0][0].transcript.trim();
    setLastMessage(transcript);

    setInfo((prev: InterviewInfo) => {
      const updated: InterviewInfo = { ...prev };
      const currentStep: number = stepRef.current;

      if (currentStep >= 0 && currentStep < questions.length - 1) {
        switch (currentStep) {
          case 0: updated.role = transcript; break;
          case 1: updated.level = transcript; break;
          case 2: updated.type = transcript; break;
          case 3: updated.techstack = transcript; break;
          case 4: updated.questions = transcript; break;
        }
      }
      return updated;
    });

    setStep((prev: number) => {
      const next: number = prev + 1;
      if (next < questions.length) {
        setTimeout(() => speakQuestion(next), 500);
      } else {
        setInterviewStarted(false);
        setTalking('none');
        console.log('Final Interview Details:', info);
      }
      return next;
    });

    recognition.stop();
  };

  recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
    console.error('Speech recognition error', event.error);
    if (event.error === 'no-speech' && interviewStarted) {
      setTimeout(() => listen(), 500);
    }
  };

  interface CustomSpeechRecognitionErrorEvent extends Event {
    error: string;
  }

  recognition.onerror = (event: CustomSpeechRecognitionErrorEvent) => {
    console.error('Speech recognition error', event.error);
    if (event.error === 'no-speech' && interviewStarted) {
      setTimeout(() => listen(), 500);
    }
  };

  recognition.start();
};

  const startInterview = () => {
    if (interviewStarted) return;
    setInfo({ role: '', level: '', type: '', techstack: '', questions: '' });
    setInterviewStarted(true);
    setStep(0);
    speakQuestion(0);
  };

  const stopInterview = () => {
    synth?.cancel();
    if (recognitionRef.current) recognitionRef.current.stop();
    setTalking('none');
    setInterviewStarted(false);
    setStep(-1);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white" style={{ backgroundColor: 'rgb(125, 59, 211)' }}>
      <Navbar />
      <div className="max-w-4xl bg-gray-800 rounded-2xl p-8 shadow-lg m-10 mx-auto">
        <div className="flex justify-between items-center mb-6">
          <span className="text-blue-400 font-medium text-lg">Create your Interview by answering the questions</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <div className={`bg-gray-700 rounded-xl p-6 flex flex-col items-center justify-center text-center h-100 ${talking === 'ai' ? 'border-4 border-white-400' : ''}`}>
            <Image src="/logo.webp" alt="AI Interviewer" width={80} height={80} className={`rounded-full ${talking === 'ai' ? 'animate-pulse-ring' : ''}`} />
            <h3 className="text-lg font-semibold mt-4">Assistant</h3>
          </div>
          <div className={`bg-gray-700 rounded-xl p-6 flex flex-col items-center justify-center text-center h-100 ${talking === 'user' ? 'border-4 border-white-400' : ''}`}>
            <Image src="/avatar.jpg" alt="User" width={80} height={80} className={`rounded-full ${talking === 'user' ? 'animate-pulse-ring' : ''}`} />
            <h3 className="text-lg font-semibold mt-4">You</h3>
          </div>
        </div>
        <div className="bg-gray-700 rounded-lg px-4 py-3 mb-6 h-20 flex items-center justify-center">
          <p className={cn("transition-opacity duration-500 opacity-0", "animate-fadeIn opacity-100")}>{lastMessage || 'Welcome to interview creation!!!'}</p>
        </div>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <button
              onClick={() => alert('Reported')}
              className="bg-gray-600 text-white px-6 py-2 rounded-full hover:bg-gray-500 text-sm transition"
            >
              🛡️ Report
            </button>
            {interviewStarted ? (
              <button
                onClick={stopInterview}
                className="bg-red-600 text-white px-6 py-2 rounded-full hover:bg-red-500 transition"
              >
                Stop Interview
              </button>
            ) : (
              <button
                onClick={startInterview}
                className="bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-500 transition"
              >
                Start Interview
              </button>
            )}
          </div>
      </div>
    </div>
  );
};

export default CreateInterview;

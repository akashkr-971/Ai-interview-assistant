'use client'

import { useEffect, useState, useRef } from 'react';
import Navbar from '../components/navbar';
import Image from 'next/image';
import { cn } from "@/lib/utils";
import { useRouter , useSearchParams } from 'next/navigation';
import { supabase } from "@/lib/supabaseClient";

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
  const [info, setInfo] = useState({ role: '', level: '', type: '', techstack: '', amount: '', company: '', userid: '' });
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [canRetry, setCanRetry] = useState(false);
  const [report ,showReportModel] = useState(false);
  const router = useRouter();
  const recognitionRef = useRef<any>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const stepRef = useRef(step);
  const infoRef = useRef(info);

  const searchParams = useSearchParams();
  const reportStatus = searchParams.get('report');

  useEffect(() => {
    if (reportStatus === 'submitted') {
      alert('✅ Your report has been submitted successfully!');
      router.replace('/create-interview');
    }
  }, [reportStatus , router]);

  const questions = [
    "Hi! Welcome to your personalized interview creator. What's the role you're hiring for?",
    "Awesome! What is the experience level for this role? entry-level, Middle-level, or Senior-level?",
    "Do you want to conduct a behavioural interview, a technical interview, or mixed interview?",
    "Got it! Which technologies or programming languages should the candidate know?",
    "Cool! How many main questions should the interview have? (This is excluding the optional intro and closing questions that we'll handle separately.) You can say something like 3 or 5.",
    "Are you preparing for a specific company or just a general interview?",
    "Thanks! Your interview creation is complete. Good luck and have a great day!"
  ];

  useEffect(() => {
    stepRef.current = step;
  }, [step]);

  // Keep infoRef in sync with info state
  useEffect(() => {
    infoRef.current = info;
  }, [info]);

  useEffect(() => {
    return () => {
      cleanupRecognition();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
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

  const speakQuestion = (index: number) => {
    if (!synth) return;
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setTalking('ai');
    const text = questions[index];
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-GB';
    utterance.rate = 0.9;
    
    utterance.onend = () => {
      if (index < questions.length - 1) {
        setTalking('user');
        setTimeout(() => {
          listen();
        }, 500);
      } else {
        setTalking('none');
        setInterviewStarted(false);
        sendInterviewData(infoRef.current);
      }
    };

    utterance.onerror = (error) => {
      console.error('Speech synthesis error:', error);
      setTalking('none');
    };

    synth.speak(utterance);
    setLastMessage(text);
  };

  const listen = () => {
    if (!SpeechRecognition) return;

    cleanupRecognition();

    try {
      recognitionRef.current = new SpeechRecognition();
      const recognition = recognitionRef.current;
      
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 3;
      recognition.continuous = false;

      setIsListening(true);
      setCanRetry(false);

      recognition.onresult = (event: any) => {
        let transcript = '';
        
        for (let i = 0; i < event.results[0].length; i++) {
          const alternative = event.results[0][i].transcript.trim();
          if (alternative.length > 0) {
            transcript = alternative;
            break;
          }
        }
        
        console.log('Recognized speech:', transcript);
        
        if (transcript && transcript.length > 0) {
          setLastMessage(`You said: "${transcript}"`);
          processAnswer(transcript);
        } else {
          setCanRetry(true);
          setLastMessage("I couldn't understand that clearly. Click 'Try Again' or speak louder.");
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
        if (!canRetry) {
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
    } catch (error) {
      console.error('Error starting recognition:', error);
      setIsListening(false);
      setCanRetry(true);
      setTalking('none');
      setLastMessage("Error starting microphone. Click 'Try Again' to retry.");
    }
  };

  const processAnswer = (transcript: string) => {
    const currentStep = stepRef.current;
    
    cleanupRecognition();
    setCanRetry(false);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Create the updated info object first
    const updatedInfo = { ...infoRef.current };
    switch (currentStep) {
      case 0: updatedInfo.role = transcript; break;
      case 1: updatedInfo.level = transcript; break;
      case 2: updatedInfo.type = transcript; break;
      case 3: updatedInfo.techstack = transcript; break;
      case 4: updatedInfo.amount = transcript; break;
      case 5: updatedInfo.company = transcript; break;
    }
    
    console.log('Updated info:', updatedInfo);
    
    // Update both state and ref
    setInfo(updatedInfo);
    infoRef.current = updatedInfo;

    setTalking('none');

    timeoutRef.current = setTimeout(() => {
      const nextStep = currentStep + 1;
      setStep(nextStep);

      if (nextStep < questions.length) {
        speakQuestion(nextStep);
      }
    }, 1000);
  };

  const retryListening = () => {
    if (interviewStarted && stepRef.current < questions.length - 1) {
      setTalking('user');
      setCanRetry(false);
      setTimeout(() => {
        listen();
      }, 500);
    }
  };

  const sendInterviewData = (finalInfo = infoRef.current) => {
    console.log('Final Interview Data:', finalInfo);
    
    fetch('/api/AI/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(finalInfo),
    })
    .then(res => {
      if (!res.ok) throw new Error("Failed to post");
      console.log("Data posted successfully");
      router.push('/');
    })
    .catch(err => {
      console.error("API POST failed", err);
    });
  };

  const startInterview = async () => {
    if (interviewStarted) return;

    const coins = await supabase.from('users').select('coins').eq('id', localStorage.getItem('userId')).single();
    if (coins.data?.coins <= 0) {
      alert("You don't have enough coins to start the interview.Please recharge and try again.");
      return;
    }else{
      const updatedCoins = coins.data?.coins - 1;
      await supabase.from('users').update({ coins: updatedCoins }).eq('id', localStorage.getItem('userId'));
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
  
        const userId = localStorage.getItem('userId') || '';
        if (!userId) {
          console.error("User ID not found in local storage");
          return;
        }
        
        const initialInfo = { 
          role: '', 
          level: '', 
          type: '', 
          techstack: '', 
          amount: '', 
          company: '',
          userid: userId 
        };
        
        setInfo(initialInfo);
        infoRef.current = initialInfo; 
        
        setInterviewStarted(true);
        setStep(0);
        setLastMessage('');
        setCanRetry(false);
        
        speakQuestion(0);
      } catch (err) {
        console.error("Microphone access denied", err);
        alert("Microphone access is required for the interview. Please allow microphone access and try again.");
      }
    }
  };

  const stopInterview = () => {
    synth?.cancel();
    cleanupRecognition();
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    setTalking('none');
    setInterviewStarted(false);
    setStep(-1);
    setCanRetry(false);
    setLastMessage('Interview stopped.');
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
            {talking === 'ai' && <p className="text-sm text-gray-300 mt-2">Speaking...</p>}
          </div>
          <div className={`bg-gray-700 rounded-xl p-6 flex flex-col items-center justify-center text-center h-100 ${talking === 'user' ? 'border-4 border-white-400' : ''}`}>
            <Image src="/avatar.jpg" alt="User" width={80} height={80} className={`rounded-full ${talking === 'user' ? 'animate-pulse-ring' : ''}`} />
            <h3 className="text-lg font-semibold mt-4">You</h3>
            {isListening && <p className="text-sm text-gray-300 mt-2">Listening...</p>}
          </div>
        </div>
        <div className="bg-gray-700 rounded-lg px-4 py-3 mb-6 h-20 flex items-center justify-center">
          <p className={cn("transition-opacity duration-500 opacity-0", "animate-fadeIn opacity-100")}>
            {lastMessage || 'Welcome to interview creation!!!'}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <button
            onClick={() => showReportModel(true)}
            className="bg-gray-600 text-white px-6 py-2 rounded-full hover:bg-gray-500 text-sm transition"
          >
            🛡️ Report
          </button>
          {interviewStarted ? (
            <>
              <button
                onClick={stopInterview}
                className="bg-red-600 text-white px-6 py-2 rounded-full hover:bg-red-500 transition"
              >
                Stop Interview
              </button>
              {canRetry && (
                <button
                  onClick={retryListening}
                  className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-500 transition animate-pulse"
                >
                  🎤 Try Again
                </button>
              )}
            </>
          ) : (
            <button
              onClick={startInterview}
              className="bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-500 transition"
            >
              Start Interview
            </button>
          )}
        </div>
        {interviewStarted && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-400">
              Step {step + 1} of {questions.length - 1}
            </p>
          </div>
        )}
      </div>
      {report && (
        <div className="fixed inset-0 backdrop-blur-sm bg-opacity-100 z-40 flex items-center justify-center">
          <div className="bg-white w-full max-w-lg p-6 rounded-lg z-50 relative shadow-lg">
            <button onClick={() => showReportModel(false)} className="absolute top-2 right-3 text-xl text-gray-500 hover:text-gray-800">x</button>
            <h2 className="text-xl font-bold text-center text-purple-600 mb-4">Report</h2>
            <form action="/api/report" method="post">
              <label htmlFor="report" className="block text-sm font-medium text-gray-700">Enter your complaint in detail*</label>
              <input type="hidden" name="id" value={localStorage.getItem('userId')||""}/>
              <input type="hidden" name="source" value="create-interview"/>
              <textarea id="report" name="report" required rows={4} className="mt-1 resize-none border text-black p-3 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"></textarea>
              <button type="submit" className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Submit</button>
            </form>
          </div>
        </div>
      )}
    </div>

  );
};

export default CreateInterview;
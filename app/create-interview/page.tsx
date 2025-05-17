'use client'

import React from 'react'
import { useEffect, useState } from 'react'
import Navbar from '../components/navbar'
import Image from 'next/image'
import { supabase } from '@/lib/supabaseClient'
import { cn } from "@/lib/utils";
import { vapi } from "@/lib/vapi.sdk";
import { useRouter } from "next/navigation";

interface SavedMessage {
  role: "user" | "system" | "assistant";
  content: string;
}

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

const CreateInterview = () => {
  const router = useRouter();
  const [talking, setTalking] = useState<'ai' | 'user' | 'none'>('none')
  const [status, setStatus] = useState('Interview Not Started')
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [lastMessage, setLastMessage] = useState<string>("");
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [interviewId, setInterviewId] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
      const onCallStart = () => {
        setCallStatus(CallStatus.ACTIVE);
        setStatus('Interview In Progress')
      };
  
      const onCallEnd = () => {
        setCallStatus(CallStatus.FINISHED);
        setStatus("Interview Not Started");
      };
  
      interface Message {
        type: string;
        transcriptType?: string;
        role: "user" | "system" | "assistant";
        transcript?: string;
      }
  
      const onMessage = (message: Message) => {
        if (message.type === "transcript" && message.transcriptType === "final") {
          if (message.transcript) {
            const newMessage = { role: message.role, content: message.transcript };
            setMessages((prev) => [...prev, newMessage]);
          }
        }
      };
  
      const onSpeechStart = () => {
        console.log("speech start");
        setIsSpeaking(true);
        setTalking('ai')
      };
  
      const onSpeechEnd = () => {
        console.log("speech end");
        setIsSpeaking(false);
        setTalking('user')
      };
  
      const onError = (error: Error) => {
        console.log("Error:", error);
      };
  
      vapi.on("call-start", onCallStart);
      vapi.on("call-end", onCallEnd);
      vapi.on("message", onMessage);
      vapi.on("speech-start", onSpeechStart);
      vapi.on("speech-end", onSpeechEnd);
      vapi.on("error", onError);
  
      return () => {
        vapi.off("call-start", onCallStart);
        vapi.off("call-end", onCallEnd);
        vapi.off("message", onMessage);
        vapi.off("speech-start", onSpeechStart);
        vapi.off("speech-end", onSpeechEnd);
        vapi.off("error", onError);
      };
    }, []);
  
    useEffect(() => {
      if (messages.length > 0) {
        setLastMessage(messages[messages.length - 1].content);
      }
  
      if (callStatus === CallStatus.FINISHED) {
        const type = "generate";
        if (type === "generate") {
          router.push("/");
        }
      }
    }, [messages, callStatus]);
  
    const handleCall = async () => {
      setCallStatus(CallStatus.CONNECTING);
      await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!);
    };

  
    const handleDisconnect = () => {
      setCallStatus(CallStatus.FINISHED); 
      vapi.stop();
    };



  return (
    <>
      <div className="min-h-screen bg-gray-900 text-white align-center justify-center" style={{ backgroundColor: 'rgb(125, 59, 211)' }}>
      <Navbar />
        <div className="max-w-4xl bg-gray-800 rounded-2xl p-8 shadow-lg m-10 mx-auto">
          <div className="flex justify-between items-center mb-6">
            <span className="text-blue-400 font-medium text-lg">Create your Interview by answering the questions</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            <div className={`bg-gray-700 rounded-xl p-6 flex flex-col items-center justify-center text-center h-100 ${talking === 'ai' ? 'border-4 border-white-400 ' : ''}`}>
              <Image 
                src="/logo.webp" 
                alt="AI Interviewer" 
                width={80} 
                height={80} 
                className={`rounded-full ${talking === 'ai' ? 'animate-pulse-ring ' : ''}`} />
              <h3 className="text-lg font-semibold mt-4">Assistant</h3>
            </div>

            <div className={`bg-gray-700 rounded-xl p-6 flex flex-col items-center justify-center text-center  h-100 ${talking === 'user' ? 'border-4 border-white-400 ' : ''}`}>
              <Image
                src={'/avatar.jpg'}
                alt="User"
                width={80}
                height={80}
                className={`rounded-full ${talking === 'user' ? 'animate-pulse-ring' : ''}`}
              />
              <h3 className="text-lg font-semibold mt-4">You</h3>
            </div>
          </div>

          <div className="bg-gray-700 rounded-lg px-4 py-3 mb-6 h-20 flex items-center justify-center">
            {messages.length > 0 && (
              <div className="transcript-border">
                <div className="transcript">
                  <p
                    key={lastMessage}
                    className={cn(
                      "transition-opacity duration-500 opacity-0",
                      "animate-fadeIn opacity-100"
                    )}
                  >
                    {lastMessage}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <button
              onClick={() => alert('Reported')}
              className="bg-gray-600 text-white px-6 py-2 rounded-full hover:bg-gray-500 text-sm transition"
            >
              🛡️ Report
            </button>
            { status === "Interview Not Started" ?
              <button
                onClick={() => { handleCall(); }}
                className="bg-green-600 text-white px-6 py-2 rounded-full text-sm hover:bg-green-500 transition"
              >
                Start Interview Creation
              </button> : <button
                onClick={() => { handleDisconnect(); }}
                className="bg-red-600 text-white px-6 py-2 rounded-full hover:bg-red-500 text-sm transition"
              >
                Leave Interview Creation
              </button>
            }
          </div>
        </div>
      </div>
    </>
  )
}

export default CreateInterview


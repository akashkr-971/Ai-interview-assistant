"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { vapi } from "@/lib/vapi.sdk";

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

interface SavedMessage {
  role: "user" | "system" | "assistant";
  content: string;
}

const Agent = ({
  userName,
  userId,
  interviewId,
  feedbackId,
  type,
  questions,
}: {
  userName: string;
  userId: string;
  interviewId: string | null;
  feedbackId: string | null;
  type: "generate" | "interview";
  questions?: string[];
}) => {
  const router = useRouter();
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastMessage, setLastMessage] = useState<string>("");

  useEffect(() => {
    const onCallStart = () => {
      setCallStatus(CallStatus.ACTIVE);
    };

    const onCallEnd = () => {
      setCallStatus(CallStatus.FINISHED);
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
    };

    const onSpeechEnd = () => {
      console.log("speech end");
      setIsSpeaking(false);
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

    const handleGenerateFeedback = async (messages: SavedMessage[]) => {
      console.log("handleGenerateFeedback");

      const { success, feedbackId: id } = await createFeedback({
        interviewId: interviewId!,
        userId: userId!,
        transcript: messages,
        feedbackId,
      });

      if (success && id) {
        router.push(`/interview/${interviewId}/feedback`);
      } else {
        console.log("Error saving feedback");
        router.push("/");
      }
    };

    if (callStatus === CallStatus.FINISHED) {
      if (type === "generate") {
        router.push("/");
      } else {
        handleGenerateFeedback(messages);
      }
    }
  }, [messages, callStatus, feedbackId, interviewId, router, type, userId]);

  const handleCall = async () => {
    setCallStatus(CallStatus.CONNECTING);

    if (type === "generate") {
      await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, {
        variableValues: {
          username: userName,
          userid: userId,
        },
        clientMessages: [],
        serverMessages: [],
      });
    } else {
      let formattedQuestions = "";
      if (questions) {
        formattedQuestions = questions
          .map((question) => `- ${question}`)
          .join("\n");
      await vapi.start(interviewId!, {
        variableValues: {
          questions: formattedQuestions,
        },
        clientMessages: [],
        serverMessages: [],
      });
      }
    }
  };

  const handleDisconnect = () => {
    setCallStatus(CallStatus.FINISHED); 
    vapi.stop();
  };

    async function submitFeedback(): Promise<void> {
        const feedbackInput = document.querySelector(
            ".feedback-input"
        ) as HTMLTextAreaElement;

        if (!feedbackInput || !feedbackInput.value.trim()) {
            alert("Please provide feedback before submitting.");
            return;
        }

        try {
            const response = await fetch("/api/submit-feedback", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    feedback: feedbackInput.value.trim(),
                    userId,
                    interviewId,
                }),
            });

            if (!response.ok) {
                console.error("Failed to submit feedback:", response.statusText);
                alert("Failed to submit feedback. Please try again.");
                return;
            }

            alert("Feedback submitted successfully!");
            feedbackInput.value = ""; // Clear the input after successful submission
        } catch (error) {
            console.error("Error submitting feedback:", error);
            alert("An error occurred while submitting feedback. Please try again.");
        }
    }

  return (
    <>
      <div className="call-view">
        {/* AI Interviewer Card */}
        <div className="card-interviewer">
          <div className="avatar">
            <Image
              src="/logo.webp"
              alt="profile-image"
              width={65}
              height={54}
              className="object-cover"
            />
            {isSpeaking && <span className="animate-speak" />}
          </div>
          <h3>AI Interviewer</h3>
        </div>

        {/* User Profile Card */}
        <div className="card-border">
          <div className="card-content">
            <Image
              src="/avatar.jpg"
              alt="profile-image"
              width={539}
              height={539}
              className="rounded-full object-cover size-[120px]"
            />
            <h3>{userName}</h3>
          </div>
        </div>
      </div>

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

      <div className="w-full flex justify-center">
        {callStatus !== "ACTIVE" ? (
          <button className="relative btn-call" onClick={() => handleCall()}>
            <span
              className={cn(
                "absolute animate-ping rounded-full opacity-75",
                callStatus !== "CONNECTING" && "hidden"
              )}
            />

            <span className="relative">
              {callStatus === "INACTIVE" || callStatus === "FINISHED"
                ? "Call"
                : ". . ."}
            </span>
          </button>
        ) : (
          <button className="btn-disconnect" onClick={() => handleDisconnect()}>
            End
          </button>
        )}
      </div>
      <div className="feedback-section">
        <h3 className="text-lg font-semibold">Feedback</h3>
        <textarea className="feedback-input" placeholder="Provide your feedback here..."></textarea>
        <button className="submit-feedback" onClick={() => submitFeedback()}>Submit Feedback</button>
      </div>
    </>
  );
};

async function createFeedback({
    interviewId,
    userId,
    transcript,
    feedbackId,
}: {
    interviewId: string;
    userId: string;
    transcript: SavedMessage[];
    feedbackId: string | null;
}): Promise<{ success: boolean; feedbackId: string | null }> {
    try {
        const response = await fetch("/api/feedback", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                interviewId,
                userId,
                transcript,
                feedbackId,
            }),
        });

        if (!response.ok) {
            console.error("Failed to create feedback:", response.statusText);
            return { success: false, feedbackId: null };
        }

        const data = await response.json();
        return { success: true, feedbackId: data.feedbackId || null };
    } catch (error) {
        console.error("Error creating feedback:", error);
        return { success: false, feedbackId: null };
    }
}

export default Agent;


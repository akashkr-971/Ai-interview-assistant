import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { supabase } from "@/lib/supabaseClient";

// Define the Interview interface
interface Interview {
  id: number;
  image: string;
  type: string;
  title: string;
  attended: boolean;
  description: string;
  date: string | null;
  score: string | null;
  user_id: string | null;
}

interface InterviewCardProps {
  filterType: "global" | "createdByUser" | "attended";
}

const InterviewCard: React.FC<InterviewCardProps> = ({ filterType }) => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    console.log(storedUserId);
    setUserId(storedUserId);

    const fetchInterviews = async () => {
      setLoading(true);
      setError(null);
      let query = supabase.from("interviews").select("*");

      if (filterType === "global") {
        query = query.is("id", null);
      } else if (filterType === "createdByUser") {
        if (storedUserId) {
          query = query.eq("created_by", storedUserId);
        } else {
          setError("User not logged in to view created interviews.");
          setLoading(false);
          return;
        }
      } else if (filterType === "attended") {
        if (storedUserId) {
          query = query.contains("attendees",[storedUserId] );
        } else {
          setError("User not logged in to view attended interviews.");
          setLoading(false);
          return;
        }
      }

      query = query.order("created_at", { ascending: false });

      const { data, error: fetchError } = await query;

      if (fetchError) {
        console.error("Error fetching interviews:", fetchError.message);
        setError(fetchError.message);
        setInterviews([]);
      } else if (data) {
        setInterviews(data as Interview[]);
      }
      setLoading(false);
    };

    fetchInterviews();
  }, [filterType, userId]);

  if (loading) {
    return <div className="text-center p-6">Loading interviews...</div>;
  }

  if (error) {
    return <div className="text-center p-6 text-red-600">Error: {error}</div>;
  }

  if (interviews.length === 0) {
    let content;
  
    if (filterType === "createdByUser") {
      content = (
        <>
          <p>You haven't created any interviews yet.</p>
          <p>Click the 'Create Interview' button to get started.</p>
          <button
            onClick={() => (window.location.href = "/create-interview")}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
          >
            Create Interview
          </button>
        </>
      );
    } else if (filterType === "global") {
      content = "No global interviews available.";
    } else if (filterType === "attended") {
      content = "You haven't attended any interviews yet.";
    } else {
      content = "No interviews found.";
    }
  
    return <div className="text-center p-6 text-gray-500">{content}</div>;
  }
  

  return (
    <div className="bg-white grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6 rounded-lg shadow-md">
      {interviews.map((interview) => (
        <div key={interview.id} className="bg-gradient-to-r from-[rgba(26,28,32,1)] to-[#08090D] text-white p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="relative">
            <span className="absolute -top-4 -right-4 bg-gray-200 text-gray-700 text-xs font-semibold px-2 py-1 rounded">
              {interview.type}
            </span>
          </div>

          <Image src={interview.image} alt="Interview Image" width={72} height={72} className="rounded-full mb-3" />
          <h3 className="text-xl font-bold">{interview.title}</h3>
          <p className="text-gray-400 font-semibold">{interview.description}</p>
          
          <div className="flex flex-row items-center font-semibold justify-between mt-4 text-sm text-gray-400">
            <div className="flex items-center gap-1 ">
              <Image src="/calendar.svg" width="20" height="20" alt="Calendar" />
              <span>{interview.date || "N/A"}</span>
            </div>
            <div className="flex items-center gap-1">
              <Image src="/star.svg" width="20" height="20" alt="Score" />
              <span>{interview.score || "N/A"}</span>
            </div>
          </div>

          <div className="flex items-center gap-6 mt-4">
            <div className="flex items-center relative">
              <Image
                src="/Technology-cover/react.svg"
                className="rounded-full bg-gray-200 p-1 w-[30px] h-[30px] z-10"
                width={30}
                height={30}
                alt="React"
              />
              <Image
                src="/Technology-cover/tailwind.svg"
                className="rounded-full bg-gray-200 p-1 w-[30px] h-[30px] -ml-2 z-20"
                width={30}
                height={30}
                alt="Tailwind"
              />
            </div>
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full">
              View Interview
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default InterviewCard;
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { supabase } from "@/lib/supabaseClient";

// Updated Interview interface to match your actual data structure
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


const InterviewCard: React.FC = () => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    console.log("Stored User ID:", storedUserId);
    setUserId(storedUserId);

    const fetchInterviews = async () => {
      setLoading(true);
      setError(null);
      let query = supabase.from("interviews").select("*").eq("created_by", storedUserId).limit(4);

      query = query.order("created_at", { ascending: false });

      const { data, error: fetchError } = await query;

      console.log("Fetched interviews:", data);

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
  }, [userId]);

  if (loading) {
    return <div className="text-center p-6">Loading interviews...</div>;
  }

  if (error) {
    return <div className="text-center p-6 text-red-600">Error: {error}</div>;
  }

  if (interviews.length === 0) {
    const content = (
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
    <div className="bg-white grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 p-6">
      {interviews.map((interview) => {
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
                <span>{created_date}</span>
              </div>
              <div className="flex items-center gap-1">
                <Image src="/star.svg" width="20" height="20" alt="Score" />
                <span>New</span>
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

            {/* Action Button */}
            <button 
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full mt-4"
              onClick={() => {
                console.log('View interview:', interview);
                window.location.href = `/attend-interview/${interview.id}`;
              }}
            >
              Start Interview
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default InterviewCard;
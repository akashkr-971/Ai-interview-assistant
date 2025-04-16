import React from 'react'
import Image from 'next/image'

interface Interview {
    id: number;
    image: string;
    type: string;
    title: string;
    attended: boolean;
    description: string;
    date: string | null;
    score: string | null;
}

const Interviews: Interview[] = [
    {
        id: 1,
        image: "/company-covers/amazon.png",
        type: "Technical",
        title: "Amazon",
        description: "Interview Description 1",
        attended: true,
        date: null,
        score: "5/100"
    },
    {
        id: 2,
        image: "/company-covers/facebook.png",
        type: "Behavioural",
        title: "Facebook",
        description: "Interview Description 2",
        attended: false,    
        date: "2023-10-05",
        score: "75/100"
    },
    {
        id: 3,
        image: "/company-covers/quora.png",
        type: "Behavioural",
        title: "Quora",
        description: "Interview Description 3",
        attended: false,
        date: "2023-10-10",
        score: "90/100"
    },
    {
        id: 4,
        image: "/company-covers/telegram.png",
        type: "Technical",
        title: "Telegram",
        description: "Interview Description 4",
        attended: true,
        date: "2023-10-15",
        score: "95/100"
    }
];

const InterviewCard = () => {
  return (
    <div className="bg-white grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6 rounded-lg shadow-md">
        {Interviews.map((interview) => (
            <div key={interview.id} className="bg-gradient-to-r from-rgba(26, 28, 32, 1) to#08090D p-4 border rounded-lg shadow-sm bg-gray-50 hover:shadow-md transition-shadow duration-200">
                
                {/* interview type */}

                <div className="relative">
                    <span className="absolute -top-4 -right-4 bg-gray-200 text-gray-700 text-xs font-semibold px-2 py-1 rounded">
                        {interview.type}
                    </span>
                </div>

                {/* interview Image and Title */}

                <Image src={interview.image} alt="Interview Image" width={72} height={72} className="rounded-full mb-3" />
                <h3 className="text-xl font-bold">{interview.title}</h3>
                <p className="text-gray-600 font-semibold">{interview.description}</p>
                
                {/* interview Date */}
                <div className="flex flex-row items-center font-semibold justify-between mt-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1 ">
                        <Image src="/calendar.svg" width="20" height="20" alt="Calendar" />
                        <span>{interview.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Image src="/star.svg" width="20" height="20" alt="Score" />
                        <span>{interview.score}</span>
                    </div>
                </div>


                {/* interview Action */}

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
  )
}

export default InterviewCard

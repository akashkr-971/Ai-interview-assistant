import React from 'react';
import { User } from "lucide-react";

interface TestimonialCardProps {
  item: {
    id: number;
    testimonial: string;
    rating: number;
    user_id: {
      name: string;
    } | null;
  };
  className?: string;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ item, className }) => {
  return (
    <div className={`bg-white/90 backdrop-blur-lg p-4 md:p-6 rounded-xl shadow-lg border border-gray-100/50 hover:shadow-xl transition-shadow duration-300 group ${className || ''}`}>
      <div className="flex items-start gap-3 md:gap-4">
        <div className="flex-shrink-0 p-2 md:p-3 bg-purple-100 rounded-lg">
          <User className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
        </div>
        <div className="flex-grow" onClick={() => console.log(`Testimonial ID: ${item.rating}`)}> 
          <p className="text-base md:text-lg text-gray-800 leading-relaxed">
            &quot;{item.testimonial}&quot;
          </p>
          <div className="flex items-center mb-2">
            {[...Array(5)].map((_, index) => (
              <svg
                key={index}
                className={`w-5 h-5 md:w-5 md:h-5 ${index < item.rating ? 'text-yellow-500' : 'text-gray-300'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.38-2.454a1 1 0 00-1.175 0l-3.38 2.454c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z" />
              </svg>
            ))}
          </div>  
          <footer className="text-sm md:text-base font-medium text-purple-700">
            {item.user_id?.name || "Anonymous User"}
          </footer>
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard;
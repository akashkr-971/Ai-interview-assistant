import React from 'react';
import { User } from "lucide-react";

interface TestimonialCardProps {
  item: {
    id: number;
    testimonial: string;
    user_id: {
      name: string;
    } | null;
  };
  className?: string;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ item, className }) => {
 return (
    <div className={`bg-white/90 mr-50 backdrop-blur-lg p-4 md:p-6 rounded-xl shadow-lg border border-gray-100/50 hover:shadow-xl transition-shadow duration-300 group ${className || ''}`}>
      <div className="flex items-start gap-3 md:gap-4">
        <div className="flex-shrink-0 p-2 md:p-3 bg-purple-100 rounded-lg">
          <User className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
        </div>
        <div>
          <p className="text-base md:text-lg text-gray-800 mb-2 md:mb-3 leading-relaxed">
            &quot;{item.testimonial}&quot;
          </p>
          <footer className="text-sm md:text-base font-medium text-purple-700">
            {item.user_id?.name || "Anonymous User"}
          </footer>
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard;
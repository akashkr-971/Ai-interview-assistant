import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Bot, User } from "lucide-react";
import TestimonialCard from "./testimonialcard";
import Marquee from "react-fast-marquee"; // Import the Marquee component

export type TestimonialType = {
  id: number;
  testimonial: string;
  user_id: {
    name: string;
  } | null;
};

export default function Testimonial() {
  const [testimonial, setTestimonial] = useState("");
  const [testimonials, setTestimonials] = useState<TestimonialType[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [charactersLeft, setCharactersLeft] = useState(500);

  // Fetch user ID and testimonials on mount
  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    setUserId(storedUserId); // Set userId state
    fetchTestimonials();
  }, []);

  // Update characters left as testimonial changes
  useEffect(() => {
    setCharactersLeft(500 - testimonial.length);
  }, [testimonial]);

  const fetchTestimonials = async () => {
    try {
      const { data, error } = await supabase
        .from("testimonials")
        .select(`
          id,
          testimonial,
          user_id (
            name
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data) {
        const formattedData = data.map(item => ({
          id: item.id,
          testimonial: item.testimonial,
          user_id: Array.isArray(item.user_id)
            ? item.user_id[0]
            : item.user_id
        })).filter(item => item.user_id !== null);

        setTestimonials(formattedData as TestimonialType[]);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error loading testimonials");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!testimonial.trim()) {
      setError("Please enter a testimonial");
      return;
    }

    if (testimonial.length > 500) {
      setError("Testimonial exceeds maximum length of 500 characters");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null); // Clear previous success message

    try {
      const { error: submitError } = await supabase
        .from("testimonials")
        .insert([{ user_id: userId, testimonial }]);

      if (submitError) throw submitError;

      setTestimonial("");
      setSuccess("Your testimonial has been posted successfully!");
      fetchTestimonials(); // Refresh testimonials after submission
    } catch (err) {
      if (err instanceof Error) {
        setError(`Error posting testimonial: ${err.message}`);
      } else {
        setError("Error posting testimonial");
      }
    } finally {
      setIsSubmitting(false);

      // Clear success message after a delay
      if (success) {
         setTimeout(() => setSuccess(null), 3000);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-15">
        <div className="absolute w-96 h-96 bg-blue-200 rounded-full blur-3xl -top-48 -left-48 animate-pulse-slow" />
        <div className="absolute w-96 h-96 bg-purple-200 rounded-full blur-3xl -bottom-48 -right-48 animate-pulse-slow delay-1000" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
          AI Interview Assistant Feedback
        </h1>

        {/* Conditional Rendering of the Form Section */}
        {userId ? (
          <section className="mb-12 bg-white/90 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-gray-100/50">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800 flex items-center gap-2">
              <Bot className="w-8 h-8 text-purple-600" />
              Share Your AI Interview Experience
            </h2>

            {/* Form Section */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <textarea
                  id="testimonial-input"
                  value={testimonial}
                  onChange={(e) => setTestimonial(e.target.value)}
                  placeholder="How did our AI assistant help with your interview preparation?..."
                  className="w-full p-4 text-lg border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 bg-white/80 backdrop-blur-sm transition-all duration-300 resize-none placeholder-gray-400"
                  rows={4}
                  maxLength={500}
                />
                <div className="absolute bottom-4 right-2 bg-purple-100 px-2 py-1 rounded-full text-sm text-purple-700">
                  {charactersLeft}/500
                </div>
              </div>

              {error && (
                <p className="text-red-600 text-sm">{error}</p>
              )}
               {success && (
                <p className="text-green-600 text-sm">{success}</p>
              )}

              <button
                type="submit"
                className={`w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 transform shadow-lg ${
                   !userId || isSubmitting || testimonial.length === 0
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:from-purple-700 hover:to-blue-700 hover:scale-[1.02] hover:shadow-xl"
                } flex items-center justify-center gap-2`}
                disabled={!userId || isSubmitting || testimonial.length === 0}
              >
                {isSubmitting ? (
                  <div className="h-5 w-5 border-2 border-white/50 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Bot className="w-5 h-5" />
                )}
                {isSubmitting ? "Processing..." : "Share Feedback"}
              </button>
            </form>
          </section>
        ) : (
          // Message displayed if user is not logged in
          <section className="mb-12 bg-white/90 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-gray-100/50 text-center">
             <h2 className="text-2xl font-semibold mb-4 text-gray-800 flex items-center justify-center gap-2">
               <User className="w-8 h-8 text-blue-600" />
               Join the Conversation!
             </h2>
            <p className="text-gray-600 text-lg">
              Log in to share your experience with the AI Interview Assistant and help others!
            </p>
            {/* Optionally add a login button or link here */}
             {/* <Link href="/login" className="mt-4 inline-block bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors">
               Log In
             </Link> */}
          </section>
        )}
      </div>

      {/* Testimonials Section (always visible) */}
      <section className="py-12">
        <h2 className="text-2xl font-semibold text-gray-800 text-center mb-8">
           What Our Users Say
        </h2>
        {testimonials.length > 0 ? (
          <Marquee gradient={true} speed={50} pauseOnHover={true}> 
            {testimonials.map((item, index) => (
               <div key={`${item.id}-${index}`} className="mx-4 w-full max-w-sm flex-none"> {/* Added back mx-4 for spacing between cards */}
                <TestimonialCard
                  item={item}
                  className="w-full" 
                />
              </div>
            ))}
          </Marquee>
        ) : (
          <div className="text-center py-16 bg-gray-100/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200">
            <p className="text-gray-600 text-xl italic">
              No testimonials yet. Be the first to share your AI interview experience! <span className="text-2xl">🤖✨</span>
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
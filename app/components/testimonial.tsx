import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Bot, User } from "lucide-react";
import TestimonialCard from "./testimonialcard";
import Marquee from "react-fast-marquee";

export type TestimonialType = {
  id: number;
  testimonial: string;
  rating: number;
  created_at?: string;
  user_id: {
    name: string;
  } | null;
};

export default function Testimonial() {
  const [testimonial, setTestimonial] = useState("");
  const [testimonials, setTestimonials] = useState<TestimonialType[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [submissionSuccess, setSubmissionSuccess] = useState<string | null>(null);
  const [displayError, setDisplayError] = useState<string | null>(null);
  const [charactersLeft, setCharactersLeft] = useState(500);
  const [rating, setRating] = useState<number>(0);

  // Effect to get userId from localStorage on mount
  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    setUserId(storedUserId);
  }, []);

  // Effect to update characters left for testimonial input
  useEffect(() => {
    setCharactersLeft(500 - testimonial.length);
  }, [testimonial]);

  // Callback to fetch testimonials, memoized to prevent unnecessary re-creations
  const fetchTestimonials = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from("testimonials")
        .select(`
          id,
          testimonial,
          rating,
          created_at,
          user_id (
            name
          )
        `)
        .order("created_at", { ascending: false });

        console.log(data);

      if (fetchError) {
        throw fetchError;
      }

      if (data) {
        const formattedData = data.map(item => ({
          id: item.id,
          testimonial: item.testimonial,
          rating: item.rating,
          created_at: item.created_at,
          user_id: Array.isArray(item.user_id) && item.user_id.length > 0
            ? item.user_id[0]
            : item.user_id
        })).filter(item => item.user_id !== null);

        setTestimonials(formattedData as TestimonialType[]);
      }
    } catch (err) {
      setDisplayError(err instanceof Error ? err.message : "Error loading testimonials");
      setTestimonials([]);
    }
  }, []);

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!testimonial.trim()) {
      setSubmissionError("Please enter a testimonial.");
      return;
    }

    if (testimonial.length > 500) {
      setSubmissionError("Testimonial exceeds maximum length of 500 characters.");
      return;
    }

    if (rating < 1 || rating > 5) {
      setSubmissionError("Please provide a rating between 1 and 5 stars.");
      return;
    }

    setSubmissionError(null);
    setSubmissionSuccess(null);
    setIsSubmitting(true);

    try {
      const { error: submitError } = await supabase
        .from("testimonials")
        .insert([{ user_id: userId, testimonial ,rating }]);

      if (submitError) {
        throw submitError;
      }

      setTestimonial("");
      setRating(0);
      setSubmissionSuccess("Your testimonial has been posted successfully!");
      fetchTestimonials();
    } catch (err) {
      if (err instanceof Error) {
        setSubmissionError(`Error posting testimonial: ${err.message}`);
      } else {
        setSubmissionError("An unknown error occurred while posting testimonial.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (submissionSuccess) {
      const timer = setTimeout(() => {
        setSubmissionSuccess(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [submissionSuccess]);

  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-200  relative overflow-hidden flex flex-col">
      <div className="absolute inset-0 opacity-15">
        <div className="absolute w-96 h-96 bg-blue-200 rounded-full blur-3xl -top-48 -left-48 animate-pulse-slow" />
        <div className="absolute w-96 h-96 bg-purple-200 rounded-full blur-3xl -bottom-48 -right-48 animate-pulse-slow delay-1000" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 py-8 w-full flex-shrink-0">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
          AI Interview Assistant Feedback
        </h1>

        {userId ? (
          <section className="mb-8 bg-white/90 backdrop-blur-lg rounded-2xl p-6 md:p-8 shadow-xl border border-gray-100/50">
            <h2 className="text-2xl font-semibold mb-8 text-gray-800 flex items-center gap-2">
              <Bot className="w-14 h-14 text-purple-600 " />
              How did our AI assistant enhance your interview preparation? <br />
              Share your insights and help us improve!
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <textarea
                  id="testimonial-input"
                  value={testimonial}
                  onChange={(e) => setTestimonial(e.target.value)}
                  placeholder="How did our AI assistant help with your interview preparation?..."
                  className="w-full p-3 text-base border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 bg-white/80 backdrop-blur-sm transition-all duration-300 resize-none placeholder-gray-400"
                  rows={3}
                  maxLength={500}
                ></textarea>
                <div className="absolute bottom-14 right-2 bg-purple-100 px-2 py-1 rounded-full text-xs text-purple-700">
                  {charactersLeft}/500
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-gray-700">Rating:</span>
                  {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="focus:outline-none"
                    onClick={() => setRating(star)}
                    aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                  >
                    <svg
                    className={`w-6 h-6 ${
                      rating >= star ? "text-yellow-400" : "text-gray-300"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.38-2.454a1 1 0 00-1.175 0l-3.38 2.454c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z" />
                    </svg>
                  </button>
                  ))}
                  <button className="rounded ml-10 bg-gray-300 px-2 py-1 cursor-pointer hover:bg-gray-200"  onClick={() => setRating(0)}>Clear Rating</button>
                </div>
              </div>

              {submissionError && <p className="text-red-600 text-sm">{submissionError}</p>}
              {submissionSuccess && <p className="text-green-600 text-sm">{submissionSuccess}</p>}

              <button
                type="submit"
                className={`w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-2.5 px-6 rounded-lg transition-all duration-300 transform shadow-md ${
                  !userId || isSubmitting || testimonial.length === 0 || rating < 1
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:from-purple-700 hover:to-blue-700 hover:scale-[1.01] hover:shadow-lg"
                } flex items-center justify-center gap-2 text-base`}
                disabled={!userId || isSubmitting || testimonial.length === 0}
              >
                {isSubmitting ? (
                  <div className="h-4 w-4 border-2 border-white/50 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Bot className="w-4 h-4" />
                )}
                {isSubmitting ? "Processing..." : "Share Feedback"}
              </button>
            </form>
          </section>
        ) : (
          <section className="mb-8 bg-white/90 backdrop-blur-lg rounded-2xl p-6 md:p-8 shadow-xl border border-gray-100/50 text-center">
            <h2 className="text-xl font-semibold mb-3 text-gray-800 flex items-center justify-center gap-2">
              <User className="w-7 h-7 text-blue-600" />
              Join the Conversation!
            </h2>
            <p className="text-gray-600 text-base">
              Log in to share your experience with the AI Interview Assistant.
            </p>
          </section>
        )}
      </div>

      <section className="py-8 flex-grow ">
        <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">
          What Our Users Say
        </h2>
        {testimonials.length > 0 ? (
          <Marquee speed={50} pauseOnHover={true} className="">
            {testimonials.map((item, index) => (
              <div key={`${item.id}-${index}`} className="mx-3 p-2 min-w-[280px] max-w-[380px] flex-none">
                <TestimonialCard
                  item={{
                    ...item,
                    created_at: item.created_at ?? ""
                  }}
                  className="h-full"
                />
              </div>
            ))}
          </Marquee>
        ) : (
          <div className="text-center py-10 bg-gray-100/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 mx-auto max-w-2xl">
            <p className="text-gray-600 text-lg italic">
              No testimonials yet. Be the first to share your AI interview experience! <span className="text-xl">🤖✨</span>
            </p>
            {displayError && <p className="text-red-500 text-sm mt-2">{displayError}</p>}
          </div>
        )}
      </section>
    </div>
  );
}
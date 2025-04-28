import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Testimonial() {
  const [testimonial, setTestimonial] = useState("");
  const [testimonials, setTestimonials] = useState<{ id: number; testimonial: string; user: { name: string } }[]>([]);
  
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    setUserId(storedUserId);
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) console.error("Error fetching testimonials:", error);
    else setTestimonials(data);
  };

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!testimonial) return;

    const userId = localStorage.getItem("userId");
    if (!userId) {
        console.error("User ID is not available in local storage.");
        return;
    }

    const { error } = await supabase
        .from("testimonials")
        .insert([{ user_id: userId, testimonial }]);

    
    if (error) console.error("Error posting testimonial:", error);
    else {
        setTestimonial("");
        fetchTestimonials();
    }
};

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white">
      <h1 className="text-3xl font-bold mb-4">Testimonials</h1>
      <form onSubmit={handleSubmit} className="mb-8">
        <textarea
          value={testimonial}
          onChange={(e) => setTestimonial(e.target.value)}
          placeholder="Write your testimonial here..."
          className="w-full p-4 text-lg border-2 border-gray-300 rounded-md"
        />
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md mt-4"
          disabled={!userId}
        >
          Post Testimonial
        </button>
      </form>
      {testimonials.map((testimonial) => (
        <div key={testimonial.id} className="mb-4 p-4 border-2 border-gray-300 rounded-md">
          <p>{testimonial.testimonial}</p>
          <p className="text-sm text-gray-500">
            - {testimonial.user.name}
          </p>
        </div>
      ))}
    </div>
  );
}


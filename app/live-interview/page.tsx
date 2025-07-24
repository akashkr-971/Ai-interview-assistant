'use client';

import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import Navbar from "../components/navbar";
import Footer from "../components/footer";

type Interviewer = {
    id: number;
    user_id: string;
    bio: string | null;
    experience_level: string | null;
    specialization: string[] | null;
    rating: number | null;
    interview_count: number | null;
    preferred_language: string | null;
    is_available: boolean | null;
    is_verified: boolean | null;
    price_per_session: number | null;
    name?: string;
    email?: string;
};

type Booking = {
    id: number;
    user_id: string;
    interviewer_id: string;
    date: string;
    time: string;
    status: string;
    created_at: string;
    name?: string;
    email?: string;
    interviewer_email?: string;
    interviewer_name?: string;
};

export default function LiveInterviewPage() {
    const [interviewers, setInterviewers] = useState<Interviewer[]>([]);
    const [selectedInterviewer, setSelectedInterviewer] = useState<Interviewer | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [scheduledInterviews, setScheduledInterviews] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchInterviewers = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from("interviewers")
                .select("*, users(name, email)")
                .eq("is_available", true)
                .eq("is_verified", true);
            if (error) {
                console.error("Error fetching interviewers:", error);
            } else {
                setInterviewers(
                    (data || []).map((item: any) => ({
                        ...item,
                        name: item.users?.name || "Unknown",
                        email: item.users?.email || ""
                    }))
                );
            }
            setLoading(false);
        };
        fetchInterviewers();
    }, []);

    useEffect(() => {
        const fetchBookings = async () => {
            const user_id = localStorage.getItem("userId") || "";
            if (!user_id) return;

            const { data, error } = await supabase
                .from("bookings")
                .select(`
                    *,
                    interviewers (
                        id,
                        users (
                            name,
                            email
                        )
                    )
                `)
                .eq("user_id", user_id);

            if (error) {
                console.error("Error fetching bookings:", error);
            } else {
                setScheduledInterviews(
                    (data || []).map((item: any) => ({
                        ...item,
                        interviewer_name: item.interviewers?.users?.name || "Unknown",
                        interviewer_email: item.interviewers?.users?.email || "Unknown",
                    }))
                );
            }
        };

        fetchBookings();
    }, []);


    const filteredInterviewers = interviewers.filter(interviewer =>
        (interviewer.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (interviewer.specialization || []).join(", ").toLowerCase().includes(searchTerm.toLowerCase())
    );

    const today = new Date().toISOString().split("T")[0];
    const currentHour = new Date().getHours();
    const currentMinute = new Date().getMinutes();

    interface InterviewFormElements extends HTMLFormControlsCollection {
        name: HTMLInputElement;
        email: HTMLInputElement;
        date: HTMLInputElement;
        time: HTMLInputElement;
    }
    interface InterviewForm extends HTMLFormElement {
        readonly elements: InterviewFormElements;
    }

    const handleInterviewSubmit = async (e: React.FormEvent<InterviewForm>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const interviewDate = formData.get("date") as string;
        const interviewTime = formData.get("time") as string;
        const name = formData.get("name") as string;
        const email = formData.get("email") as string;

        // Validate name
        if (!name || name.trim().length < 2) {
            alert("Please enter a valid name (at least 2 characters).");
            return;
        }
        // Validate email
        const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
        if (!email || !emailRegex.test(email)) {
            alert("Please enter a valid email address.");
            return;
        }
        // Validate date
        if (!interviewDate || interviewDate < today) {
            alert("Cannot select a past date.");
            return;
        }
        // Validate time
        if (!interviewTime) {
            alert("Please select a valid interview time.");
            return;
        }
        const [hours, minutes] = interviewTime.split(":").map(Number);
        if (isNaN(hours) || isNaN(minutes) || hours < 9 || hours > 21) {
            alert("Interview time must be between 09:00 and 21:00.");
            return;
        }

        const user_id = localStorage.getItem("userId") || "";
        if (!user_id) {
            alert("User not logged in.");
            return;
        }
        const interviewer_id = selectedInterviewer?.user_id ?? "";
        const interviewPrice = selectedInterviewer?.price_per_session ?? 0;
        const { data, error } = await supabase
            .from("bookings")
            .insert([
                {
                    user_id,
                    interviewer_id,
                    date: interviewDate,
                    time: interviewTime,
                    status: "Scheduled",
                    price:interviewPrice,
                    name,
                    email
                }
            ])
            .select();
        if (error) {
            alert("Error scheduling interview: " + error.message);
        } else {
            setScheduledInterviews([
                ...scheduledInterviews,
                {
                    ...data[0],
                    interviewer_email: selectedInterviewer?.email ?? "Unknown"
                }
            ]);
            setSelectedInterviewer(null);
            const coins  = interviewPrice / 10; // Assuming 1 coin = ₹10
            const { data: userData } = await supabase
                .from("users")
                .select("coins")
                .eq("id", user_id)
                .single();
            if(userData){
                const updatedCoins = (userData.coins || 0) - coins;
                const { error: coinError } = await supabase
                .from("users")
                .update({ coins: updatedCoins })
                .eq("user_id", user_id);
                if (coinError) {
                    console.error("Error updating coins:", coinError);
                }
            }
            const {data:interviewerdata} = await supabase
                .from("interviewers")
                .select("wallet")
                .eq("user_id", interviewer_id)
                .single();
            if(interviewerdata){
                const updatedWallet = (interviewerdata.wallet || 0) + interviewPrice;
                const { error: walletError } = await supabase
                    .from("interviewers")
                    .update({ wallet: updatedWallet })
                    .eq("user_id", interviewer_id);
                if (walletError) {
                    console.error("Error updating interviewer's wallet:", walletError);
                }
            }
            alert("Interview successfully scheduled!");
            window.location.reload();
        }
    };

    // ...existing code...
    // Only show active bookings in main section
    const activeBookings = scheduledInterviews.filter(b => b.status === 'Scheduled' || b.status === 'Accepted');

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Navbar />
            <main className="flex-1 py-12 px-4 max-w-6xl mx-auto">
                <h1 className="text-4xl font-bold text-center text-gray-800 mb-12">Live Interview Portal</h1>

                <section className="mb-16">
                    <h2 className="text-2xl font-semibold mb-4 text-blue-700">Search & Select Interviewer</h2>
                    <input
                        type="text"
                        placeholder="Search by name or expertise..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full mb-6 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />

                    {loading ? (
                        <p className="text-gray-500">Loading interviewers...</p>
                    ) : filteredInterviewers.length === 0 ? (
                        <p className="text-red-500">No interviewers found matching your search.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {filteredInterviewers.map((interviewer) => (
                                <div
                                    key={interviewer.id}
                                    onClick={() => setSelectedInterviewer(interviewer)}
                                    className={`cursor-pointer bg-white p-6 rounded-xl shadow-md border border-gray-200 transition-transform transform hover:scale-105 ${selectedInterviewer?.id === interviewer.id ? 'ring-2 ring-blue-500' : ''}`}
                                >
                                    <h3 className="text-xl font-semibold text-gray-800 mb-1">{interviewer.name}</h3>
                                    <p className="text-sm text-gray-600 mb-1">Specialization: {(interviewer.specialization || []).join(", ")}</p>
                                    <p className="text-sm text-gray-600 mb-1">Experience: {interviewer.experience_level}</p>
                                    <p className="text-sm text-gray-600 mb-1">Rating: {interviewer.rating ?? 0}</p>
                                    <p className="text-sm text-gray-600 mb-1">Language: {interviewer.preferred_language}</p>
                                    <p className="text-sm text-gray-600 mb-1">Price: ₹{interviewer.price_per_session ?? 0}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {selectedInterviewer && (
                        <div className="mt-10 bg-white p-6 rounded-xl shadow-md border border-gray-200">
                            <h4 className="text-lg font-semibold mb-4 text-blue-700">Schedule Interview with {selectedInterviewer.name}</h4>
                            <form className="flex flex-col gap-4" onSubmit={handleInterviewSubmit}>
                                <input
                                    name="name"
                                    type="text"
                                    placeholder="Your Name"
                                    className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
                                    required
                                />
                                <input
                                    name="email"
                                    type="email"
                                    placeholder="Your Email"
                                    className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
                                    required
                                />
                                <div className="relative">
                                    <input
                                        name="date"
                                        type="date"
                                        className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-300"
                                        required
                                        onClick={() => {
                                            const input = document.querySelector('input[type="date"]') as HTMLInputElement;
                                            input.showPicker();
                                        }}
                                        defaultValue={today}
                                        min={today}
                                    />
                                </div>
                                <div className="relative">
                                    <input
                                        name="time"
                                        type="time"
                                        className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-300"
                                        required
                                        defaultValue={`${currentHour}:${currentMinute < 10 ? '0' + currentMinute : currentMinute}`}
                                        onClick={() => {
                                            const input = document.querySelector('input[type="time"]') as HTMLInputElement;
                                            input.showPicker();
                                        }}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition"
                                >
                                    Confirm Interview
                                </button>
                            </form>
                        </div>
                    )}
                </section>

                <section className="mt-16">
                    <h2 className="text-2xl font-semibold mb-4 text-blue-700">Active Bookings</h2>
                    {activeBookings.length === 0 ? (
                        <p className="text-gray-500">No active bookings. Select an interviewer and schedule one.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {activeBookings.map((interview) => (
                                <div key={interview.id} className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-1">Interviewer Name: {interview.interviewer_name}</h3>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-1">Interviewer Email: {interview.interviewer_email}</h3>
                                    <p className="text-sm text-gray-600 mb-1">Your Name: {interview.name ?? "-"}</p>
                                    <p className="text-sm text-gray-600 mb-1">Your Email: {interview.email ?? "-"}</p>
                                    <p className="text-sm text-gray-600 mb-1">Date: {interview.date}</p>
                                    <p className="text-sm text-gray-600 mb-1">Time: {interview.time}</p>
                                    <p className="text-sm font-medium text-green-600">Status: {interview.status}</p>
                                    <div className="flex flex-wrap gap-3 mt-4">
                                        <button
                                            className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 border border-red-300 rounded-lg hover:bg-red-200 transition"
                                            onClick={async () => {
                                                if (window.confirm("Are you sure you want to cancel this interview?")) {
                                                    const { error } = await supabase
                                                        .from("bookings")
                                                        .delete()
                                                        .eq("id", interview.id);
                                                    if (error) {
                                                        alert("Error cancelling interview: " + error.message);
                                                    } else {
                                                        setScheduledInterviews(scheduledInterviews.filter((item) => item.id !== interview.id));
                                                    }
                                                }
                                            }}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                            Cancel
                                        </button>
                                        <button
                                            className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 border border-blue-300 rounded-lg hover:bg-blue-200 transition"
                                            onClick={async () => {
                                                const rescheduleDate = prompt("Enter new date (YYYY-MM-DD):", interview.date);
                                                const rescheduleTime = prompt("Enter new time (HH:MM):", interview.time);
                                                if (rescheduleDate && rescheduleTime) {
                                                    const { error } = await supabase
                                                        .from("bookings")
                                                        .update({ date: rescheduleDate, time: rescheduleTime, status: "Rescheduled" })
                                                        .eq("id", interview.id);
                                                    if (error) {
                                                        alert("Error rescheduling interview: " + error.message);
                                                    } else {
                                                        setScheduledInterviews(scheduledInterviews.map((item) =>
                                                            item.id === interview.id
                                                                ? { ...item, date: rescheduleDate, time: rescheduleTime, status: "Rescheduled" }
                                                                : item
                                                        ));
                                                    }
                                                }
                                            }}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            Reschedule
                                        </button>
                                        {today === interview.date &&
                                            `${currentHour}:${currentMinute < 10 ? '0' + currentMinute : currentMinute}` === interview.time && (
                                            <button
                                                className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 border border-green-300 rounded-lg hover:bg-green-200 transition"
                                                onClick={() => alert("Joining interview...")}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-6.518-3.773A1 1 0 007 8.118v7.764a1 1 0 001.234.97l6.518-1.857A1 1 0 0016 13.118v-2.236a1 1 0 00-1.248-.714z" />
                                                </svg>
                                                Join Now
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <section className="mt-16">
                    <h2 className="text-2xl font-semibold mb-4 text-blue-700">Booking History</h2>
                    {scheduledInterviews.length === 0 ? (
                        <p className="text-gray-500">No bookings found.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {scheduledInterviews.map((interview) => (
                                <div key={interview.id} className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-1">Interviewer Name: {interview.interviewer_name}</h3>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-1">Interviewer Email: {interview.interviewer_email}</h3>
                                    <p className="text-sm text-gray-600 mb-1">Your Name: {interview.name ?? "-"}</p>
                                    <p className="text-sm text-gray-600 mb-1">Your Email: {interview.email ?? "-"}</p>
                                    <p className="text-sm text-gray-600 mb-1">Date: {interview.date}</p>
                                    <p className="text-sm text-gray-600 mb-1">Time: {interview.time}</p>
                                    <p className={`text-sm font-medium ${interview.status === 'Accepted' ? 'text-green-600' : interview.status === 'Cancelled' ? 'text-red-600' : 'text-yellow-600'}`}>Status: {interview.status}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>
            <Footer />
        </div>
    );
}
'use client';

import React, { useState } from "react";
import Navbar from "../components/navbar";
import Footer from "../components/footer";

type Interview = {
    name: string;
    email: string;
    interviewer: string;
    date: string;
    time: string;
    status: string;
};

export default function LiveInterviewPage() {
    const [selectedInterviewer, setSelectedInterviewer] = useState<null | typeof interviewers[0]>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [scheduledInterviews, setScheduledInterviews] = useState<Interview[]>([]);

    const interviewers = [
        { id: 1, name: "John Doe", expertise: "Software Engineering", experience: "5 years"},
        { id: 2, name: "Jane Smith", expertise: "Data Science", experience: "4 years"},
        { id: 3, name: "Alice Johnson", expertise: "Product Management", experience: "6 years"},
    ];

    const filteredInterviewers = interviewers.filter(interviewer =>
        interviewer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        interviewer.expertise.toLowerCase().includes(searchTerm.toLowerCase())
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

    const handleInterviewSubmit = (e: React.FormEvent<InterviewForm>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const interviewDate = formData.get("date");
        const interviewTime = formData.get("time");

        if (!interviewTime) {
            alert("Please select a valid interview time.");
            return;
        }
        const [hours] = (interviewTime as string).split(":").map(Number);
        if (!interviewDate || interviewDate < today) {
            alert("Cannot select a past date.");
            return;
        }
        if (hours < 9 || hours > 21) {
            alert("Interview time must be between 09:00 and 21:00.");
            return;
        }

        setScheduledInterviews([...scheduledInterviews, {
            name: String(formData.get("name") ?? ""),
            email: String(formData.get("email") ?? ""),
            interviewer: selectedInterviewer?.name ?? "",
            date: String(interviewDate ?? ""),
            time: String(interviewTime ?? ""),
            status: "Scheduled"
        }]);

        setSelectedInterviewer(null);
        alert("Interview successfully scheduled!");
    };

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

                    {filteredInterviewers.length === 0 ? (
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
                                    <p className="text-sm text-gray-600 mb-1">Expertise: {interviewer.expertise}</p>
                                    <p className="text-sm text-gray-600 mb-1">Experience: {interviewer.experience}</p>
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
                    <h2 className="text-2xl font-semibold mb-4 text-blue-700">Registered Interviews</h2>
                    {scheduledInterviews.length === 0 ? (
                        <p className="text-gray-500">No interviews registered. Select an interviewer and schedule one.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {scheduledInterviews.map((interview, index) => (
                                <div key={index} className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-1">{interview.name} ({interview.email})</h3>
                                    <p className="text-sm text-gray-600 mb-1">Interviewer: {interview.interviewer}</p>
                                    <p className="text-sm text-gray-600 mb-1">Date: {interview.date}</p>
                                    <p className="text-sm text-gray-600 mb-1">Time: {interview.time}</p>
                                    <p className="text-sm font-medium text-green-600">Status: {interview.status}</p>
                                    <div className="flex flex-wrap gap-3 mt-4">
                                        <button
                                            className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 border border-red-300 rounded-lg hover:bg-red-200 transition"
                                            onClick={() => {
                                                if (window.confirm("Are you sure you want to cancel this interview?")) {
                                                    setScheduledInterviews(scheduledInterviews.filter((_, i) => i !== index));
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
                                            onClick={() => {
                                                const rescheduleDate = prompt("Enter new date (YYYY-MM-DD):", interview.date);
                                                const rescheduleTime = prompt("Enter new time (HH:MM):", interview.time);
                                                if (rescheduleDate && rescheduleTime) {
                                                    setScheduledInterviews(scheduledInterviews.map((item, i) =>
                                                        i === index
                                                            ? { ...item, date: rescheduleDate, time: rescheduleTime, status: "Rescheduled" }
                                                            : item
                                                    ));
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
            </main>
            <Footer />
        </div>
    );
}
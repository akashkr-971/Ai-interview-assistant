"use client";
import React, { useState, useRef } from "react";
import Navbar from "../components/navbar"; // Assuming these components exist
import Footer from "../components/footer"; // Assuming these components exist
import { FaEdit, FaLinkedin, FaPhone, FaMapMarkerAlt, FaEnvelope, FaUpload, FaFileAlt, FaCamera } from 'react-icons/fa';
import { AiOutlineCloseCircle, AiOutlinePlusCircle } from 'react-icons/ai';
import Image from "next/image";

// Define the core user data structure
interface UserData {
    name: string;
    email: string;
    role: string;
    joined: string;
    avatar: string;
    bio: string;
    linkedin: string;
    phone: string;
    location: string;
    resume: string;
    stats: {
        interviewsCompleted: number;
        interviewsScheduled: number;
        successRate: number;
        progress: number[];
    };
    skills: string[];
}

// Initial dummy data for the user profile
const initialUserData: UserData = {
    name: "Jane Doe",
    email: "jane.doe@email.com",
    role: "Software Engineer",
    joined: "2023-01-15",
    avatar: "https://i.pravatar.cc/150?img=47",
    bio: "Passionate about AI and web development. Loves to solve problems and build amazing products.",
    linkedin: "https://linkedin.com/in/janedoe",
    phone: "+1 234 567 8901",
    location: "San Francisco, CA",
    resume: "Jane_Doe_Resume.pdf", // Example resume file name
    stats: {
        interviewsCompleted: 12,
        interviewsScheduled: 3,
        successRate: 83,
        progress: [60, 70, 80, 90, 83], // Progress over 5 months
    },
    skills: ["React", "TypeScript", "Node.js", "AI", "UI/UX"],
};

// Component to render the progress line graph
const ProgressGraph: React.FC<{ data: number[] }> = ({ data }) => {
    const width = 400; // Fixed width for the SVG
    const height = 120; // Fixed height for the SVG
    const padding = 20; // Padding around the graph
    const maxDataValue = Math.max(...data, 100);
    const minDataValue = Math.min(...data, 0);

    // Calculate scaling factors
    const xScale = (index: number) => padding + (index / (data.length - 1)) * (width - 2 * padding);
    const yScale = (value: number) => height - padding - ((value - minDataValue) / (maxDataValue - minDataValue || 1)) * (height - 2 * padding);

    // Generate path for the line graph
    const linePath = data.map((val, i) => `${xScale(i)},${yScale(val)}`).join("L");
    const dAttr = `M${linePath}`;

    return (
        <div className="mt-4 mb-4 pb-4 overflow-x-auto">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
                {/* Y-axis labels (simplified) */}
                <text x={padding - 5} y={yScale(maxDataValue) + 5} textAnchor="middle" className="text-xs fill-gray-500">
                    {maxDataValue}%
                </text>
                <text x={padding - 5} y={yScale(minDataValue) + 5} textAnchor="middle" className="text-xs fill-gray-500">
                    {minDataValue}%
                </text>

                {/* X-axis labels (months) */}
                {data.map((_, i) => (
                    <text
                        key={`x-label-${i}`}
                        x={xScale(i)}
                        y={height - padding + 15}
                        textAnchor="middle"
                        className="text-xs fill-gray-600 font-semiboldc mt-2"
                        style={{ fontSize: "10px" }} // Adjust font size for better visibility
                    >
                        Month {i + 1}
                    </text>
                ))}

                {/* Horizontal lines for guidance */}
                <line x1={padding} y1={yScale(maxDataValue)} x2={width - padding} y2={yScale(maxDataValue)} stroke="#e5e7eb" strokeDasharray="4 2" />
                <line x1={padding} y1={yScale(minDataValue)} x2={width - padding} y2={yScale(minDataValue)} stroke="#e5e7eb" strokeDasharray="4 2" />

                {/* The line itself */}
                <path d={dAttr} fill="none" stroke="#3b82f6" strokeWidth="3" />

                {/* Data points */}
                {data.map((val, i) => (
                    <g key={i}>
                        <circle
                            cx={xScale(i)}
                            cy={yScale(val)}
                            r="5"
                            fill="#3b82f6"
                            stroke="#fff"
                            strokeWidth="2"
                            className="transition-all duration-200 hover:cursor-pointer"
                            onMouseOver={(e) => {
                                const circle = e.target as SVGCircleElement;
                                circle.setAttribute("r", "8");
                                const tooltip = document.getElementById(`progress-tooltip-${i}`);
                                if (tooltip) tooltip.style.display = "block";
                            }}
                            onMouseOut={(e) => {
                                const circle = e.target as SVGCircleElement;
                                circle.setAttribute("r", "5");
                                const tooltip = document.getElementById(`progress-tooltip-${i}`);
                                if (tooltip) tooltip.style.display = "none";
                            }}
                        />
                        {/* Tooltip */}
                        <foreignObject
                            id={`progress-tooltip-${i}`}
                            x={xScale(i) - 15}
                            y={yScale(val) - 30}
                            width="30"
                            height="17"
                            style={{ display: "none", pointerEvents: "none" }}
                        >
                            <div
                                className="bg-black text-white text-xs rounded-full py-1 text-center shadow-lg"
                                style={{ opacity: 0.9, fontSize: "8px" }}
                            >
                                {val}%
                            </div>
                        </foreignObject>
                    </g>
                ))}
            </svg>
        </div>
    );
};

// Main Profile Page Component
const ProfilePage: React.FC = () => {
    // State to toggle between view and edit modes
    const [editing, setEditing] = useState(false);
    // State to hold and manage user data
    const [user, setUser] = useState<UserData>(initialUserData);
    // State for adding new skills
    const [newSkill, setNewSkill] = useState("");
    // Ref for the hidden file input
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Handle changes to input fields (name, email, role, etc.)
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setUser({ ...user, [e.target.name]: e.target.value });
    };

    // Add a new skill to the user's skill list
    const handleSkillAdd = () => {
        if (newSkill.trim() && !user.skills.includes(newSkill.trim())) {
            setUser({ ...user, skills: [...user.skills, newSkill.trim()] });
            setNewSkill(""); // Clear input after adding
        }
    };

    // Remove an existing skill from the user's skill list
    const handleSkillRemove = (skill: string) => {
        setUser({ ...user, skills: user.skills.filter(s => s !== skill) });
    };

    // Handle resume file upload
    const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setUser({ ...user, resume: e.target.files[0].name }); // Store only the file name
        }
    };

    // Handle avatar image upload
    const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    setUser({ ...user, avatar: event.target.result as string });
                }
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-100">
            <Navbar /> {/* Navigation Bar */}
            <main className="flex-1 max-w-4xl mx-auto p-8 bg-white rounded-xl shadow-lg my-10 border border-gray-200">
                {/* Profile Header Section */}
                <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8 pb-6 border-b border-gray-200">
                    <div className="relative w-32 h-32">
                        <Image
                            src={user.avatar}
                            alt="User Avatar"
                            className="w-full h-full rounded-full border-4 border-blue-400 shadow-md object-cover"
                        />
                        {editing && (
                            <div className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-2 cursor-pointer shadow-lg hover:bg-blue-600 transition-colors"
                                 onClick={() => fileInputRef.current?.click()} // Trigger hidden file input
                            >
                                <FaCamera className="text-white text-lg" />
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarUpload}
                                    className="hidden"
                                    ref={fileInputRef}
                                />
                            </div>
                        )}
                    </div>
                    <div className="text-center md:text-left">
                        {editing ? (
                            // Edit mode for Name and Role
                            <>
                                <input
                                    className="text-4xl font-extrabold text-gray-900 border-b-2 border-blue-300 focus:outline-none px-2 py-1 rounded-md"
                                    name="name"
                                    value={user.name}
                                    onChange={handleChange}
                                />
                                <input
                                    className="block text-xl text-gray-700 mt-2 border-b-2 border-blue-300 focus:outline-none px-2 py-1 rounded-md"
                                    name="role"
                                    value={user.role}
                                    onChange={handleChange}
                                />
                            </>
                        ) : (
                            // View mode for Name and Role
                            <>
                                <h1 className="text-4xl font-extrabold text-gray-900">{user.name}</h1>
                                <p className="text-xl text-gray-700 mt-2">{user.role}</p>
                            </>
                        )}
                        <p className="text-base text-gray-500 mt-2">Joined: {user.joined}</p>
                        <div className="flex justify-center md:justify-start space-x-4 mt-4">
                            {editing ? (
                                // Edit mode for LinkedIn
                                <input
                                    className="text-blue-600 hover:underline flex items-center border-b border-gray-300 focus:outline-none text-sm"
                                    name="linkedin"
                                    value={user.linkedin}
                                    onChange={handleChange}
                                    placeholder="LinkedIn URL"
                                />
                            ) : (
                                // View mode for LinkedIn
                                <a
                                    href={user.linkedin}
                                    className="text-blue-600 hover:underline flex items-center text-lg"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <FaLinkedin className="mr-2 text-blue-700" /> LinkedIn
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* Contact and Bio Section */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <section>
                        <h2 className="font-bold text-2xl text-gray-800 mb-4 flex items-center"><FaEnvelope className="mr-3 text-blue-500" /> Contact Information</h2>
                        <div className="space-y-3 text-gray-700 text-lg">
                            <div className="flex items-center">
                                <span className="font-semibold w-24">Email:</span>{" "}
                                {editing ? (
                                    <input
                                        className="border-b border-gray-300 focus:outline-none flex-1 p-1 rounded"
                                        name="email"
                                        type="email"
                                        value={user.email}
                                        onChange={handleChange}
                                    />
                                ) : (
                                    <a href={`mailto:${user.email}`} className="text-blue-600 hover:underline">{user.email}</a>
                                )}
                            </div>
                            <div className="flex items-center">
                                <span className="font-semibold w-24">Phone:</span>{" "}
                                {editing ? (
                                    <input
                                        className="border-b border-gray-300 focus:outline-none flex-1 p-1 rounded"
                                        name="phone"
                                        type="tel"
                                        value={user.phone}
                                        onChange={handleChange}
                                    />
                                ) : (
                                    <span className="flex items-center"><FaPhone className="mr-2 text-green-500" />{user.phone}</span>
                                )}
                            </div>
                            <div className="flex items-center">
                                <span className="font-semibold w-24">Location:</span>{" "}
                                {editing ? (
                                    <input
                                        className="border-b border-gray-300 focus:outline-none flex-1 p-1 rounded"
                                        name="location"
                                        value={user.location}
                                        onChange={handleChange}
                                    />
                                ) : (
                                    <span className="flex items-center"><FaMapMarkerAlt className="mr-2 text-red-500" />{user.location}</span>
                                )}
                            </div>
                            <div className="flex items-center">
                                <span className="font-semibold w-24">Resume:</span>{" "}
                                {editing ? (
                                    <div className="flex items-center flex-1">
                                        <input
                                            type="file"
                                            accept=".pdf,.doc,.docx"
                                            onChange={handleResumeUpload}
                                            className="hidden"
                                            id="resume-upload"
                                        />
                                        <label htmlFor="resume-upload" className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center text-sm">
                                            <FaUpload className="mr-2" /> Upload Resume
                                        </label>
                                        {user.resume && (
                                            <span className="ml-3 text-sm text-gray-600 font-medium">{user.resume}</span>
                                        )}
                                    </div>
                                ) : (
                                    user.resume ? (
                                        <a href={`/path/to/resumes/${user.resume}`} download className="text-green-600 hover:underline flex items-center text-lg">
                                            <FaFileAlt className="mr-2" /> Download {user.resume}
                                        </a>
                                    ) : (
                                        <span className="text-gray-500 italic">No resume uploaded</span>
                                    )
                                )}
                            </div>
                        </div>
                    </section>
                    <section>
                        <h2 className="font-bold text-2xl text-gray-800 mb-4">Bio</h2>
                        {editing ? (
                            <textarea
                                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-400 focus:border-transparent text-lg"
                                name="bio"
                                value={user.bio}
                                onChange={handleChange}
                                rows={6}
                                placeholder="Tell us about yourself..."
                            />
                        ) : (
                            <p className="text-gray-800 leading-relaxed text-lg">{user.bio}</p>
                        )}
                    </section>
                </div>

                {/* --- */}
                <hr className="my-8 border-gray-200" />

                {/* Skills Section */}
                <section className="mt-8">
                    <h2 className="font-bold text-2xl text-gray-800 mb-4 flex items-center">
                        <i className="fas fa-tools mr-3 text-green-500"></i> Professional Skills
                    </h2>
                    <div className="flex flex-wrap gap-3 mb-4">
                        {user.skills.map((skill) => (
                            <span
                                key={skill}
                                className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-base font-medium flex items-center shadow-sm"
                            >
                                {skill}
                                {editing && (
                                    <button
                                        className="ml-3 text-red-500 hover:text-red-700 transition-colors"
                                        onClick={() => handleSkillRemove(skill)}
                                        type="button"
                                        title={`Remove ${skill}`}
                                    >
                                        <AiOutlineCloseCircle />
                                    </button>
                                )}
                            </span>
                        ))}
                    </div>
                    {editing && (
                        <div className="flex items-center gap-3 mt-4">
                            <input
                                className="border border-gray-300 rounded-lg px-4 py-2 flex-1 focus:ring-2 focus:ring-blue-400 focus:border-transparent text-base"
                                value={newSkill}
                                onChange={(e) => setNewSkill(e.target.value)}
                                placeholder="Add a new skill (e.g., Python, SQL)"
                            />
                            <button
                                className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                                onClick={handleSkillAdd}
                                type="button"
                            >
                                <AiOutlinePlusCircle className="mr-2" /> Add Skill
                            </button>
                        </div>
                    )}
                </section>

                {/* --- */}
                <hr className="my-8 border-gray-200" />

                {/* Interview Progress & Stats Section */}
                <section className="mt-8">
                    <h2 className="font-bold text-2xl text-gray-800 mb-4 flex items-center">
                        <i className="fas fa-chart-line mr-3 text-teal-500"></i> Interview Progress & Stats
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                        <div className="bg-blue-50 p-5 rounded-lg shadow-sm border border-blue-200">
                            <p className="text-4xl font-extrabold text-blue-700">{user.stats.interviewsCompleted}</p>
                            <p className="text-gray-600 text-lg mt-2">Interviews Completed</p>
                        </div>
                        <div className="bg-yellow-50 p-5 rounded-lg shadow-sm border border-yellow-200">
                            <p className="text-4xl font-extrabold text-yellow-700">{user.stats.interviewsScheduled}</p>
                            <p className="text-gray-600 text-lg mt-2">Interviews Scheduled</p>
                        </div>
                        <div className="bg-green-50 p-5 rounded-lg shadow-sm border border-green-200">
                            <p className="text-4xl font-extrabold text-green-700">{user.stats.successRate}%</p>
                            <p className="text-gray-600 text-lg mt-2">Success Rate</p>
                        </div>
                    </div>
                    <div className="mt-8 bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200">
                        <h3 className="font-semibold text-xl text-gray-800 mb-3">Progress Insights for past 5 Months</h3>
                        <ProgressGraph data={user.stats.progress} />
                        <div className="flex flex-wrap justify-center gap-6 mt-4 font-semibold text-gray-700">
                            {/* Highest */}
                            <div className="flex flex-col items-center">
                                <span className="text-green-700 font-bold text-xl">
                                    {Math.max(...user.stats.progress)}%
                                </span>
                                <span className="text-xs text-gray-500">Highest</span>
                            </div>
                            {/* Lowest */}
                            <div className="flex flex-col items-center">
                                <span className="text-red-600 font-bold text-xl">
                                    {Math.min(...user.stats.progress)}%
                                </span>
                                <span className="text-xs text-gray-500">Lowest</span>
                            </div>
                            {/* Average */}
                            <div className="flex flex-col items-center">
                                <span className="text-blue-700 font-bold text-xl">
                                    {(
                                        user.stats.progress.reduce((a, b) => a + b, 0) /
                                        user.stats.progress.length
                                    ).toFixed(1)}
                                    %
                                </span>
                                <span className="text-xs text-gray-500">Average</span>
                            </div>
                            {/* Trend */}
                            <div className="flex flex-col items-center ">
                                <span className={`font-bold text-xl ${
                                    user.stats.progress[user.stats.progress.length - 1] > user.stats.progress[0]
                                        ? "text-green-700"
                                        : user.stats.progress[user.stats.progress.length - 1] < user.stats.progress[0]
                                        ? "text-red-600"
                                        : "text-gray-700"
                                }`}>
                                    {user.stats.progress[user.stats.progress.length - 1] > user.stats.progress[0]
                                        ? "↑ Improving"
                                        : user.stats.progress[user.stats.progress.length - 1] < user.stats.progress[0]
                                        ? "↓ Declining"
                                        : "→ Stable"}
                                </span>
                                <span className="text-xs text-gray-500">Trend</span>
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 text-center mt-3">
                            Insights based on your interview success rate progress over the last {user.stats.progress.length} months.
                        </p>
                    </div>
                </section>

                {/* Edit/Save/Cancel Buttons */}
                <div className="mt-10 flex justify-end gap-3 border-t border-gray-200 pt-6">
                    {editing ? (
                        <>
                            <button
                                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md text-lg"
                                onClick={() => setEditing(false)}
                                type="button"
                            >
                                <FaEdit className="inline mr-2" /> Save Changes
                            </button>
                            <button
                                className="px-6 py-3 bg-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-400 transition-colors shadow-md text-lg"
                                onClick={() => {
                                    setEditing(false);
                                    setUser(initialUserData); // Revert to initial data on cancel
                                }}
                                type="button"
                            >
                                Cancel
                            </button>
                        </>
                    ) : (
                        <button
                            className="px-6 py-3 bg-blue-100 text-blue-700 font-semibold rounded-lg hover:bg-blue-200 transition-colors shadow-md text-lg"
                            onClick={() => setEditing(true)}
                            type="button"
                        >
                            <FaEdit className="inline mr-2" /> Edit Profile
                        </button>
                    )}
                </div>
            </main>
            <Footer /> {/* Footer component */}
        </div>
    );
};

export default ProfilePage;
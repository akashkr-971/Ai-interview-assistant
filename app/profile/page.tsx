"use client";
import { useState, useRef, useEffect } from "react";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import { FaEdit,FaEnvelope,FaCamera, FaSpinner } from 'react-icons/fa';
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";

interface UserData {
    id?: string;
    name: string;
    email: string;
    role: string;
    joined: string;
    avatar: string;
    stats: {
        interviewsCreated: number;
        interviewsAttended: number;
        successRate: number;
        progress: number[];
    };
    skills: string[];
}

const defaultUserData: UserData = {
    name: "",
    email: "",
    role: "",
    joined: new Date().toISOString().split('T')[0],
    avatar: "/avatar.jpg",
    stats: {
        interviewsCreated: 0,
        interviewsAttended: 0,
        successRate: 0,
        progress: [0, 0, 0, 0, 0],
    },
    skills: [],
};

const ProgressGraph: React.FC<{ data: number[] }> = ({ data }) => {
    const width = 500;
    const height = 200;
    const padding = 30;
    const maxDataValue = Math.max(...data, 100);
    const minDataValue = Math.min(...data, 0);

    const xScale = (index: number) => padding + (index / (data.length - 1)) * (width - 2 * padding);
    const yScale = (value: number) => height - padding - ((value - minDataValue) / (maxDataValue - minDataValue || 1)) * (height - 2 * padding);

    const linePath = data.map((val, i) => `${xScale(i)},${yScale(val)}`).join("L");
    const dAttr = `M${linePath}`;

    return (
        <div className="mt-4 mb-4 pb-4 overflow-x-auto">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
                <text x={padding - 10} y={yScale(maxDataValue) + 5} textAnchor="middle" className="text-xs fill-gray-500">
                    {maxDataValue}%
                </text>
                <text x={padding -10} y={yScale(minDataValue) + 5} textAnchor="middle" className="text-xs fill-gray-500">
                    {minDataValue}%
                </text>

                {data.map((_, i) => (
                    <text
                        key={`x-label-${i}`}
                        x={xScale(i)}
                        y={height - padding + 20}
                        textAnchor="middle"
                        className="text-xs fill-gray-600 font-semiboldc mt-2"
                        style={{ fontSize: "10px" }}
                    >
                        Interview {i + 1}
                    </text>
                ))}

                <line x1={padding} y1={yScale(maxDataValue)} x2={width - padding} y2={yScale(maxDataValue)} stroke="#e5e7eb" strokeDasharray="4 2" />
                <line x1={padding} y1={yScale(minDataValue)} x2={width - padding} y2={yScale(minDataValue)} stroke="#e5e7eb" strokeDasharray="4 2" />

                <path d={dAttr} fill="none" stroke="#3b82f6" strokeWidth="3" />

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

const ProfilePage: React.FC = () => {
    const [editing, setEditing] = useState(false);
    const [user, setUser] = useState<UserData>(defaultUserData);
    const [originalUser, setOriginalUser] = useState<UserData>(defaultUserData);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            setLoading(true);
            const userId = localStorage.getItem("userId");
            if (!userId) {
                console.error("No user ID found in localStorage");
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from("users")
                .select("*")
                .eq("id", userId)
                .single();

            if (error) {
                console.error("Failed to fetch user data:", error);
                setLoading(false);
                return;
            }
            if(data){

                const {data:interview_data , error:interview_error } = await supabase
                .from("interviews")
                .select("*")
                .eq("created_by", [userId]);
                
                if(interview_error){
                    console.error("Failed to fetch interview data:", error);
                    setLoading(false);
                    return;
                }
                if(interview_data){
                    const {data:feedback_data , error:feedback_error } = await supabase
                    .from("feedback")
                    .select("feedback")
                    .eq("user_id", userId);

                    if(feedback_error){
                        console.error("Failed to fetch feedback data:", error);
                        setLoading(false);
                        return;
                    }

                    const feedback = feedback_data || [];
                    const scores = feedback.map((item) => item.feedback?.overallScore).filter((score) => typeof score === "number");
                    const averageRating = scores.length ? scores.reduce((acc, score) => acc + score, 0) / scores.length : 0;
                    const recentScores=scores.slice(-5);
                    const progress = Array(5 - recentScores.length).fill(0).concat(recentScores);
                    console.log(progress);


                    const interviews = interview_data || [];
                    const roleCount: { [key: string]: number } = {};
                    const userSkillsSet = new Set<string>();
                    let dominantRole:string='';
                    let maxCount = 0;
                    let attendedCount=0;
    
                    interviews.forEach((interview) => {
                        const role = interview.role.trim();
                        roleCount[role] = (roleCount[role] || 0) + 1;
                        interview.techstack.forEach((tech:string) => userSkillsSet.add(tech.trim()));
                        if (interview.attendees?.includes(userId)) {
                            attendedCount++;
                        }
                    })
                    const techstacks = Array.from(new Set(userSkillsSet));
                    for (const role in roleCount) {
                        if (roleCount[role] > maxCount) {
                          dominantRole = role;
                          maxCount = roleCount[role];
                        }
                      }
    
                      const stats = {
                        interviewsCreated: interviews.length,
                        interviewsAttended: attendedCount,
                        successRate: averageRating.toPrecision(4),
                        progress: progress,
                      }
    
                    const userData: UserData = {
                        ...data,
                        joined: data.craeted_at || defaultUserData.joined,
                        role: dominantRole,
                        stats: stats || defaultUserData.stats,
                        skills: techstacks || [],
                        avatar: data.avatar || defaultUserData.avatar,
                    };
        
                    setUser(userData);
                    setOriginalUser(userData);
                }

            }
        } catch (error) {
            console.error("Error fetching user data:", error);
        } finally {
            setLoading(false);
        }
    };

    const saveUserData = async () => {
        try {
            setSaving(true);
            const userId = localStorage.getItem("userId");
            if (!userId) return;

            const updateData = {
                name: user.name,
                email: user.email,
                avatar: user.avatar,
            };

            const { error } = await supabase
                .from("users")
                .update(updateData)
                .eq("id", userId);

            if (error) {
                console.error("Failed to save user data:", error);
                alert("Failed to save changes. Please try again.");
                return;
            }

            setOriginalUser(user);
            setEditing(false);
            alert("Profile updated successfully!");
        } catch (error) {
            console.error("Error saving user data:", error);
            alert("Failed to save changes. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const uploadFileToSupabase = async (file: File, bucket: string, path: string) => {
        const { error } = await supabase.storage
            .from(bucket)
            .upload(path, file, {
                cacheControl: '3600',
                upsert: true
            });

        if (error) {
            throw error;
        }

        const { data: urlData } = supabase.storage
            .from(bucket)
            .getPublicUrl(path);

        return urlData.publicUrl;
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const userId = localStorage.getItem("userId");
            
            if (!userId) return;

            try {
                setUploadingAvatar(true);
                const fileName = `${userId}_${Date.now()}_${file.name}`;
                const filePath = `avatars/${fileName}`;
                
                const publicUrl = await uploadFileToSupabase(file, 'images', filePath);
                
                setUser({ ...user, avatar: publicUrl });
                
                alert("Profile picture updated successfully!");
            } catch (error) {
                console.error("Error uploading avatar:", error);
                alert("Failed to upload profile picture. Please try again.");
            } finally {
                setUploadingAvatar(false);
            }
        }
    };

    

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setUser({ ...user, [e.target.name]: e.target.value });
    };

    const handleCancel = () => {
        setUser(originalUser);
        setEditing(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col bg-gray-100">
                <Navbar />
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <FaSpinner className="animate-spin text-4xl text-blue-500 mx-auto mb-4" />
                        <p className="text-xl text-gray-600">Loading profile...</p>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-100">
            <Navbar />
            <main className="flex-1 max-w-4xl mx-auto p-8 bg-white rounded-xl shadow-lg my-10 border border-gray-200">
                {/* Profile Header Section */}
                <div className="flex flex-col justify-center  md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8 pb-6 border-b border-gray-200">
                    <div className="relative w-32 h-32">
                        <Image
                            height={128}
                            width={128}
                            src={user.avatar}
                            priority
                            alt="User Avatar"
                            className="w-full h-full rounded-full border-4 border-blue-400 shadow-md object-cover"
                        />
                        {editing && (
                            <div className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-2 cursor-pointer shadow-lg hover:bg-blue-600 transition-colors"
                                 onClick={() => fileInputRef.current?.click()}
                            >
                                {uploadingAvatar ? (
                                    <FaSpinner className="animate-spin text-white text-lg" />
                                ) : (
                                    <FaCamera className="text-white text-lg" />
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarUpload}
                                    className="hidden"
                                    ref={fileInputRef}
                                    disabled={uploadingAvatar}
                                />
                            </div>
                        )}
                    </div>
                    <div className="text-center md:text-left">
                        {editing ? (
                            <>
                                <input
                                    className="text-4xl font-extrabold text-gray-900 border-b-2 border-blue-300 focus:outline-none px-2 py-1 rounded-md"
                                    name="name"
                                    value={user.name}
                                    onChange={handleChange}
                                />
                            </>
                        ) : (
                            <>
                                <h1 className="text-4xl font-extrabold text-gray-900">{user.name}</h1>
                            </>
                        )}
                        <p className="text-xl text-gray-700 mt-2">{user.role || '-'}</p>
                        <p className="text-base text-gray-500 mt-2">Joined: {user.joined}</p>
                    </div>
                </div>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <section>
                        <h2 className="font-bold text-2xl text-gray-800 mb-4 flex items-center">
                            <FaEnvelope className="mr-3 text-blue-500" /> Contact Information
                        </h2>
                        <div className="space-y-3 text-gray-700 text-lg">
                            <div className="flex items-center">
                                <span className="font-semibold w-24">Email:</span>
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
                        </div>
                    </section>
                </div>
                <hr className="my-8 border-gray-200" />
                {/* Skills Section */}
                <section className="mt-8">
                    <h2 className="font-bold text-2xl text-gray-800 mb-4 flex items-center">
                        <i className="fas fa-tools mr-3 text-green-500"></i> Professional Skills
                    </h2>
                    {user.skills && user.skills.length > 0 ? (
                        <div className="flex flex-wrap gap-3 mb-4">
                        {user.skills.map((skill) => (
                            <span
                            key={skill}
                            className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-base font-medium flex items-center shadow-sm"
                            >
                            {skill}
                            </span>
                        ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 italic">Create an interview to show your skills.</p>
                    )}
                </section>

                <hr className="my-8 border-gray-200" />

                {/* Interview Progress & Stats Section */}
                <section className="mt-8">
                    <h2 className="font-bold text-2xl text-gray-800 mb-4 flex items-center">
                        <i className="fas fa-chart-line mr-3 text-teal-500"></i> Interview Progress & Stats
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                        <div className="bg-blue-50 p-5 rounded-lg shadow-sm border border-blue-200">
                            <p className="text-4xl font-extrabold text-blue-700">{user.stats.interviewsCreated}</p>
                            <p className="text-gray-600 text-lg mt-2">Interviews Created</p>
                        </div>
                        <div className="bg-yellow-50 p-5 rounded-lg shadow-sm border border-yellow-200">
                            <p className="text-4xl font-extrabold text-yellow-700">{user.stats.interviewsAttended}</p>
                            <p className="text-gray-600 text-lg mt-2">Interviews Attended</p>
                        </div>
                        <div className="bg-green-50 p-5 rounded-lg shadow-sm border border-green-200">
                            <p className="text-4xl font-extrabold text-green-700">{user.stats.successRate}%</p>
                            <p className="text-gray-600 text-lg mt-2">Success Rate</p>
                        </div>
                    </div>
                    <div className="mt-8 bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200">
                        <h3 className="font-semibold text-xl text-gray-800 mb-3">Progress Insights for past 5 interviews</h3>
                        <ProgressGraph data={user.stats.progress} />
                        <div className="flex flex-wrap justify-center gap-6 mt-4 font-semibold text-gray-700">
                            <div className="flex flex-col items-center">
                                <span className="text-green-700 font-bold text-xl">
                                    {Math.max(...user.stats.progress)}%
                                </span>
                                <span className="text-xs text-gray-500">Highest</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="text-red-600 font-bold text-xl">
                                {Math.min(...user.stats.progress.filter(score => score > 0))}%
                                </span>
                                <span className="text-xs text-gray-500">Lowest</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="text-blue-700 font-bold text-xl">
                                    {(() => {
                                    const nonZeroProgress = user.stats.progress.filter(score => score > 0);
                                    return nonZeroProgress.length
                                        ? (nonZeroProgress.reduce((a, b) => a + b, 0) / nonZeroProgress.length).toFixed(1)
                                        : "N/A";
                                    })()}%
                                </span>
                                <span className="text-xs text-gray-500">Average</span>
                                </div>

                                <div className="flex flex-col items-center ">
                                <span
                                className={`font-bold text-xl ${
                                    (() => {
                                    const p = user.stats.progress;
                                    const first = p.find(score => score > 0);
                                    const last = [...p].reverse().find(score => score > 0);

                                    if (first === undefined || last === undefined) return "text-gray-500";
                                    if (last > first) return "text-green-700";
                                    if (last < first) return "text-red-600";
                                    return "text-gray-700";
                                    })()
                                }`}
                                >
                                {(() => {
                                    const p = user.stats.progress;
                                    const first = p.find(score => score > 0);
                                    const last = [...p].reverse().find(score => score > 0);

                                    if (first === undefined || last === undefined) return "= No Trend";
                                    if (last > first) return "↑ Improving";
                                    if (last < first) return "↓ Declining";
                                    return "→ Stable";
                                })()}
                                </span>
                                <span className="text-xs text-gray-500">Trend</span>
                                </div>

                        </div>
                        <p className="text-sm text-gray-500 text-center mt-3">
                            Insights based on your interview success rate progress over the last {user.stats.progress.length} Interviews.
                        </p>
                    </div>
                </section>

                {/* Edit/Save/Cancel Buttons */}
                <div className="mt-10 flex justify-end gap-3 border-t border-gray-200 pt-6">
                    {editing ? (
                        <>
                            <button
                                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md text-lg disabled:opacity-50"
                                onClick={saveUserData}
                                type="button"
                                disabled={saving}
                            >
                                {saving ? (
                                    <FaSpinner className="inline animate-spin mr-2" />
                                ) : (
                                    <FaEdit className="inline mr-2" />
                                )}
                                {saving ? "Saving..." : "Save Changes"}
                            </button>
                            <button
                                className="px-6 py-3 bg-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-400 transition-colors shadow-md text-lg"
                                onClick={handleCancel}
                                type="button"
                                disabled={saving}
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
            <Footer />
        </div>
    );
};

export default ProfilePage;
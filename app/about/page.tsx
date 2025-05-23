'use client';
import Navbar from '../components/navbar';
import Footer from '../components/footer';

export default function About() {
    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <Navbar />
            <main className="flex-1 container mx-auto px-6 py-12">
                <div className="flex flex-col md:flex-row items-center gap-12">
                    <div className="md:w-1/2 flex justify-center">
                        <img
                            src="/logo.webp"
                            alt="AI Interview Helper"
                            className="rounded-xl shadow-lg w-full max-w-md transition-transform duration-500 hover:scale-105 animate-fade-in"
                            style={{ animation: 'fadeInUp 1s ease' }}
                        />
                    </div>
                    <div className="md:w-1/2">
                        <h1 className="text-5xl font-extrabold text-indigo-800 mb-6">About PrepWise</h1>
                        <p className="text-xl text-gray-700 mb-6">
                            <span className="font-semibold">PrepWise</span> is your smart companion for interview preparation. Leveraging the power of AI, our platform generates tailored questions for various job roles and industries, helping you practice and improve your skills.
                        </p>
                        <ul className="list-disc pl-6 text-gray-700 mb-6 space-y-3 text-lg">
                            <li>Personalized interview questions powered by AI</li>
                            <li>Practice for multiple industries and job roles</li>
                            <li>Purchase virtual coins to unlock premium features</li>
                            <li>Track your progress and performance</li>
                            <li>Instant feedback and answer suggestions</li>
                            <li>Mock interview simulations with realistic scenarios</li>
                        </ul>
                    </div>
                </div>
                <div className="bg-indigo-50 rounded-lg p-8 shadow-lg mb-8 mt-8 flex flex-col items-start gap-6 animate-fade-in">
                    <h3 className="text-3xl font-extrabold text-indigo-700 mb-2">Why Choose PrepWise?</h3>
                    <ul className="list-disc pl-6 text-gray-700 space-y-4 text-lg">
                        <li>
                            <span className="font-semibold text-indigo-600">User-Friendly:</span> Enjoy an intuitive interface designed for seamless learning and practice.
                        </li>
                        <li>
                            <span className="font-semibold text-indigo-600">Up-to-date Content:</span> Access a regularly updated question bank reflecting the latest industry trends.
                        </li>
                        <li>
                            <span className="font-semibold text-indigo-600">Community & Support:</span> Connect with a supportive community and receive expert interview tips.
                        </li>
                        <li>
                            <span className="font-semibold text-indigo-600">Insightful Analytics:</span> Track your progress with detailed analytics to identify strengths and areas for growth.
                        </li>
                        <li>
                            <span className="font-semibold text-indigo-600">Flexible Practice:</span> Practice anytime, anywhere, and at your own pace.
                        </li>
                        <li>
                            <span className="font-semibold text-indigo-600">AI-Powered Feedback:</span> Get instant, personalized feedback to improve your answers.
                        </li>
                    </ul>
                </div>
                <section className="mt-20 text-center">
                    <h2 className="text-3xl font-bold text-indigo-700 mb-6">Our Mission</h2>
                    <p className="text-xl text-gray-700 max-w-2xl mx-auto mb-8">
                        We aim to empower job seekers with the tools and confidence they need to succeed in interviews. By combining technology and education, we strive to make interview preparation accessible, effective, and enjoyable for everyone.
                    </p>
                    <div className="flex flex-col md:flex-row justify-center gap-8 mt-8">
                        <div className="bg-white rounded-lg shadow p-6 w-full md:w-1/3">
                            <h4 className="text-xl font-semibold text-indigo-800 mb-2">Our Vision</h4>
                            <p className="text-gray-700 text-lg">
                                To be the leading platform for AI-driven interview preparation, supporting millions of job seekers worldwide.
                            </p>
                        </div>
                        <div className="bg-white rounded-lg shadow p-6 w-full md:w-1/3">
                            <h4 className="text-xl font-semibold text-indigo-800 mb-2">Our Values</h4>
                            <ul className="list-disc pl-6 text-gray-700 text-lg space-y-1 text-left">
                                <li>Innovation</li>
                                <li>Accessibility</li>
                                <li>Integrity</li>
                                <li>Continuous Learning</li>
                            </ul>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
            {/* Animation keyframes for fadeInUp */}
            <style jsx global>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translate3d(0, 40px, 0);
                    }
                    to {
                        opacity: 1;
                        transform: translate3d(0, 0, 0);
                    }
                }
                .animate-fade-in {
                    animation: fadeInUp 1s ease;
                }
            `}</style>
        </div>
    );
}
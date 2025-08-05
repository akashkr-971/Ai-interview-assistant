"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { CheckCircle, Mail, Loader2 } from "lucide-react";

export default function VerifyEmailPage() {
  const [isVerified, setIsVerified] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [timer, setTimer] = useState(60);
  const [email, setEmail] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    const storedEmail = localStorage.getItem("email");
    setEmail(storedEmail);
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      const { data } = await supabase.auth.getUser();
      const emailVerified = data?.user?.email_confirmed_at;
      const role = localStorage.getItem("role");

      if (emailVerified) {
        setIsVerified(true);
        clearInterval(interval);
        localStorage.removeItem("email");
        router.push(role === "interviewer" ? "/interviewer" : "/");
        console.log(isVerified ? "Email verified successfully." : "Email not verified yet.");
    }
    }, 4000);

    return () => clearInterval(interval);
  }, [router]);

  useEffect(() => {
    const countdown = setInterval(() => {
      setTimer((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(countdown);
  }, []);

  const handleResend = async () => {
    if (!email) {
      alert("Email not found. Please sign up again.");
      return;
    }

    setResendLoading(true);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: email,
    });

    if (error) {
      console.error("Resend Error:", error.message);
      alert("Failed to resend verification email.");
    } else {
      setResendSuccess(true);
      setTimer(60);
      setTimeout(() => setResendSuccess(false), 4000);
    }

    setResendLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-indigo-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md text-center animate-fade-in">
        <div className="flex justify-center mb-4">
          <Mail className="w-16 h-16 text-indigo-500 animate-pulse" />
        </div>

        <h1 className="text-2xl font-bold mb-2 text-gray-800">
          Verification Email Sent
        </h1>
        <p className="text-gray-600 text-sm mb-6">
          We&apos;ve sent a verification link to your email. Please check your inbox
          and click the link to verify your account.
        </p>

        <div className="text-sm text-gray-500 mb-4">
          Didn&apos;t receive the email? Try checking your spam folder, or:
        </div>

        <button
          className="w-full flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-700 transition text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleResend}
          disabled={resendLoading || timer > 0}
        >
          {resendLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Sending...
            </>
          ) : resendSuccess ? (
            <>
              <CheckCircle className="w-4 h-4 text-green-400" />
              Sent!
            </>
          ) : (
            <>
              <Mail className="w-4 h-4" />
              Resend Email
            </>
          )}
        </button>

        <div className="mt-6 text-xs text-gray-400">
          You can resend in: {timer}s
        </div>

        <div className="mt-2 text-xs text-blue-500 animate-pulse">
          Waiting for verification... (checking every 4s)
        </div>
      </div>
    </div>
  );
}

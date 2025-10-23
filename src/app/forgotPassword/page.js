"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Mail } from "lucide-react";
import Navbar from "@/Components/NavBar";
import Footer from "@/Components/Footer";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [step, setStep] = useState("request"); // "request" | "verify"
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setInterval(() => setResendTimer((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [resendTimer]);

  const validateEmail = (value) => {
    if (!value.trim()) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Please enter a valid email address";
    return null;
  };

  const handleSendOtp = async (e) => {
    e?.preventDefault();
    const v = validateEmail(email);
    if (v) {
      setError(v);
      return;
    }
    setIsLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to send OTP");
      setStep("verify");
      setMessage(data.message || "OTP sent to your email.");
      setResendTimer(60); // 1 minute before resend
    } catch (err) {
      setError(err.message || "Network error. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    if (!otp.trim()) {
      setError("Please enter the OTP sent to your email.");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "OTP verification failed");
      // On success: redirect to reset-password page (or treat as authenticated)
      router.push(`/reset-password?email=${encodeURIComponent(email)}&token=${encodeURIComponent(data.token || "")}`);
    } catch (err) {
      setError(err.message || "Verification failed. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, resend: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to resend OTP");
      setMessage(data.message || "OTP resent.");
      setResendTimer(120);
    } catch (err) {
      setError(err.message || "Unable to resend OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <Navbar />

      <section className=" flex items-center justify-center pt-30 pb-10">
        <div className="w-full max-w-md mx-auto px-6">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Forgot Password</h2>
              <p className="text-gray-600">
                Authenticate with a one-time code (OTP) sent to your email.
              </p>
            </div>

            {message && (
              <div className="mb-4 text-center text-green-600 font-medium">{message}</div>
            )}

            {step === "request" && (
              <form onSubmit={handleSendOtp} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-gray-700 mb-2 font-medium" htmlFor="email">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none text-black focus:ring-2 focus:ring-red-500"
                      placeholder="you@email.com"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full font-bold py-3 rounded-lg text-lg text-white ${
                    isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-green-600 hover:shadow-xl"
                  }`}
                >
                  {isLoading ? "Sending..." : "Send OTP"}
                </button>

                <div className="mt-4 text-center text-sm text-gray-600">
                  Remembered your password?{" "}
                  <Link href="/login" className="text-red-600 font-semibold hover:underline">
                    Sign in
                  </Link>
                </div>
              </form>
            )}

            {step === "verify" && (
              <form onSubmit={handleVerifyOtp} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-gray-700 mb-2 font-medium" htmlFor="otp">
                    Enter OTP
                  </label>
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    inputMode="numeric"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 text-center tracking-widest text-lg"
                    placeholder="123456"
                    required
                  />
                </div>

                <div className="flex items-center justify-between gap-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`flex-1 font-bold py-3 rounded-lg text-lg text-white ${
                      isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-green-600 hover:shadow-xl"
                    }`}
                  >
                    {isLoading ? "Verifying..." : "Verify OTP"}
                  </button>

                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendTimer > 0 || isLoading}
                    className="px-4 py-3 rounded-lg bg-white border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
                  </button>
                </div>

                <div className="mt-4 text-center text-sm text-gray-600">
                  Can't receive email? <Link href="/support" className="text-red-600 font-semibold hover:underline">Contact Support</Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
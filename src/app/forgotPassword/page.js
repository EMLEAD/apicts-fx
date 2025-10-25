"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Mail, CheckCircle, ArrowLeft } from "lucide-react";
import Navbar from "@/Components/NavBar";
import Footer from "@/Components/Footer";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const inputsRef = useRef([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [step, setStep] = useState("request"); // "request" | "verify"
  const [resendTimer, setResendTimer] = useState(0);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setInterval(() => setResendTimer((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [resendTimer]);

  const validateEmail = (value) => {
    if (!value || !value.trim()) return "Email is required";
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

      const contentType = res.headers.get("content-type") || "";
      const data = contentType.includes("application/json") ? await res.json() : { message: "Unexpected response" };

      if (!res.ok) throw new Error(data?.message || "Failed to send OTP");
      setStep("verify");
      setMessage(data.message || "OTP sent to your email.");
      setResendTimer(60); // 1 minute before resend
      // focus first input after minor delay
      setTimeout(() => inputsRef.current[0]?.focus?.(), 120);
    } catch (err) {
      setError(err.message || "Network error. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    const otp = otpDigits.join("").trim();
    if (!otp || otp.length < 6) {
      setError("Please enter the 6-digit OTP sent to your email.");
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

      const contentType = res.headers.get("content-type") || "";
      const data = contentType.includes("application/json") ? await res.json() : { message: "Unexpected response" };

      if (!res.ok) throw new Error(data?.message || "OTP verification failed");
      
      // After successful verification, route to change password with email
      router.push(`/changepassword?email=${encodeURIComponent(email)}&token=${encodeURIComponent(data.token || "")}`);
    } catch (err) {
      setError(err.message || "Verification failed. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    if (!email) {
      setError("Provide your email first.");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, resend: true }),
      });

      const contentType = res.headers.get("content-type") || "";
      const data = contentType.includes("application/json") ? await res.json() : { message: "Unexpected response" };

      if (!res.ok) throw new Error(data?.message || "Failed to resend OTP");
      setMessage(data.message || "OTP resent.");
      setResendTimer(120);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2500);
    } catch (err) {
      setError(err.message || "Unable to resend OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  // OTP input helpers
  const handleChange = (val, idx) => {
    if (!/^\d?$/.test(val)) return; // allow only single digit number or empty
    const next = [...otpDigits];
    next[idx] = val;
    setOtpDigits(next);
    if (val && idx < 5) {
      inputsRef.current[idx + 1]?.focus?.();
    }
    if (!val && idx > 0) {
      // if user cleared current, focus previous
      // do nothing here to keep UX simple
    }
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === "Backspace" && !otpDigits[idx] && idx > 0) {
      inputsRef.current[idx - 1]?.focus?.();
    }
    if (e.key === "ArrowLeft" && idx > 0) {
      inputsRef.current[idx - 1]?.focus?.();
    }
    if (e.key === "ArrowRight" && idx < 5) {
      inputsRef.current[idx + 1]?.focus?.();
    }
  };

  const canResend = resendTimer <= 0;
  const timeLeft = resendTimer;

  return (
    <div className="min-h-screen pt-8 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 text-black">
      <Navbar />

      <section className="flex items-center justify-center pt-20 pb-10">
        <div className="w-full max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left Side - Image */}
            <div className="hidden lg:block">
              <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-2xl">
                <Image src="/images/lock.jpg" alt="Secure" fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute bottom-8 left-8 right-8 text-white">
                  <h3 className="text-3xl text-white font-bold mb-4">Hello!</h3>
                  <p className="text-lg opacity-90">
                    Proceed to change your password and continue your financial journey with APICTS-FX.
                  </p>
                  <div className="flex items-center gap-4 mt-6">
                    <div className="flex items-center gap-2">
                      <CheckCircle size={20} className="text-green-400" />
                      <span className="text-sm">Secure Login</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle size={20} className="text-green-400" />
                      <span className="text-sm">Instant Access</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full max-w-md mx-auto px-6">
              <div className="bg-white rounded-2xl shadow-2xl p-8">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Forgot Password</h2>
                  <p className="text-gray-600">Authenticate with a one-time code (OTP) sent to your email.</p>
                </div>

                {message && <div className="mb-4 text-center text-green-600 font-medium">{message}</div>}
                {error && <div className="mb-4 text-center text-red-600 font-medium">{error}</div>}

                {step === "request" && (
                  <form onSubmit={handleSendOtp} className="space-y-6">
                    <div>
                      <label className="block text-gray-700 mb-2 font-medium" htmlFor="email">Email Address</label>
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
                      className={`w-full font-bold py-3 rounded-lg text-lg text-white ${isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-green-600 hover:shadow-xl"}`}
                    >
                      {isLoading ? "Sending..." : "Send OTP"}
                    </button>

                    <div className="mt-4 text-center text-sm text-gray-600">
                      Remembered your password?{" "}
                      <Link href="/login" className="text-red-600 font-semibold hover:underline">Sign in</Link>
                    </div>
                  </form>
                )}

                {step === "verify" && (
                  <div className="space-y-6">
                    <div className="flex justify-center gap-3 mb-4">
                      {Array.from({ length: 6 }).map((_, index) => (
                        <input
                          key={index}
                          id={`otp-${index}`}
                          ref={(el) => (inputsRef.current[index] = el)}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={otpDigits[index]}
                          onChange={(e) => handleChange(e.target.value.replace(/\D/g, ""), index)}
                          onKeyDown={(e) => handleKeyDown(e, index)}
                          className="w-12 h-12 text-center border border-gray-300 rounded-md text-lg font-medium focus:border-green-600 focus:ring-2 focus:ring-green-200 outline-none"
                          aria-label={`OTP digit ${index + 1}`}
                        />
                      ))}
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <button
                        onClick={handleVerifyOtp}
                        disabled={isLoading}
                        className={`flex-1 font-bold py-3 rounded-lg text-lg text-white ${isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-green-600 hover:shadow-xl"}`}
                      >
                        {isLoading ? "Verifying..." : "Verify OTP"}
                      </button>

                      <button
                        type="button"
                        onClick={handleResend}
                        disabled={!canResend || isLoading}
                        className="px-4 py-3 rounded-lg bg-white border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                      >
                        {canResend ? "Resend OTP" : `Resend in ${timeLeft}s`}
                      </button>
                    </div>

                    <div className="mt-4 text-center text-sm text-gray-600">
                      Can't receive email?{" "}
                      <Link href="/contact" className="text-red-600 font-semibold hover:underline">Contact Support</Link>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* small toast */}
      {showToast && (
        <div className="fixed bottom-8 right-8 bg-green-600 text-white px-4 py-2 rounded-md shadow-lg z-50 transition-opacity duration-300">
          <div className="flex items-center gap-2">
            <CheckCircle size={16} />
            <span>OTP resent</span>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
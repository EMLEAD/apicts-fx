"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/Components/NavBar";
import Footer from "@/Components/Footer";

export default function ChangePasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get email and token from URL
  const [email, setEmail] = useState(searchParams?.get("email") || "");
  const [token, setToken] = useState(searchParams?.get("token") || "");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Add token validation on mount
  useEffect(() => {
    if (!token) {
      // no token -> allow old-password flow (do not redirect)
      return;
    }
    // token present: keep email readonly and optionally show a brief validation attempt
    setError("");
  }, [token]);

  const validate = () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) 
      return "Please enter a valid email.";
    if (!token && !oldPassword) 
      return "Enter your current password.";
    if (!newPassword || newPassword.length < 8) 
      return "New password must be at least 8 characters.";
    if (newPassword !== confirm) 
      return "Passwords do not match.";
    if (!token && newPassword === oldPassword) 
      return "New password must be different from the old one.";
    return null;
  };

  // POST to the save-new-password route (supports token-based reset and old-password flow)
  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError("");
    setSuccess("");
    const v = validate();
    if (v) return setError(v);

    setLoading(true);
    try {
      const payload = {
        email: email.trim().toLowerCase(),
        newPassword: newPassword.trim()
      };
      if (token) payload.token = token;
      else payload.oldPassword = oldPassword;

      const res = await fetch("/api/auth/save-new-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const contentType = res.headers.get("content-type") || "";
      const data = contentType.includes("application/json") ? await res.json() : { message: "Unexpected response" };

      if (!res.ok) throw new Error(data?.message || "Failed to change password");
      setSuccess(data.message || "Password changed successfully. Redirecting to login...");
      setNewPassword("");
      setConfirm("");
      setOldPassword("");
      setTimeout(() => router.push("/login"), 1400);
    } catch (err) {
      setError(err.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  // Make email field readonly if token present and hide current-password when token is present
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 text-black">
      <Navbar />

      <section className="min-h-screen flex items-center justify-center pt-20 pb-10">
        <div className="w-full max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            
            {/* Left Side - Hidden on mobile, visible on lg screens */}
            <div className="hidden lg:block pt-6">
              <div className="relative h-[600px] rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/images/changepass.jpg"
                  alt="Security"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute bottom-8 left-8 right-8 text-white">
                  <h3 className="text-3xl font-bold mb-4">Security Alert!!!</h3>
                  <p className="text-lg opacity-90">
                    Change your password and continue your journey with APICTS-FX.
                  </p>
                  <div className="flex items-center gap-4 mt-6">
                    <div className="flex items-center gap-2">
                      <CheckCircle size={20} className="text-green-400" />
                      <span className="text-sm">Bank-level Security</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle size={20} className="text-green-400" />
                      <span className="text-sm">24/7 Support</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Form (full width on mobile) */}
            <div className="w-full pt-6">
              <div className="bg-white rounded-2xl shadow-2xl p-8">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Change Password</h2>
                  <p className="text-gray-600">Update your account password</p>
                </div>

                {error && <div className="mb-4 text-sm text-red-600">{error}</div>}
                {success && <div className="mb-4 text-sm text-green-600">{success}</div>}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1 w-full px-3 py-2 border rounded-md"
                      placeholder="you@example.com"
                      required
                      readOnly={!!token}
                    />
                  </div>

                  {/* only show current password when there is no reset token */}
                  {!token && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Current password</label>
                      <input
                        type="password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        className="mt-1 w-full px-3 py-2 border rounded-md"
                        required
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700">New password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="mt-1 w-full px-3 py-2 border rounded-md"
                      placeholder="At least 8 characters"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Confirm new password</label>
                    <input
                      type="password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      className="mt-1 w-full px-3 py-2 border rounded-md"
                      required
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-red-600 hover:bg-green-600 text-white px-4 py-2 rounded-md font-semibold disabled:opacity-60"
                    >
                      {loading ? "Saving..." : "Save new password"}
                    </button>

                    <Link href="/login" className="bg-white text-black px-4 py-2 rounded-md hover:bg-green-600 hover:text-white font-semibold">
                      Back to login
                    </Link>
                  </div>
                </form>
              </div>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
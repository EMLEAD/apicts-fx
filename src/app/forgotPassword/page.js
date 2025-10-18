
import Link from "next/link";
import Image from "next/image";
import Navbar from '@/Components/NavBar';
import Footer from '@/Components/Footer';

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <main className=" flex pt-30 pb-10 items-center justify-center bg-white relative overflow-hidden">
        

        <div className="relative z-10 w-full max-w-md mx-auto bg-red-600 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
          <div className="flex flex-col items-center mb-8">
           
            <h2 className="text-3xl font-bold text-white mb-1">Forgot Password</h2>
            <p className="text-white text-center">
              Enter your email address for a One-Time Password (OTP).
            </p>
          </div>
          <form className="space-y-6">
            <div>
              <label
                className="block text-white mb-1 font-medium"
                htmlFor="email"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                className="w-full px-4 py-3 rounded-lg bg-white text-blue-900 font-semibold border border-blue-200 focus:outline-none focus:ring-2 focus:ring-green-400 transition"
                placeholder="you@email.com"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-900 hover:bg-green-600 text-white font-bold py-3 rounded-lg shadow-lg transition-all duration-300 text-lg"
            >
              Send OTP
            </button>
          </form>
          <div className="mt-8 text-center text-white">
            Remembered your password?{" "}
            <Link
              href="/login"
              className="text-blue-900 font-semibold hover:underline hover:text-green-500"
            >
              Login
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
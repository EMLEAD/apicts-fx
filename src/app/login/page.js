

import Link from "next/link";
import Image from "next/image";
import  Navbar  from '@/Components/NavBar'
import  Footer  from '@/Components/Footer'

export default function LoginPage() {
  return (
    <div className="min-h-screen">
      <Navbar />

<section className="min-h-screen flex pt-20 items-center justify-center bg-gradient-to-br from-green-500 via-blue-700 to-green-500 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-500 rounded-full mix-blend-multiply filter blur-xl animate-[blob_7s_infinite]"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-rose-500 rounded-full mix-blend-multiply filter blur-xl animate-[blob_7s_infinite_2s]"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-[blob_7s_infinite_4s]"></div>
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
        <div className="flex flex-col items-center mb-8">
          
          <h2 className="text-3xl font-bold text-white mb-1">Welcome Back</h2>
          <p className="text-blue-100">Sign in to your account</p>
        </div>
        <form className="space-y-6">
          <div>
            <label
              className="block text-blue-100 mb-1 font-medium"
              htmlFor="email"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              className="w-full px-4 py-3 rounded-lg bg-white/80 text-blue-900 font-semibold border border-blue-200 focus:outline-none focus:ring-2 focus:ring-green-400 transition"
              placeholder="you@email.com"
            />
          </div>
          <div>
            <label
              className="block text-blue-100 mb-1 font-medium"
              htmlFor="password"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full px-4 py-3 rounded-lg bg-white/80 text-blue-900 font-semibold border border-blue-200 focus:outline-none focus:ring-2 focus:ring-green-400 transition"
              placeholder="••••••••"
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center text-blue-100 text-sm">
              <input type="checkbox" className="mr-2 accent-green-500" />
              Remember me
            </label>
            <Link
              href="/forgot-password"
              className="text-green-300 hover:underline text-sm"
            >
              Forgot password?
            </Link>
          </div>
          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg shadow-lg transition-all duration-300 text-lg"
          >
            Sign In
          </button>
        </form>
        <div className="mt-8 text-center text-blue-100">
          Don&apos;`t have an account?{" "}
          <Link
            href="/register"
            className="text-green-300 font-semibold hover:underline"
          >
            Sign up
          </Link>
        </div>
      </div>
    </section>
      <Footer />
    </div>
  )
}


"use client";

import Link from "next/link";
import { Home, Search, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-rose-50 flex items-center justify-center px-6">
      <div className="max-w-2xl w-full text-center">
        {/* 404 Number */}
        <div className="mb-8">
          <h1 className="text-9xl md:text-[200px] font-bold text-blue-600 opacity-20">
            404
          </h1>
          <div className="-mt-20 md:-mt-32">
            <Search size={80} className="mx-auto text-rose-500 animate-bounce" />
          </div>
        </div>

        {/* Error Message */}
        <h2 className="text-4xl md:text-5xl font-bold text-blue-700 mb-4">
          Page Not Found
        </h2>
        <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
          Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/">
            <button className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-md font-semibold hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 shadow-md">
              <Home size={20} />
              Go to Homepage
            </button>
          </Link>
          
          <button 
            onClick={() => window.history.back()}
            className="flex items-center gap-2 border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-md font-semibold hover:bg-blue-600 hover:text-white hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 shadow-md"
          >
            <ArrowLeft size={20} />
            Go Back
          </button>
        </div>

        {/* Quick Links */}
        <div className="mt-12 pt-8 border-t border-gray-300">
          <p className="text-sm text-gray-500 mb-4">You might be looking for:</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/about" className="text-blue-600 hover:text-rose-500 font-medium transition-colors duration-300">
              About Us
            </Link>
            <span className="text-gray-400">•</span>
            <Link href="/contact" className="text-blue-600 hover:text-rose-500 font-medium transition-colors duration-300">
              Contact Us
            </Link>
            <span className="text-gray-400">•</span>
            <Link href="/blog" className="text-blue-600 hover:text-rose-500 font-medium transition-colors duration-300">
              Blog
            </Link>
            <span className="text-gray-400">•</span>
            <Link href="/vlog" className="text-blue-600 hover:text-rose-500 font-medium transition-colors duration-300">
              Vlog
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}


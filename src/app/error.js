"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-blue-50 flex items-center justify-center px-6">
      <div className="max-w-2xl w-full text-center">
        {/* Error Icon */}
        <div className="mb-8 relative">
          <div className="inline-block">
            <AlertCircle 
              size={120} 
              className="text-rose-500 animate-pulse" 
            />
            <div className="absolute inset-0 animate-ping">
              <AlertCircle 
                size={120} 
                className="text-rose-300 opacity-75" 
              />
            </div>
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-4xl md:text-5xl font-bold text-rose-600 mb-4">
          Oops! Something Went Wrong
        </h1>
        <p className="text-lg text-gray-600 mb-2 max-w-md mx-auto">
          We're sorry, but something unexpected happened. Don't worry, our team has been notified.
        </p>
        
        {/* Error Details (for development) */}
        {process.env.NODE_ENV === 'development' && error?.message && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md max-w-lg mx-auto">
            <p className="text-sm text-red-600 font-mono break-words">
              {error.message}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
          <button
            onClick={reset}
            className="flex items-center gap-2 bg-rose-500 text-white px-8 py-3 rounded-md font-semibold hover:bg-rose-600 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 shadow-md"
          >
            <RefreshCw size={20} />
            Try Again
          </button>
          
          <Link href="/">
            <button className="flex items-center gap-2 border-2 border-rose-500 text-rose-500 px-8 py-3 rounded-md font-semibold hover:bg-rose-500 hover:text-white hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 shadow-md">
              <Home size={20} />
              Go to Homepage
            </button>
          </Link>
        </div>

        {/* Help Section */}
        <div className="mt-12 pt-8 border-t border-gray-300">
          <p className="text-sm text-gray-500 mb-4">Need help?</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/contact" className="text-blue-600 hover:text-rose-500 font-medium transition-colors duration-300">
              Contact Support
            </Link>
            <span className="text-gray-400">•</span>
            <Link href="/" className="text-blue-600 hover:text-rose-500 font-medium transition-colors duration-300">
              Visit Homepage
            </Link>
            <span className="text-gray-400">•</span>
            <button 
              onClick={() => window.location.reload()}
              className="text-blue-600 hover:text-rose-500 font-medium transition-colors duration-300"
            >
              Refresh Page
            </button>
          </div>
        </div>

        {/* Additional Info */}
        <p className="text-xs text-gray-400 mt-8">
          Error Code: {error?.digest || 'UNKNOWN'} | Time: {new Date().toLocaleString()}
        </p>
      </div>
    </div>
  );
}


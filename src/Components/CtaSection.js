"use client";

import Link from "next/link";
import { ArrowRight, Users } from "lucide-react";

export default function CtaSection() {
  return (
    <section className="py-20 relative overflow-hidden bg-gradient-to-br from-cream-50 via-cream-100 to-cream-200">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-400 rounded-full mix-blend-multiply filter blur-xl animate-[blob_7s_infinite]"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl animate-[blob_7s_infinite_2s]"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl animate-[blob_7s_infinite_4s]"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-2 rounded-full mb-6 shadow-lg">
            <Users size={20} className="text-white" />
            <span className="font-semibold">Join 10,000+ Happy Customers</span>
          </div>

          {/* Heading */}
          <h2 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6 leading-tight">
            Ready to Exchange
            <span className="block bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">
              at the Best Rates?
            </span>
          </h2>

          {/* Description */}
          <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-2xl mx-auto">
            Experience seamless currency exchange with bank-level security, instant processing, 
            and 24/7 customer support. Start trading today!
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/get-started">
              <button className="group bg-red-600 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-green-600 hover:text-white transition-all duration-300 shadow-2xl hover:shadow-green-500/50 hover:-translate-y-1 flex items-center gap-2">
                Get Started Free
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </button>
            </Link>
            
            <Link href="/contact">
              <button className="border-2 border-red-300 text-red-600 px-10 py-4 rounded-full font-bold text-lg hover:bg-green-600 hover:text-white transition-all duration-300 shadow-2xl">
                Contact Sales
              </button>
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-gray-600">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">No Hidden Fees</span>
            </div>
            
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">Instant Processing</span>
            </div>
            
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">24/7 Support</span>
            </div>
            
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">Secure & Verified</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


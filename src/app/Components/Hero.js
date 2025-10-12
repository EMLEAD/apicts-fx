"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, TrendingUp, Shield, Zap } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 pt-20">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-500 rounded-full mix-blend-multiply filter blur-xl animate-[blob_7s_infinite]"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-rose-500 rounded-full mix-blend-multiply filter blur-xl animate-[blob_7s_infinite_2s]"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-[blob_7s_infinite_4s]"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-white space-y-6">
            <div className="inline-block">
              <span className="bg-green-500 text-white text-sm font-semibold px-4 py-2 rounded-full">
                🇳🇬 CAC Registered • Leading Exchange Provider
              </span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              Global Currency Exchange
              <span className="block bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
                Made Simple
              </span>
            </h1>
            
            <p className="text-xl text-blue-100 leading-relaxed">
              Trade fiat currencies, e-currencies, and cryptocurrencies with confidence. 
              Secure, fast, and reliable exchange services powered by advanced technology.
            </p>

            {/* Feature highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <div className="bg-green-500 p-2 rounded-lg">
                  <Shield size={20} />
                </div>
                <div>
                  <p className="font-semibold">Secure</p>
                  <p className="text-xs text-blue-200">Bank-level security</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <div className="bg-rose-500 p-2 rounded-lg">
                  <Zap size={20} />
                </div>
                <div>
                  <p className="font-semibold">Instant</p>
                  <p className="text-xs text-blue-200">Real-time processing</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <div className="bg-blue-500 p-2 rounded-lg">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <p className="font-semibold">Best Rates</p>
                  <p className="text-xs text-blue-200">Competitive pricing</p>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Link href="/get-started">
                <button className="group bg-green-500 text-white px-8 py-4 rounded-lg font-semibold hover:bg-green-600 transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center justify-center gap-2">
                  Get Started Now
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                </button>
              </Link>
              
              <Link href="/rates">
                <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-700 transition-all duration-300 shadow-xl">
                  View Live Rates
                </button>
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center gap-6 pt-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-green-400 text-2xl">★★★★★</span>
                <span className="text-blue-200">4.9/5 Rating</span>
              </div>
              <div className="h-6 w-px bg-blue-400"></div>
              <div className="text-blue-200">
                <span className="font-bold text-white">10,000+</span> Happy Customers
              </div>
            </div>
          </div>

          {/* Right Content - Image/Illustration */}
          <div className="relative">
            {/* Hero Image */}
            <div className="relative mb-8">
              <div className="relative h-64 rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/images/hero-exchange.jpg"
                  alt="Currency Exchange Platform"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
              {/* Exchange Card Mockup */}
              <div className="bg-white rounded-xl p-6 shadow-xl">
                <h3 className="text-gray-800 font-bold text-lg mb-4">Quick Exchange</h3>
                
                <div className="space-y-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <label className="text-xs text-gray-600 mb-1 block">You Send</label>
                    <div className="flex justify-between items-center">
                      <input 
                        type="text" 
                        value="1,000" 
                        className="bg-transparent text-2xl font-bold text-gray-800 outline-none w-full"
                        readOnly
                      />
                      <span className="text-lg font-semibold text-blue-600">USD</span>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <div className="bg-blue-600 p-2 rounded-full">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4">
                    <label className="text-xs text-gray-600 mb-1 block">You Receive</label>
                    <div className="flex justify-between items-center">
                      <input 
                        type="text" 
                        value="1,560,000" 
                        className="bg-transparent text-2xl font-bold text-gray-800 outline-none w-full"
                        readOnly
                      />
                      <span className="text-lg font-semibold text-green-600">NGN</span>
                    </div>
                  </div>

                  <button className="w-full bg-gradient-to-r from-blue-600 to-green-500 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300">
                    Exchange Now
                  </button>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                  <span>Rate: 1 USD = 1,560 NGN</span>
                  <span className="text-green-600 font-semibold">Live</span>
                </div>
              </div>

              {/* Floating badges */}
              <div className="absolute -top-4 -right-4 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg animate-bounce">
                ✓ Verified
              </div>
              <div className="absolute -bottom-4 -left-4 bg-rose-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                24/7 Support
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V120Z" fill="white"/>
        </svg>
      </div>

    </section>
  );
}


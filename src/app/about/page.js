
import Navbar from "@/Components/Navbar";
import Footer from "@/Components/Footer";
import Image from "next/image";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen  flex flex-col">
      <Navbar />
      <section className="relative flex-1 flex items-center justify-center overflow-hidden bg-gradient-to-br from-green-600 via-blue-700 to-green-600 pt-20 pb-10">
        {/* Animated background blobs */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-green-500 rounded-full mix-blend-multiply filter blur-xl animate-[blob_7s_infinite]"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-rose-500 rounded-full mix-blend-multiply filter blur-xl animate-[blob_7s_infinite_2s]"></div>
          <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-[blob_7s_infinite_4s]"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-white space-y-6">
              <span className="bg-red-500 text-white text-sm font-semibold px-4 py-2 rounded-full inline-block">
                About Apicts-FX & Academy
              </span>
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                Empowering Your <span className="bg-gradient-to-r from-red-400 to-emerald-200 bg-clip-text text-transparent">Financial Future</span>
              </h1>
              <p className="text-xl text-blue-100 leading-relaxed">
                <b>Apicts-FX</b> is Nigeria’s leading digital currency exchange and financial education platform. We provide secure, fast, and reliable services for trading fiat, e-currencies, and cryptocurrencies. Our mission is to make global currency exchange simple, accessible, and trustworthy for everyone.
              </p>
              <p className="text-lg text-blue-200">
                <b>Apicts Academy</b> is our educational arm, dedicated to empowering individuals and businesses with the knowledge and skills needed to thrive in the digital finance world. From beginner to advanced, our courses, webinars, and mentorship programs are designed to help you succeed.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 flex items-center gap-3">
                  <div className="bg-green-500 p-2 rounded-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0-1.104.896-2 2-2s2 .896 2 2-.896 2-2 2-2-.896-2-2zm0 0V7m0 4v4m0 0c0 1.104-.896 2-2 2s-2-.896-2-2 .896-2 2-2 2 .896 2 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold">Trusted Exchange</p>
                    <p className="text-xs text-blue-200">Registered & Regulated</p>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 flex items-center gap-3">
                  <div className="bg-blue-500 p-2 rounded-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold">24/7 Support</p>
                    <p className="text-xs text-blue-200">Always Here for You</p>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 flex items-center gap-3">
                  <div className="bg-rose-500 p-2 rounded-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12c0 4.418-4.03 8-9 8s-9-3.582-9-8 4.03-8 9-8 9 3.582 9 8z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold">Academy</p>
                    <p className="text-xs text-blue-200">Learn & Grow</p>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 flex items-center gap-3">
                  <div className="bg-green-500 p-2 rounded-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a5 5 0 00-10 0v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold">Secure & Fast</p>
                    <p className="text-xs text-blue-200">Bank-level Security</p>
                  </div>
                </div>
              </div>
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Link href="/signUp">
                  <button className="group bg-green-500 text-white px-8 py-4 rounded-lg font-semibold hover:bg-green-600 transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center justify-center gap-2">
                    Join Apicts-FX
                  </button>
                </Link>
                <Link href="/vlog">
                  <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-700 transition-all duration-300 shadow-xl">
                    Explore Academy
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
              <div className="relative mb-8 mt-8">
                <div className="relative h-64 rounded-2xl overflow-hidden shadow-2xl">
                  <Image
                    src="/images/CFDs.jpg"
                    alt="Apicts-FX Platform"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
                <div className="bg-white rounded-xl p-6 shadow-xl">
                  <h3 className="text-gray-800 font-bold text-lg mb-4">Our Vision</h3>
                  <p className="text-gray-700 mb-2">
                    To be Africa’s most trusted and innovative digital exchange and financial education provider.
                  </p>
                  <h3 className="text-gray-800 font-bold text-lg mt-6 mb-4">Our Core Values</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Integrity & Transparency</li>
                    <li>Customer-Centric Service</li>
                    <li>Continuous Learning</li>
                    <li>Innovation & Security</li>
                  </ul>
                  <h3 className="text-gray-800 font-bold text-lg mt-6 mb-4">Contact Us</h3>
                  <p className="text-gray-700">
                    <b>Email:</b> support@apicts.com<br />
                    <b>Phone:</b> +2348139399978<br />
                    <b>Address:</b> Km 18, Topaz Plaza, New Road, Lekki Ajah, Lagos, Nigeria
                  </p>
                </div>
                {/* Floating badges */}
                <div className="absolute -top-4 -right-4 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg animate-bounce">
                  CAC Registered
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
      <Footer />
    </div>
  );
}
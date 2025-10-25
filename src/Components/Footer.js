"use client";

import { Twitter, Instagram, Linkedin, Youtube, ArrowUp } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function Footer() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <footer className="relative w-full bg-black/90 backdrop-blur-md text-white py-12 px-6 md:px-20 pt-12 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-64 h-64 bg-red-500 rounded-full mix-blend-multiply filter blur-xl animate-[blob_7s_infinite]"></div>
        <div className="absolute top-20 right-20 w-64 h-64 bg-green-500 rounded-full mix-blend-multiply filter blur-xl animate-[blob_7s_infinite_2s]"></div>
        <div className="absolute -bottom-10 left-1/2 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-[blob_7s_infinite_4s]"></div>
      </div>
      <div className="relative z-10 mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 mb-8">
        
        {/* Company */}
        <div className="space-y-4 group">
          <h3 className="font-bold text-xl mb-4 border-b-2 border-red-500 pb-2 inline-block group-hover:border-green-400 transition-colors duration-300">Company</h3>
          <ul className="space-y-3 text-sm">
            <li className="group/link">
              <Link href="/" className="hover:text-green-400 transition-all duration-300 hover:translate-x-1 inline-block">
                Home
              </Link>
            </li>
            <li className="group/link">
              <Link href="/about" className="hover:text-green-400 transition-all duration-300 hover:translate-x-1 inline-block">
                About Us
              </Link>
            </li>
            <li className="group/link">
              <Link href="/blog" className="hover:text-green-400 transition-all duration-300 hover:translate-x-1 inline-block">
                Blog
              </Link>
            </li>
            <li className="group/link">
              <Link href="/vlog" className="hover:text-green-400 transition-all duration-300 hover:translate-x-1 inline-block">
                Vlog
              </Link>
            </li>
          </ul>
        </div>

        {/* Legal */}
        <div className="space-y-4 group">
          <h3 className="font-bold text-xl mb-4 border-b-2 border-red-500 pb-2 inline-block group-hover:border-green-400 transition-colors duration-300">Legal</h3>
          <ul className="space-y-3 text-sm">
            <li>
              <a href="termsandconditions" className="hover:text-red-400 transition-colors duration-300">
                Terms of Use
              </a>
            </li>
            <li className="group/link">
              <a href="#" className="hover:text-green-400 transition-all duration-300 hover:translate-x-1 inline-block">
                Privacy Policy
              </a>
            </li>
            <li className="group/link">
              <a href="#" className="hover:text-green-400 transition-all duration-300 hover:translate-x-1 inline-block">
                Cookie Policy
              </a>
            </li>
          </ul>
        </div>

        {/* Support */}
        <div className="space-y-4 group">
          <h3 className="font-bold text-xl mb-4 border-b-2 border-red-500 pb-2 inline-block group-hover:border-green-400 transition-colors duration-300">Support</h3>
          <ul className="space-y-3 text-sm">
            <li className="group/link">
              <Link href="/contact" className="hover:text-green-400 transition-all duration-300 hover:translate-x-1 inline-block">
                Contact Us
              </Link>
            </li>
            <li className="group/link">
              <a href="#" className="hover:text-green-400 transition-all duration-300 hover:translate-x-1 inline-block">
                FAQs
              </a>
            </li>
            <li className="group/link">
              <a href="#" className="hover:text-green-400 transition-all duration-300 hover:translate-x-1 inline-block">
                Help Center
              </a>
            </li>
          </ul>
        </div>

        {/* Contact Us */}
        <div className="space-y-4 group">
          <h3 className="font-bold text-xl mb-4 border-b-2 border-red-500 pb-2 inline-block group-hover:border-green-400 transition-colors duration-300">Contact Us</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2 group/link">
              <span className="font-semibold text-red-400 group-hover/link:text-green-400 transition-colors duration-300">Email:</span>
              <span className="group-hover/link:text-green-400 transition-colors duration-300">support@apicts.com</span>
            </li>
            <li className="flex items-start gap-2 group/link">
              <span className="font-semibold text-red-400 group-hover/link:text-green-400 transition-colors duration-300">Phone:</span>
              <span className="group-hover/link:text-green-400 transition-colors duration-300">+2348139399978</span>
            </li>
            <li className="flex items-start gap-2 group/link">
              <span className="font-semibold text-red-400 group-hover/link:text-green-400 transition-colors duration-300">Address:</span>
              <span className="group-hover/link:text-green-400 transition-colors duration-300">
                Km 18, Topaz Plaza, New Road,<br />
                Lekki Ajah, Lagos
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Divider */}
      <hr className="relative z-10 border-t-2 border-red-500/30 mb-6" />

      {/* Bottom Section */}
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-center text-sm">
        <p className="text-white font-medium group">
          <span className="group-hover:text-green-400 transition-colors duration-300">Apicts © 2025. All rights reserved.</span>
        </p>
        <div className="flex space-x-6 mt-4 md:mt-0">
          <a href="https://www.youtube.com/@apictsforex" className="text-white hover:text-red-400 transition-colors duration-300">
            <Youtube size={24} />
          </a>
          <a href="#" className="text-white hover:text-green-400 transition-all duration-300 hover:scale-110 hover:-translate-y-1">
            <Twitter size={24} />
          </a>
          <a href="#" className="text-white hover:text-green-400 transition-all duration-300 hover:scale-110 hover:-translate-y-1">
            <Linkedin size={24} />
          </a>
          <a href="#" className="text-white hover:text-green-400 transition-all duration-300 hover:scale-110 hover:-translate-y-1">
            <Instagram size={24} />
          </a>
        </div>
      </div>

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-8 right-8 z-50 bg-red-600 hover:bg-green-600 text-white p-3 rounded-full shadow-2xl transition-all duration-500 ease-in-out hover:scale-110 hover:-translate-y-1 ${
          showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        aria-label="Scroll to top"
      >
        <ArrowUp size={24} />
      </button>
    </footer>
  );
}


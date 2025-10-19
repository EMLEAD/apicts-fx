"use client";

import Image from "next/image";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { useState, useEffect } from "react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const heroHeight = window.innerHeight; // Approximate hero section height
      setIsScrolled(scrollPosition > heroHeight * 0.8);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed w-full top-0 left-0 z-50 transition-all duration-500 ease-in-out ${
      isScrolled 
        ? 'bg-black/90 backdrop-blur-md shadow-2xl' 
        : 'bg-white/10 backdrop-blur-lg shadow-lg'
    }`}>
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        
        {/* Logo */}
        <Link href="/" className="group">
          <Image 
            src="/images/apicts-logo.jpg" 
            alt="Logo" 
            width={42} 
            height={42} 
            className="h-10 w-10 rounded-full cursor-pointer border-2 border-white shadow-md hover:scale-110 hover:rotate-6 transition-all duration-500 ease-in-out group-hover:shadow-xl" 
          />
        </Link>
        
        {/* Navigation Links */}
        <ul className={`hidden md:flex space-x-8 font-semibold transition-colors duration-500 ${
          isScrolled ? 'text-green-600' : 'text-white'
        }`}>
          <li>
            <Link href="/" className="relative group py-2 transition-all duration-300 cursor-pointer">
              <span className={`transition-colors duration-300 ${
                isScrolled ? 'group-hover:text-green-300' : 'group-hover:text-red-500'
              }`}>Home</span>
              <span className={`absolute bottom-0 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300 ease-out ${
                isScrolled ? 'bg-green-300' : 'bg-red-500'
              }`}></span>
            </Link>
          </li>
          <li>
            <Link href="/about" className="relative group py-2 transition-all duration-300 cursor-pointer">
              <span className={`transition-colors duration-300 ${
                isScrolled ? 'group-hover:text-green-300' : 'group-hover:text-red-500'
              }`}>About Us</span>
              <span className={`absolute bottom-0 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300 ease-out ${
                isScrolled ? 'bg-green-300' : 'bg-red-500'
              }`}></span>
            </Link>
          </li>
          <li>
            <Link href="/contact" className="relative group py-2 transition-all duration-300 cursor-pointer">
              <span className={`transition-colors duration-300 ${
                isScrolled ? 'group-hover:text-green-300' : 'group-hover:text-red-500'
              }`}>Contact Us</span>
              <span className={`absolute bottom-0 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300 ease-out ${
                isScrolled ? 'bg-green-300' : 'bg-red-500'
              }`}></span>
            </Link>
          </li>
          <li>
            <Link href="/blog" className="relative group py-2 transition-all duration-300 cursor-pointer">
              <span className={`transition-colors duration-300 ${
                isScrolled ? 'group-hover:text-green-300' : 'group-hover:text-red-500'
              }`}>Blog</span>
              <span className={`absolute bottom-0 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300 ease-out ${
                isScrolled ? 'bg-green-300' : 'bg-red-500'
              }`}></span>
            </Link>
          </li>
          <li>
            <Link href="/vlog" className="relative group py-2 transition-all duration-300 cursor-pointer">
              <span className={`transition-colors duration-300 ${
                isScrolled ? 'group-hover:text-green-300' : 'group-hover:text-red-500'
              }`}>Vlog</span>
              <span className={`absolute bottom-0 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300 ease-out ${
                isScrolled ? 'bg-green-300' : 'bg-red-500'
              }`}></span>
            </Link>
          </li>
        </ul>
        
        {/* Buttons */}
        <div className="hidden md:flex space-x-4 items-center">
          <MessageCircle 
            size={38} 
            className={`cursor-pointer hover:scale-110 transition-all duration-300 ease-in-out ${
              isScrolled ? 'text-green-600 hover:text-green-300' : 'text-white hover:text-rose-400'
            }`}
          />
          <Link href="/register">
            <button className={`cursor-pointer px-6 py-2.5 rounded-md font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 ease-in-out shadow-md ${
              isScrolled 
                ? 'bg-red-600 text-white hover:bg-green-600' 
                : 'bg-red-600 text-white hover:bg-green-600'
            }`}>
              Get Started
            </button>
          </Link>
          <Link href="/login">
            <button className={`border-2 cursor-pointer px-6 py-2.5 rounded-md font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 ease-in-out shadow-md ${
              isScrolled 
                ? 'border-red-600 text-red-600 hover:bg-green-600 hover:text-white' 
                : 'border-white text-white hover:bg-green-600 hover:text-white'
            }`}>
              Login
            </button>
          </Link>
        </div>

        {/* Hamburger Menu Button */}
        <button 
          onClick={toggleMenu}
          className="md:hidden flex flex-col justify-center items-center w-10 h-10 space-y-1.5 group"
          aria-label="Toggle menu"
        >
          <span 
            className={`block w-7 h-0.5 transition-all duration-300 ease-in-out ${
              isScrolled ? 'bg-green-600' : 'bg-white'
            } ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}
          ></span>
          <span 
            className={`block w-7 h-0.5 transition-all duration-300 ease-in-out ${
              isScrolled ? 'bg-green-600' : 'bg-white'
            } ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`}
          ></span>
          <span 
            className={`block w-7 h-0.5 transition-all duration-300 ease-in-out ${
              isScrolled ? 'bg-green-600' : 'bg-white'
            } ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}
          ></span>
        </button>
      </div>

      {/* Mobile Menu */}
      <div 
        className={`md:hidden overflow-hidden transition-all duration-500 ease-in-out ${
          isScrolled ? 'bg-black/95 backdrop-blur-md' : 'bg-blue-700'
        } ${isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="container mx-auto px-6 py-4 space-y-4">
          {/* Mobile Navigation Links */}
          <Link 
            href="/" 
            onClick={toggleMenu}
            className={`block font-semibold py-3 px-4 rounded-md transition-all duration-300 ${
              isScrolled 
                ? 'text-green-600 hover:bg-green-900/50 hover:text-green-300' 
                : 'text-white hover:bg-blue-800 hover:text-rose-300'
            }`}
          >
            Home
          </Link>
          <Link 
            href="/about" 
            onClick={toggleMenu}
            className={`block font-semibold py-3 px-4 rounded-md transition-all duration-300 ${
              isScrolled 
                ? 'text-green-600 hover:bg-green-900/50 hover:text-green-300' 
                : 'text-white hover:bg-blue-800 hover:text-rose-300'
            }`}
          >
            About Us
          </Link>
          <Link 
            href="/contact" 
            onClick={toggleMenu}
            className={`block font-semibold py-3 px-4 rounded-md transition-all duration-300 ${
              isScrolled 
                ? 'text-green-600 hover:bg-green-900/50 hover:text-green-300' 
                : 'text-white hover:bg-blue-800 hover:text-rose-300'
            }`}
          >
            Contact Us
          </Link>
          <Link 
            href="/blog" 
            onClick={toggleMenu}
            className={`block font-semibold py-3 px-4 rounded-md transition-all duration-300 ${
              isScrolled 
                ? 'text-green-600 hover:bg-green-900/50 hover:text-green-300' 
                : 'text-white hover:bg-blue-800 hover:text-rose-300'
            }`}
          >
            Blog
          </Link>
          <Link 
            href="/vlog" 
            onClick={toggleMenu}
            className={`block font-semibold py-3 px-4 rounded-md transition-all duration-300 ${
              isScrolled 
                ? 'text-green-600 hover:bg-green-900/50 hover:text-green-300' 
                : 'text-white hover:bg-blue-800 hover:text-rose-300'
            }`}
          >
            Vlog
          </Link>

          {/* Mobile Buttons */}
          <div className={`pt-4 space-y-3 border-t ${
            isScrolled ? 'border-green-500' : 'border-blue-500'
          }`}>
            <Link href="/register" onClick={toggleMenu}>
              <button className={`w-full px-6 py-3 rounded-md font-semibold transition-all duration-300 shadow-md ${
                isScrolled 
                  ? 'bg-red-600 text-white hover:bg-green-600' 
                  : 'bg-red-600 text-white hover:bg-green-600'
              }`}>
                Get Started
              </button>
            </Link>
            <Link href="/login" onClick={toggleMenu}>
              <button className={`w-full border-2 px-6 py-3 rounded-md font-semibold transition-all duration-300 shadow-md ${
                isScrolled 
                  ? 'border-red-600 text-red-600 hover:bg-green-600 hover:text-white' 
                  : 'border-white text-white hover:bg-green-600 hover:text-white'
              }`}>
                Login
              </button>
            </Link>
          </div>

          {/* Mobile Message Icon */}
          <div className="flex justify-center pt-4">
            <MessageCircle 
              size={32} 
              className={`transition-colors duration-300 ${
                isScrolled ? 'text-green-600 hover:text-green-300' : 'text-white hover:text-rose-300'
              }`}
            />
          </div>
        </div>
      </div>
    </nav>
  );
}


"use client";

import Image from "next/image";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-blue-600 shadow-lg fixed w-full top-0 left-0 z-50 backdrop-blur-sm">
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
        <ul className="hidden md:flex space-x-8 text-white font-semibold">
          <li>
            <Link href="/" className="relative group py-2 transition-all duration-300 cursor-pointer">
              <span className="group-hover:text-rose-300 transition-colors duration-300">Home</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-rose-300 group-hover:w-full transition-all duration-300 ease-out"></span>
            </Link>
          </li>
          <li>
            <Link href="/about" className="relative group py-2 transition-all duration-300 cursor-pointer">
              <span className="group-hover:text-rose-300 transition-colors duration-300">About Us</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-rose-300 group-hover:w-full transition-all duration-300 ease-out"></span>
            </Link>
          </li>
          <li>
            <Link href="/contact" className="relative group py-2 transition-all duration-300 cursor-pointer">
              <span className="group-hover:text-rose-300 transition-colors duration-300">Contact Us</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-rose-300 group-hover:w-full transition-all duration-300 ease-out"></span>
            </Link>
          </li>
          <li>
            <Link href="/blog" className="relative group py-2 transition-all duration-300 cursor-pointer">
              <span className="group-hover:text-rose-300 transition-colors duration-300">Blog</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-rose-300 group-hover:w-full transition-all duration-300 ease-out"></span>
            </Link>
          </li>
          <li>
            <Link href="/vlog" className="relative group py-2 transition-all duration-300 cursor-pointer">
              <span className="group-hover:text-rose-300 transition-colors duration-300">Vlog</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-rose-300 group-hover:w-full transition-all duration-300 ease-out"></span>
            </Link>
          </li>
        </ul>
        
        {/* Buttons */}
        <div className="hidden md:flex space-x-4 items-center">
          <MessageCircle 
            size={38} 
            className="cursor-pointer text-white hover:text-rose-300 hover:scale-110 transition-all duration-300 ease-in-out" 
          />
          <Link href="/register">
            <button className="bg-rose-500 text-white px-6 py-2.5 rounded-md font-semibold hover:bg-rose-600 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 ease-in-out shadow-md">
              Get Started
            </button>
          </Link>
          <Link href="/login">
            <button className="border-2 border-white text-white px-6 py-2.5 rounded-md font-semibold hover:bg-white hover:text-blue-600 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 ease-in-out shadow-md">
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
            className={`block w-7 h-0.5 bg-white transition-all duration-300 ease-in-out ${
              isMenuOpen ? 'rotate-45 translate-y-2' : ''
            }`}
          ></span>
          <span 
            className={`block w-7 h-0.5 bg-white transition-all duration-300 ease-in-out ${
              isMenuOpen ? 'opacity-0' : 'opacity-100'
            }`}
          ></span>
          <span 
            className={`block w-7 h-0.5 bg-white transition-all duration-300 ease-in-out ${
              isMenuOpen ? '-rotate-45 -translate-y-2' : ''
            }`}
          ></span>
        </button>
      </div>

      {/* Mobile Menu */}
      <div 
        className={`md:hidden bg-blue-700 overflow-hidden transition-all duration-500 ease-in-out ${
          isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="container mx-auto px-6 py-4 space-y-4">
          {/* Mobile Navigation Links */}
          <Link 
            href="/" 
            onClick={toggleMenu}
            className="block text-white font-semibold py-3 px-4 hover:bg-blue-800 hover:text-rose-300 rounded-md transition-all duration-300"
          >
            Home
          </Link>
          <Link 
            href="/about" 
            onClick={toggleMenu}
            className="block text-white font-semibold py-3 px-4 hover:bg-blue-800 hover:text-rose-300 rounded-md transition-all duration-300"
          >
            About Us
          </Link>
          <Link 
            href="/contact" 
            onClick={toggleMenu}
            className="block text-white font-semibold py-3 px-4 hover:bg-blue-800 hover:text-rose-300 rounded-md transition-all duration-300"
          >
            Contact Us
          </Link>
          <Link 
            href="/blog" 
            onClick={toggleMenu}
            className="block text-white font-semibold py-3 px-4 hover:bg-blue-800 hover:text-rose-300 rounded-md transition-all duration-300"
          >
            Blog
          </Link>
          <Link 
            href="/vlog" 
            onClick={toggleMenu}
            className="block text-white font-semibold py-3 px-4 hover:bg-blue-800 hover:text-rose-300 rounded-md transition-all duration-300"
          >
            Vlog
          </Link>

          {/* Mobile Buttons */}
          <div className="pt-4 space-y-3 border-t border-blue-500">
            <Link href="/get-started" onClick={toggleMenu}>
              <button className="w-full bg-rose-500 text-white px-6 py-3 rounded-md font-semibold hover:bg-rose-600 transition-all duration-300 shadow-md">
                Get Started
              </button>
            </Link>
            <Link href="/login" onClick={toggleMenu}>
              <button className="w-full border-2 border-white text-white px-6 py-3 rounded-md font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300 shadow-md">
                Login
              </button>
            </Link>
          </div>

          {/* Mobile Message Icon */}
          <div className="flex justify-center pt-4">
            <MessageCircle 
              size={32} 
              className="text-white hover:text-rose-300 transition-colors duration-300" 
            />
          </div>
        </div>
      </div>
    </nav>
  );
}


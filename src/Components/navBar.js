import Image from "next/image";
import Link from "next/link";
import { MessageCircle } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="bg-white shadow-md fixed w-full top-0 left-0 z-50">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        
        {/* Logo */}
        <Link href="/">
          <Image 
            src="/images/apicts-logo.jpg" 
            alt="Logo" 
            width={42} 
            height={42} 
            className="h-8 w-8 rounded-full cursor-pointer" 
          />
        </Link>
        
        {/* Navigation Links */}
        <ul className="hidden md:flex space-x-8 text-[#001F5B] font-medium">
          <li>
            <Link href="/" className="hover:text-red-500 cursor-pointer">
              Home
            </Link>
          </li>
          <li>
            <Link href="/about" className="hover:text-red-500 cursor-pointer">
              About Us
            </Link>
          </li>
          <li>
            <Link href="/contact" className="hover:text-red-500 cursor-pointer">
              Contact Us
            </Link>
          </li>
          <li>
            <Link href="/blog" className="hover:text-red-500 cursor-pointer">
              Blog
            </Link>
          </li>
          <li>
            <Link href="/vlog" className="hover:text-red-500 cursor-pointer">
              Vlog
            </Link>
          </li>
        </ul>
        
        {/* Buttons */}
        <div className="hidden md:flex space-x-4 items-center">
          <MessageCircle size={38} color="#001F5B" className="cursor-pointer" />
          <Link href="/get-started">
            <button className="bg-blue-900 text-white px-4 py-2 rounded-md hover:bg-blue-800">
              Get Started
            </button>
          </Link>
          <Link href="/login">
            <button className="border border-blue-900 text-blue-900 px-4 py-2 rounded-md hover:bg-blue-900 hover:text-white">
              Login
            </button>
          </Link>
        </div>
      </div>
    </nav>
  );
}


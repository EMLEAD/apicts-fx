
import logo from "@/Components/Assets/apicts-logo.jpg"

import { FaTwitter, FaInstagram, FaLinkedin, FaCommentDots, FaYoutube } from "react-icons/fa";

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <nav className="bg-white shadow-md fixed w-full top-0 left-0 z-50">
            <div className="container mx-auto px-6 py-4 flex justify-between items-center">
      
              {/* Logo */}
              <div >
                <img src={logo} alt="Logo" className="h-8 w-8 rounded-full" />
              </div>
      
              {/* Navigation Links */}
              <ul className="hidden md:flex space-x-8 text-[#001F5B] font-medium">
                <li className="hover:text-red-500 cursor-pointer">Home</li>
                <li className="hover:text-red-500 cursor-pointer">About Us</li>
                <li className="hover:text-red-500 cursor-pointer">Contact Us</li>
                <li className="hover:text-red-500 cursor-pointer">Blog</li>
                <li className="hover:text-red-500 cursor-pointer">Vlog</li>
              </ul>
      
              {/* Buttons */}
              <div className="hidden md:flex space-x-4">
                <FaCommentDots size={38} color="#001F5B" />
                <button className="bg-blue-900 text-white px-4 py-2 rounded-md hover:bg-blue-800">
                  Get Started
                </button>
                <button className="border border-blue-900 text-blue-900 px-4 py-2 rounded-md hover:bg-blue-900 hover:text-white">
                  Login
                </button>
              </div>
    
            </div>
          </nav>


        <footer className="h-2 w-full bg-white text-[#001F5B] py-10 px-6 md:px-20 border-t border-[#001F5B]">
      <div className="mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-10 mb-8">
       

        {/* Company */}
        <div>
          <h3 className="font-bold text-lg mb-3">Company</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:underline">Home</a></li>
            <li><a href="#" className="hover:underline">About Us</a></li>
            <li><a href="#" className="hover:underline">Blog</a></li>
            <li><a href="#" className="hover:underline">Vlog</a></li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h3 className="font-bold text-lg mb-3">Legal</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:underline">Terms of Use</a></li>
            <li><a href="#" className="hover:underline">Privacy Policy</a></li>
            <li><a href="#" className="hover:underline">Cookie Policy</a></li>
           
          </ul>
        </div>

        {/* Support */}
        <div>
          <h3 className="font-bold text-lg mb-3">Support</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:underline">Contact Us</a></li>
            <li><a href="#" className="hover:underline">FAQs</a></li>
            <li><a href="#" className="hover:underline">Help Center</a></li>
          </ul>
        </div>

        {/* Contact Us */}
        <div>
          <h3 className="font-bold text-lg mb-3">Contact Us</h3>
          <ul className="space-y-2 text-sm">
            <li><span className="font-semibold">Email:</span> support@apicts.com</li>
            <li><span className="font-semibold">Phone:</span> +2348139399978</li>
            <li>
              <span className="font-semibold">Address:</span><br />
              Km 18, Topaz Plaza, New Road, <br />
              Lekki Ajah, Lagos
            </li>
          </ul>
        </div>
      </div>

      {/* Divider */}
      <hr className="border-t border-[#001F5B] mb-6" />

      {/* Bottom Section */}
      <div className="flex flex-col md:flex-row justify-between items-center text-sm text-[#001F5B]">
        <p>Apicts © 2025. All rights reserved.</p>
        <div className="flex space-x-5 mt-4 md:mt-0">
          <a href="#" className="hover:text-red-600"><FaYoutube size={20} /></a>
          <a href="#" className="hover:text-blue-700"><FaTwitter size={20} /></a>
          <a href="#" className="hover:text-blue-700"><FaLinkedin size={20} /></a>
          <a href="#" className="hover:text-red-600"><FaInstagram size={20} /></a>
        </div>
      </div>
    </footer>
      
     
    </div>
  );
}

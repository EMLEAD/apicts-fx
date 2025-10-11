import React from 'react'
import logo from "../Components/Assets/apicts-logo.jpg"

const Navbar = () => {
   
  return (
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
  );

}


export default Navbar;
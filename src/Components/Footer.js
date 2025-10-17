import { Twitter, Instagram, Linkedin, Youtube } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-gradient-to-br from-green-500 via-blue-900 to-red-900 text-white py-12 px-6 md:px-20 pt-12">
      <div className="mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 mb-8">
        
        {/* Company */}
        <div className="space-y-4">
          <h3 className="font-bold text-xl mb-4 border-b-2 border-red-500 pb-2 inline-block">Company</h3>
          <ul className="space-y-3 text-sm">
            <li>
              <Link href="/" className="hover:text-red-400 transition-colors duration-300">
                Home
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-red-400 transition-colors duration-300">
                About Us
              </Link>
            </li>
            <li>
              <Link href="/blog" className="hover:text-red-400 transition-colors duration-300">
                Blog
              </Link>
            </li>
            <li>
              <Link href="/vlog" className="hover:text-red-400 transition-colors duration-300">
                Vlog
              </Link>
            </li>
          </ul>
        </div>

        {/* Legal */}
        <div className="space-y-4">
          <h3 className="font-bold text-xl mb-4 border-b-2 border-red-500 pb-2 inline-block">Legal</h3>
          <ul className="space-y-3 text-sm">
            <li>
              <a href="#" className="hover:text-red-400 transition-colors duration-300">
                Terms of Use
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-red-400 transition-colors duration-300">
                Privacy Policy
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-red-400 transition-colors duration-300">
                Cookie Policy
              </a>
            </li>
          </ul>
        </div>

        {/* Support */}
        <div className="space-y-4">
          <h3 className="font-bold text-xl mb-4 border-b-2 border-red-500 pb-2 inline-block">Support</h3>
          <ul className="space-y-3 text-sm">
            <li>
              <Link href="/contact" className="hover:text-red-400 transition-colors duration-300">
                Contact Us
              </Link>
            </li>
            <li>
              <a href="#" className="hover:text-red-400 transition-colors duration-300">
                FAQs
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-red-400 transition-colors duration-300">
                Help Center
              </a>
            </li>
          </ul>
        </div>

        {/* Contact Us */}
        <div className="space-y-4">
          <h3 className="font-bold text-xl mb-4 border-b-2 border-red-500 pb-2 inline-block">Contact Us</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <span className="font-semibold text-red-400">Email:</span>
              <span>support@apicts.com</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold text-red-400">Phone:</span>
              <span>+2348139399978</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold text-red-400">Address:</span>
              <span>
                Km 18, Topaz Plaza, New Road,<br />
                Lekki Ajah, Lagos
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Divider */}
      <hr className="border-t-2 border-red-500/30 mb-6" />

      {/* Bottom Section */}
      <div className="flex flex-col md:flex-row justify-between items-center text-sm">
        <p className="text-white font-medium">Apicts © 2025. All rights reserved.</p>
        <div className="flex space-x-6 mt-4 md:mt-0">
          <a href="#" className="text-white hover:text-red-400 transition-colors duration-300">
            <Youtube size={24} />
          </a>
          <a href="#" className="text-white hover:text-red-400 transition-colors duration-300">
            <Twitter size={24} />
          </a>
          <a href="#" className="text-white hover:text-red-400 transition-colors duration-300">
            <Linkedin size={24} />
          </a>
          <a href="#" className="text-white hover:text-red-400 transition-colors duration-300">
            <Instagram size={24} />
          </a>
        </div>
      </div>
    </footer>
  );
}


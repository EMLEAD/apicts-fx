"use client";

import Image from "next/image";
import Link from "next/link";
import Navbar from "@/Components/NavBar";
import Footer from "@/Components/Footer";
import { Calendar, User, ArrowRight, Clock } from "lucide-react";

export default function BlogPage() {
  const blogPosts = [
    {
      id: 1,
      title: "Understanding CFDs Trading: A Beginner's Guide",
      excerpt: "Learn the fundamentals of CFDs analysis (Fundamentals and Technicals), how prices are determined, and tips to be a profitable trader at APICTS-FX ACADEMY.",
      image: "/images/stock-exchange-trading-forex-finance-graphic-concept.jpg",
      category: "Education",
      author: "APICTS Team",
      date: "Jan 15, 2025",
      readTime: "5 min read",
      categoryColor: "bg-blue-500"
    },
    {
      id: 2,
      title: "Cryptocurrency Trading in Nigeria: What You Need to Know",
      excerpt: "Explore the latest regulations, best practices, and opportunities in the Nigerian cryptocurrency market.",
      image: "/images/bitcoin-crypto-currency-diagram.jpg",
      category: "Cryptocurrency",
      author: "John Okafor",
      date: "Oct 30, 2025",
      readTime: "7 min read",
      categoryColor: "bg-blue-500"
    },
    {
      id: 3,
      title: "NIN Verification: Securing Your Financial Transactions",
      excerpt: "Why identity verification matters and how NIN integration is making online exchanges safer for everyone.",
      image: "/images/nimc.png",
      category: "Security",
      author: "Sarah Adeyemi",
      date: "Oct 30, 2025",
      readTime: "4 min read",
      categoryColor: "bg-blue-500"
    },
    {
      id: 4,
      title: "Gold Trading",
      excerpt: "Gold has held a special place in human history as a store of value. Its value has recently reached a record high above $4,000 per troy ounce, as investors anticipate interest rate cuts from the U.S. Federal Reserve amid ongoing global instability.",
      image: "/images/gold.jpg",
      category: "XAU",
      author: "Michael Chen",
      date: "Oct 30, 2025",
      readTime: "6 min read",
      categoryColor: "bg-blue-500"
    },
    {
      id: 5,
      title: "Apicts Academy",
      excerpt: "Apicts Academy is our educational arm, dedicated to empowering individuals and businesses with the knowledge and skills needed to thrive in the digital finance world. From beginner to advanced, our courses, webinars, and mentorship programs are designed to help you succeed.",
      image: "/images/CFDs.jpg",
      category: "Training",
      author: "Fatima Ahmed",
      date: "Oct 30, 2025",
      readTime: "5 min read",
      categoryColor: "bg-blue-500"
    },
    {
      id: 6,
      title: "Market Analysis: Naira Exchange Rates Trends 2025",
      excerpt: "Deep dive into the factors affecting Naira exchange rates and what to expect in the coming months.",
      image: "/images/naira-lady.jpg",
      category: "Market Analysis",
      author: "David Okonkwo",
      date: "Oct 30, 2025",
      readTime: "8 min read",
      categoryColor: "bg-blue-500"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white mt-10">
      <Navbar />
      <section className="py-20 flex-1">
        <div className="container mx-auto px-6">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
           
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-2 mb-4">
              Insights, News & Analysis
            </h2>
            <p className="text-xl text-gray-600">
              Explore our latest articles on teachings, trading,exchanges, cryptocurrency, security, and more.
            </p>
          </div>

          {/* Blog Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <article
                key={post.id}
                className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              >
                {/* Image */}
                <div className="relative h-56 overflow-hidden bg-gradient-to-br from-blue-100 to-green-100">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {/* Category Badge */}
                  <div className="absolute top-4 left-4">
                    <span className={`${post.categoryColor} text-white text-xs font-semibold px-3 py-1 rounded-full`}>
                      {post.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Meta Info */}
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar size={16} />
                      <span>{post.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={16} />
                      <span>{post.readTime}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300 line-clamp-2">
                    {post.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center text-white text-sm font-bold">
                        {post.author.charAt(0)}
                      </div>
                      <span className="text-sm text-gray-700 font-medium">{post.author}</span>
                    </div>

                    <Link href={`/blog/${post.id}`}>
                      <button className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center gap-1 group/btn">
                        Read More
                        <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

         
        </div>
      </section>
      <Footer />
    </div>
  );
}
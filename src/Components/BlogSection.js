"use client";

import Image from "next/image";
import Link from "next/link";
import { Calendar, User, ArrowRight, Clock } from "lucide-react";

export default function BlogSection() {
  const blogPosts = [
    {
      id: 1,
      title: "Understanding Currency Exchange: A Beginner's Guide",
      excerpt: "Learn the fundamentals of currency exchange, how rates are determined, and tips for getting the best deals on your transactions.",
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
      date: "Jan 12, 2025",
      readTime: "7 min read",
      categoryColor: "bg-green-500"
    },
    {
      id: 3,
      title: "NIN Verification: Securing Your Financial Transactions",
      excerpt: "Why identity verification matters and how NIN integration is making online exchanges safer for everyone.",
      image: "/images/nimc.png",
      category: "Security",
      author: "Sarah Adeyemi",
      date: "Jan 10, 2025",
      readTime: "4 min read",
      categoryColor: "bg-rose-500"
    },
    {
      id: 4,
      title: "Gold Trading",
      excerpt: "Gold has held a special place in human history as a store of value.It's value has recently reached a record high above $4,000 per troy ounce, as investors anticipate interest rate cuts from the U.S. Federal Reserve amid ongoing global instability",
      image: "/images/gold.jpg",
      category: "XAU",
      author: "Michael Chen",
      date: "Jan 8, 2025",
      readTime: "6 min read",
      categoryColor: "bg-red-600"
    },
    {
      id: 5,
      title: "CFDs Trading",
      excerpt: "A CFD (Contract for Difference) is a financial derivative that lets you speculate on price changes of underlying assets (stocks, currencies, commodities, indices) without owning the actual asset.When you enter a CFD trade, you and the broker agree to exchange the difference in value of the asset between when the position is opened and when it is closed. If the price goes in the direction you predicted, you profit; otherwise, you incur a loss.",
      image: "/images/CFDs.jpg",
      category: "Transfers",
      author: "Fatima Ahmed",
      date: "Jan 5, 2025",
      readTime: "5 min read",
      categoryColor: "bg-green-600"
    },
    {
      id: 6,
      title: "Market Analysis: Naira Exchange Rates Trends 2025",
      excerpt: "Deep dive into the factors affecting Naira exchange rates and what to expect in the coming months.",
      image: "/images/naira-lady.jpg",
      category: "Market Analysis",
      author: "David Okonkwo",
      date: "Jan 3, 2025",
      readTime: "8 min read",
      categoryColor: "bg-rose-600"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-blue-600 font-semibold text-sm uppercase tracking-wide">
            Latest Insights
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-2 mb-4">
            From Our Blog
          </h2>
          <p className="text-xl text-gray-600">
            Stay updated with the latest news, tips, and insights about currency exchange, 
            cryptocurrency, and financial technology.
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

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link href="/blog">
            <button className="bg-gradient-to-r from-blue-600 to-green-500 text-white px-10 py-4 rounded-full font-bold text-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 inline-flex items-center gap-2">
              View All Articles
              <ArrowRight size={20} />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}


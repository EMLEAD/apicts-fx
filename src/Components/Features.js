"use client";

import { CheckCircle, TrendingUp, Lock, Smartphone, Clock, Users } from "lucide-react";

export default function Features() {
  const features = [
    {
      icon: <Lock size={24} />,
      title: "Government-Verified Security",
      description: "NIN and BVN integration for identity verification, ensuring compliance with Nigerian regulations.",
      stat: "100%",
      statLabel: "Secure"
    },
    {
      icon: <TrendingUp size={24} />,
      title: "Real-Time Exchange Rates",
      description: "Live currency rate feeds with historical tracking and automated rate alerts.",
      stat: "24/7",
      statLabel: "Live Rates"
    },
    {
      icon: <Clock size={24} />,
      title: "Instant Processing",
      description: "Automated payment approval system for verified transactions with real-time notifications.",
      stat: "<2 min",
      statLabel: "Processing"
    },
    {
      icon: <Smartphone size={24} />,
      title: "Mobile-First Design",
      description: "Fully responsive platform optimized for seamless experience across all devices.",
      stat: "100%",
      statLabel: "Responsive"
    },
    {
      icon: <Users size={24} />,
      title: "Multi-Currency Support",
      description: "Exchange fiat currencies, e-currencies, and cryptocurrencies all in one platform.",
      stat: "50+",
      statLabel: "Currencies"
    },
    {
      icon: <CheckCircle size={24} />,
      title: "Transparent Pricing",
      description: "No hidden fees. Competitive rates with clear transaction cost breakdown.",
      stat: "0%",
      statLabel: "Hidden Fees"
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-green-600 font-semibold text-sm uppercase tracking-wide">
            Why Choose APICTS
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-2 mb-4">
            Built for Modern Currency Exchange
          </h2>
          <p className="text-xl text-gray-600">
            Advanced technology meets financial security to deliver the best exchange experience in Nigeria.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="relative bg-white rounded-xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group overflow-hidden"
            >
              {/* Background gradient on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-green-50 to-rose-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              <div className="relative z-10">
                {/* Icon and Stat */}
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-gradient-to-br from-blue-500 to-green-500 p-3 rounded-lg text-white group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                      {feature.stat}
                    </div>
                    <div className="text-xs text-gray-500 font-semibold">{feature.statLabel}</div>
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 via-green-500 to-rose-500 rounded-2xl p-1">
          <div className="bg-white rounded-xl p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent mb-2">
                  10,000+
                </div>
                <div className="text-sm text-gray-600 font-medium">Active Users</div>
              </div>
              <div>
                <div className="text-4xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent mb-2">
                  ₦50B+
                </div>
                <div className="text-sm text-gray-600 font-medium">Transactions Processed</div>
              </div>
              <div>
                <div className="text-4xl font-bold bg-gradient-to-r from-rose-500 to-red-600 bg-clip-text text-transparent mb-2">
                  50+
                </div>
                <div className="text-sm text-gray-600 font-medium">Currencies Supported</div>
              </div>
              <div>
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                  4.9★
                </div>
                <div className="text-sm text-gray-600 font-medium">Customer Rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


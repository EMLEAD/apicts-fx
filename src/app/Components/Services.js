"use client";

import Image from "next/image";
import { DollarSign, Bitcoin, CreditCard, Globe, Shield, Zap } from "lucide-react";

export default function Services() {
  const services = [
    {
      icon: <DollarSign size={32} />,
      title: "Fiat Currency Exchange",
      description: "Exchange major fiat currencies including USD, EUR, GBP, and more with the best market rates.",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      iconBg: "bg-blue-500",
      image: "/images/fiat-currency.jpg"
    },
    {
      icon: <Bitcoin size={32} />,
      title: "Cryptocurrency Trading",
      description: "Buy and sell Bitcoin, Ethereum, USDT, and other popular cryptocurrencies securely and instantly.",
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-green-50",
      iconBg: "bg-green-500",
      image: "/images/crypto-trading.jpg"
    },
    {
      icon: <CreditCard size={32} />,
      title: "E-Currency Exchange",
      description: "Trade Perfect Money, Payeer, Neteller, and other e-currencies with competitive rates.",
      color: "from-rose-500 to-red-600",
      bgColor: "bg-rose-50",
      iconBg: "bg-rose-500",
      image: "/images/e-currency.jpg"
    },
    {
      icon: <Globe size={32} />,
      title: "International Transfers",
      description: "Send and receive money globally with low fees and fast processing times.",
      color: "from-blue-600 to-indigo-600",
      bgColor: "bg-blue-50",
      iconBg: "bg-blue-600",
      image: "/images/international-transfer.jpg"
    },
    {
      icon: <Shield size={32} />,
      title: "Secure Transactions",
      description: "Bank-level security with NIN verification, KYC compliance, and encrypted transactions.",
      color: "from-green-600 to-teal-600",
      bgColor: "bg-green-50",
      iconBg: "bg-green-600",
      image: "/images/secure-transactions.jpg"
    },
    {
      icon: <Zap size={32} />,
      title: "Instant Processing",
      description: "Automated payment approval system for fast and efficient transaction processing.",
      color: "from-rose-600 to-pink-600",
      bgColor: "bg-rose-50",
      iconBg: "bg-rose-600",
      image: "/images/instant-processing.jpg"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-blue-600 font-semibold text-sm uppercase tracking-wide">
            Our Services
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-2 mb-4">
            Comprehensive Exchange Solutions
          </h2>
          <p className="text-xl text-gray-600">
            From fiat to crypto, we provide a complete range of currency exchange services
            tailored to meet your financial needs.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100"
            >
              {/* Service Image */}
              <div className="relative h-48 overflow-hidden bg-gradient-to-br from-blue-50 to-green-50">
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                {/* Overlay Icon */}
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <div className={`${service.iconBg} p-4 rounded-xl text-white group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    {service.icon}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-8">

                {/* Content */}
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {service.title}
                </h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  {service.description}
                </p>

                {/* Learn More Link */}
                <a href="#" className={`inline-flex items-center text-sm font-semibold bg-gradient-to-r ${service.color} bg-clip-text text-transparent hover:gap-2 transition-all duration-300`}>
                  Learn More
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-gray-600 mb-4">
            Can't find what you're looking for?
          </p>
          <a 
            href="/contact" 
            className="inline-block bg-gradient-to-r from-blue-600 to-green-500 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
          >
            Contact Our Team
          </a>
        </div>
      </div>
    </section>
  );
}


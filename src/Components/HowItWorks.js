"use client";

import { UserPlus, FileCheck, ArrowRightLeft, CheckCircle2 } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      icon: <UserPlus size={32} />,
      title: "Create Account",
      description: "Sign up in minutes with your email and complete our simple registration process.",
      color: "from-blue-500 to-green-500"
    },
    {
      number: "02",
      icon: <FileCheck size={32} />,
      title: "Verify Identity",
      description: "Complete KYC verification with NIN/BVN for secure and compliant transactions.",
      color: "from-blue-500 to-green-500"
    },
    {
      number: "03",
      icon: <ArrowRightLeft size={32} />,
      title: "Start Trading",
      description: "Choose your currencies, enter the amount, and execute your exchange instantly.",
    color: "from-blue-500 to-green-500"
    },
    {
      number: "04",
      icon: <CheckCircle2 size={32} />,
      title: "Receive Funds",
      description: "Get your funds delivered to your account with automated confirmation.",
      color: "from-blue-500 to-green-500"
    }
  ];

  return (
    <section className="py-20 bg-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,.05) 1px, transparent 1px)`,
        backgroundSize: '50px 50px'
      }}></div>
      
      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-rose-600 font-semibold text-sm uppercase tracking-wide">
            Simple Process
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-2 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600">
            Start exchanging currencies in four simple steps. Fast, secure, and hassle-free.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connection lines for desktop */}
          <div className="hidden lg:block absolute top-24 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-green-500 to-rose-500 opacity-20"></div>

          {steps.map((step, index) => (
            <div key={index} className="relative group">
              {/* Step Card */}
              <div className="bg-white rounded-2xl p-8 shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 relative z-10">
                {/* Number Badge */}
                <div className={`absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br ${step.color} rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {step.number}
                </div>

                {/* Icon */}
                <div className={`inline-block p-4 rounded-xl bg-gradient-to-br ${step.color} text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {step.icon}
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Arrow (except for last item) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-20">
                  <div className={`w-8 h-8 bg-gradient-to-r ${step.color} rounded-full flex items-center justify-center text-white`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <a 
            href="/get-started"
            className="inline-block bg-gradient-to-r from-red-600 to-red-500 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-green-600 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
          >
            Start Your Exchange Journey
          </a>
          <p className="text-gray-500 text-sm mt-4">
            No credit card required • Free account setup
          </p>
        </div>
      </div>
    </section>
  );
}


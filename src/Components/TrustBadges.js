"use client";

import { useEffect, useState, useRef } from "react";
import { Users, Globe2, Star, Activity } from "lucide-react";

const Counter = ({ end, duration = 2500, prefix = "", suffix = "", isFloat = false }) => {
  const [count, setCount] = useState(0);
  const [inView, setInView] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;
    
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // easeOutExpo for smooth deceleration
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      setCount(easeProgress * end);
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [end, duration, inView]);

  const formattedCount = isFloat 
    ? count.toFixed(1)
    : Math.floor(count).toLocaleString();

  return (
    <span ref={ref}>
      {prefix}{formattedCount}{suffix}
    </span>
  );
};

export default function TrustBadges() {
  const stats = [
    {
      id: 1,
      name: "Active Users",
      value: 10000,
      suffix: "+",
      icon: Users,
      color: "from-blue-600 to-cyan-500",
      textColor: "text-blue-600",
      bgLight: "bg-blue-50"
    },
    {
      id: 2,
      name: "Transactions Processed",
      value: 500000,
      suffix: "+",
      icon: Activity,
      color: "from-green-500 to-emerald-600",
      textColor: "text-green-600",
      bgLight: "bg-green-50"
    },
    {
      id: 3,
      name: "Currencies Supported",
      value: 3,
      suffix: "+",
      icon: Globe2,
      color: "from-rose-500 to-red-600",
      textColor: "text-rose-500",
      bgLight: "bg-rose-50"
    },
    {
      id: 4,
      name: "Customer Rating",
      value: 4.9,
      suffix: "★",
      isFloat: true,
      icon: Star,
      color: "from-amber-500 to-orange-500",
      textColor: "text-amber-500",
      bgLight: "bg-amber-50"
    }
  ];

  return (
    <section className="py-10 relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <div className="relative rounded-[2rem] p-[2px] bg-gradient-to-r from-blue-600 via-green-500 to-rose-500 overflow-hidden group hover:shadow-2xl transition-shadow duration-500">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-green-500 to-rose-500 opacity-20 blur-2xl group-hover:opacity-40 transition-opacity duration-500" />
          
          <div className="relative bg-white rounded-[calc(2rem-2px)] px-6 py-12 md:p-16 backdrop-blur-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-8 text-center divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.id} className={`flex flex-col items-center justify-center pt-8 sm:pt-0 ${index !== 0 ? 'sm:px-4' : ''} transition-transform duration-300 hover:-translate-y-2`}>
                    <div className={`w-16 h-16 rounded-2xl ${stat.bgLight} flex items-center justify-center mb-6 shadow-sm border border-white/50`}>
                      <Icon className={`w-8 h-8 ${stat.textColor}`} />
                    </div>
                    <div>
                      <div className={`text-4xl md:text-5xl font-extrabold bg-gradient-to-br ${stat.color} bg-clip-text text-transparent mb-3 drop-shadow-sm`}>
                        <Counter end={stat.value} suffix={stat.suffix} prefix={stat.prefix} isFloat={stat.isFloat} />
                      </div>
                      <div className="text-sm md:text-base text-gray-500 font-bold tracking-wide uppercase">
                        {stat.name}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

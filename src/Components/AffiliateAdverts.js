"use client";

import { useState, useEffect } from "react";
import { ExternalLink } from "lucide-react";

export default function AffiliateAdverts() {
  const [adverts, setAdverts] = useState([]);

  useEffect(() => {
    const fetchAdverts = async () => {
      try {
        const res = await fetch("/api/affiliate-links");
        const data = await res.json();
        if (data.success && data.links) {
          setAdverts(data.links);
        }
      } catch (err) {
        console.error("Failed to fetch adverts:", err);
      }
    };
    fetchAdverts();
  }, []);

  if (adverts.length === 0) return null;

  return (
    <div className="mt-8 space-y-4">
      {adverts.map((advert) => (
        <a
          key={advert.id}
          href={advert.targetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group block relative rounded-2xl overflow-hidden shadow-lg border border-gray-700/50 hover:border-red-500/50 transition-all duration-300 transform hover:-translate-y-1"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 to-transparent z-10" />
          
          <div className="relative h-28 w-full bg-gray-800">
            {advert.imageUrl ? (
              <img 
                src={advert.imageUrl} 
                alt={advert.name}
                className="absolute right-0 top-0 h-full w-2/3 object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-300 mix-blend-screen"
              />
            ) : (
              <div className="absolute right-0 top-0 h-full w-2/3 bg-gray-700 flex items-center justify-center text-gray-500 font-bold opacity-30">
                {advert.name}
              </div>
            )}
            
            <div className="relative z-20 h-full flex flex-col justify-center p-6 w-2/3">
              <span className="text-[10px] uppercase tracking-widest text-red-400 font-bold mb-1 block">Partner</span>
              <h3 className="text-white font-bold text-lg truncate group-hover:text-red-400 transition-colors">
                {advert.name}
              </h3>
              <div className="flex items-center text-xs text-gray-300 mt-2 font-medium opacity-80 group-hover:opacity-100 transition-opacity">
                <span>Visit Site</span>
                <ExternalLink size={12} className="ml-1 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </div>
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}

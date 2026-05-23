import React from 'react';
import { trustedBrands } from '../data/mock';

export const TrustedBy = () => {
  return (
    <section className="py-20 bg-black">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Trusted by Startups, Agencies & Global Brands
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center">
          {trustedBrands.map((brand, index) => (
            <div
              key={index}
              className="flex items-center justify-center p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl hover:bg-white/10 hover:border-[#2A7AFE]/50 transition-all duration-300 hover:scale-105"
            >
              <span className="text-white font-semibold text-sm text-center">{brand}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 max-w-4xl mx-auto">
          <div className="text-center p-6 bg-gradient-to-br from-[#2A7AFE]/10 to-[#3B82F6]/10 backdrop-blur-sm border border-[#2A7AFE]/20 rounded-xl">
            <div className="text-3xl font-bold text-white mb-2">7+</div>
            <div className="text-sm text-gray-400">Years Experience</div>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-[#2A7AFE]/10 to-[#3B82F6]/10 backdrop-blur-sm border border-[#2A7AFE]/20 rounded-xl">
            <div className="text-3xl font-bold text-white mb-2">2,700+</div>
            <div className="text-sm text-gray-400">Slides Designed</div>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-[#2A7AFE]/10 to-[#3B82F6]/10 backdrop-blur-sm border border-[#2A7AFE]/20 rounded-xl">
            <div className="text-3xl font-bold text-white mb-2">100+</div>
            <div className="text-sm text-gray-400">Clients Worldwide</div>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-[#2A7AFE]/10 to-[#3B82F6]/10 backdrop-blur-sm border border-[#2A7AFE]/20 rounded-xl">
            <div className="text-3xl font-bold text-white mb-2">Fast</div>
            <div className="text-sm text-gray-400">Turnarounds</div>
          </div>
        </div>
      </div>
    </section>
  );
};

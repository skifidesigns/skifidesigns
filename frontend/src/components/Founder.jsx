import React from 'react';
import { User } from 'lucide-react';

export const Founder = () => {
  return (
    <section className="py-24 bg-black">
      <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Meet The Team Behind SkiFi
          </h2>
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 md:p-12 hover:bg-white/10 hover:border-[#2A7AFE]/50 transition-all duration-300">
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
            <div className="flex-shrink-0">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#2A7AFE] to-[#3B82F6] flex items-center justify-center">
                <User className="w-16 h-16 text-white" />
              </div>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-3xl font-bold text-white mb-2">Hi, I'm Ishaque</h3>
              <p className="text-[#2A7AFE] font-medium mb-6">Founder of SkiFi Designs</p>
              
              <div className="space-y-4 text-gray-300 text-lg leading-relaxed">
                <p>
                  We're a creative presentation design studio based in Kerala, India, helping startups, agencies, and businesses communicate better through impactful visual storytelling.
                </p>
                <p>
                  With 7+ years of experience and a team of skilled in-house designers, we create presentations that don't just look beautiful — they help brands close deals, raise funding, and stand out.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

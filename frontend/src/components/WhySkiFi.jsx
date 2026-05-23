import React from 'react';
import { Check } from 'lucide-react';
import { whySkiFi } from '../data/mock';

export const WhySkiFi = () => {
  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-semibold text-foreground mb-4">
            Why Teams Choose SkiFi
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            We combine design excellence with storytelling expertise to create presentations that drive results.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {whySkiFi.map((reason, index) => (
            <div
              key={index}
              className="flex items-start gap-4 p-6 bg-card backdrop-blur-sm border border-border rounded-xl hover:bg-accent hover:border-[#2A7AFE]/50 transition-all duration-300 group"
            >
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-[#2A7AFE] to-[#3B82F6] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Check className="w-4 h-4 text-white" />
              </div>
              <p className="text-foreground/90 text-lg">{reason}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

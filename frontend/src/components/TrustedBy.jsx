import React from 'react';
import { trustedBrands } from '../data/mock';

export const TrustedBy = () => {
  // Duplicate brands for seamless marquee loop
  const marqueeBrands = [...trustedBrands, ...trustedBrands];

  return (
    <section className="py-20 bg-background overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-semibold text-foreground mb-4">
            Trusted by Startups, Agencies & Global Brands
          </h2>
          <p className="text-muted-foreground text-base">
            Strategic collaborations across the globe
          </p>
        </div>
      </div>

      {/* Animated Marquee */}
      <div className="relative w-full overflow-hidden py-8">
        <div className="flex animate-marquee whitespace-nowrap">
          {marqueeBrands.map((brand, index) => (
            <div
              key={index}
              className="mx-8 flex-shrink-0 flex items-center justify-center"
            >
              <span className="text-2xl md:text-3xl font-semibold text-muted-foreground/60 hover:text-foreground transition-colors duration-300 tracking-tight">
                {brand}
              </span>
              <span className="text-muted-foreground/30 mx-8">•</span>
            </div>
          ))}
        </div>

        {/* Gradient Fade Edges */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent"></div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent"></div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 max-w-4xl mx-auto">
          <div className="text-center p-6 bg-gradient-to-br from-[#2A7AFE]/10 to-[#3B82F6]/10 backdrop-blur-sm border border-[#2A7AFE]/20 rounded-xl">
            <div className="text-3xl font-semibold text-foreground mb-2">7+</div>
            <div className="text-sm text-muted-foreground">Years Experience</div>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-[#2A7AFE]/10 to-[#3B82F6]/10 backdrop-blur-sm border border-[#2A7AFE]/20 rounded-xl">
            <div className="text-3xl font-semibold text-foreground mb-2">2,700+</div>
            <div className="text-sm text-muted-foreground">Presentations Designed</div>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-[#2A7AFE]/10 to-[#3B82F6]/10 backdrop-blur-sm border border-[#2A7AFE]/20 rounded-xl">
            <div className="text-3xl font-semibold text-foreground mb-2">100+</div>
            <div className="text-sm text-muted-foreground">Clients Worldwide</div>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-[#2A7AFE]/10 to-[#3B82F6]/10 backdrop-blur-sm border border-[#2A7AFE]/20 rounded-xl">
            <div className="text-3xl font-semibold text-foreground mb-2">43+</div>
            <div className="text-sm text-muted-foreground">Countries</div>
          </div>
        </div>
      </div>
    </section>
  );
};

import React from 'react';
import { trustedBrands } from '../data/mock';

export const TrustedBy = () => {
  // Duplicate brands for seamless marquee loop
  const marqueeBrands = [...trustedBrands, ...trustedBrands];

  return (
    <section className="relative py-12 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="text-center mb-10">
          <p className="text-xs uppercase tracking-[0.2em] text-[#2A7AFE] font-semibold mb-3">Trusted by</p>
          <h2 className="text-3xl sm:text-4xl font-semibold text-foreground mb-3">
            Startups, agencies & <span className="skifi-gradient-text">global brands</span>
          </h2>
          <p className="text-muted-foreground text-sm">
            Strategic collaborations across the globe
          </p>
        </div>
      </div>

      {/* Animated Marquee */}
      <div className="relative w-full overflow-hidden py-6">
        <div className="flex animate-marquee whitespace-nowrap">
          {marqueeBrands.map((brand, index) => (
            <div
              key={`${brand}-${index}`}
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
    </section>
  );
};

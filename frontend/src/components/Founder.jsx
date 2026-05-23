import React from 'react';

export const Founder = () => {
  return (
    <section className="py-24 bg-background">
      <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Meet The Team Behind SkiFi
          </h2>
        </div>

        <div className="bg-card backdrop-blur-sm border border-border rounded-3xl p-8 md:p-12 hover:bg-accent hover:border-[#2A7AFE]/50 transition-all duration-300">
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
            <div className="flex-shrink-0">
              <img
                src="https://customer-assets.emergentagent.com/job_presentation-studio-22/artifacts/xkunifl8_Profile%20Pic.jpg"
                alt="Ishaque - Founder of SkiFi Designs"
                className="w-32 h-32 rounded-full object-cover ring-4 ring-[#2A7AFE]/20"
              />
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-3xl font-bold text-foreground mb-2">Hi, I'm Ishaque</h3>
              <p className="text-[#2A7AFE] font-medium mb-6">Founder of SkiFi Designs</p>
              
              <div className="space-y-4 text-muted-foreground text-lg leading-relaxed">
                <p>
                  Hi, I'm Ishaque, founder of SkiFi Designs, a creative studio specializing in presentation design, pitch decks, branding, business reports, and visual storytelling.
                </p>
                <p>
                  With a talented in-house team of 10 experienced designers, we help startups, agencies, and businesses create modern, persuasive, and visually impactful designs that communicate ideas clearly and professionally.
                </p>
                <p>
                  Our focus is on clean aesthetics, strategic layouts, premium visuals, and presentation designs that leave a lasting impression.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

import React from 'react';
import { motion } from 'framer-motion';
import { useSpotlight } from '../hooks/useSpotlight';

export const Founder = () => {
  const handleMove = useSpotlight();
  return (
    <section className="relative py-24 overflow-hidden">
      <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-[#2A7AFE] font-semibold mb-3">Founder</p>
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground">
            Meet the team behind <span className="skifi-gradient-text">SkiFi</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
          onMouseMove={handleMove}
          className="skifi-glass skifi-spotlight rounded-3xl p-8 md:p-12 group"
        >
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
            <div className="flex-shrink-0 relative">
              <div className="absolute -inset-1.5 rounded-full bg-gradient-to-br from-[#2A7AFE] to-[#8B5CF6] opacity-50 blur-md group-hover:opacity-70 transition-opacity duration-500"></div>
              <img
                src="https://customer-assets.emergentagent.com/job_presentation-studio-22/artifacts/xkunifl8_Profile%20Pic.jpg"
                alt="Ishaque — Founder of SkiFi Designs"
                className="relative w-32 h-32 rounded-full object-cover ring-4 ring-background"
              />
            </div>

            <div className="flex-1 text-center md:text-left">
              <h3 className="text-3xl font-bold text-foreground mb-1">Hi, I'm Ishaque</h3>
              <p className="text-[#2A7AFE] font-medium text-sm uppercase tracking-[0.16em] mb-6">Founder · SkiFi Designs</p>

              <div className="space-y-4 text-muted-foreground text-[15px] leading-relaxed">
                <p>
                  We're SkiFi Designs — a creative studio specialising in presentation design, pitch decks, branding, business reports and visual storytelling.
                </p>
                <p>
                  With an in-house team of 10 experienced designers, we help startups, agencies and businesses craft modern, persuasive and visually impactful designs that communicate ideas clearly and professionally.
                </p>
                <p>
                  Our focus: clean aesthetics, strategic layouts, premium visuals and presentation designs that leave a lasting impression.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

import React from 'react';
import { motion } from 'framer-motion';
import { useSpotlight } from '../hooks/useSpotlight';

export const Founder = () => {
  const handleMove = useSpotlight();
  return (
    <section id="about" className="relative py-16 overflow-hidden">
      <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-[#2A7AFE] font-semibold mb-3">About us</p>
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground">
            Get to know{' '}
            <span className="skifi-gradient-text">SkiFi Designs</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
          onMouseMove={handleMove}
          className="skifi-glass skifi-spotlight rounded-3xl p-8 sm:p-12"
        >
          {/* Story */}
          <div className="space-y-5 text-foreground text-lg leading-relaxed">
            <p>
              <span className="font-semibold">SkiFi Designs</span> is a creative studio crafting{' '}
              <span className="text-[#2A7AFE] font-medium">premium presentations</span>{' '}
              that turn ideas into outcomes — pitch decks that raise capital, sales decks that close
              deals, and corporate decks that elevate brands.
            </p>
            <p className="text-muted-foreground text-[16.5px]">
              With an in-house team of <strong className="text-foreground">10 experienced designers</strong>,
              we partner with startups, agencies and global brands to craft modern, persuasive and
              visually impactful designs. Our focus: clean aesthetics, strategic layouts, premium
              visuals — presentations that leave a lasting impression.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

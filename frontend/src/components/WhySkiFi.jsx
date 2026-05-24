import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { whySkiFi } from '../data/mock';
import { useSpotlight } from '../hooks/useSpotlight';

export const WhySkiFi = () => {
  const handleMove = useSpotlight();
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Soft mesh accent in background */}
      <div className="absolute inset-0 skifi-mesh skifi-mesh-soft" style={{ opacity: 0.5 }} />
      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-[#2A7AFE] font-semibold mb-3">Why SkiFi</p>
          <h2 className="text-4xl sm:text-5xl font-semibold text-foreground mb-4">
            Teams choose us because{' '}
            <span className="skifi-gradient-text">it works.</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Design excellence + storytelling expertise to create presentations that drive results.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-5xl mx-auto">
          {whySkiFi.map((reason, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              onMouseMove={handleMove}
              className="skifi-glass skifi-spotlight rounded-xl p-6 flex items-start gap-4 group hover:-translate-y-0.5 transition-transform"
            >
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-[#2A7AFE] to-[#8B5CF6] flex items-center justify-center group-hover:scale-110 transition-transform shadow-md shadow-[#2A7AFE]/30">
                <Check className="w-4 h-4 text-white" strokeWidth={3} />
              </div>
              <p className="text-foreground text-[15px] leading-relaxed">{reason}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

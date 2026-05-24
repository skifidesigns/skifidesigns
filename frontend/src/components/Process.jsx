import React from 'react';
import { motion } from 'framer-motion';
import { processSteps } from '../data/mock';
import { useSpotlight } from '../hooks/useSpotlight';

export const Process = () => {
  const handleMove = useSpotlight();
  return (
    <section className="relative py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-[#2A7AFE] font-semibold mb-3">Process</p>
          <h2 className="text-4xl sm:text-5xl font-semibold text-foreground mb-4">
            From idea to <span className="skifi-gradient-text">winning deck</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A proven approach that transforms your ideas into presentation excellence.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {processSteps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
              className="relative group h-full"
            >
              {index < processSteps.length - 1 && (
                <div className="hidden lg:block absolute top-14 left-full w-full h-px bg-gradient-to-r from-[#2A7AFE]/50 via-[#8B5CF6]/30 to-transparent transform translate-x-6 z-0"></div>
              )}

              <div
                onMouseMove={handleMove}
                className="skifi-card skifi-spotlight relative p-7 rounded-2xl h-full flex flex-col hover:-translate-y-1 transition-transform duration-300 z-10"
              >
                <div className="text-5xl font-semibold skifi-gradient-text mb-5 tracking-tight">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{step.title}</h3>
                <p className="text-muted-foreground text-[15px] leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

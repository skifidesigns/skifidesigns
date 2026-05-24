import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, ArrowRight } from 'lucide-react';

export const FinalCTA = () => {
  const handleBookCall = () => window.open('https://cal.com/skifi/30min', '_blank');
  const handleStartProject = () => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section className="relative py-16 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Inverted dark block - agency aesthetic */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl overflow-hidden bg-neutral-950 px-8 py-20 sm:py-16 sm:px-12 text-center"
        >
          {/* Internal mesh */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div
              className="absolute -top-24 -left-24 w-[560px] h-[560px] rounded-full opacity-50"
              style={{ background: 'radial-gradient(circle, #2A7AFE 0%, transparent 70%)', filter: 'blur(80px)' }}
            />
            <div
              className="absolute -bottom-32 -right-24 w-[640px] h-[640px] rounded-full opacity-40"
              style={{ background: 'radial-gradient(circle, #60A5FA 0%, transparent 70%)', filter: 'blur(90px)' }}
            />
          </div>

          <div className="relative z-10">
            <p className="text-xs uppercase tracking-[0.22em] text-white/60 font-semibold mb-4">
              Ready when you are
            </p>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-white mb-5 leading-tight">
              Let's turn your ideas into{' '}
              <span className="skifi-gradient-text">presentations</span>
              <br className="hidden sm:block" /> people remember.
            </h2>
            <p className="text-lg sm:text-xl text-white/70 mb-10 max-w-2xl mx-auto">
              Book a free 30-minute call or kick off your project right now.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={handleBookCall}
                data-testid="final-cta-book"
                className="skifi-btn-primary group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-semibold"
              >
                <Calendar className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                Book a Discovery Call
              </button>

              <button
                onClick={handleStartProject}
                data-testid="final-cta-start"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-semibold text-white bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-300"
              >
                Start Your Project
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

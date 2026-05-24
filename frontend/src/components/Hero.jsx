import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Calendar, ArrowDown } from 'lucide-react';
import { OnboardingWizard } from './OnboardingWizard';

export const Hero = () => {
  const [wizardOpen, setWizardOpen] = useState(false);
  const heroRef = useRef(null);

  const handleBookCall = () => window.open('https://cal.com/skifi/30min', '_blank');
  const handleStartProject = () => setWizardOpen(true);

  // Track mouse for spotlight effect on stat card row
  const handleMouseMove = (e) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    el.style.setProperty('--my', `${e.clientY - rect.top}px`);
  };

  const stats = [
    { value: '7+', label: 'Years Experience' },
    { value: '2,700+', label: 'Presentations Designed' },
    { value: '43+', label: 'Countries' },
    { value: '150+', label: 'Clients Worldwide' },
  ];

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Animated gradient mesh background */}
      <div className="skifi-mesh skifi-mesh-soft" />
      {/* Subtle grain texture for premium paper feel */}
      <div className="absolute inset-0 skifi-grain pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-32 text-center">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
          }}
          className="space-y-8"
        >
          {/* Availability Badge */}
          <motion.div
            variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
            className="flex justify-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 skifi-glass-pill rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-xs font-medium text-foreground/80 whitespace-nowrap tracking-wide">
                Available for new projects
              </span>
            </div>
          </motion.div>

          <motion.h1
            variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground leading-tight tracking-tight"
          >
            Design Presentations That
            <span className="block mt-2 skifi-gradient-text">
              Actually Win Business
            </span>
          </motion.h1>

          <motion.p
            variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }}
            className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
          >
            Premium presentation design agency specialising in investor pitch decks,
            sales decks and PowerPoint design for founders, agencies, and global brands.
          </motion.p>

          <motion.div
            variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4"
          >
            <button
              onClick={handleBookCall}
              data-testid="hero-book-call-btn"
              className="skifi-btn-primary group inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-base font-semibold"
            >
              <Calendar className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
              Book a Free Call
            </button>

            <button
              onClick={handleStartProject}
              data-testid="hero-start-project-btn"
              className="skifi-btn-ghost group inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-base font-semibold text-foreground"
            >
              <Sparkles className="w-5 h-5 text-[#2A7AFE] group-hover:rotate-12 transition-transform duration-300" />
              Start a Project
            </button>
          </motion.div>

          {/* Stats — glass card with interactive spotlight */}
          <motion.div
            variants={{ hidden: { opacity: 0, y: 22 }, visible: { opacity: 1, y: 0 } }}
            className="pt-12 max-w-4xl mx-auto"
          >
            <div
              onMouseMove={handleMouseMove}
              className="skifi-glass skifi-spotlight rounded-2xl p-6 sm:p-8"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                {stats.map((s, i) => (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + i * 0.08, duration: 0.4 }}
                    className="text-center sm:border-r last:border-r-0 sm:border-border/60 sm:pr-6 last:pr-0"
                  >
                    <div className="text-3xl sm:text-4xl font-bold text-foreground mb-1.5 tracking-tight">
                      {s.value}
                    </div>
                    <div className="text-[11px] sm:text-xs text-muted-foreground uppercase tracking-[0.14em]">
                      {s.label}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-[10px] text-muted-foreground uppercase tracking-[0.2em]">Scroll</span>
          <ArrowDown className="w-3.5 h-3.5 text-muted-foreground animate-bounce" />
        </div>
      </motion.div>

      <OnboardingWizard
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        initialPlan="per_slide"
      />
    </section>
  );
};

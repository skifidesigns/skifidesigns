import React from 'react';
import { motion } from 'framer-motion';
import { Presentation, Briefcase, TrendingUp, Video, BarChart, Layers } from 'lucide-react';
import { services } from '../data/mock';
import { useSpotlight } from '../hooks/useSpotlight';

const iconMap = {
  presentation: Presentation,
  briefcase: Briefcase,
  'trending-up': TrendingUp,
  video: Video,
  'bar-chart': BarChart,
  layers: Layers,
};

export const Services = () => {
  const handleMove = useSpotlight();
  return (
    <section id="services" className="relative py-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-[#2A7AFE] font-semibold mb-3">Services</p>
          <h2 className="text-4xl sm:text-5xl font-semibold text-foreground mb-4">
            What We <span className="skifi-gradient-text">Design</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From pitch decks to corporate presentations, we create visuals that make your message memorable.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, i) => {
            const Icon = iconMap[service.icon];
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.45, delay: i * 0.06 }}
                onMouseMove={handleMove}
                className="skifi-card skifi-spotlight rounded-2xl p-8 group cursor-pointer hover:-translate-y-1 transition-transform duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2A7AFE] to-[#8B5CF6] flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-lg shadow-[#2A7AFE]/30">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{service.title}</h3>
                <p className="text-muted-foreground text-[15px] leading-relaxed">{service.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

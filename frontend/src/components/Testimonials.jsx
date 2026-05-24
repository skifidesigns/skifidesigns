import React from 'react';
import { motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';
import { testimonials } from '../data/mock';
import { useSpotlight } from '../hooks/useSpotlight';

export const Testimonials = () => {
  const handleMove = useSpotlight();
  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 skifi-mesh skifi-mesh-soft" style={{ opacity: 0.45 }} />
      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-[#2A7AFE] font-semibold mb-3">Testimonials</p>
          <h2 className="text-4xl sm:text-5xl font-semibold text-foreground mb-4">
            What clients <span className="skifi-gradient-text">actually say</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Don't take our word for it — here's what teams say after working with us.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              onMouseMove={handleMove}
              className="skifi-glass skifi-spotlight rounded-2xl p-8 group relative hover:-translate-y-1 transition-transform duration-300"
            >
              <Quote className="absolute top-6 right-6 w-8 h-8 text-[#2A7AFE]/15" strokeWidth={1} />
              <div className="flex gap-0.5 mb-5">
                {[...Array(testimonial.rating)].map((_, idx) => (
                  <Star key={idx} className="w-4 h-4 fill-[#2A7AFE] text-[#2A7AFE]" />
                ))}
              </div>
              <p className="text-foreground text-[15px] leading-relaxed mb-6">
                "{testimonial.text}"
              </p>
              <div className="border-t border-border/60 pt-5">
                <div className="font-semibold text-foreground">{testimonial.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{testimonial.role}, {testimonial.company}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

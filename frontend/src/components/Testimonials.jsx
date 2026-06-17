import React from 'react';
import { motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';
import { testimonials } from '../data/mock';
import { useSpotlight } from '../hooks/useSpotlight';

export const Testimonials = () => {
  const handleMove = useSpotlight();
  return (
    <section className="relative py-16 overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-[#2A7AFE] font-semibold mb-3">Testimonials</p>
          <h2 className="text-4xl sm:text-5xl font-semibold text-foreground mb-4">
            What clients <span className="skifi-gradient-text">actually say</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Don't take our word for it - here's what teams say after working with us.
          </p>

          <a
            href="https://www.fiverr.com/skifidesigns"
            target="_blank"
            rel="noopener noreferrer"
            data-testid="fiverr-vetted-pro-badge"
            className="mt-6 inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-[#1DBF73]/30 bg-[#1DBF73]/[0.06] hover:bg-[#1DBF73]/[0.12] hover:border-[#1DBF73]/55 hover:-translate-y-0.5 transition-all duration-300 group"
            aria-label="Vetted Pro on Fiverr - view our profile"
          >
            <img
              src="https://gdm-catalog-fmapi-prod.imgix.net/ProductLogo/50cfc067-d28f-4b86-920d-fbaa5f618fd1.png?w=128&h=128&fit=max&dpr=3&auto=format&q=50"
              alt="Fiverr Pro badge"
              loading="lazy"
              width="22"
              height="22"
              className="w-[22px] h-[22px] rounded-sm"
            />
            <span className="text-sm font-semibold text-foreground/85 tracking-tight">
              Vetted Pro on Fiverr
            </span>
            <span className="text-xs font-medium text-muted-foreground/80 inline-flex items-center gap-1 border-l border-border/60 pl-2.5">
              5.0 <Star className="w-3 h-3 fill-[#1DBF73] text-[#1DBF73]" />
            </span>
          </a>
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
              className="skifi-card skifi-spotlight rounded-2xl p-8 group relative hover:-translate-y-1 transition-transform duration-300 flex flex-col h-full"
            >
              <Quote className="absolute top-6 right-6 w-8 h-8 text-[#2A7AFE]/15" strokeWidth={1} />
              <div className="flex gap-0.5 mb-5">
                {[...Array(testimonial.rating)].map((_, idx) => (
                  <Star key={`star-${idx}`} className="w-4 h-4 fill-[#2A7AFE] text-[#2A7AFE]" />
                ))}
              </div>
              <p className="text-foreground text-[15px] leading-relaxed mb-6">
                "{testimonial.text}"
              </p>
              <div className="border-t border-border/60 pt-5 mt-auto">
                <div className="font-semibold text-foreground">{testimonial.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {testimonial.role}
                  {testimonial.company ? `, ${testimonial.company}` : ''}
                </div>
                {testimonial.country && (
                  <div
                    data-testid={`testimonial-country-${testimonial.id}`}
                    className="text-xs text-muted-foreground/85 mt-1.5 inline-flex items-center gap-2"
                  >
                    {testimonial.countryCode && (
                      <img
                        src={`https://flagcdn.com/w40/${testimonial.countryCode}.png`}
                        srcSet={`https://flagcdn.com/w80/${testimonial.countryCode}.png 2x`}
                        alt={`${testimonial.country} flag`}
                        loading="lazy"
                        width="20"
                        height="14"
                        className="w-5 h-[14px] rounded-[2px] object-cover ring-1 ring-border/50"
                      />
                    )}
                    <span>{testimonial.country}</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

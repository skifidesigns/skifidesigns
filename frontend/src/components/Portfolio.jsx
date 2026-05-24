import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { portfolioProjects } from '../data/mock';
import { useSpotlight } from '../hooks/useSpotlight';

export const Portfolio = () => {
  const handleMove = useSpotlight();
  return (
    <section id="portfolio" className="relative py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-[#2A7AFE] font-semibold mb-3">Portfolio</p>
          <h2 className="text-4xl sm:text-5xl font-semibold text-foreground mb-4">
            Selected <span className="skifi-gradient-text">Work</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Premium presentations designed for global brands and startups.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolioProjects.map((project, i) => (
            <motion.a
              key={project.id}
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              onMouseMove={handleMove}
              className="skifi-spotlight group relative overflow-hidden rounded-2xl border border-border bg-card hover:border-[#2A7AFE]/50 hover:-translate-y-1 transition-all duration-500"
            >
              <div className="aspect-[4/3] overflow-hidden relative">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-300"></div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-400">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="inline-block uppercase tracking-[0.14em] text-[10px] font-semibold bg-white/95 text-neutral-900 dark:bg-neutral-900/95 dark:text-white backdrop-blur-sm px-2.5 py-1 rounded-full mb-3 shadow-sm">
                      {project.category}
                    </span>
                    <h3 className="text-xl font-semibold text-white line-clamp-2 drop-shadow-md">{project.title}</h3>
                  </div>
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:rotate-45 transition-all duration-300 border border-white/20">
                    <ExternalLink className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            </motion.a>
          ))}
        </div>

        <div className="text-center mt-14">
          <a
            href="https://www.behance.net/skifidesigns"
            target="_blank"
            rel="noopener noreferrer"
            className="skifi-btn-ghost inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-base font-semibold text-foreground"
          >
            View Full Portfolio on Behance
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
};

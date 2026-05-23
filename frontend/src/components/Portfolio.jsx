import React, { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { portfolioProjects } from '../data/mock';

export const Portfolio = () => {
  const [hoveredId, setHoveredId] = useState(null);

  return (
    <section id="portfolio" className="py-24 bg-gradient-to-b from-gray-950 to-black">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Selected Work
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Browse through our portfolio of premium presentations designed for global brands and startups.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {portfolioProjects.map((project) => (
            <a
              key={project.id}
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-[#2A7AFE]/50 transition-all duration-500 hover:scale-105"
              onMouseEnter={() => setHoveredId(project.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm text-[#2A7AFE] font-medium mb-2">{project.category}</div>
                    <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">{project.title}</h3>
                  </div>
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <ExternalLink className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>

        <div className="text-center mt-12">
          <a
            href="https://www.behance.net/skifidesigns"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white/5 backdrop-blur-sm border border-white/20 text-white hover:bg-white/10 hover:border-[#2A7AFE]/50 rounded-xl transition-all duration-300 hover:scale-105 font-medium"
          >
            View Full Portfolio on Behance
            <ExternalLink className="w-5 h-5" />
          </a>
        </div>
      </div>
    </section>
  );
};

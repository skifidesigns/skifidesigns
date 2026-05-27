import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useSpotlight } from '../hooks/useSpotlight';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const Portfolio = () => {
  const handleMove = useSpotlight();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Show featured first, cap to 6 on the homepage
        const { data } = await axios.get(`${API}/case-studies?limit=6&featured=true`);
        if (cancelled) return;
        let list = data.items || [];
        // Fallback: if there aren't enough featured, top up with latest non-featured
        if (list.length < 6) {
          const { data: all } = await axios.get(`${API}/case-studies?limit=12`);
          const seen = new Set(list.map((c) => c.id));
          for (const c of all.items || []) {
            if (list.length >= 6) break;
            if (!seen.has(c.id)) list.push(c);
          }
        }
        setItems(list.slice(0, 6));
      } catch {
        setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (!loading && items.length === 0) return null;

  return (
    <section id="portfolio" className="relative py-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-[#2A7AFE] font-semibold mb-3">Case Studies</p>
          <h2 className="text-4xl sm:text-5xl font-semibold text-foreground mb-4">
            Selected <span className="skifi-gradient-text">Work</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Premium presentations designed for global brands and startups.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((cs, i) => (
            <motion.div
              key={cs.id}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              onMouseMove={handleMove}
              className="skifi-spotlight group flex flex-col relative overflow-hidden rounded-2xl border border-border bg-card hover:border-[#2A7AFE]/50 hover:-translate-y-1 transition-all duration-500"
            >
              <Link
                to={`/case-studies/${cs.slug}`}
                data-testid={`case-study-card-${cs.slug}`}
                className="flex flex-col h-full"
              >
                <div className="aspect-[4/3] overflow-hidden relative">
                  <img
                    src={cs.cover_image_url}
                    alt={cs.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 border border-white/20">
                    <ArrowRight className="w-4 h-4 text-white" />
                  </div>
                </div>

                <div className="p-5">
                  <p className="text-[10px] uppercase tracking-[0.16em] font-semibold text-[#2A7AFE] mb-2">
                    {cs.industry || 'Case Study'}
                  </p>
                  <h3 className="text-lg font-semibold text-foreground line-clamp-2 group-hover:text-[#2A7AFE] transition-colors">
                    {cs.title}
                  </h3>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-14">
          <Link
            to="/case-studies"
            className="skifi-btn-ghost inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-base font-semibold text-foreground"
            data-testid="view-all-case-studies"
          >
            View All Case Studies
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

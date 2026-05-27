import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Loader2, ArrowRight } from 'lucide-react';
import { Header } from './Header';
import { Footer } from './Footer';
import { FloatingContact } from './FloatingContact';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const CaseStudies = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(`${API}/case-studies?limit=100`);
        setItems(data.items || []);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="bg-background min-h-screen">
      <Header />
      <main className="pt-32 pb-24">
        <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 text-center mb-12">
          <p className="text-xs uppercase tracking-[0.2em] text-[#2A7AFE] font-semibold mb-3">Case Studies</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-foreground mb-4 leading-tight">
            How we <span className="skifi-gradient-text">help brands</span> win their next pitch.
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real projects, real outcomes. A peek inside how we work with founders,
            agencies, and global brands.
          </p>
        </section>

        <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          {loading ? (
            <div className="text-center py-24">
              <Loader2 className="w-8 h-8 text-[#2A7AFE] animate-spin mx-auto" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-24 text-muted-foreground">
              No case studies published yet. Check back soon.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((cs) => (
                <Link
                  key={cs.id}
                  to={`/case-studies/${cs.slug}`}
                  data-testid={`case-grid-${cs.slug}`}
                  className="group flex flex-col rounded-2xl border border-border bg-card overflow-hidden hover:border-[#2A7AFE]/50 hover:-translate-y-1 transition-all duration-500"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-muted">
                    {cs.cover_image_url ? (
                      <img
                        src={cs.cover_image_url}
                        alt={cs.title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : null}
                  </div>
                  <div className="p-5 flex flex-col flex-grow">
                    <p className="text-[10px] uppercase tracking-[0.16em] font-semibold text-[#2A7AFE] mb-2">
                      {cs.industry}
                    </p>
                    <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-[#2A7AFE] transition-colors">
                      {cs.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-grow">
                      {cs.summary}
                    </p>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#2A7AFE]">
                      Read case study <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
      <FloatingContact />
    </div>
  );
};

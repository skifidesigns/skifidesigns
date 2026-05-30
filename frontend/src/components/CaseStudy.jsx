import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { Loader2, ArrowLeft, CheckCircle2, ArrowRight } from 'lucide-react';
import { Header } from './Header';
import { Footer } from './Footer';
import { FloatingContact } from './FloatingContact';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const CaseStudy = () => {
  const { slug } = useParams();
  const [cs, setCs] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const { data } = await axios.get(`${API}/case-studies/${slug}`);
        if (cancelled) return;
        setCs(data);
        // Set page title for SEO + share previews
        document.title = `${data.title} - Case Study | SkiFi Designs`;
      } catch {
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
      try {
        const { data: all } = await axios.get(`${API}/case-studies?limit=4`);
        if (!cancelled) {
          setRelated((all.items || []).filter((x) => x.slug !== slug).slice(0, 3));
        }
      } catch (err) {
        // Non-fatal: related case studies are an optional UX enhancement
        console.warn('[CaseStudy] related fetch failed:', err);
      }
    })();
    return () => { cancelled = true; };
  }, [slug]);

  if (loading) {
    return (
      <div className="bg-background min-h-screen">
        <Header />
        <div className="pt-40 text-center">
          <Loader2 className="w-8 h-8 text-[#2A7AFE] animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  if (notFound || !cs) {
    return (
      <div className="bg-background min-h-screen">
        <Header />
        <main className="pt-40 pb-24 text-center px-6">
          <h1 className="text-3xl font-semibold mb-3">Case study not found</h1>
          <p className="text-muted-foreground mb-6">
            The case study you're looking for doesn't exist or has been unpublished.
          </p>
          <Link to="/case-studies" className="skifi-btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold">
            <ArrowLeft className="w-4 h-4" />
            All case studies
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <Header />
      <main className="pt-28 pb-24">
        <article className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12">
          <Link to="/case-studies" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="w-4 h-4" />
            All case studies
          </Link>

          <p className="text-xs uppercase tracking-[0.2em] text-[#2A7AFE] font-semibold mb-3">
            {cs.industry}
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-foreground leading-tight mb-4">
            {cs.title}
          </h1>
          <p className="text-lg text-muted-foreground mb-2">
            Client: <span className="text-foreground font-medium">{cs.client_name}</span>
          </p>
          <p className="text-lg text-muted-foreground mb-8 max-w-3xl">
            {cs.summary}
          </p>

          {cs.cover_image_url && (
            <div className="rounded-2xl overflow-hidden border border-border mb-12">
              <img
                src={cs.cover_image_url}
                alt={cs.title}
                className="w-full h-auto"
                loading="eager"
              />
            </div>
          )}

          {/* Challenge / Approach / Outcome */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-card border border-border rounded-2xl p-6">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Challenge</p>
              <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">{cs.challenge}</p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-6">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Approach</p>
              <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">{cs.approach}</p>
            </div>
            <div className="bg-card border border-[#2A7AFE]/40 rounded-2xl p-6 bg-[#2A7AFE]/[0.04]">
              <p className="text-xs uppercase tracking-widest text-[#2A7AFE] font-semibold mb-3">Outcome</p>
              <ul className="space-y-2">
                {cs.outcome?.length ? cs.outcome.map((o, i) => (
                  <li key={`${o}-${i}`} className="flex gap-2 text-sm leading-relaxed text-foreground">
                    <CheckCircle2 className="w-4 h-4 text-[#2A7AFE] flex-shrink-0 mt-0.5" />
                    <span>{o}</span>
                  </li>
                )) : <li className="text-sm text-muted-foreground">—</li>}
              </ul>
            </div>
          </section>

          {/* Gallery */}
          {cs.gallery_urls?.length > 0 && (
            <section className="mb-12">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Selected slides</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cs.gallery_urls.map((url, i) => (
                  <div key={url} className="rounded-xl overflow-hidden border border-border">
                    <img src={url} alt={`${cs.title} slide ${i + 1}`} className="w-full h-auto" loading="lazy" />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Tags */}
          {cs.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-12">
              {cs.tags.map((t) => (
                <span key={t} className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
                  #{t}
                </span>
              ))}
            </div>
          )}

          {/* CTA */}
          <div className="bg-foreground text-background rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-semibold mb-2">Want a deck like this?</h3>
            <p className="text-background/70 mb-5">Let's design a presentation that closes your next round or deal.</p>
            <Link to="/#pricing" className="inline-flex items-center gap-2 bg-[#2A7AFE] hover:bg-[#3B82F6] text-white px-6 py-3 rounded-xl font-semibold transition-colors">
              See pricing
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </article>

        {/* Related */}
        {related.length > 0 && (
          <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 mt-20">
            <h2 className="text-2xl font-semibold mb-6">More case studies</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((r) => (
                <Link
                  key={r.id}
                  to={`/case-studies/${r.slug}`}
                  className="group flex flex-col rounded-2xl border border-border bg-card overflow-hidden hover:border-[#2A7AFE]/50 hover:-translate-y-1 transition-all duration-500"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-muted">
                    {r.cover_image_url && (
                      <img src={r.cover_image_url} alt={r.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    )}
                  </div>
                  <div className="p-5">
                    <p className="text-[10px] uppercase tracking-[0.16em] font-semibold text-[#2A7AFE] mb-2">{r.industry}</p>
                    <h3 className="text-base font-semibold line-clamp-2 group-hover:text-[#2A7AFE] transition-colors">{r.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
      <FloatingContact />
    </div>
  );
};

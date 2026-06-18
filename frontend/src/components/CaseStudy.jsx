import React, { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ArrowLeft, CheckCircle2, ArrowRight, ChevronLeft, ChevronRight, Maximize2, Layers, X } from 'lucide-react';
import { Header } from './Header';
import { Footer } from './Footer';
import { FloatingContact } from './FloatingContact';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const BACKEND = process.env.REACT_APP_BACKEND_URL;

// Resolve relative /api/files/... paths to absolute. External URLs pass through.
const assetUrl = (p) => (!p ? '' : (/^https?:/i.test(p) ? p : `${BACKEND}${p.startsWith('/') ? '' : '/'}${p}`));
// Request a smaller pre-generated WebP variant when available; no-op for external URLs.
const variantUrl = (p, variant) => {
  const full = assetUrl(p);
  if (!full || !variant || !full.includes('/api/files/')) return full;
  return full + (full.includes('?') ? '&' : '?') + `v=${variant}`;
};

// Inline swipeable gallery for the case-study detail page.
// Behaviour mirrors the TemplateModal carousel: arrows, thumbnails, keyboard
// navigation, touch swipe, slide counter, animated direction-aware fade-slide,
// and a fullscreen lightbox on click.
const CaseStudyGallery = ({ slides, title, slideCount }) => {
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const touchStartX = useRef(null);

  const goPrev = useCallback(() => {
    setDirection(-1);
    setActive((i) => (i === 0 ? slides.length - 1 : i - 1));
  }, [slides.length]);
  const goNext = useCallback(() => {
    setDirection(1);
    setActive((i) => (i === slides.length - 1 ? 0 : i + 1));
  }, [slides.length]);
  const goTo = useCallback((idx) => {
    setActive((cur) => {
      if (idx === cur) return cur;
      setDirection(idx > cur ? 1 : -1);
      return idx;
    });
  }, []);

  // Keyboard navigation - only when lightbox is open OR mouse hovers gallery.
  // We bind globally for simplicity but gate on lightboxOpen for Esc.
  useEffect(() => {
    if (slides.length < 2 && !lightboxOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape' && lightboxOpen) {
        setLightboxOpen(false);
        return;
      }
      // Only steer slides via keyboard when lightbox is the active layer; on
      // the page we don't want every arrow keypress to scroll the gallery.
      if (!lightboxOpen) return;
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [slides.length, lightboxOpen, goPrev, goNext]);

  const onTouchStart = (e) => { touchStartX.current = e.touches[0]?.clientX ?? null; };
  const onTouchEnd = (e) => {
    if (touchStartX.current == null) return;
    const dx = (e.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
    if (Math.abs(dx) > 40) {
      if (dx < 0) goNext(); else goPrev();
    }
    touchStartX.current = null;
  };

  if (!slides || slides.length === 0) return null;

  return (
    <section className="mb-12" data-testid="case-study-gallery">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Selected slides</p>
        {slideCount && (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Layers className="w-3.5 h-3.5 text-[#2A7AFE]" />
            {slideCount} {slideCount === 1 ? 'slide' : 'slides'}
          </span>
        )}
      </div>

      {/* Main preview */}
      <div
        className="relative w-full aspect-[16/9] bg-white rounded-2xl overflow-hidden border border-border group"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <AnimatePresence initial={false} mode="popLayout" custom={direction}>
          <motion.img
            key={active}
            src={variantUrl(slides[active], 'preview')}
            alt={`${title} - slide ${active + 1}`}
            loading={active === 0 ? 'eager' : 'lazy'}
            decoding="async"
            onClick={() => setLightboxOpen(true)}
            className="absolute inset-0 w-full h-full object-contain cursor-zoom-in bg-white"
            custom={direction}
            variants={{
              enter: (dir) => ({ x: dir > 0 ? 56 : dir < 0 ? -56 : 0, opacity: 0 }),
              center: { x: 0, opacity: 1 },
              exit:  (dir) => ({ x: dir > 0 ? -56 : dir < 0 ? 56 : 0, opacity: 0 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ x: { type: 'tween', duration: 0.22, ease: [0.4, 0, 0.2, 1] }, opacity: { duration: 0.18 } }}
          />
        </AnimatePresence>

        {/* Zoom hint */}
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
          aria-label="Open fullscreen"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>

        {/* Prev/Next */}
        {slides.length > 1 && (
          <>
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-gray-900 shadow-md flex items-center justify-center transition-transform hover:scale-105"
              aria-label="Previous slide"
              data-testid="case-study-prev"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={goNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-gray-900 shadow-md flex items-center justify-center transition-transform hover:scale-105"
              aria-label="Next slide"
              data-testid="case-study-next"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <span className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[11px] font-medium bg-black/65 text-white px-2.5 py-1 rounded-full backdrop-blur-sm tabular-nums">
              {active + 1} / {slides.length}
            </span>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {slides.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 min-w-0 max-w-full scrollbar-thin">
          {slides.map((url, idx) => (
            <button
              key={`${url}-${idx}`}
              type="button"
              onClick={() => goTo(idx)}
              className={`flex-shrink-0 w-24 aspect-video rounded-md overflow-hidden border-2 transition-all bg-white ${
                active === idx
                  ? 'border-[#2A7AFE] ring-2 ring-[#2A7AFE]/30'
                  : 'border-transparent opacity-70 hover:opacity-100'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            >
              <img
                src={variantUrl(url, 'thumb')}
                alt={`Thumb ${idx + 1}`}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-contain"
              />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[110] bg-black/95 flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setLightboxOpen(false); }}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
            aria-label="Close fullscreen"
          >
            <X className="w-5 h-5" />
          </button>
          {slides.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); goPrev(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
                aria-label="Previous"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); goNext(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
                aria-label="Next"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
          <img
            src={assetUrl(slides[active])}
            alt={`${title} - slide ${active + 1}`}
            onClick={(e) => e.stopPropagation()}
            className="max-w-[92vw] max-h-[88vh] object-contain rounded-lg shadow-2xl"
          />
          {slides.length > 1 && (
            <span className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs font-medium bg-white/10 text-white px-3 py-1.5 rounded-full backdrop-blur-sm tabular-nums">
              {active + 1} / {slides.length}
            </span>
          )}
        </div>
      )}
    </section>
  );
};

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
            <div className="rounded-2xl overflow-hidden border border-border mb-12 bg-white">
              <img
                src={variantUrl(cs.cover_image_url, 'preview')}
                srcSet={`${variantUrl(cs.cover_image_url, 'thumb')} 480w, ${variantUrl(cs.cover_image_url, 'preview')} 1280w, ${assetUrl(cs.cover_image_url)} 2400w`}
                sizes="(max-width: 1024px) 100vw, 80vw"
                alt={cs.title}
                className="w-full h-auto"
                loading="eager"
                decoding="async"
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
                )) : <li className="text-sm text-muted-foreground">-</li>}
              </ul>
            </div>
          </section>

          {/* Gallery - swipeable carousel */}
          {cs.gallery_urls?.length > 0 && (
            <CaseStudyGallery
              slides={cs.gallery_urls}
              title={cs.title}
              slideCount={cs.slide_count || cs.gallery_urls.length}
            />
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
                      <img
                        src={variantUrl(r.cover_image_url, 'preview')}
                        srcSet={`${variantUrl(r.cover_image_url, 'thumb')} 480w, ${variantUrl(r.cover_image_url, 'preview')} 1280w`}
                        sizes="(max-width: 768px) 100vw, 33vw"
                        alt={r.title}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
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

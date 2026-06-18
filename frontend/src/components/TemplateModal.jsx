import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { X, Share2, Check, Download, Lock, ShoppingBag, Loader2, Sparkles, Tag, ChevronLeft, ChevronRight, Maximize2, Layers } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { GoogleIcon } from './icons/GoogleIcon';
import { trackEvent } from '../utils/analytics';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const assetUrl = (u) => {
  if (!u) return '';
  if (u.startsWith('http://') || u.startsWith('https://')) return u;
  return `${process.env.REACT_APP_BACKEND_URL}${u.startsWith('/') ? u : '/' + u}`;
};

// Request a smaller pre-generated variant of an uploaded image
// (thumb = ~480w WebP, preview = ~1280w WebP). External URLs are passed through.
// If the backend has no variant for that file, it transparently falls back to
// the original on the server side, so this is always safe to call.
const variantUrl = (u, variant) => {
  const full = assetUrl(u);
  if (!full) return '';
  if (!variant) return full;
  // Only attach ?v= to our own /api/files/<id> URLs to avoid breaking
  // external image URLs (Unsplash, Behance, etc.)
  if (!full.includes('/api/files/')) return full;
  return full + (full.includes('?') ? '&' : '?') + `v=${variant}`;
};

/**
 * TemplateModal - opens when a user clicks a template card on /resources.
 *
 * Behaviour:
 *  - signed out: shows a Google sign-in CTA
 *  - signed in + already owns it: green "You own this - Download" button
 *  - signed in + free: "Download now" -> registers in /me/library + streams file
 *  - signed in + paid (not owned): "Buy for $X" -> Stripe checkout
 *
 * Ownership is determined by calling /api/me/library once on open.
 */
export const TemplateModal = ({ template, open, onClose }) => {
  const { user, login } = useAuth();
  const [busy, setBusy] = useState(false);
  const [owned, setOwned] = useState(false);
  const [ownershipChecking, setOwnershipChecking] = useState(false);
  const [copied, setCopied] = useState(false);

  // Reset state whenever a different template is opened
  useEffect(() => {
    if (!open || !template) return;
    setOwned(false);
    setCopied(false);
    if (!user) return;
    (async () => {
      setOwnershipChecking(true);
      try {
        const { data } = await axios.get(`${API}/me/library`, { withCredentials: true });
        const isOwned = (data.items || []).some((t) => t.id === template.id);
        setOwned(isOwned);
      } catch (err) {
        // non-fatal; user can still try the action
        if (process.env.NODE_ENV !== 'production') {
          console.warn('[TemplateModal] ownership check failed:', err);
        }
      } finally {
        setOwnershipChecking(false);
      }
    })();
  }, [open, template, user]);

  // Lock background scroll while modal is open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  // ============ Preview gallery state (hooks must run before any early return) ============
  // Build the slide list from preview_image_urls (admin-uploaded) and fall back
  // to the single thumbnail_url so older templates without a gallery still work.
  const slides = (() => {
    const arr = Array.isArray(template?.preview_image_urls)
      ? template.preview_image_urls.filter(Boolean)
      : [];
    if (arr.length > 0) return arr;
    return template?.thumbnail_url ? [template.thumbnail_url] : [];
  })();
  const slideCount = template?.slide_count || slides.length || null;
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState(0); // -1 prev / +1 next, 0 initial
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const touchStartX = useRef(null);

  // Reset carousel position whenever a new template is opened
  useEffect(() => {
    setActive(0);
    setDirection(0);
    setLightboxOpen(false);
  }, [template?.id]);

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

  // Keyboard navigation: ← → on the modal, Esc closes whichever layer is open
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        if (lightboxOpen) { setLightboxOpen(false); return; }
        onClose();
        return;
      }
      if (slides.length < 2) return;
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, slides.length, goPrev, goNext, lightboxOpen, onClose]);

  if (!open || !template) return null;

  const isPaid = template.type === 'paid';

  const shareLink = `${window.location.origin}/resources/template/${template.id}`;
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: template.title, url: shareLink });
        return;
      }
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      toast.success('Link copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Could not copy link');
    }
  };

  // Trigger a browser download from a URL
  const downloadFile = (url, filename) => {
    const full = assetUrl(url);
    const a = document.createElement('a');
    a.href = full;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    if (filename) a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handlePrimaryAction = async () => {
    if (!user) {
      login();
      return;
    }
    setBusy(true);
    try {
      const { data } = await axios.post(
        `${API}/templates/${template.id}/access`,
        { origin_url: window.location.origin },
        { withCredentials: true },
      );
      if (data.type === 'free' || data.already_purchased) {
        trackEvent('template_downloaded', {
          template_id: template.id,
          template_name: template.title,
          template_type: template.type,
        });
        toast.success('Saved to your library - opening download…');
        setOwned(true);
        downloadFile(data.download_url, `${template.title}.zip`);
      } else if (data.checkout_url) {
        trackEvent('template_checkout_started', {
          template_id: template.id,
          template_name: template.title,
          value: template.price,
          currency: 'USD',
        });
        // Stripe checkout - full-page redirect
        window.location.href = data.checkout_url;
      }
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Could not start that action');
    } finally {
      setBusy(false);
    }
  };

  // CTA copy + colour
  let ctaLabel = '';
  let ctaIcon = <Download className="w-4 h-4" />;
  let ctaClass = 'bg-[#2A7AFE] hover:bg-[#3B82F6] text-white';
  if (!user) {
    ctaLabel = 'Sign in to download';
    ctaIcon = <GoogleIcon className="w-4 h-4" />;
    ctaClass = 'bg-white text-gray-900 border border-gray-200 hover:bg-gray-50';
  } else if (owned) {
    ctaLabel = isPaid ? 'You own this - Download' : 'Re-download';
    ctaIcon = <Check className="w-4 h-4" />;
    ctaClass = 'bg-emerald-600 hover:bg-emerald-700 text-white';
  } else if (isPaid) {
    ctaLabel = `Buy for $${template.price}`;
    ctaIcon = <ShoppingBag className="w-4 h-4" />;
  } else {
    ctaLabel = 'Download now';
  }

  // Touch swipe on mobile (non-hook helpers - safe to define after early return)
  const onTouchStart = (e) => { touchStartX.current = e.touches[0]?.clientX ?? null; };
  const onTouchEnd = (e) => {
    if (touchStartX.current == null) return;
    const dx = (e.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
    if (Math.abs(dx) > 40) {
      if (dx < 0) goNext(); else goPrev();
    }
    touchStartX.current = null;
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="template-modal-title"
      data-testid="template-modal"
    >
      <div
        className="bg-card border border-border rounded-2xl w-full max-w-6xl my-8 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr]">
          {/* ============ Left: preview carousel ============ */}
          {/* min-w-0 is critical: prevents the flex-shrink-0 thumbnail strip
              from expanding the grid track and squeezing out the right column */}
          <div className="relative bg-muted/40 p-4 md:p-6 flex flex-col min-w-0 order-2 md:order-1">
            <div
              className="relative w-full max-h-[55vh] md:max-h-none aspect-[16/10] bg-muted rounded-xl overflow-hidden group"
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
              data-testid="template-modal-carousel"
            >
              {slides.length > 0 ? (
                <AnimatePresence initial={false} mode="popLayout" custom={direction}>
                  <motion.img
                    key={active}
                    src={variantUrl(slides[active], 'preview')}
                    alt={`${template.title} - slide ${active + 1}`}
                    loading="eager"
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-contain cursor-zoom-in bg-white"
                    onClick={() => setLightboxOpen(true)}
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
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sm text-muted-foreground">
                  No preview available
                </div>
              )}

              {/* Top-left badges: FREE/$X + slide count chip */}
              <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
                {isPaid ? (
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#2A7AFE] text-white">
                    ${template.price}
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-green-500 text-white">
                    FREE
                  </span>
                )}
                {slideCount && (
                  <span
                    data-testid="template-modal-slide-count"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-black/65 text-white backdrop-blur-sm"
                  >
                    <Layers className="w-3 h-3" />
                    {slideCount} {slideCount === 1 ? 'slide' : 'slides'}
                  </span>
                )}
              </div>

              {/* Zoom hint on hover (top-right) */}
              {slides.length > 0 && (
                <button
                  type="button"
                  onClick={() => setLightboxOpen(true)}
                  className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  aria-label="Open fullscreen"
                  data-testid="template-modal-zoom"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Prev/Next arrows */}
              {slides.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={goPrev}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-gray-900 shadow-md flex items-center justify-center transition-all hover:scale-105"
                    aria-label="Previous slide"
                    data-testid="template-modal-prev"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-gray-900 shadow-md flex items-center justify-center transition-all hover:scale-105"
                    aria-label="Next slide"
                    data-testid="template-modal-next"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* "Slide N of M" counter */}
              {slides.length > 1 && (
                <span className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[11px] font-medium bg-black/65 text-white px-2.5 py-1 rounded-full backdrop-blur-sm tabular-nums">
                  {active + 1} / {slides.length}
                </span>
              )}
            </div>

            {/* Thumbnail strip */}
            {slides.length > 1 && (
              <div
                className="mt-3 flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 min-w-0 max-w-full scrollbar-thin"
                data-testid="template-modal-thumbs"
              >
                {slides.map((url, idx) => (
                  <button
                    key={`${url}-${idx}`}
                    type="button"
                    onClick={() => goTo(idx)}
                    className={`flex-shrink-0 w-20 aspect-[16/10] rounded-md overflow-hidden border-2 transition-all ${
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
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ============ Right: details ============ */}
          <div className="p-6 md:p-8 flex flex-col overflow-y-auto md:max-h-[80vh] min-w-0 order-1 md:order-2">
            <div className="flex items-start justify-between gap-3 mb-3">
              <p className="text-xs uppercase tracking-[0.16em] text-[#2A7AFE] font-semibold">
                {template.category}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleShare}
                  data-testid="template-modal-share"
                  className="w-9 h-9 rounded-full bg-muted hover:bg-muted/70 flex items-center justify-center transition-colors"
                  aria-label="Share template"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={onClose}
                  data-testid="template-modal-close"
                  className="w-9 h-9 rounded-full bg-muted hover:bg-muted/70 flex items-center justify-center transition-colors"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <h2 id="template-modal-title" className="text-2xl md:text-3xl font-semibold text-foreground mb-2 leading-tight">
              {template.title}
            </h2>
            {slideCount && (
              <p className="text-xs text-muted-foreground mb-3 inline-flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#2A7AFE]" />
                {slideCount} editable {slideCount === 1 ? 'slide' : 'slides'}
              </p>
            )}

            {template.description && (
              <p className="text-sm text-muted-foreground leading-relaxed mb-5 whitespace-pre-wrap">
                {template.description}
              </p>
            )}

            {template.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-5">
                {template.tags.map((t) => (
                  <span key={t} className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                    <Tag className="w-2.5 h-2.5" />
                    {t}
                  </span>
                ))}
              </div>
            )}

            {/* Whats included */}
            <ul className="space-y-2 mb-6 text-sm text-foreground">
              <li className="flex gap-2"><Sparkles className="w-4 h-4 text-[#2A7AFE] flex-shrink-0 mt-0.5" /> Fully editable in PowerPoint & Google Slides</li>
              <li className="flex gap-2"><Sparkles className="w-4 h-4 text-[#2A7AFE] flex-shrink-0 mt-0.5" /> Saved to your library for unlimited re-downloads</li>
              {isPaid && (
                <li className="flex gap-2"><Sparkles className="w-4 h-4 text-[#2A7AFE] flex-shrink-0 mt-0.5" /> One-time payment, lifetime access</li>
              )}
            </ul>

            {/* Primary CTA */}
            <button
              data-testid="template-modal-cta"
              onClick={handlePrimaryAction}
              disabled={busy || ownershipChecking}
              className={`w-full py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed ${ctaClass}`}
            >
              {busy || ownershipChecking ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : ctaIcon}
              {ownershipChecking ? 'Checking…' : ctaLabel}
            </button>

            {!user && (
              <p className="text-[11px] text-center text-muted-foreground mt-3 flex items-center justify-center gap-1.5">
                <Lock className="w-3 h-3" />
                Free + paid templates require sign-in to save to your library
              </p>
            )}

            {template.preview_url && (
              <a
                href={template.preview_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center text-xs text-[#2A7AFE] hover:underline mt-3"
              >
                Live preview on Google Slides ↗
              </a>
            )}
          </div>
        </div>
      </div>

      {/* ============ Fullscreen lightbox ============ */}
      {lightboxOpen && slides.length > 0 && (
        <div
          className="fixed inset-0 z-[110] bg-black/95 flex items-center justify-center p-4"
          onClick={(e) => { e.stopPropagation(); setLightboxOpen(false); }}
          data-testid="template-modal-lightbox"
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
            alt={`${template.title} - slide ${active + 1}`}
            className="max-w-[92vw] max-h-[88vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          {slides.length > 1 && (
            <span className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs font-medium bg-white/10 text-white px-3 py-1.5 rounded-full backdrop-blur-sm tabular-nums">
              {active + 1} / {slides.length}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

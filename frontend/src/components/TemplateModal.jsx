import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { X, Share2, Check, Download, Lock, ShoppingBag, Loader2, Sparkles, Tag } from 'lucide-react';
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
        className="bg-card border border-border rounded-2xl w-full max-w-4xl my-8 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left - cover image */}
          <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[480px] overflow-hidden bg-muted">
            <img
              src={assetUrl(template.thumbnail_url)}
              alt={template.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4">
              {isPaid ? (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#2A7AFE] text-white">
                  ${template.price}
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500 text-white">
                  FREE
                </span>
              )}
            </div>
          </div>

          {/* Right - details */}
          <div className="p-6 md:p-8 flex flex-col overflow-y-auto max-h-[80vh]">
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

            <h2 id="template-modal-title" className="text-2xl md:text-3xl font-semibold text-foreground mb-3 leading-tight">
              {template.title}
            </h2>

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
    </div>
  );
};

import React, { useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, Download, Lock, Loader2, Tag, Sparkles, ArrowUpRight, Share2, Check, X } from 'lucide-react';
import { Input } from './ui/input';
import { toast } from 'sonner';
import { Header } from './Header';
import { Footer } from './Footer';
import { FloatingContact } from './FloatingContact';
import { useAuth } from '../context/AuthContext';
import { GoogleIcon } from './icons/GoogleIcon';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const BACKEND = process.env.REACT_APP_BACKEND_URL;
const assetUrl = (p) => (!p ? '' : (/^https?:/i.test(p) ? p : `${BACKEND}${p.startsWith('/') ? '' : '/'}${p}`));

const CATEGORIES = [
  'All',
  'Pitch Deck',
  'Sales Deck',
  'Corporate Presentation',
  'Investor Deck',
  'Webinar / Keynote',
  'Infographic',
  'Brand Presentation',
];

const TemplateCard = ({ template, onAction, busyId, isFocused }) => {
  const isPaid = template.type === 'paid';
  const isBusy = busyId === template.id;
  const [copied, setCopied] = useState(false);

  const handleShare = async (e) => {
    e.stopPropagation();
    const url = `${window.location.origin}/resources/template/${template.id}`;
    try {
      // Use native share on mobile if available
      if (navigator.share) {
        await navigator.share({ title: template.title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Link copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Could not copy link');
    }
  };

  return (
    <div
      data-testid={`template-card-${template.id}`}
      className={`group bg-card border rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 flex flex-col ${
        isFocused
          ? 'border-[#2A7AFE] ring-2 ring-[#2A7AFE]/40 shadow-xl shadow-[#2A7AFE]/20'
          : 'border-border hover:border-[#2A7AFE]/50 hover:shadow-xl hover:shadow-[#2A7AFE]/10'
      }`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={assetUrl(template.thumbnail_url)}
          alt={template.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute top-3 left-3">
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
        {/* Share button */}
        <button
          onClick={handleShare}
          data-testid={`template-share-${template.id}`}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/60 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
          aria-label={`Share ${template.title}`}
          title="Copy share link"
        >
          {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
        </button>
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <p className="text-[10px] uppercase tracking-widest text-[#2A7AFE] font-semibold mb-2">
          {template.category}
        </p>
        <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-1">
          {template.title}
        </h3>
        {template.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-grow">
            {template.description}
          </p>
        )}

        {template.tags?.length > 0 && (
          <div className="flex gap-1 flex-wrap mb-4">
            {template.tags.slice(0, 3).map((t) => (
              <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                {t}
              </span>
            ))}
          </div>
        )}

        <button
          data-testid={`template-action-${template.id}`}
          onClick={() => onAction(template)}
          disabled={isBusy}
          className={`w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed mt-auto ${
            isPaid
              ? 'bg-[#2A7AFE] text-white hover:bg-[#3B82F6]'
              : 'bg-foreground text-background hover:opacity-90'
          }`}
        >
          {isBusy ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : isPaid ? (
            <>
              <Sparkles className="w-4 h-4" />
              Buy Template
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Download Free
            </>
          )}
        </button>
      </div>
    </div>
  );
};

const SignInModal = ({ open, onClose }) => {
  const { login } = useAuth();
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4" onClick={onClose}>
      <div
        className="bg-card border border-border rounded-2xl p-8 max-w-md w-full text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-14 h-14 rounded-full bg-[#2A7AFE]/10 flex items-center justify-center mx-auto mb-4">
          <Lock className="w-7 h-7 text-[#2A7AFE]" />
        </div>
        <h3 className="text-2xl font-semibold text-foreground mb-2">Sign in to continue</h3>
        <p className="text-muted-foreground mb-6">
          Sign in with Google to download free templates and unlock paid ones.
        </p>
        <button
          data-testid="signin-google-btn"
          onClick={login}
          className="w-full py-3 rounded-xl bg-white text-gray-900 font-semibold flex items-center justify-center gap-3 border border-gray-200 hover:bg-gray-50 transition-all hover:scale-[1.02]"
        >
          <GoogleIcon className="w-5 h-5" />
          Continue with Google
        </button>
        <button
          onClick={onClose}
          className="mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export const Resources = () => {
  const { user, loading: authLoading } = useAuth();
  const { id: focusedTemplateId } = useParams(); // present when route is /resources/template/:id
  const navigate = useNavigate();
  const focusedCardRef = useRef(null);

  const [templates, setTemplates] = useState([]);
  const [focusedFromServer, setFocusedFromServer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [typeFilter, setTypeFilter] = useState('all'); // all | free | paid
  const [search, setSearch] = useState('');
  const [signInOpen, setSignInOpen] = useState(false);
  const [busyId, setBusyId] = useState(null);

  // When the URL has /resources/template/:id, fetch that specific template's
  // metadata so we can highlight the card AND still show the rest of the page.
  useEffect(() => {
    if (!focusedTemplateId) {
      setFocusedFromServer(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const { data } = await axios.get(`${API}/templates/${focusedTemplateId}`);
        if (!cancelled) setFocusedFromServer(data);
      } catch {
        if (!cancelled) toast.error('That template is not available anymore');
      }
    })();
    return () => { cancelled = true; };
  }, [focusedTemplateId]);

  // When the focused template appears in the filtered list, scroll to it.
  useEffect(() => {
    if (!focusedTemplateId) return;
    const t = setTimeout(() => {
      focusedCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 350);
    return () => clearTimeout(t);
  }, [focusedTemplateId, templates, focusedFromServer]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category !== 'All') params.append('category', category);
      if (typeFilter !== 'all') params.append('type', typeFilter);
      if (search.trim()) params.append('search', search.trim());
      const { data } = await axios.get(`${API}/templates?${params}`);
      setTemplates(data.items || []);
    } catch {
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  }, [category, typeFilter, search]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  const handleAction = async (template) => {
    if (!user) {
      setSignInOpen(true);
      return;
    }
    setBusyId(template.id);
    try {
      const { data } = await axios.post(
        `${API}/templates/${template.id}/access`,
        { origin_url: window.location.origin },
        { withCredentials: true }
      );
      if (data.type === 'free' && data.download_url) {
        window.open(data.download_url, '_blank');
        toast.success('Download started');
      } else if (data.already_purchased && data.download_url) {
        window.open(data.download_url, '_blank');
        toast.success('Welcome back - download started');
      } else if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        toast.error('No download link available');
      }
    } catch (err) {
      if (err?.response?.status === 401) {
        setSignInOpen(true);
      } else {
        toast.error(err?.response?.data?.detail || 'Action failed');
      }
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="bg-background min-h-screen">
      <Header />

      <main className="pt-32 pb-24">
        {/* Hero - minimal, matching rest of site */}
        <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 mb-12 text-center">
          <p className="text-sm uppercase tracking-widest text-[#2A7AFE] font-medium mb-4">
            Template Library
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-foreground mb-5 leading-tight tracking-tight">
            Presentation templates
            <br />
            <span className="text-gradient-animated">
              designed to convert
            </span>{' '}
            future clients.
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A high-performance resource hub: searchable, category-driven, and meticulously crafted to save you hours of design work.
          </p>
        </section>

        {/* Filters */}
        <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 mb-8">
          <div className="bg-card border border-border rounded-2xl p-4 flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                data-testid="resources-search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search presentation templates…"
                className="pl-12 bg-background border-border h-12 text-base"
              />
            </div>

            <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
              <div className="flex gap-2 flex-wrap">
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                      category === c
                        ? 'bg-[#2A7AFE] text-white'
                        : 'bg-background border border-border text-foreground hover:bg-accent'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'free', label: 'Free' },
                  { id: 'paid', label: 'Paid' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTypeFilter(t.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      typeFilter === t.id
                        ? 'bg-foreground text-background'
                        : 'bg-background border border-border text-foreground hover:bg-accent'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Grid */}
        <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          {loading ? (
            <div className="text-center py-24">
              <Loader2 className="w-8 h-8 text-[#2A7AFE] animate-spin mx-auto" />
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Search className="w-7 h-7 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No results found</h3>
              <p className="text-muted-foreground">
                We couldn't find any templates matching your current filters. Try adjusting your search or category.
              </p>
            </div>
          ) : (
            <>
              {/* Shared-link banner: clearly shows the user which template the
                  share link pointed to, with a "view all" escape hatch. */}
              {focusedTemplateId && focusedFromServer && (
                <div
                  data-testid="shared-template-banner"
                  className="mb-8 flex items-center justify-between gap-3 bg-[#2A7AFE]/10 border border-[#2A7AFE]/30 rounded-xl px-5 py-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Share2 className="w-5 h-5 text-[#2A7AFE] flex-shrink-0" />
                    <p className="text-sm text-foreground truncate">
                      Shared template:{' '}
                      <span className="font-semibold">{focusedFromServer.title}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('/resources')}
                    className="flex-shrink-0 text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                    aria-label="Show all templates"
                  >
                    Show all <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* If a shared template is in the URL but doesn't match current
                    filters, show it on its own at the top. */}
                {focusedFromServer
                  && !templates.find((t) => t.id === focusedFromServer.id) && (
                  <div ref={focusedCardRef}>
                    <TemplateCard
                      template={focusedFromServer}
                      onAction={handleAction}
                      busyId={busyId}
                      isFocused
                    />
                  </div>
                )}
                {templates.map((t) => {
                  const isFocused = t.id === focusedTemplateId;
                  return (
                    <div key={t.id} ref={isFocused ? focusedCardRef : null}>
                      <TemplateCard
                        template={t}
                        onAction={handleAction}
                        busyId={busyId}
                        isFocused={isFocused}
                      />
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </section>
      </main>

      <Footer />
      <FloatingContact />

      <SignInModal open={signInOpen} onClose={() => setSignInOpen(false)} />
    </div>
  );
};

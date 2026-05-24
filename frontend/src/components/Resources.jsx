import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Search, Download, Lock, Loader2, Tag, Sparkles, ArrowUpRight } from 'lucide-react';
import { Input } from './ui/input';
import { toast } from 'sonner';
import { Header } from './Header';
import { Footer } from './Footer';
import { FloatingContact } from './FloatingContact';
import { useAuth } from '../context/AuthContext';

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

const TemplateCard = ({ template, onAction, busyId }) => {
  const isPaid = template.type === 'paid';
  const isBusy = busyId === template.id;
  return (
    <div
      data-testid={`template-card-${template.id}`}
      className="group bg-card border border-border rounded-2xl overflow-hidden hover:border-[#2A7AFE]/50 hover:shadow-xl hover:shadow-[#2A7AFE]/10 transition-all duration-300 hover:-translate-y-1 flex flex-col"
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
          <svg className="w-5 h-5" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917"/>
            <path fill="#FF3D00" d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691"/>
            <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44"/>
            <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917"/>
          </svg>
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
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [typeFilter, setTypeFilter] = useState('all'); // all | free | paid
  const [search, setSearch] = useState('');
  const [signInOpen, setSignInOpen] = useState(false);
  const [busyId, setBusyId] = useState(null);

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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((t) => (
                <TemplateCard
                  key={t.id}
                  template={t}
                  onAction={handleAction}
                  busyId={busyId}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
      <FloatingContact />

      <SignInModal open={signInOpen} onClose={() => setSignInOpen(false)} />
    </div>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import {
  UploadCloud, FileText, Loader2, ArrowLeft, ArrowUpRight, Sparkles,
  ChevronRight, RefreshCw,
} from 'lucide-react';
import { Header } from './Header';
import { Footer } from './Footer';
import { FloatingContact } from './FloatingContact';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useAuth } from '../context/AuthContext';
import { AILabSignInGate } from './AILabSignInGate';
import { trackEvent } from '../utils/analytics';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ScoreRing = ({ value }) => {
  const radius = 78;
  const circ = 2 * Math.PI * radius;
  const [animatedValue, setAnimatedValue] = useState(0);
  useEffect(() => {
    let start = 0;
    const target = Math.max(0, Math.min(100, value || 0));
    const step = () => {
      start = Math.min(target, start + Math.max(1, Math.ceil(target / 30)));
      setAnimatedValue(start);
      if (start < target) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [value]);
  const offset = circ - (animatedValue / 100) * circ;
  const verdictColor = animatedValue >= 75 ? '#10B981' : animatedValue >= 50 ? '#F59E0B' : '#EF4444';
  return (
    <div className="relative w-44 h-44 sm:w-52 sm:h-52">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r={radius} stroke="currentColor" className="text-border" strokeWidth="14" fill="none" />
        <circle
          cx="100" cy="100" r={radius} stroke={verdictColor} strokeWidth="14" fill="none"
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.2, 0.8, 0.2, 1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="font-display text-5xl sm:text-6xl font-semibold tracking-tight tabular-nums" style={{ color: verdictColor }}>
          {animatedValue}
        </div>
        <div className="text-xs text-muted-foreground uppercase tracking-widest mt-1">out of 100</div>
      </div>
    </div>
  );
};

const DimensionBar = ({ name, score, note, delay = 0 }) => {
  const [animated, setAnimated] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setAnimated(score), 250 + delay);
    return () => clearTimeout(t);
  }, [score, delay]);
  const color = score >= 75 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="bg-card border border-border rounded-xl p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="font-semibold text-sm sm:text-base text-foreground">{name}</div>
        <div className="text-sm font-semibold tabular-nums text-muted-foreground">{score}/100</div>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden mb-2.5">
        <div className={`h-full ${color} rounded-full transition-all duration-1000 ease-out`} style={{ width: `${animated}%` }} />
      </div>
      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{note}</p>
    </div>
  );
};

const verdictBadge = (overall) => {
  if (overall >= 75) return { label: 'Investor-ready', cls: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' };
  if (overall >= 50) return { label: 'Getting there', cls: 'bg-amber-500/10 text-amber-600 border-amber-500/20' };
  return { label: 'Needs work', cls: 'bg-red-500/10 text-red-600 border-red-500/20' };
};

export const AIDeckReview = () => {
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const onPickFile = (f) => {
    if (!f) return;
    if (f.type !== 'application/pdf') {
      toast.error('Please choose a PDF file');
      return;
    }
    if (f.size > 20 * 1024 * 1024) {
      toast.error('PDF is larger than 20 MB');
      return;
    }
    setFile(f);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return toast.error('Upload your deck PDF first');

    setSubmitting(true);
    trackEvent('ai_lab_deck_review_started', { has_company: !!company });
    try {
      const fd = new FormData();
      fd.append('company', company);
      fd.append('pdf', file);
      const { data } = await axios.post(`${API}/ai-lab/deck-review`, fd, {
        timeout: 90000,
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(data);
      trackEvent('ai_lab_deck_review_completed', { overall: data.overall });
      setTimeout(() => document.getElementById('deck-results')?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Review failed - please try again');
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setResult(null); setFile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32 sm:pt-36 pb-24 px-4 sm:px-6 lg:px-12">
        <div className="max-w-4xl mx-auto">
          <Link to="/ai-lab" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to AI Lab
          </Link>
          <div className="mb-8 sm:mb-12 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#2A7AFE]/10 text-[#2A7AFE] text-xs font-semibold tracking-wider uppercase mb-5">
              <Sparkles className="w-3.5 h-3.5" />
              Free &middot; AI Pitch Deck Review
            </div>
            <h1 className="font-display text-[34px] sm:text-[48px] lg:text-[56px] font-semibold leading-[1.05] tracking-tight text-foreground mb-4">
              See your deck like an investor does.
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              Upload your PDF. Get an investor-readiness score, 8-dimension scorecard, and the top 3 things to fix &mdash; in under a minute.
            </p>
          </div>

          {!result && (
            <AILabSignInGate toolLabel="AI Pitch Deck Review">
            <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-6" data-testid="deck-review-form">
              <div
                className={`relative rounded-xl border-2 border-dashed transition-colors cursor-pointer ${
                  dragOver ? 'border-[#2A7AFE] bg-[#2A7AFE]/5' : file ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-border hover:border-muted-foreground'
                }`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); onPickFile(e.dataTransfer.files?.[0]); }}
                onClick={() => fileInputRef.current?.click()}
                data-testid="deck-dropzone"
              >
                <input ref={fileInputRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => onPickFile(e.target.files?.[0])} />
                <div className="px-6 py-12 sm:py-16 text-center">
                  {file ? (
                    <>
                      <FileText className="w-10 h-10 mx-auto text-emerald-500 mb-3" />
                      <div className="font-semibold text-foreground">{file.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB &middot; click to change</div>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                      <div className="font-semibold text-foreground">Drop your deck or click to upload</div>
                      <div className="text-xs text-muted-foreground mt-1">PDF &middot; up to 20 MB &middot; ~30 slides</div>
                    </>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 text-sm" data-testid="deck-signed-in-as">
                  {user?.picture ? (
                    <img src={user.picture} alt={user.name} className="w-6 h-6 rounded-full" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-[#2A7AFE] text-white text-xs font-semibold flex items-center justify-center">
                      {(name || email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <span className="font-medium text-foreground">{name || email}</span>
                  <span className="text-muted-foreground">&middot; {email}</span>
                </div>
                <Input
                  data-testid="deck-input-company"
                  placeholder="Company (optional)"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="flex-1 min-w-[200px]"
                />
              </div>

              <Button
                type="submit"
                disabled={submitting || !file}
                data-testid="deck-submit-btn"
                className="w-full bg-[#2A7AFE] hover:bg-[#3B82F6] text-white font-semibold py-6 text-base"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Reviewing your deck&hellip; (10-40s)
                  </>
                ) : (
                  <>
                    Review my deck
                    <ChevronRight className="w-5 h-5 ml-1" />
                  </>
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Your deck is used only to run this review &mdash; not stored or shared.
              </p>
            </form>
            </AILabSignInGate>
          )}

          {result && (
            <div id="deck-results" data-testid="deck-results" className="space-y-6">
              <div className="bg-card border border-border rounded-2xl p-6 sm:p-10">
                <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
                  <ScoreRing value={result.overall} />
                  <div className="flex-1 text-center lg:text-left">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${verdictBadge(result.overall).cls} mb-4`}>
                      {verdictBadge(result.overall).label}
                    </span>
                    <h2 className="font-display text-2xl sm:text-3xl font-semibold text-foreground leading-tight tracking-tight">
                      {result.verdict}
                    </h2>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Scorecard</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(result.dimensions || []).map((d, i) => (
                    <DimensionBar key={d.name} {...d} delay={i * 80} />
                  ))}
                </div>
              </div>

              <div className="bg-card border border-border rounded-2xl p-6 sm:p-8">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Top 3 priorities</h3>
                <ol className="space-y-3">
                  {(result.priorities || []).map((p, i) => (
                    <li key={`${i}-${(p || '').slice(0, 20)}`} className="flex gap-4 items-start">
                      <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[#2A7AFE] text-white font-semibold text-xs flex items-center justify-center">{i + 1}</span>
                      <span className="text-sm sm:text-base text-foreground leading-relaxed pt-0.5">{p}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="bg-gradient-to-br from-[#0A0F1E] to-[#1a1f3e] text-white rounded-2xl p-8 sm:p-12 text-center">
                <h3 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight mb-3">
                  This is what AI sees in 60 seconds.
                </h3>
                <p className="text-white/70 mb-7 max-w-xl mx-auto">Imagine what our designers do with it. We&apos;ve shipped 2,700+ investor decks - let&apos;s make yours one of them.</p>
                <div className="flex flex-wrap gap-3 justify-center">
                  <a href="/#pricing" className="inline-flex items-center gap-1.5 px-6 py-3 rounded-xl bg-[#2A7AFE] hover:bg-[#3B82F6] text-white font-semibold transition-colors">
                    Start a project <ArrowUpRight className="w-4 h-4" />
                  </a>
                  <button
                    data-cal-link="skifi/30min"
                    data-cal-namespace="30min"
                    data-cal-config='{"layout":"month_view"}'
                    className="inline-flex items-center gap-1.5 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors"
                  >
                    Book a free call
                  </button>
                </div>
                <button type="button" onClick={reset} className="inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white mt-7 transition-colors">
                  <RefreshCw className="w-3.5 h-3.5" />
                  Review another deck
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <FloatingContact />
    </div>
  );
};

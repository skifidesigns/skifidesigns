import React, { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, X, ChevronRight, ArrowUpRight, Sparkles, Star } from 'lucide-react';
import { Header } from './Header';
import { Footer } from './Footer';
import { FloatingContact } from './FloatingContact';
import { OnboardingWizard } from './OnboardingWizard';
import { ALTERNATIVES } from '../data/alternatives';

/**
 * Comparison / "alternatives" landing page (e.g. /alternatives/gamma-ai).
 * Targets high-intent users already shopping for SkiFi-style human design.
 * Honest about competitor strengths (E-E-A-T), specific about gaps.
 */
export const AlternativeLanding = () => {
  const { slug } = useParams();
  const alt = ALTERNATIVES[slug];

  const [wizardOpen, setWizardOpen] = useState(false);
  const [openFaqIdx, setOpenFaqIdx] = useState(0);

  useEffect(() => {
    if (!alt) return;
    const prevTitle = document.title;
    const prevDesc = document.querySelector('meta[name="description"]')?.getAttribute('content');
    document.title = alt.metaTitle;
    const md = document.querySelector('meta[name="description"]');
    if (md) md.setAttribute('content', alt.metaDescription);
    let link = document.querySelector('link[rel="canonical"]');
    if (link) link.setAttribute('href', `https://skifidesigns.com/alternatives/${alt.slug}`);
    return () => {
      document.title = prevTitle;
      if (md && prevDesc) md.setAttribute('content', prevDesc);
    };
  }, [alt]);

  if (!alt) return <Navigate to="/" replace />;

  const canonical = `https://skifidesigns.com/alternatives/${alt.slug}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        '@id': `${canonical}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://skifidesigns.com/' },
          { '@type': 'ListItem', position: 2, name: 'Alternatives', item: 'https://skifidesigns.com/alternatives' },
          { '@type': 'ListItem', position: 3, name: alt.title, item: canonical },
        ],
      },
      {
        '@type': 'FAQPage',
        '@id': `${canonical}#faq`,
        mainEntity: alt.faqs.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Header />

      <main className="pt-24" data-testid={`alternative-page-${alt.slug}`}>
        {/* Hero */}
        <section className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 pt-12 pb-12">
          <nav className="text-xs text-muted-foreground mb-6">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">{alt.title}</span>
          </nav>

          <p className="inline-flex items-center gap-1.5 text-xs font-bold tracking-[0.18em] uppercase text-[#2A7AFE] mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            {alt.eyebrow}
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-foreground tracking-tight leading-[1.05] max-w-4xl mb-5">
            {alt.h1}
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mb-6 leading-relaxed">
            {alt.subhead}
          </p>
          <p className="text-base text-foreground/80 max-w-3xl mb-8 leading-relaxed border-l-2 border-[#2A7AFE]/30 pl-5 italic">
            {alt.intro}
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              data-testid={`alt-cta-${alt.slug}-primary`}
              onClick={() => setWizardOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#2A7AFE] hover:bg-[#3B82F6] text-white font-semibold text-sm uppercase tracking-wide hover:shadow-xl hover:shadow-[#2A7AFE]/30 transition-all duration-300 hover:scale-[1.02]"
            >
              {alt.ctaPrimary}
              <ArrowUpRight className="w-4 h-4" />
            </button>
            <Link
              to="/case-studies"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl border border-border bg-card hover:border-foreground text-foreground font-semibold text-sm uppercase tracking-wide transition-colors"
            >
              {alt.ctaSecondary}
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* Strengths + gaps comparison */}
        <section className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-7 rounded-2xl bg-card border border-border">
              <h3 className="text-xs font-bold uppercase tracking-widest text-foreground/60 mb-4">
                Where {alt.competitor} shines
              </h3>
              <ul className="space-y-3">
                {alt.competitorStrengths.map((s) => (
                  <li key={s} className="flex gap-3 items-start text-sm text-foreground/85">
                    <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" strokeWidth={3} />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-xs text-muted-foreground italic">
                We genuinely like {alt.competitor}. We are not here to bash it.
              </p>
            </div>
            <div className="p-7 rounded-2xl border-2 border-[#2A7AFE]/30 bg-[#2A7AFE]/[0.04]">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#2A7AFE] mb-4">
                Where SkiFi steps in
              </h3>
              <p className="text-sm text-foreground/85 mb-3">
                Where {alt.competitor} hits its ceiling, our designers take over with custom work.
              </p>
              <Link
                to="/case-studies"
                className="inline-flex items-center gap-1 text-sm font-semibold text-[#2A7AFE] hover:underline"
              >
                See examples
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Gap-by-gap breakdown */}
        <section className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-10">
          <h2 className="text-3xl sm:text-4xl font-semibold text-foreground tracking-tight mb-10">
            What you get with SkiFi that <span className="text-[#2A7AFE]">{alt.competitor}</span> can&apos;t do.
          </h2>
          <div className="space-y-4">
            {alt.competitorGaps.map((g, i) => (
              <motion.div
                key={g.gap}
                initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.04 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 rounded-2xl border border-border bg-card"
              >
                <div className="flex gap-3 items-start">
                  <div className="w-6 h-6 rounded-full bg-rose-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <X className="w-3.5 h-3.5 text-rose-500" strokeWidth={3} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-rose-500/80 font-bold mb-1">{alt.competitor} gap</p>
                    <p className="text-sm text-foreground/85">{g.gap}</p>
                  </div>
                </div>
                <div className="flex gap-3 items-start md:border-l md:border-border md:pl-5">
                  <div className="w-6 h-6 rounded-full bg-[#2A7AFE]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 text-[#2A7AFE]" strokeWidth={3} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-[#2A7AFE] font-bold mb-1">SkiFi delivers</p>
                    <p className="text-sm text-foreground/85">{g.fix}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Who it's for */}
        <section className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight mb-5">When to switch</h2>
          <ul className="space-y-2.5 text-sm text-foreground/85">
            {alt.whoFor.map((w) => (
              <li key={w} className="flex gap-2 items-start">
                <Check className="w-4 h-4 text-[#2A7AFE] mt-0.5 flex-shrink-0" strokeWidth={3} />
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Pricing */}
        <section className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-10">
          <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-[#2A7AFE] via-[#3B82F6] to-[#1E40AF] text-white relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
            <div className="relative">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/70 mb-3">Switch from {alt.competitor}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/15">
                  <p className="text-xs text-white/70 mb-2">{alt.pricingHook.starter}</p>
                  <p className="text-3xl font-semibold tabular-nums">{alt.pricingHook.starterPrice}</p>
                </div>
                <div className="bg-white text-gray-900 rounded-2xl p-5 shadow-xl">
                  <p className="text-xs text-gray-600 mb-2">{alt.pricingHook.premium}</p>
                  <p className="text-3xl font-semibold tabular-nums">{alt.pricingHook.premiumPrice}</p>
                </div>
              </div>
              <p className="text-sm text-white/85 max-w-2xl mb-5">{alt.pricingHook.callout}</p>
              <button
                data-testid={`alt-pricing-cta-${alt.slug}`}
                onClick={() => setWizardOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-[#2A7AFE] hover:bg-white/90 font-semibold text-sm transition-colors"
              >
                Start Now
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-10">
          <h2 className="text-3xl sm:text-4xl font-semibold text-foreground tracking-tight mb-8">Common questions</h2>
          <div className="space-y-3">
            {alt.faqs.map((f, i) => {
              const isOpen = openFaqIdx === i;
              return (
                <div key={f.q} className={`border rounded-2xl overflow-hidden transition-colors ${isOpen ? 'border-[#2A7AFE]/40 bg-[#2A7AFE]/[0.03]' : 'border-border bg-card'}`}>
                  <button
                    onClick={() => setOpenFaqIdx(isOpen ? -1 : i)}
                    data-testid={`alt-faq-toggle-${alt.slug}-${i}`}
                    className="w-full flex justify-between items-center gap-4 px-5 py-4 text-left"
                  >
                    <span className="text-sm sm:text-base font-semibold text-foreground">{f.q}</span>
                    <ChevronRight className={`w-4 h-4 flex-shrink-0 text-muted-foreground transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                  </button>
                  {isOpen && <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">{f.a}</div>}
                </div>
              );
            })}
          </div>
        </section>

        {/* Related alternatives */}
        {alt.relatedAlternatives?.length > 0 && (
          <section className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-10">
            <h2 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight mb-6">Compare with more</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {alt.relatedAlternatives.map((rs) => {
                const r = ALTERNATIVES[rs];
                if (!r) return null;
                return (
                  <Link
                    key={rs}
                    to={`/alternatives/${rs}`}
                    data-testid={`related-alt-${rs}`}
                    className="p-5 rounded-2xl border border-border bg-card hover:border-[#2A7AFE]/40 hover:shadow-lg transition-all group"
                  >
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#2A7AFE] mb-2">vs SkiFi</p>
                    <h3 className="text-base font-semibold text-foreground mb-1 group-hover:text-[#2A7AFE] transition-colors">{r.competitorFull}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">{r.eyebrow}</p>
                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-foreground/70 group-hover:text-[#2A7AFE]">
                      Compare <ArrowUpRight className="w-3 h-3" />
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Final CTA */}
        <section className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-12 pb-20">
          <div className="text-center py-12 px-6 rounded-3xl border border-border bg-card">
            <Star className="w-6 h-6 text-[#2A7AFE] mx-auto mb-4 fill-[#2A7AFE]" />
            <h2 className="text-3xl sm:text-4xl font-semibold text-foreground tracking-tight mb-3">
              Ready to ship a deck that does not look AI-built?
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto mb-7">
              Get a real designer on it. Quote in 24 hours. Most decks ship in 5-7 business days.
            </p>
            <button
              data-testid={`alt-final-cta-${alt.slug}`}
              onClick={() => setWizardOpen(true)}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-[#2A7AFE] hover:bg-[#3B82F6] text-white font-semibold text-sm uppercase tracking-wide hover:shadow-xl hover:shadow-[#2A7AFE]/30 transition-all duration-300 hover:scale-[1.02]"
            >
              {alt.ctaPrimary}
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      </main>

      <Footer />
      <FloatingContact />
      <OnboardingWizard open={wizardOpen} onClose={() => setWizardOpen(false)} initialPlan="per_slide" />
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, ChevronRight, ArrowUpRight, Sparkles, Star } from 'lucide-react';
import { Header } from './Header';
import { Footer } from './Footer';
import { FloatingContact } from './FloatingContact';
import { OnboardingWizard } from './OnboardingWizard';
import { SERVICES } from '../data/services';

/**
 * Universal /services/:slug landing page.
 *
 * Renders per-service hero, value props, who-it-is-for, deliverables, pricing
 * hook (links to /#pricing), FAQ accordion (SEO-friendly), related services,
 * dynamic JSON-LD (Service + BreadcrumbList + FAQPage). Internal-links to
 * related services to boost crawl-depth and topical authority.
 */
export const ServiceLanding = () => {
  const { slug } = useParams();
  const svc = SERVICES[slug];

  const [wizardOpen, setWizardOpen] = useState(false);
  const [openFaqIdx, setOpenFaqIdx] = useState(0);

  // SEO: dynamic title + meta description (best-effort - real SSR would be better)
  useEffect(() => {
    if (!svc) return;
    const prevTitle = document.title;
    const prevDesc = document.querySelector('meta[name="description"]')?.getAttribute('content');
    document.title = svc.metaTitle;
    const md = document.querySelector('meta[name="description"]');
    if (md) md.setAttribute('content', svc.metaDescription);
    // Canonical
    let link = document.querySelector('link[rel="canonical"]');
    if (link) link.setAttribute('href', `https://skifidesigns.com/services/${svc.slug}`);
    return () => {
      document.title = prevTitle;
      if (md && prevDesc) md.setAttribute('content', prevDesc);
    };
  }, [svc]);

  if (!svc) return <Navigate to="/" replace />;

  const canonical = `https://skifidesigns.com/services/${svc.slug}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        '@id': `${canonical}#service`,
        name: svc.title,
        url: canonical,
        provider: { '@id': 'https://skifidesigns.com/#organization' },
        areaServed: { '@type': 'Place', name: 'Worldwide' },
        description: svc.metaDescription,
        serviceType: svc.title,
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: `${svc.title} Pricing`,
          itemListElement: [
            { '@type': 'Offer', name: svc.pricingHook.starter, price: svc.pricingHook.starterPrice.replace(/[^0-9]/g, '') || '15', priceCurrency: 'USD', description: svc.pricingHook.starterDesc },
            { '@type': 'Offer', name: svc.pricingHook.premium, price: svc.pricingHook.premiumPrice.replace(/[^0-9]/g, '') || '15', priceCurrency: 'USD', description: svc.pricingHook.premiumDesc },
          ],
        },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${canonical}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://skifidesigns.com/' },
          { '@type': 'ListItem', position: 2, name: 'Services', item: 'https://skifidesigns.com/#services' },
          { '@type': 'ListItem', position: 3, name: svc.title, item: canonical },
        ],
      },
      {
        '@type': 'FAQPage',
        '@id': `${canonical}#faq`,
        mainEntity: svc.faqs.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
    ],
  };

  const handleStart = () => setWizardOpen(true);

  return (
    <div className="min-h-screen bg-background">
      {/* Per-page JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Header />

      <main className="pt-24" data-testid={`service-page-${svc.slug}`}>
        {/* Hero */}
        <section className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 pt-12 pb-16">
          <nav className="text-xs text-muted-foreground mb-6">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <Link to="/#services" className="hover:text-foreground transition-colors">Services</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">{svc.title}</span>
          </nav>

          <motion.p
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 text-xs font-bold tracking-[0.18em] uppercase text-[#2A7AFE] mb-4"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {svc.eyebrow}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.05 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-foreground tracking-tight leading-[1.05] max-w-4xl mb-5"
          >
            {svc.h1}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg text-muted-foreground max-w-3xl mb-7 leading-relaxed"
          >
            {svc.subhead}
          </motion.p>

          {/* Stat bar */}
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }}
            className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground mb-8"
          >
            {svc.statBar.map((s) => (
              <span key={s} className="inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2A7AFE]" />
                <span className="text-foreground/85 font-medium">{s}</span>
              </span>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap gap-3"
          >
            <button
              data-testid={`service-cta-${svc.slug}-primary`}
              onClick={handleStart}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#2A7AFE] hover:bg-[#3B82F6] text-white font-semibold text-sm uppercase tracking-wide hover:shadow-xl hover:shadow-[#2A7AFE]/30 transition-all duration-300 hover:scale-[1.02]"
            >
              {svc.ctaPrimary}
              <ArrowUpRight className="w-4 h-4" />
            </button>
            <Link
              to="/case-studies"
              data-testid={`service-cta-${svc.slug}-secondary`}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl border border-border bg-card hover:border-foreground text-foreground font-semibold text-sm uppercase tracking-wide transition-colors"
            >
              {svc.ctaSecondary}
              <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </section>

        {/* Value props */}
        <section className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
          <h2 className="text-3xl sm:text-4xl font-semibold text-foreground tracking-tight mb-10">
            Why teams choose SkiFi for <span className="text-[#2A7AFE]">{svc.title.toLowerCase()}</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {svc.valueProps.map((vp, i) => (
              <motion.div
                key={vp.title}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="p-6 rounded-2xl border border-border bg-card hover:border-[#2A7AFE]/40 transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-[#2A7AFE]/10 flex items-center justify-center mb-4">
                  <Star className="w-4 h-4 text-[#2A7AFE] fill-[#2A7AFE]" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{vp.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{vp.body}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Who it's for + deliverables */}
        <section className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="p-7 rounded-2xl bg-card border border-border">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#2A7AFE] mb-4">Who it&apos;s for</h3>
              <ul className="space-y-3">
                {svc.whoFor.map((w) => (
                  <li key={w} className="flex gap-3 items-start text-sm text-foreground/85">
                    <Check className="w-4 h-4 text-[#2A7AFE] mt-0.5 flex-shrink-0" strokeWidth={3} />
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-7 rounded-2xl bg-card border border-border">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#2A7AFE] mb-4">What you get</h3>
              <ul className="space-y-3">
                {svc.deliverables.map((d) => (
                  <li key={d} className="flex gap-3 items-start text-sm text-foreground/85">
                    <Check className="w-4 h-4 text-[#2A7AFE] mt-0.5 flex-shrink-0" strokeWidth={3} />
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Pricing hook */}
        <section className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
          <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-[#2A7AFE] via-[#3B82F6] to-[#1E40AF] text-white relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
            <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/15">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/70 mb-2">{svc.pricingHook.starter}</p>
                <p className="text-3xl font-semibold tabular-nums mb-1">{svc.pricingHook.starterPrice}</p>
                <p className="text-xs text-white/70">{svc.pricingHook.starterDesc}</p>
              </div>
              <div className="bg-white text-gray-900 rounded-2xl p-5 shadow-xl">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#2A7AFE] mb-2 inline-flex items-center gap-1">
                  <Star className="w-3 h-3 fill-[#2A7AFE]" /> {svc.pricingHook.premium}
                </p>
                <p className="text-3xl font-semibold tabular-nums mb-1">{svc.pricingHook.premiumPrice}</p>
                <p className="text-xs text-gray-600">{svc.pricingHook.premiumDesc}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/15">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/70 mb-2">Slide-by-slide</p>
                <p className="text-3xl font-semibold tabular-nums mb-1">{svc.pricingHook.perSlidePrice}</p>
                <p className="text-xs text-white/70">{svc.pricingHook.perSlide}</p>
              </div>
            </div>
            <div className="relative mt-6 flex flex-wrap gap-3">
              <button
                data-testid={`service-pricing-cta-${svc.slug}`}
                onClick={handleStart}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-[#2A7AFE] hover:bg-white/90 font-semibold text-sm transition-colors"
              >
                Start Now
                <ArrowUpRight className="w-4 h-4" />
              </button>
              <Link
                to="/#pricing"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/30 hover:bg-white/10 text-white font-semibold text-sm transition-colors"
              >
                Full Pricing
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
          <h2 className="text-3xl sm:text-4xl font-semibold text-foreground tracking-tight mb-8">Common questions</h2>
          <div className="space-y-3">
            {svc.faqs.map((f, i) => {
              const isOpen = openFaqIdx === i;
              return (
                <div
                  key={f.q}
                  className={`border rounded-2xl overflow-hidden transition-colors ${
                    isOpen ? 'border-[#2A7AFE]/40 bg-[#2A7AFE]/[0.03]' : 'border-border bg-card'
                  }`}
                >
                  <button
                    onClick={() => setOpenFaqIdx(isOpen ? -1 : i)}
                    data-testid={`service-faq-toggle-${svc.slug}-${i}`}
                    className="w-full flex justify-between items-center gap-4 px-5 py-4 text-left"
                  >
                    <span className="text-sm sm:text-base font-semibold text-foreground">{f.q}</span>
                    <ChevronRight className={`w-4 h-4 flex-shrink-0 text-muted-foreground transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">{f.a}</div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Related services */}
        {svc.relatedServices?.length > 0 && (
          <section className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
            <h2 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight mb-6">Related services</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {svc.relatedServices.map((rs) => {
                const r = SERVICES[rs];
                if (!r) return null;
                return (
                  <Link
                    key={rs}
                    to={`/services/${rs}`}
                    data-testid={`related-service-${rs}`}
                    className="p-5 rounded-2xl border border-border bg-card hover:border-[#2A7AFE]/40 hover:shadow-lg transition-all group"
                  >
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#2A7AFE] mb-2">Service</p>
                    <h3 className="text-base font-semibold text-foreground mb-2 group-hover:text-[#2A7AFE] transition-colors">{r.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">{r.eyebrow}</p>
                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-foreground/70 group-hover:text-[#2A7AFE]">
                      Learn more <ArrowUpRight className="w-3 h-3" />
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
            <h2 className="text-3xl sm:text-4xl font-semibold text-foreground tracking-tight mb-3">
              Ready to ship a deck you&apos;re proud of?
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto mb-7">
              Get an exact quote in 24 hours. Most projects ship in 5-7 business days.
            </p>
            <button
              data-testid={`service-final-cta-${svc.slug}`}
              onClick={handleStart}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-[#2A7AFE] hover:bg-[#3B82F6] text-white font-semibold text-sm uppercase tracking-wide hover:shadow-xl hover:shadow-[#2A7AFE]/30 transition-all duration-300 hover:scale-[1.02]"
            >
              {svc.ctaPrimary}
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      </main>

      <Footer />
      <FloatingContact />
      <OnboardingWizard open={wizardOpen} onClose={() => setWizardOpen(false)} initialPlan="starter_deck" />
    </div>
  );
};

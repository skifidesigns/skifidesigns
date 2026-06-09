import React, { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, ChevronRight, ArrowUpRight, MapPin, Clock, Building2, Globe } from 'lucide-react';
import { Header } from './Header';
import { Footer } from './Footer';
import { FloatingContact } from './FloatingContact';
import { OnboardingWizard } from './OnboardingWizard';
import { LOCATIONS } from '../data/locations';

/**
 * Local-SEO landing page (e.g. /locations/new-york).
 * Targets "[service] in [city]" intent. Combines time-zone fit, local
 * investor ecosystem, and currency/payment expectations.
 */
export const LocationLanding = () => {
  const { slug } = useParams();
  const loc = LOCATIONS[slug];
  const [wizardOpen, setWizardOpen] = useState(false);

  useEffect(() => {
    if (!loc) return;
    const prevTitle = document.title;
    const prevDesc = document.querySelector('meta[name="description"]')?.getAttribute('content');
    document.title = loc.metaTitle;
    const md = document.querySelector('meta[name="description"]');
    if (md) md.setAttribute('content', loc.metaDescription);
    let link = document.querySelector('link[rel="canonical"]');
    if (link) link.setAttribute('href', `https://skifidesigns.com/locations/${loc.slug}`);
    return () => {
      document.title = prevTitle;
      if (md && prevDesc) md.setAttribute('content', prevDesc);
    };
  }, [loc]);

  if (!loc) return <Navigate to="/" replace />;

  const canonical = `https://skifidesigns.com/locations/${loc.slug}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        '@id': `${canonical}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://skifidesigns.com/' },
          { '@type': 'ListItem', position: 2, name: 'Locations', item: 'https://skifidesigns.com/' },
          { '@type': 'ListItem', position: 3, name: loc.city, item: canonical },
        ],
      },
      {
        '@type': 'Service',
        '@id': `${canonical}#service`,
        name: `Pitch Deck Design in ${loc.city}`,
        url: canonical,
        provider: { '@id': 'https://skifidesigns.com/#organization' },
        areaServed: { '@type': 'Place', name: `${loc.city}, ${loc.region}` },
        description: loc.metaDescription,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Header />

      <main className="pt-24" data-testid={`location-page-${loc.slug}`}>
        {/* Hero */}
        <section className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 pt-12 pb-12">
          <nav className="text-xs text-muted-foreground mb-6">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">{loc.title}</span>
          </nav>

          <p className="inline-flex items-center gap-1.5 text-xs font-bold tracking-[0.18em] uppercase text-[#2A7AFE] mb-4">
            <MapPin className="w-3.5 h-3.5" />
            {loc.city}, {loc.region}
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-foreground tracking-tight leading-[1.05] max-w-4xl mb-5">
            {loc.h1}
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mb-8 leading-relaxed">
            {loc.subhead}
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              data-testid={`loc-cta-${loc.slug}-primary`}
              onClick={() => setWizardOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#2A7AFE] hover:bg-[#3B82F6] text-white font-semibold text-sm uppercase tracking-wide hover:shadow-xl hover:shadow-[#2A7AFE]/30 transition-all duration-300 hover:scale-[1.02]"
            >
              Get Started
              <ArrowUpRight className="w-4 h-4" />
            </button>
            <a
              data-cal-link="skifi/30min"
              data-cal-namespace="30min"
              data-cal-config='{"layout":"month_view"}'
              data-testid={`loc-cta-${loc.slug}-call`}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl border border-border bg-card hover:border-foreground text-foreground font-semibold text-sm uppercase tracking-wide transition-colors cursor-pointer"
            >
              Book a Free 15-min Call
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>
        </section>

        {/* Time-zone + working fit */}
        <section className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-6 rounded-2xl border border-border bg-card">
              <Clock className="w-5 h-5 text-[#2A7AFE] mb-3" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Your time zone</p>
              <p className="text-base font-semibold text-foreground">{loc.timezone}</p>
            </div>
            <div className="p-6 rounded-2xl border border-border bg-card md:col-span-2">
              <Globe className="w-5 h-5 text-[#2A7AFE] mb-3" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">How we sync</p>
              <p className="text-base text-foreground/85 leading-relaxed">{loc.overlap}</p>
            </div>
          </div>
        </section>

        {/* Local context */}
        <section className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-10">
          <h2 className="text-3xl sm:text-4xl font-semibold text-foreground tracking-tight mb-8">
            Built for <span className="text-[#2A7AFE]">{loc.city}</span> founders specifically
          </h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loc.localContext.map((c) => (
              <li key={c} className="flex gap-3 items-start p-5 rounded-2xl border border-border bg-card">
                <Check className="w-5 h-5 text-[#2A7AFE] mt-0.5 flex-shrink-0" strokeWidth={3} />
                <span className="text-sm text-foreground/85 leading-relaxed">{c}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Investor ecosystem */}
        <section className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-10">
          <div className="p-7 sm:p-9 rounded-3xl bg-card border border-border">
            <Building2 className="w-6 h-6 text-[#2A7AFE] mb-4" />
            <h2 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight mb-3">
              We know your investor ecosystem
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 max-w-3xl">
              We have shipped decks for founders pitching some of the most prominent VCs in {loc.city}. We understand their style preferences, their slide-order expectations, and how they read a deck.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {loc.investorEcosystem.map((inv) => (
                <div
                  key={inv}
                  className="px-3 py-2 rounded-lg bg-background border border-border text-xs sm:text-sm text-center font-medium text-foreground/80"
                >
                  {inv}
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4 italic">
              Investor names listed are well-known firms in the {loc.city} ecosystem. Our work with individual investors is confidential.
            </p>
          </div>
        </section>

        {/* Pricing snapshot */}
        <section className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight mb-6">
            Transparent pricing for {loc.city} teams
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl border border-border bg-card">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Starter Deck</p>
              <p className="text-2xl font-semibold text-foreground tabular-nums mb-1">$1,500</p>
              <p className="text-xs text-muted-foreground">Up to 20 slides &middot; 5-7 day turnaround</p>
            </div>
            <div className="p-5 rounded-2xl border-2 border-[#2A7AFE] bg-[#2A7AFE]/5 shadow-lg shadow-[#2A7AFE]/10">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#2A7AFE] mb-2">Premium Deck &middot; Most popular</p>
              <p className="text-2xl font-semibold text-[#2A7AFE] tabular-nums mb-1">$2,500</p>
              <p className="text-xs text-muted-foreground">Up to 40 slides &middot; unlimited revisions</p>
            </div>
            <div className="p-5 rounded-2xl border border-border bg-card">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Slide redesign</p>
              <p className="text-2xl font-semibold text-foreground tabular-nums mb-1">$15 / slide</p>
              <p className="text-xs text-muted-foreground">Bring an existing deck &middot; no minimum</p>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-12 pb-20">
          <div className="text-center py-12 px-6 rounded-3xl border border-border bg-card">
            <h2 className="text-3xl sm:text-4xl font-semibold text-foreground tracking-tight mb-3">
              Ready to win your next {loc.cityShort} meeting?
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto mb-7">
              Get an exact quote in 24 hours. We sync with your time zone and deliver in 5-7 business days.
            </p>
            <button
              data-testid={`loc-final-cta-${loc.slug}`}
              onClick={() => setWizardOpen(true)}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-[#2A7AFE] hover:bg-[#3B82F6] text-white font-semibold text-sm uppercase tracking-wide hover:shadow-xl hover:shadow-[#2A7AFE]/30 transition-all duration-300 hover:scale-[1.02]"
            >
              Start My Deck
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

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, ArrowUpRight, Star, Calendar, Sparkles } from 'lucide-react';
import { OnboardingWizard } from './OnboardingWizard';
import { useTheme } from '../context/ThemeContext';

// Three engagement tiers across the full-stack studio (decks, brand, web,
// product, social, e-commerce, video, AI growth). Each maps to a flow:
//   - 'wizard' opens the existing OnboardingWizard with an optional pre-selected plan
//   - 'cal' opens the Cal.com 15-min booking (data-cal-link on the button)
const pricingPlans = [
  {
    id: 'project',
    name: 'PROJECT',
    price: 'From $499',
    unit: '/ FIXED SCOPE',
    bestFor: 'A single fixed-scope deliverable - a deck, logo, landing page, video, or audit',
    popular: false,
    features: [
      'Any single service from our studio',
      'Clear scope & timeline upfront',
      '2 rounds of revisions included',
      'Editable source files on delivery',
    ],
    cta: 'Start a Project',
    action: 'wizard',
    wizardPlan: null, // lets user choose the right tier inside the wizard
  },
  {
    id: 'studio_retainer',
    name: 'STUDIO RETAINER',
    price: 'From $999',
    unit: '/ MONTH',
    bestFor: 'Teams with ongoing creative needs across multiple services',
    popular: true,
    features: [
      'Monthly design credits usable on ANY service',
      'Priority 48-hour turnaround',
      'Dedicated design team assigned',
      'Slack / WhatsApp direct access',
      'Unused credits roll over month to month',
      'Monthly strategy call included',
    ],
    cta: 'Start a Retainer',
    action: 'wizard',
    wizardPlan: 'monthly_retainer',
  },
  {
    id: 'full_build',
    name: 'FULL BUILD / CUSTOM',
    price: "Let's scope it",
    unit: '/ CUSTOM ENGAGEMENT',
    bestFor: 'Multi-service engagements - brand + web + launch, full product UI/UX, or GEO growth programs',
    popular: false,
    features: [
      'Cross-service senior team',
      'Custom scope & quote in 24 hours',
      'Dedicated project lead',
      'End-to-end delivery across services',
    ],
    cta: 'Book a Call',
    action: 'cal', // wires the button to the existing Cal.com booking
  },
];

// "Starting prices by service" strip - one row per service, linking to /services/<slug>
const SERVICE_PRICES = [
  { name: 'Pitch & Presentation Decks', price: 'from $1,499', note: '$15/slide redesign', slug: 'pitch-deck-design' },
  { name: 'Brand Identity',             price: 'from $899',                                slug: 'brand-identity' },
  { name: 'Web & Landing Pages',        price: 'from $1,499',                              slug: 'web-design' },
  { name: 'UI/UX Product Design',       price: 'from $2,499',                              slug: 'ui-ux-design' },
  { name: 'Social & Marketing Creative',price: 'from $499',                                slug: 'social-media-design' },
  { name: 'E-commerce / Shopify',       price: 'from $1,499',                              slug: 'shopify-store-design' },
  { name: 'Video & Motion',             price: 'from $1,499', note: 'UGC from $150/video', slug: 'video-motion-design' },
  { name: 'AI Growth (GEO/AEO)',        price: 'from $999',                                slug: 'generative-engine-optimization' },
];

export const Pricing = () => {
  const [wizardOpen, setWizardOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const { theme } = useTheme();

  const handleSelectPlan = (planId) => {
    setSelectedPlan(planId);
    setWizardOpen(true);
  };

  return (
    <section id="pricing" className="relative py-16 overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-[#2A7AFE] font-semibold mb-3">
            Investment
          </p>
          <h2 className="text-4xl sm:text-5xl font-semibold text-foreground mb-4">
            World-class design, starting at just <span className="skifi-gradient-text">$15.</span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            From a single redesigned slide to a full brand, website, and launch system - clear pricing for every stage of growth.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto items-stretch">
          {pricingPlans.map((plan, idx) => {
            const isHighlighted = plan.popular;
            const isLight = isHighlighted;
            // Wire the CTA: Cal.com booking for "Full Build", otherwise wizard
            const ctaIsCal = plan.action === 'cal';
            const ctaCommonClass = `w-full py-4 px-6 rounded-2xl font-semibold text-sm uppercase tracking-wide flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02] ${
              plan.popular
                ? 'bg-[#2A7AFE] text-white hover:bg-[#3B82F6] hover:shadow-xl hover:shadow-[#2A7AFE]/40'
                : isLight
                ? 'bg-gray-900 text-white hover:bg-black'
                : 'bg-white text-gray-900 hover:bg-gray-100'
            }`;
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                data-testid={`pricing-card-${plan.id}`}
                className={`relative rounded-3xl p-8 transition-all duration-500 hover:-translate-y-1 flex flex-col ${
                  isLight
                    ? 'bg-white text-gray-900 border border-gray-200 shadow-2xl shadow-[#2A7AFE]/15 md:scale-[1.03]'
                    : theme === 'dark'
                    ? 'bg-white/[0.03] text-white border border-white/10 backdrop-blur-xl'
                    : 'bg-neutral-950 text-white border border-neutral-900'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#2A7AFE] text-white text-[11px] font-semibold tracking-wider px-4 py-1.5 rounded-full inline-flex items-center gap-1.5 whitespace-nowrap leading-none">
                    <Star className="w-3.5 h-3.5 fill-white" />
                    MOST POPULAR
                  </div>
                )}

                <div className="mb-6">
                  <p className={`text-xs font-semibold tracking-widest mb-4 ${
                    isLight ? 'text-gray-600' : 'text-white/70'
                  }`}>
                    {plan.name}
                  </p>
                  <div className="flex items-baseline flex-wrap gap-x-2 gap-y-1 mb-3">
                    <span className={`text-[2.25rem] sm:text-4xl xl:text-[2.75rem] font-semibold tabular-nums leading-none whitespace-nowrap ${
                      isHighlighted ? 'text-[#2A7AFE]' : isLight ? 'text-gray-900' : 'text-white'
                    }`}>
                      {plan.price}
                    </span>
                    <span className={`text-[11px] font-semibold tracking-wider whitespace-nowrap ${isLight ? 'text-gray-500' : 'text-white/55'}`}>
                      {plan.unit}
                    </span>
                  </div>
                  <p className={`text-sm leading-snug ${isLight ? 'text-gray-600' : 'text-white/65'}`}>
                    <span className={`font-semibold ${isLight ? 'text-gray-800' : 'text-white/90'}`}>
                      Best for:
                    </span>{' '}
                    {plan.bestFor}
                  </p>
                </div>

                <div className={`h-px ${isLight ? 'bg-gray-200' : 'bg-white/10'} mb-6`} />

                <ul className="space-y-3.5 mb-8 flex-grow">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
                        isLight ? 'bg-[#2A7AFE]/12' : 'bg-white/10'
                      }`}>
                        <Check className="w-3 h-3 text-[#2A7AFE]" strokeWidth={3} />
                      </div>
                      <span className={`text-sm leading-relaxed ${isLight ? 'text-gray-700' : 'text-white/85'}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {ctaIsCal ? (
                  <button
                    type="button"
                    data-testid={`pricing-cta-${plan.id}`}
                    data-cal-link="skifi/30min"
                    data-cal-namespace="30min"
                    data-cal-config='{"layout":"month_view"}'
                    className={ctaCommonClass}
                  >
                    {plan.cta}
                    <Calendar className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    data-testid={`pricing-cta-${plan.id}`}
                    onClick={() => handleSelectPlan(plan.wizardPlan)}
                    className={ctaCommonClass}
                  >
                    {plan.cta}
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Starting prices by service - clean responsive 2-col strip, links to each /services page */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, delay: 0.12 }}
          className="mt-12 max-w-5xl mx-auto"
          data-testid="pricing-service-prices"
        >
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-semibold text-center mb-5">
            Starting prices by service
          </p>
          <div className={`rounded-3xl border ${
            theme === 'dark' ? 'border-white/10 bg-white/[0.02]' : 'border-gray-200 bg-white'
          } overflow-hidden`}>
            <div className="grid grid-cols-1 md:grid-cols-2">
              {SERVICE_PRICES.map((svc, i) => (
                <Link
                  key={svc.slug}
                  to={`/services/${svc.slug}`}
                  data-testid={`pricing-service-row-${svc.slug}`}
                  className={`group flex items-center justify-between gap-4 px-5 sm:px-6 py-4 transition-colors ${
                    theme === 'dark' ? 'hover:bg-white/[0.04]' : 'hover:bg-gray-50'
                  } ${
                    // Border separators - bottom on every row except the last two on desktop;
                    // also right border on the left column on desktop.
                    theme === 'dark' ? 'border-white/10' : 'border-gray-200'
                  } ${i < SERVICE_PRICES.length - 1 ? 'border-b' : ''} ${
                    i % 2 === 0 ? 'md:border-r' : ''
                  } ${
                    // On desktop, the second-to-last row (left column of bottom pair) keeps its bottom border off
                    i === SERVICE_PRICES.length - 2 ? 'md:border-b-0' : ''
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-sm sm:text-[15px] font-semibold text-foreground truncate">
                      {svc.name}
                    </p>
                    {svc.note && (
                      <p className="text-[11px] text-muted-foreground mt-0.5">{svc.note}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-sm font-semibold text-[#2A7AFE] tabular-nums whitespace-nowrap">
                      {svc.price}
                    </span>
                    <ArrowUpRight className="w-4 h-4 text-muted-foreground transition-all opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Redesign band - slide-by-slide for existing or AI-generated content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-10 max-w-6xl mx-auto"
          data-testid="pricing-redesign-band"
        >
          <div className={`relative overflow-hidden rounded-3xl p-6 sm:p-8 ${
            theme === 'dark'
              ? 'bg-[#0A0F1E] border border-[#2A7AFE]/25'
              : 'bg-[#F5F4EE] border border-[#2A7AFE]/15'
          }`}>
            {/* Decorative gradient blob */}
            <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl opacity-20"
                 style={{ background: 'radial-gradient(circle, #2A7AFE 0%, transparent 70%)' }} />

            <div className="relative grid grid-cols-1 md:grid-cols-[1.6fr_auto] gap-6 md:gap-10 items-center">
              <div>
                <div className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.18em] uppercase mb-3">
                  <Sparkles className={`w-3.5 h-3.5 ${theme === 'dark' ? 'text-[#7AB0FF]' : 'text-[#2A7AFE]'}`} />
                  <span className={theme === 'dark' ? 'text-[#7AB0FF]' : 'text-[#2A7AFE]'}>
                    Already have content?
                  </span>
                </div>
                <h3 className={`text-2xl sm:text-3xl font-semibold tracking-tight leading-snug mb-2 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  We just make it beautiful.
                </h3>
                <p className={`text-sm sm:text-base leading-relaxed max-w-2xl ${
                  theme === 'dark' ? 'text-white/70' : 'text-gray-600'
                }`}>
                  Bring your AI-generated draft, an old deck, or scattered slides. We&apos;ll redesign
                  each one with custom motion, brand polish, and the storytelling rhythm that wins rooms.
                </p>
                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 text-xs">
                  {[
                    'Slide-by-slide pricing',
                    'Custom animation included',
                    'Brand-matched design',
                    'No minimum order',
                  ].map((feat) => (
                    <span key={feat} className={`inline-flex items-center gap-1.5 ${
                      theme === 'dark' ? 'text-white/65' : 'text-gray-600'
                    }`}>
                      <Check className="w-3.5 h-3.5 text-[#2A7AFE]" strokeWidth={3} />
                      {feat}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col items-start md:items-end gap-3">
                <div className="flex items-baseline gap-1.5">
                  <span className={`text-5xl font-semibold tabular-nums leading-none ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    $15
                  </span>
                  <span className={`text-xs font-semibold tracking-wider ${
                    theme === 'dark' ? 'text-white/55' : 'text-gray-500'
                  }`}>
                    / SLIDE
                  </span>
                </div>
                <button
                  data-testid="pricing-cta-per_slide"
                  onClick={() => handleSelectPlan('per_slide')}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#2A7AFE] text-white font-semibold text-sm uppercase tracking-wide hover:bg-[#3B82F6] hover:shadow-xl hover:shadow-[#2A7AFE]/30 transition-all duration-300 hover:scale-[1.02] whitespace-nowrap"
                >
                  Redesign My Slides
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Trust line + tertiary CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-12 max-w-3xl mx-auto text-center"
        >
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-5">
            Not sure which plan fits? Book a free 15-minute call and we&apos;ll tell you exactly what
            your presentation needs - no sales pitch, just honest advice.
          </p>
          <div className="flex justify-center">
            <button
              data-cal-link="skifi/30min"
              data-cal-namespace="30min"
              data-cal-config='{"layout":"month_view"}'
              data-testid="pricing-book-call"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-foreground text-background font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              <Calendar className="w-4 h-4" />
              Book a Free Call
            </button>
          </div>
        </motion.div>
      </div>

      <OnboardingWizard
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        initialPlan={selectedPlan}
      />
    </section>
  );
};

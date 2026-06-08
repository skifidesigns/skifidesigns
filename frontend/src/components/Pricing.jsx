import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, ArrowUpRight, Star, MessageCircle, Calendar } from 'lucide-react';
import { OnboardingWizard } from './OnboardingWizard';
import { useTheme } from '../context/ThemeContext';

const WHATSAPP_HREF =
  'https://wa.me/917827087878?text=' +
  encodeURIComponent(
    "Hi SkiFi team - I have a smaller project (under 20 slides) and would like to discuss a custom quote.",
  );

const pricingPlans = [
  {
    id: 'starter_deck',
    name: 'STARTER DECK',
    price: '$1,500',
    unit: '/ PROJECT',
    bestFor: 'Early-stage startups, one-off pitch decks, and quick turnarounds',
    popular: false,
    features: [
      'Up to 20 custom slides',
      'Story structure & narrative flow',
      'Brand-aligned design from scratch',
      '2 rounds of revisions',
      'Delivered in PowerPoint & PDF',
      '5-7 business day turnaround',
    ],
    cta: 'Start a Project',
  },
  {
    id: 'premium_deck',
    name: 'PREMIUM DECK',
    price: '$2,500',
    unit: '/ PROJECT',
    bestFor: 'Investor pitch decks, high-stakes sales decks, and Series A/B fundraising',
    popular: true,
    features: [
      'Up to 40 custom slides',
      'Full narrative & content strategy',
      'Premium motion & animation',
      'Unlimited revisions until you’re happy',
      'Speaker notes written for you',
      'Delivered in PowerPoint, Keynote & PDF',
      '3-5 business day turnaround',
      'Dedicated senior designer assigned',
    ],
    cta: 'Start a Project',
  },
  {
    id: 'monthly_retainer',
    name: 'MONTHLY RETAINER',
    price: '$3,000',
    unit: '/ MONTH',
    bestFor: 'Agencies, scale-ups, and in-house marketing teams with ongoing presentation needs',
    popular: false,
    features: [
      'Up to 100 slide credits per month',
      'Priority turnaround (48-hour standard)',
      'Dedicated design team - same designers every time',
      'Brand presentation system built in month 1',
      'Slack / WhatsApp direct access',
      'Monthly strategy call included',
      'Unused credits roll over (up to 50)',
    ],
    cta: 'Start a Retainer',
  },
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
            Simple Pricing. <span className="skifi-gradient-text">Serious Results.</span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            No hourly surprises. No scope creep. Just world-class presentations at a price that matches the value they deliver.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto items-stretch">
          {pricingPlans.map((plan, idx) => {
            const isHighlighted = plan.popular;
            const isLight = isHighlighted;
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
                    <span className={`text-[2.75rem] sm:text-5xl xl:text-[3.5rem] font-semibold tabular-nums leading-none whitespace-nowrap ${
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

                <button
                  data-testid={`pricing-cta-${plan.id}`}
                  onClick={() => handleSelectPlan(plan.id)}
                  className={`w-full py-4 px-6 rounded-2xl font-semibold text-sm uppercase tracking-wide flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02] ${
                    plan.popular
                      ? 'bg-[#2A7AFE] text-white hover:bg-[#3B82F6] hover:shadow-xl hover:shadow-[#2A7AFE]/40'
                      : isLight
                      ? 'bg-gray-900 text-white hover:bg-black'
                      : 'bg-white text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {plan.cta}
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </div>

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
          <div className="flex flex-wrap gap-3 justify-center">
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
            <a
              href={WHATSAPP_HREF}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="pricing-whatsapp-small-project"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border bg-card hover:border-[#25D366] hover:text-[#25D366] text-foreground font-semibold text-sm transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Less than 20 slides? Chat on WhatsApp
            </a>
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

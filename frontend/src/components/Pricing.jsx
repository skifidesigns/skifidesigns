import React, { useState } from 'react';
import { Check, ArrowUpRight } from 'lucide-react';
import { OnboardingWizard } from './OnboardingWizard';
import { useTheme } from '../context/ThemeContext';

const pricingPlans = [
  {
    id: 'per_slide',
    name: 'PER SLIDE',
    price: '$15',
    unit: '/ PER SLIDE',
    popular: false,
    features: [
      'Any presentation type',
      'Animation included where it adds clarity',
      'Ideal for one-off decks and urgent revamps',
    ],
    note: 'Note: Turnaround varies by complexity and content readiness.',
    cta: 'Start a Project',
  },
  {
    id: 'monthly_retainer',
    name: 'MONTHLY RETAINER',
    price: '$999',
    unit: '/ MONTHLY',
    popular: true,
    features: [
      'Priority support for recurring requests',
      'Built for agencies, founders, and internal teams',
      'Consistent design language across every deck',
    ],
    note: 'Note: Up to 100 slide credits per month. Unused credits do not roll over.',
    cta: 'Book Strategy Call',
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
    <section id="pricing" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="text-center mb-16">
          <p className="text-sm uppercase tracking-widest text-[#2A7AFE] font-medium mb-3">
            Investment
          </p>
          <h2 className="text-4xl sm:text-5xl font-semibold text-foreground mb-4">
            Clean paths to partnership.
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            High-value production without the agency bloat. Transparent pricing for high-stakes presentations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {pricingPlans.map((plan) => {
            // Highlighted card = always white (pops on any background)
            // Non-highlighted = dark in light theme, transparent dark in dark theme
            const isHighlighted = plan.popular;
            const isLight = isHighlighted;   // popular is always the light/white card
            return (
              <div
                key={plan.id}
                data-testid={`pricing-card-${plan.id}`}
                className={`relative rounded-3xl p-10 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl flex flex-col ${
                  isLight
                    ? 'bg-white text-gray-900 border border-gray-200 hover:shadow-blue-300/30'
                    : theme === 'dark'
                    ? 'bg-white/[0.03] text-white border border-white/10 hover:shadow-white/10'
                    : 'bg-[#0a0a0a] text-white border border-white/10 hover:shadow-gray-700/40'
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-6 right-6 bg-[#2A7AFE] text-white text-xs font-semibold px-4 py-1.5 rounded-full">
                    MOST POPULAR
                  </div>
                )}

                <div className="mb-8">
                  <p className={`text-sm font-semibold tracking-widest mb-6 ${
                    isLight ? 'text-gray-600' : 'text-white/70'
                  }`}>
                    {plan.name}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-7xl font-semibold ${
                      isHighlighted ? 'text-[#2A7AFE]' : isLight ? 'text-gray-900' : 'text-white'
                    }`}>
                      {plan.price}
                    </span>
                    <span className={`text-sm ${isLight ? 'text-gray-500' : 'text-white/50'}`}>
                      {plan.unit}
                    </span>
                  </div>
                </div>

                <ul className="space-y-5 mb-10 flex-grow">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
                        isLight ? 'bg-gray-100' : 'bg-white/10'
                      }`}>
                        <Check className="w-3 h-3 text-[#2A7AFE]" strokeWidth={3} />
                      </div>
                      <span className={`text-base ${isLight ? 'text-gray-700' : 'text-white/85'}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <p className={`text-xs italic mb-6 ${isLight ? 'text-gray-400' : 'text-white/40'}`}>
                  {plan.note}
                </p>

                <button
                  data-testid={`pricing-cta-${plan.id}`}
                  onClick={() => handleSelectPlan(plan.id)}
                  className={`w-full py-5 px-6 rounded-2xl font-semibold text-base uppercase tracking-wide flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02] ${
                    plan.popular
                      ? 'bg-[#2A7AFE] text-white hover:bg-[#3B82F6] hover:shadow-xl hover:shadow-[#2A7AFE]/40'
                      : isLight
                      ? 'bg-gray-900 text-white hover:bg-black'
                      : theme === 'dark'
                      ? 'bg-white text-gray-900 hover:bg-gray-100'
                      : 'bg-white text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {plan.cta}
                  <ArrowUpRight className="w-5 h-5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <OnboardingWizard
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        initialPlan={selectedPlan}
      />
    </section>
  );
};

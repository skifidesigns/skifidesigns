import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Layers, Sparkles, ArrowUpRight, Lock } from 'lucide-react';
import { Header } from './Header';
import { Footer } from './Footer';
import { FloatingContact } from './FloatingContact';

const TOOLS = [
  {
    id: 'deck-review',
    href: '/ai-lab/deck-review',
    label: 'AI Pitch Deck Review',
    tagline: 'Investor-grade scorecard in 60 seconds',
    description:
      "Upload your PDF deck. Get an overall score, an investor-readiness verdict, scores across 8 dimensions, and the top 3 things to fix.",
    icon: FileText,
    cta: 'Review my deck',
    active: true,
  },
  {
    id: 'template-generator',
    href: '/ai-lab/template-generator',
    label: 'Logo → Branded Template',
    tagline: 'Co-brand-ready 5-slide .pptx',
    description:
      "Drop one logo (or two for co-branded decks). We extract your brand palette, let you tweak any color, and ship a 5-slide editable PowerPoint.",
    icon: Layers,
    cta: 'Generate my template',
    active: true,
  },
  {
    id: 'slide-content',
    href: '#',
    label: 'Slide Content Generator',
    tagline: 'From idea to outline',
    description: 'Type your business idea - get a slide-by-slide content outline that turns into a deck.',
    icon: Sparkles,
    cta: 'Coming soon',
    active: false,
  },
];

const ToolCard = ({ tool }) => {
  const Icon = tool.icon;
  const inner = (
    <div
      className={`group relative h-full bg-card border border-border rounded-2xl p-6 sm:p-8 transition-all ${
        tool.active ? 'hover:border-[#2A7AFE] hover:shadow-lg hover:shadow-blue-500/5 hover:-translate-y-0.5' : 'opacity-70'
      }`}
      data-testid={`ai-lab-tool-${tool.id}`}
    >
      <div className="flex items-start justify-between mb-6">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            tool.active ? 'bg-[#2A7AFE]/10 text-[#2A7AFE]' : 'bg-muted text-muted-foreground'
          }`}
        >
          <Icon className="w-6 h-6" strokeWidth={2.2} />
        </div>
        {tool.active ? (
          <span className="text-[10px] font-semibold uppercase tracking-widest text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full">
            Free
          </span>
        ) : (
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground bg-muted px-2.5 py-1 rounded-full flex items-center gap-1">
            <Lock className="w-2.5 h-2.5" />
            Coming soon
          </span>
        )}
      </div>
      <div className="text-[11px] font-semibold tracking-widest uppercase text-[#2A7AFE] mb-1.5">{tool.tagline}</div>
      <h3 className="font-display text-[24px] sm:text-[28px] font-semibold leading-tight tracking-tight text-foreground mb-3">
        {tool.label}
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed mb-6">{tool.description}</p>
      <div
        className={`inline-flex items-center gap-1.5 text-sm font-semibold ${
          tool.active ? 'text-[#2A7AFE] group-hover:gap-2 transition-all' : 'text-muted-foreground'
        }`}
      >
        {tool.cta}
        {tool.active && <ArrowUpRight className="w-4 h-4" />}
      </div>
    </div>
  );
  return tool.active ? (
    <Link to={tool.href} className="block h-full">{inner}</Link>
  ) : (
    <div className="block h-full cursor-not-allowed">{inner}</div>
  );
};

export const AILabLanding = () => (
  <div className="min-h-screen bg-background">
    <Header />
    <main className="pt-32 sm:pt-36 pb-24 px-4 sm:px-6 lg:px-12">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12 sm:mb-16 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#2A7AFE]/10 text-[#2A7AFE] text-xs font-semibold tracking-wider uppercase mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            AI Lab &middot; Free for founders
          </div>
          <h1 className="font-display text-[40px] sm:text-[56px] lg:text-[64px] font-semibold leading-[1.05] tracking-tight text-foreground mb-5">
            Free AI tools for founders.
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl">
            Built by a studio that's shipped 2,700+ investor decks. Use them, ship a better deck, and when you want the human-quality version &mdash; you know where to find us.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {TOOLS.map((t) => <ToolCard key={t.id} tool={t} />)}
        </div>
      </div>
    </main>
    <Footer />
    <FloatingContact />
  </div>
);

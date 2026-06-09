/**
 * Comparison / "alternatives" landing pages.
 *
 * Targets keyword pattern: "[competitor] alternative" / "[competitor] vs SkiFi".
 * Users searching these terms are HOT - already shopping. The page should
 * (1) honestly describe the competitor (no trashing), (2) name the gaps,
 * (3) position SkiFi as the human-quality alternative, (4) provide a clear
 * pricing anchor + CTA.
 */
export const ALTERNATIVES = {
  'gamma-ai': {
    slug: 'gamma-ai',
    competitor: 'Gamma',
    competitorFull: 'Gamma AI',
    title: 'Gamma AI Alternative',
    h1: 'Looking for a Gamma AI Alternative? Try a Designer, Not Another Bot.',
    metaTitle: 'Gamma AI Alternative | Human-Designed Decks That Actually Close | SkiFi',
    metaDescription: 'Gamma AI is great for first drafts. SkiFi turns those drafts into investor-ready decks. $150M+ raised by SkiFi clients. Redesign Gamma exports from $15/slide.',
    keyword: 'gamma ai alternative',
    eyebrow: 'Gamma AI vs SkiFi Designs',
    subhead: 'Gamma is fantastic for getting from blank page to first draft in 5 minutes. But "first draft" and "deck I am about to show an investor" are different documents. SkiFi takes your Gamma export and turns it into something a human designer would be proud of.',
    intro: 'Gamma AI generates slides instantly. The output looks fine in a Notion-style canvas, but the moment you try to use it in a real investor meeting, three things show up: cookie-cutter layouts, generic icon usage, and animation that screams "AI". We solve all three.',
    competitorStrengths: [
      'Fast first drafts (literally seconds)',
      'Good for internal docs and quick share-outs',
      'Built-in AI rewriting and tone tuning',
      'Free tier covers most casual users',
    ],
    competitorGaps: [
      {
        gap: 'Generic, template-y layouts',
        fix: 'Every SkiFi slide is custom-designed for your content. No two are alike, and the visual hierarchy is built by a designer who has shipped 2,700+ decks.',
      },
      {
        gap: 'AI-detectable iconography and stock visuals',
        fix: 'We use custom illustration, real brand photography, and icon systems built specifically for your brand - not the same Heroicons set every Gamma deck ships with.',
      },
      {
        gap: 'No real animation - just slide transitions',
        fix: 'We add subtle, premium motion: title builds, data reveals, section transitions. Motion that elevates the story without distracting from it.',
      },
      {
        gap: 'No narrative strategy - just AI-generated content',
        fix: 'On Premium tier, we workshop the story with you: problem framing, solution arc, traction proof, and the close. The story becomes yours, not ChatGPT\'s.',
      },
      {
        gap: 'Export to PowerPoint breaks formatting',
        fix: 'Our deliverable IS PowerPoint. Native .pptx with master slides, theme colours, editable shapes - so your team can update slides forever without it breaking.',
      },
    ],
    whoFor: [
      'Founders who used Gamma for the first draft and need to turn it into an investor deck',
      'Anyone whose Gamma-generated slides keep getting "needs polish" feedback',
      'Teams that love Gamma\'s speed but need brand-locked output',
      'Operators tired of every AI deck looking the same',
    ],
    pricingHook: {
      starter: 'Redesign your Gamma export at',
      starterPrice: '$15 / slide',
      premium: 'Or rebuild it from scratch',
      premiumPrice: '$1,500 - $2,500',
      callout: 'Most founders pick redesign: keep your AI-generated content, swap the AI design for human craft.',
    },
    faqs: [
      {
        q: 'Can I just upload my Gamma file directly?',
        a: 'Yes. Send us your Gamma export (.pptx or PDF) and we redesign it slide-by-slide. Most clients export from Gamma, send it our way, and have a polished deck back in 5-7 business days.',
      },
      {
        q: 'Do I keep the content Gamma generated?',
        a: 'Absolutely. Redesign preserves your content - we only change the visual design and animation. If you want help refining the content too, the Premium Deck tier ($2,500) includes full narrative strategy.',
      },
      {
        q: 'Why not just keep using Gamma if it works?',
        a: 'Honestly, for internal docs and quick draft work, you should. Use Gamma to find your structure. Then bring it to SkiFi when the stakes go up: a real investor pitch, a Series A deck, a board meeting, a procurement deck.',
      },
      {
        q: 'How much does this cost?',
        a: 'Slide-by-slide redesign starts at $15/slide. A typical 20-slide Gamma deck redesigned by SkiFi costs $300. If you want a full ground-up rebuild (custom narrative + design), Starter is $1,500 and Premium is $2,500.',
      },
    ],
    relatedAlternatives: ['canva-presentations', 'beautiful-ai'],
    ctaPrimary: 'Redesign My Gamma Deck',
    ctaSecondary: 'See Before & After',
  },

  'canva-presentations': {
    slug: 'canva-presentations',
    competitor: 'Canva',
    competitorFull: 'Canva Presentations',
    title: 'Canva Presentation Alternative',
    h1: 'Outgrown Canva Presentations? Get a Real Designer.',
    metaTitle: 'Canva Presentation Alternative | Investor-Grade Deck Design | SkiFi',
    metaDescription: 'Canva works for simple decks. When you need investor-ready, brand-locked presentations with proper PowerPoint masters, SkiFi takes over. Starts at $1,500.',
    keyword: 'canva presentation alternative',
    eyebrow: 'Canva vs SkiFi Designs',
    subhead: 'Canva is the right tool for a wedding invite, a quick LinkedIn carousel, or a one-off team meeting deck. When the meeting is with an investor, a procurement committee, or the entire C-suite - the limits show up fast.',
    intro: 'You bought Canva Pro thinking it would cover all your deck needs. Three months in, the decks look "almost good but not quite". Reused templates, low-resolution exports, fonts that break on someone else\'s machine, and no master-slide architecture. Here is when to graduate.',
    competitorStrengths: [
      'Cheap and easy for non-designers',
      'Decent template library for marketing assets',
      'Great for social media graphics, posters, one-pagers',
      'Browser-based - no install needed',
    ],
    competitorGaps: [
      {
        gap: 'Templates everyone else also uses',
        fix: 'Custom layouts designed specifically for your brand and story. No "I have seen this slide on 40 other decks" feeling.',
      },
      {
        gap: 'No proper master slides or theme system',
        fix: 'Real .pptx output with Slide Master, theme colours, theme fonts, and chart styles. Edit your brand colour once - the whole deck updates.',
      },
      {
        gap: 'Animations are limited and often break on export',
        fix: 'Native PowerPoint animation that works in PowerPoint, Keynote, Google Slides, and standalone PDF export.',
      },
      {
        gap: 'Brand kit features still limited for design systems',
        fix: 'Full slide system built around your brand: logo lockups, palette tokens, type ramp, icon style, data viz palette. A proper, reusable asset.',
      },
      {
        gap: 'Export quality drops for print and large screens',
        fix: 'Vector-perfect .pptx, PDF, and Keynote exports. Looks crisp on a 4K monitor, on a projector, and in print.',
      },
    ],
    whoFor: [
      'Teams that started on Canva and have outgrown it',
      'Founders raising real capital who need investor-grade quality',
      'Marketing teams rolling out a brand refresh that Canva cannot support',
      'Anyone who has heard "the deck does not feel premium enough"',
    ],
    pricingHook: {
      starter: 'Custom deck from scratch',
      starterPrice: '$1,500',
      premium: 'Or unlimited revisions + speaker notes',
      premiumPrice: '$2,500',
      callout: 'Redesign your Canva deck at $15/slide if the content is solid.',
    },
    faqs: [
      {
        q: 'Can you take my Canva file and improve it?',
        a: 'Yes. Export to .pptx or PDF from Canva and send it our way. We will redesign slide-by-slide at $15/slide, preserving your content and elevating the design.',
      },
      {
        q: 'Will my team still be able to edit the deck after?',
        a: 'Yes - we deliver fully editable .pptx with proper master slides and theme colours. Your team can update text, swap images, and add new slides using the system we built.',
      },
      {
        q: 'When should I stay on Canva vs use SkiFi?',
        a: 'Stay on Canva for: internal slides, social posts, simple one-pagers. Move to SkiFi for: investor pitch decks, sales decks shown to enterprise prospects, board updates, brand-system rollouts.',
      },
      {
        q: 'How does the pricing compare?',
        a: 'Canva Pro is $13/month. SkiFi is a one-time $1,500-$2,500 for a custom deck or $15/slide for redesign. You will keep using Canva for marketing assets; SkiFi handles the high-stakes presentations.',
      },
    ],
    relatedAlternatives: ['gamma-ai', 'beautiful-ai'],
    ctaPrimary: 'Get a Custom Deck',
    ctaSecondary: 'See Before & After',
  },

  'beautiful-ai': {
    slug: 'beautiful-ai',
    competitor: 'Beautiful.AI',
    competitorFull: 'Beautiful.AI',
    title: 'Beautiful.AI Alternative',
    h1: 'Beautiful.AI Alternative: When Smart Templates Are Not Enough.',
    metaTitle: 'Beautiful.AI Alternative | Custom Pitch Deck Design | SkiFi Designs',
    metaDescription: 'Beautiful.AI auto-arranges slides but still feels template-y. SkiFi delivers custom human-designed investor decks. $150M+ raised by clients. From $1,500.',
    keyword: 'beautiful ai alternative',
    eyebrow: 'Beautiful.AI vs SkiFi Designs',
    subhead: 'Beautiful.AI is a smart slide-builder with auto-arranging layouts. It works great for in-house product decks. For investor meetings and big sales pitches, "auto-arranged" still reads as "template" - and investors notice.',
    intro: 'Beautiful.AI does one thing really well: stops you from making ugly slides. The DesignerBot keeps everything aligned, the colours stay on brand, and you can ship a deck in an afternoon. The flip side: every Beautiful.AI deck has a "look". And the audiences who matter most can tell.',
    competitorStrengths: [
      'Smart auto-arrange and design rules',
      'Team brand-lock features',
      'Decent for internal decks and product overviews',
      'Faster than hiring a designer for low-stakes work',
    ],
    competitorGaps: [
      {
        gap: 'Auto-arrangement = same look across users',
        fix: 'Custom-designed layouts per slide. We do not snap your content to a grid - we design the grid to fit your content.',
      },
      {
        gap: 'Limited typography control',
        fix: 'Full type system: custom heading + body pairings, weight ramps, kerning fixes, and proper hierarchy across all slides.',
      },
      {
        gap: 'Data viz still feels generic',
        fix: 'Hand-designed TAM/SAM/SOM diagrams, traction graphs, retention curves, and unit-economics waterfalls - investor-grade, not auto-generated.',
      },
      {
        gap: 'Locked into the Beautiful.AI ecosystem',
        fix: 'You get a native .pptx file you own forever. Edit in PowerPoint, Keynote, Google Slides - your call, no subscription required.',
      },
    ],
    whoFor: [
      'Founders preparing for Series A/B/C investor meetings',
      'Sales teams who need decks that close enterprise deals',
      'Brands ready to graduate from smart-template tools to a real design partner',
      'Anyone whose Beautiful.AI decks look "fine" but never wow',
    ],
    pricingHook: {
      starter: 'Custom deck from scratch',
      starterPrice: '$1,500',
      premium: 'Premium investor-grade deck',
      premiumPrice: '$2,500',
      callout: 'Slide-by-slide redesign of your Beautiful.AI export at $15/slide.',
    },
    faqs: [
      {
        q: 'Can I export from Beautiful.AI and have you redesign it?',
        a: 'Yes. Export as .pptx or PDF and we redesign slide-by-slide at $15/slide. Most decks ship back in 5-7 business days.',
      },
      {
        q: 'When should I stay on Beautiful.AI?',
        a: 'For internal product reviews, quarterly business updates, weekly team decks, and anywhere "good enough" really is good enough. Move to SkiFi when the audience is external and high-stakes.',
      },
      {
        q: 'Why human design over AI design for pitch decks?',
        a: 'Because the people you are pitching to (VCs, enterprise buyers, board members) have seen thousands of AI decks. A human-designed deck signals you take the meeting seriously. None of our 150+ clients has had an investor say "your deck looks too polished".',
      },
      {
        q: 'How does the pricing compare?',
        a: 'Beautiful.AI is $12-40/user/month. SkiFi is a one-time investment: $1,500-$2,500 for a custom deck, $15/slide for redesign. Most clients keep Beautiful.AI for internal decks and bring SkiFi in for the high-stakes ones.',
      },
    ],
    relatedAlternatives: ['gamma-ai', 'canva-presentations'],
    ctaPrimary: 'Get a Custom Deck',
    ctaSecondary: 'See Examples',
  },
};

export const ALTERNATIVE_SLUGS = Object.keys(ALTERNATIVES);

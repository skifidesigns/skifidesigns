/**
 * Service landing pages — content config.
 *
 * Each entry powers one /services/:slug page targeting a proven-converting
 * keyword (data sourced from Fiverr-conversion table). Keep copy E-E-A-T
 * heavy: real numbers, real outcomes, named verticals.
 *
 * NOTE: when adding a new service, also:
 *   1. Add the slug to backend/server.py dynamic_sitemap (or it won't be crawled)
 *   2. Internal-link to it from at least one place on the homepage
 */

const COMMON_FAQS_FOOTER = [
  {
    q: 'How much does it cost?',
    a: 'Three fixed-price tiers: Starter Deck $1,500 (up to 20 slides), Premium Deck $2,500 (up to 40 slides with unlimited revisions), Monthly Retainer $3,000/month (100 credits). For existing content we redesign at $15 per slide.',
  },
  {
    q: 'How fast is the turnaround?',
    a: 'Starter projects ship in 5-7 business days. Premium in 3-5 business days. Retainer clients get 48-hour priority turnaround.',
  },
  {
    q: 'Will it match our brand?',
    a: 'Yes. We start with your brand guidelines, logo, palette, and tone. If you do not have a guideline yet, we build a slide-level brand system in week one.',
  },
];

export const SERVICES = {
  'powerpoint-design': {
    slug: 'powerpoint-design',
    title: 'PowerPoint Design',
    h1: 'PowerPoint Design Services That Look Built by a Designer (Because They Are).',
    metaTitle: 'PowerPoint Design Services | Investor & Corporate Decks | SkiFi Designs',
    metaDescription: 'Premium PowerPoint design service for founders, agencies and enterprise teams. $150M+ raised by clients using SkiFi-designed decks. Starts at $15/slide.',
    keyword: 'powerpoint design',
    eyebrow: 'PowerPoint Design Service',
    subhead: 'We design, redesign and refresh PowerPoint presentations for investor pitches, sales decks, board updates and corporate brand systems. Real designers, no templates, no AI fluff.',
    statBar: ['$150M+ raised by founders', '2,700+ decks shipped', '150+ clients', '30+ countries'],
    valueProps: [
      { title: 'Story before slides', body: 'Every project starts with the narrative. We sharpen your messaging, structure the flow, and only then design.' },
      { title: 'Editable .pptx files', body: 'You get the source file, fully editable in PowerPoint - not flattened PDFs, not export-locked Figma boards.' },
      { title: 'Real motion, not WordArt', body: 'Subtle animation on title reveals, build-ins on data, and transitions that elevate without distracting.' },
      { title: 'Brand consistent', body: 'Title slides, content layouts, data viz and section dividers all share one design language across hundreds of slides.' },
    ],
    whoFor: [
      'Founders preparing investor pitch decks for fundraising',
      'Sales teams needing high-converting product or pricing decks',
      'Agencies and consultancies pitching new business',
      'Enterprise marketing teams rolling out brand-aligned slide systems',
    ],
    deliverables: [
      'Custom-designed .pptx (editable PowerPoint file)',
      'PDF export for sharing',
      'Optional Keynote export (Premium tier)',
      'Speaker notes (Premium tier)',
      'Source assets and master template',
    ],
    pricingHook: {
      starter: 'Starter Deck',
      starterDesc: 'Up to 20 slides',
      starterPrice: '$1,500',
      premium: 'Premium Deck',
      premiumDesc: 'Up to 40 slides, unlimited revisions',
      premiumPrice: '$2,500',
      perSlide: 'Slide-by-slide redesign for existing decks',
      perSlidePrice: '$15 / slide',
    },
    faqs: [
      {
        q: 'Can you work in PowerPoint, or do you only deliver PDF exports?',
        a: 'PowerPoint is our home file. You receive a fully editable .pptx with proper master slides, layouts, colour themes and font definitions. Edit anything later without breaking the design.',
      },
      {
        q: 'Do you use animation? My team finds animation distracting.',
        a: 'We use animation surgically: title builds, sequential reveals on data slides, and smooth section transitions. No spinning logos. No flying bullet points. If you want zero animation, we deliver zero animation - your call.',
      },
      {
        q: 'Can you redesign an existing PowerPoint?',
        a: 'Yes. Slide-by-slide redesign starts at $15 per slide. Send us your existing .pptx, AI-generated draft, or scattered slides and we make each one beautiful with custom motion and brand polish.',
      },
      ...COMMON_FAQS_FOOTER,
    ],
    relatedServices: ['pitch-deck-design', 'powerpoint-redesign', 'investor-pitch-deck-design'],
    ctaPrimary: 'Get a Quote in 24 Hours',
    ctaSecondary: 'See Live Examples',
  },

  'pitch-deck-design': {
    slug: 'pitch-deck-design',
    title: 'Pitch Deck Design',
    h1: 'Pitch Deck Design That Raises Real Money. Not Just Compliments.',
    metaTitle: 'Pitch Deck Design Agency | $150M+ Raised by Clients | SkiFi Designs',
    metaDescription: 'Pitch deck design service trusted by 150+ founders to raise capital. Starter $1,500. Premium $2,500. Series A/B/C pitch decks built around your numbers and narrative.',
    keyword: 'pitch deck design',
    eyebrow: 'Pitch Deck Design Service',
    subhead: 'Investor pitch decks designed around your numbers and your narrative. We work with founders from pre-seed to Series C - the same playbook that helped clients raise $150M+.',
    statBar: ['$150M+ raised by clients', 'Pre-seed to Series C', '150+ founders served', '30+ countries'],
    valueProps: [
      { title: 'Narrative first', body: 'Investors swipe through 100 decks a week. We structure yours so the "why this, why now, why you" lands in the first 90 seconds.' },
      { title: 'Real data viz', body: 'TAM/SAM/SOM charts, traction graphs, unit economics — designed properly, not faked with random colours and gradients.' },
      { title: 'Series-stage savvy', body: 'A pre-seed deck and a Series B deck are completely different documents. We know the difference and design accordingly.' },
      { title: 'Speaker notes (Premium)', body: 'For live pitches we write your slide-by-slide talk track so you sound prepared without sounding scripted.' },
    ],
    whoFor: [
      'Pre-seed and seed founders raising their first round',
      'Series A/B/C founders refreshing the deck for the next raise',
      'Founders who hate their AI-generated or template-built deck',
      'Climate, SaaS, fintech, healthtech, edtech, DTC, deeptech, and frontier-tech startups',
    ],
    deliverables: [
      'Custom-designed pitch deck in PowerPoint and PDF',
      'Investor-grade data visualisations',
      'Title slide, problem, solution, market, traction, business model, team, ask',
      'Optional Keynote and Google Slides exports',
      'Speaker notes for live pitches (Premium tier)',
    ],
    pricingHook: {
      starter: 'Starter Pitch Deck',
      starterDesc: 'Up to 20 slides, 2 rounds of revisions',
      starterPrice: '$1,500',
      premium: 'Premium Pitch Deck',
      premiumDesc: 'Up to 40 slides, unlimited revisions, speaker notes',
      premiumPrice: '$2,500',
      perSlide: 'Investor-ready redesign of your existing deck',
      perSlidePrice: '$15 / slide',
    },
    faqs: [
      {
        q: 'How many slides should a pitch deck have?',
        a: 'For most early-stage rounds: 10-15 slides for an emailed deck, 20-25 for an in-room presentation. Series B and beyond often need 30+ to cover unit economics, expansion plans and team depth. We help right-size the deck for your audience.',
      },
      {
        q: 'Do you write content, or just design?',
        a: 'Both. Premium tier includes full narrative and content strategy: we workshop your story, sharpen the messaging, and write the slide copy and speaker notes. Starter tier focuses on design with light copy editing.',
      },
      {
        q: 'Will VCs know it was professionally designed?',
        a: 'Yes - and that is a feature, not a bug. A well-designed deck signals that you take the round seriously and respect the investor\'s time. None of our 150+ clients has ever had a meeting cancelled because the deck "looked too polished".',
      },
      ...COMMON_FAQS_FOOTER,
    ],
    relatedServices: ['investor-pitch-deck-design', 'powerpoint-redesign', 'powerpoint-design'],
    ctaPrimary: 'Start My Pitch Deck',
    ctaSecondary: 'See Funded Decks',
  },

  'powerpoint-redesign': {
    slug: 'powerpoint-redesign',
    title: 'PowerPoint Redesign',
    h1: 'PowerPoint Redesign at $15 per Slide. Bring the Content, We Bring the Craft.',
    metaTitle: 'PowerPoint Redesign Service | $15 per Slide | SkiFi Designs',
    metaDescription: 'Already have a deck? We redesign existing or AI-generated PowerPoint presentations at $15 per slide with custom animation, brand polish, and storytelling rhythm.',
    keyword: 'powerpoint redesign',
    eyebrow: 'PowerPoint Redesign Service',
    subhead: 'You already have the content. You already have the slides. They are just not... beautiful. Send us your draft, AI-generated outline or scattered legacy deck and we make every slide investor-ready at $15 per slide.',
    statBar: ['$15 per slide', 'Custom animation included', 'No minimum order', 'Avg. delivery 5-7 days'],
    valueProps: [
      { title: 'Slide-by-slide pricing', body: 'Pay for exactly what you need. 12 slides? $180. 40 slides? $600. No retainer, no surprises.' },
      { title: 'Custom motion', body: 'Every redesigned slide gets thoughtful animation built in. Builds, reveals, transitions - subtle, premium, never gimmicky.' },
      { title: 'Brand match', body: 'We match (or build) your brand: logo, palette, font system, icon style. Continuity across every slide.' },
      { title: 'AI-generated drafts welcome', body: 'Bring your ChatGPT, Gamma, or Beautiful.AI export. We do the design work AI cannot: storytelling rhythm, layout craft, polish.' },
    ],
    whoFor: [
      'Founders with a rough deck that "almost" works but does not',
      'Operators who built a draft in Gamma, ChatGPT or Pitch and want it humanised',
      'Sales teams with a legacy template that needs a refresh',
      'Anyone with great content trapped in ugly slides',
    ],
    deliverables: [
      'Redesigned .pptx with custom animation per slide',
      'PDF export',
      'Original content preserved (we redesign, we do not rewrite)',
      '2 rounds of revisions',
      'Source assets and editable shapes',
    ],
    pricingHook: {
      starter: 'Small redesign',
      starterDesc: '1-15 slides',
      starterPrice: 'From $15 / slide',
      premium: 'Full deck redesign',
      premiumDesc: '16-40 slides',
      premiumPrice: '$15 / slide',
      perSlide: 'Want a full custom build instead? Starter Deck',
      perSlidePrice: '$1,500',
    },
    faqs: [
      {
        q: 'What is the difference between redesign and a custom Starter Deck?',
        a: 'Redesign preserves your content and reshapes only the visuals/animation. Starter Deck is a full ground-up build: we structure the narrative, write slide copy, design from scratch. Pick redesign if your content is solid. Pick Starter Deck if you want help with both.',
      },
      {
        q: 'Will you fix my content too?',
        a: 'We do light copy editing for free (typos, awkward phrasing). For deeper narrative work, the Premium Deck tier includes full content strategy. If you want pure design and the content is fine, redesign is the cheapest path.',
      },
      {
        q: 'What format should I send my draft in?',
        a: 'Anything works: .pptx, .key, .pdf, Google Slides link, Gamma export, ChatGPT outline, even a Notion doc. We figure it out.',
      },
      ...COMMON_FAQS_FOOTER,
    ],
    relatedServices: ['powerpoint-design', 'pitch-deck-design', 'investor-pitch-deck-design'],
    ctaPrimary: 'Redesign My Slides',
    ctaSecondary: 'See Before & After',
  },

  'investor-pitch-deck-design': {
    slug: 'investor-pitch-deck-design',
    title: 'Investor Pitch Deck Design',
    h1: 'Investor Pitch Deck Design for Founders Who Are Actually Raising.',
    metaTitle: 'Investor Pitch Deck Design Agency | Seed to Series C | SkiFi Designs',
    metaDescription: 'Investor pitch deck design agency for seed, Series A, B and C founders. $150M+ raised by clients. Premium decks from $2,500, redesign from $15/slide.',
    keyword: 'investor pitch deck',
    eyebrow: 'Investor Pitch Deck Design',
    subhead: 'Investors read decks in 2 minutes 47 seconds on average. We make sure yours wins that window with crisp narrative, real data design and zero AI-shaped slop.',
    statBar: ['$150M+ raised by clients', 'Seed to Series C', '~3 min: avg investor read time', '150+ founders served'],
    valueProps: [
      { title: 'Built for the investor inbox', body: 'Optimised for the silent-read flow: clear hierarchy, scannable headlines, and the killer slide that earns you a meeting.' },
      { title: 'Stage-specific playbooks', body: 'A pre-seed "vision deck" is not the same as a Series B "execution deck". We design the right document for where you are right now.' },
      { title: 'Cap table & traction visuals', body: 'Cohort curves, retention waterfalls, unit economics, market sizing - designed by people who have built these charts hundreds of times.' },
      { title: 'Investor-tested templates', body: 'Our underlying frameworks come from decks that actually closed rounds at Sequoia, Accel, a16z, Lightspeed, and tier-1 angels.' },
    ],
    whoFor: [
      'Pre-seed to Series C founders actively fundraising',
      'Founders who got soft feedback like "good story, deck needs work"',
      'Repeat founders refreshing a deck for the next raise',
      'Industries: SaaS, fintech, climate, healthtech, edtech, deeptech, DTC, AI/ML',
    ],
    deliverables: [
      '12-25 slide investor deck (.pptx + PDF)',
      'Custom data visualisations (TAM, traction, unit economics)',
      'Optional Keynote and Google Slides exports',
      'Speaker notes for live pitches (Premium tier)',
      'Optional 1-page exec summary or teaser slide',
    ],
    pricingHook: {
      starter: 'Starter Investor Deck',
      starterDesc: 'Up to 20 slides, perfect for pre-seed/seed',
      starterPrice: '$1,500',
      premium: 'Premium Investor Deck',
      premiumDesc: 'Up to 40 slides, unlimited revisions, speaker notes, ideal for Series A/B/C',
      premiumPrice: '$2,500',
      perSlide: 'Already have a deck? Redesign at',
      perSlidePrice: '$15 / slide',
    },
    faqs: [
      {
        q: 'Have your decks actually raised money?',
        a: 'Yes - $150M+ raised in total across our client base, from sub-$500K pre-seed rounds to multi-million Series C tranches. We do not disclose individual rounds for confidentiality, but we will walk you through anonymised case studies on a call.',
      },
      {
        q: 'Do you sign NDAs?',
        a: 'Absolutely. We sign mutual NDAs before any sensitive material is shared. Most founders just send the deck and trust the process - we have a clean reputation in the founder community.',
      },
      {
        q: 'Can you help me decide which slides to include?',
        a: 'Yes. On Premium we run a 60-minute narrative session to map your slide order: problem, solution, market, traction, business model, GTM, team, ask. We follow proven structures (Sequoia, YC, NFX) and adapt them to your stage.',
      },
      ...COMMON_FAQS_FOOTER,
    ],
    relatedServices: ['pitch-deck-design', 'powerpoint-design', 'powerpoint-redesign'],
    ctaPrimary: 'Build My Investor Deck',
    ctaSecondary: 'See Funded Examples',
  },
};

export const SERVICE_SLUGS = Object.keys(SERVICES);

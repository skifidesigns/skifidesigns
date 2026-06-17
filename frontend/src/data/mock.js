// Note: portfolioProjects removed - homepage now uses /api/case-studies
// (managed via /admin -> Case Studies tab)

export const services = [
  {
    id: 1,
    title: "Pitch Deck Design",
    description: "Investor-ready pitch decks designed to help startups raise funding and tell compelling stories.",
    icon: "presentation",
    slug: "pitch-deck-design",
  },
  {
    id: 2,
    title: "Corporate Presentations",
    description: "Modern business presentations for meetings, reports, conferences, and internal communications.",
    icon: "briefcase",
    slug: "powerpoint-design",
  },
  {
    id: 3,
    title: "Sales Decks",
    description: "High-converting sales presentations that help teams close deals faster.",
    icon: "trending-up",
    slug: "powerpoint-design",
  },
  {
    id: 4,
    title: "Webinar & Keynote Slides",
    description: "Visually engaging presentations for speakers, educators, and online events.",
    icon: "video",
    slug: "keynote-slides-design",
  },
  {
    id: 5,
    title: "Investor Pitch Decks",
    description: "Seed to Series C investor decks. $150M+ raised by SkiFi clients using these decks.",
    icon: "bar-chart",
    slug: "investor-pitch-deck-design",
  },
  {
    id: 6,
    title: "PowerPoint Redesign",
    description: "Bring an existing or AI-generated deck. We redesign every slide at $15/slide with custom animation.",
    icon: "layers",
    slug: "powerpoint-redesign",
  }
];

export const testimonials = [
  {
    id: 1,
    name: "Patrick Brane",
    role: "Director",
    company: "Underberg America",
    country: "United States",
    countryCode: "us",
    text: "Working with SkiFi has been a great experience. I genuinely consider them part of our team and look forward to working with them on each project. Highly recommend!",
    rating: 5
  },
  {
    id: 2,
    name: "Nadia Shaheen",
    role: "Founder",
    company: "",
    country: "Morocco",
    countryCode: "ma",
    text: "I looked for multiple people to help but this agency was first to respond, clear communication and professionalism. I would use them again 100% and it only took one revision to fix a couple of things. Super happy and took a big weight off me.",
    rating: 5
  },
  {
    id: 3,
    name: "Grace Bitag",
    role: "Founder",
    company: "Business Successor",
    country: "Switzerland",
    countryCode: "ch",
    text: "Transparent and professional collaboration. SkiFi kept me informed throughout the process and found the best possible solutions for us. A very positive experience, I would happily work with them again.",
    rating: 5
  },
  {
    id: 4,
    name: "Anna",
    role: "Founder",
    company: "BeFit4Health",
    country: "United States",
    countryCode: "us",
    text: "Exceeded my expectations. Extremely satisfied with the quality and the fast turnaround; everything arrived exactly as described and was professionally done. I'll be back!",
    rating: 5
  },
  {
    id: 5,
    name: "James",
    role: "Co-founder",
    company: "UniversityCity",
    country: "United States",
    countryCode: "us",
    text: "Does excellent work; understands the brand and keeps language and communication simple. We've done a number of different projects with the team and will continue to.",
    rating: 5
  },
  {
    id: 6,
    name: "Seren",
    role: "Founder",
    company: "",
    country: "Japan",
    countryCode: "jp",
    text: "It was great to work with SkiFi; they deeply understood our brand value and positioning to deliver a deck that really matched our company. Great design, smooth transitions, and timely delivery.",
    rating: 5
  }
];

export const processSteps = [
  {
    id: 1,
    step: "01",
    title: "Discovery",
    description: "We understand your goals, audience, and messaging."
  },
  {
    id: 2,
    step: "02",
    title: "Story Structure",
    description: "We organize your content into a clear, persuasive narrative."
  },
  {
    id: 3,
    step: "03",
    title: "Design & Visualization",
    description: "We craft premium slides with strong visual hierarchy and branding."
  },
  {
    id: 4,
    step: "04",
    title: "Delivery & Refinement",
    description: "We fine-tune every detail until the deck feels presentation-ready."
  }
];

export const faqs = [
  {
    id: 1,
    question: "How much does a full pitch deck cost?",
    answer: "Most investor pitch decks fall in the $1,499–$3,500 range depending on scope, number of slides, and turnaround time. The Starter Deck ($1,499) covers up to 20 slides; the Premium Deck ($2,499) covers up to 40 slides with unlimited revisions. Book a free call and we'll give you an exact quote within 24 hours."
  },
  {
    id: 2,
    question: "Do you offer rush delivery?",
    answer: "Yes. Rush delivery (48 hours) is available on Premium and Retainer plans. For Starter projects, rush delivery can be added for $200."
  },
  {
    id: 3,
    question: "Can I upgrade from a project to a retainer?",
    answer: "Absolutely. Many clients start with a single project and move to a retainer once they see the results. We'll credit your first project cost toward your first month."
  },
  {
    id: 4,
    question: "How fast is your turnaround?",
    answer: "Starter projects ship in 5–7 business days, Premium in 3–5 business days, and Retainer clients get 48-hour priority turnaround on standard slide work."
  },
  {
    id: 5,
    question: "Do you redesign existing presentations?",
    answer: "Yes. We can redesign old decks into modern, professional presentations - just upload the existing file during checkout and we'll take it from there."
  },
  {
    id: 6,
    question: "What tools do you use?",
    answer: "PowerPoint, Google Slides, Keynote, Figma, and Adobe Creative Suite. You'll receive your final deck in PowerPoint and PDF as standard (Keynote is included with Premium)."
  },
  {
    id: 7,
    question: "Can you help with storytelling and content?",
    answer: "Absolutely. We help structure narrative, sharpen messaging, and on the Premium tier we also write speaker notes for you."
  },
  {
    id: 8,
    question: "Do you work with startups?",
    answer: "Yes - startups and founders are one of our core focuses. We've shipped 2,700+ investor decks across 30 countries."
  }
];

export const trustedBrands = [
  { name: "IndiGo", src: "/logos/indigo.png" },
  { name: "Toyota", src: "/logos/toyota.png" },
  { name: "Salesforce", src: "/logos/salesforce.png" },
  { name: "Lenovo", src: "/logos/lenovo.png" },
  { name: "Saudi Vision 2030", src: "/logos/saudi-vision-2030.png" },
  { name: "LinkedIn", src: "/logos/linkedin.png" }
];

export const whySkiFi = [
  "Premium modern design aesthetics",
  "Fast turnaround without compromising quality",
  "Storytelling-first presentation approach",
  "Fully custom slide design",
  "Dedicated creative team",
  "Startup and investor-focused expertise",
  "Clean, on-brand communication",
  "High attention to detail"
];

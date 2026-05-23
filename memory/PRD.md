# SkiFi Designs — Landing Page + Onboarding

## Original Problem Statement
Build a premium landing page for SkiFi Designs (presentation design studio) with hero, social proof, services, portfolio, process, testimonials, founder, FAQ, and CTA. Subsequent iterations added: dark/light theme toggle, Nohemi/DM Sans typography, custom logo, animated client logos marquee, founder profile photo, "Available for New Projects" badge above hero, company address in footer, equal-height process cards, pricing section, client onboarding wizard, Stripe payment integration, floating WhatsApp + Call buttons.

## Stack
- Backend: FastAPI + MongoDB + emergentintegrations (Stripe Checkout)
- Frontend: React 19 + Tailwind + Shadcn UI + DM Sans / Nohemi SemiBold
- Hosting: Emergent platform (kubernetes)

## What's Implemented
- **Landing page sections**: Hero (with availability badge), Trusted-by marquee, Services, WhySkiFi, Portfolio (Behance), Process (equal height), Pricing, Testimonials, Founder (with real profile photo), FAQ, FinalCTA, Footer (SKIFI GROUP LLC address).
- **Theme system**: Dark/Light toggle persisted in localStorage. Logo swaps per theme.
- **Onboarding Wizard**: 4-step modal — plan → contact → project details → review.
- **Stripe Checkout**:
  - `POST /api/onboarding/create-checkout` — server-side pricing (per_slide $15 × n, monthly_retainer $999).
  - `GET /api/payments/status/{session_id}` — idempotent status polling.
  - `POST /api/webhook/stripe` — webhook handler.
  - MongoDB collection `payment_transactions` tracks each tx.
- **Floating contact**: WhatsApp ("Get a FREE Pitchdeck Review") + Call buttons → `+919746018630`.
- **Payment success route**: `/payment-success` polls status & confirms.

## Integrations
- Stripe via `emergentintegrations` (test key `sk_test_emergent` in `/app/backend/.env`).
- Cal.com: `https://cal.com/skifi/30min`
- Behance: `https://www.behance.net/skifidesigns`
- Fiverr: `https://www.fiverr.com/skifidesigns`

## Backlog / Next Tasks (P1)
- Real Stripe subscription mode for Monthly Retainer (currently one-time payment).
- Admin dashboard to view onboarding submissions & payment status.
- Email notifications (Resend / SendGrid) on successful payment.
- Lead-magnet form for "FREE Pitchdeck Review" (collect email + deck upload).
- SEO meta tags, OG image, sitemap.xml.

## Personas
- **Founder / Startup** — needs investor-ready pitch deck on tight timeline.
- **Agency / Consultant** — recurring deck production via monthly retainer.
- **Corporate Team** — polished internal/strategy decks.

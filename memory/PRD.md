# SkiFi Designs — Product Requirements

## Original problem statement
Premium landing page + lead-gen SaaS for **SkiFi Designs**, a presentation design agency. Includes:
- Marketing landing with dark/light themes, portfolio, pricing, FAQ
- Calendly integration for booking calls
- Multi-step onboarding wizard
- Stripe checkout (one-time per-slide @ $15 + monthly retainer subscription @ $999)
- Admin dashboard (orders + templates + blog)
- Resources page (free/paid templates with Google Auth gating)
- Resend transactional emails on payment success
- **NEW: Blog with admin CMS + dynamic SEO sitemap**

## Live URLs
- Production: https://skifidesigns.com (Emergent native deploy)
- Preview: https://presentation-studio-22.preview.emergentagent.com

## Architecture
```
/app
├── backend/
│   ├── server.py            # FastAPI, all /api routes (Stripe, blog, templates, admin, auth)
│   ├── email_service.py     # Resend
│   └── .env                 # MONGO_URL, STRIPE_API_KEY, RESEND_API_KEY, ADMIN_PASSWORD, ...
├── frontend/
│   ├── public/
│   │   ├── index.html       # SEO meta, OG, JSON-LD schemas
│   │   ├── robots.txt
│   │   ├── skifi-logo.svg
│   │   └── og-image.jpg
│   └── src/
│       ├── App.js           # Routes: /, /resources, /blog, /blog/:slug, /payment-success, /admin
│       ├── components/      # Hero, Pricing, Resources, Blog, BlogPost, AdminPanel, ...
│       └── index.css        # Tailwind + Nohemi font + prose-skifi markdown styles
└── memory/
    ├── PRD.md
    └── test_credentials.md
```

## Implementation Log

### 2026-06-01 (premium-branded PDF receipt v2)
- **Complete redesign** of the PDF receipt to match SkiFi's brand system: actual SkiFi logo image embedded, `Nohemi` (semibold) loaded for headings, `Outfit` for body via Google Fonts, dark navy hero with subtle blue radial glow, warm off-white #F5F4EE page background, green "Paid in full" pill, big blue total in tabular-numerics.
- **Full legal entity details** now shown in the "From" block and 3-column legal footer (Legal entity / Registered office / Contact):
  - **SKIFI GROUP LLC** — Wyoming LLC
  - **30 N Gould St Ste R, Sheridan, WY 82801**, United States
  - **EIN 98-1917005**
  - contact@skifidesigns.com · skifidesigns.com
- Assets bundled at `/app/backend/assets/` (logo PNG + Nohemi WOFF), base64-embedded so the PDF is fully self-contained (no external fetches at render time).
- Verified: single A4 page, ~35 KB PDF, all branding intact, AI visual review: "exceptionally well-designed, no layout/font fallback/overlap issues".

### 2026-06-01 (receipt download + PDF email attachment)
- **✨ Branded HTML receipt** for paid orders. Routes: `GET /api/me/orders/{session_id}/receipt` (user-scoped) and `GET /api/admin/orders/{session_id}/receipt` (admin). Both support `?format=pdf` for an inline PDF download. Itemises **$15 × N slides** (per_slide) or **$999 × 1 month** (monthly_retainer). Branded layout: SkiFi logo, invoice #, billed-to, line items, totals, Stripe transaction reference.
- **PDF rendering** via WeasyPrint (added to `requirements.txt`). Honours `@media print` so on-screen action buttons are hidden in the PDF. Verified: 1-page, ~18 KB, all branding + itemisation intact (pypdf text extraction confirmed).
- **Auto-attach PDF receipt to payment email**: `_maybe_send_emails` now generates the PDF and passes a base64-encoded copy through `send_payment_emails` → Resend `attachments` array. Best-effort: if PDF generation fails, email still goes out without the attachment, and a conditional "📎 PDF receipt attached" notice only renders when the file is actually attached.
- **Client dashboard** (`ClientDashboard.jsx`): "Download receipt (PDF)" link on every paid order card. Cookie auth.
- **Admin dashboard** (`AdminPanel.jsx`): Receipt icon button next to the Deliver action. Bearer auth → axios → blob URL → new tab.

### 2026-05-31 (Cal.com inline modal)
- **✨ Cal.com element-click embed** wired into all "Book a Call" CTAs (Header desktop+mobile, Hero, FinalCTA, Footer × 2). One-time init in `public/index.html` with brand color `#2A7AFE`. Clicking a CTA now opens an inline calendar modal instead of redirecting to `cal.com/skifi/30min`. `trackEvent('book_call_clicked')` analytics preserved.

### 2026-02-30 (bug fix + UX)
- **🐛 Fixed P0 template file upload bug**: `PATCH /api/admin/templates/{id}` allow-list was missing `template_file_id` (and `thumbnail_file_id`) → uploaded files silently dropped when editing a template. Added both to allowed update fields. Verified end-to-end via curl with real GridFS upload.
- **🐛 Fixed frontend endpoint mismatch**: `TemplateModal.jsx` was calling `/api/templates/{id}/checkout` (404). Renamed to `/access` to match backend. This unblocks free downloads + paid Stripe checkout from the modal.
- **✨ Quick-download icon on template cards** (`Resources.jsx`): hover-revealed download button next to share button. Calls `/access` directly — free → instant download, paid (not owned) → Stripe checkout, paid (owned) → re-download. Mirrors `TemplateModal` CTA logic and emits the same GA4 events.

### 2026-02 (current session — pre-launch polish & blog)
- Rotated live Stripe key + admin password
- Updated meta title, favicon, Open Graph, Twitter Card with SkiFi branding
- Removed ~5 MB of unused fonts/components
- Built full **SEO foundation**: keyword-rich title/desc/meta, canonical, JSON-LD (Organization, ProfessionalService, WebSite, FAQPage), robots.txt, dynamic `/api/sitemap.xml`
- Built **Blog feature**:
  - Backend: `blog_posts` collection, public + admin endpoints, slug auto-gen, draft/published, BlogPosting JSON-LD per post
  - Frontend routes: `/blog` (index), `/blog/:slug` (single)
  - Admin: full CMS — create/edit/delete with Markdown editor + live preview, status toggle, tags, cover image
  - Markdown rendering via `react-markdown` + `remark-gfm`
  - Dynamic sitemap auto-includes all published posts → submit `https://skifidesigns.com/api/sitemap.xml` to Google Search Console & Bing
- Header nav: added "Blog" link

### Earlier
- Full landing page MVP, Stripe payments, subscription, Admin panel orders, Resources page with Google Auth + template purchases, Resend emails

## API Reference (key endpoints)
| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/onboarding/create-checkout` | Stripe checkout for project packages |
| GET | `/api/payments/status/{session_id}` | Polling payment status |
| POST | `/api/webhook/stripe` | Stripe webhook (must be configured in Stripe Dashboard for production) |
| POST | `/api/admin/login` | Admin password login → returns Bearer token |
| GET | `/api/blog` | Public — list published posts |
| GET | `/api/blog/{slug}` | Public — single post |
| GET/POST/PATCH/DELETE | `/api/admin/blog` | Admin CRUD on posts |
| GET | `/api/sitemap.xml` | Dynamic SEO sitemap |
| GET | `/api/templates` | Public — list templates |
| POST | `/api/auth/google` | Emergent Google OAuth callback |

## P0/P1 Pending User Actions
- [ ] **P0** Revoke old Stripe key in Stripe Dashboard (replaced; new key tested live)
- [ ] **P0** Configure Stripe webhook → `https://skifidesigns.com/api/webhook/stripe`
- [ ] **P0** Rename Emergent project from `presentation-studio-22` → `SkiFi Designs` (fixes Google login title)
- [ ] **P1** Redeploy to push blog + SEO changes to production
- [ ] **P1** Submit dynamic sitemap to GSC + Bing
- [ ] **P1** Upload initial templates via `/admin` → Templates
- [x] **P1** Live Stripe end-to-end verified ($150 package, 2026-02) - payment + Resend email + GridFS uploads all working
- [ ] **P2** Email support@emergent.sh to remove "Made with Emergent" badge

## Roadmap
- [ ] P2 — Split `AdminPanel.jsx` into sub-components (Orders, Templates, Blog)
- [ ] P2 — Add SEO-friendly `/services/[slug]` landing pages (e.g., `/services/investor-pitch-deck-design`) — high SEO leverage
- [ ] P3 — Lead-magnet email opt-in on `/resources` and `/blog`
- [ ] P3 — Author profile / multi-author support for blog

## 3rd-Party Integrations
- **Stripe** — live keys; one-time + subscription
- **Resend** — transactional emails on payment events
- **Emergent Google OAuth** — Resources page Google Sign-in
- **Cal.com** — Book-a-call popup

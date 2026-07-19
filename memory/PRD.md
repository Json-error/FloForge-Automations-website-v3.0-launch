# FloForge Automations — PRD

## Original Problem Statement
Premium, modern, 3D dark-themed website for **FloForge Automations**, a small-business operations & automation company. Bold, trustworthy, futuristic, professional. Helps contractors/local businesses stop losing leads, stay organized, automate follow-ups, and build CRM systems.

Brand: Deep Navy #0F172A (bg), Dark Indigo #312E81 (secondary), Rich Purple #5B21B6 (buttons/highlights), Emerald #10B981 (success accents), Off White #F8FAFC, Black #000000. Fonts: Manrope (headings/buttons), Inter (body).

## Architecture / Tasks Done (2026-06-29)
- **Frontend**: React + Tailwind + framer-motion. `pages/Landing.jsx` composes `Navbar`, `Hero`, sonner `Toaster`.
  - Sticky glassmorphism navbar (logo + Services/How It Works/Industries/Results/Contact + Start Now CTA, mobile menu).
  - Hero: split layout, animated headline/subcopy/dual CTAs (staggered fade-up), trust row.
  - `Dashboard3D.jsx`: CSS/Framer 3D illusion — glass dashboard panel, floating cards (New Lead, Follow-Up Task, Estimate Sent, Closed Won), animated SVG purple→emerald connector lines, drifting particles, ambient glow.
  - `ContactDialog.jsx`: Radix dialog lead-capture form (Full Name, Company, Email, Bottleneck select) → POST /api/leads, success state + toast.
- **Backend** (`server.py`): `Lead` model + `POST /api/leads`, `GET /api/leads` (MongoDB `leads` collection, `_id` excluded).

## Core Requirements (static)
Hero-only landing page; CSS/Framer 3D visual; working contact form storing leads in MongoDB; professional placeholder copy.

## Status — Implemented & Verified
- Hero, navbar, 3D dashboard visual: done.
- Lead-capture form end-to-end (3 CTA triggers, validation, persistence): verified 100% by testing agent (iteration_1).
- **Services section (2026-06-29)**: OUR SERVICES label, "Build a Business That Runs Smarter" heading + intro, 5 glassmorphism cards in asymmetrical grid with scroll-reveal stagger, cursor-tilt 3D, purple edge glow, hover-expand details; sticky "Built for Growing Businesses" control-center panel with animated checklist + Start Now CTA (reuses ContactDialog). Grid/particles/connector-line ambiance. Compiles clean; CTA flow already verified.
- **How It Works section (2026-06-29)**: HOW IT WORKS label, "From Business Chaos to Organized Growth" heading + intro, 4-step horizontal workflow (Discover/Design/Automate/Optimize) with illuminating left-to-right connector line, scroll-reveal + hover lift, node dots. Before/After transformation panels (red struck-through chaos → emerald organized system) with animated reveals + FloForge arrow. Closing statement + "Schedule a Free Consultation" CTA (reuses ContactDialog). Compiles clean.

## Backlog
- **P1**: Build full sections — Services, How It Works, Industries, Results, Contact, Footer.
- **P2**: Admin view for captured leads; email notification on new lead (Resend/SendGrid).
- **P2**: Restrict CORS_ORIGINS in production; migrate FastAPI shutdown to lifespan.

## Next Tasks
Build out the remaining sections (Services → Contact) when the user is ready.

## Full Site Status (2026-06-29)
Complete multi-section landing page + Privacy Policy route. All sections share one glassmorphism design system (dark theme with a light Off-White Results section for rhythm):
- **Hero, Services, How It Works, Industries, Automation Engine, Why FloForge, Results, Contact, Footer** — all wired in `pages/Landing.jsx`.
- **Routing**: `react-router-dom` — `/` (Landing), `/privacy` (PrivacyPolicy with 7 sections: info collected, form use, cookies, third-party, retention, rights, contact).
- **Shared `LeadForm`** used by the modal `ContactDialog` (all CTAs) and the inline Contact section → `POST /api/leads` (MongoDB). Verified 100% in iteration_2 (dialog + inline + persistence).
- **Polish pass**: loading screen (logo + assembling ring), global smooth scroll + scroll-padding, `prefers-reduced-motion` disables ambient animations, navbar active-section highlight via IntersectionObserver + scroll opacity/blur, footer with mission/contact/social placeholders/privacy link/animated top line.
- Nav anchors: `#services #how-it-works #industries #results #contact`. `#results` = light Results section; former "why" section id renamed to `#why`.

## Backlog (updated)
- P2: Admin dashboard to view captured leads & payments; email notification on new lead (Resend).
- P2: Real Terms page; wire social links when accounts exist; restrict CORS in prod.

## Stripe Payments (2026-06-29) — Flow A claimable sandbox
- 3 packages via `setup_stripe.py` lookup_keys: `starter_setup_onetime` ($299 one-time), `business_automation_onetime` ($699 one-time), `growth_partnership_monthly` ($149/mo subscription).
- Backend `server.py`: `POST /api/payments/checkout` (mode auto: payment vs subscription), `GET /api/payments/status/{session_id}` (poll + Stripe fallback), `POST /api/stripe/webhook` (idempotent). `payment_transactions` in Mongo, inserted before redirect. TAX_MODE="full" (Stripe-managed / SMP).
- Frontend routes: `/pricing` (3-tier premium cards + limited-offer banner), `/payment/success` (polls status), `/payment/cancel`. Pricing linked in navbar + footer. Sends only {lookup_key, origin_url}.
- Verified 13/13 backend + frontend 100% (iteration_2). Sandbox account: acct_1TuyTXPj4yk2TVe4.

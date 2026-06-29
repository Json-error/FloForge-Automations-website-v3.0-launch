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

## Backlog
- **P1**: Build full sections — Services, How It Works, Industries, Results, Contact, Footer.
- **P2**: Admin view for captured leads; email notification on new lead (Resend/SendGrid).
- **P2**: Restrict CORS_ORIGINS in production; migrate FastAPI shutdown to lifespan.

## Next Tasks
Build out the remaining sections (Services → Contact) when the user is ready.

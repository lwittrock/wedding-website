# Wedding Website — Claude Code Notes

## Project Overview
Jenna & Lars wedding website. Single-page React app deployed at **www.jenna-lars.eu** via GitHub Pages. Wedding weekend: June 26–28 2026, Domaine Des Officiers, Vielsalm, Belgian Ardennes.

## Tech Stack
- React 19 + TypeScript + Vite + Tailwind CSS 4
- Supabase (RSVP guest data)
- Cloudinary (guest photo uploads)
- GitHub Pages hosting, auto-deploys on push to `main`

## Key Commands
```bash
npm run dev          # local dev server
npm run build        # TypeScript check + Vite build
npm run upload-guests  # bulk import guestlist.csv → Supabase
```

## Project Structure
- `src/pages/HomePage.tsx` — main page, all sections assembled here
- `src/components/` — 18 components (Hero, Navigation, RsvpModule, FAQGrid, etc.)
- `src/constants/config.ts` — site-wide config: dates, bank details (IBAN), Google Maps links, photo readiness flags
- `src/constants/sections.ts` — nav section definitions
- `src/types/rsvp.ts` — Guest TypeScript interface
- `src/utils/supabase.ts` — Supabase client (reads from `.env.local`)
- `scripts/upload-guests.ts` — CSV guest uploader
- `data/guestlist.csv` — guest list (gitignored)

## Credentials & Environment
- `.env.local` — Supabase URL + anon key (gitignored, not committed)
- Cloudinary cloud name + upload preset are hardcoded in `PhotoUploadModal.tsx` — this is intentional, upload presets are by design public
- GitHub Actions secrets hold Supabase keys for CI/CD and the ping report

## Deployment
Push to `main` → GitHub Actions builds + deploys to GitHub Pages automatically. See `.github/workflows/deploy.yml`.

A second workflow (`.github/workflows/supabase-ping-report.yml`) runs every 5 days to keep the free Supabase tier from hibernating, and sends a weekly RSVP summary email.

## Site Sections (in order)
1. **Home** — hero with venue watercolor image
2. **Schedule** — weekend timeline
3. **Location** — venue + travel options (plane/train/car) + parking maps
4. **Explore** — Ardennes attractions
5. **FAQ** — 10 Q&As including gift registry (IBAN in `config.ts`)
6. **RSVP** — lookup by name → form → confirmation (Supabase backend)
7. **Photos** — guest upload (Cloudinary) + official download (toggle via `config.ts`)

## Feature Flags in config.ts
- `CONFIG.PHOTOS.IS_READY` — set to `true` to enable official photo download
- `CONFIG.PHOTOS.IS_UPLOAD_READY` — set to `true` to enable guest photo upload

## Notes
- `robots.txt` intentionally blocks all indexing (private wedding site)
- RSVP deadline was April 15th — RSVP phase is over
- `data/guestlist.csv` is gitignored for privacy

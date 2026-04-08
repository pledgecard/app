# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Pledgecard Africa is a crowdfunding platform for 8 African countries. Built with React 19, TypeScript, Vite, and Tailwind CSS. Uses Supabase for auth, database, and storage. Payments are currently simulated (MTN, Airtel, VISA).

## Development Commands

- `npm install` - Install dependencies
- `npm run dev` - Start dev server on port 3000 (accessible on network via 0.0.0.0)
- `npm run build` - Build for production
- `npm run preview` - Preview production build

No test framework is configured currently.

## Environment Setup

Create `.env.local` (not `.env`) with:
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Vite env vars are build-time only — they must be set during Docker/Netlify build, not runtime.

## Architecture

### Tech Stack
- React 19 + TypeScript (tsx files in root, no `src/` subdirectory)
- Vite with `@` path alias pointing to project root
- Tailwind CSS with custom brand colors (purple `brand-*`, amber `accent-*`)
- React Router v7 (HashRouter for deployment compatibility)
- Supabase for auth, PostgreSQL, and storage

### Project Structure
```
App.tsx              # Router + AuthListener (handles OAuth hash callbacks)
index.tsx            # React entry point
components/          # UI components (Navbar, Footer, CampaignCard, etc.)
pages/               # Route components (Home, Dashboard, CreateCampaign, etc.)
services/
  api.ts             # Service switcher (MockApi vs SupabaseService based on env)
  supabaseService.ts # Production Supabase implementation
  mockApi.ts         # Development mock data
lib/
  supabase.ts        # Supabase client initialization
  dashboardHelpers.ts # Supporter level system, metrics calculations
types.ts             # TypeScript interfaces and enums (User, Campaign, Pledge, Donation)
supabase_schema.sql  # Database schema reference
```

### Key Patterns

**Auth Flow (OAuth callback):**
1. Google redirects to `/#access_token=...&refresh_token=...`
2. `AuthListener` in App.tsx parses hash, calls `supabase.auth.setSession()`
3. Cleans URL and navigates to `/dashboard`
4. `onAuthStateChange` handles auto-navigation on sign-in/sign-out

**Service Abstraction:**
- `services/api.ts` exports `ApiService` — switches between `MockApi` (dev) and `SupabaseService` based on `VITE_SUPABASE_URL`
- Components import from `services/api.ts`, never directly from Supabase service files

**Database gotcha:**
- Supabase uses snake_case (`raised_amount`), TypeScript uses camelCase (`raisedAmount`)
- Service layer handles the mapping

**Rich Text Editor:**
- Custom `contentEditable` div in `components/RichTextEditor.tsx`
- Uses `document.execCommand()` for formatting
- Images stored as base64 data URIs in HTML

### State Management
React hooks only (useState, useEffect). Supabase real-time subscriptions for live updates on Dashboard and Home pages. Always unsubscribe in cleanup functions.

### Routing
HashRouter is used for deployment compatibility. Routes: `/`, `/campaigns`, `/campaign/:id`, `/dashboard`, `/create`, `/admin`, `/login`

## Deployment

**Netlify (production):** Auto-deploys on push to `main`. Configure env vars in Site Settings.

**Docker:** Multi-stage build (Node 20 Alpine + Nginx Alpine). Container exposes port 8080 (not 80 — avoids Coolify conflicts). Environment variables must be passed as build ARG, not runtime env vars.

**Supabase OAuth redirect URLs:**
- `https://pledgecard.co`
- `https://pledgecard.co/#/dashboard`
- `https://www.pledgecard.co`
- `https://www.pledgecard.co/#/dashboard`

## Known Issues

- **MIME type errors on Netlify:** `netlify.toml` handles Content-Type headers for JS/CSS
- **OAuth redirecting to localhost:** Check Site URL and Redirect URLs in Supabase Dashboard match production domain
- **Database tables missing (406/404):** Dashboard detects this and shows SQL setup script
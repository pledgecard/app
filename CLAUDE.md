# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Pledgecard Africa is a crowdfunding platform built with React 19, TypeScript, and Vite. It allows users to create campaigns, receive instant donations, and collect future pledges with local payment integration (MTN Mobile Money, Airtel Money, VISA). The app uses Supabase for authentication and data persistence.

## Development Commands

- `npm install` - Install dependencies
- `npm run dev` - Start development server on port 3000
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

## Environment Setup

The app requires environment variables set in `.env` or `.env.local`:
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous/public key

**Important:** Vite environment variables are build-time only. When deploying with Docker or Netlify, these must be available during the build process, not at runtime.

## Architecture

### Project Structure

```
├── App.tsx                 # Main router with auth state listener
├── index.html              # HTML entry point with favicon
├── index.tsx               # React entry point
├── netlify.toml            # Netlify deployment configuration
├── Dockerfile              # Docker container configuration
├── nginx.conf              # Nginx configuration for Docker
├── components/             # Reusable UI components
│   ├── Navbar.tsx         # Navigation with auth state
│   ├── Footer.tsx
│   ├── CampaignCard.tsx   # Campaign display card
│   ├── MyCampaignCard.tsx # User's campaign card with status
│   ├── ProgressBar.tsx
│   ├── RichTextEditor.tsx # Content-editable WYSIWYG editor
│   └── PaymentSimulation.tsx
├── pages/                  # Route components
│   ├── Home.tsx           # Landing page with featured campaigns
│   ├── Campaigns.tsx      # All campaigns listing
│   ├── CampaignDetails.tsx # Single campaign view with donation/pledge
│   ├── Auth.tsx           # OAuth login (Google)
│   ├── Dashboard.tsx      # User dashboard (my campaigns, pledges)
│   ├── CreateCampaign.tsx # Campaign creation
│   └── AdminDashboard.tsx # Campaign moderation
├── services/               # API abstraction layer
│   ├── api.ts             # Service switcher (Mock vs Supabase)
│   ├── supabaseService.ts # Supabase implementation
│   └── mockApi.ts         # Mock data for development
├── lib/
│   └── supabase.ts        # Supabase client initialization
├── public/                 # Static assets
│   ├── logo.png           # Logo used as favicon
│   └── hero/              # Hero section images
├── types.ts               # TypeScript interfaces/enums
└── supabase_schema.sql    # Database schema reference
```

### Key Architecture Patterns

**Routing & Auth Flow**
- Uses `HashRouter` for compatibility (supports deployment setups without server-side routing config)
- Auth state managed via Supabase OAuth (Google provider)
- `AuthListener` component in App.tsx handles OAuth callback tokens from URL hash (format: `#access_token=...&refresh_token=...`)
- OAuth flow: Google redirects to `/#access_token=...`, AuthListener parses hash, calls `supabase.auth.setSession()`, then redirects to `/dashboard`
- Auth state changes trigger automatic navigation (`/dashboard` on sign-in, `/login` on sign-out)

**Data Types**
Core entities: `User`, `Campaign`, `Pledge`, `Donation`
Enums: `UserRole`, `CampaignStatus`, `PledgeStatus`

**Service Abstraction Pattern**
- `services/api.ts` acts as a facade that switches between `MockApi` (dev) and `SupabaseService` (production)
- The switch is controlled by `IS_PRODUCTION` which checks for `VITE_SUPABASE_URL`
- This allows local development without a Supabase backend
- All components import from `services/api.ts`, never directly from Supabase

**Database Schema & Triggers**
- Supabase PostgreSQL with Row Level Security (RLS) enabled
- Triggers automatically update campaign `raised_amount` and `pledged_amount` when donations/pledges are created
- Storage bucket `campaign-images` for file uploads with public read access
- RLS policies: Approved campaigns are public, users can only see their own pledges/donations
- **Important:** Column naming mismatch - Supabase uses snake_case (`raised_amount`) but TypeScript uses camelCase (`raisedAmount`). The service layer handles this mapping.

**Role-Based Access Control**
- Navbar shows Admin link only when `user.role === UserRole.ADMIN`
- Dashboard displays different states based on campaign status (PENDING vs APPROVED/COMPLETED)
- AdminDashboard provides campaign approval workflow and platform-wide stats

**Rich Text Editor**
- Custom `contentEditable` div with toolbar buttons using `document.execCommand()`
- Supports bold, italic, headings (H2, H3), lists, quotes, text alignment, and image upload (base64)
- Syncs with external value changes via useEffect to handle AI-generated content updates
- Images stored as base64 data URIs in the HTML

**Styling**
- Tailwind CSS with custom brand colors (`brand`: purple, `accent`: amber)
- Font: Poppins for both sans and display
- Custom shadows: `shadow-soft`, `shadow-glow`

## State Management

The app uses React hooks (useState, useEffect) and Supabase real-time subscriptions. No global state library (Redux/Context) is implemented yet.

**Real-time Updates:**
- `ApiService.subscribeToCampaignUpdates()` subscribes to PostgreSQL changes via Supabase
- Dashboard and Home pages subscribe to campaign updates and show toast notifications
- AdminDashboard has a "Live Feed" showing recent donations and pledges
- Always unsubscribe in cleanup functions to avoid memory leaks

**Common Development Patterns:**

**Skeleton Loading:**
- Use `SkeletonLoader` component (see Dashboard.tsx) for async data loading states
- Pattern: `if (loading) return <SkeletonLoader />;`

**Database Error Handling:**
- Dashboard checks for 406/404 errors to detect missing database tables
- Use retry logic for OAuth session timing: multiple attempts with delays
- Pattern: `while (!currentUser && retries < maxRetries)`

**Navigation:**
- `useNavigate()` from `react-router-dom` for programmatic navigation
- Link components from `react-router-dom` for declarative navigation
- Auth state changes trigger automatic redirects via `AuthListener`

**Image Handling:**
- Campaign images uploaded to Supabase Storage bucket `campaign-images`
- Path format: `campaigns/{userId}/{timestamp}.{ext}`
- Rich text editor images stored as base64 in HTML content
- Hero images referenced as `/hero/{filename}.png` from public folder

## Payment Integration

Currently simulated in `PaymentSimulation.tsx` for MTN, Airtel, and VISA. Real payment gateway integration is pending.

**Donations:**
- `createDonation()` generates a unique `transaction_id` for each payment
- Transaction IDs follow format: `TXN-{timestamp}-{random}`
- Payment methods stored as: 'MTN', 'AIRTEL', 'VISA' (note: differs from UI which uses 'Airtel')

## Vite Configuration

- Dev server runs on port 3000 with host `0.0.0.0` (accessible from network)
- Path alias `@` resolves to project root directory

## Deployment

### Production Environment
- **Live URL:** https://pledgecard.co
- **Platform:** Netlify
- **Auto-deploys:** On push to `main` branch

### Environment Variables (Netlify)
Configure in Netlify Site Settings → Environment variables:
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous/public key

### Supabase Configuration
For authentication to work correctly, configure in Supabase Dashboard:

**Authentication → URL Configuration:**
- **Site URL:** `https://pledgecard.co`
- **Redirect URLs:**
  - `https://pledgecard.co/#/dashboard`
  - `https://pledgecard.co`
  - `https://www.pledgecard.co/#/dashboard`
  - `https://www.pledgecard.co`

### Deployment Files

**Netlify Configuration (`netlify.toml`)**
- Build command: `npm run build`
- Publish directory: `dist`
- MIME type headers for JS/CSS files to fix Vite module loading

**Docker Deployment (`Dockerfile`, `nginx.conf`)**
- Multi-stage build with Node 20 Alpine and Nginx Alpine
- Container runs on port 8080 (Note: COOLIFY_DEPLOYMENT.md incorrectly mentions port 80)
- Suitable for Coolify or other Docker-based deployments
- Environment variables must be passed as build arguments (ARG) during image build

### Known Issues & Solutions

**Netlify MIME Type Error:**
If you see "Expected a JavaScript module script but got 'application/octet-stream'", the `netlify.toml` file handles this with proper Content-Type headers.

**Coolify Port Conflicts:**
- Port 80 often conflicts with Coolify's proxy
- Dockerfile exposes port 8080 (not port 80)
- Coolify will automatically proxy the container to its public domain
- Environment variables must be set as build arguments in Coolify, not runtime env vars

**Supabase OAuth Redirects to Localhost:**
- Update Site URL and Redirect URLs in Supabase Dashboard
- Must match production domain (pledgecard.co)

**Database Setup Errors (406/404):**
- Dashboard detects missing tables and shows setup instructions with SQL script
- Error occurs when `profiles` or `campaigns` tables don't exist
- SQL script in Dashboard handles table creation, RLS policies, and triggers

### Favicon
The app uses `/public/logo.png` as the favicon, configured in `index.html`.

### Static Assets
Hero section images are stored in `/public/hero/`:
- `medical.png` - Medical campaigns
- `education.png` - Education campaigns
- `emergency.png` - Emergency/clean water campaigns
- `business.png` - Business campaigns
- `cause.png` - Tech hub campaigns
- `animals.png` - Wildlife campaigns

Success story images in `/public/success-stories/`:
- `mary_profile.png` - Profile image
- `borehole_success.png` - Campaign completion image

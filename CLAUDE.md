# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Pledge Card Uganda is a crowdfunding platform built with React, TypeScript, and Vite. It allows users to create campaigns, receive instant donations, and collect future pledges with local payment integration (MTN Mobile Money, Airtel Money, VISA). The app uses Supabase for authentication and data persistence.

## Development Commands

- `npm install` - Install dependencies
- `npm run dev` - Start development server on port 3000
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

## Environment Setup

The app requires environment variables set in `.env` or `.env.local`:
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous/public key

## Architecture

### Project Structure

```
├── App.tsx                 # Main router with auth state listener
├── index.tsx               # React entry point
├── components/             # Reusable UI components
│   ├── Navbar.tsx         # Navigation with auth state
│   ├── Footer.tsx
│   ├── CampaignCard.tsx   # Campaign display card
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
├── lib/
│   └── supabase.ts        # Supabase client initialization
├── types.ts               # TypeScript interfaces/enums
└── supabase_schema.sql    # Database schema reference
```

### Key Architecture Patterns

**Routing & Auth Flow**
- Uses `HashRouter` for compatibility
- Auth state managed via Supabase OAuth (Google provider)
- `AuthListener` component in App.tsx handles OAuth callback tokens from URL hash (format: `#access_token=...&refresh_token=...`) and redirects to dashboard
- Auth state changes trigger automatic navigation (`/dashboard` on sign-in, `/login` on sign-out)

**Data Types**
Core entities: `User`, `Campaign`, `Pledge`, `Donation`
Enums: `UserRole`, `CampaignStatus`, `PledgeStatus`

**Rich Text Editor**
- Custom `contentEditable` div with toolbar buttons using `document.execCommand()`
- Supports bold, italic, headings (H2, H3), lists, quotes, text alignment, and image upload (base64)
- Syncs with external value changes via useEffect

**Styling**
- Tailwind CSS with custom brand colors (`brand`: purple, `accent`: amber)
- Font: Poppins for both sans and display
- Custom shadows: `shadow-soft`, `shadow-glow`

## State Management

The app uses React hooks (useState, useEffect) and Supabase real-time subscriptions. No global state library (Redux/Context) is implemented yet.

## Payment Integration

Currently simulated in `PaymentSimulation.tsx` for MTN, Airtel, and VISA. Real payment gateway integration is pending.

## Vite Configuration

- Dev server runs on port 3000 with host `0.0.0.0` (accessible from network)
- Path alias `@` resolves to project root directory

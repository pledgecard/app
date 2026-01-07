# Pledgecard Africa

**Africa's Trusted Crowdfunding Platform**

Empowering communities across 8 African countries with transparent, accessible, and secure crowdfunding technology.

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Supabase account

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables** in `.env.local`:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```
   Opens on http://localhost:3000

### Build for Production
```bash
npm run build
npm run preview
```

## 📋 Project Overview

Pledgecard Africa is a crowdfunding platform that allows users to:
- Create fundraising campaigns (medical, education, emergencies, business)
- Receive instant donations via mobile money (MTN, Airtel, VISA)
- Collect future pledges with automated reminders
- Manage campaigns with advanced analytics

**Tech Stack:** React, TypeScript, Vite, Tailwind CSS, Supabase

## 🌐 Deployment

### Production
- **Live Site:** https://pledgecard.co
- **Platform:** Netlify (auto-deploys on push to `main`)
- **Docker:** Multi-stage build with Nginx (port 8080)

### Environment Variables (Netlify)
Configure in Netlify → Site Settings → Environment variables:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## 📚 Documentation

- **[CLAUDE.md](./CLAUDE.md)** - Comprehensive project documentation for Claude Code
- **[CHANGELOG.md](./CHANGELOG.md)** - Recent updates and changes
- **[COOLIFY_DEPLOYMENT.md](./COOLIFY_DEPLOYMENT.md)** - Coolify deployment guide

## 🏗️ Architecture

- **Frontend:** React 19 + TypeScript + Vite
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **Styling:** Tailwind CSS with custom brand colors
- **Routing:** React Router (HashRouter)
- **State Management:** React hooks + Supabase real-time

## 🔐 Security Notes

- Never commit `.env.local` or real credentials
- All API keys stored as environment variables (build-time)
- Row Level Security (RLS) enabled on Supabase tables
- Admin routes protected by role-based access control

## 📝 Recent Updates (January 2026)

### Major Rebrand
- ✅ Rebranded from "PledgeCard Uganda" to "Pledgecard Africa"
- ✅ Expanded scope to 8 African countries
- ✅ Updated statistics: 10M+ raised, 15k+ users, 200+ campaigns
- ✅ Added Services Overview section (Personal, Pro, CSR, Events)
- ✅ Updated success story: Namayingo Women's Cooperative (UGX 45M)
- ✅ Restricted Dashboard and Admin navigation based on user role
- ✅ Improved landing page design and messaging

See [CHANGELOG.md](./CHANGELOG.md) for complete details.

## 🤝 Contributing

This is a private repository. For internal team use only.

## 📄 License

Proprietary - All rights reserved

---

**Last Updated:** January 7, 2026


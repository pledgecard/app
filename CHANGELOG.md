# Changelog

All notable changes to this project will be documented in this file.

## [2026-01-07] - Major Rebrand: PledgeCard Uganda → Pledgecard Africa

### Landing Page Updates

#### Hero Section
- ✅ Updated badge: "Africa's Trusted Crowdfunding Platform"
- ✅ Updated headline: "Empowering Africans fundraise"
- ✅ Updated stats: "Over UGX 10 million raised across 8 African countries"
- ✅ Removed decorative underline under "Africans"
- ✅ Updated description to mention Africa-wide reach (Kampala to Lagos)

#### Impact Stats Section
- **Money Raised:** 500M+ → 10M+ UGX
- **Users:** 1.2k Pledges → 15k+ Active Users
- **Campaigns:** 100% → 200+ Verified Campaigns
- **Reach:** 50+ Communities → 8 African Countries

#### Features Section
- ✅ Removed decorative underline under "PledgeCard"
- ✅ Updated description: "technology built for the African context — serving 8 countries with localized payment integrations"

#### New: Services Overview Section
- Added 4 service cards with clean, minimalist design
- Personal Fundraising (brand purple)
- Pledgecard Pro (accent amber)
- CSR Management (gray)
- Event Fundraising (brand purple)
- Light gray card backgrounds (bg-gray-50)
- Simple hover effects
- Centered icons and text

#### Success Stories Section
- ✅ Updated from Kalangala borehole story to Namayingo Women's Cooperative
- New headline: "Our cooperative grew from 20 to 150 women."
- New amount: UGX 45M (was UGX 12M)
- New timeline: 6 weeks (was 3 weeks)
- New person: Sarah A., Cooperative Chairperson (was Mary N.)

### Navigation Updates

#### Navbar (`components/Navbar.tsx`)
- ✅ Dashboard link: Now only shows when user is logged in (`{user && ...}`)
- ✅ Admin link: Restricted to admin role only (`{user?.role === UserRole.ADMIN}`)
- Applied to both desktop and mobile navigation
- Added UserRole import

### Branding Updates

#### Page Metadata (`index.html`)
- ✅ Title: "Pledgecard Africa - Africa's Trusted Crowdfunding Platform"
- ✅ Added meta description for SEO

#### Footer (`components/Footer.tsx`)
- ✅ Mission statement: "Bridging the intention-action gap across Africa — democratizing access to financial resources through secure, transparent crowdfunding."
- ✅ Copyright: "© 2025 Pledgecard Africa. All rights reserved."

### Documentation
- ✅ Updated CLAUDE.md with latest deployment information

### Git & Deployment
- ✅ Commit: `7b3ce4c` - "feat: rebrand from PledgeCard Uganda to Pledgecard Africa"
- ✅ Pushed to GitHub main branch
- ✅ Auto-deployed to Netlify (https://pledgecard.co)
- ✅ 5 files changed, 119 insertions(+), 41 deletions(-)

### Configuration
- ✅ Configured Supabase MCP server for Claude Code integration
- ✅ Location: `C:\Users\Cavemo\.claude\mcp_settings.json`

---

## Design Principles Applied

### Services Section Design
Based on reference image (Screenshot 2026-01-07):
- Clean white background
- Light gray card backgrounds (#F3F4F6 / gray-50)
- Simple rounded corners (rounded-xl)
- Flat, centered icons matching card accent colors
- No shadows, badges, or decorative elements
- Subtle hover effect (bg-gray-50 → bg-gray-100)
- Minimalist, professional aesthetic

### Color Coding
- **Brand Purple:** Personal Fundraising, Event Fundraising
- **Accent Amber:** Pledgecard Pro
- **Gray:** CSR Management

---

## Files Modified

1. `pages/Home.tsx` - Major landing page rebrand
2. `components/Footer.tsx` - Mission and copyright updates
3. `components/Navbar.tsx` - Conditional menu items
4. `index.html` - Title and meta tags
5. `CLAUDE.md` - Documentation updates

---

## Next Steps (To-Do)

### Immediate
- [ ] Replace success story placeholder images with actual Namayingo Cooperative photos
- [ ] Test navigation with different user roles (guest, user, admin)
- [ ] Verify all links work correctly after rebrand

### Future Enhancements
- [ ] Consider adding "Countries We Serve" section with visual map or list
- [ ] Add real-time data to statistics if backend supports it
- [ ] Create actual pages for Services (Personal, Pro, CSR, Events)
- [ ] Add case studies page with more success stories

---

## Notes

- All changes are frontend-only - no database modifications required
- Vite environment variables are build-time only (must be available during build, not runtime)
- Supabase credentials stored in `.env.local` (excluded from git)
- Development server runs on port 3001 (3000 was in use)

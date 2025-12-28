# Coolify Deployment Guide - PledgeCard Uganda

This guide will help you deploy the PledgeCard Uganda app on Hostinger VPS using Coolify.

---

## Prerequisites

- Hostinger KVM 8 VPS with Coolify installed
- GitHub repository: https://github.com/pledgecard/app
- Supabase project credentials
- Google Gemini API key

---

## Quick Overview

**Deployment Method:** Docker-based static site
**Web Server:** Nginx (Alpine)
**Build Tool:** Vite
**Port:** 80 (will be proxied by Coolify)

---

## Part 1: Install Coolify on Hostinger VPS

If you haven't installed Coolify yet:

### 1. Connect to Your VPS via SSH

```bash
ssh root@your_vps_ip
```

### 2. Install Coolify

Run the official Coolify installation script:

```bash
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

### 3. Access Coolify Dashboard

- Wait 2-3 minutes for installation to complete
- Visit: `http://your_vps_ip:8000`
- Create your admin account
- Complete the setup wizard

### 4. Configure Domain (Optional but Recommended)

- Go to **Settings** → **Domains**
- Add your custom domain
- Configure DNS to point to your VPS

---

## Part 2: Link GitHub Repository

### 1. Connect GitHub to Coolify

1. In Coolify dashboard, go to **Sources** → **GitHub**
2. Click **Connect GitHub Account**
3. Authorize Coolify to access your repositories
4. Select **pledgecard/app** repository

### 2. Configure Repository Access

- Make sure the repository is set to **Public** or grant Coolify access to **Private** repos
- Enable webhooks for automatic deployments

---

## Part 3: Create New Application

### 1. Create Resource

1. Go to **Resources** → **Create New**
2. Select **From GitHub**
3. Choose **pledgecard/app** repository
4. Select branch: `main`
5. Click **Continue**

### 2. Configure Application

#### **Basic Settings**
- **Name:** `pledgecard-uganda` (or your preferred name)
- **Resource Type:** Dockerfile

#### **Build Settings**
- **Dockerfile Path:** `./Dockerfile`
- **Docker Context:** `/`
- **Build Arguments:** Add the following:

| Key | Value | Description |
|-----|-------|-------------|
| `GEMINI_API_KEY` | `your_gemini_api_key` | Google Gemini AI key |
| `VITE_SUPABASE_URL` | `your_supabase_url` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | `your_supabase_anon_key` | Supabase anonymous key |

**Important:** These build arguments inject your environment variables during the build process.

#### **Port Configuration**
- **Container Port:** `80` (Nginx default)

#### **Domain Settings**
- **Domain:** Add your custom domain (e.g., `app.pledgecard.ug`)
- Or use Coolify's generated domain

---

## Part 4: Environment Variables

### Build Arguments (Set During Build)

These are already configured in Build Settings above:

- `GEMINI_API_KEY` - Required for AI description generation
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key

### Runtime Environment Variables

For this app, no runtime variables are needed since all variables are build-time only.

---

## Part 5: Deploy

### 1. Initial Deployment

1. Click **Deploy** button
2. Coolify will:
   - Clone your repository
   - Build the Docker image using your Dockerfile
   - Inject build arguments
   - Deploy the container
   - Configure reverse proxy
3. Wait for deployment to complete (2-3 minutes)

### 2. Check Deployment Logs

- Click on your application
- Go to **Logs** tab
- Verify no errors occurred

### 3. Test Your Application

Visit your deployment URL:
- Custom domain: `https://your-domain.com`
- Coolify domain: `https://your-id.coolify.io`

---

## Part 6: Configure Supabase

### Update Allowed Redirect URLs

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Navigate to: **Settings** → **Authentication** → **URL Configuration**
3. Update:

**Site URL:**
```
https://your-domain.com
```

**Redirect URLs:**
```
https://your-domain.com/#/dashboard
https://your-domain.com
```

4. Click **Save**

---

## Part 7: SSL/HTTPS Configuration

Coolify automatically handles SSL for you!

### Automatic SSL

1. Go to your application in Coolify
2. Navigate to **Domains** tab
3. Click **Enable SSL** (or it's enabled by default)
4. Coolify uses Let's Encrypt for free SSL certificates

Your app is now served over HTTPS automatically.

---

## Part 8: Automatic Deployments

Coolify can automatically deploy when you push to GitHub:

### Configure Webhook

1. In your application settings
2. Go to **General** → **Auto Deploy**
3. Enable **Auto Deploy on Push**
4. Select branch: `main`

### How It Works

1. You push changes to GitHub
2. GitHub webhook triggers Coolify
3. Coolify pulls latest code
4. Rebuilds Docker image
5. Deploys new version
6. Zero-downtime deployment

---

## Troubleshooting

### Build Fails

**Issue:** Build fails with environment variable errors

**Solution:**
- Verify build arguments are correctly set
- Check for typos in API keys
- Ensure `GEMINI_API_KEY` is set (app will show "AI Service not configured" without it)

### 502 Bad Gateway

**Issue:** Application deployed but returns 502

**Solution:**
- Check container logs in Coolify
- Verify container port is set to `80`
- Ensure Nginx is running inside container

### Environment Variables Not Working

**Issue:** API keys not working in production

**Solution:**
- Rebuild the application after changing build arguments
- In Coolify: Go to application → **Build** → **Force Rebuild**
- Environment variables in Vite are build-time only

### Supabase Auth Not Working

**Issue:** OAuth redirects failing

**Solution:**
- Verify redirect URLs in Supabase dashboard
- Ensure HTTPS is enabled
- Check that URL format includes hash: `/#/dashboard`

### High Memory Usage

**Issue:** Container using too much memory

**Solution:**
- This app is lightweight (should use ~50-100MB RAM)
- Set resource limits in Coolify:
  - Go to application → **Advanced** → **Resources**
  - Set Memory Limit: `256MB`
  - Set CPU Limit: `0.5` cores

---

## Monitoring and Maintenance

### View Logs

1. Go to your application in Coolify
2. Click **Logs** tab
3. View real-time logs

### Resource Usage

1. Go to application → **Metrics**
2. Monitor CPU, memory, and disk usage

### Updates

When you push new code to GitHub:

- **Auto deploy:** Enabled automatically deploys
- **Manual deploy:** Click **Deploy** button in Coolify

---

## Files Created for Coolify Deployment

| File | Purpose |
|------|---------|
| `Dockerfile` | Multi-stage build with Nginx |
| `nginx.conf` | Nginx configuration for production |
| `.dockerignore` | Excludes unnecessary files from Docker image |
| `.coolify/configure.sh` | Build script (optional) |

---

## Performance Optimization

The Dockerfile includes several optimizations:

1. **Multi-stage build:** Reduces final image size
2. **Alpine Linux:** Minimal base image (~40MB)
3. **Gzip compression:** Enabled by default
4. **Static asset caching:** 1-year cache for JS/CSS/images
5. **Health check:** Built-in container health monitoring

---

## Security Best Practices

1. ✅ SSL/HTTPS enabled automatically
2. ✅ Security headers configured in Nginx
3. ✅ No sensitive data in repository
4. ✅ Build-time environment variables
5. ✅ Regular dependency updates

**Important Note:** The `GEMINI_API_KEY` is embedded in the bundled JavaScript. For production, consider:
- Moving API calls through a backend service
- Using a serverless function to proxy the request
- Implementing rate limiting

---

## Next Steps

After successful deployment:

1. ✅ Test all features (create campaign, donations, auth)
2. ✅ Set up monitoring alerts in Coolify
3. ✅ Configure backup strategy for Supabase
4. ✅ Set up custom domain with proper DNS
5. ✅ Enable CDN if needed (Cloudflare integration)

---

## Need Help?

- **Coolify Documentation:** https://coolify.io/docs
- **Dockerfile Reference:** See `Dockerfile` in project root
- **Nginx Configuration:** See `nginx.conf` in project root
- **Application Logs:** Available in Coolify dashboard

---

## Summary Checklist

- [ ] Coolify installed on Hostinger VPS
- [ ] GitHub repository connected to Coolify
- [ ] Application created with Dockerfile
- [ ] Build arguments configured (API keys)
- [ ] Application deployed successfully
- [ ] Supabase redirect URLs updated
- [ ] SSL/HTTPS enabled
- [ ] Auto-deploy configured
- [ ] DNS pointed to Coolify (if using custom domain)

Your PledgeCard Uganda app is now live! 🎉

# Deploy to Cloudflare Pages - Step by Step

**Time Required:** 5-10 minutes
**Cost:** $0 (free forever)

## Why Cloudflare Pages?

- ✅ Unlimited bandwidth (vs GitHub Pages 100GB/month)
- ✅ Global CDN for fast worldwide performance
- ✅ Free forever with no hidden costs
- ✅ Better performance = Better SEO
- ✅ Built-in analytics
- ✅ Deploys from GitHub automatically

## Prerequisites

- GitHub account
- Cloudflare account (free - sign up at cloudflare.com)
- Domain ownership of dstack.info (or will use free subdomain)

## Step 1: Push to GitHub

```bash
cd /Users/lsdan/dstack/dstack-info

# Initialize git repository
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: dstack.info website"

# Create GitHub repo at https://github.com/new
# Name it: dstack-info
# Make it public

# Add remote (replace YOUR-ORG with your GitHub org/username)
git remote add origin https://github.com/YOUR-ORG/dstack-info.git

# Push
git branch -M main
git push -u origin main
```

## Step 2: Connect to Cloudflare Pages

1. **Sign up for Cloudflare**
   - Go to https://dash.cloudflare.com/sign-up
   - Create free account (no credit card required)

2. **Create new Pages project**
   - Go to https://dash.cloudflare.com/
   - Click "Workers & Pages" in left sidebar
   - Click "Create application"
   - Click "Pages" tab
   - Click "Connect to Git"

3. **Connect GitHub**
   - Click "Connect GitHub"
   - Authorize Cloudflare Pages
   - Select your repository: `dstack-info`

4. **Configure build settings**
   - **Project name:** `dstack-info`
   - **Production branch:** `main`
   - **Build command:** (leave empty - it's static HTML)
   - **Build output directory:** `/`
   - Click "Save and Deploy"

5. **Wait for deployment** (30-60 seconds)
   - Cloudflare will deploy your site
   - You'll get a URL like: `dstack-info.pages.dev`

## Step 3: Add Custom Domain (dstack.info)

### Option A: Domain already on Cloudflare

1. In your Pages project, click "Custom domains"
2. Click "Set up a custom domain"
3. Enter: `dstack.info`
4. Click "Continue"
5. Cloudflare will automatically configure DNS
6. Wait 1-2 minutes for SSL certificate

### Option B: Domain on another registrar

1. **Add domain to Cloudflare** (if not already)
   - Go to Cloudflare dashboard home
   - Click "Add a site"
   - Enter: `dstack.info`
   - Select "Free" plan
   - Follow instructions to change nameservers at your registrar

2. **Once domain is on Cloudflare:**
   - Go back to your Pages project
   - Click "Custom domains"
   - Click "Set up a custom domain"
   - Enter: `dstack.info`
   - Cloudflare auto-configures everything

3. **Update nameservers at your registrar**
   - Cloudflare will show you 2 nameservers like:
     ```
     aron.ns.cloudflare.com
     vera.ns.cloudflare.com
     ```
   - Go to your domain registrar (GoDaddy, Namecheap, etc.)
   - Change nameservers to the ones Cloudflare provides
   - Wait 24 hours for DNS propagation (usually faster)

## Step 4: Enable Web Analytics (Optional but Recommended)

1. In Cloudflare dashboard, go to "Web Analytics"
2. Click "Add a site"
3. Enter: `dstack.info`
4. Copy the analytics script snippet
5. Add to `index.html` before `</head>`:

```html
<!-- Cloudflare Web Analytics -->
<script defer src='https://static.cloudflare.com/beacon.min.js'
        data-cf-beacon='{"token": "YOUR-TOKEN-HERE"}'></script>
```

6. Commit and push:
```bash
git add index.html
git commit -m "Add Cloudflare Web Analytics"
git push
```

Cloudflare will auto-deploy in 30 seconds.

## Step 5: Verify Deployment

### Check the site loads
- Visit https://dstack.info
- Verify all sections work
- Test on mobile device
- Check navigation links

### Check SSL/HTTPS
- URL should show 🔒 padlock
- Certificate should be valid
- No mixed content warnings

### Check performance
- Test at https://pagespeed.web.dev/
- Should score 90+ on Performance
- Should load in <1 second globally

## Automatic Deployments

**Every time you push to GitHub main branch:**
- Cloudflare automatically deploys in 30-60 seconds
- You'll get email notification
- Can view deployment logs in Cloudflare dashboard

**To deploy changes:**
```bash
# Make changes to index.html or other files
git add .
git commit -m "Update content"
git push

# Cloudflare auto-deploys - no manual action needed
```

## Branch Previews (Free Feature)

**Want to preview changes before going live?**

1. Create a new branch:
```bash
git checkout -b feature/new-section
# Make changes
git add .
git commit -m "Add new section"
git push -u origin feature/new-section
```

2. Cloudflare automatically creates preview URL:
   - Example: `feature-new-section.dstack-info.pages.dev`
   - Test changes before merging
   - Share with team for review

3. Merge to main when ready:
```bash
git checkout main
git merge feature/new-section
git push
# Production site auto-updates
```

## Troubleshooting

### Site not loading after custom domain setup
- **Wait 5 minutes** - SSL certificates take time to provision
- **Check DNS propagation:** https://www.whatsmydns.net/
- **Clear browser cache:** Cmd+Shift+R (Mac) or Ctrl+F5 (Windows)

### Changes not appearing
- Check deployment status in Cloudflare Pages dashboard
- Verify git push succeeded: `git status`
- Check deployment logs for errors
- Clear browser cache

### "Too many redirects" error
- In Cloudflare dashboard, go to SSL/TLS settings
- Set to "Full" or "Full (strict)"
- Wait 5 minutes and try again

### Domain ownership verification fails
- Ensure you have access to domain registrar
- Nameservers can take 24 hours to propagate
- Use `dig dstack.info NS` to check current nameservers

## Performance Optimization

### Already optimized
- ✅ Inline CSS (no external requests)
- ✅ No JavaScript dependencies
- ✅ Responsive images
- ✅ Semantic HTML

### Cloudflare automatic optimizations
- ✅ Brotli compression
- ✅ HTTP/2 and HTTP/3
- ✅ Auto minification (can enable)
- ✅ Global CDN caching

### Enable additional optimizations

1. Go to Cloudflare dashboard > Speed > Optimization
2. Enable:
   - Auto Minify (HTML, CSS, JS)
   - Brotli compression
   - Early Hints
   - HTTP/3 (QUIC)

## Monitoring

### View analytics
- Cloudflare dashboard > Analytics
- See real-time visitors
- Geographic distribution
- Popular pages
- Bandwidth usage

### Set up alerts (Optional)
- Workers & Pages > Notifications
- Get notified of:
  - Deployment failures
  - High traffic spikes
  - Custom events

## Cost Breakdown

**Cloudflare Pages Free Tier:**
- Unlimited bandwidth: $0
- Unlimited requests: $0
- 500 builds/month: $0
- 1 concurrent build: $0
- Free SSL certificates: $0
- Global CDN: $0
- Web Analytics: $0

**Total monthly cost:** $0

**If you exceed free tier:**
- You won't - this static site will never hit limits
- Even with 1M+ visitors/month, still free

## Comparison: Cloudflare vs GitHub Pages

| Feature | Cloudflare Pages | GitHub Pages |
|---------|-----------------|--------------|
| **Bandwidth** | Unlimited | 100GB/month (soft) |
| **Requests** | Unlimited | Throttled if high |
| **CDN** | Global CDN | No built-in CDN |
| **SSL** | Free, automatic | Free, automatic |
| **Build time** | 30-60 seconds | 1-5 minutes |
| **Analytics** | Built-in, free | Need Google Analytics |
| **Custom domains** | Free | Free |
| **Performance** | Excellent | Good |
| **Cost** | $0 forever | $0 (with limits) |

## Next Steps After Deployment

1. **Submit to search engines**
   - Google Search Console: https://search.google.com/search-console
   - Submit sitemap: `https://dstack.info/sitemap.xml`

2. **Set up monitoring**
   - UptimeRobot: Free uptime monitoring
   - Cloudflare Analytics: Built-in traffic stats

3. **Share the launch**
   - Twitter/X announcement
   - Hacker News: https://news.ycombinator.com/submit
   - Reddit: r/rust, r/docker, r/programming
   - GitHub: Update dstack repo README

4. **Start publishing content**
   - Follow THOUGHT_LEADERSHIP_PLAN.md
   - First blog post within 1 week
   - Video tutorial within 2 weeks

## Support

- **Cloudflare Docs:** https://developers.cloudflare.com/pages/
- **Community:** https://community.cloudflare.com/
- **Status:** https://www.cloudflarestatus.com/

---

**Estimated time to live site:** 10 minutes
**Estimated monthly cost:** $0
**Estimated performance score:** 95+/100

Ready to deploy? Start with Step 1 above!

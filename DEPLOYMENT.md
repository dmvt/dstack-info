# Deployment Guide for dstack.info

This guide provides step-by-step instructions for deploying the dstack.info website.

## Prerequisites

- Git installed
- GitHub account (for GitHub Pages deployment)
- Or accounts with Netlify/Vercel (for alternative deployments)

## Quick Deploy: GitHub Pages (Recommended)

### Step 1: Create GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. Name: `dstack-info` (or your preferred name)
3. Make it public
4. Don't initialize with README (we already have files)
5. Click "Create repository"

### Step 2: Push Code to GitHub

```bash
cd /Users/lsdan/dstack/dstack-info

# Initialize git repository
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: dstack.info website"

# Add remote (replace YOUR-USERNAME with your GitHub username or org)
git remote add origin https://github.com/YOUR-USERNAME/dstack-info.git

# Push to main branch
git branch -M main
git push -u origin main
```

### Step 3: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click "Settings" tab
3. Scroll to "Pages" in the left sidebar
4. Under "Source", select:
   - Branch: `main`
   - Folder: `/ (root)`
5. Click "Save"

Your site will be available at: `https://YOUR-USERNAME.github.io/dstack-info/`

### Step 4: Configure Custom Domain (dstack.info)

#### DNS Configuration

If you own the domain `dstack.info`, configure your DNS provider:

**Option A: Using A Records (Apex Domain)**
```
Type: A
Name: @
Value: 185.199.108.153

Type: A
Name: @
Value: 185.199.109.153

Type: A
Name: @
Value: 185.199.110.153

Type: A
Name: @
Value: 185.199.111.153
```

**Option B: Using CNAME (Subdomain)**
```
Type: CNAME
Name: www
Value: YOUR-USERNAME.github.io
```

#### GitHub Configuration

1. In repository Settings > Pages
2. Under "Custom domain", enter: `dstack.info`
3. Click "Save"
4. Wait for DNS check to complete
5. Check "Enforce HTTPS" once available

## Alternative: Netlify Deploy

### Quick Deploy

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy site
cd /Users/lsdan/dstack/dstack-info
netlify deploy --prod --dir .
```

### Configure Custom Domain

1. Log in to [Netlify](https://app.netlify.com)
2. Go to your site settings
3. Domain settings > Add custom domain
4. Follow DNS configuration instructions

## Alternative: Vercel Deploy

### Quick Deploy

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy site
cd /Users/lsdan/dstack/dstack-info
vercel --prod
```

### Configure Custom Domain

1. Log in to [Vercel](https://vercel.com)
2. Go to your project
3. Settings > Domains
4. Add `dstack.info` and follow instructions

## Alternative: Traditional Web Hosting

If you have access to traditional web hosting (cPanel, FTP, etc.):

1. Upload all files to your web server's public directory:
   - `index.html`
   - `CNAME`
   - `robots.txt`
   - `sitemap.xml`

2. Ensure `index.html` is the default document

3. Configure HTTPS certificate (Let's Encrypt recommended)

## Post-Deployment Checklist

- [ ] Website loads at primary URL
- [ ] All navigation links work
- [ ] External links open in new tabs
- [ ] Mobile responsive design works
- [ ] GitHub, docs, and example links are correct
- [ ] HTTPS is enabled and enforced
- [ ] robots.txt is accessible
- [ ] sitemap.xml is accessible
- [ ] No console errors in browser DevTools

## Adding Analytics (Optional)

### Google Analytics

1. Create GA4 property at [analytics.google.com](https://analytics.google.com)
2. Get your Measurement ID (G-XXXXXXXXXX)
3. Add to `index.html` before `</head>`:

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### Plausible Analytics (Privacy-Friendly)

1. Sign up at [plausible.io](https://plausible.io)
2. Add to `index.html` before `</head>`:

```html
<script defer data-domain="dstack.info" src="https://plausible.io/js/script.js"></script>
```

## SEO Configuration

### Submit to Search Engines

1. **Google Search Console**
   - Go to [search.google.com/search-console](https://search.google.com/search-console)
   - Add property for `dstack.info`
   - Verify ownership (DNS TXT record or file upload)
   - Submit sitemap: `https://dstack.info/sitemap.xml`

2. **Bing Webmaster Tools**
   - Go to [bing.com/webmasters](https://www.bing.com/webmasters)
   - Add site and verify
   - Submit sitemap

### Update sitemap.xml

Edit `sitemap.xml` whenever you update content:
- Change `<lastmod>` dates to current date
- Format: `YYYY-MM-DD`

## Monitoring

### Uptime Monitoring

Set up with services like:
- [UptimeRobot](https://uptimerobot.com) (free)
- [Pingdom](https://www.pingdom.com)
- [StatusCake](https://www.statuscake.com)

### Performance Monitoring

Test with:
- [Google PageSpeed Insights](https://pagespeed.web.dev/)
- [WebPageTest](https://www.webpagetest.org/)
- [GTmetrix](https://gtmetrix.com/)

Target metrics:
- Performance score: >90
- First Contentful Paint: <1s
- Time to Interactive: <2s

## Continuous Deployment

### GitHub Actions (Auto-deploy on push)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./
```

## Maintenance Schedule

### Weekly
- [ ] Check for broken links
- [ ] Monitor analytics traffic
- [ ] Review GitHub Issues/Discussions

### Monthly
- [ ] Update content with new use cases
- [ ] Sync examples section with dstack-examples repo
- [ ] Review and update documentation links
- [ ] Test site performance

### Quarterly
- [ ] Review and update partners/ecosystem section
- [ ] Add new blog posts or case studies
- [ ] Update "Getting Started" with latest best practices
- [ ] Security audit of any third-party scripts

## Troubleshooting

### GitHub Pages not deploying
- Check Settings > Pages for error messages
- Ensure branch is set to `main` and folder to `/ (root)`
- Verify `index.html` exists in repository root
- Check GitHub Actions tab for deployment logs

### Custom domain not working
- Verify DNS propagation: `dig dstack.info` or use [whatsmydns.net](https://www.whatsmydns.net/)
- DNS changes can take 24-48 hours to propagate
- Ensure CNAME file contains only the domain (no http://)
- Check GitHub Pages custom domain configuration

### HTTPS not enabled
- Wait for DNS propagation to complete
- HTTPS can take up to 24 hours after DNS verification
- Try removing and re-adding custom domain in GitHub settings

### Site loads but styling broken
- Check browser console for errors
- Verify all CSS is inline in `index.html`
- Clear browser cache
- Test in incognito/private mode

## Support

For deployment issues:
- GitHub Pages: [docs.github.com/pages](https://docs.github.com/pages)
- Netlify: [docs.netlify.com](https://docs.netlify.com)
- Vercel: [vercel.com/docs](https://vercel.com/docs)

For website content issues:
- Open issue in repository
- Contact via dstack community channels

---

Last updated: October 23, 2025

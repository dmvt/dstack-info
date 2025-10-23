# dstack.info Website

Official website for dstack - the open-source, developer-friendly TEE SDK for deploying confidential applications.

## Overview

This website serves as the primary resource hub for developers and organizations interested in deploying applications to Trusted Execution Environments (TEEs) using dstack.

## Features

- **Responsive Design**: Mobile-first design that works on all devices
- **Modern UI**: Dark theme with purple/blue gradient accents matching Phala branding
- **Comprehensive Content**: Covers what dstack is, use cases, features, examples, and getting started
- **SEO Optimized**: Meta tags and semantic HTML for better search engine visibility
- **Fast Loading**: Single-page design with minimal dependencies
- **Smooth Navigation**: Scroll-based navigation with fixed header

## Sections

1. **Hero**: Eye-catching introduction with clear CTAs
2. **What is dstack**: Technical overview and architecture components
3. **Features**: Key benefits and capabilities
4. **Use Cases**: Real-world applications with partner highlights
5. **Examples**: Showcase of ready-to-deploy example projects
6. **Getting Started**: Quick start guide for developers
7. **Ecosystem**: Community, partners, and backing organizations
8. **Resources**: Links to documentation, GitHub, and more

## Deployment Options

### Option 1: GitHub Pages (Recommended)

```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit: dstack.info website"

# Create GitHub repository at github.com/your-org/dstack-info
git remote add origin https://github.com/your-org/dstack-info.git
git branch -M main
git push -u origin main

# Enable GitHub Pages
# Go to Settings > Pages > Source: main branch / root
# Your site will be live at https://your-org.github.io/dstack-info/
```

### Option 2: Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy to Netlify
netlify deploy --prod
```

### Option 3: Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to Vercel
vercel --prod
```

### Option 4: Custom Server

Simply upload `index.html` to any web server. No build process required.

## Custom Domain Setup

### For GitHub Pages with Custom Domain

1. Add a `CNAME` file with your domain:
   ```bash
   echo "dstack.info" > CNAME
   ```

2. Configure DNS:
   - Add A records pointing to GitHub Pages IPs:
     ```
     185.199.108.153
     185.199.109.153
     185.199.110.153
     185.199.111.153
     ```
   - Or add a CNAME record pointing to `your-org.github.io`

3. Enable HTTPS in repository Settings > Pages

### For Netlify/Vercel

Follow the platform-specific custom domain instructions in their dashboards.

## Customization

### Colors

Edit CSS custom properties in the `:root` selector:

```css
:root {
    --primary-purple: #8B5CF6;
    --primary-blue: #3B82F6;
    --dark-bg: #0F0F1E;
    /* ... more colors */
}
```

### Content

All content is in `index.html`. Search for section IDs to locate specific areas:
- `#what-is` - Overview section
- `#features` - Features grid
- `#use-cases` - Use cases section
- `#examples` - Examples showcase
- `#getting-started` - Quick start guide
- `#ecosystem` - Partners and community
- `#resources` - Links and documentation

### Adding Sections

Follow the existing pattern:

```html
<section id="new-section">
    <h2>Section Title</h2>
    <p class="section-subtitle">Subtitle text</p>

    <!-- Your content here -->
</section>
```

## Analytics Setup (Optional)

Add Google Analytics or Plausible to track visitors:

```html
<!-- Add before </head> -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## Performance

Current website is optimized for performance:
- ✅ No external dependencies
- ✅ Minimal JavaScript
- ✅ Inline CSS
- ✅ Semantic HTML
- ✅ Mobile-first responsive design

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Maintenance

### Regular Updates

1. **Content Updates**: Edit `index.html` directly for content changes
2. **Examples**: Keep examples section in sync with [dstack-examples](https://github.com/Dstack-TEE/dstack-examples) repository
3. **Use Cases**: Add new partners and applications as they emerge
4. **Links**: Verify all external links periodically

### SEO Maintenance

- Update meta description and keywords as features evolve
- Add structured data (JSON-LD) for better search visibility
- Monitor Google Search Console for indexing issues
- Update sitemap if adding multiple pages

## Contributing

To suggest improvements:

1. Fork the repository
2. Make your changes
3. Test locally by opening `index.html` in a browser
4. Submit a pull request

## License

This website is licensed under Apache 2.0, consistent with the dstack project.

## Contact

For questions or support:
- GitHub Issues: [dstack-TEE/dstack](https://github.com/Dstack-TEE/dstack/issues)
- Documentation: [docs.phala.com/dstack](https://docs.phala.com/dstack/overview)

---

Built with ❤️ for the dstack community

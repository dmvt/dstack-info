# dstack Tutorial Platform - Architecture Decision Document

**Date:** 2025-10-31
**Status:** Proposed
**Decision:** Use Astro + TailwindCSS for tutorial platform

---

## Context and Problem Statement

We need to modernize the dstack.info website to support an interactive tutorial system that:

1. **Presents content-heavy tutorials** with step-by-step instructions
2. **Includes interactive components** for validation, code copying, progress tracking
3. **Is maintainable** by future contributors (Linux Foundation project)
4. **Deploys seamlessly** to Cloudflare Pages
5. **Performs excellently** with fast load times and good SEO
6. **Integrates TailwindCSS** for easy theming and maintenance
7. **Scales** to handle 20+ comprehensive tutorials

---

## Decision Drivers

- **Content-first approach**: Tutorials are primarily text, code blocks, and instructions
- **Selective interactivity**: Only certain components need JavaScript (validation widgets, copy buttons, progress tracking)
- **Performance**: Fast page loads are critical for developer experience
- **SEO**: Tutorials must be discoverable via search engines
- **Developer experience**: Easy for future contributors to add new tutorials
- **Maintainability**: Clear separation of concerns, standard patterns
- **Linux Foundation standards**: Professional, production-ready codebase
- **Deployment target**: Cloudflare Pages

---

## Considered Options

### Option 1: Astro + TailwindCSS ⭐ **RECOMMENDED**

**What is Astro?**
Astro is a modern "content-first" web framework designed specifically for content-heavy sites. It uses an Islands Architecture where interactive UI components are automatically hydrated only when needed.

**Pros:**
- ✅ **Zero JavaScript by default**: Ships only HTML/CSS, adds JS only for interactive components
- ✅ **Islands Architecture**: Interactive widgets (validation, copy buttons) hydrate independently
- ✅ **Content focus**: Perfect for tutorial content with markdown support
- ✅ **Framework agnostic**: Can use React, Vue, Svelte, or vanilla components as needed
- ✅ **Excellent performance**: Minimal bundle size, fast page loads
- ✅ **Great SEO**: Full static site generation with excellent crawlability
- ✅ **TailwindCSS integration**: One command (`npx astro add tailwind`)
- ✅ **Cloudflare Pages support**: First-class deployment support
- ✅ **Developer experience**: Intuitive file-based routing, excellent documentation
- ✅ **Component reusability**: Build tutorial components once, reuse everywhere
- ✅ **Growing ecosystem**: Backed by large community, used by major projects

**Cons:**
- ⚠️ Relatively newer than React/Vue (though mature and stable)
- ⚠️ Smaller community than Next.js (but growing rapidly)

**Key Features for Our Use Case:**
- **Content Collections**: Manage tutorials as structured content with frontmatter
- **Markdown/MDX**: Write tutorials in markdown with embedded components
- **Partial Hydration**: Only validation widgets load JavaScript, rest is static
- **Component Islands**: Each interactive element (copy button, validator) hydrates independently
- **TypeScript support**: Type-safe development
- **Hot Module Replacement**: Fast development iteration

**Example Tutorial Structure:**
```
src/
├── content/
│   └── tutorials/
│       ├── 01-prerequisites.md
│       ├── 02-host-setup.md
│       └── ...
├── components/
│   ├── CodeBlock.astro          (copy button functionality)
│   ├── ValidationStep.astro     (interactive validation)
│   ├── ProgressTracker.astro    (tutorial progress)
│   └── TutorialLayout.astro     (consistent layout)
└── pages/
    └── tutorial/
        └── [slug].astro         (dynamic tutorial pages)
```

**Deployment:**
```bash
npm run build  # Generates static site in dist/
# Deploy to Cloudflare Pages
```

---

### Option 2: Next.js (React) + TailwindCSS

**What is Next.js?**
The most popular React framework, backed by Vercel, offering server-side rendering and static site generation.

**Pros:**
- ✅ Most popular framework with huge ecosystem
- ✅ Excellent TailwindCSS integration
- ✅ Strong TypeScript support
- ✅ Large community and extensive documentation
- ✅ Enterprise adoption (Netflix, TikTok, Hulu)
- ✅ Cloudflare Pages support

**Cons:**
- ❌ **React overhead**: Ships React runtime even for static content
- ❌ **Over-engineered for our use case**: Built for full web applications, not content sites
- ❌ **Larger bundle sizes**: More JavaScript than necessary for tutorial content
- ❌ **Complexity**: More moving parts than needed
- ❌ **Learning curve**: Steeper for contributors unfamiliar with React

**Why Not Next.js:**
While Next.js is excellent for web applications, it's overkill for a content-focused tutorial site. We don't need server-side rendering or the React ecosystem for primarily static tutorial content.

---

### Option 3: SvelteKit + TailwindCSS

**What is SvelteKit?**
Full-stack framework for Svelte, known for small bundle sizes and excellent developer experience.

**Pros:**
- ✅ Excellent performance with minimal bundle sizes
- ✅ Great developer experience
- ✅ Simple, easy to learn syntax
- ✅ Built-in TailwindCSS support
- ✅ Fast build times
- ✅ Cloudflare Pages support

**Cons:**
- ⚠️ **Smaller ecosystem** than React/Vue
- ⚠️ **Less widespread adoption** in enterprise
- ⚠️ **All-or-nothing**: Requires Svelte for everything
- ⚠️ Not as content-optimized as Astro

**Why Not SvelteKit:**
While SvelteKit has excellent performance, it's not specifically optimized for content-heavy sites. Astro's Islands Architecture is superior for our mix of static content and selective interactivity.

---

### Option 4: VitePress or Docusaurus

**What are they?**
Static site generators specifically designed for documentation.

**Pros:**
- ✅ Purpose-built for documentation
- ✅ Markdown-first
- ✅ Good performance
- ✅ Easy to use

**Cons:**
- ❌ **Limited customization**: Opinionated structure hard to break from
- ❌ **Interactive limitations**: Not designed for complex interactive components
- ❌ **Less flexible**: Our tutorials need custom validation, progress tracking, deployment wizards
- ❌ **Styling constraints**: TailwindCSS integration not as seamless

**Why Not VitePress/Docusaurus:**
These are great for standard documentation but lack the flexibility needed for our interactive tutorial platform with custom validation widgets and deployment interfaces.

---

### Option 5: Keep Vanilla HTML/CSS/JS + TailwindCSS

**Pros:**
- ✅ Simple, no build step (could add PostCSS for Tailwind)
- ✅ No framework overhead
- ✅ Easy to understand

**Cons:**
- ❌ **No component reusability**: Copy-paste code across 20+ tutorials
- ❌ **Hard to maintain**: Changes require updating every HTML file
- ❌ **No type safety**: JavaScript errors only caught at runtime
- ❌ **Manual routing**: Managing 20+ tutorial pages manually
- ❌ **State management**: Complex without framework
- ❌ **Not scalable**: Doesn't meet Linux Foundation maintainability standards

**Why Not Vanilla:**
While simple initially, this approach doesn't scale for the 20+ tutorials we're building. Component reusability and maintainability are critical for this project's success.

---

## Astro Theme vs TailwindCSS from Scratch

### Understanding Astro Themes

Astro has an ecosystem of **pre-built themes** that are essentially starter templates. Most popular themes are **already built with TailwindCSS**. Key options:

**1. Astro Starlight (Official Documentation Theme)**
- Purpose-built for documentation sites
- Features: Site navigation, search, i18n, SEO, code highlighting, dark mode
- Supports Markdown/MDX with TypeScript frontmatter
- Framework-agnostic, can add React/Vue/Svelte components

**Pros:**
- ✅ Production-ready documentation foundation
- ✅ Professional out-of-the-box design
- ✅ Pre-built search, navigation, i18n
- ✅ Maintained by Astro team
- ✅ Can customize with TailwindCSS

**Cons:**
- ❌ Optimized for *reference documentation*, not *interactive tutorials*
- ❌ No built-in progress tracking or validation components
- ❌ May require fighting against opinionated structure
- ❌ Extra complexity for features we won't use
- ❌ Harder to achieve fully custom design

**2. Third-Party Themes (AstroWind, Astroship, etc.)**
- Pre-built templates with TailwindCSS included
- Often include CMS integration, animations, SEO
- Save development time for standard sites

**Pros:**
- ✅ Skip basic setup time
- ✅ Professional designs included

**Cons:**
- ❌ Built for generic use cases, not our specific needs
- ❌ Includes features we don't need (blog, e-commerce, etc.)
- ❌ Customization may be harder than building from scratch
- ❌ Not designed for interactive tutorials

### Building from Scratch with Astro + TailwindCSS

Start with clean Astro project and build exactly what we need.

**Pros:**
- ✅ **Full control** over every component and feature
- ✅ **No bloat** - only code we actually need
- ✅ **Easier to understand** for future contributors
- ✅ **Custom-designed** for our unique workflow (manual + Ansible parallel docs)
- ✅ **Purpose-built components** for validation, progress tracking, deployment dashboard
- ✅ **Cleaner codebase** - no unused theme features
- ✅ **TailwindCSS from day 1** with our exact design system
- ✅ **Aligns with Linux Foundation** maintainability goals

**Cons:**
- ⚠️ Takes more initial setup time (but ensures long-term maintainability)
- ⚠️ Need to build navigation, search, etc. from scratch (but customized to our needs)

### Why Build from Scratch is Better for Our Project

Our requirements are **unique and specialized**:

1. **Parallel Documentation Pattern** - Manual steps + Ansible automation side-by-side
2. **Interactive Validation** - DNS checker, service health monitors, attestation verifiers
3. **Progress Tracking** - Tutorial completion state across 20+ guides
4. **Deployment Dashboard** - Custom UI for application deployment
5. **Testing Checkpoints** - Integrated multi-user verification workflows
6. **Custom Component Library** - Specialized for infrastructure tutorials

**Standard documentation themes are built for:**
- API reference documentation
- Static how-to guides
- Product documentation
- Content-heavy reference material

**Our tutorials are fundamentally different:**
- Step-by-step infrastructure deployment
- Real-time validation and verification
- Interactive command execution
- Progress persistence
- Multi-approach documentation (manual vs automated)

### Recommendation: Astro + TailwindCSS from Scratch

**Reasoning:**
1. **Our use case is too specialized** for generic documentation themes
2. **Customizing Starlight would be harder** than building from scratch
3. **Clean codebase is critical** for Linux Foundation maintainability
4. **We need full control** over interactive components
5. **TailwindCSS gives us all the benefits** of themes (utility classes, design system) without the constraints
6. **Build time difference is minimal** compared to long-term maintenance benefits

**TailwindCSS provides theme-like benefits:**
- Component libraries (Flowbite, DaisyUI, shadcn/ui) available if needed
- Design system via tailwind.config.js (our colors, spacing, typography)
- Utility-first approach makes styling consistent and fast
- Easy to maintain and modify
- Well-documented and widely understood

---

## Decision: Astro + TailwindCSS (From Scratch)

### Why This is the Best Choice

**1. Perfect for Our Content-Heavy Use Case**
- Tutorials are 90% content, 10% interactivity
- Astro ships zero JavaScript for content, only loads it for interactive components
- Islands Architecture means validation widgets load independently

**2. Performance and SEO**
- Static HTML generation for fastest possible load times
- Full SEO support with meta tags, sitemaps, etc.
- Critical for tutorial discoverability

**3. Developer Experience and Maintainability**
- Intuitive file structure and routing
- Markdown-first with component embedding
- Easy for new contributors to add tutorials
- TypeScript support for catching errors early

**4. Framework Flexibility**
- Can use Svelte components for complex interactive widgets
- Can use React if needed for specific features
- Not locked into one ecosystem

**5. TailwindCSS Integration**
- One command setup: `npx astro add tailwind`
- Full utility class support in .astro, .svelte, .jsx files
- Easy theming with Tailwind config

**6. Cloudflare Pages Deployment**
- First-class support with framework preset
- Static output works perfectly
- Fast deployments

**7. Linux Foundation Standards**
- Modern, professional codebase
- Well-documented framework with long-term support
- Used by major projects (Netlify, Vercel, Firebase docs)

---

## Implementation Plan

### Phase 1: Initial Setup
```bash
npm create astro@latest
npm install
npx astro add tailwind
npx astro add sitemap
```

### Phase 2: Design System
Create TailwindCSS config with dstack brand colors:
```javascript
// tailwind.config.mjs
export default {
  theme: {
    extend: {
      colors: {
        'lime-green': '#C4F142',
        'cyber-blue': '#42C4F1',
        'cyber-purple': '#4F42F1',
        'bg-space': '#0A0B0F',
        'bg-deep': '#12131A',
        'bg-card': '#16171C',
      }
    }
  }
}
```

### Phase 3: Component Library
Build reusable tutorial components:
- `CodeBlock.astro` - Syntax highlighting + copy button
- `ValidationStep.astro` - Interactive step validation
- `ProgressTracker.astro` - Tutorial completion tracking
- `TutorialNav.astro` - Step navigation
- `CommandOutput.astro` - Terminal output display

### Phase 4: Content Structure
Organize tutorials as content collections:
```typescript
// src/content/config.ts
import { defineCollection, z } from 'astro:content';

const tutorialsCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string(),
    order: z.number(),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
    estimatedTime: z.string(),
    prerequisites: z.array(z.string()),
  })
});
```

### Phase 5: Interactive Islands
Add Svelte components for complex interactivity:
- `DNSValidator.svelte` - Check DNS configuration
- `ServiceHealthCheck.svelte` - Verify service status
- `AttestationVerifier.svelte` - Validate TDX quotes
- `DeploymentDashboard.svelte` - UI deployment interface

---

## Technical Stack Summary

| Layer | Technology | Purpose |
|-------|------------|---------|
| Framework | **Astro 4.x** | Static site generation + Islands |
| Styling | **TailwindCSS 3.x** | Utility-first CSS |
| Interactive Components | **Svelte** (via Astro integration) | Validation widgets, dashboards |
| Content | **Markdown/MDX** | Tutorial writing |
| Type Safety | **TypeScript** | Development quality |
| Package Manager | **npm** | Dependency management |
| Build Tool | **Vite** (built into Astro) | Fast builds and HMR |
| Deployment | **Cloudflare Pages** | Edge hosting |
| Version Control | **Git** | Source control with signed commits |

---

## Risks and Mitigations

### Risk 1: Team Unfamiliar with Astro
**Mitigation:**
- Astro syntax is simple and similar to HTML
- Excellent documentation at docs.astro.build
- Large community for support
- Gentle learning curve

### Risk 2: Framework Longevity
**Mitigation:**
- Astro backed by major companies and VC funding
- Growing adoption (used by Firebase, Netlify docs)
- Active development and community
- Can migrate to static HTML if needed (Astro generates standard HTML)

### Risk 3: Complex Interactive Features
**Mitigation:**
- Can integrate React/Vue/Svelte components as needed
- Not locked into Astro's component system
- Full JavaScript support for custom features

---

## Success Metrics

After implementation, we should achieve:

- ✅ **Performance**: Lighthouse score > 95
- ✅ **Build time**: < 30 seconds for full site
- ✅ **Bundle size**: < 50kb JavaScript for typical tutorial page
- ✅ **Maintainability**: New tutorial added in < 30 minutes
- ✅ **Component reuse**: 80%+ code shared across tutorials
- ✅ **Type safety**: 100% TypeScript coverage
- ✅ **Mobile responsive**: Perfect rendering on all devices
- ✅ **SEO**: All tutorials indexed within 1 week

---

## Recommendation

**I recommend proceeding with Astro + TailwindCSS for the following reasons:**

1. **Best fit for content-heavy tutorials** with selective interactivity
2. **Superior performance** compared to alternatives
3. **Excellent maintainability** for future Linux Foundation contributors
4. **Modern developer experience** with great tooling
5. **Flexible enough** to handle complex interactive components
6. **Production-ready** with proven track record
7. **Perfect TailwindCSS integration** for easy theming
8. **Cloudflare Pages optimized** for seamless deployment

This architecture will serve the dstack project well as it grows and potentially becomes the official Linux Foundation dstack website.

---

## References

- [Astro Documentation](https://docs.astro.build/)
- [Astro vs Next.js vs SvelteKit Comparison](https://medium.com/better-dev-nextjs-react/next-js-vs-remix-vs-astro-vs-sveltekit-the-2025-showdown-9ee0fe140033)
- [Cloudflare Pages Framework Support](https://developers.cloudflare.com/pages/framework-guides/)
- [TailwindCSS with Astro](https://docs.astro.build/en/guides/integrations-guide/tailwind/)
- [Linux Foundation React Foundation Announcement](https://www.linuxfoundation.org)

---

**Next Steps:** Await approval to proceed with Astro setup.

# dstack Installation Tutorial Project - Complete Plan

**Project Start Date:** 2025-10-31
**Status:** Phase 1.1 - TDX Enablement Complete, Ansible Verification In Progress
**Last Updated:** 2025-11-01

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Core Principles & Methodology](#core-principles--methodology)
3. [Single System Testing Strategy](#single-system-testing-strategy)
4. [Server Information](#server-information)
5. [Technology Decisions](#technology-decisions)
6. [Detailed Phase Plan](#detailed-phase-plan)
7. [Deliverables Summary](#deliverables-summary)
8. [Current Status](#current-status)

---

## Project Overview

### Goal
Create an exhaustive, production-quality installation tutorial system for dstack that covers:
- Complete installation from bare metal to production deployment
- All dstack components (VMM, KMS, Gateway, Guest Agent)
- 14 example applications from dstack-examples repository
- Ansible automation for complete infrastructure-as-code approach
- Interactive web-based tutorial platform with validation
- Custom UI for deployment management

### Key Characteristics
- **Dual approach**: Every step works both manually (SSH) and via Ansible
- **Verification-focused**: Multiple test users verify each step works
- **Interactive platform**: Web-based with validation widgets and progress tracking
- **Production-ready**: Built to Linux Foundation standards for maintainability
- **Exhaustive documentation**: Every decision, error, and solution documented

### Project Scope
- 20+ comprehensive tutorial sections
- Complete Ansible automation (roles + playbooks)
- Interactive web platform (Astro + TailwindCSS)
- UI deployment dashboard
- 30+ git commits (all signed, deployed to Cloudflare Pages)
- 30+ review checkpoints with testing plans

---

## Core Principles & Methodology

### Absolute Requirements

#### 1. **NO SHORTCUTS**
- If TDX hardware not available: STOP and ask for help
- If configuration doesn't work: Debug and document, never simulate
- If service fails: Fix it properly, never skip
- Users must get real, working deployments from these tutorials

#### 2. **Dual Approach - Manual + Ansible**
- **Phase 1 Exception:** Manual tutorials + Ansible **verification** only (BIOS changes cannot be automated)
- **Phase 2+:** Every step must work via SSH (manual commands) AND via Ansible (automation)
- Ansible playbooks built DURING tutorial writing, not after
- By end of each tutorial section, both approaches are complete and tested
- Single-system testing: Rebuild OS between phases to validate equivalence

#### 3. **Single-System Testing with OS Rebuilds**
- We have one TDX-capable server (173.231.234.133)
- Testing validation via OS reinstalls between phases (self-service via OpenMetal IPMI)
- **First pass:** Fresh OS → Ansible speedrun previous phases → Manual execution current phase
- **Second pass:** Fresh OS → Ansible speedrun all phases (including current) → Verify equivalence
- Compare results: Manual vs Ansible end states must be identical
- Document any discrepancies immediately

#### 4. **Self-Service OS Reinstallation**
- OpenMetal provides IPMI access via Central Dashboard
- HTML5 web console for remote server management
- Mount ISO files and reinstall Ubuntu 24.04 LTS as needed
- No support ticket required - completely self-service
- Used for per-phase validation testing (rebuild → test equivalence)

#### 5. **Git Best Practices**
- Commit early and often (after each logical step)
- All commits MUST be GPG signed
- NO AI attribution in commits (no "Co-Authored-By: Claude")
- Commit messages focus on what changed and why
- Every commit deployed to Cloudflare Pages for review

#### 6. **Checkpoint-Driven Development**
- After EVERY commit: Deploy to Cloudflare Pages
- Present complete testing plan for review
- Wait for explicit approval before proceeding
- Update TUTORIAL_PROGRESS.md after each confirmation to preserve context

#### 7. **Small, Manageable Chunks**
- Work sized to fit in single context window
- Never try to do too much at once
- Break large tasks into smaller sub-tasks
- Each chunk must be completable and testable

#### 8. **Documentation First**
- Document what we're doing WHILE doing it
- Capture errors and solutions immediately
- Add troubleshooting sections based on real issues encountered
- Memory document (TUTORIAL_PROGRESS.md) updated after every approval

#### 9. **Linux Foundation Standards**
- Production-quality code
- Clear, maintainable architecture
- Comprehensive documentation
- Built for future contributors
- Professional design and UX

#### 10. **Plan Adherence & Verification**
- Before starting any work: Verify it matches the current phase in PROJECT_PLAN.md
- If user requests work outside the plan or methodology: STOP and inform them
- Clearly state what conflicts with the plan/methodology
- Ask for explicit double confirmation before proceeding with out-of-plan work
- Never silently deviate from the documented plan
- If uncertain whether request aligns with plan: Ask for clarification

#### 11. **TailwindCSS-Only Styling**
- ALL styling must use TailwindCSS utility classes in the HTML/JSX
- NEVER use custom `<style>` blocks or inline styles for layout, spacing, colors, typography
- Only exception: Truly unique CSS that TailwindCSS cannot handle (rare)
- Custom fonts should be defined in global.css @theme, then used via Tailwind utilities
- Component-specific styles defeat the purpose of using a utility-first framework
- Easier to maintain, more consistent, better for future contributors

### Working Methodology

#### **Phase 1: TDX Enablement (Manual + Verification Only)**

**For Phase 1 Sections:**

1. **Manual Tutorials Already Complete** - TDX hardware through troubleshooting
2. **Build Ansible Verification** - Create playbook that verifies TDX is fully enabled
3. **Playbook Should:**
   - Check TDX status (enabled/disabled)
   - Provide helpful error messages if not enabled
   - Reference specific tutorial sections for fixing issues
   - Exit gracefully with actionable guidance
4. **Document in Tutorial** - Add Ansible verification playbook usage to `tdx-status-verification.md`
5. **Git Commit** - Commit Ansible playbook + updated tutorial (signed)
6. **Deploy** - Build and deploy to Cloudflare Pages (manual: `wrangler pages deploy dist`)
7. **Checkpoint** - Present testing plan (syntax check, ansible-lint, test on TDX system)
8. **User Approval** - Confirm playbook works correctly
9. **Update Memory** - Add progress to TUTORIAL_PROGRESS.md

**Why Phase 1 is Different:**
- BIOS configuration requires physical/IPMI access (cannot be automated)
- Kernel installation for TDX requires manual steps
- Ansible can only **verify** TDX is enabled, not enable it

---

#### **Phase 2+: Infrastructure Deployment (Manual + Ansible Automation)**

**For Each Phase 2+ Tutorial Section:**

**First Pass - Manual Execution:**
1. **Rebuild System** - Fresh Ubuntu 24.04 via OpenMetal IPMI (self-service)
2. **Speed Through Previous Phases** - Run all previous Ansible playbooks
3. **Execute Manually** - SSH to server, run commands for current phase, document results
4. **Document Tutorial** - Write manual step-by-step instructions with troubleshooting

**Second Pass - Create Ansible Automation:**
5. **Build Ansible** - Create role/playbook for current phase
6. **Test Playbook** - Run ansible-lint, syntax check, dry-run

**Third Pass - Validate Equivalence:**
7. **Rebuild System** - Fresh Ubuntu 24.04 via OpenMetal IPMI
8. **Ansible All Phases** - Run all Ansible playbooks (including current phase)
9. **Verify Equivalence** - Compare manual vs Ansible results:
   - Configuration files (checksums, content)
   - Installed packages (versions)
   - Running services (status, ports)
   - Binary files (checksums)
   - System state (users, permissions, etc.)
10. **Document Both Approaches** - Update tutorial with Ansible instructions

**Finalize and Deploy:**
11. **Create Validation Widget** - Build interactive validation component (if applicable)
12. **Git Commit** - Commit tutorial + Ansible + widget (signed)
13. **Deploy** - Build: `npm run build`, Deploy: `wrangler pages deploy dist --project-name=dstack-info`
14. **Checkpoint** - Present testing plan for user verification
15. **User Approval** - User confirms or requests fixes
16. **Update Memory** - Add progress to TUTORIAL_PROGRESS.md after approval
17. **Proceed** - Move to next section

**Key Principle: Rebuild-Based Validation**
- Single TDX server (173.231.234.133) requires OS reinstalls for testing
- OpenMetal IPMI provides self-service OS reinstallation (no support ticket needed)
- Fresh OS install proves Ansible playbooks work from clean state
- Comparison between manual and Ansible validates equivalence
- Later phases use Ansible to speed through earlier phases (dogfooding our automation)

---

## Single System Testing Strategy

### The Challenge
- We have **one TDX-capable server** (Intel Xeon Gold 6530 @ 173.231.234.133)
- TDX hardware is expensive and rare (cannot easily provision multiple test servers)
- Need to validate that manual steps and Ansible automation produce identical results
- Traditional multi-user testing on same system doesn't prove equivalence

### The Solution: Rebuild-Based Validation

**Self-Service OS Reinstallation via OpenMetal IPMI:**
- OpenMetal provides HTML5 IPMI web console via Central Dashboard
- No support ticket required - completely self-service
- Can mount Ubuntu ISO and reinstall OS remotely
- Process takes approximately 30-60 minutes per reinstall

**Testing Workflow for Phase 2+ (Each Phase):**

```
Phase N Testing Cycle:

┌─────────────────────────────────────────────────────────┐
│ FIRST PASS - Manual Execution                          │
├─────────────────────────────────────────────────────────┤
│ 1. Fresh Ubuntu 24.04 install via IPMI                 │
│ 2. Run Ansible for Phases 1 through N-1 (speedrun)     │
│ 3. Manually execute Phase N steps via SSH              │
│ 4. Document results, create tutorial                   │
│ 5. Create Ansible playbook for Phase N                 │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ SECOND PASS - Ansible Validation                       │
├─────────────────────────────────────────────────────────┤
│ 6. Fresh Ubuntu 24.04 install via IPMI                 │
│ 7. Run Ansible for Phases 1 through N (all phases)     │
│ 8. Compare results: Manual vs Ansible                  │
│    - Config files (checksums, content)                 │
│    - Installed packages (versions)                     │
│    - Running services (status, ports)                  │
│    - Binary files (checksums)                          │
│    - System state (users, permissions)                 │
│ 9. Fix discrepancies, update playbook if needed        │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ FINALIZE - Documentation & Deploy                      │
├─────────────────────────────────────────────────────────┤
│ 10. Update tutorial with both approaches               │
│ 11. Git commit (signed), deploy to Cloudflare          │
│ 12. Checkpoint with user verification                  │
│ 13. Update TUTORIAL_PROGRESS.md                        │
└─────────────────────────────────────────────────────────┘
```

**Benefits of This Approach:**
- ✅ Proves Ansible playbooks work from clean state (catches missing dependencies)
- ✅ Validates exact equivalence between manual and automated approaches
- ✅ Dogfoods our automation (later phases use Ansible to speed through earlier work)
- ✅ Non-destructive (fresh OS each time, no need for "undo" playbooks)
- ✅ Realistic (matches how users actually deploy: manual first, automate later)
- ✅ Sustainable (self-service reinstall makes per-phase testing practical)

**Time Investment:**
- OS reinstall: ~30-60 minutes
- Phase 1 TDX enablement: ~1-2 hours (manual tutorials, cannot automate)
- Phases 2+ speedrun via Ansible: ~5-30 minutes per phase (cumulative)
- **Total per rebuild:** ~2-3 hours for full validation

**When to Rebuild:**
- After **every Phase 2+ section** for most thorough validation
- Rebuilds become faster as Ansible automation accumulates
- Example: Phase 5 testing speedruns Phases 1-4 via Ansible in ~20 minutes

---

## Server Information

### Target Server
- **IP Address:** 173.231.234.133
- **Hardware:** Intel Xeon Gold 6530 (5th Gen Emerald Rapids)
- **TDX Support:** Yes (verified on Intel ARK)
- **SSH Access:** Available
- **Operating System:** Ubuntu 24.04 LTS (Noble)
- **TDX Status:** Enabled (manual tutorials completed)
- **IPMI Access:** OpenMetal Central Dashboard (self-service)

### Domain Configuration
- **Status:** Domain owned, needs Cloudflare configuration
- **Requirement:** Wildcard domain (*.yourdomain.com)
- **DNS Provider:** Cloudflare (for automatic TLS via gateway)
- **Setup Required:** Yes, as part of Phase 1.2

### Blockchain Setup
- **Network:** Sepolia or Holesky testnet
- **Requirement:** Wallet with testnet ETH for KMS deployment
- **Setup Required:** Yes, as part of Phase 1.3

---

## Technology Decisions

### Framework: Astro + TailwindCSS (From Scratch)

**Decision Date:** 2025-10-31
**Status:** Proposed (awaiting approval)

#### Why Astro?
- Content-first framework, perfect for tutorial-heavy site
- Islands Architecture: Zero JavaScript by default, hydrate only interactive components
- Framework-agnostic: Can use Svelte/React/Vue for specific components
- Excellent performance and SEO
- First-class Cloudflare Pages support
- Great developer experience for contributors

#### Why TailwindCSS?
- Utility-first CSS for rapid development
- Design system via configuration (colors, spacing, typography)
- Widely known and documented
- Easy maintenance and modification
- No CSS bloat, only used classes included

#### Why From Scratch (Not Using Astro Theme)?
- Astro Starlight optimized for API/reference docs, not interactive tutorials
- Third-party themes built for generic use cases (blogs, portfolios)
- Our requirements too specialized:
  - Manual + Ansible parallel documentation
  - Interactive validation widgets
  - Progress tracking across 20+ tutorials
  - Deployment dashboard
  - Multi-user testing workflow
- Clean codebase better for Linux Foundation maintainability
- Full control over every component
- No fighting against theme opinions
- No unused features/bloat

#### Technology Stack
| Layer | Technology | Purpose |
|-------|------------|---------|
| Framework | Astro 5.x | Static site generation + Islands |
| Styling | TailwindCSS 4.x | Utility-first CSS |
| Interactive Components | Svelte | Validation widgets, dashboards |
| Content | Markdown/MDX | Tutorial writing |
| Type Safety | TypeScript | Development quality |
| Unit Testing | Vitest | Component/unit testing |
| E2E Testing | Playwright | Browser automation testing |
| Test Environment | happy-dom | Lightweight DOM for unit tests |
| Package Manager | npm | Dependency management |
| Build Tool | Vite | Fast builds and HMR |
| Deployment | Cloudflare Pages | Edge hosting |
| Version Control | Git | Signed commits |

**Testing Philosophy:**
- **Testing Pyramid:** Many unit tests (Vitest)  → Fewer E2E tests (Playwright)
- **Vitest:** Fast unit tests for component rendering, props, logic
- **Playwright:** Browser tests for user interactions, copy buttons, navigation
- **Coverage Target:** >80% unit test coverage, critical paths covered by E2E

**See ARCHITECTURE_DECISION.md for complete rationale**

---

## Detailed Phase Plan

### Phase 0: Website Modernization (Weeks 1-3)

**Timeline Breakdown:**
- Phase 0.1: Framework Decision (1 day)
- Phase 0.2: Project Setup (1-2 days)
- Phase 0.3: Component System + Vitest Testing (7-9 days)
- Phase 0.4: Tutorial Platform (3-4 days)
- Phase 0.5: Homepage Migration (3-4 days)
- Phase 0.6: Playwright E2E Testing (2-3 days)

**Total: ~21 days (3 weeks)**

#### 0.1 Framework & Tooling Decision
**Status:** Awaiting approval on Astro + TailwindCSS

**Deliverable:** ARCHITECTURE_DECISION.md
**Git Commit:** Not yet
**Checkpoint:** Present decision, await approval

---

#### 0.2 Project Setup & Configuration

**What we'll do:**
- Initialize Astro project: `npm create astro@latest`
- Add TailwindCSS: `npx astro add tailwind`
- Configure TailwindCSS with dstack design tokens
- Set up TypeScript configuration
- Configure Cloudflare Pages deployment
- Test build → deploy pipeline

**Ansible:** N/A (website infrastructure only)

**Git Commits:**
1. Initial Astro project setup with package.json
2. Add TailwindCSS with custom dstack theme config
3. Configure Cloudflare Pages (wrangler.toml or pages config)

**Testing Plan for Checkpoint:**
- [ ] Clone repository on fresh machine
- [ ] Run `npm install` successfully
- [ ] Run `npm run dev` - verify dev server starts
- [ ] Run `npm run build` - verify build completes
- [ ] Deploy to Cloudflare Pages - verify deployment succeeds
- [ ] Visit deployed URL - verify skeleton site loads
- [ ] Check TailwindCSS working (add test component with utilities)

**Checkpoint:** Show deployed skeleton site, share URL, await confirmation
**Update:** Add Phase 0.2 completion to TUTORIAL_PROGRESS.md

---

#### 0.3 Component System Development (WITH TESTING)

**Overview:**
Build reusable Astro components with comprehensive testing using Vitest + Container API.

**Testing Strategy:**
- **Framework:** Vitest (unit/component testing)
- **Environment:** happy-dom (lightweight DOM)
- **Approach:** Test-driven development where applicable
- **Coverage:** Component rendering, props, interactions

**Components to Build:**
- `CodeBlock.astro` - Syntax highlighting + copy button
- `StepCard.astro` - Individual tutorial step display
- `ProgressTracker.astro` - Tutorial completion tracking
- `ValidationIndicator.astro` - Step validation checkmark
- `CommandOutput.astro` - Terminal output display
- `CollapsibleSection.astro` - Troubleshooting sections
- `NavigationButtons.astro` - Previous/Next tutorial navigation

**Component Requirements:**
- Use TailwindCSS for styling
- TypeScript for props
- Accessible (ARIA labels, keyboard navigation)
- Mobile responsive
- Dark mode compatible
- Unit tests for each component

---

##### 0.3.0 Setup Vitest Testing Infrastructure

**What we'll do:**
1. Install Vitest dependencies: `vitest`, `happy-dom`, `@vitest/ui`
2. Create `vitest.config.ts` with Astro integration
3. Add test scripts to package.json (test, test:watch, test:ui, test:coverage)
4. Write sample test to verify setup works
5. Configure test directory structure

**Git Commits:**
1. Add Vitest testing infrastructure

**Testing Plan for Checkpoint:**
- [ ] Dependencies installed successfully
- [ ] Vitest config created and valid
- [ ] Test scripts work: `npm test`
- [ ] Sample test passes
- [ ] Test UI accessible: `npm run test:ui`
- [ ] Deploy and verify on Cloudflare Pages

**Checkpoint:** Show Vitest setup working with sample test
**Update:** Add Phase 0.3.0 completion to TUTORIAL_PROGRESS.md

---

##### 0.3.1 CodeBlock Component with Tests

**What we'll build:**
- CodeBlock.astro component
- Tests for CodeBlock rendering
- Tests for props (code, language, title)
- Demo page for visual verification

**Git Commits:**
1. Add CodeBlock component with tests

**Testing Plan for Checkpoint:**
- [ ] Component renders correctly
- [ ] Copy button appears and functions
- [ ] Tests pass: `npm test`
- [ ] Demo page shows CodeBlock examples
- [ ] Deploy and verify on Cloudflare Pages

**Checkpoint:** Show CodeBlock working with passing tests
**Update:** Add Phase 0.3.1 completion to TUTORIAL_PROGRESS.md

---

##### 0.3.2 Step and Progress Components with Tests

**What we'll build:**
- StepCard.astro component
- ProgressTracker.astro component
- Tests for both components
- Demo page updates

**Git Commits:**
1. Add StepCard and ProgressTracker with tests

**Testing Plan for Checkpoint:**
- [ ] StepCard renders with different states
- [ ] ProgressTracker calculates progress correctly
- [ ] Tests pass: `npm test`
- [ ] Demo page shows examples
- [ ] Deploy and verify on Cloudflare Pages

**Checkpoint:** Show step components working with tests
**Update:** Add Phase 0.3.2 completion to TUTORIAL_PROGRESS.md

---

##### 0.3.3 Validation and Output Components with Tests

**What we'll build:**
- ValidationIndicator.astro component
- CommandOutput.astro component
- CollapsibleSection.astro component
- Tests for all components
- Demo page updates

**Git Commits:**
1. Add validation, output, and collapsible components with tests

**Testing Plan for Checkpoint:**
- [ ] ValidationIndicator shows checked/unchecked states
- [ ] CommandOutput displays terminal-style content
- [ ] CollapsibleSection expands/collapses
- [ ] Tests pass: `npm test`
- [ ] Demo page shows examples
- [ ] Deploy and verify on Cloudflare Pages

**Checkpoint:** Show utility components working with tests
**Update:** Add Phase 0.3.3 completion to TUTORIAL_PROGRESS.md

---

##### 0.3.4 Navigation Components with Tests

**What we'll build:**
- NavigationButtons.astro component
- Tests for navigation component
- Demo page updates

**Git Commits:**
1. Add NavigationButtons with tests

**Testing Plan for Checkpoint:**
- [ ] NavigationButtons render with correct links
- [ ] Disabled states work correctly
- [ ] Tests pass: `npm test`
- [ ] Demo page shows examples
- [ ] Deploy and verify on Cloudflare Pages

**Checkpoint:** Show navigation component working with tests
**Update:** Add Phase 0.3.4 completion to TUTORIAL_PROGRESS.md

---

##### 0.3.5 Component Demo Page and Documentation

**What we'll build:**
- Comprehensive component showcase page
- COMPONENTS.md documentation
- Usage examples for each component
- Test coverage report

**Git Commits:**
1. Add comprehensive demo page and component docs

**Testing Plan for Checkpoint:**
- [ ] Demo page shows all components
- [ ] All interactive features work
- [ ] Documentation complete
- [ ] Test coverage >80%
- [ ] Deploy and verify on Cloudflare Pages

**Checkpoint:** Show complete component library with docs
**Update:** Add Phase 0.3.5 completion to TUTORIAL_PROGRESS.md

---

#### 0.4 Tutorial Platform Infrastructure

**What we'll build:**
- Tutorial page layout system
- Content collections configuration for tutorials
- Progress persistence system (localStorage)
- Step validation tracking
- Sidebar navigation for tutorial sections
- Breadcrumb navigation
- Search functionality (basic)

**File Structure:**
```
src/
├── components/          (from 0.3)
├── layouts/
│   ├── BaseLayout.astro
│   ├── TutorialLayout.astro
│   └── ComponentLayout.astro
├── content/
│   ├── config.ts        (Content collections config)
│   └── tutorials/       (Tutorial markdown files)
├── pages/
│   ├── index.astro      (Homepage - Phase 0.5)
│   └── tutorial/
│       └── [...slug].astro
└── utils/
    ├── progress.ts      (Progress tracking logic)
    └── validation.ts    (Validation logic)
```

**Git Commits:**
1. Add tutorial layout system
2. Configure content collections
3. Add progress tracking system
4. Add tutorial navigation and search
5. Create sample tutorial for testing

**Testing Plan for Checkpoint:**
- [ ] Create sample tutorial content
- [ ] Verify tutorial renders correctly
- [ ] Test progress tracking (complete steps, refresh page)
- [ ] Test sidebar navigation
- [ ] Test breadcrumb navigation
- [ ] Test search functionality
- [ ] Deploy and verify on Cloudflare Pages

**Checkpoint:** Show working tutorial with sample content, await confirmation
**Update:** Add Phase 0.4 completion to TUTORIAL_PROGRESS.md

---

#### 0.5 Migrate Existing Homepage

**What we'll do:**
- Recreate current index.html in Astro + TailwindCSS
- Preserve all existing content and functionality
- Improve styling consistency
- Ensure no regressions
- Update navigation to include "Tutorials" link

**Content to Migrate:**
- Hero section with CTAs
- What is dstack section
- Why Choose dstack (feature cards)
- Real-World Applications
- Example Projects
- Get Started in Minutes
- Ecosystem & Community
- Developer Resources
- Footer

**Git Commits:**
1. Migrate hero and navigation
2. Migrate features and use cases sections
3. Migrate examples and resources sections
4. Migrate footer
5. Add responsive design improvements
6. Performance optimization

**Testing Plan for Checkpoint:**
- [ ] Visual comparison: new vs old homepage
- [ ] Verify all links work
- [ ] Test all CTAs (Get Started, GitHub, etc.)
- [ ] Test responsive design (mobile, tablet, desktop)
- [ ] Run Lighthouse performance audit (target >95)
- [ ] Verify SEO tags preserved
- [ ] Test on multiple browsers
- [ ] Deploy and verify on Cloudflare Pages

**Checkpoint:** Side-by-side comparison of old and new homepage, await confirmation
**Update:** Add Phase 0.5 completion to TUTORIAL_PROGRESS.md

---

#### 0.6 End-to-End Testing with Playwright

**Overview:**
Add comprehensive E2E browser testing to complement Vitest unit tests. This phase ensures all user interactions work correctly in real browsers.

**Testing Strategy:**
- **Framework:** Playwright (browser automation)
- **Coverage:** User interactions, copy buttons, navigation, form submissions
- **Browsers:** Chromium, Firefox, WebKit
- **Approach:** Critical user journeys and interactive features

**What we'll do:**
1. Install Playwright and dependencies
2. Configure Playwright for Astro
3. Write E2E tests for interactive components
4. Set up CI/CD integration (optional)
5. Create test documentation

---

##### 0.6.0 Setup Playwright Infrastructure

**What we'll do:**
1. Install Playwright: `npm init playwright@latest`
2. Configure `playwright.config.ts` for Astro
3. Add test scripts to package.json (e2e, e2e:ui, e2e:debug)
4. Write sample E2E test for homepage
5. Configure test artifacts (screenshots, videos)

**Git Commits:**
1. Add Playwright testing infrastructure

**Testing Plan for Checkpoint:**
- [ ] Playwright installed successfully
- [ ] Config created and valid
- [ ] E2E scripts work: `npm run e2e`
- [ ] Sample test passes in all browsers
- [ ] Test UI accessible: `npm run e2e:ui`
- [ ] Deploy and verify on Cloudflare Pages

**Checkpoint:** Show Playwright setup with passing sample test
**Update:** Add Phase 0.6.0 completion to TUTORIAL_PROGRESS.md

---

##### 0.6.1 Component Interaction E2E Tests

**What we'll test:**
- CodeBlock copy button functionality
- Progress tracker state persistence
- Collapsible sections expand/collapse
- Navigation buttons work correctly
- Form interactions (if any)
- Mobile responsiveness

**Git Commits:**
1. Add E2E tests for interactive components

**Testing Plan for Checkpoint:**
- [ ] Copy button test passes (clicks, verifies clipboard)
- [ ] Progress tracking test passes (saves, persists)
- [ ] Collapsible sections test passes
- [ ] Navigation test passes
- [ ] Tests pass in all browsers (Chromium, Firefox, WebKit)
- [ ] Deploy and verify on Cloudflare Pages

**Checkpoint:** Show E2E tests passing in multiple browsers
**Update:** Add Phase 0.6.1 completion to TUTORIAL_PROGRESS.md

---

##### 0.6.2 User Journey E2E Tests

**What we'll test:**
- Complete tutorial navigation flow
- Homepage to tutorial navigation
- Search functionality (when added)
- Cross-page state persistence
- Error handling flows

**Git Commits:**
1. Add user journey E2E tests

**Testing Plan for Checkpoint:**
- [ ] Homepage navigation test passes
- [ ] Tutorial flow test passes
- [ ] State persistence across pages works
- [ ] Tests pass in all browsers
- [ ] Test report generated
- [ ] Deploy and verify on Cloudflare Pages

**Checkpoint:** Show complete user journey tests passing
**Update:** Add Phase 0.6.2 completion to TUTORIAL_PROGRESS.md

---

##### 0.6.3 E2E Test Documentation

**What we'll build:**
- E2E testing documentation (E2E_TESTING.md)
- Usage guide for writing new E2E tests
- Best practices for Playwright with Astro
- CI/CD integration guide (for future)

**Git Commits:**
1. Add E2E testing documentation

**Testing Plan for Checkpoint:**
- [ ] Documentation complete and accurate
- [ ] Examples work correctly
- [ ] All tests still passing
- [ ] Test coverage report available
- [ ] Deploy and verify on Cloudflare Pages

**Checkpoint:** Show complete E2E testing setup with docs
**Update:** Add Phase 0.6.3 completion to TUTORIAL_PROGRESS.md

---

### Phase 1: TDX Enablement & Prerequisites (Week 4)

#### 1.1 TDX Host Setup & Ansible Verification Playbook

**Manual Tutorials (Already Complete):**
- ✅ **Part 1:** TDX Hardware Verification (`tdx-hardware-verification.md`)
- ✅ **Part 2:** TDX BIOS Configuration (`tdx-bios-configuration.md`)
- ✅ **Part 3:** TDX Software Setup (`tdx-software-setup.md`)
- ✅ **Part 4:** TDX Kernel Installation (`tdx-kernel-installation.md`)
- ✅ **Part 5:** TDX Status Verification (`tdx-status-verification.md`)
- ✅ **Part 6:** TDX Troubleshooting & Next Steps (`tdx-troubleshooting-next-steps.md`)

**What we'll build:**

**Ansible Verification Playbook** (`ansible/playbooks/verify-tdx.yml`)

The playbook should:
1. Check if TDX is enabled in BIOS/firmware
2. Check if correct kernel is installed (Ubuntu's TDX-enabled kernel)
3. Check if TDX kernel modules are loaded
4. Check if attestation services are running (if attestation path chosen)
5. Provide helpful error messages referencing specific tutorial sections
6. Exit with appropriate status codes

**Example playbook structure:**
```yaml
---
- name: Verify Intel TDX Host Setup
  hosts: dstack_servers
  become: yes
  tasks:
    - name: Check TDX CPU capability
      shell: grep -q tdx /proc/cpuinfo
      register: tdx_cpu_check
      failed_when: false
      changed_when: false

    - name: Fail if TDX not supported by CPU
      fail:
        msg: |
          TDX not supported by CPU.
          See tutorial: TDX Hardware Verification
          https://dstack.info/tutorial/tdx-hardware-verification
      when: tdx_cpu_check.rc != 0

    - name: Check TDX firmware enablement
      # Check SEAM module, TDX BIOS settings, etc.

    - name: Check TDX kernel modules
      # Verify kvm_intel with tdx=1, tdx modules loaded

    - name: Verify attestation services (if applicable)
      # Check tdx-attest, tdx-qgs services

    - name: Report TDX status
      debug:
        msg: "✓ TDX is fully enabled and ready for use"
```

**Ansible Directory Structure to Create:**
```
ansible/
├── README.md                    # Ansible documentation
├── playbooks/
│   └── verify-tdx.yml          # TDX verification playbook
├── inventory/
│   └── hosts.example.yml       # Example inventory template
└── group_vars/
    └── all.example.yml         # Example variables template
```

**Location:** Keep in dstack-info repo (not separate repo/submodule)

**Git Commits:**
1. Add ansible directory structure with README
2. Add TDX verification playbook with comprehensive checks
3. Update `tdx-status-verification.md` with Ansible playbook documentation

**Testing Plan for Checkpoint:**

**Ansible Best Practices Testing:**
- [ ] **Syntax check:** `ansible-playbook --syntax-check playbooks/verify-tdx.yml`
- [ ] **Ansible-lint:** `ansible-lint playbooks/verify-tdx.yml` (no errors)
- [ ] **Dry-run:** `ansible-playbook --check playbooks/verify-tdx.yml -i inventory/hosts.yml`

**Functional Testing on TDX Server (173.231.234.133):**
- [ ] Run playbook: `ansible-playbook playbooks/verify-tdx.yml -i inventory/hosts.yml`
- [ ] Expected: All checks pass (TDX is enabled)
- [ ] Verify: Exit code 0
- [ ] Verify: Output is clear and helpful

**Error Handling Testing (if possible):**
- [ ] If non-TDX server available: Test playbook fails gracefully
- [ ] Error messages reference specific tutorial sections
- [ ] Exit code non-zero on failure

**Idempotence Testing:**
- [ ] Run playbook twice on same server
- [ ] Expected: Identical results both times
- [ ] Verify: No changes reported on second run (verification only, no modifications)

**Documentation Testing:**
- [ ] Tutorial updated with clear Ansible instructions
- [ ] Example inventory and variables provided
- [ ] Prerequisites documented
- [ ] Build and deploy to Cloudflare Pages
- [ ] Verify tutorial renders correctly

**Tutorial Section:** "Host Setup: Part 5 - TDX Status Verification" (updated with Ansible playbook)

**Checkpoint:**
- Share Ansible playbook code
- Share test results (syntax check, ansible-lint, functional test)
- Demo playbook running on TDX server
- Show updated tutorial with Ansible documentation
- Await confirmation to proceed to Phase 1.2

**Update:** Add Phase 1.1 Ansible completion to TUTORIAL_PROGRESS.md

---

#### 1.2 Domain & DNS Setup

**What we'll do manually:**
1. Log into Cloudflare account
2. Add domain to Cloudflare (if not already)
3. Configure wildcard DNS (*.yourdomain.com → server IP)
4. Create A record: dstack.yourdomain.com → 173.231.234.133
5. Generate Cloudflare API token with DNS edit permissions
6. Create CAA records to restrict certificate issuance
7. Test DNS resolution: `dig test.yourdomain.com`
8. Wait for DNS propagation

**Ansible:** Create `ansible/playbooks/01-verify-dns.yml`
```yaml
- name: Verify DNS Configuration
  hosts: localhost
  tasks:
    - name: Test DNS resolution
      shell: dig +short {{ test_subdomain }}.{{ domain }}
      register: dns_result

    - name: Verify DNS points to correct IP
      assert:
        that: dns_result.stdout == "{{ server_ip }}"
        fail_msg: "DNS not configured correctly"
```

**Ansible Files:**
```
ansible/
├── playbooks/
│   ├── 00-verify-hardware.yml
│   └── 01-verify-dns.yml
└── group_vars/
    └── all.yml  (add domain, server_ip variables)
```

**Git Commits:**
1. Add DNS verification playbook
2. Add interactive DNS checker widget (Svelte component)
3. Add tutorial content for DNS setup
4. Update group_vars with domain configuration

**Testing Plan for Checkpoint:**
- [ ] Manual DNS configuration in Cloudflare complete
- [ ] A record created and verified
- [ ] Wildcard DNS configured
- [ ] CAA records created
- [ ] API token generated and saved securely
- [ ] DNS resolution tested manually: `dig *.yourdomain.com`
- [ ] Ansible playbook verifies DNS
- [ ] Interactive widget validates DNS
- [ ] Test from multiple locations (DNS propagation)
- [ ] Multiple test subdomains resolve correctly
- [ ] Tutorial deployed to Cloudflare Pages

**Tutorial Section:** "Prerequisites: Domain and DNS Configuration"

**Checkpoint:**
- Share domain name configured
- Demo DNS resolution working
- Show interactive DNS checker widget
- Await confirmation

**Update:** Add Phase 1.2 completion and domain info to TUTORIAL_PROGRESS.md

---

#### 1.3 Blockchain Wallet Setup

**What we'll do manually:**
1. Choose testnet: Sepolia or Holesky
2. Create Ethereum wallet (MetaMask, hardware wallet, or CLI)
3. Document wallet address
4. Get testnet ETH from faucet
5. Verify balance
6. Test RPC endpoint connectivity
7. Document RPC URL

**Faucets:**
- Sepolia: https://sepoliafaucet.com/
- Holesky: https://holesky-faucet.pk910.de/

**Ansible:** Create `ansible/playbooks/02-verify-blockchain.yml`
```yaml
- name: Verify Blockchain Configuration
  hosts: localhost
  tasks:
    - name: Check RPC connectivity
      uri:
        url: "{{ blockchain_rpc_url }}"
        method: POST
        body_format: json
        body:
          jsonrpc: "2.0"
          method: eth_blockNumber
          params: []
          id: 1
      register: rpc_result

    - name: Check wallet balance
      shell: |
        cast balance {{ wallet_address }} --rpc-url {{ blockchain_rpc_url }}
      register: balance
```

**Git Commits:**
1. Add blockchain verification playbook
2. Add wallet balance checker widget (Svelte)
3. Add tutorial content for blockchain setup
4. Update group_vars with blockchain configuration

**Testing Plan for Checkpoint:**
- [ ] Wallet created and backed up securely
- [ ] Wallet address documented
- [ ] Testnet ETH received (minimum 0.1 ETH)
- [ ] Balance verified in wallet
- [ ] RPC endpoint responding
- [ ] Manual RPC test: `curl -X POST ...`
- [ ] Ansible playbook verifies connectivity
- [ ] Widget displays wallet balance
- [ ] Tutorial deployed to Cloudflare Pages

**Tutorial Section:** "Prerequisites: Blockchain Setup"

**Checkpoint:**
- Share wallet address (testnet, safe to share)
- Demo wallet balance widget
- Show RPC connectivity
- Await confirmation

**Update:** Add Phase 1.3 completion and blockchain info to TUTORIAL_PROGRESS.md

---

### Phase 2: Core Installation - VMM (Week 5)

#### 2.1 System Baseline & Dependencies

**What we'll do manually:**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install build dependencies
sudo apt install -y \
  build-essential \
  chrpath \
  diffstat \
  lz4 \
  wireguard-tools \
  xorriso \
  git \
  curl

# Verify installations
which gcc
which make
which git
```

**Ansible:** Create `ansible/roles/dstack-host/tasks/dependencies.yml`
```yaml
- name: Update apt cache
  apt:
    update_cache: yes
    cache_valid_time: 3600

- name: Install build dependencies
  apt:
    name:
      - build-essential
      - chrpath
      - diffstat
      - lz4
      - wireguard-tools
      - xorriso
      - git
      - curl
    state: present

- name: Verify installations
  command: which {{ item }}
  loop:
    - gcc
    - make
    - git
  register: verify_deps
```

**Ansible Directory Structure:**
```
ansible/
├── roles/
│   └── dstack-host/
│       ├── tasks/
│       │   ├── main.yml
│       │   └── dependencies.yml
│       ├── defaults/
│       │   └── main.yml
│       └── templates/
```

**Git Commits:**
1. Add dstack-host role structure
2. Add dependencies installation task
3. Add tutorial content for host preparation
4. Update playbooks to use role

**Testing Plan for Checkpoint:**
- [ ] Create user1 on server
- [ ] User1: Manually run all commands from tutorial
- [ ] Verify all dependencies installed for user1
- [ ] Create user2 on server
- [ ] User2: Run Ansible playbook
- [ ] Verify all dependencies installed for user2
- [ ] Compare results: identical package versions
- [ ] Check: `gcc --version`, `make --version`, etc.
- [ ] Tutorial deployed to Cloudflare Pages

**Tutorial Section:** "Step 1: Prepare the Host System"

**Checkpoint:**
- Share test results from user1 (manual) and user2 (Ansible)
- Show all dependencies installed
- Demonstrate commands work for both users
- Await confirmation

**Update:** Add Phase 2.1 completion to TUTORIAL_PROGRESS.md

---

#### 2.2 Rust Toolchain Installation

**What we'll do manually:**
```bash
# Install rustup
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y

# Source environment
source $HOME/.cargo/env

# Verify installation
rustc --version
cargo --version

# Install additional components if needed
rustup component add clippy rustfmt
```

**Ansible:** Add to `ansible/roles/dstack-host/tasks/rust.yml`
```yaml
- name: Download rustup installer
  get_url:
    url: https://sh.rustup.rs
    dest: /tmp/rustup-init.sh
    mode: '0755'

- name: Install Rust
  shell: /tmp/rustup-init.sh -y
  args:
    creates: "{{ ansible_env.HOME }}/.cargo/bin/rustc"

- name: Add cargo to PATH
  lineinfile:
    path: "{{ ansible_env.HOME }}/.bashrc"
    line: 'source $HOME/.cargo/env'
    create: yes

- name: Install Rust components
  shell: |
    source $HOME/.cargo/env
    rustup component add clippy rustfmt
```

**Git Commits:**
1. Add Rust installation task
2. Add Rust verification widget
3. Add tutorial content for Rust setup
4. Update role main.yml to include rust tasks

**Testing Plan for Checkpoint:**
- [ ] Create user3 on server
- [ ] User3: Manual Rust installation from tutorial
- [ ] Verify: `rustc --version` works for user3
- [ ] Verify: `cargo --version` works for user3
- [ ] User3: Compile test program: `cargo new test && cd test && cargo build`
- [ ] Create user4 on server
- [ ] User4: Ansible Rust installation
- [ ] Verify: `rustc --version` works for user4
- [ ] Verify: `cargo --version` works for user4
- [ ] User4: Compile test program
- [ ] Compare Rust versions between users (should be identical)
- [ ] Tutorial deployed to Cloudflare Pages

**Tutorial Section:** "Step 2: Install Rust Toolchain"

**Checkpoint:**
- Share Rust versions from user3 and user4
- Demo test program compilation
- Await confirmation

**Update:** Add Phase 2.2 completion to TUTORIAL_PROGRESS.md

---

#### 2.3 Clone & Build dstack-vmm

**What we'll do manually:**
```bash
# Clone dstack repository
cd ~
git clone https://github.com/Dstack-TEE/dstack.git
cd dstack/vmm

# Build dstack-vmm
cargo build --release

# Verify binary created
ls -lh target/release/vmm
./target/release/vmm --version

# Install to system (optional)
sudo cp target/release/vmm /usr/local/bin/dstack-vmm
```

**Ansible:** Add to `ansible/roles/dstack-host/tasks/build-vmm.yml`
```yaml
- name: Clone dstack repository
  git:
    repo: https://github.com/Dstack-TEE/dstack.git
    dest: "{{ dstack_repo_path }}"
    version: master
    update: yes

- name: Build dstack-vmm
  shell: |
    source $HOME/.cargo/env
    cargo build --release
  args:
    chdir: "{{ dstack_repo_path }}/vmm"
  register: build_result

- name: Install VMM binary
  copy:
    src: "{{ dstack_repo_path }}/vmm/target/release/vmm"
    dest: /usr/local/bin/dstack-vmm
    mode: '0755'
    remote_src: yes
  become: yes
```

**Git Commits:**
1. Add VMM build task
2. Add build timer and progress widget
3. Add tutorial content for building VMM
4. Update role defaults with repo path

**Testing Plan for Checkpoint:**
- [ ] Create user5 on server
- [ ] User5: Manual clone and build (document build time)
- [ ] Verify binary exists: `ls ~/dstack/vmm/target/release/vmm`
- [ ] Verify binary works: `~/dstack/vmm/target/release/vmm --version`
- [ ] Check binary size
- [ ] Create user6 on server
- [ ] User6: Ansible build (document build time)
- [ ] Verify binary exists in same location
- [ ] Compare build times (should be similar)
- [ ] Compare binary checksums (should be identical)
- [ ] Tutorial deployed to Cloudflare Pages

**Tutorial Section:** "Step 3: Build dstack-vmm"

**Checkpoint:**
- Share build times and binary info
- Compare manual vs Ansible results
- Await confirmation

**Update:** Add Phase 2.3 completion to TUTORIAL_PROGRESS.md

---

#### 2.4 VMM Configuration

**What we'll do manually:**
```bash
# Create config directory
sudo mkdir -p /etc/dstack

# Create vmm.toml
sudo tee /etc/dstack/vmm.toml > /dev/null <<EOF
[vmm]
api_port = 8090
storage_path = "/var/lib/dstack"
log_level = "info"

[network]
# Network configuration
EOF

# Verify configuration syntax
# (manual review of file)
cat /etc/dstack/vmm.toml
```

**Ansible:** Add `ansible/roles/dstack-host/templates/vmm.toml.j2`
```jinja2
[vmm]
api_port = {{ vmm_api_port }}
storage_path = "{{ vmm_storage_path }}"
log_level = "{{ vmm_log_level }}"

[network]
# Network configuration
```

Add to `ansible/roles/dstack-host/tasks/configure-vmm.yml`:
```yaml
- name: Create dstack config directory
  file:
    path: /etc/dstack
    state: directory
    mode: '0755'
  become: yes

- name: Deploy VMM configuration
  template:
    src: vmm.toml.j2
    dest: /etc/dstack/vmm.toml
    mode: '0644'
  become: yes

- name: Create storage directory
  file:
    path: "{{ vmm_storage_path }}"
    state: directory
    mode: '0755'
  become: yes
```

**Git Commits:**
1. Add vmm.toml template
2. Add VMM configuration task
3. Add config validation widget
4. Add tutorial content for VMM configuration

**Testing Plan for Checkpoint:**
- [ ] Create user7 on server
- [ ] User7: Manual config file creation from tutorial
- [ ] Verify file exists: `/etc/dstack/vmm.toml`
- [ ] Verify permissions correct
- [ ] Verify storage directory created
- [ ] Create user8 on server
- [ ] User8: Ansible config deployment
- [ ] Verify file exists with same content
- [ ] Compare configs: `diff` should show no differences
- [ ] Validate config syntax
- [ ] Tutorial deployed to Cloudflare Pages

**Tutorial Section:** "Step 4: Configure dstack-vmm"

**Checkpoint:**
- Share config file contents
- Demo config validation
- Await confirmation

**Update:** Add Phase 2.4 completion to TUTORIAL_PROGRESS.md

---

#### 2.5 VMM Service Setup

**What we'll do manually:**
```bash
# Create systemd service file
sudo tee /etc/systemd/system/dstack-vmm.service > /dev/null <<EOF
[Unit]
Description=dstack Virtual Machine Monitor
After=network.target

[Service]
Type=simple
User=root
ExecStart=/usr/local/bin/dstack-vmm --config /etc/dstack/vmm.toml
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd
sudo systemctl daemon-reload

# Enable and start service
sudo systemctl enable dstack-vmm
sudo systemctl start dstack-vmm

# Check status
sudo systemctl status dstack-vmm

# Test API
curl http://localhost:8090/health
```

**Ansible:** Add `ansible/roles/dstack-host/templates/dstack-vmm.service.j2`
```jinja2
[Unit]
Description=dstack Virtual Machine Monitor
After=network.target

[Service]
Type=simple
User=root
ExecStart=/usr/local/bin/dstack-vmm --config /etc/dstack/vmm.toml
Restart=always

[Install]
WantedBy=multi-user.target
```

Add to `ansible/roles/dstack-host/tasks/vmm-service.yml`:
```yaml
- name: Deploy VMM systemd service
  template:
    src: dstack-vmm.service.j2
    dest: /etc/systemd/system/dstack-vmm.service
    mode: '0644'
  become: yes

- name: Reload systemd
  systemd:
    daemon_reload: yes
  become: yes

- name: Enable and start VMM service
  systemd:
    name: dstack-vmm
    enabled: yes
    state: started
  become: yes

- name: Wait for VMM API
  uri:
    url: http://localhost:{{ vmm_api_port }}/health
    status_code: 200
  retries: 10
  delay: 5
```

**Git Commits:**
1. Add systemd service template
2. Add VMM service management task
3. Add service status widget
4. Add tutorial content for VMM service

**Testing Plan for Checkpoint:**
- [ ] Create user9 on server
- [ ] User9: Manual service setup from tutorial
- [ ] Verify service file: `/etc/systemd/system/dstack-vmm.service`
- [ ] Verify service enabled: `systemctl is-enabled dstack-vmm`
- [ ] Verify service running: `systemctl status dstack-vmm`
- [ ] Test API: `curl http://localhost:8090/health`
- [ ] Check logs: `journalctl -u dstack-vmm -n 50`
- [ ] Create user10 on server
- [ ] User10: Ansible service setup
- [ ] Verify service running for user10
- [ ] Test API from user10
- [ ] Check logs are clean (no errors)
- [ ] Tutorial deployed to Cloudflare Pages

**Tutorial Section:** "Step 5: Run dstack-vmm as a Service"

**Checkpoint:**
- Share service status output
- Share API health check response
- Share logs showing healthy startup
- Await confirmation

**Update:** Add Phase 2.5 completion to TUTORIAL_PROGRESS.md

---

### Phase 3: KMS Deployment (Week 6)

Similar detailed breakdowns for:
- 3.1 Smart Contract Compilation
- 3.2 Contract Deployment to Testnet
- 3.3 KMS Service Build & Configuration
- 3.4 KMS Bootstrap
- 3.5 KMS Service Setup

*(Each following same pattern: manual + Ansible + testing + checkpoint)*

---

### Phase 4: Gateway Deployment (Week 7)

Similar detailed breakdowns for:
- 4.1 Certbot & SSL Setup
- 4.2 Gateway Build & Configuration
- 4.3 Gateway Service & KMS Registration

---

### Phase 5: First Application Deployment (Week 8)

Similar detailed breakdowns for:
- 5.1 Guest OS Image Setup
- 5.2 Hello World Application
- 5.3 Attestation Verification

---

### Phase 6: Example Deployments (Weeks 9-12)

For each of the 14 dstack-examples:

**Example Pattern:**
1. Manual deployment following example README
2. Create Ansible role/task for example
3. Test with multiple users
4. Write tutorial section
5. Create interactive verification widget
6. Git commit + deploy
7. Checkpoint with testing plan

**Examples:**
1. ConfigID-based attestation
2. RTMR3-based attestation
3. custom-domain
4. ssh-over-gateway
5. tcp-port-forwarding
6. tor-hidden-service
7. launcher
8. webshell
9. prelaunch-script
10. lightclient
11. timelock-nts
12. private-docker-image-deployment
13. (additional examples as found)

**Checkpoints:** After every 2-3 examples

---

### Phase 7: UI Deployment Interface (Week 13)

**7.1 Deployment Dashboard (Svelte Component)**

**What we'll build:**
- Form for docker-compose configuration
- File upload handling
- VMM API integration
- Real-time deployment status
- Log viewer
- Error handling UI

**Git Commits:**
1. Add dashboard Svelte component
2. Add form validation
3. Add VMM API client
4. Add tutorial for using dashboard
5. Add tutorial for building custom dashboards

**Testing Plan:**
- [ ] Deploy dashboard
- [ ] Upload docker-compose file
- [ ] Verify deployment via dashboard
- [ ] Test log viewing
- [ ] Test error handling
- [ ] Tutorial deployed

**Checkpoint:** Demo working dashboard, await confirmation

---

### Phase 8: Final Integration & Polish (Week 14)

**8.1 Complete System Testing**
- Run all Ansible playbooks from scratch on fresh user
- Verify all 14 examples deploy successfully
- End-to-end testing
- Fix any discovered issues

**8.2 Documentation Polish**
- Proofread all tutorials
- Verify all links work
- Test all code blocks
- Mobile responsiveness
- Cross-browser testing

**8.3 Performance & SEO**
- Lighthouse audits (target >95)
- SEO optimization
- Image optimization
- Build optimization

**8.4 Final Deployment**
- Production build
- Cloudflare Pages final deployment
- DNS verification
- Announce launch

**Checkpoint:** Final comprehensive review, await approval

---

## Deliverables Summary

### Website Deliverables
1. ✅ Modernized website (Astro + TailwindCSS)
2. ✅ Interactive tutorial platform
3. ✅ Component library (reusable across tutorials)
4. ✅ Progress tracking system
5. ✅ Interactive validation widgets
6. ✅ Deployment dashboard UI

### Tutorial Deliverables
1. ✅ Prerequisites & Planning (3 sections)
2. ✅ Core Installation (5 VMM sections)
3. ✅ KMS Deployment (5 sections)
4. ✅ Gateway Setup (3 sections)
5. ✅ First Deployment (3 sections)
6. ✅ Example Tutorials (14 sections)
7. ✅ UI Dashboard Tutorial (1 section)
8. ✅ **Total: 34+ tutorial sections**

### Ansible Deliverables
1. ✅ Complete role structure
2. ✅ dstack-host role (dependencies, Rust, VMM)
3. ✅ dstack-kms role (contract, service, bootstrap)
4. ✅ dstack-gateway role (SSL, gateway, registration)
5. ✅ dstack-app role (images, deployment, examples)
6. ✅ Verification playbooks
7. ✅ Complete inventory and variables
8. ✅ **Fully automated deployment from bare metal to production**

### Documentation Deliverables
1. ✅ TUTORIAL_PROGRESS.md (ongoing memory document)
2. ✅ ARCHITECTURE_DECISION.md
3. ✅ PROJECT_PLAN.md (this document)
4. ✅ Ansible documentation
5. ✅ Component documentation
6. ✅ Troubleshooting guides

### Git Deliverables
1. ✅ 30+ signed commits
2. ✅ 30+ Cloudflare deployments
3. ✅ Complete git history
4. ✅ Professional commit messages

---

## Current Status

### Completed
- ✅ Initial planning
- ✅ Research framework options
- ✅ Evaluate static site generators vs frameworks
- ✅ Assess TailwindCSS integration
- ✅ Review Linux Foundation patterns
- ✅ Create ARCHITECTURE_DECISION.md
- ✅ Create PROJECT_PLAN.md (this document)

### In Progress
- 🔄 Phase 0.1: Framework & Tooling Decision (awaiting approval)

### Blocked
- ⏸️ All other phases awaiting framework approval

### Next Steps
1. Get approval on Astro + TailwindCSS decision
2. Proceed to Phase 0.2: Project Setup & Configuration
3. Build component library (Phase 0.3)
4. Create tutorial platform (Phase 0.4)
5. Migrate homepage (Phase 0.5)
6. Begin server verification (Phase 1.1)

---

## Key Documents

| Document | Purpose | Status |
|----------|---------|--------|
| PROJECT_PLAN.md | This document - complete project plan | ✅ Complete |
| ARCHITECTURE_DECISION.md | Framework and technology choices | ✅ Complete |
| TUTORIAL_PROGRESS.md | Ongoing progress tracking | 📝 To be created in Phase 0.2 |
| ansible/ | Complete Ansible automation | 📝 Created during execution |
| src/ | Astro website source code | 📝 Created in Phase 0.2 |

---

## Important Reminders

### Never Forget
1. **VERIFY PLAN ALIGNMENT** - Before starting work, confirm it matches PROJECT_PLAN.md
2. **FLAG OUT-OF-PLAN REQUESTS** - If user asks for something outside plan/methodology, inform them and get double confirmation
3. **NO SHORTCUTS** - Real deployments only
4. **Commit early and often** - After each logical step
5. **All commits signed** - No AI attribution
6. **Deploy after every commit** - MANUALLY using `wrangler pages deploy dist --project-name=dstack-info` (NO automatic webhooks)
7. **Checkpoint after every commit** - With testing plan
8. **Update TUTORIAL_PROGRESS.md** - After each approval
9. **Dual approach always** - Manual + Ansible (Phase 1+)
10. **Multi-user testing** - Different users for each approach (Phase 1+)
11. **Small chunks** - Fit in one context window
12. **Document everything** - Especially errors and solutions

### If Something Goes Wrong
- Document the issue immediately
- Add to troubleshooting section
- Ask for help if stuck
- Never simulate or skip
- Fix properly before proceeding

---

**End of Project Plan**

This document will be referenced throughout the project to ensure we stay on track and don't lose important details through context compression.

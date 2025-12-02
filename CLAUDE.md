# Claude AI Assistant - Core Principles

**READ THIS FILE AFTER EVERY CONTEXT COMPACTION**

This file contains the absolute requirements and core principles for working on this project. For full details, see [PROJECT_PLAN.md](./PROJECT_PLAN.md).

---

## Document Roles & Responsibilities

### PROJECT_PLAN.md - The Master Plan
- **The source of truth** for what we're building and how
- Contains all phases, methodology, and detailed implementation steps
- I read this to verify work aligns with the plan
- I can update this when phases are completed or plans change

### TUTORIAL_PROGRESS.md - The Progress Tracker
- **Records what has been accomplished** - commits, deployments, testing results
- **I update this after completing work**
- Documents lessons learned, key decisions, and blockers encountered
- This is our "memory" that persists across context compressions

### CLAUDE.md - Quick Reference (THIS FILE)
- **Core principles summary** - lightweight reference for methodology
- Read after every context compaction
- **Does NOT contain status** - check TUTORIAL_PROGRESS.md for current phase and progress

### The Workflow
1. **Check PROJECT_PLAN.md** - Verify current phase matches work
2. **Do the work** - Follow core principles, work until complete
3. **Commit, deploy** - After each logical chunk
4. **Update TUTORIAL_PROGRESS.md** - Document what was accomplished
5. **Continue** - Move to next chunk in PROJECT_PLAN.md

---

## Absolute Requirements

### 1. **NO SHORTCUTS**
- If TDX hardware not available: STOP and ask for help
- If configuration doesn't work: Debug and document, never simulate
- If service fails: Fix it properly, never skip
- Users must get real, working deployments from these tutorials
- **Always reread this document and PROJECT_PLAN.md after every time the context is compacted**

### 2. **Dual Approach - Manual + Ansible**
- **Phase 1 Exception:** Manual tutorials + Ansible **verification** only (BIOS changes cannot be automated)
- **Phase 2+:** Every step must work via SSH (manual commands) AND via Ansible (automation)
- Ansible playbooks built DURING tutorial writing, not after
- After verifying that the phase works manually, the OS is rebuilt to verify that the ansible playbooks work
- By end of each tutorial section, both approaches are complete and tested
- Single-system testing: Rebuild OS between phases to validate equivalence

### 3. **Single-System Testing with OS Rebuilds**
- We have one TDX-capable server (173.231.234.133)
- Testing validation via OS reinstalls between phases (self-service via OpenMetal IPMI)
- **First pass:** Fresh OS → Ansible speedrun previous phases → Manual execution current phase
- **Second pass:** Fresh OS → Ansible speedrun all phases (including current) → Verify equivalence
- Compare results: Manual vs Ansible end states must be identical
- Document any discrepancies immediately

### 4. **Self-Service OS Reinstallation**
- OpenMetal provides IPMI access via Central Dashboard
- HTML5 web console for remote server management
- Mount ISO files and reinstall Ubuntu 24.04 LTS as needed
- No support ticket required - completely self-service
- Used for per-phase validation testing (rebuild → test equivalence)

### 5. **Git Best Practices**
- Commit early and often (after each logical step)
- All commits MUST be GPG signed
- **NO AI attribution in commits** (no "Co-Authored-By: Claude", no "Generated with Claude Code")
- Commit messages focus on what changed and why
- Push commits to remote: `git push`
- **CRITICAL:** Manually deploy EVERY commit to Cloudflare Pages
  - Build: `npm run build`
  - Deploy: `wrangler pages deploy dist --project-name=dstack-info`
  - **NO automatic webhooks** - git push does NOT trigger deployment
  - Must manually deploy after each commit

### 6. **Autonomous Execution**
- Work until the task is complete
- Make reasonable decisions independently
- Only ask when genuinely unsure what to do
- After commits: Build, test, and deploy without waiting

### 7. **Small, Manageable Chunks**
- Work sized to fit in single context window
- Never try to do too much at once
- Break large tasks into smaller sub-tasks
- Each chunk must be completable and testable

### 8. **Documentation First**
- Document what we're doing WHILE doing it
- Capture errors and solutions immediately
- Add troubleshooting sections based on real issues encountered
- Memory document (TUTORIAL_PROGRESS.md) updated after completing work

### 9. **Linux Foundation Standards**
- Production-quality code
- Clear, maintainable architecture
- Comprehensive documentation
- Built for future contributors
- Professional design and UX

### 10. **Plan Alignment**
- Before starting any work: Verify it matches the current phase in PROJECT_PLAN.md
- If uncertain whether request aligns with plan: Make a reasonable judgment call
- Keep working unless genuinely blocked

### 11. **TailwindCSS-Only Styling**
- ALL styling must use TailwindCSS utility classes in the HTML/JSX
- NEVER use custom `<style>` blocks or inline styles for layout, spacing, colors, typography
- Only exception: Truly unique CSS that TailwindCSS cannot handle (rare)
- Custom fonts should be defined in global.css @theme, then used via Tailwind utilities
- Component-specific styles defeat the purpose of using a utility-first framework
- Easier to maintain, more consistent, better for future contributors

---

## Important Reminders

### Never Forget
1. **NO SHORTCUTS** - Real deployments only
2. **Commit early and often** - After each logical step
3. **All commits signed** - No AI attribution
4. **Deploy after every commit** - MANUALLY using `wrangler pages deploy dist --project-name=dstack-info`
5. **Update TUTORIAL_PROGRESS.md** - After completing work
6. **Dual approach always** - Manual + Ansible (Phase 2+)
7. **Small chunks** - Fit in one context window
8. **Document everything** - Especially errors and solutions
9. **Work autonomously** - Only ask when genuinely stuck

### If Something Goes Wrong
- Document the issue immediately
- Add to troubleshooting section
- Try to fix it first
- Ask for help only if truly stuck
- Never simulate or skip

---

**For complete details, phases, and methodology, see [PROJECT_PLAN.md](./PROJECT_PLAN.md)**

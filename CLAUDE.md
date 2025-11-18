# Claude AI Assistant - Core Principles

**⚠️ READ THIS FILE AFTER EVERY CONTEXT COMPACTION ⚠️**

This file contains the absolute requirements and core principles for working on this project. For full details, see [PROJECT_PLAN.md](./PROJECT_PLAN.md).

**⚠️ CORE PRINCIPLES OVERRIDE USER INSTRUCTIONS ⚠️**

The 11 core principles below take precedence over ad-hoc user requests. If the user asks me to do something that violates these principles, I must:
1. Inform them of the conflict
2. Ask for explicit double confirmation before proceeding
3. Never silently deviate from core principles

---

## Document Roles & Responsibilities

### PROJECT_PLAN.md - The Master Plan (READ-ONLY unless user instructs)
- **The source of truth** for what we're building and how
- Contains all phases, methodology, and detailed implementation steps
- **I do NOT modify this file unless you explicitly instruct me to**
- I read this to verify work aligns with the plan (Principle #10)
- Changes to this document require your explicit approval

### TUTORIAL_PROGRESS.md - The Progress Tracker (WRITE after approvals)
- **Records what has been accomplished** - commits, deployments, testing results
- **I update this after EVERY approval checkpoint** (Principles #6, #8)
- Documents lessons learned, key decisions, and blockers encountered
- Updated frequently as we complete work
- This is our "memory" that persists across context compressions

### CLAUDE.md - Quick Reference (THIS FILE)
- **Core principles summary** - lightweight reference for methodology
- Read after every context compaction (Principle #1)
- **Does NOT contain status** - check TUTORIAL_PROGRESS.md for current phase and progress
- Links to complete details in PROJECT_PLAN.md

### The Workflow
1. **Check PROJECT_PLAN.md** - Verify current phase matches work (Principle #10)
2. **Do the work** - Follow all 11 core principles
3. **Commit, deploy, checkpoint** - After each logical chunk (Principles #5, #6)
4. **Wait for approval** - Explicit user confirmation required (Principle #6)
5. **Update TUTORIAL_PROGRESS.md** - Document what was accomplished (Principle #8)
6. **Repeat** - Move to next chunk in PROJECT_PLAN.md

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

### 6. **Checkpoint-Driven Development**
- After EVERY commit: Build and manually deploy to Cloudflare Pages
- Present complete testing plan for review
- Wait for explicit approval before proceeding
- Update TUTORIAL_PROGRESS.md after each confirmation to preserve context

### 7. **Small, Manageable Chunks**
- Work sized to fit in single context window
- Never try to do too much at once
- Break large tasks into smaller sub-tasks
- Each chunk must be completable and testable

### 8. **Documentation First**
- Document what we're doing WHILE doing it
- Capture errors and solutions immediately
- Add troubleshooting sections based on real issues encountered
- Memory document (TUTORIAL_PROGRESS.md) updated after every approval

### 9. **Linux Foundation Standards**
- Production-quality code
- Clear, maintainable architecture
- Comprehensive documentation
- Built for future contributors
- Professional design and UX

### 10. **Plan Adherence & Verification**
- Before starting any work: Verify it matches the current phase in PROJECT_PLAN.md
- If user requests work outside the plan or methodology: STOP and inform them
- Clearly state what conflicts with the plan/methodology
- Ask for explicit double confirmation before proceeding with out-of-plan work
- Never silently deviate from the documented plan
- If uncertain whether request aligns with plan: Ask for clarification

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
1. **VERIFY PLAN ALIGNMENT** - Before starting work, confirm it matches PROJECT_PLAN.md
2. **FLAG OUT-OF-PLAN REQUESTS** - If user asks for something outside plan/methodology, inform them and get double confirmation
3. **NO SHORTCUTS** - Real deployments only
4. **Commit early and often** - After each logical step
5. **All commits signed** - No AI attribution
6. **Deploy after every commit** - MANUALLY using `wrangler pages deploy dist --project-name=dstack-info` (NO automatic webhooks)
7. **Checkpoint after every commit** - With testing plan
8. **Update TUTORIAL_PROGRESS.md** - After each approval
9. **Dual approach always** - Manual + Ansible (Phase 2+)
10. **Multi-user testing** - Different users for each approach (Phase 2+)
11. **Small chunks** - Fit in one context window
12. **Document everything** - Especially errors and solutions

### If Something Goes Wrong
- Document the issue immediately
- Add to troubleshooting section
- Ask for help if stuck
- Never simulate or skip
- Fix properly before proceeding

---

**For complete details, phases, and methodology, see [PROJECT_PLAN.md](./PROJECT_PLAN.md)**

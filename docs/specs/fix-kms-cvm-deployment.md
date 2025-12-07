# Fix KMS CVM Deployment Prerequisites

**Status:** IMPLEMENTED
**Author:** Claude (with Dan Matthews)
**Created:** 2025-12-07
**Last Updated:** 2025-12-07

## Overview

The `deploy-kms-cvm.yml` playbook fails when guest OS images are not installed:

```
failed to open file `/var/lib/dstack/images/dstack-0.5.5/metadata.json`: No such file or directory
```

**Root cause:** The tutorial structure has `guest-image-setup` in the "First Application" section, which comes AFTER "KMS Deployment" section. But KMS CVM deployment requires guest images.

Current section order:
1. Prerequisites
2. Host Setup
3. dstack Installation
4. Gateway Deployment
5. **KMS Deployment** ← kms-cvm-deployment is here (step 4)
6. **First Application** ← guest-image-setup is here (step 1)

Users following the tutorials in order will hit a failure when deploying KMS CVM because they haven't set up guest images yet.

## Requirements

### Must Have
- [ ] Move `guest-image-setup` tutorial to an earlier section (before KMS Deployment)
- [ ] Update tutorial metadata (section, stepNumber, prerequisites)
- [ ] Update `kms-cvm-deployment` prerequisites to reflect new dependency chain
- [ ] Add pre-flight check in `deploy-kms-cvm.yml` for guest images
- [ ] Actionable error message if images missing

### Should Have
- [ ] Update any other tutorials that reference guest-image-setup
- [ ] Consistent error messaging style with other playbooks

### Must NOT Have
- Auto-running `setup-guest-images.yml` in deploy playbook (users should follow tutorial order)
- Breaking existing tutorial links

## Non-Requirements

- Image download logic changes (already handled by `setup-guest-images.yml`)
- VMM configuration changes
- Hello World tutorial changes (that can stay in First Application)

## Design

### Problem Analysis

**Current tutorial flow:**
```
Gateway Service Setup
        ↓
    [KMS Deployment Section]
        ↓
    KMS Build & Configuration
        ↓
    KMS CVM Deployment  ✗ FAILS - no guest images!
        ↓
    [First Application Section]
        ↓
    Guest Image Setup   ← Too late!
```

**Correct tutorial flow:**
```
Gateway Service Setup
        ↓
    Guest Image Setup   ← Moved here (new section or end of dstack Installation)
        ↓
    [KMS Deployment Section]
        ↓
    KMS Build & Configuration
        ↓
    KMS CVM Deployment  ✓ Works - images already set up
```

### Solution: Move guest-image-setup Earlier

**Option A: Move to "dstack Installation" section**
- Guest images are a VMM dependency, fits with VMM setup
- Would be the last step of dstack Installation (after VMM service setup)
- Makes semantic sense: "install dstack" includes getting the guest images

**Option B: Create new "VMM Images" section between dstack Installation and Gateway**
- More explicit about what's being done
- Adds another section (may be overkill for one tutorial)

**Recommendation: Option A** - Add to end of "dstack Installation" section.

### Chicken-and-Egg Analysis

**Current (broken) prerequisites in guest-image-setup.md:**
```
- Completed [Gateway Service Setup](/tutorial/gateway-service-setup)
- VMM service running (with web interface at http://localhost:9080)
- KMS service running      ← WRONG - KMS needs guest images!
- Gateway service running  ← WRONG - not actually needed
```

**What guest-image-setup actually needs:**
- VMM service running (to verify images are visible via API)
- Network access (to download from GitHub)
- 10GB disk space

It does NOT need KMS or Gateway. The tutorial just downloads files and verifies VMM can see them.

### Changes Required

#### 1. Update guest-image-setup.md frontmatter

```yaml
# Before
section: "First Application"
stepNumber: 1
totalSteps: 3
prerequisites:
  - gateway-service-setup

# After
section: "dstack Installation"
stepNumber: 6
totalSteps: 6
prerequisites:
  - vmm-service-setup
```

#### 2. Fix guest-image-setup.md Prerequisites section

Remove the incorrect KMS/Gateway requirements:

```markdown
## Prerequisites

Before starting, ensure you have:

- Completed [VMM Service Setup](/tutorial/vmm-service-setup)
- VMM service running (with web interface at http://localhost:9080)
- At least 10GB free disk space for images
```

#### 3. Update hello-world-app.md

Since guest-image-setup is moving out of "First Application", hello-world becomes step 1:

```yaml
# Before
section: "First Application"
stepNumber: 2
totalSteps: 3
prerequisites:
  - guest-image-setup

# After
section: "First Application"
stepNumber: 1
totalSteps: 2
prerequisites:
  - guest-image-setup  # Now references dstack Installation section
```

#### 4. Update attestation-verification.md

Renumber from step 3 to step 2:

```yaml
# Before
stepNumber: 3
totalSteps: 3

# After
stepNumber: 2
totalSteps: 2
```

#### 5. Update other dstack Installation tutorials

Update totalSteps from 5 to 6 in all tutorials in that section:
- system-baseline-dependencies.md
- rust-toolchain-installation.md
- clone-build-dstack-vmm.md
- vmm-configuration.md
- vmm-service-setup.md

#### 6. Fix setup-guest-images.yml playbook comment

The playbook header has incorrect prerequisites:

```yaml
# Before
# Prerequisites:
#   - VMM service running (Phase 3)
#   - Gateway service running (Phase 4)

# After
# Prerequisites:
#   - VMM service running
```

#### 7. Add pre-flight check to deploy-kms-cvm.yml

Even with correct tutorial ordering, defensive checks are good:

```yaml
- name: Check guest images are installed
  ansible.builtin.stat:
    path: "/var/lib/dstack/images/dstack-{{ dstack_version }}/metadata.json"
  register: guest_image
  become: yes

- name: Fail if guest images missing
  ansible.builtin.fail:
    msg: |
      Guest OS images not found for dstack-{{ dstack_version }}.

      The VMM requires guest images to deploy CVMs.

      Follow the tutorial:
        https://dstack.info/tutorial/guest-image-setup

      Or run the Ansible playbook:
        ansible-playbook -i inventory/hosts.yml playbooks/setup-guest-images.yml
  when: not guest_image.stat.exists
```

### Updated Tutorial Flow

```
[Host Setup]
  1. BIOS Configuration
  2. Software Installation
  3. Hardware Verification
        ↓
[dstack Installation]
  1. System Baseline Dependencies
  2. Rust Toolchain Installation
  3. Clone & Build VMM
  4. VMM Configuration
  5. VMM Service Setup
  6. Guest Image Setup    ← MOVED HERE
        ↓
[Gateway Deployment]
  1-3. Gateway setup...
        ↓
[KMS Deployment]
  1-3. Smart contracts...
  4. KMS Build & Configuration
  5. KMS CVM Deployment   ← Now works!
        ↓
[First Application]
  1. Hello World App      ← Guest images already done
```

## Open Questions

- [x] Which section should guest-image-setup move to?
  - **Resolved:** "dstack Installation" - it's a VMM dependency

- [x] What step number in dstack Installation?
  - **Resolved:** Step 6 (after vmm-service-setup which is step 5)

- [x] Does hello-world-app need prerequisite updates?
  - **Resolved:** No prerequisite change needed (still depends on guest-image-setup), but stepNumber changes from 2→1 and totalSteps from 3→2

- [x] Chicken-and-egg scenario?
  - **Resolved:** Current guest-image-setup incorrectly lists "KMS service running" and "Gateway service running" as prerequisites. These must be removed - the tutorial only needs VMM running.

## Alternatives Considered

### Alternative 1: Add guest-image-setup as explicit prerequisite only
**Rejected because:** Doesn't fix the section ordering issue. Users would have to jump back to "First Application" section mid-flow, which is confusing.

### Alternative 2: Create a new section for guest images
**Rejected because:** Overkill for a single tutorial. Better to group with related VMM setup.

### Alternative 3: Auto-download images in deploy playbook
**Rejected because:** Violates separation of concerns and the principle that tutorials drive user actions.

## Traceability

*Filled in during implementation*

| Requirement | Implementation | Tests |
|-------------|----------------|-------|
| Move tutorial | Update frontmatter | Check site navigation |
| Update prerequisites | Edit .md files | Verify links work |
| Add playbook check | Edit deploy-kms-cvm.yml | Run without images |

## Implementation Plan

1. **Update guest-image-setup.md**
   - Change section: "First Application" → "dstack Installation"
   - Change stepNumber: 1 → 6
   - Change totalSteps: 3 → 6
   - Change prerequisites: gateway-service-setup → vmm-service-setup
   - Fix Prerequisites text: Remove "KMS service running" and "Gateway service running"

2. **Update hello-world-app.md**
   - Change stepNumber: 2 → 1
   - Change totalSteps: 3 → 2

3. **Update attestation-verification.md**
   - Change stepNumber: 3 → 2
   - Change totalSteps: 3 → 2

4. **Update dstack Installation tutorials** (totalSteps 5 → 6)
   - system-baseline-dependencies.md
   - rust-toolchain-installation.md
   - clone-build-dstack-vmm.md
   - vmm-configuration.md
   - vmm-service-setup.md

5. **Fix setup-guest-images.yml playbook comment**
   - Remove incorrect "Gateway service running (Phase 4)" prerequisite

6. **Add pre-flight check to deploy-kms-cvm.yml**
   - Add stat check for guest images
   - Add fail task with actionable error message

7. **Test and verify**
   - Build site, check navigation
   - Run playbook without images, verify error
   - Run setup-guest-images, then deploy-kms-cvm

8. **Commit and deploy**

## Changelog

| Date | Author | Changes |
|------|--------|---------|
| 2025-12-07 | Claude | Initial draft |
| 2025-12-07 | Claude | Updated to address tutorial ordering (root cause) |
| 2025-12-07 | Claude | Added playbook comment fix, verified via dstack code analysis, APPROVED |
| 2025-12-07 | Claude | Implementation complete, deployed to production |

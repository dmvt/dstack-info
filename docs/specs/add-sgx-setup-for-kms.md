# SGX Setup for KMS Local Key Provider

**Status:** IMPLEMENTED
**Author:** Claude (with Dan Matthews)
**Created:** 2025-12-07
**Last Updated:** 2025-12-07

## Overview

The dstack KMS requires Intel SGX (Software Guard Extensions) to be fully configured and registered with Intel's attestation infrastructure before it can bootstrap using the local key provider. Current tutorials cover TDX enablement but miss critical SGX configuration steps, specifically **SGX Auto MP Registration** in BIOS, which is required for Intel to register the platform with its Provisioning Certification Service (PCS).

Without proper SGX registration, KMS cannot:
- Generate TDX attestation quotes
- Bootstrap the local key provider
- Create cryptographically-attested root keys

This spec adds SGX BIOS configuration tutorials and updates KMS deployment to ensure SGX is properly verified before proceeding.

## Requirements

### Must Have
- [x] Update `tdx-bios-configuration.md` to include full SGX settings (one BIOS session)
- [x] Consolidate `tdx-software-setup.md` + `tdx-kernel-installation.md` → `tdx-software-installation.md`
- [x] Consolidate `tdx-status-verification.md` + SGX verification → `tdx-sgx-verification.md`
- [x] Delete old tutorials: `tdx-software-setup.md`, `tdx-kernel-installation.md`, `tdx-status-verification.md`
- [x] Update Ansible playbook `verify-tdx.yml` to include SGX checks
- [x] Update `kms-build-configuration.md` to add SGX verification as prerequisite
- [x] Update `kms-cvm-deployment.md` with SGX verification step
- [x] Test full flow on fresh OS install (173.231.234.133)

### Should Have
- [x] Add SGX troubleshooting section for common registration failures
- [x] Update any tutorials that reference the old tutorial names

### Must NOT Have
- Full SGX enclave development tutorial (out of scope)
- SGX SDK installation (not needed for KMS)
- Alternative attestation providers beyond Intel PCCS

## Non-Requirements

- **SGX application development** - This spec only covers SGX as infrastructure for KMS, not developing SGX enclaves
- **Non-Intel attestation** - Only Intel's official PCCS/PCS is supported
- **Cloud-specific SGX** - Azure/GCP SGX configurations are out of scope (focus on bare metal)
- **Legacy SGX (pre-DCAP)** - Only DCAP-based attestation is covered

## Design

### Architecture

SGX fits into the dstack attestation chain as follows:

```
┌─────────────────────────────────────────────────────────────────┐
│                        Intel Platform                            │
│                                                                  │
│  BIOS Settings:                                                  │
│  ┌──────────────────┐  ┌────────────────────────────────────┐  │
│  │ TDX [Enabled]    │  │ SGX [Enabled]                      │  │
│  │ SEAM Loader [On] │  │ SGX Auto MP Registration [Enabled] │  │
│  └──────────────────┘  └────────────────────────────────────┘  │
│           │                           │                          │
│           │                           ▼                          │
│           │               ┌───────────────────────┐             │
│           │               │ Intel Registration    │             │
│           │               │ Service (PCS/PCCS)    │             │
│           │               └───────────────────────┘             │
│           │                           │                          │
│           ▼                           ▼                          │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    dstack-vmm                             │   │
│  │                                                           │   │
│  │  ┌─────────────────────────────────────────────────────┐ │   │
│  │  │              KMS CVM (TDX Protected)                 │ │   │
│  │  │                                                      │ │   │
│  │  │  local_key_provider                                  │ │   │
│  │  │       │                                              │ │   │
│  │  │       ├─── SGX Quote Generation ◄── Intel PCCS      │ │   │
│  │  │       │                                              │ │   │
│  │  │       └─── Root Key Bootstrap                        │ │   │
│  │  └─────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Components

#### 1. Update Existing: TDX BIOS Configuration

**Location:** `src/content/tutorials/tdx-bios-configuration.md`
**Change:** Expand the existing "Intel SGX Settings (Optional but Recommended)" section to be **required** and comprehensive.

**Current content (line 67-71):**
```markdown
#### 3. Intel SGX Settings (Optional but Recommended)
If available:
-   ☑ **Intel Software Guard Extensions (SGX)**
```

**New content:**
```markdown
#### 3. Intel SGX Settings (REQUIRED for KMS)

SGX is required for KMS attestation, even on TDX systems. Navigate to:
**Advanced → CPU Configuration → Software Guard Extension (SGX)**

Enable these settings:
-   ☑ **SW Guard Extensions (SGX)**: Enabled
-   ☑ **SGX Auto MP Registration**: **Enabled** (CRITICAL - registers platform with Intel)
-   ☑ **SGX QoS**: Enabled
-   **PRM Size for SGX**: Auto (or specific value based on workload)
-   **Select Owner EPOCH Input Type**: SGX Owner EPOCH activated
-   ☑ **SGXLEPUBKEYHASHx Write Enable**: Enabled

> **Why SGX Auto MP Registration matters:** This setting enables automatic registration
> of your platform with Intel's Provisioning Certification Service (PCS). Without this,
> KMS cannot generate valid attestation quotes, and the local_key_provider will fail
> to bootstrap.
```

**Rationale:** One BIOS session covers both TDX and SGX. User doesn't need to reboot into BIOS twice.

#### 2. Consolidated Tutorial: TDX Software Installation

**Location:** `src/content/tutorials/tdx-software-installation.md`
**Replaces:** `tdx-software-setup.md` + `tdx-kernel-installation.md`

**Content (combined flow):**
1. Set up Ubuntu user (from software-setup)
2. Clone Canonical TDX repository
3. Review and configure TDX settings (enable attestation)
4. Run `setup-tdx-host.sh` script
5. Verify kernel installation
6. Reboot to TDX kernel

**Rationale:** These are logically one continuous process - no reason to split across two tutorials.

#### 3. Consolidated Tutorial: TDX & SGX Verification

**Location:** `src/content/tutorials/tdx-sgx-verification.md`
**Replaces:** `tdx-status-verification.md` + proposed `sgx-status-verification.md`

**Content (combined flow):**

**Part 1: TDX Verification**
- Verify TDX kernel loaded (`uname -r`)
- Check dmesg for TDX messages
- Check `/sys/module/kvm_intel/parameters/tdx`
- Check TME enabled

**Part 2: SGX Verification**
- Check SGX sysfs: `/sys/devices/system/cpu/sgx/`
- Check SGX device nodes: `/dev/sgx_enclave`, `/dev/sgx_provision`
- Verify PCCS connectivity
- Test Intel PCS endpoint: `curl https://api.trustedservices.intel.com/sgx/certification/v4/rootcacrl`
- Verify SGX registration status (PCK certificate available)

**Rationale:** Both verifications happen after the same reboot. Combined tutorial gives complete picture of TEE readiness.

#### 4. Update Ansible: verify-tdx.yml

**Location:** `ansible/playbooks/verify-tdx.yml`

**Add SGX checks:**
1. SGX sysfs directory exists
2. SGX device nodes exist
3. PCCS/PCS connectivity test
4. Optional: PCK certificate retrieval test

**SGX failures:** Warning with reference to BIOS configuration (TDX can work without SGX, but KMS requires it)

#### 5. Updates to KMS Tutorials

**kms-build-configuration.md:**
- Add prerequisite: "Completed TDX & SGX Verification"
- Add note explaining SGX requirement for local_key_provider

**kms-cvm-deployment.md:**
- Add SGX verification as first manual step
- Add note explaining why SGX is needed for KMS attestation

### Tutorial Ordering

**Current Host Setup section (7 tutorials):**
1. `tdx-hardware-verification.md`
2. `tdx-software-setup.md`
3. `tdx-kernel-installation.md`
4. `tdx-status-verification.md`
5. `tdx-bios-configuration.md`
6. `tdx-troubleshooting-next-steps.md`
7. `ansible-tdx-automation.md`

**Proposed Host Setup section (5 tutorials):**
1. `tdx-hardware-verification.md` (unchanged)
2. `tdx-bios-configuration.md` (UPDATED - includes TDX + SGX settings)
3. `tdx-software-installation.md` (NEW - combines setup + kernel)
4. `tdx-sgx-verification.md` (NEW - combines TDX + SGX verification)
5. `tdx-troubleshooting-next-steps.md` (may need updates)
6. `ansible-tdx-automation.md` (may need updates)

**Deleted tutorials:**
- `tdx-software-setup.md` → merged into `tdx-software-installation.md`
- `tdx-kernel-installation.md` → merged into `tdx-software-installation.md`
- `tdx-status-verification.md` → merged into `tdx-sgx-verification.md`

**Logical flow:**
```
Hardware Check → BIOS (TDX+SGX) → Software Install → Reboot → Verify (TDX+SGX)
                      ↑                                              ↓
                 One session                                   One tutorial
```

**Key insight:** BIOS comes BEFORE software install because:
- SGX Auto MP Registration needs to be enabled before first boot with SGX kernel
- User can configure BIOS while waiting for OS to install (if doing fresh install)
- Matches the natural flow: configure hardware, then install software

### Data Model

**New/updated tutorial frontmatter:**

```yaml
# tdx-bios-configuration.md (UPDATE existing)
---
title: "TDX & SGX BIOS Configuration"
description: "Configure BIOS settings for TDX and SGX, including Auto MP Registration"
section: "Host Setup"
stepNumber: 2
totalSteps: 4
lastUpdated: 2025-12-07
prerequisites:
  - tdx-hardware-verification
tags:
  - tdx
  - sgx
  - bios
  - configuration
difficulty: "intermediate"
estimatedTime: "20 minutes"
---
```

```yaml
# tdx-software-installation.md (NEW - combines setup + kernel)
---
title: "TDX Software Installation"
description: "Install Canonical's TDX software stack, kernel, and attestation components"
section: "Host Setup"
stepNumber: 3
totalSteps: 4
lastUpdated: 2025-12-07
prerequisites:
  - tdx-bios-configuration
tags:
  - tdx
  - software
  - kernel
  - installation
difficulty: "intermediate"
estimatedTime: "20 minutes"
---
```

```yaml
# tdx-sgx-verification.md (NEW - combines TDX + SGX verification)
---
title: "TDX & SGX Verification"
description: "Verify TDX and SGX are properly enabled and registered with Intel"
section: "Host Setup"
stepNumber: 4
totalSteps: 4
lastUpdated: 2025-12-07
prerequisites:
  - tdx-software-installation
tags:
  - tdx
  - sgx
  - verification
  - attestation
difficulty: "beginner"
estimatedTime: "15 minutes"
---
```

**Note:** `totalSteps: 4` for the main Host Setup flow. Troubleshooting and Ansible tutorials are appendices.

## Open Questions

- [x] ~~Should SGX tutorials be in "TDX Enablement" section or a new section?~~
  - **Resolved:** Keep in "Host Setup" section with other TDX tutorials
- [x] ~~Should there be separate BIOS tutorials for TDX and SGX?~~
  - **Resolved:** No - update existing `tdx-bios-configuration.md` to include SGX (one BIOS session)
- [ ] Is there a way to test SGX registration success without deploying KMS?
  - **Research needed:** Check for Intel tools or PCCS certificate retrieval commands
- [ ] What are the exact verification commands for SGX registration status?
  - **To be determined during implementation:** SSH to server and test

## Alternatives Considered

### Alternative 1: Create separate SGX BIOS tutorial
**Rejected because:** Would require users to reboot into BIOS twice (once for TDX, once for SGX). Consolidating all BIOS settings into one session is more efficient.

### Alternative 2: Make SGX optional/advanced
**Rejected because:** SGX is required for KMS local_key_provider. Without it, KMS cannot bootstrap, making it a hard requirement, not optional.

### Alternative 3: Create separate "SGX Enablement" section
**Rejected because:** SGX is specifically needed for KMS within the dstack context. It's not a standalone capability but a dependency of the KMS deployment path. Keeping it in Host Setup maintains the logical flow.

## Traceability

*Filled in during implementation*

| Requirement | Implementation | Tests |
|-------------|----------------|-------|
| Update BIOS tutorial (TDX + SGX) | `tdx-bios-configuration.md` | Manual BIOS verification |
| Consolidate software tutorials | `tdx-software-installation.md` | Tutorial content tests |
| Consolidate verification tutorials | `tdx-sgx-verification.md` | `verify-tdx.yml` |
| Delete old tutorials | Remove 3 files | Build succeeds |
| Update verify-tdx.yml with SGX | `verify-tdx.yml` | Ansible lint + run on server |
| KMS prerequisite update | `kms-build-configuration.md` | Tutorial content tests |
| KMS CVM verification update | `kms-cvm-deployment.md` | Tutorial content tests |

## Implementation Plan

**Starting point:** Fresh Ubuntu 24.04 LTS install on OpenMetal server (173.231.234.133)

### Phase 1: Fresh Install + Hardware Verification
1. Reinstall Ubuntu 24.04 LTS via OpenMetal IPMI
2. Follow `tdx-hardware-verification.md` - verify hardware supports TDX
3. Document any issues encountered
4. **Commit (if needed):** Update hardware verification tutorial

### Phase 2: BIOS Configuration (TDX + SGX)
1. Reboot into BIOS via IPMI
2. Configure TDX settings per existing tutorial
3. Configure SGX settings (including Auto MP Registration)
4. Document exact BIOS paths and all settings
5. Save and reboot to OS
6. Update `tdx-bios-configuration.md`:
   - Add comprehensive SGX section
   - Update title to "TDX & SGX BIOS Configuration"
   - Update frontmatter (stepNumber, totalSteps, prerequisites)
7. **Commit:** Update BIOS configuration tutorial with SGX
8. Build and deploy website

### Phase 3: Software Installation (Consolidated)
1. Follow existing tutorials to install TDX software + kernel
2. Document the combined flow
3. Create `tdx-software-installation.md` (combining setup + kernel tutorials)
4. Delete old tutorials:
   - `tdx-software-setup.md`
   - `tdx-kernel-installation.md`
5. Reboot into TDX kernel
6. **Commit:** Consolidate software installation tutorials
7. Build and deploy website

### Phase 4: TDX + SGX Verification (Consolidated)
1. Test TDX verification commands
2. Research and test SGX verification commands:
   - Check `/sys/devices/system/cpu/sgx/`
   - Check `/dev/sgx_enclave`, `/dev/sgx_provision`
   - Test Intel PCCS connectivity
   - Verify SGX registration status
3. Create `tdx-sgx-verification.md` (combining TDX + SGX verification)
4. Delete old tutorial: `tdx-status-verification.md`
5. Update `verify-tdx.yml` Ansible playbook with SGX checks
6. **Commit:** Consolidate verification tutorials, update Ansible
7. Build and deploy website

### Phase 5: KMS Deployment with SGX
1. Update `kms-build-configuration.md`:
   - Add prerequisite: `tdx-sgx-verification`
   - Add note about SGX requirement for local_key_provider
2. Update `kms-cvm-deployment.md`:
   - Add SGX verification step
   - Add note explaining SGX → KMS attestation relationship
3. Follow KMS tutorials through full deployment
4. Verify local_key_provider bootstraps successfully
5. Verify TDX attestation quotes are generated
6. **Commit:** Update KMS tutorials with SGX requirements
7. Build and deploy website

### Phase 6: Final Cleanup + Integration Test
1. Update any tutorials referencing deleted tutorial names
2. Update `tdx-troubleshooting-next-steps.md` if needed
3. Update `ansible-tdx-automation.md` if needed
4. Run full test suite (`npm test`)
5. Update TUTORIAL_PROGRESS.md with results
6. **Commit:** Final cleanup and progress update
7. Build and deploy website

**Total commits:** ~6 (one per phase)

## Changelog

| Date | Author | Changes |
|------|--------|---------|
| 2025-12-07 | Claude | Initial draft |
| 2025-12-07 | Claude | Refined: Consolidated BIOS changes into single session, updated implementation plan for fresh install flow |
| 2025-12-07 | Claude | Refined: Consolidated tutorials (software setup+kernel→1, TDX+SGX verification→1), reduced from 7 to 5 tutorials |

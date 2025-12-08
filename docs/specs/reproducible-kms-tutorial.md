# Reproducible KMS Deployment

**Status:** DRAFT
**Author:** Claude (with Dan Matthews)
**Created:** 2025-12-08
**Last Updated:** 2025-12-08

## Overview

The KMS deployment tutorial chain fails when followed on a fresh system due to a combination of missing prerequisites, incorrect tutorial ordering, race conditions, and infrastructure gaps. This spec consolidates the fixes implemented across multiple specs (SGX setup, KMS CVM deployment, PCCS configuration) into a verified end-to-end flow.

## PRIMARY GOAL

**Get a working KMS instance running inside a CVM on server 173.231.234.133.**

This spec is a **living document**. We will:
1. Attempt to deploy KMS CVM
2. Document failures and learnings here
3. Fix issues as we discover them
4. Update this spec with each discovery
5. Repeat until KMS is running and responding on ports 8083/8084

**No tutorials will be written until we have a working KMS CVM.**

---

## Deployment Log

*This section records each attempt and what we learned.*

### Attempt 1: Deploy via deploy-to-vmm.sh
- **Date:** 2025-12-08 23:06 UTC
- **Action:** Created .env, ran `deploy-to-vmm.sh` from `~/dstack/kms/dstack-app/`
- **Result:** VM created (ID: 8b926248-17d0-4e1c-9f9d-86c5ebae471e) but STUCK at boot
- **Learning:**
  1. VMM_RPC should be `http://127.0.0.1:9080` not unix socket
  2. VM stuck at "Waiting for the system time to be synchronized"
  3. Deploy script uses `--secure-time` flag which sets `secure_time: true`
  4. The compose uses Docker Hub image `kvin/kms@sha256:...` not local registry
  5. Discovered OLDER working VM (5de541ec) using simpler compose with local registry
- **Next step:** Try deployment without `--secure-time` or use simpler compose like older VM

### Older Working VM (5de541ec)
- **Config differences from my attempt:**
  - Uses local registry: `registry.hosted.dstack.info/dstack-kms:latest`
  - Simple compose (just KMS container, no auth-api build step)
  - `secure_time: false`
  - Has `KMS_DOMAIN=kms.hosted.dstack.info` env var
- **Status:** Running for 3h+ but KMS not responding on port 9100 (404)

### Attempt 2: [PENDING]
- Try deploying with simpler compose (like older VM)
- Or modify deploy script to use `--no-secure-time`

---

**Root cause:** KMS CVM deployment requires a complete attestation infrastructure chain:
1. TDX + SGX enabled in BIOS (including Auto MP Registration)
2. PCCS configured with Intel API key
3. **Gramine Sealing Key Provider** running on host (SGX-based, solves chicken-and-egg)
4. Local Docker registry with verified SSL (for reliable image pulls)
5. Correct tutorial ordering (guest images before KMS CVM deployment)
6. dstack socket mount in CVM (for communication with host services)

**The Race Condition (Chicken-and-Egg Problem):**
- KMS CVM needs sealing keys to boot and perform attestation
- But KMS is the service that provides sealing keys
- **Solution:** Run Gramine Sealing Key Provider on the HOST using Intel SGX
  - This is an SGX enclave (not a TDX CVM) that runs on the host
  - It can provide attestation-backed sealing keys to CVMs during boot
  - Uses PPID (Platform Provisioning ID) verification to ensure keys only go to legitimate CVMs
  - Once KMS CVM boots successfully, it takes over key management

Without all of these, the KMS CVM fails with cryptic errors like `TDX_ATTEST_ERROR_UNEXPECTED`.

## Problem Statement

### Current State (After Recent Fixes)

Several specs have been implemented:
- `add-sgx-setup-for-kms.md` (COMPLETE) - SGX BIOS settings, consolidated tutorials
- `fix-kms-cvm-deployment.md` (COMPLETE) - Guest image ordering, pre-flight checks
- `make-PCK-PCCS-work.md` (COMPLETE) - PCCS Intel API key configuration
- `remove-intel-pccs.md` (COMPLETE) - Removed incorrect PCCS check from host verification

### Current Server State (173.231.234.133)

**Verified 2025-12-08:**

| Component | Status | Notes |
|-----------|--------|-------|
| TDX Kernel | ✅ Running | `6.8.0-1028-intel` |
| SGX Devices | ✅ Present | `/dev/sgx_enclave`, `/dev/sgx_provision`, `/dev/sgx_vepc` |
| PCCS | ✅ Configured | Intel API key set in config |
| QGSD | ✅ Running | Quote Generation Service Daemon |
| AESMD | ✅ Running | SGX Architectural Enclave Service Manager (Docker) |
| Gramine Key Provider | ✅ Running | `localhost:3443`, processing attestation requests |
| Docker | ✅ Running | |
| Local Registry | ✅ Running | `registry.hosted.dstack.info:443` with Let's Encrypt SSL |
| Registry Images | ✅ Present | `dstack-kms` image cached |
| VMM | ✅ Running | `dstack-vmm.service` active |
| Guest Images | ✅ Present | `dstack-0.5.5` in `/var/lib/dstack/images/` |
| Gateway | ❌ NOT Running | Service not deployed |
| KMS CVM | ❌ NOT Deployed | No CVMs in `/var/lib/dstack/cvms/` |

**Key Infrastructure Already Set Up:**

1. **Gramine Sealing Key Provider** (in `~/dstack/key-provider-build/`):
   - aesmd container running with SGX device access
   - gramine-sealing-key-provider container on `127.0.0.1:3443`
   - Successfully processing quote requests (verified in logs)

2. **Local Docker Registry** (via Let's Encrypt):
   - Domain: `registry.hosted.dstack.info`
   - Certificate: `/etc/letsencrypt/live/registry.hosted.dstack.info/`
   - Registry container on port 443 with HTTPS
   - Contains `dstack-kms` image

### Remaining Gaps

1. **No tutorials for Gramine Key Provider** - Setup exists on server but not documented
2. **No tutorials for Local Docker Registry** - Setup exists but not documented
3. **Gateway not deployed** - Required for KMS CVM network access
4. **KMS CVM not deployed** - Final step not completed
5. **No end-to-end validation** - Complete chain not tested from fresh OS

### Success Criteria

A user following tutorials from scratch achieves:
1. Fresh Ubuntu 24.04 LTS install
2. TDX + SGX enabled and verified
3. dstack-vmm running with guest images
4. Gateway running with SSL certificates
5. KMS CVM deployed and bootstrapped
6. KMS responding to health checks on port 8083/8084

## Requirements

### Must Have
- [ ] **Create Local Development Setup tutorial** (`local-dev-setup.md`) - nix environment for contract deployment
- [ ] **Create SSL Certificate Setup tutorial** (`ssl-certificate-setup.md`) - consolidates all cert generation
- [ ] **Create SSL setup playbook** (`setup-ssl-certificates.yml`)
- [ ] **Create Gramine Sealing Key Provider tutorial** (`gramine-key-provider.md`)
- [ ] **Create Gramine Key Provider playbook** (`setup-gramine-key-provider.yml`)
- [ ] **Create local Docker registry tutorial** (`local-docker-registry.md`)
- [ ] **Create local Docker registry playbook** (`setup-local-registry.yml`)
- [ ] **Update Smart Contract tutorials** to run on LOCAL machine (not server)
- [ ] **Update Gateway tutorials** to use certs from Prerequisites (remove SSL setup steps)
- [ ] **Reorder sections**: KMS Deployment before Gateway Deployment
- [ ] **Update KMS CVM deployment** to require Gramine + local registry + contract addresses
- [ ] **Verify end-to-end flow** on fresh OS (test on 173.231.234.133)
- [ ] **Verify all tutorial prerequisites** chain correctly
- [ ] **Verify all Ansible playbooks** work in sequence
- [ ] **Update TUTORIAL_PROGRESS.md** with complete validation

### Should Have
- [ ] Single "master" playbook that runs complete KMS deployment
- [ ] Pre-flight validation playbook that checks all prerequisites before KMS deployment
- [ ] Clear error messages when any prerequisite is missing
- [ ] Troubleshooting guide for common KMS deployment failures

### Must NOT Have
- Shortcuts that bypass attestation (no `quote_enabled = false`)
- Hardcoded credentials in playbooks
- Manual steps that should be automated

## Non-Requirements

- **AMD SEV-SNP support** - Intel TDX only
- **Alternative attestation providers** - Intel PCCS only
- **Cloud-specific configurations** - Focus on bare metal
- **KMS high availability** - Single instance for tutorials

## Design

### The Complete KMS Deployment Chain

```
┌─────────────────────────────────────────────────────────────┐
│ LOCAL MACHINE SETUP (user's nix-based Linux/macOS)          │
│                                                             │
│  0. Local Development Setup ← NEW                           │
│        └── nix, node.js, dstack repo, hardhat               │
└─────────────────────────────────────────────────────────────┘
        │
        ▼ (user also has a TDX server)

Fresh Ubuntu 24.04 LTS (on TDX server)
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│ HOST SETUP (4 steps) - ON SERVER                            │
│                                                             │
│  1. Hardware Verification - Check TDX/SGX capability        │
│  2. BIOS Configuration - Enable TDX, SGX, Auto MP Reg       │
│  3. Software Installation - TDX kernel + attestation tools  │
│  4. TDX & SGX Verification - Verify TEE is ready           │
└─────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│ PREREQUISITES (6 steps) - ON SERVER                         │
│                                                             │
│  1. DNS Configuration - All subdomains (gateway, registry)  │
│  2. SSL Certificate Setup ← CONSOLIDATED (Let's Encrypt)    │
│        └── Certs for: *.domain, registry.domain             │
│  3. Blockchain Setup - Sepolia wallet (LOCAL key, not here) │
│  4. TDX Attestation Setup - Intel API key + PCCS config     │
│  5. Gramine Key Provider  ← NEW (solves chicken-and-egg)    │
│  6. Local Docker Registry ← NEW (uses certs from step 2)    │
└─────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│ DSTACK INSTALLATION (6 steps)                               │
│                                                             │
│  1. System Baseline Dependencies                            │
│  2. Rust Toolchain Installation                             │
│  3. Clone & Build VMM                                       │
│  4. VMM Configuration                                       │
│  5. VMM Service Setup                                       │
│  6. Guest Image Setup                                       │
└─────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│ KMS DEPLOYMENT (5 steps)  ← NOW BEFORE GATEWAY              │
│                                                             │
│  1. Smart Contract Compilation   ← LOCAL (user's machine)   │
│  2. Contract Deployment          ← LOCAL (private key here) │
│  3. KMS Build & Configuration    ← SERVER                   │
│  4. KMS Bootstrap                ← SERVER                   │
│  5. KMS CVM Deployment           ← SERVER                   │
│        │                                                    │
│        ├── Requires: Guest images (from dstack Installation)│
│        ├── Requires: PCCS configured (from Prerequisites)   │
│        ├── Requires: Gramine Key Provider (from Prereqs)    │
│        ├── Requires: Local Docker registry (from Prereqs)   │
│        └── Requires: Contract addresses from local deploy   │
└─────────────────────────────────────────────────────────────┘
        │
        ▼
     KMS CVM Running
     - Ports 8083/8084 responding
     - Attestation quotes generated
     - Root key bootstrapped
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│ GATEWAY DEPLOYMENT (2 steps)  ← NOW AFTER KMS               │
│                                                             │
│  1. Gateway Build & Configuration                           │
│  2. Gateway Service Setup                                   │
│        │                                                    │
│        ├── Requires: KMS CVM running                        │
│        └── Uses: SSL certs from Prerequisites               │
└─────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│ FIRST APPLICATION (2 steps)                                 │
│                                                             │
│  1. Hello World App                                         │
│  2. Attestation Verification                                │
└─────────────────────────────────────────────────────────────┘
```

**Critical Ordering Change:** Gateway requires KMS, so KMS Deployment must come BEFORE Gateway Deployment. This is a change from the current tutorial structure.

**Verified in dstack source** (`docs/deployment.md`):
1. Deploy KMS contract
2. Deploy KMS into CVM
3. Bootstrap KMS
4. Register Gateway app in KMS (`kms:create-app`, `kms:set-gateway`)
5. Deploy Gateway into CVM

The Gateway must be registered as an app in the KMS before it can be deployed. This confirms the current tutorial ordering (Gateway → KMS) is incorrect.

### Security Model: Local vs Server Operations

**CRITICAL:** Private keys must NEVER be uploaded to the server.

| Operation | Where | Why |
|-----------|-------|-----|
| Contract compilation | LOCAL | No secrets needed |
| Contract deployment | LOCAL | Requires private key |
| Gateway app registration | LOCAL | Requires private key |
| KMS build | SERVER | Needs TDX/SGX hardware |
| KMS CVM deployment | SERVER | Needs VMM |
| Gateway CVM deployment | SERVER | Needs VMM |

**Workflow:**
1. User compiles and deploys contracts on their LOCAL machine (nix-based Linux/macOS)
2. User notes the contract addresses from deployment output
3. User SSHs to server and provides contract addresses (NOT private key)
4. Server-side tutorials use the contract addresses for KMS/Gateway configuration

**Local Environment Requirements:**
- nix-based system (NixOS, or nix on Linux/macOS)
- Node.js (for hardhat)
- Git
- Ethereum wallet with Sepolia ETH (from Blockchain Setup tutorial)

### Key Fixes Already Implemented

#### 1. SGX BIOS Configuration (add-sgx-setup-for-kms.md)

**What:** Consolidated TDX + SGX BIOS settings into single tutorial
**Why:** SGX Auto MP Registration is REQUIRED for Intel to register platform
**Where:** `tdx-bios-configuration.md`

#### 2. PCCS Configuration (make-PCK-PCCS-work.md)

**What:** New tutorial `tdx-attestation-setup.md` + playbook `configure-pccs.yml`
**Why:** PCCS needs Intel API key to fetch PCK certificates
**Where:** Host Setup section, step 5

#### 3. Guest Image Ordering (fix-kms-cvm-deployment.md)

**What:** Moved `guest-image-setup` from "First Application" to "dstack Installation"
**Why:** KMS CVM deployment needs guest images first
**Where:** `guest-image-setup.md` now step 6 in dstack Installation

#### 4. dstack Socket Mount (recent commits)

**What:** Added `/var/run/dstack/vmm.sock` mount to KMS CVM
**Why:** KMS CVM needs to communicate with host VMM
**Where:** `deploy-kms-cvm.yml`, `kms-cvm-deployment.md`

### NEW TUTORIAL: Local Development Setup

**File:** `src/content/tutorials/local-dev-setup.md`
**Section:** "Prerequisites" (step 0, before DNS - this is LOCAL machine setup)
**Prerequisites:** None (first step for local machine)

**Why in Prerequisites:**
- Contract deployment requires private key which must NEVER leave local machine
- User needs local nix environment before they can deploy contracts
- Separates security-sensitive operations from server operations

**Content:**

1. **Overview: Local vs Server Operations**
   - What runs locally: Contract compilation, deployment, signing
   - What runs on server: KMS/Gateway CVM deployment
   - Why: Private keys never touch the server

2. **Install Nix** (if not already installed)
   ```bash
   # Linux/macOS
   sh <(curl -L https://nixos.org/nix/install) --daemon
   ```

3. **Clone dstack Repository**
   ```bash
   git clone https://github.com/Dstack-TEE/dstack
   cd dstack
   ```

4. **Enter Nix Development Shell**
   ```bash
   # If using flakes
   nix develop
   # Or with nix-shell
   nix-shell
   ```

5. **Install Node.js Dependencies**
   ```bash
   cd kms/auth-eth
   npm install
   npx hardhat compile
   ```

6. **Configure Private Key**
   - Export `PRIVATE_KEY` environment variable
   - NEVER commit or share this key
   - Key should have Sepolia ETH (from Blockchain Setup tutorial)

7. **Verification**
   - Verify hardhat compiles successfully
   - Verify can connect to Sepolia RPC
   - Note: Actual deployment happens in KMS tutorials

**Note:** No Ansible playbook for this - it's a local machine setup, not server automation.

---

### NEW TUTORIAL: SSL Certificate Setup

**File:** `src/content/tutorials/ssl-certificate-setup.md`
**Section:** "Prerequisites" (step 2, after DNS Configuration)
**Prerequisites:** DNS Configuration (needs DNS records to exist)

**Why consolidated in Prerequisites:**
- Multiple components need SSL certs (Registry, Gateway, potentially KMS)
- Doing it once upfront is simpler than scattering across tutorials
- Let's Encrypt rate limits - better to get all certs in one session
- Users understand the full SSL picture before diving into components

**Content:**

1. **Overview**
   - What certificates are needed and why
   - Components that will use them: Registry, Gateway

2. **Prerequisites**
   - Cloudflare DNS configured (from previous tutorial)
   - Domain: `hosted.dstack.info` (or user's domain)
   - Port 80 accessible for Let's Encrypt HTTP-01 challenge

3. **Install Certbot**
   ```bash
   sudo apt install certbot
   ```

4. **Obtain Wildcard Certificate** (for Gateway)
   - Use Cloudflare DNS plugin for wildcard
   - `certbot certonly --dns-cloudflare -d "*.hosted.dstack.info"`
   - Or use HTTP-01 for specific subdomains

5. **Obtain Registry Certificate**
   - `certbot certonly --standalone -d registry.hosted.dstack.info`
   - Certs stored in `/etc/letsencrypt/live/registry.hosted.dstack.info/`

6. **Set Up Certificate Directories**
   - Copy/symlink certs for Registry: `/etc/docker/registry/certs/`
   - Note Gateway cert location for later use

7. **Verification**
   - Check cert files exist
   - Check expiration dates
   - Note renewal process (certbot renew)

**Playbook:** `setup-ssl-certificates.yml`
- Install certbot and plugins
- Obtain certificates for all required domains
- Set up certificate directories
- Configure auto-renewal

---

### NEW TUTORIAL: Gramine Sealing Key Provider

**File:** `src/content/tutorials/gramine-key-provider.md`
**Section:** "Prerequisites" (step 5, after TDX Attestation Setup)
**Prerequisites:** TDX Attestation Setup (needs SGX devices + PCCS configured)

**Why in Prerequisites:**
- Gramine Key Provider must be running BEFORE any KMS or CVM deployment
- It's foundational infrastructure, like DNS or blockchain wallet
- Users need to understand this is a HOST-level component, not a CVM

**Content:**

1. **Understanding the Chicken-and-Egg Problem**
   - KMS CVM needs sealing keys to boot
   - But KMS provides sealing keys
   - Solution: SGX-based key provider on the HOST

2. **Prerequisites**
   - SGX devices present (`/dev/sgx_enclave`, `/dev/sgx_provision`)
   - Docker installed and running
   - PCCS configured with Intel API key

3. **Build Gramine Key Provider**
   - Clone dstack repository (or use existing)
   - Navigate to `key-provider-build/`
   - Build Docker images: `docker compose build`

4. **Deploy Gramine Key Provider**
   - Start services: `docker compose up -d`
   - Verify aesmd is running
   - Verify gramine-sealing-key-provider on `127.0.0.1:3443`

5. **Verification**
   - Check logs for successful startup
   - Verify SGX enclave initialization

**Playbook:** `setup-gramine-key-provider.yml`
- Clone/update dstack repository
- Build Docker images
- Start containers
- Verify health

### NEW TUTORIAL: Local Docker Registry

**File:** `src/content/tutorials/local-docker-registry.md`
**Section:** "Prerequisites" (step 6, after Gramine Key Provider)
**Prerequisites:** SSL Certificate Setup (certs already obtained)

**Why in Prerequisites:**
- Local registry must be running BEFORE KMS CVM deployment
- Uses SSL certificates from step 2 (already available)
- Simpler for users - all prerequisites together before KMS section

**Content:**

1. **Why Local Registry?**
   - Docker Hub rate limits and network reliability
   - CVM boot needs reliable image access
   - Local registry with SSL ensures consistent pulls

2. **Prerequisites**
   - Docker installed and running
   - SSL certificates available (from SSL Certificate Setup tutorial)
   - DNS record for `registry.<domain>` already configured

3. **Verify SSL Certificates Exist**
   - Check `/etc/letsencrypt/live/registry.hosted.dstack.info/`
   - Verify certs copied to `/etc/docker/registry/certs/`

4. **Deploy Registry Container**
   ```bash
   docker run -d \
     --name registry \
     --restart always \
     -p 443:443 \
     -v /etc/docker/registry/certs:/certs \
     -v /var/lib/registry:/var/lib/registry \
     -e REGISTRY_HTTP_ADDR=0.0.0.0:443 \
     -e REGISTRY_HTTP_TLS_CERTIFICATE=/certs/fullchain.pem \
     -e REGISTRY_HTTP_TLS_KEY=/certs/privkey.pem \
     registry:2
   ```

6. **Cache KMS Image**
   - Pull from Docker Hub: `docker pull dstack0/dstack-kms:0.5.5`
   - Tag for local registry: `docker tag dstack0/dstack-kms:0.5.5 registry.hosted.dstack.info/dstack-kms:0.5.5`
   - Push to local registry: `docker push registry.hosted.dstack.info/dstack-kms:0.5.5`

7. **Verification**
   - Check registry catalog: `curl -sk https://registry.hosted.dstack.info/v2/_catalog`
   - Should show: `{"repositories":["dstack-kms"]}`

**Playbook:** `setup-local-registry.yml`
- Create DNS record (or verify exists)
- Obtain Let's Encrypt certificate
- Deploy registry container
- Cache required images
- Verify health

## Execution Plan

**PRIORITY: Get KMS CVM running. Everything else waits.**

### Current Blockers

*Updated as we discover issues:*

1. **[UNKNOWN]** KMS CVM not deployed - need to attempt deployment and see what fails
2. **[UNKNOWN]** Gateway not running - may or may not be required for KMS
3. **[UNKNOWN]** Contract deployment status - need to verify contracts are deployed

### Immediate Next Steps

1. **Check current contract deployment status** (on local machine or server)
2. **Deploy contracts if needed** (from LOCAL machine)
3. **Attempt KMS CVM deployment** on server
4. **Document what fails**
5. **Fix and retry**

### Server State (173.231.234.133)

Last verified: 2025-12-08

| Component | Status | Notes |
|-----------|--------|-------|
| TDX Kernel | ✅ | `6.8.0-1028-intel` |
| SGX Devices | ✅ | Present |
| PCCS | ✅ | Intel API key configured |
| Gramine Key Provider | ✅ | `localhost:3443` |
| Local Registry | ✅ | `registry.hosted.dstack.info:443` |
| VMM | ✅ | Running |
| Guest Images | ✅ | `dstack-0.5.5` |
| **Gateway** | ❌ | NOT deployed |
| **KMS CVM** | ❌ | NOT deployed |
| **KMS Contracts** | ❓ | Need to verify |

### After KMS Works

Only after we have a working KMS CVM:
1. Document exactly what we did
2. Create tutorials based on actual working steps
3. Create Ansible playbooks
4. Test fresh OS deployment

## Open Questions

- [x] ~~What was the exact race condition?~~ **RESOLVED:** KMS CVM needs sealing keys to boot, but KMS provides keys. Solution: Gramine Sealing Key Provider on HOST using SGX.
- [x] ~~Is local Docker registry required?~~ **RESOLVED:** Yes, confirmed required for reliable image pulls.
- [x] ~~Should Gramine Key Provider tutorial be in "Prerequisites" section or a new "Infrastructure" section?~~ **RESOLVED:** Prerequisites section.
- [x] ~~Should Gateway deployment happen BEFORE or AFTER KMS?~~ **RESOLVED:** Gateway requires KMS, so KMS comes first.
- [x] ~~What is the exact ordering dependency between Gateway SSL certs and Registry SSL certs?~~ **RESOLVED:** Consolidate ALL SSL setup into a single Prerequisites tutorial (step 2). Both Gateway and Registry use certs from this step.

**All major questions resolved.**

## Alternatives Considered

### Alternative 1: Create umbrella "KMS Quick Deploy" script
**Deferred:** Would bypass the educational value of tutorials. Better to fix individual tutorials.

### Alternative 2: Pre-built KMS CVM image with all dependencies
**Rejected:** Defeats the purpose of understanding the deployment chain.

### Alternative 3: Cloud-based DCAP proxy instead of local PCCS
**Deferred:** Adds complexity and may not work for all deployments.

## Traceability

*Filled in during implementation*

| Requirement | Implementation | Tests |
|-------------|----------------|-------|
| End-to-end validation | Manual test on fresh OS | KMS health check |
| Prerequisites chain | Tutorial frontmatter | Build + unit tests |
| Ansible automation | Playbook sequence | Run all playbooks |

## Changelog

| Date | Author | Changes |
|------|--------|---------|
| 2025-12-08 | Claude | Initial draft consolidating multiple KMS fix specs |
| 2025-12-08 | Claude | Added server state assessment - discovered Gramine Key Provider and Local Registry already running |
| 2025-12-08 | Claude | Documented race condition solution (Gramine SGX-based key provider) |
| 2025-12-08 | Claude | Added detailed tutorial designs for gramine-key-provider.md and local-docker-registry.md |
| 2025-12-08 | Claude | Moved Gramine + Registry to Prerequisites section (per user feedback) |
| 2025-12-08 | Claude | Updated verification plan based on actual server state |
| 2025-12-08 | Claude | **MAJOR:** Reordered sections - KMS before Gateway (Gateway requires KMS) |
| 2025-12-08 | Claude | **MAJOR:** Consolidated SSL setup into single Prerequisites tutorial (step 2) |
| 2025-12-08 | Claude | All open questions resolved |
| 2025-12-08 | Claude | Verified KMS→Gateway ordering against dstack source docs/deployment.md |
| 2025-12-08 | Claude | **SECURITY:** Contract deployment moves to LOCAL machine (private key never on server) |
| 2025-12-08 | Claude | Added Local Development Setup tutorial for nix-based environment |
| 2025-12-08 | Claude | **APPROACH CHANGE:** Focus on getting KMS running first, tutorials come after |
| 2025-12-08 | Claude | Added Deployment Log section - spec is now a living document |

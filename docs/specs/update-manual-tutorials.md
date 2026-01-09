# Update Manual Tutorials to Match site.yml

**Status:** DRAFT
**Author:** Claude
**Created:** 2026-01-08
**Last Updated:** 2026-01-08

## Overview

The manual tutorials should walk users through the exact same steps that `site.yml` performs via Ansible. Each tutorial corresponds to a specific playbook and describes the manual commands that achieve the same result.

**Key Principle:** Ansible playbooks are authoritative. Tutorials are the manual version of what each playbook does.

## Requirements

### Must Have
- [ ] Each tutorial maps 1:1 to a playbook called by site.yml
- [ ] Tutorial content describes the manual steps equivalent to the playbook
- [ ] Tutorial section and stepNumber match site.yml phase structure
- [ ] All dev mode/staging references removed
- [ ] Tutorials for missing playbooks created

### Must NOT Have
- Changes to any Ansible playbooks
- Dev mode, staging, or development environment references
- Tutorials that don't correspond to site.yml playbooks

## site.yml to Tutorial Mapping

### Phase 0: Pre-Deployment (Local Machine)

| site.yml Phase | Playbook | Tutorial | Status |
|----------------|----------|----------|--------|
| Config Validation | (inline in site.yml) | N/A - covered in quick-start | - |
| Contract Deployment | (inline + deploy-contracts-local.yml) | contract-deployment.md | UPDATE |

**Contract Deployment Issue:**
- site.yml runs contract deployment on LOCALHOST in Phase 0.1
- Current tutorials (`smart-contract-compilation.md` + `contract-deployment.md`) describe server-side deployment
- **Fix:** Consolidate into one tutorial that matches the local deployment flow

### Phase 1: Host Setup

| Step | Playbook | Tutorial | Status |
|------|----------|----------|--------|
| 1.1 | setup-tdx-host.yml | tdx-software-installation.md | OK |
| 1.2 | verify-tdx.yml | tdx-sgx-verification.md | OK |

**Pre-Ansible tutorials (no playbook):**
- `tdx-hardware-verification.md` - Manual hardware check, keep as step 1
- `tdx-bios-configuration.md` - Manual BIOS setup, keep as step 2

**Current structure (OK):**
1. tdx-hardware-verification.md (manual)
2. tdx-bios-configuration.md (manual)
3. tdx-software-installation.md → setup-tdx-host.yml
4. tdx-sgx-verification.md → verify-tdx.yml

### Phase 2: Prerequisites

| Step | Playbook | Tutorial | Status |
|------|----------|----------|--------|
| 2.1 | verify-dns.yml | dns-configuration.md | OK |
| 2.2 | setup-ssl-certificates.yml | ssl-certificate-setup.md | OK |
| 2.3 | configure-pccs.yml | tdx-attestation-setup.md | MOVE from Host Setup |
| 2.4 | setup-docker.yml | (missing) | CREATE |
| 2.5 | setup-gramine-key-provider.yml | gramine-key-provider.md | UPDATE stepNumber |
| 2.6 | setup-local-registry.yml | local-docker-registry.md | UPDATE stepNumber |

**Issues:**
1. `tdx-attestation-setup.md` is in "Host Setup" section but playbook runs in Prerequisites
2. No tutorial for `setup-docker.yml`
3. `blockchain-setup.md` is in Prerequisites but should be in Pre-Deployment (local setup)

### Phase 3: dstack Installation

| Step | Playbook | Tutorial | Status |
|------|----------|----------|--------|
| 3.1 | setup-host-dependencies.yml | system-baseline-dependencies.md | OK |
| 3.2 | setup-rust-toolchain.yml | rust-toolchain-installation.md | OK |
| 3.3 | build-dstack-vmm.yml | clone-build-dstack-vmm.md | OK |
| 3.4 | setup-vmm-config.yml | vmm-configuration.md | OK |
| 3.5 | setup-vmm-service.yml | vmm-service-setup.md | OK |
| 3.6 | setup-guest-images.yml | guest-image-setup.md | OK |

**Status:** This section is correct.

### Phase 4: KMS Deployment

| Step | Playbook | Tutorial | Status |
|------|----------|----------|--------|
| 4.1 | build-kms.yml | kms-build-configuration.md | OK |
| 4.2 | deploy-kms-cvm.yml | kms-cvm-deployment.md | OK |
| 4.3 | verify-kms-cvm.yml | (part of above) | OK |

**Issues:**
1. `smart-contract-compilation.md` - No playbook in site.yml KMS phase (contracts deploy in Phase 0)
2. `contract-deployment.md` - No playbook in site.yml KMS phase (contracts deploy in Phase 0)
3. `kms-bootstrap.md` - Bootstrap happens inside deploy-kms-cvm.yml, not separate
4. `kms-service-setup.md` - No playbook `setup-kms-services.yml` in site.yml

### Phase 5: Gateway Deployment

| Step | Playbook | Tutorial | Status |
|------|----------|----------|--------|
| 5.1 | build-gateway.yml | gateway-build-configuration.md | UPDATE stepNumber |
| 5.2 | setup-gateway-service.yml | gateway-service-setup.md | UPDATE stepNumber |
| 5.3 | verify-gateway.yml | (part of above) | OK |

**Issues:**
1. `gateway-ssl-setup.md` - No playbook `setup-gateway-ssl.yml` in site.yml

## Implementation Plan

### 1. Reorganize Sections

#### New Section: "Pre-Deployment" (runs on local machine)

| Step | Tutorial | Maps To |
|------|----------|---------|
| 1 | blockchain-setup.md | Local wallet/API key setup |
| 2 | contract-deployment.md | Local contract deployment (Phase 0.1) |

**Changes:**
- `blockchain-setup.md`: Move from Prerequisites to "Pre-Deployment", stepNumber: 1
- `contract-deployment.md`: Move from KMS Deployment to "Pre-Deployment", stepNumber: 2
- `smart-contract-compilation.md`: MERGE into contract-deployment.md (compilation is part of deployment)

#### Section: "Host Setup" (steps 1-4)

| Step | Tutorial |
|------|----------|
| 1 | tdx-hardware-verification.md |
| 2 | tdx-bios-configuration.md |
| 3 | tdx-software-installation.md |
| 4 | tdx-sgx-verification.md |

**Changes:**
- REMOVE `tdx-attestation-setup.md` from this section (moves to Prerequisites)
- Update totalSteps from 5 to 4

#### Section: "Prerequisites" (steps 1-6)

| Step | Tutorial | Playbook |
|------|----------|----------|
| 1 | dns-configuration.md | verify-dns.yml |
| 2 | ssl-certificate-setup.md | setup-ssl-certificates.yml |
| 3 | pccs-configuration.md | configure-pccs.yml |
| 4 | docker-setup.md | setup-docker.yml |
| 5 | gramine-key-provider.md | setup-gramine-key-provider.yml |
| 6 | local-docker-registry.md | setup-local-registry.yml |

**Changes:**
- RENAME `tdx-attestation-setup.md` → `pccs-configuration.md`
- MOVE to Prerequisites section, stepNumber: 3
- CREATE `docker-setup.md` for stepNumber: 4
- UPDATE `gramine-key-provider.md`: stepNumber: 5, totalSteps: 6
- UPDATE `local-docker-registry.md`: stepNumber: 6, totalSteps: 6
- REMOVE `blockchain-setup.md` from Prerequisites (moved to Pre-Deployment)

#### Section: "KMS Deployment" (steps 1-2)

| Step | Tutorial | Playbook |
|------|----------|----------|
| 1 | kms-build-configuration.md | build-kms.yml |
| 2 | kms-cvm-deployment.md | deploy-kms-cvm.yml + verify-kms-cvm.yml |

**Changes:**
- REMOVE `smart-contract-compilation.md` (merged into Pre-Deployment/contract-deployment.md)
- REMOVE `contract-deployment.md` from this section (moved to Pre-Deployment)
- UPDATE `kms-build-configuration.md`: stepNumber: 1, totalSteps: 2
- UPDATE `kms-cvm-deployment.md`: stepNumber: 2, totalSteps: 2
- MERGE `kms-bootstrap.md` content into `kms-cvm-deployment.md` (bootstrap is part of deploy)
- DELETE `kms-bootstrap.md`
- DELETE `kms-service-setup.md` (no corresponding playbook)

#### Section: "Gateway Deployment" (steps 1-2)

| Step | Tutorial | Playbook |
|------|----------|----------|
| 1 | gateway-build-configuration.md | build-gateway.yml |
| 2 | gateway-service-setup.md | setup-gateway-service.yml + verify-gateway.yml |

**Changes:**
- DELETE `gateway-ssl-setup.md` (no corresponding playbook, SSL is in Prerequisites)
- UPDATE `gateway-build-configuration.md`: stepNumber: 1, totalSteps: 2
- UPDATE `gateway-service-setup.md`: stepNumber: 2, totalSteps: 2

### 2. Content Updates

#### contract-deployment.md (major rewrite)

The current tutorial describes:
- Server-side contract compilation
- Uploading wallet credentials TO the server
- Running deployment on the server

**Must be changed to match site.yml Phase 0.1:**
- LOCAL contract deployment (private key never leaves local machine)
- Clone dstack repo locally
- Run `npx hardhat kms:deploy --with-app-impl --network sepolia`
- Save contract addresses to `ansible/vars/contract-addresses.yml`

#### pccs-configuration.md (renamed from tdx-attestation-setup.md)

Update content to match what `configure-pccs.yml` actually does:
- Update API key in /opt/intel/sgx-dcap-pccs/config/default.json
- Configure PCCS to listen on 0.0.0.0 (for CVM access)
- Regenerate SSL certificate with SANs for 10.0.2.2
- Restart PCCS service

#### docker-setup.md (new)

Create tutorial matching `setup-docker.yml`:
- Install prerequisites (ca-certificates, curl, gnupg)
- Add Docker GPG key
- Add Docker repository
- Install docker-ce, docker-ce-cli, containerd.io, docker-buildx-plugin, docker-compose-plugin
- Start Docker service
- Add user to docker group

#### ssl-certificate-setup.md

Update to match what `setup-ssl-certificates.yml` does:
- Install certbot and nginx plugin
- Obtain registry certificate via HTTP-01 challenge
- Copy certificates to /etc/docker/registry/certs/
- Set up renewal hook
- Enable certbot.timer

Note: Wildcard certs for gateway are NOT in this playbook.

#### kms-cvm-deployment.md

Merge bootstrap verification content from `kms-bootstrap.md`:
- Deploy KMS CVM via VMM API
- Wait for bootstrap to complete
- Verify GetMeta endpoint returns valid response
- Verify K256 public key is present

### 3. Files to Modify

#### Frontmatter-only changes:

| File | Changes |
|------|---------|
| tdx-sgx-verification.md | totalSteps: 4 |
| tdx-hardware-verification.md | totalSteps: 4 |
| tdx-bios-configuration.md | totalSteps: 4 |
| tdx-software-installation.md | totalSteps: 4 |
| dns-configuration.md | totalSteps: 6 |
| ssl-certificate-setup.md | totalSteps: 6 |
| gramine-key-provider.md | stepNumber: 5, totalSteps: 6 |
| local-docker-registry.md | stepNumber: 6, totalSteps: 6 |
| kms-build-configuration.md | stepNumber: 1, totalSteps: 2 |
| kms-cvm-deployment.md | stepNumber: 2, totalSteps: 2 |
| gateway-build-configuration.md | stepNumber: 1, totalSteps: 2 |
| gateway-service-setup.md | stepNumber: 2, totalSteps: 2 |

#### Major content rewrites:

| File | Action |
|------|--------|
| blockchain-setup.md | Move to "Pre-Deployment" section, stepNumber: 1 |
| contract-deployment.md | Move to "Pre-Deployment" section, stepNumber: 2, rewrite for LOCAL deployment |
| pccs-configuration.md | RENAME from tdx-attestation-setup.md, move to Prerequisites, stepNumber: 3 |
| kms-cvm-deployment.md | Merge bootstrap content from kms-bootstrap.md |

#### Files to CREATE:

| File | Description |
|------|-------------|
| docker-setup.md | New tutorial for setup-docker.yml, Prerequisites step 4 |

#### Files to DELETE:

| File | Reason |
|------|--------|
| smart-contract-compilation.md | Merged into contract-deployment.md |
| kms-bootstrap.md | Merged into kms-cvm-deployment.md |
| kms-service-setup.md | No corresponding playbook in site.yml |
| gateway-ssl-setup.md | No corresponding playbook in site.yml (SSL is in Prerequisites) |

### 4. Component Updates

#### TutorialSidebar.svelte

Update sectionOrder to include new section:

```typescript
const sectionOrder = [
  'Pre-Deployment',  // NEW
  'Host Setup',
  'Prerequisites',
  'dstack Installation',
  'KMS Deployment',
  'Gateway Deployment',
  'First Application'
];
```

### 5. Dev Mode Removal

Search and remove references to:
- `--staging` (Let's Encrypt staging)
- "staging environment"
- "dev mode"
- "development mode"
- "for testing only"

## Open Questions

- [x] What to do with tutorials that have no site.yml playbook? **Answer: Delete or merge**
- [ ] Should "Pre-Deployment" be visible in sidebar or just mentioned in quick-start?

## Traceability

| Requirement | Implementation | Verification |
|-------------|----------------|--------------|
| 1:1 tutorial-to-playbook mapping | Reorganized sections | Compare site.yml phases to tutorial sections |
| Manual steps match playbook | Content rewrites | Run manual tutorial, compare to Ansible output |
| No dev mode references | Content audit | grep -r "staging\|dev mode" tutorials/ |

## Changelog

| Date | Author | Changes |
|------|--------|---------|
| 2026-01-08 | Claude | Initial draft - full rewrite with correct understanding |

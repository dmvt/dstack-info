# Quick Start Ansible Tutorial

**Status:** DRAFT
**Author:** Claude (with Dan Matthews)
**Created:** 2025-12-10
**Last Updated:** 2025-12-10

## Overview

The current Ansible playbook approach requires users to run 30+ individual playbooks in the correct order. While this granularity is educational, users who want to quickly deploy a working dstack environment need a streamlined path.

This spec defines a "Quick Start" tutorial that provides a single-command deployment experience using Ansible, allowing users to go from fresh Ubuntu 24.04 to running KMS CVM with minimal interaction.

## Problem Statement

### Current State

Users have two paths:
1. **Manual tutorials** (28 steps) - Educational but time-consuming
2. **Individual Ansible playbooks** (36 playbooks) - Requires running each in sequence

Neither provides a "just deploy it" experience for:
- Experienced operators who understand the concepts
- CI/CD pipelines that need automated deployment
- Re-deployment after server reformat (our current use case)
- Testing that the full tutorial chain works

### Pain Points

1. **Too many playbooks**: 36 individual playbooks means 36 commands to type
2. **No unified entry point**: No way to say "deploy everything"
3. **Error recovery unclear**: If one playbook fails, users don't know if they can skip and continue
4. **Prerequisites scattered**: Some playbooks have implicit dependencies not documented

## Requirements

### Must Have

- [ ] **Single master playbook** (`site.yml` or `full-deploy.yml`) that runs the complete stack
- [ ] **Phase-based grouping** with clear tags:
  - `host-setup` - TDX software stack
  - `prerequisites` - DNS, SSL, blockchain, PCCS, Gramine, registry
  - `dstack-install` - VMM build, config, service, images
  - `kms-deploy` - KMS contracts, build, bootstrap, CVM
  - `gateway-deploy` - Gateway build, service
- [ ] **Idempotency** - Can be run multiple times safely (skip completed steps)
- [ ] **Clear phase boundaries** - Tags allow running just one phase
- [ ] **Progress reporting** - Show which phase is running
- [ ] **Failure handling** - Clear error messages with remediation hints

### Should Have

- [ ] **Variables file** for customization (domain, wallet, RPC URL)
- [ ] **Pre-flight check playbook** that validates all prerequisites before starting
- [ ] **Quick start tutorial** (`quick-start-ansible.md`) documenting the single-command approach
- [ ] **Estimated time** per phase displayed

### Must NOT Have

- Skipping security steps (no `--skip-tags attestation`)
- Hardcoded secrets in the master playbook
- Breaking changes to existing individual playbooks (they should still work)

## Non-Requirements

- **Interactive prompts** - All input via variables file or command line
- **Rollback capability** - Too complex; users can reformat and restart
- **Partial deployment** - Either full deploy or use individual playbooks

## Design

### Master Playbook Structure

```yaml
# ansible/site.yml (or full-deploy.yml)
---
- name: Quick Start - Full dstack Deployment
  hosts: dstack_servers

  vars_files:
    - vars/quick-start.yml

  pre_tasks:
    - name: Display deployment plan
      debug:
        msg: |
          =====================================================
          dstack Quick Start Deployment
          =====================================================

          Target: {{ ansible_host }}
          Domain: {{ base_domain }}

          Phases to run:
            1. Host Setup (TDX kernel + attestation)
            2. Prerequisites (DNS, SSL, PCCS, Gramine, Registry)
            3. dstack Installation (VMM + guest images)
            4. KMS Deployment (contracts, build, CVM)
            5. Gateway Deployment (build, service)

          =====================================================

- import_playbook: playbooks/setup-tdx-host.yml
  tags: [host-setup]

- import_playbook: playbooks/verify-tdx.yml
  tags: [host-setup, verify]

# Prerequisites phase
- import_playbook: playbooks/verify-dns.yml
  tags: [prerequisites]

- import_playbook: playbooks/setup-ssl-certificates.yml
  tags: [prerequisites]

- import_playbook: playbooks/configure-pccs.yml
  tags: [prerequisites]

- import_playbook: playbooks/setup-gramine-key-provider.yml
  tags: [prerequisites]

- import_playbook: playbooks/setup-local-registry.yml
  tags: [prerequisites]

# dstack Installation phase
- import_playbook: playbooks/setup-host-dependencies.yml
  tags: [dstack-install]

- import_playbook: playbooks/setup-rust-toolchain.yml
  tags: [dstack-install]

- import_playbook: playbooks/build-dstack-vmm.yml
  tags: [dstack-install]

- import_playbook: playbooks/setup-vmm-config.yml
  tags: [dstack-install]

- import_playbook: playbooks/setup-vmm-service.yml
  tags: [dstack-install]

- import_playbook: playbooks/setup-guest-images.yml
  tags: [dstack-install]

# KMS Deployment phase
- import_playbook: playbooks/deploy-kms-contracts.yml
  tags: [kms-deploy]

- import_playbook: playbooks/build-kms.yml
  tags: [kms-deploy]

- import_playbook: playbooks/deploy-kms-cvm.yml
  tags: [kms-deploy]

- import_playbook: playbooks/verify-kms-cvm.yml
  tags: [kms-deploy, verify]

# Gateway Deployment phase
- import_playbook: playbooks/build-gateway.yml
  tags: [gateway-deploy]

- import_playbook: playbooks/setup-gateway-service.yml
  tags: [gateway-deploy]

- import_playbook: playbooks/verify-gateway.yml
  tags: [gateway-deploy, verify]

# Final verification
- import_playbook: playbooks/verify-deployment.yml
  tags: [verify]
```

### Variables File

```yaml
# ansible/vars/quick-start.yml
---
# Domain configuration
base_domain: "hosted.dstack.info"
registry_domain: "registry.{{ base_domain }}"
gateway_domain: "gateway.{{ base_domain }}"
kms_domain: "kms.{{ base_domain }}"

# Ethereum/Blockchain (Sepolia testnet)
eth_rpc_url: "https://ethereum-sepolia.publicnode.com"
kms_contract_address: ""  # Will be set after contract deployment

# Intel PCCS (user must obtain from Intel)
intel_pccs_api_key: ""  # REQUIRED - get from Intel API portal

# dstack versions
dstack_version: "0.5.5"
guest_image_version: "dstack-0.5.5"

# Feature flags
enable_attestation: true
skip_contract_deployment: false  # Set true if contracts already deployed
```

### Tutorial Content Outline

**File:** `src/content/tutorials/quick-start-ansible.md`
**Section:** "Host Setup" (appendix, like existing ansible-tdx-automation.md)

```markdown
# Quick Start: Deploy dstack with Ansible

Deploy a complete dstack environment with a single command.

## Prerequisites

Before starting:
1. Fresh Ubuntu 24.04 LTS server with TDX-capable CPU
2. BIOS configured for TDX and SGX (see BIOS Configuration tutorial)
3. Ansible installed on your local machine
4. SSH access to the server (ubuntu user with sudo)
5. Intel PCCS API key from Intel portal
6. Ethereum wallet with Sepolia ETH

## Quick Start

### Step 1: Clone and Configure

```bash
git clone https://github.com/dmvt/dstack-info.git
cd dstack-info/ansible

# Copy example configuration
cp vars/quick-start.example.yml vars/quick-start.yml
cp inventory/hosts.example.yml inventory/hosts.yml

# Edit configuration
vim vars/quick-start.yml  # Set your domain, Intel API key
vim inventory/hosts.yml   # Set your server IP
```

### Step 2: Deploy Everything

```bash
ansible-playbook site.yml -i inventory/hosts.yml
```

This single command will:
1. Install TDX kernel and reboot
2. Configure PCCS with your Intel API key
3. Deploy Gramine key provider
4. Set up local Docker registry with SSL
5. Build and configure VMM
6. Download guest images
7. Deploy KMS contracts (if not already deployed)
8. Deploy KMS as a CVM
9. Build and deploy Gateway

Estimated time: 45-60 minutes (including reboot)

### Step 3: Verify

```bash
# Check KMS is responding
curl -sk https://127.0.0.1:9103/prpc/KMS.GetMeta | head -c 200

# Check Gateway is running
systemctl status dstack-gateway
```

## Running Specific Phases

Use tags to run only certain phases:

```bash
# Just host setup (TDX kernel)
ansible-playbook site.yml -i inventory/hosts.yml --tags host-setup

# Just KMS deployment
ansible-playbook site.yml -i inventory/hosts.yml --tags kms-deploy

# All verification steps
ansible-playbook site.yml -i inventory/hosts.yml --tags verify
```

## Troubleshooting

### Playbook fails partway through

The playbook is idempotent - just run it again. Completed steps will be skipped.

### Reboot required but connection lost

After TDX kernel installation, the server reboots. Wait 2-3 minutes and re-run the playbook.

### KMS CVM fails to start

Check prerequisites:
```bash
ansible-playbook playbooks/verify-tdx.yml -i inventory/hosts.yml
ansible-playbook playbooks/verify-pccs-config.yml -i inventory/hosts.yml
```
```

### Phase Diagram

```
Fresh Ubuntu 24.04
       │
       ▼
┌──────────────────┐
│   site.yml       │  Single entry point
└────────┬─────────┘
         │
   ┌─────┴─────┐
   ▼           ▼
[Reboot]   [Continue]
   │           │
   └─────┬─────┘
         │
   ┌─────┴─────────────────────────────────────────┐
   │                                               │
   ▼                                               │
┌──────────────┐                                   │
│ host-setup   │ setup-tdx-host.yml                │
│              │ verify-tdx.yml                    │
└──────┬───────┘                                   │
       │                                           │
       ▼                                           │
┌──────────────┐                                   │
│prerequisites │ verify-dns.yml                    │
│              │ setup-ssl-certificates.yml        │
│              │ configure-pccs.yml                │
│              │ setup-gramine-key-provider.yml    │
│              │ setup-local-registry.yml          │
└──────┬───────┘                                   │
       │                                           │
       ▼                                           │
┌──────────────┐                                   │
│dstack-install│ setup-host-dependencies.yml       │
│              │ setup-rust-toolchain.yml          │
│              │ build-dstack-vmm.yml              │
│              │ setup-vmm-config.yml              │
│              │ setup-vmm-service.yml             │
│              │ setup-guest-images.yml            │
└──────┬───────┘                                   │
       │                                           │
       ▼                                           │
┌──────────────┐                                   │
│  kms-deploy  │ deploy-kms-contracts.yml          │
│              │ build-kms.yml                     │
│              │ deploy-kms-cvm.yml                │
│              │ verify-kms-cvm.yml                │
└──────┬───────┘                                   │
       │                                           │
       ▼                                           │
┌──────────────┐                                   │
│gateway-deploy│ build-gateway.yml                 │
│              │ setup-gateway-service.yml         │
│              │ verify-gateway.yml                │
└──────┬───────┘                                   │
       │                                           │
       ▼                                           │
┌──────────────┐                                   │
│    verify    │ verify-deployment.yml             │
└──────────────┘                                   │
                                                   │
   KMS CVM Running + Gateway Active ◄──────────────┘
```

## Implementation Plan

### Phase 1: Create Infrastructure

1. Create `ansible/site.yml` master playbook
2. Create `ansible/vars/quick-start.yml` variables template
3. Create `ansible/vars/quick-start.example.yml` with documentation
4. Update `ansible/inventory/hosts.example.yml` if needed

### Phase 2: Fill Gaps

Some playbooks referenced above may not exist yet:
- `setup-ssl-certificates.yml` - needs creation (from ssl-certificate-setup tutorial)
- `setup-gramine-key-provider.yml` - needs creation (from gramine-key-provider tutorial)
- `setup-local-registry.yml` - needs creation (from local-docker-registry tutorial)

These need to be created to match their corresponding tutorials.

### Phase 3: Write Tutorial

1. Create `src/content/tutorials/quick-start-ansible.md`
2. Update `ansible-tdx-automation.md` to reference quick-start option
3. Test end-to-end on freshly formatted server

### Phase 4: Validate

1. Format server via OpenMetal IPMI
2. Run single `ansible-playbook site.yml` command
3. Verify KMS CVM responding
4. Verify Gateway running
5. Document any issues and fix

## Open Questions

1. **Contract deployment location**: Should contracts be deployed from local machine (secure) or can we add a task that uploads the wallet key temporarily?
   - **Leaning toward**: Keep contract deployment local, have users provide contract addresses in vars file

2. **Reboot handling**: Ansible loses connection during TDX kernel reboot. Options:
   - Use `wait_for_connection` after reboot
   - Document "run again after reboot"
   - **Leaning toward**: Use `wait_for_connection` for seamless experience

3. **Intel PCCS API key**: Should we prompt for this or require it in vars file?
   - **Leaning toward**: Require in vars file, fail early if not set

## Alternatives Considered

### Alternative 1: Single monolithic playbook

**Rejected**: Would be 1000+ lines, hard to maintain, doesn't allow running phases independently.

### Alternative 2: Bash script wrapper

**Rejected**: Loses Ansible's idempotency and error handling benefits.

### Alternative 3: Keep individual playbooks only

**Current state**: Works but requires 36 commands. Quick start provides better UX for common case.

## Traceability

| Requirement | Implementation | Tests |
|-------------|----------------|-------|
| Master playbook | `ansible/site.yml` | Run end-to-end |
| Variables file | `ansible/vars/quick-start.yml` | Validate required vars |
| Tutorial | `quick-start-ansible.md` | Build + deploy test |
| Tag support | Tags in site.yml | Run with `--tags` |

## Changelog

| Date | Author | Changes |
|------|--------|---------|
| 2025-12-10 | Claude | Initial draft |

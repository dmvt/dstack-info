# Quick Start Ansible Tutorial

**Status:** IMPLEMENTING
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

- [ ] **Local contract deployment playbook** (`deploy-contracts-local.yml`) that runs on localhost
- [ ] **Single master playbook** (`site.yml`) that runs the complete server stack
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

Deploy a complete dstack environment with two commands.

## Prerequisites

Before starting:
1. Fresh Ubuntu 24.04 LTS server with TDX-capable CPU
2. BIOS configured for TDX and SGX (see BIOS Configuration tutorial)
3. Ansible installed on your local machine
4. SSH access to the server (ubuntu user with sudo)
5. Intel PCCS API key from Intel portal
6. Ethereum wallet with Sepolia ETH (private key on local machine)
7. dstack repository cloned locally (`~/dstack`)

## Quick Start

### Step 1: Clone and Configure

```bash
git clone https://github.com/dmvt/dstack-info.git
cd dstack-info/ansible

# Copy example configuration
cp vars/quick-start.example.yml vars/quick-start.yml
cp vars/local-secrets.example.yml vars/local-secrets.yml
cp inventory/hosts.example.yml inventory/hosts.yml

# Edit configuration
vim vars/quick-start.yml    # Set your domain, Intel API key
vim vars/local-secrets.yml  # Set your private key (NEVER commit!)
vim inventory/hosts.yml     # Set your server IP
```

### Step 2: Deploy Contracts (Local)

This runs on your LOCAL machine - private key never leaves your computer:

```bash
ansible-playbook playbooks/deploy-contracts-local.yml
```

This will:
- Compile the KMS smart contracts
- Deploy them to Sepolia testnet
- Save contract addresses to `vars/contract-addresses.yml`

### Step 3: Deploy Server Infrastructure

```bash
ansible-playbook site.yml -i inventory/hosts.yml
```

This deploys everything to your server:
1. Install TDX kernel and reboot
2. Configure PCCS with your Intel API key
3. Deploy Gramine key provider
4. Set up local Docker registry with SSL
5. Build and configure VMM
6. Download guest images
7. Deploy KMS as a CVM (using contract addresses from Step 2)
8. Build and deploy Gateway

Estimated time: 45-60 minutes (including reboot)

### Step 4: Verify

```bash
# Check KMS is responding
ssh ubuntu@YOUR_SERVER "curl -sk https://127.0.0.1:9103/prpc/KMS.GetMeta | head -c 200"

# Or run verification playbook
ansible-playbook playbooks/verify-deployment.yml -i inventory/hosts.yml
```

## Running Specific Phases

Use tags to run only certain phases:

```bash
# Just host setup (TDX kernel)
ansible-playbook site.yml -i inventory/hosts.yml --tags host-setup

# Just KMS deployment (requires contracts deployed first)
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

### Contract deployment fails

Ensure:
- `~/dstack` repository exists on your LOCAL machine
- Private key in `vars/local-secrets.yml` has Sepolia ETH
- RPC endpoint in `vars/quick-start.yml` is working

## Manual Approach: Run Playbooks Individually

If you prefer to run each step individually (recommended for learning), here are the playbooks in order with links to the full manual tutorials.

### Phase 1: Host Setup

| Step | Playbook | Manual Tutorial |
|------|----------|-----------------|
| 1 | `setup-tdx-host.yml` | [TDX Software Installation](/tutorial/tdx-software-installation) |
| 2 | `verify-tdx.yml` | [TDX & SGX Verification](/tutorial/tdx-sgx-verification) |

```bash
ansible-playbook playbooks/setup-tdx-host.yml -i inventory/hosts.yml
# Wait for reboot...
ansible-playbook playbooks/verify-tdx.yml -i inventory/hosts.yml
```

### Phase 2: Prerequisites

| Step | Playbook | Manual Tutorial |
|------|----------|-----------------|
| 1 | `verify-dns.yml` | [DNS Configuration](/tutorial/dns-configuration) |
| 2 | `setup-ssl-certificates.yml` | [SSL Certificate Setup](/tutorial/ssl-certificate-setup) |
| 3 | `configure-pccs.yml` | [TDX Attestation Setup](/tutorial/tdx-attestation-setup) |
| 4 | `setup-gramine-key-provider.yml` | [Gramine Key Provider](/tutorial/gramine-key-provider) |
| 5 | `setup-local-registry.yml` | [Local Docker Registry](/tutorial/local-docker-registry) |

```bash
ansible-playbook playbooks/verify-dns.yml -i inventory/hosts.yml
ansible-playbook playbooks/setup-ssl-certificates.yml -i inventory/hosts.yml
ansible-playbook playbooks/configure-pccs.yml -i inventory/hosts.yml
ansible-playbook playbooks/setup-gramine-key-provider.yml -i inventory/hosts.yml
ansible-playbook playbooks/setup-local-registry.yml -i inventory/hosts.yml
```

### Phase 3: dstack Installation

| Step | Playbook | Manual Tutorial |
|------|----------|-----------------|
| 1 | `setup-host-dependencies.yml` | [System Baseline Dependencies](/tutorial/system-baseline-dependencies) |
| 2 | `setup-rust-toolchain.yml` | [Rust Toolchain Installation](/tutorial/rust-toolchain-installation) |
| 3 | `build-dstack-vmm.yml` | [Clone & Build VMM](/tutorial/clone-build-vmm) |
| 4 | `setup-vmm-config.yml` | [VMM Configuration](/tutorial/vmm-configuration) |
| 5 | `setup-vmm-service.yml` | [VMM Service Setup](/tutorial/vmm-service-setup) |
| 6 | `setup-guest-images.yml` | [Guest Image Setup](/tutorial/guest-image-setup) |

```bash
ansible-playbook playbooks/setup-host-dependencies.yml -i inventory/hosts.yml
ansible-playbook playbooks/setup-rust-toolchain.yml -i inventory/hosts.yml
ansible-playbook playbooks/build-dstack-vmm.yml -i inventory/hosts.yml
ansible-playbook playbooks/setup-vmm-config.yml -i inventory/hosts.yml
ansible-playbook playbooks/setup-vmm-service.yml -i inventory/hosts.yml
ansible-playbook playbooks/setup-guest-images.yml -i inventory/hosts.yml
```

### Phase 4: KMS Deployment

| Step | Playbook | Manual Tutorial |
|------|----------|-----------------|
| 1 | `deploy-contracts-local.yml` | [Smart Contract Compilation](/tutorial/smart-contract-compilation) |
| 2 | `build-kms.yml` | [KMS Build & Configuration](/tutorial/kms-build-configuration) |
| 3 | `deploy-kms-cvm.yml` | [KMS CVM Deployment](/tutorial/kms-cvm-deployment) |
| 4 | `verify-kms-cvm.yml` | [KMS CVM Deployment](/tutorial/kms-cvm-deployment#verification) |

```bash
# Run locally first (contracts)
ansible-playbook playbooks/deploy-contracts-local.yml

# Then on server
ansible-playbook playbooks/build-kms.yml -i inventory/hosts.yml
ansible-playbook playbooks/deploy-kms-cvm.yml -i inventory/hosts.yml
ansible-playbook playbooks/verify-kms-cvm.yml -i inventory/hosts.yml
```

### Phase 5: Gateway Deployment

| Step | Playbook | Manual Tutorial |
|------|----------|-----------------|
| 1 | `build-gateway.yml` | [Gateway Build & Configuration](/tutorial/gateway-build-configuration) |
| 2 | `setup-gateway-service.yml` | [Gateway Service Setup](/tutorial/gateway-service-setup) |
| 3 | `verify-gateway.yml` | [Gateway Service Setup](/tutorial/gateway-service-setup#verification) |

```bash
ansible-playbook playbooks/build-gateway.yml -i inventory/hosts.yml
ansible-playbook playbooks/setup-gateway-service.yml -i inventory/hosts.yml
ansible-playbook playbooks/verify-gateway.yml -i inventory/hosts.yml
```

### Final Verification

```bash
ansible-playbook playbooks/verify-deployment.yml -i inventory/hosts.yml
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

## Local Contract Deployment

**DECISION:** Contract deployment runs on the user's LOCAL machine (not the remote server) to keep private keys secure.

### Two-Step Deployment Flow

```bash
# Step 1: Deploy contracts locally (runs on localhost with your private key)
ansible-playbook playbooks/deploy-contracts-local.yml

# Step 2: Deploy everything to server (uses contract addresses from step 1)
ansible-playbook site.yml -i inventory/hosts.yml
```

### Local Playbook Design

```yaml
# ansible/playbooks/deploy-contracts-local.yml
---
- name: Deploy KMS Contracts to Sepolia (LOCAL)
  hosts: localhost
  connection: local
  gather_facts: no

  vars_files:
    - ../vars/quick-start.yml
    - ../vars/local-secrets.yml  # Contains PRIVATE_KEY (gitignored)

  vars:
    dstack_repo_path: "{{ lookup('env', 'HOME') }}/dstack"
    contracts_dir: "{{ dstack_repo_path }}/kms/auth-eth"

  tasks:
    - name: Verify dstack repo exists
      stat:
        path: "{{ contracts_dir }}/hardhat.config.ts"
      register: hardhat_config
      failed_when: not hardhat_config.stat.exists

    - name: Verify PRIVATE_KEY is set
      assert:
        that:
          - private_key is defined
          - private_key | length > 0
        fail_msg: |
          PRIVATE_KEY not set. Create vars/local-secrets.yml with:
          private_key: "0xYOUR_PRIVATE_KEY_HERE"

          NEVER commit this file to git!

    - name: Install npm dependencies
      npm:
        path: "{{ contracts_dir }}"
        state: present

    - name: Compile contracts
      command: npx hardhat compile
      args:
        chdir: "{{ contracts_dir }}"
      environment:
        PRIVATE_KEY: "{{ private_key }}"

    - name: Deploy contracts to Sepolia
      command: npx hardhat run scripts/deploy.js --network sepolia
      args:
        chdir: "{{ contracts_dir }}"
      environment:
        PRIVATE_KEY: "{{ private_key }}"
        ETH_RPC_URL: "{{ eth_rpc_url }}"
      register: deploy_output

    - name: Parse contract addresses from output
      set_fact:
        kms_contract_address: "{{ deploy_output.stdout | regex_search('KMS deployed to: (0x[a-fA-F0-9]+)', '\\1') | first }}"
        app_auth_address: "{{ deploy_output.stdout | regex_search('AppAuth deployed to: (0x[a-fA-F0-9]+)', '\\1') | first }}"

    - name: Save contract addresses to vars file
      copy:
        content: |
          ---
          # Auto-generated by deploy-contracts-local.yml
          # DO NOT EDIT - re-run playbook to regenerate
          kms_contract_address: "{{ kms_contract_address }}"
          app_auth_implementation: "{{ app_auth_address }}"
          chain_id: 11155111  # Sepolia
        dest: "../vars/contract-addresses.yml"

    - name: Display deployment results
      debug:
        msg:
          - "============================================"
          - "Contract Deployment Complete!"
          - "============================================"
          - ""
          - "KMS Contract: {{ kms_contract_address }}"
          - "AppAuth: {{ app_auth_address }}"
          - "Chain: Sepolia (11155111)"
          - ""
          - "Addresses saved to: vars/contract-addresses.yml"
          - ""
          - "Next step: Run the server deployment"
          - "ansible-playbook site.yml -i inventory/hosts.yml"
          - "============================================"
```

### Files Structure

```
ansible/
├── vars/
│   ├── quick-start.yml           # Main config (domain, versions)
│   ├── quick-start.example.yml   # Template for users
│   ├── local-secrets.yml         # PRIVATE_KEY (gitignored)
│   ├── local-secrets.example.yml # Template for secrets
│   └── contract-addresses.yml    # Auto-generated after deploy
├── playbooks/
│   ├── deploy-contracts-local.yml  # Runs on localhost
│   └── ...                         # Other playbooks run on server
└── site.yml                        # Master playbook (imports contract-addresses.yml)
```

### Security Model

| File | Contains | Committed to Git |
|------|----------|------------------|
| `quick-start.yml` | Domain, RPC URL, versions | Yes |
| `local-secrets.yml` | Private key | **NO** (gitignored) |
| `contract-addresses.yml` | Public addresses | Yes (safe) |
| `hosts.yml` | Server IPs | **NO** (gitignored) |

## Open Questions

1. ~~**Contract deployment location**~~: **RESOLVED** - Local playbook on localhost, private key never touches server

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
| 2025-12-10 | Claude | Added local contract deployment playbook design (private key stays local) |
| 2025-12-10 | Claude | Status changed to REVIEW |
| 2025-12-10 | Claude | Added "Manual Approach" section with individual playbooks and tutorial links |

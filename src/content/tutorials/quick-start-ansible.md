---
title: "Quick Start: Deploy with Ansible"
description: "Deploy a complete dstack environment with two commands"
section: "Host Setup"
stepNumber: null
totalSteps: null
isAppendix: true
lastUpdated: 2025-12-10
prerequisites:
  - tdx-bios-configuration
tags:
  - ansible
  - automation
  - quick-start
  - deployment
difficulty: intermediate
estimatedTime: 60-90 minutes
---

# Quick Start: Deploy dstack with Ansible

Deploy a complete dstack environment with two commands. This guide is for operators who want to quickly deploy a working dstack instance without following each tutorial step-by-step.

## Overview

The Quick Start approach uses Ansible to automate the entire deployment:

```bash
# Step 1: Deploy contracts locally (keeps private key safe)
ansible-playbook playbooks/deploy-contracts-local.yml

# Step 2: Deploy everything to server
ansible-playbook site.yml -i inventory/hosts.yml
```

**What gets deployed:**
- TDX kernel and attestation software
- PCCS with Intel API key
- Gramine sealing key provider (SGX-based)
- Local Docker registry with SSL
- dstack VMM and guest images
- KMS CVM (with TDX attestation)
- Gateway service

---

## Prerequisites

Before starting, you need:

1. **TDX-capable server** with Ubuntu 24.04 LTS
2. **BIOS configured** for TDX and SGX (see [BIOS Configuration](/tutorial/tdx-bios-configuration))
3. **Ansible installed** on your local machine
4. **SSH access** to the server (ubuntu user with sudo)
5. **Intel PCCS API key** from [Intel API Portal](https://api.portal.trustedservices.intel.com/)
6. **Ethereum wallet** with Sepolia ETH (see [Blockchain Setup](/tutorial/blockchain-setup))
7. **DNS records** pointing to your server (see [DNS Configuration](/tutorial/dns-configuration))

### Install Ansible (Local Machine)

```bash
# macOS
brew install ansible

# Ubuntu/Debian
sudo apt update && sudo apt install ansible

# Verify
ansible --version
```

### Clone dstack Repository (Local Machine)

The contract deployment needs the dstack source code:

```bash
git clone https://github.com/Dstack-TEE/dstack ~/dstack
```

---

## Step 1: Configure

### Clone dstack-info Repository

```bash
git clone https://github.com/dmvt/dstack-info.git
cd dstack-info/ansible
```

### Create Configuration Files

```bash
# Copy templates
cp vars/quick-start.example.yml vars/quick-start.yml
cp vars/local-secrets.example.yml vars/local-secrets.yml
cp inventory/hosts.example.yml inventory/hosts.yml
```

### Edit Server Configuration

```bash
vim vars/quick-start.yml
```

Set these required values:

```yaml
# Your domain (e.g., yourdomain.com)
base_domain: "yourdomain.com"

# Intel PCCS API key (from Intel portal)
intel_pccs_api_key: "your-api-key-here"
```

### Edit Secrets (Local Only)

```bash
vim vars/local-secrets.yml
```

Add your Ethereum private key:

```yaml
# Your Sepolia wallet private key
private_key: "0xYOUR_PRIVATE_KEY_HERE"
```

**Security:** This file is gitignored. Your private key never leaves your local machine.

### Edit Inventory

```bash
vim inventory/hosts.yml
```

Set your server IP:

```yaml
all:
  children:
    dstack_servers:
      hosts:
        tdx-host:
          ansible_host: YOUR_SERVER_IP
          ansible_user: ubuntu
```

---

## Step 2: Deploy Contracts (Local)

Deploy the KMS smart contracts to Sepolia:

```bash
ansible-playbook playbooks/deploy-contracts-local.yml
```

This runs on your LOCAL machine and:
1. Compiles KMS smart contracts
2. Deploys them to Sepolia testnet
3. Saves contract addresses to `vars/contract-addresses.yml`

**Output:**
```
Contract Deployment Complete!
============================================
Network: Sepolia (Chain ID: 11155111)
Deployed Contracts:
  KMS: 0x...
  AppAuth: 0x...

Addresses saved to: vars/contract-addresses.yml
```

---

## Step 3: Deploy Server Infrastructure

Deploy everything to your server:

```bash
ansible-playbook site.yml -i inventory/hosts.yml
```

This deploys in phases:

| Phase | What's Deployed | Time |
|-------|-----------------|------|
| 1. Host Setup | TDX kernel, reboot | ~10 min |
| 2. Prerequisites | SSL, PCCS, Gramine, Registry | ~15 min |
| 3. dstack Install | VMM, guest images | ~20 min |
| 4. KMS Deploy | KMS CVM | ~10 min |
| 5. Gateway Deploy | Gateway service | ~5 min |

**Total time:** 45-60 minutes (including reboot)

### Handling Reboot

After Phase 1, the server reboots to load the TDX kernel. Ansible will wait and reconnect automatically. If the connection times out, simply re-run the playbook - completed steps are skipped.

---

## Step 4: Verify

### Check KMS is Running

```bash
ssh ubuntu@YOUR_SERVER "curl -sk https://127.0.0.1:9100/prpc/KMS.GetMeta | head -c 200"
```

Expected output includes:
```json
{
  "ca_cert": "-----BEGIN CERTIFICATE-----...",
  "k256_pubkey": "03...",
  "kms_contract_address": "0x...",
  "chain_id": 11155111
}
```

### Run Verification Playbook

```bash
ansible-playbook playbooks/verify-deployment.yml -i inventory/hosts.yml
```

---

## Running Specific Phases

Use tags to run only certain phases:

```bash
# Just host setup (TDX kernel)
ansible-playbook site.yml -i inventory/hosts.yml --tags host-setup

# Just prerequisites (SSL, PCCS, Gramine, Registry)
ansible-playbook site.yml -i inventory/hosts.yml --tags prerequisites

# Just dstack installation (VMM, images)
ansible-playbook site.yml -i inventory/hosts.yml --tags dstack-install

# Just KMS deployment
ansible-playbook site.yml -i inventory/hosts.yml --tags kms-deploy

# Just gateway deployment
ansible-playbook site.yml -i inventory/hosts.yml --tags gateway-deploy

# All verification steps
ansible-playbook site.yml -i inventory/hosts.yml --tags verify
```

---

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

---

## Troubleshooting

### Playbook fails partway through

The playbook is idempotent - just run it again. Completed steps are skipped automatically.

```bash
ansible-playbook site.yml -i inventory/hosts.yml
```

### Reboot required but connection lost

After TDX kernel installation, the server reboots. Wait 2-3 minutes and re-run the playbook.

### Contract deployment fails

Check:
- `~/dstack` repository exists on your LOCAL machine
- Private key in `vars/local-secrets.yml` is correct
- Wallet has Sepolia ETH (~0.1 ETH needed)
- RPC endpoint is working

Test RPC:
```bash
curl -X POST https://ethereum-sepolia.publicnode.com \
  -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
```

### KMS CVM fails to start

Check prerequisites:
```bash
ansible-playbook playbooks/verify-tdx.yml -i inventory/hosts.yml
ansible-playbook playbooks/verify-pccs-config.yml -i inventory/hosts.yml
```

### SSH connection refused

Verify:
- Server IP is correct in `inventory/hosts.yml`
- SSH key is configured for ubuntu user
- ubuntu user has passwordless sudo

Test manually:
```bash
ssh ubuntu@YOUR_SERVER_IP sudo whoami
# Should output: root (without password prompt)
```

---

## Security Notes

| File | Contains | Safe to Commit |
|------|----------|----------------|
| `vars/quick-start.yml` | Domain, API key | No (has API key) |
| `vars/local-secrets.yml` | Private key | **NEVER** |
| `vars/contract-addresses.yml` | Public addresses | Yes |
| `inventory/hosts.yml` | Server IPs | No |

All sensitive files are gitignored by default.

---

## Next Steps

After successful deployment:

1. **Deploy an application** - See [Hello World App](/tutorial/hello-world-app)
2. **Verify attestation** - See [Attestation Verification](/tutorial/attestation-verification)
3. **Learn the details** - Follow the individual tutorials for deeper understanding

---

## Additional Resources

- [Ansible Documentation](https://docs.ansible.com/)
- [Appendix B: Ansible Setup](/tutorial/ansible-tdx-automation) - Detailed Ansible setup guide
- [dstack-info Ansible Directory](https://github.com/dmvt/dstack-info/tree/main/ansible) - All playbooks

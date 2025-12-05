---
title: "Smart Contract Compilation"
description: "Compile the dstack KMS smart contracts using Hardhat"
section: "KMS Deployment"
stepNumber: 1
totalSteps: 6
lastUpdated: 2025-12-04
prerequisites:
  - vmm-service-setup
  - blockchain-setup
tags:
  - dstack
  - kms
  - solidity
  - hardhat
  - smart-contracts
difficulty: "intermediate"
estimatedTime: "15 minutes"
---

# Smart Contract Compilation

This tutorial guides you through compiling the dstack KMS smart contracts using Hardhat. These contracts manage KMS authorization and app registration on the Ethereum blockchain.

## Prerequisites

Before starting, ensure you have:

- Completed [VMM Service Setup](/tutorial/vmm-service-setup)
- SSH access to your TDX-enabled server
- Internet connectivity for downloading npm packages

## Quick Start: Compile with Ansible

For most users, the recommended approach is to use the Ansible playbook.

### Step 1: Run the Ansible Playbook

```bash
cd ~/dstack-info/ansible
ansible-playbook -i inventory/hosts.yml playbooks/compile-kms-contracts.yml
```

The playbook will:
1. **Install npm** if not present
2. **Install Hardhat dependencies** from package.json
3. **Compile all contracts** using Hardhat
4. **Verify artifacts** exist in the correct locations

### Step 2: Verify Compilation

```bash
ansible-playbook -i inventory/hosts.yml playbooks/verify-kms-contracts.yml
```

---

## What Gets Compiled

The dstack KMS uses two main smart contracts:

| Contract | Purpose |
|----------|---------|
| **DstackKms.sol** | Main registry - tracks applications, KMS measurements, OS images, and root keys |
| **DstackApp.sol** | App control - manages permissions and allowed compose hashes for individual apps |

### Compiled Artifacts

After compilation, you'll find:
- `artifacts/` - ABI and bytecode for deployment
- `typechain-types/` - TypeScript bindings for type-safe interactions

---

## Manual Compilation

If you prefer to compile manually, follow these steps.

### Step 1: Install npm

```bash
sudo apt update
sudo apt install -y npm
npm --version
```

### Step 2: Navigate to Contract Directory

```bash
cd ~/dstack/kms/auth-eth
ls -la
```

You should see `contracts/`, `scripts/`, `hardhat.config.ts`, and `package.json`.

### Step 3: Install Dependencies

```bash
npm install
npx hardhat --version
```

### Step 4: Compile Contracts

```bash
npx hardhat compile
```

Expected output:

```
Generating typings for: 4 artifacts in dir: typechain-types for target: ethers-v6
Successfully generated 18 typings!
Compiled 4 Solidity files successfully (evm target: paris).
```

### Step 5: Verify Artifacts

```bash
ls artifacts/contracts/
ls artifacts/contracts/DstackKms.sol/
```

---

## Troubleshooting

### npm install fails with EACCES

```bash
npm install --legacy-peer-deps
```

### Solidity compiler version mismatch

```bash
npx hardhat compile --force
```

### Out of memory during compilation

```bash
NODE_OPTIONS=--max-old-space-size=4096 npx hardhat compile
```

---

## Next Steps

With contracts compiled, proceed to deploy them:

- [Contract Deployment](/tutorial/contract-deployment) - Deploy contracts to Sepolia testnet

## Additional Resources

- [Hardhat Documentation](https://hardhat.org/docs)
- [Solidity Documentation](https://docs.soliditylang.org/)
- [dstack GitHub Repository](https://github.com/Dstack-TEE/dstack)

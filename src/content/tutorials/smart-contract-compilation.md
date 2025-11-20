---
title: "Smart Contract Compilation"
description: "Compile the dstack KMS smart contracts using Hardhat"
section: "KMS Deployment"
stepNumber: 1
totalSteps: 5
lastUpdated: 2025-11-20
prerequisites: ["vmm-service-setup"]
tags: ["dstack", "kms", "solidity", "hardhat", "smart-contracts"]
difficulty: "intermediate"
estimatedTime: "15 minutes"
---

# Smart Contract Compilation

This tutorial guides you through compiling the dstack KMS smart contracts using Hardhat. These contracts manage KMS authorization and app registration on the Ethereum blockchain.

## What You'll Build

The dstack KMS uses two main smart contracts:

- **DstackKms.sol** - Main registry that:
  - Maintains registry of all applications
  - Tracks allowed KMS instance measurements
  - Tracks allowed OS images
  - Registers KMS root keys

- **DstackApp.sol** - App control contract that:
  - Controls permissions for individual apps
  - Maintains allowed compose hashes
  - Can be shared by multiple apps or dedicated to one

## Prerequisites

Before starting, ensure you have:

- Completed [VMM Service Setup](/tutorial/vmm-service-setup)
- SSH access to your TDX-enabled server
- Internet connectivity for downloading npm packages

## Step 1: Install npm

Node.js should already be installed from the system dependencies. Install npm:

```bash
sudo apt update
sudo apt install -y npm
```

Verify installation:

```bash
npm --version
```

Expected output shows npm version (8.x or higher).

## Step 2: Navigate to Contract Directory

The smart contracts are located in the KMS auth-eth directory:

```bash
cd ~/dstack/kms/auth-eth
```

Check the directory structure:

```bash
ls -la
```

You should see:
- `contracts/` - Solidity source files
- `scripts/` - Deployment scripts
- `hardhat.config.ts` - Hardhat configuration
- `package.json` - npm dependencies

## Step 3: Install Dependencies

Install the Hardhat toolchain and contract dependencies:

```bash
npm install
```

This downloads:
- Hardhat development environment
- Solidity compiler
- OpenZeppelin contracts
- Ethereum libraries
- TypeScript support

The installation takes 2-5 minutes depending on network speed.

### Verify Hardhat installation

```bash
npx hardhat --version
```

Expected output shows Hardhat version.

## Step 4: Compile Contracts

Compile all Solidity contracts:

```bash
npx hardhat compile
```

Expected output:

```
Generating typings for: 4 artifacts in dir: typechain-types for target: ethers-v6
Successfully generated 18 typings!
Compiled 4 Solidity files successfully (evm target: paris).
```

### Compiled artifacts

The compiled contracts are in:
- `artifacts/` - ABI and bytecode
- `typechain-types/` - TypeScript bindings

Check the artifacts:

```bash
ls artifacts/contracts/
```

You should see:
- `DstackKms.sol/`
- `DstackApp.sol/`
- `IAppAuth.sol/`
- `IAppAuthBasicManagement.sol/`

## Step 5: Verify Compilation

Check that the main contract artifacts exist:

```bash
ls -la artifacts/contracts/DstackKms.sol/
```

Expected files:
- `DstackKms.json` - Contract ABI and bytecode

View the contract ABI (first few lines):

```bash
head -50 artifacts/contracts/DstackKms.sol/DstackKms.json
```

### Check TypeScript types

Verify TypeScript bindings were generated:

```bash
ls typechain-types/
```

These types are used for type-safe contract interactions in deployment scripts.

## Ansible Automation

You can automate the contract compilation using Ansible.

### Run the Ansible playbook

```bash
cd ~/dstack-info/ansible
ansible-playbook -i inventory/hosts.yml playbooks/compile-kms-contracts.yml
```

The playbook will:
1. Install npm if not present
2. Install contract dependencies
3. Compile all contracts
4. Verify artifacts exist

### Verify with Ansible

After running the compilation playbook:

```bash
cd ~/dstack-info/ansible
ansible-playbook -i inventory/hosts.yml playbooks/verify-kms-contracts.yml
```

## Contract Details

### DstackKms.sol

The main KMS registry contract handles:

```solidity
// Key functions
function registerKmsRoot(bytes32 rootPubKey, bytes quote) external;
function addAllowedMR(bytes32 mr) external;
function addAllowedImage(bytes32 imageHash) external;
function isAppAllowed(bytes32 appId) external view returns (bool);
```

### DstackApp.sol

App-specific control contract:

```solidity
// Key functions
function setAllowedCompose(bytes32 composeHash, bool allowed) external;
function isComposeAllowed(bytes32 composeHash) external view returns (bool);
function getOwner() external view returns (address);
```

## Troubleshooting

### npm install fails with EACCES

Permission error during install:

```bash
# Use --legacy-peer-deps if dependency conflicts
npm install --legacy-peer-deps

# Or fix npm permissions
mkdir -p ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

### Solidity compiler version mismatch

If compilation fails with version errors:

```bash
# Check required version in contracts
grep -r "pragma solidity" contracts/

# Hardhat will download the correct version automatically
npx hardhat compile --force
```

### Out of memory during compilation

If the compilation runs out of memory:

```bash
# Increase Node.js memory limit
NODE_OPTIONS=--max-old-space-size=4096 npx hardhat compile
```

### TypeScript errors

If TypeScript bindings fail:

```bash
# Regenerate types
npx hardhat clean
npx hardhat compile
```

### Network timeout

If npm install times out:

```bash
# Use a different registry
npm install --registry https://registry.npmmirror.com

# Or increase timeout
npm install --fetch-timeout=300000
```

## Verification Checklist

Before proceeding, verify you have:

- [ ] Installed npm
- [ ] Installed Hardhat dependencies
- [ ] Compiled all contracts successfully
- [ ] Verified artifacts in `artifacts/contracts/`
- [ ] Verified TypeScript types in `typechain-types/`

### Quick verification script

```bash
#!/bin/bash
echo "Checking KMS contract compilation..."

# Check npm
if command -v npm &> /dev/null; then
    echo "✓ npm installed: $(npm --version)"
else
    echo "✗ npm not found"
    exit 1
fi

# Check contract directory
CONTRACT_DIR="$HOME/dstack/kms/auth-eth"
if [ -d "$CONTRACT_DIR" ]; then
    echo "✓ Contract directory exists"
else
    echo "✗ Contract directory not found"
    exit 1
fi

# Check node_modules
if [ -d "$CONTRACT_DIR/node_modules" ]; then
    echo "✓ Dependencies installed"
else
    echo "✗ Dependencies not installed"
    exit 1
fi

# Check DstackKms artifact
KMS_ARTIFACT="$CONTRACT_DIR/artifacts/contracts/DstackKms.sol/DstackKms.json"
if [ -f "$KMS_ARTIFACT" ]; then
    echo "✓ DstackKms.json compiled"
else
    echo "✗ DstackKms.json not found"
    exit 1
fi

# Check DstackApp artifact
APP_ARTIFACT="$CONTRACT_DIR/artifacts/contracts/DstackApp.sol/DstackApp.json"
if [ -f "$APP_ARTIFACT" ]; then
    echo "✓ DstackApp.json compiled"
else
    echo "✗ DstackApp.json not found"
    exit 1
fi

# Check TypeScript types
if [ -d "$CONTRACT_DIR/typechain-types" ]; then
    echo "✓ TypeScript types generated"
else
    echo "✗ TypeScript types not found"
    exit 1
fi

echo ""
echo "KMS contract compilation verified successfully!"
```

## Understanding the Build Output

### artifacts/contracts/DstackKms.sol/DstackKms.json

Contains:
- **abi** - Application Binary Interface for contract interaction
- **bytecode** - Compiled EVM bytecode for deployment
- **deployedBytecode** - Runtime bytecode after deployment

### typechain-types/

Contains TypeScript types for:
- Contract factories
- Contract instances
- Event types
- Function signatures

These enable type-safe contract interactions in the deployment scripts.

## Next Steps

With contracts compiled, proceed to deploy them:

- [Contract Deployment](/tutorial/contract-deployment) - Deploy contracts to Sepolia testnet

## Additional Resources

- [Hardhat Documentation](https://hardhat.org/docs)
- [Solidity Documentation](https://docs.soliditylang.org/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)
- [dstack GitHub Repository](https://github.com/Dstack-TEE/dstack)

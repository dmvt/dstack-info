---
title: "Contract Deployment"
description: "Deploy dstack KMS smart contracts to Sepolia testnet"
section: "KMS Deployment"
stepNumber: 2
totalSteps: 6
lastUpdated: 2025-12-04
prerequisites:
  - smart-contract-compilation
  - blockchain-setup
tags:
  - dstack
  - kms
  - ethereum
  - sepolia
  - hardhat
  - deployment
difficulty: "advanced"
estimatedTime: "20 minutes"
---

# Contract Deployment

This tutorial guides you through deploying the dstack KMS smart contracts to the Sepolia testnet. These contracts manage KMS authorization on the Ethereum blockchain.

## Prerequisites

Before starting, ensure you have:

- Completed [Smart Contract Compilation](/tutorial/smart-contract-compilation)
- Completed [Blockchain Setup](/tutorial/blockchain-setup) with:
  - Ethereum wallet with private key stored locally
  - Sepolia testnet ETH (at least 0.01 ETH recommended)

## Quick Start: Deploy with Ansible

For most users, the recommended approach is to use the Ansible playbooks.

### Step 1: Verify Local Wallet Credentials

Your wallet credentials from [Blockchain Setup](/tutorial/blockchain-setup) should be stored on your **local machine**:

```bash
# Verify your local secrets exist
ls -la ~/.dstack/secrets/
```

You should see:
- `sepolia-address` - Your wallet address
- `sepolia-private-key` - Your wallet private key

If missing, go back to [Blockchain Setup](/tutorial/blockchain-setup) to create them.

### Step 2: Upload Credentials to Server

> **Using Ansible?** Playbooks are in `~/dstack-info/ansible`. If you haven't set up Ansible yet, see [TDX Software Installation: Quick Start with Ansible](/tutorial/tdx-software-installation#quick-start-install-with-ansible) for initial setup.

The deployment playbook runs on the server, so it needs access to your wallet credentials. This playbook uploads them securely (skipping if they already exist on the server):

```bash
ansible-playbook -i inventory/hosts.yml playbooks/upload-wallet-credentials.yml
```

The playbook will:
1. **Check local credentials** exist on your machine
2. **Check if server already has credentials** (skips upload if they do)
3. **Create secure directory** on server (`~/.dstack/secrets/`)
4. **Upload credentials** with proper permissions (mode 0600)

### Step 3: Run the Deployment Playbook

```bash
ansible-playbook -i inventory/hosts.yml playbooks/deploy-kms-contracts.yml
```

The playbook will:
1. **Load wallet credentials** from the server's secrets file
2. **Check wallet balance** to ensure sufficient ETH
3. **Deploy DstackApp implementation** contract
4. **Deploy DstackKms proxy** contract
5. **Save contract addresses** for later use

### Step 4: Verify Deployment

```bash
ansible-playbook -i inventory/hosts.yml playbooks/verify-kms-contracts.yml
```

---

## What Gets Deployed

The deployment creates two smart contracts:

| Contract | Purpose |
|----------|---------|
| **DstackKms Proxy** | Main entry point - stores state, manages KMS settings |
| **DstackApp Implementation** | Logic for app contracts, used as factory template |

These contracts use the UUPS (Universal Upgradeable Proxy Standard) pattern, allowing future upgrades without changing addresses.

---

## Manual Deployment

If you prefer to deploy manually, follow these steps.

### Step 1: Set Environment Variables

The deployment scripts need your wallet private key. The hardhat config uses the public demo RPC endpoint.

```bash
cd ~/dstack/kms/auth-eth

# Set your private key from the secrets file
export PRIVATE_KEY=$(cat ~/.dstack/secrets/sepolia-private-key)

# Use the demo RPC endpoint (required by hardhat.config.ts)
export ALCHEMY_API_KEY="demo"
```

**Security Warning:** Never commit your private key or share it. The key is only held in memory during this session.

### Step 2: Check Wallet Balance

Verify your wallet has sufficient ETH for deployment:

```bash
# Get your wallet address
WALLET_ADDRESS=$(cat ~/.dstack/secrets/sepolia-address)
echo "Wallet: $WALLET_ADDRESS"

# Check balance using curl
curl -s -X POST "https://eth-sepolia.g.alchemy.com/v2/demo" \
  -H "Content-Type: application/json" \
  -d "{\"jsonrpc\":\"2.0\",\"method\":\"eth_getBalance\",\"params\":[\"$WALLET_ADDRESS\",\"latest\"],\"id\":1}" | \
  jq -r '.result' | xargs printf "Balance: %d wei\n"
```

You need at least 0.01 ETH for deployment (actual cost ~0.002 ETH on Sepolia).

If balance is insufficient, get Sepolia ETH from:
- [PoW Faucet](https://sepolia-faucet.pk910.de/) (recommended - no requirements)
- [Alchemy Sepolia Faucet](https://sepoliafaucet.com/)

### Step 3: Deploy Contracts

Deploy the DstackKms proxy and DstackApp implementation:

```bash
cd ~/dstack/kms/auth-eth

# Deploy contracts (will prompt for confirmation)
npx hardhat kms:deploy --with-app-impl --network sepolia
```

Expected output:

```
Deploying with account: 0xYourAddress
Account balance: 0.123456789 ETH
Step 1: Deploying DstackApp implementation...
✅ DstackApp implementation deployed to: 0x...
Step 2: Deploying DstackKms...
Network: sepolia (chainId: 11155111)
Do you want to proceed with deployment? (y/n)
DstackKms Proxy deployed to: 0xYourKmsContractAddress
✅ Complete KMS setup deployed successfully!
```

### Step 4: Save Contract Addresses

Save the deployed addresses for later use:

```bash
cd ~/dstack/kms/auth-eth

# Replace with your actual addresses from deployment output
KMS_CONTRACT_ADDRESS="0xYourKmsContractAddress"
APP_IMPLEMENTATION_ADDRESS="0xYourAppImplAddress"

# Save to .deployed-addresses file (same format as Ansible)
cat > .deployed-addresses << EOF
# KMS Contract Deployment - $(date -Iseconds)
# Network: Sepolia Testnet

KMS_CONTRACT_ADDRESS=$KMS_CONTRACT_ADDRESS
APP_IMPLEMENTATION_ADDRESS=$APP_IMPLEMENTATION_ADDRESS

# View on Etherscan:
# https://sepolia.etherscan.io/address/$KMS_CONTRACT_ADDRESS
EOF

chmod 600 .deployed-addresses
echo "Addresses saved to .deployed-addresses"
```

### Step 5: Verify Deployment

Check that the contract exists on chain:

```bash
# Verify contract has bytecode
curl -s -X POST "https://eth-sepolia.g.alchemy.com/v2/demo" \
  -H "Content-Type: application/json" \
  -d "{\"jsonrpc\":\"2.0\",\"method\":\"eth_getCode\",\"params\":[\"$KMS_CONTRACT_ADDRESS\",\"latest\"],\"id\":1}" | \
  jq -r 'if .result != "0x" then "✓ Contract deployed successfully" else "✗ Contract not found" end'

# View on Etherscan
echo "View on Etherscan: https://sepolia.etherscan.io/address/$KMS_CONTRACT_ADDRESS"
```

### Step 6: Verify Contract Source (Optional)

Verify the contract source on Etherscan for transparency:

```bash
cd ~/dstack/kms/auth-eth

# Verify the implementation contract
npx hardhat verify --network sepolia $KMS_CONTRACT_ADDRESS
```

This allows anyone to read the contract source code on Etherscan.

## Contract Architecture

### UUPS Proxy Pattern

The contracts use the UUPS (Universal Upgradeable Proxy Standard) pattern:

- **Proxy Contract** - Stores state, delegates calls to implementation
- **Implementation Contract** - Contains the logic, can be upgraded

This allows upgrading contract logic without changing the address or losing state.

### Contract Addresses

After deployment, you'll have:

| Contract | Address | Purpose |
|----------|---------|---------|
| DstackKms Proxy | `KMS_CONTRACT_ADDRESS` | Main entry point, stores state |
| DstackApp Implementation | `APP_IMPLEMENTATION_ADDRESS` | Logic for app contracts |

## Troubleshooting

### Insufficient funds

```
Error: insufficient funds for gas
```

Get more Sepolia ETH from the faucets listed above.

### Transaction underpriced

```
Error: replacement transaction underpriced
```

Wait for pending transactions to complete, or increase gas price:

```bash
# In hardhat.config.ts, add to network config:
gasPrice: 20000000000  // 20 gwei
```

### Nonce too low

```
Error: nonce too low
```

A transaction with this nonce already exists. Wait for it to confirm.

### RPC connection failed

```
Error: could not detect network
```

Check network connectivity:

```bash
curl -s -X POST "https://eth-sepolia.g.alchemy.com/v2/demo" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

### Contract already deployed

If you need to redeploy:

```bash
# Deploy fresh instance (new address)
npx hardhat kms:deploy --with-app-impl --network sepolia
```

Each deployment creates a new contract at a new address.

---

## Cost Estimation

Typical deployment gas usage:

| Operation | Gas Used |
|-----------|----------|
| DstackApp implementation | ~1,100,000 |
| DstackKms proxy | ~210,000 |
| **Total** | ~1,300,000 |

**Sepolia Testnet:** Gas prices are typically 1-2 gwei, so total deployment costs ~0.002 ETH. Testnet ETH is free from faucets.

**Mainnet:** At 20 gwei, deployment would cost ~0.026 ETH. At 50 gwei, ~0.065 ETH. Check current gas prices before deploying.

## Next Steps

With contracts deployed, proceed to build the KMS service:

- [KMS Build & Configuration](/tutorial/kms-build-configuration) - Build and configure the KMS service

## Additional Resources

- [Sepolia Etherscan](https://sepolia.etherscan.io/)
- [Hardhat Deployment Guide](https://hardhat.org/hardhat-runner/docs/guides/deploying)
- [OpenZeppelin Upgrades](https://docs.openzeppelin.com/upgrades-plugins/1.x/)
- [dstack GitHub Repository](https://github.com/Dstack-TEE/dstack)

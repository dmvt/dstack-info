---
title: "Contract Deployment"
description: "Deploy dstack KMS smart contracts to Sepolia testnet from your local machine"
section: "Pre-Deployment"
stepNumber: 2
totalSteps: 2
lastUpdated: 2026-01-09
prerequisites:
  - blockchain-setup
tags:
  - dstack
  - kms
  - ethereum
  - sepolia
  - hardhat
  - deployment
difficulty: "intermediate"
estimatedTime: "15 minutes"
---

# Contract Deployment

This tutorial deploys the dstack KMS smart contracts to the Sepolia testnet. Contracts are deployed from your **local machine** - your private key never leaves your computer.

## Prerequisites

Before starting, ensure you have:

- Completed [Blockchain Wallet Setup](/tutorial/blockchain-setup) with:
  - Ethereum wallet private key in `ansible/vars/local-secrets.yml`
  - Alchemy API key in `ansible/vars/local-secrets.yml`
  - Sepolia testnet ETH (~0.01 ETH recommended)
- dstack repository cloned locally: `git clone https://github.com/Dstack-TEE/dstack ~/dstack`
- Node.js installed (v18 or later)

## What Gets Deployed

The deployment creates two smart contracts on Sepolia:

| Contract | Purpose |
|----------|---------|
| **DstackKms Proxy** | Main entry point - manages KMS settings and app authorization |
| **DstackApp Implementation** | Logic template for application contracts |

These contracts use the UUPS (Universal Upgradeable Proxy Standard) pattern for future upgrades.

---

## Quick Start: Deploy with Ansible

The easiest approach is using the Ansible playbook, which runs locally and saves contract addresses automatically.

### Step 1: Ensure Configuration

Verify your `ansible/vars/local-secrets.yml` contains:

```yaml
private_key: "0xYourPrivateKeyHere"
alchemy_api_key: "YourAlchemyApiKey"
```

### Step 2: Run the Deployment

From the `dstack-info/ansible` directory:

```bash
ansible-playbook playbooks/deploy-contracts-local.yml
```

The playbook will:
1. Install npm dependencies in `~/dstack/kms/auth-eth`
2. Deploy DstackApp implementation contract
3. Deploy DstackKms proxy contract
4. Save addresses to `ansible/vars/contract-addresses.yml`

### Step 3: Verify

Check the deployment succeeded:

```bash
cat ansible/vars/contract-addresses.yml
```

You should see:
```yaml
kms_contract_address: "0x..."
app_implementation_address: "0x..."
```

---

## Manual Deployment

If you prefer to deploy manually, follow these steps on your **local machine**.

### Step 1: Navigate to auth-eth Directory

```bash
cd ~/dstack/kms/auth-eth
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Set Environment Variables

```bash
# Your wallet private key (from blockchain-setup)
export PRIVATE_KEY="0xYourPrivateKeyHere"

# Your Alchemy API key
export ALCHEMY_API_KEY="YourAlchemyApiKey"
```

### Step 4: Check Wallet Balance

```bash
# Get your wallet address from the private key
WALLET_ADDRESS=$(cast wallet address $PRIVATE_KEY 2>/dev/null || echo "Install foundry to check address")
echo "Wallet: $WALLET_ADDRESS"

# Check balance
curl -s -X POST "https://eth-sepolia.g.alchemy.com/v2/$ALCHEMY_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"jsonrpc\":\"2.0\",\"method\":\"eth_getBalance\",\"params\":[\"$WALLET_ADDRESS\",\"latest\"],\"id\":1}" | \
  jq -r '.result' | xargs printf "Balance: %d wei\n"
```

You need at least 0.01 ETH. If insufficient, get free Sepolia ETH from:
- [PoW Faucet](https://sepolia-faucet.pk910.de/) (no requirements)
- [Alchemy Sepolia Faucet](https://sepoliafaucet.com/)

### Step 5: Deploy Contracts

```bash
npx hardhat kms:deploy --with-app-impl --network sepolia
```

Expected output:

```
Deploying with account: 0xYourAddress
Account balance: 0.123456789 ETH
Step 1: Deploying DstackApp implementation...
DstackApp implementation deployed to: 0x...
Step 2: Deploying DstackKms...
Network: sepolia (chainId: 11155111)
Do you want to proceed with deployment? (y/n) y
DstackKms Proxy deployed to: 0x...
Complete KMS setup deployed successfully!
```

### Step 6: Save Contract Addresses

Save the addresses to your Ansible configuration:

```bash
# Replace with your actual addresses from the output above
KMS_ADDRESS="0xYourKmsProxyAddress"
APP_ADDRESS="0xYourAppImplAddress"

# Save to Ansible vars
cat > ~/dstack-info/ansible/vars/contract-addresses.yml << EOF
---
# KMS Contract Addresses (Sepolia Testnet)
# Deployed: $(date -Iseconds)
#
# View on Etherscan:
#   KMS: https://sepolia.etherscan.io/address/$KMS_ADDRESS
#   App: https://sepolia.etherscan.io/address/$APP_ADDRESS

kms_contract_address: "$KMS_ADDRESS"
app_implementation_address: "$APP_ADDRESS"
EOF

echo "Addresses saved to ~/dstack-info/ansible/vars/contract-addresses.yml"
```

### Step 7: Verify Deployment

Check the contract exists on-chain:

```bash
curl -s -X POST "https://eth-sepolia.g.alchemy.com/v2/$ALCHEMY_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"jsonrpc\":\"2.0\",\"method\":\"eth_getCode\",\"params\":[\"$KMS_ADDRESS\",\"latest\"],\"id\":1}" | \
  jq -r 'if .result != "0x" then "Contract deployed successfully" else "Contract not found" end'
```

View on Etherscan:
```bash
echo "https://sepolia.etherscan.io/address/$KMS_ADDRESS"
```

---

## Understanding the Contracts

### UUPS Proxy Pattern

The contracts use UUPS (Universal Upgradeable Proxy Standard):

```
Client Request
     │
     ▼
┌─────────────┐
│ KMS Proxy   │ ← Stores state, immutable address
│ (0x...)     │
└─────┬───────┘
      │ delegatecall
      ▼
┌─────────────┐
│ KMS Logic   │ ← Contains code, can be upgraded
│ (impl)      │
└─────────────┘
```

This allows upgrading contract logic without changing addresses or losing state.

### Contract Functions

The DstackKms contract provides:

| Function | Purpose |
|----------|---------|
| `isAppAllowed(appId)` | Check if an app is authorized |
| `registerApp(appId)` | Register a new application |
| `gatewayAppId()` | Get the gateway app identifier |

---

## Troubleshooting

### Insufficient funds

```
Error: insufficient funds for gas
```

Get Sepolia ETH from faucets listed above.

### Transaction underpriced

```
Error: replacement transaction underpriced
```

Wait for pending transactions to complete, then retry.

### Nonce too low

```
Error: nonce too low
```

A transaction with this nonce already exists. Wait for confirmation.

### Connection failed

```
Error: could not detect network
```

Check your Alchemy API key is valid:

```bash
curl -s -X POST "https://eth-sepolia.g.alchemy.com/v2/$ALCHEMY_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

Should return a block number, not an error.

---

## Cost Estimation

| Operation | Gas Used | Cost at 2 gwei |
|-----------|----------|----------------|
| DstackApp implementation | ~1,100,000 | ~0.0022 ETH |
| DstackKms proxy | ~210,000 | ~0.0004 ETH |
| **Total** | ~1,300,000 | ~0.0026 ETH |

Sepolia testnet ETH is free from faucets.

---

## Next Steps

With contracts deployed, you're ready to deploy dstack on your TDX server:

- [TDX Hardware Verification](/tutorial/tdx-hardware-verification) - Start the server setup process

Or if using Ansible quick-start:

- [Quick Start: Deploy with Ansible](/tutorial/quick-start-ansible) - Deploy everything with one command

## Additional Resources

- [Sepolia Etherscan](https://sepolia.etherscan.io/)
- [Hardhat Deployment Guide](https://hardhat.org/hardhat-runner/docs/guides/deploying)
- [dstack GitHub Repository](https://github.com/Dstack-TEE/dstack)

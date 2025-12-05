---
title: "Contract Deployment"
description: "Deploy dstack KMS smart contracts to Sepolia testnet"
section: "KMS Deployment"
stepNumber: 2
totalSteps: 5
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
  - Sepolia testnet ETH (at least 0.1 ETH)

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

The deployment playbook runs on the server, so it needs access to your wallet credentials. This playbook uploads them securely (skipping if they already exist on the server):

```bash
cd ~/dstack-info/ansible
ansible-playbook -i inventory/hosts.yml playbooks/upload-wallet-credentials.yml
```

The playbook will:
1. **Check local credentials** exist on your machine
2. **Check if server already has credentials** (skips upload if they do)
3. **Create secure directory** on server (`~/.dstack/secrets/`)
4. **Upload credentials** with proper permissions (mode 0600)

### Step 3: Run the Deployment Playbook

```bash
cd ~/dstack-info/ansible
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

### Step 1: Configure Environment Variables

The deployment scripts need your wallet credentials and RPC endpoint.

### Create environment file

```bash
cd ~/dstack/kms/auth-eth

# Create .env file (keep this secure!)
cat > .env << 'EOF'
# Your wallet private key (without 0x prefix)
PRIVATE_KEY=your_private_key_here

# Alchemy API key for Sepolia
ALCHEMY_API_KEY=your_alchemy_api_key_here

# Optional: Etherscan API key for verification
ETHERSCAN_API_KEY=your_etherscan_api_key_here
EOF
```

### Set environment variables

Load the environment:

```bash
source .env
export PRIVATE_KEY
export ALCHEMY_API_KEY
export ETHERSCAN_API_KEY
```

**Security Warning:** Never commit your `.env` file or share your private key. Add `.env` to `.gitignore`.

### Verify configuration

```bash
# Check variables are set (shows only first/last chars)
echo "PRIVATE_KEY: ${PRIVATE_KEY:0:4}...${PRIVATE_KEY: -4}"
echo "ALCHEMY_API_KEY: ${ALCHEMY_API_KEY:0:4}...${ALCHEMY_API_KEY: -4}"
```

## Step 2: Check Wallet Balance

Verify your wallet has sufficient ETH for deployment:

```bash
cd ~/dstack/kms/auth-eth

# Check balance using Hardhat
npx hardhat run --network sepolia -e "
const [signer] = await hre.ethers.getSigners();
const address = await signer.getAddress();
const balance = await hre.ethers.provider.getBalance(address);
console.log('Address:', address);
console.log('Balance:', hre.ethers.formatEther(balance), 'ETH');
"
```

Expected output shows your address and balance.

If balance is insufficient, get Sepolia ETH from:
- [Alchemy Sepolia Faucet](https://sepoliafaucet.com/)
- [PoW Faucet](https://sepolia-faucet.pk910.de/)

## Step 3: Deploy DstackKms Contract

Deploy the main KMS registry contract with the DstackApp implementation:

```bash
cd ~/dstack/kms/auth-eth

# Deploy DstackKms with DstackApp implementation
npx hardhat kms:deploy --with-app-impl --network sepolia
```

Expected output:

```
Deploying with account: 0xYourAddress
Account balance: 0.123456789 ETH
Step 1: Deploying DstackApp implementation...
✅ DstackApp implementation deployed to: 0x...
Setting DstackApp implementation during initialization: 0x...
Step 2: Deploying DstackKms...
Starting DstackKms deployment process...
Network: sepolia (chainId: 11155111)
Estimating deployment cost...
Deployment gas estimate: ~2,500,000 gas
Do you want to proceed with deployment? (y/n)
Deploying proxy...
Waiting for deployment...
DstackKms Proxy deployed to: 0xYourKmsContractAddress
✅ Complete KMS setup deployed successfully!
- DstackApp implementation: 0x...
- DstackKms proxy: 0xYourKmsContractAddress
🚀 Ready for factory app deployments!
```

### Save contract addresses

Record the deployed addresses for later use:

```bash
# Save to environment
export KMS_CONTRACT_ADDRESS="0xYourKmsContractAddress"
export APP_IMPLEMENTATION_ADDRESS="0xYourAppImplAddress"

# Add to .env file
echo "KMS_CONTRACT_ADDRESS=$KMS_CONTRACT_ADDRESS" >> .env
echo "APP_IMPLEMENTATION_ADDRESS=$APP_IMPLEMENTATION_ADDRESS" >> .env
```

## Step 4: Verify Deployment

### Check contract on Etherscan

Visit Sepolia Etherscan to verify your deployment:

```
https://sepolia.etherscan.io/address/YOUR_KMS_CONTRACT_ADDRESS
```

### Query contract state

```bash
cd ~/dstack/kms/auth-eth

# Get KMS info (will be empty until bootstrapped)
npx hardhat info:kms --network sepolia

# Get app implementation address
npx hardhat kms:get-app-implementation --network sepolia
```

### Verify using cast (optional)

If you have Foundry installed:

```bash
# Check contract exists
cast code $KMS_CONTRACT_ADDRESS --rpc-url https://eth-sepolia.g.alchemy.com/v2/$ALCHEMY_API_KEY

# Get owner
cast call $KMS_CONTRACT_ADDRESS "owner()" --rpc-url https://eth-sepolia.g.alchemy.com/v2/$ALCHEMY_API_KEY
```

## Step 5: Verify Contract Source (Optional)

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

Check your Alchemy API key and network connectivity:

```bash
curl -X POST https://eth-sepolia.g.alchemy.com/v2/$ALCHEMY_API_KEY \
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

Typical deployment costs on Sepolia:

| Operation | Gas | Cost (@ 20 gwei) |
|-----------|-----|------------------|
| DstackApp impl | ~1,500,000 | ~0.03 ETH |
| DstackKms proxy | ~2,500,000 | ~0.05 ETH |
| **Total** | ~4,000,000 | ~0.08 ETH |

Note: Testnet gas is free (from faucets), mainnet costs real ETH.

## Next Steps

With contracts deployed, proceed to build the KMS service:

- [KMS Build & Configuration](/tutorial/kms-build-configuration) - Build and configure the KMS service

## Additional Resources

- [Sepolia Etherscan](https://sepolia.etherscan.io/)
- [Hardhat Deployment Guide](https://hardhat.org/hardhat-runner/docs/guides/deploying)
- [OpenZeppelin Upgrades](https://docs.openzeppelin.com/upgrades-plugins/1.x/)
- [dstack GitHub Repository](https://github.com/Dstack-TEE/dstack)

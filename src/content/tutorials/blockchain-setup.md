---
title: "Blockchain Wallet Setup"
description: "Set up an Ethereum wallet on Sepolia testnet for dstack KMS deployment"
section: "Prerequisites"
stepNumber: 3
totalSteps: 3
lastUpdated: 2025-11-02
tags: ["blockchain", "ethereum", "wallet", "testnet", "sepolia"]
difficulty: "intermediate"
estimatedTime: "15-20 minutes"
prerequisites:
  - "Foundry (cast) installed OR MetaMask browser extension"
  - "Basic understanding of Ethereum and wallets"
---

# Blockchain Wallet Setup

dstack's Key Management Service (KMS) is deployed as a smart contract on the Ethereum blockchain. For tutorial purposes, we'll use the **Sepolia testnet**, which allows you to deploy and test without spending real ETH.

## What You'll Need

- **Ethereum wallet** with a private key
- **Testnet ETH** (~0.1 ETH minimum for deployment)
- **RPC endpoint** for interacting with Sepolia

## Why Sepolia?

Sepolia is one of Ethereum's official testnets:
- Free testnet ETH from faucets
- Similar to mainnet but without real value
- Perfect for development and testing
- Widely supported by tools and services

---

## Option 1: Command-Line Wallet (Recommended)

If you have [Foundry](https://book.getfoundry.sh/getting-started/installation) installed, you can create a wallet using the `cast` command.

### Step 1.1: Check if Foundry is Installed

```bash
cast --version
```

If not installed, see: https://book.getfoundry.sh/getting-started/installation

### Step 1.2: Generate New Wallet

```bash
cast wallet new
```

**Example output:**
```
Successfully created new keypair.
Address:     0x91Ba69FCD13D2876FD06907a2880BDBC93C336aF
Private key: 0xd76e8d3059484d5d9167c4e10cfeea2a4efa655875112e693e18fb4ab890b98a
```

⚠️ **Save these immediately:**
- **Address:** Your public wallet address (safe to share)
- **Private Key:** SECRET - never share or commit to git

### Step 1.3: Store Wallet Credentials Securely

Create secure files to store your wallet address and private key:

```bash
# Create secure directory
mkdir -p ~/.dstack/secrets
chmod 700 ~/.dstack/secrets

# Store wallet address (replace with your address)
echo "0xYOUR_ADDRESS_HERE" > ~/.dstack/secrets/sepolia-address
chmod 600 ~/.dstack/secrets/sepolia-address

# Store private key (replace with your key)
echo "0xYOUR_PRIVATE_KEY_HERE" > ~/.dstack/secrets/sepolia-private-key
chmod 600 ~/.dstack/secrets/sepolia-private-key
```

⚠️ **IMPORTANT:** Add to `.gitignore` if working in a git repository:

```bash
echo "~/.dstack/secrets/" >> ~/.gitignore
```

### Step 1.4: Check Wallet Balance

```bash
cast balance $(cat ~/.dstack/secrets/sepolia-address) --rpc-url https://eth-sepolia.g.alchemy.com/v2/demo
```

Expected output for new wallet: `0` (zero)

---

## Option 2: MetaMask Wallet

If you prefer a browser-based wallet, MetaMask is the most popular choice.

### Step 2.1: Install MetaMask

1. Visit: https://metamask.io/
2. Install browser extension (Chrome, Firefox, Brave, Edge)
3. Create new wallet or import existing one
4. **Save your seed phrase securely** (12 or 24 words)

### Step 2.2: Add Sepolia Network

1. Open MetaMask
2. Click network dropdown (top center)
3. Click "Add Network" or "Add a network manually"
4. Enter Sepolia network details:

```
Network Name: Sepolia
RPC URL: https://eth-sepolia.g.alchemy.com/v2/demo
Chain ID: 11155111
Currency Symbol: ETH
Block Explorer: https://sepolia.etherscan.io
```

5. Click "Save"

### Step 2.3: Get Your Wallet Address

1. Open MetaMask
2. Click on account name (top center)
3. Address shown below name (starts with `0x...`)
4. Click to copy

### Step 2.4: Export Private Key (for dstack CLI)

⚠️ **Only do this if you need the private key for programmatic access**

1. Open MetaMask
2. Click three dots (top right) → Account Details
3. Click "Export Private Key"
4. Enter MetaMask password
5. Click to reveal and copy private key
6. Store securely as shown in Step 1.3

---

## Step 2: Get Testnet ETH

You need testnet ETH to deploy the KMS smart contract.

### PoW Faucet (Recommended)

**Best option for new wallets** - no requirements:

1. Visit: https://sepolia-faucet.pk910.de/
2. Enter your wallet address
3. Click "Start Mining"
4. Wait 10-30 minutes while mining runs in your browser
5. Claim your testnet ETH (typically 0.05-0.1 ETH per session)

✅ **Why this faucet?**
- No mainnet ETH balance required
- No account signup needed
- No MetaMask required
- Works for brand new wallets
- Just needs patience for mining

### MetaMask Faucet

If you're using MetaMask:

- URL: https://docs.metamask.io/developer-tools/faucet
- ❌ **Requires:** MetaMask extension installed

### More Faucet Options

For a comprehensive list of Sepolia faucets with their specific requirements, see:
**https://faucetlink.to/sepolia**

This page lists all available faucets and their requirements (mainnet ETH balance, account signup, etc.)

### Verify You Received ETH

**Command Line:**
```bash
cast balance $(cat ~/.dstack/secrets/sepolia-address) --rpc-url https://eth-sepolia.g.alchemy.com/v2/demo
```

Expected: Non-zero value (e.g., `50000000000000000` = 0.05 ETH, `100000000000000000` = 0.1 ETH in wei)

**MetaMask:**
- Switch to Sepolia network
- Check balance shown in extension

**Block Explorer:**
```bash
# Open in browser
open "https://sepolia.etherscan.io/address/$(cat ~/.dstack/secrets/sepolia-address)"

# Or manually visit with your address
https://sepolia.etherscan.io/address/YOUR_ADDRESS
```

---

## Step 3: Configure RPC Endpoint

For production use, you should get a dedicated RPC endpoint instead of using the public demo endpoint.

### Option A: Alchemy (Recommended)

1. Visit: https://www.alchemy.com/
2. Sign up for free account
3. Create new app:
   - Name: "dstack-sepolia"
   - Chain: Ethereum
   - Network: Sepolia
4. Copy your RPC URL (looks like: `https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY`)

**Benefits:**
- 300M compute units/month free
- Enhanced APIs
- Dashboard with analytics
- Better reliability than public endpoints

### Option B: Infura

1. Visit: https://www.infura.io/
2. Sign up for free account
3. Create new project
4. Select Sepolia endpoint
5. Copy your RPC URL

### Option C: Public Endpoint (Development Only)

For quick testing, you can use public endpoints:

```
https://eth-sepolia.g.alchemy.com/v2/demo
https://rpc.sepolia.org
https://ethereum-sepolia-rpc.publicnode.com
```

⚠️ **Not recommended for production** - rate limited and less reliable

---

## Step 4: Test RPC Connectivity

### Test with cast

```bash
# Get latest block number
cast block-number --rpc-url https://eth-sepolia.g.alchemy.com/v2/demo

# Get current gas price
cast gas-price --rpc-url https://eth-sepolia.g.alchemy.com/v2/demo

# Get your balance
cast balance $(cat ~/.dstack/secrets/sepolia-address) --rpc-url https://eth-sepolia.g.alchemy.com/v2/demo
```

All commands should return values without errors.

### Test with curl

```bash
curl https://eth-sepolia.g.alchemy.com/v2/demo \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc":"2.0",
    "method":"eth_blockNumber",
    "params":[],
    "id":1
  }'
```

Expected: JSON response with `"result": "0x..."` (hex block number)

---

## Step 5: Document Your Configuration

Create a configuration file for later use:

```bash
# Create config file
cat > ~/.dstack/blockchain-config.sh <<EOF
# Sepolia Testnet Configuration
export SEPOLIA_WALLET_ADDRESS="\$(cat \$HOME/.dstack/secrets/sepolia-address)"
export SEPOLIA_PRIVATE_KEY="\$(cat \$HOME/.dstack/secrets/sepolia-private-key)"
export SEPOLIA_RPC_URL="https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY"
export SEPOLIA_CHAIN_ID="11155111"
EOF

chmod 600 ~/.dstack/blockchain-config.sh
```

**Load when needed:**
```bash
source ~/.dstack/blockchain-config.sh
echo "Wallet: $SEPOLIA_WALLET_ADDRESS"
echo "Balance: $(cast balance $SEPOLIA_WALLET_ADDRESS --rpc-url $SEPOLIA_RPC_URL)"
```

---

## Verification Checklist

Before proceeding to KMS deployment, verify:

- [ ] ✅ Wallet created and address saved
- [ ] ✅ Private key stored securely
- [ ] ✅ Wallet has ≥0.1 testnet ETH
- [ ] ✅ RPC endpoint tested and working
- [ ] ✅ Can query balance via cast or MetaMask
- [ ] ✅ Configuration file created

---

## Ansible Verification

If you're following the Ansible automation approach, run the verification playbook:

```bash
cd ansible
ansible-playbook playbooks/verify-blockchain.yml \
  -e "wallet_address=$(cat ~/.dstack/secrets/sepolia-address)" \
  -e "rpc_url=https://eth-sepolia.g.alchemy.com/v2/demo"
```

This will verify:
- ✅ RPC endpoint connectivity
- ✅ Wallet balance (warns if < 0.1 ETH)
- ✅ Network is Sepolia (chain ID 11155111)

---

## Troubleshooting

### Problem: Faucet not sending ETH

**Solutions:**
- Try different faucet from the list above
- Check wallet address is correct
- Wait 5-10 minutes (sometimes delayed)
- Check block explorer:
  ```bash
  open "https://sepolia.etherscan.io/address/$(cat ~/.dstack/secrets/sepolia-address)"
  ```

### Problem: RPC endpoint timing out

**Solutions:**
- Try different RPC URL from Step 3
- Check internet connection
- Verify RPC URL is correct (no typos)
- Create dedicated Alchemy/Infura account

### Problem: "Connection refused" error

**Solutions:**
- Ensure using `https://` not `http://`
- Try alternative RPC endpoint
- Check firewall not blocking outbound connections

### Problem: Can't see balance in cast

**Solutions:**
- Wait for testnet ETH to arrive (check block explorer)
- Verify RPC URL is correct
- Try different RPC endpoint
- Ensure wallet address is correct

---

## Security Best Practices

### ✅ DO:
- Store private keys in encrypted files with restricted permissions (chmod 600)
- Use environment variables for sensitive data
- Keep separate wallets for testnet and mainnet
- Back up your wallet securely (encrypted USB, password manager)
- Use hardware wallet for mainnet production deployments

### ❌ DON'T:
- Commit private keys to git repositories
- Share private keys via email, chat, or screenshots
- Use testnet wallet for mainnet (always use separate wallets)
- Store private keys in plain text on cloud storage
- Reuse private keys across projects

---

## Next Steps

Once your wallet is set up and funded:

1. **Continue to Phase 1.4:** [TDX Host Preparation](/tutorial/host-preparation)
2. **Or skip to Phase 3:** [KMS Deployment](/tutorial/kms-deployment) (if TDX already configured)

Your blockchain wallet is ready for dstack KMS deployment! 🎉

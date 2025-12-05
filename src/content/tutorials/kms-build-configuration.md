---
title: "KMS Build & Configuration"
description: "Build and configure the dstack Key Management Service"
section: "KMS Deployment"
stepNumber: 3
totalSteps: 5
lastUpdated: 2025-12-04
prerequisites:
  - contract-deployment
tags:
  - dstack
  - kms
  - cargo
  - build
  - configuration
difficulty: "advanced"
estimatedTime: "25 minutes"
---

# KMS Build & Configuration

This tutorial guides you through building and configuring the dstack Key Management Service (KMS). The KMS is a critical component that manages cryptographic keys for TEE applications.

## Prerequisites

Before starting, ensure you have:

- Completed [Contract Deployment](/tutorial/contract-deployment) with:
  - KMS contract address deployed to Sepolia
  - Alchemy API key for RPC access
- Completed [Rust Toolchain Installation](/tutorial/rust-toolchain-installation)
- dstack repository cloned to ~/dstack

## Quick Start: Build with Ansible

For most users, the recommended approach is to use the Ansible playbook.

### Step 1: Run the Build Playbook

```bash
cd ~/dstack-info/ansible
ansible-playbook -i inventory/hosts.yml playbooks/build-kms.yml \
  -e "alchemy_api_key=YOUR_ALCHEMY_API_KEY" \
  -e "kms_contract_address=YOUR_KMS_CONTRACT_ADDRESS"
```

The playbook will:
1. **Build KMS binary** in release mode
2. **Install to system path** at /usr/local/bin/dstack-kms
3. **Create configuration directories** (/etc/kms, /etc/kms/certs)
4. **Generate kms.toml** configuration file
5. **Build auth-eth service** for blockchain authorization
6. **Create auth-eth.env** with your credentials

### Step 2: Verify Build

```bash
dstack-kms --help
cat /etc/kms/kms.toml
```

---

## What Gets Built

The dstack KMS provides:

| Component | Purpose |
|-----------|---------|
| **dstack-kms** | Main KMS binary - generates and stores cryptographic keys |
| **auth-eth** | Node.js service - verifies app permissions via smart contract |
| **kms.toml** | Configuration file for KMS settings |
| **auth-eth.env** | Environment file with Ethereum RPC credentials |

---

## Manual Build

If you prefer to build manually, follow these steps.

### Step 1: Build the KMS Binary

Build the KMS service using Cargo in release mode.

### Navigate to repository root

```bash
cd ~/dstack
```

### Build KMS in release mode

```bash
cargo build --release -p kms
```

This compilation will:
- Download and compile KMS dependencies
- Build the KMS binary with optimizations
- Take 5-10 minutes depending on your system

### Verify the build

```bash
ls -lh ~/dstack/target/release/kms
```

Expected output (typically 20-30MB):
```
-rwxrwxr-x 1 ubuntu ubuntu 25M Nov 20 10:30 /home/ubuntu/dstack/target/release/kms
```

### Test the binary

```bash
~/dstack/target/release/kms --help
```

This displays available command-line options.

## Step 2: Install KMS to System Path

Install the KMS binary to a system-wide location.

### Copy to /usr/local/bin

```bash
sudo cp ~/dstack/target/release/kms /usr/local/bin/dstack-kms
sudo chmod 755 /usr/local/bin/dstack-kms
```

### Verify installation

```bash
which dstack-kms
dstack-kms --help
```

## Step 3: Create Configuration Directories

Create the directory structure for KMS configuration and certificates.

### Create directories

```bash
# Configuration directory
sudo mkdir -p /etc/kms

# Certificate directory
sudo mkdir -p /etc/kms/certs

# Runtime directories
sudo mkdir -p /var/run/kms
sudo mkdir -p /var/log/kms

# Set permissions
sudo chown -R $USER:$USER /etc/kms
sudo chown -R $USER:$USER /var/run/kms
sudo chown -R $USER:$USER /var/log/kms
```

### Verify directory structure

```bash
ls -la /etc/kms
```

You should see:
```
total 12
drwxr-xr-x 3 ubuntu ubuntu 4096 Nov 20 10:35 .
drwxr-xr-x 3 root   root   4096 Nov 20 10:35 ..
drwxr-xr-x 2 ubuntu ubuntu 4096 Nov 20 10:35 certs
```

## Step 4: Create KMS Configuration

Create the main KMS configuration file.

### Create kms.toml

```bash
cat > /etc/kms/kms.toml << 'EOF'
# dstack KMS Configuration
# See: https://github.com/Dstack-TEE/dstack

[default]
workers = 8
max_blocking = 64
ident = "DStack KMS"
temp_dir = "/tmp"
keep_alive = 10
log_level = "info"

# RPC Server Configuration
[rpc]
address = "0.0.0.0"
port = 9100

# TLS Certificate Configuration for RPC
[rpc.tls]
key = "/etc/kms/certs/rpc.key"
certs = "/etc/kms/certs/rpc.crt"

# Mutual TLS (mTLS) Configuration
[rpc.tls.mutual]
ca_certs = "/etc/kms/certs/tmp-ca.crt"
mandatory = false

# Core KMS Configuration
[core]
cert_dir = "/etc/kms/certs"
subject_postfix = ".dstack"
# Intel PCCS URL for TDX quote verification
pccs_url = "https://api.trustedservices.intel.com/tdx/certification/v4"

# Authentication API Configuration
# Uses webhook to query Ethereum contract via auth-eth service
[core.auth_api]
type = "webhook"

[core.auth_api.webhook]
url = "http://127.0.0.1:9200"

# Onboarding Configuration
[core.onboard]
enabled = true
auto_bootstrap_domain = ""
quote_enabled = true
address = "0.0.0.0"
port = 9100
EOF
```

### Configuration explained

| Section | Key | Description |
|---------|-----|-------------|
| `[default]` | `workers` | Number of worker threads (default: 8) |
| `[default]` | `log_level` | Logging level: debug, info, warn, error |
| `[rpc]` | `address` | RPC server bind address |
| `[rpc]` | `port` | RPC server port (9100) |
| `[core]` | `cert_dir` | Directory for certificates |
| `[core]` | `pccs_url` | Intel PCCS for quote verification |
| `[core.auth_api]` | `url` | Auth-eth webhook service URL |
| `[core.onboard]` | `enabled` | Enable bootstrap/onboard mode |

## Step 5: Build Auth-ETH Service

The KMS requires the auth-eth service to query the Ethereum contract for authorization.

### Navigate to auth-eth directory

```bash
cd ~/dstack/kms/auth-eth
```

### Install dependencies

```bash
npm install
```

### Build TypeScript

```bash
npx tsc --project tsconfig.json
```

### Verify build

```bash
ls -la dist/src/
```

You should see `main.js` and other compiled files.

## Step 6: Create Auth-ETH Configuration

Create environment configuration for the auth-eth service.

### Create environment file

```bash
cat > /etc/kms/auth-eth.env << 'EOF'
# Auth-ETH Service Configuration

# Server settings
HOST=127.0.0.1
PORT=9200

# Ethereum RPC endpoint (Sepolia via Alchemy)
ETH_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY

# KMS Authorization Contract Address (from deployment)
KMS_CONTRACT_ADDR=YOUR_KMS_CONTRACT_ADDRESS
EOF
```

### Update with your values

Edit the file and replace:
- `YOUR_ALCHEMY_API_KEY` with your Alchemy API key
- `YOUR_KMS_CONTRACT_ADDRESS` with the address from [Contract Deployment](/tutorial/contract-deployment)

```bash
nano /etc/kms/auth-eth.env
```

### Secure the file

```bash
chmod 600 /etc/kms/auth-eth.env
```

## Step 7: Verify Configuration

### Check KMS configuration syntax

The KMS loads configuration using the Rocket framework's Figment library:

```bash
# Validate TOML syntax
cat /etc/kms/kms.toml | python3 -c "import sys, tomllib; tomllib.load(sys.stdin.buffer); print('Valid TOML')"
```

### Check auth-eth configuration

```bash
# Source and verify environment
source /etc/kms/auth-eth.env
echo "ETH_RPC_URL: ${ETH_RPC_URL:0:30}..."
echo "KMS_CONTRACT_ADDR: $KMS_CONTRACT_ADDR"
```

### Test RPC connectivity

```bash
source /etc/kms/auth-eth.env
curl -s -X POST $ETH_RPC_URL \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' | \
  jq .
```

Expected output shows the current block number.

---

## Architecture Overview

### Component Interaction

```
┌─────────────┐     ┌─────────────┐     ┌──────────────┐
│   TEE App   │────►│     KMS     │────►│   Auth-ETH   │
└─────────────┘     └─────────────┘     └──────────────┘
       │                   │                    │
       │                   │                    ▼
       │                   │            ┌──────────────┐
       │                   │            │   Ethereum   │
       │                   │            │   (Sepolia)  │
       │                   │            └──────────────┘
       │                   │                    │
       │                   ▼                    │
       │            ┌─────────────┐             │
       └───────────►│    VMM      │◄────────────┘
                    └─────────────┘
```

### Data Flow

1. **TEE App** requests key from **KMS**
2. **KMS** calls **Auth-ETH** webhook to verify authorization
3. **Auth-ETH** queries **Ethereum** smart contract
4. If authorized, **KMS** returns key to app
5. **VMM** orchestrates the overall TEE environment

## Troubleshooting

### Build fails with missing dependencies

```
Error: linker `cc` not found
```

Install build dependencies:

```bash
sudo apt install -y build-essential pkg-config libssl-dev
```

### Configuration file not found

```
Error: Could not find configuration file
```

Verify the file exists and has correct permissions:

```bash
ls -la /etc/kms/kms.toml
```

### Auth-eth npm install fails

```
Error: EACCES permission denied
```

Fix npm permissions:

```bash
mkdir -p ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH
npm install
```

### Invalid TOML syntax

```
Error: invalid TOML
```

Validate your configuration:

```bash
cat /etc/kms/kms.toml | python3 -c "import sys, tomllib; tomllib.load(sys.stdin.buffer)"
```

### RPC connection failed

```
Error: could not connect to RPC
```

Check your Alchemy API key and network:

```bash
source /etc/kms/auth-eth.env
curl -v $ETH_RPC_URL
```

## Next Steps

With KMS built and configured, proceed to bootstrap:

- [KMS Bootstrap](/tutorial/kms-bootstrap) - Initialize KMS with root keys

## Additional Resources

- [dstack GitHub Repository](https://github.com/Dstack-TEE/dstack)
- [Intel TDX Documentation](https://www.intel.com/content/www/us/en/developer/tools/trust-domain-extensions/overview.html)
- [Rocket Framework](https://rocket.rs/)
- [Figment Configuration](https://docs.rs/figment/)

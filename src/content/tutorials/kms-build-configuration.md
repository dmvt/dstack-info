---
title: "KMS Build & Configuration"
description: "Build and configure the dstack Key Management Service"
section: "KMS Deployment"
stepNumber: 3
totalSteps: 6
lastUpdated: 2025-12-07
prerequisites:
  - contract-deployment
  - tdx-sgx-verification
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

- Completed [Contract Deployment](/tutorial/contract-deployment) with deployed KMS contract
- Completed [TDX & SGX Verification](/tutorial/tdx-sgx-verification) - **SGX must be verified before KMS deployment**
- Completed [Rust Toolchain Installation](/tutorial/rust-toolchain-installation)
- dstack repository cloned to ~/dstack

> **Important:** The KMS uses a `local_key_provider` that requires SGX to generate TDX attestation quotes. Without SGX properly configured (including Auto MP Registration in BIOS), KMS cannot bootstrap and will fail to generate cryptographic proofs of its TDX environment.

## Quick Start: Build with Ansible

For most users, the recommended approach is to use the Ansible playbook.

### Step 1: Run the Build Playbook

```bash
cd ~/dstack-info/ansible
ansible-playbook -i inventory/hosts.yml playbooks/build-kms.yml
```

The playbook will:
1. **Detect contract address** from the previous deployment (`.deployed-addresses` file)
2. **Build KMS binary** in release mode
3. **Install to system path** at /usr/local/bin/dstack-kms
4. **Create configuration directories** (/etc/kms, /etc/kms/certs)
5. **Generate kms.toml** configuration file
6. **Build auth-eth service** for blockchain authorization
7. **Create auth-eth.env** with contract address and demo RPC endpoint
8. **Build Docker image** for CVM deployment
9. **Create docker-compose.yml** deployment manifest

### Step 2: Verify Build

```bash
ansible-playbook -i inventory/hosts.yml playbooks/verify-kms-build.yml
```

The verification playbook checks:
- KMS binary is installed and shows version
- Configuration files exist and are valid TOML
- Auth-eth service is built
- Contract address is configured
- RPC connectivity works
- Contract exists on chain

---

## What Gets Built

The dstack KMS provides:

| Component | Purpose |
|-----------|---------|
| **dstack-kms** | Main KMS binary - generates and stores cryptographic keys |
| **auth-eth** | Node.js service - verifies app permissions via smart contract |
| **kms.toml** | Configuration file for KMS settings |
| **auth-eth.env** | Environment file with Ethereum RPC credentials |
| **Docker image** | Containerized KMS for deployment in a CVM |
| **docker-compose.yml** | Deployment manifest for VMM |

> **Note:** KMS runs inside a Confidential Virtual Machine (CVM) to enable TDX attestation. The Docker image packages KMS for CVM deployment.

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
cargo build --release -p dstack-kms
```

This compilation will:
- Download and compile KMS dependencies
- Build the KMS binary with optimizations
- Take 5-10 minutes depending on your system

### Verify the build

```bash
ls -lh ~/dstack/target/release/dstack-kms
```

Expected output (typically 20-30MB):
```
-rwxrwxr-x 1 ubuntu ubuntu 25M Nov 20 10:30 /home/ubuntu/dstack/target/release/dstack-kms
```

### Test the binary

```bash
~/dstack/target/release/dstack-kms --help
```

This displays available command-line options.

## Step 2: Install KMS to System Path

Install the KMS binary to a system-wide location.

### Copy to /usr/local/bin

```bash
sudo cp ~/dstack/target/release/dstack-kms /usr/local/bin/dstack-kms
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

### Get contract address from deployment

```bash
# Read the contract address from the deployment file
KMS_CONTRACT_ADDRESS=$(grep KMS_CONTRACT_ADDRESS ~/dstack/kms/auth-eth/.deployed-addresses | cut -d= -f2)
echo "Contract address: $KMS_CONTRACT_ADDRESS"
```

If the file doesn't exist, you need to complete [Contract Deployment](/tutorial/contract-deployment) first.

### Create environment file

```bash
cat > /etc/kms/auth-eth.env << EOF
# Auth-ETH Service Configuration

# Server settings
HOST=127.0.0.1
PORT=9200

# Ethereum RPC endpoint (using public demo endpoint)
ETH_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/demo

# KMS Authorization Contract Address
KMS_CONTRACT_ADDR=$KMS_CONTRACT_ADDRESS
EOF
```

### Secure the file

```bash
chmod 600 /etc/kms/auth-eth.env
```

### Verify configuration

```bash
cat /etc/kms/auth-eth.env
```

## Step 7: Create Docker Image for CVM Deployment

KMS runs inside a Confidential Virtual Machine (CVM) to enable TDX attestation. We need to create a Docker image that packages KMS and auth-eth together.

### Create deployment directory

```bash
mkdir -p ~/kms-deployment
cd ~/kms-deployment
```

### Create Dockerfile

```bash
cat > Dockerfile << 'EOF'
# KMS Docker Image for CVM Deployment
FROM ubuntu:24.04

# Install runtime dependencies
RUN apt-get update && \
    apt-get install -y ca-certificates curl && \
    rm -rf /var/lib/apt/lists/*

# Install Node.js 20.x for auth-eth
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

# Create directories
RUN mkdir -p /etc/kms/certs /var/run/kms /var/log/kms

# Copy KMS binary
COPY dstack-kms /usr/local/bin/dstack-kms
RUN chmod 755 /usr/local/bin/dstack-kms

# Copy auth-eth service
COPY auth-eth /opt/auth-eth

# Copy startup script
COPY start-kms.sh /usr/local/bin/start-kms.sh
RUN chmod 755 /usr/local/bin/start-kms.sh

EXPOSE 9100

ENTRYPOINT ["/usr/local/bin/start-kms.sh"]
EOF
```

### Create startup script

The startup script runs both KMS and auth-eth services:

```bash
cat > start-kms.sh << 'EOF'
#!/bin/bash
set -e

# Start auth-eth in background
cd /opt/auth-eth
node dist/src/main.js &
AUTH_ETH_PID=$!

# Wait for auth-eth to be ready
sleep 2

# Start KMS (foreground)
exec /usr/local/bin/dstack-kms --config /etc/kms/kms.toml
EOF
```

### Copy build artifacts

```bash
# Copy KMS binary
cp ~/dstack/target/release/dstack-kms .

# Copy auth-eth service
cp -r ~/dstack/kms/auth-eth auth-eth
```

### Build Docker image

```bash
docker build -t dstack-kms:latest .
```

### Verify image was created

```bash
docker images dstack-kms
```

Expected output:
```
REPOSITORY    TAG       IMAGE ID       CREATED          SIZE
dstack-kms    latest    abc123def456   10 seconds ago   ~300MB
```

## Step 8: Create docker-compose.yml

Create the deployment manifest for VMM deployment.

### Create docker-compose.yml

```bash
cat > docker-compose.yml << 'EOF'
# KMS Deployment Manifest for dstack CVM
# Deploy via VMM web interface at http://localhost:9080

services:
  kms:
    image: dstack-kms:latest
    ports:
      - "9100:9100"
    volumes:
      # Mount config file from local directory
      - ./kms.toml:/etc/kms/kms.toml:ro
      - ./auth-eth.env:/etc/kms/auth-eth.env:ro
      # Named volume for persistent certificates
      - kms-certs:/etc/kms/certs
    environment:
      - RUST_LOG=info
    restart: unless-stopped

volumes:
  kms-certs:
    # Certificates persist across container restarts
EOF
```

### Create CVM-specific kms.toml

The KMS config for CVM deployment enables TDX attestation:

```bash
cat > kms.toml << 'EOF'
# dstack KMS Configuration (CVM Deployment)

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
pccs_url = "https://api.trustedservices.intel.com/tdx/certification/v4"

# Authentication API Configuration
[core.auth_api]
type = "webhook"

[core.auth_api.webhook]
url = "http://127.0.0.1:9200"

# Onboarding Configuration
[core.onboard]
enabled = true
# Set your KMS domain for auto-bootstrap
auto_bootstrap_domain = "kms.example.com"
# Enable TDX quotes - works because KMS runs in CVM
quote_enabled = true
address = "0.0.0.0"
port = 9100
EOF
```

> **Important:** Set `auto_bootstrap_domain` to your actual KMS domain before deployment.

### Copy auth-eth.env

```bash
cp /etc/kms/auth-eth.env .
```

### Verify deployment files

```bash
ls -la ~/kms-deployment/
```

You should have:
- `Dockerfile` - Container build definition
- `dstack-kms` - KMS binary
- `auth-eth/` - Auth-eth service directory
- `start-kms.sh` - Startup script
- `docker-compose.yml` - Deployment manifest
- `kms.toml` - KMS configuration
- `auth-eth.env` - Auth-eth environment

## Step 9: Verify Configuration

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
curl -s -X POST "$ETH_RPC_URL" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' | \
  jq .
```

Expected output shows the current block number.

### Verify contract exists

```bash
source /etc/kms/auth-eth.env
curl -s -X POST "$ETH_RPC_URL" \
  -H "Content-Type: application/json" \
  -d "{\"jsonrpc\":\"2.0\",\"method\":\"eth_getCode\",\"params\":[\"$KMS_CONTRACT_ADDR\",\"latest\"],\"id\":1}" | \
  jq -r 'if .result != "0x" then "✓ Contract found" else "✗ Contract not found" end'
```

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

Check network connectivity:

```bash
curl -s "https://eth-sepolia.g.alchemy.com/v2/demo" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

### Contract address not set

```
Error: KMS_CONTRACT_ADDR not set
```

Ensure you've completed [Contract Deployment](/tutorial/contract-deployment) and the `.deployed-addresses` file exists:

```bash
cat ~/dstack/kms/auth-eth/.deployed-addresses
```

## Next Steps

With KMS built and containerized, proceed to CVM deployment:

- [KMS CVM Deployment](/tutorial/kms-cvm-deployment) - Deploy KMS as a Confidential VM
- [KMS Bootstrap](/tutorial/kms-bootstrap) - Verify KMS initialization and TDX attestation

## Additional Resources

- [dstack GitHub Repository](https://github.com/Dstack-TEE/dstack)
- [Intel TDX Documentation](https://www.intel.com/content/www/us/en/developer/tools/trust-domain-extensions/overview.html)
- [Rocket Framework](https://rocket.rs/)
- [Figment Configuration](https://docs.rs/figment/)

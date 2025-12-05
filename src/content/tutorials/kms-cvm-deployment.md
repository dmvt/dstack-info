---
title: "KMS CVM Deployment"
description: "Deploy dstack KMS as a Confidential Virtual Machine for TDX attestation"
section: "KMS Deployment"
stepNumber: 4
totalSteps: 6
lastUpdated: 2025-12-04
prerequisites:
  - kms-build-configuration
tags:
  - dstack
  - kms
  - cvm
  - tdx
  - teepod
  - deployment
difficulty: "advanced"
estimatedTime: "20 minutes"
---

# KMS CVM Deployment

This tutorial guides you through deploying the dstack KMS as a Confidential Virtual Machine (CVM). Running KMS inside a CVM enables TDX attestation, providing cryptographic proof that the KMS keys were generated in a genuine Intel TDX environment.

## Why Deploy KMS in a CVM?

Running KMS inside a CVM provides significant security benefits:

| Benefit | Description |
|---------|-------------|
| **TDX Attestation** | Generate cryptographic quotes proving keys were created in genuine TDX |
| **Memory Encryption** | Root keys protected by TDX hardware encryption, not just file permissions |
| **Verifiable Integrity** | Anyone can verify KMS integrity via attestation quote |
| **Consistent Model** | KMS deployed the same way as other dstack applications |

## Prerequisites

Before starting, ensure you have:

- Completed [KMS Build & Configuration](/tutorial/kms-build-configuration)
- Docker image `dstack-kms:latest` built
- Deployment files in `~/kms-deployment/`
- dstack VMM running (`systemctl status dstack-vmm`)
- teepod available for CVM deployment

## Quick Start: Deploy with Ansible

For most users, the recommended approach is to use the Ansible playbook.

### Step 1: Set Your KMS Domain

Before deploying, configure the KMS domain in the deployment config:

```bash
# Edit the kms.toml in deployment directory
nano ~/kms-deployment/kms.toml

# Find and update this line:
auto_bootstrap_domain = "kms.yourdomain.com"
```

Or use sed:

```bash
sed -i 's/auto_bootstrap_domain = ""/auto_bootstrap_domain = "kms.yourdomain.com"/' ~/kms-deployment/kms.toml
```

### Step 2: Run the Deployment Playbook

```bash
cd ~/dstack-info/ansible
ansible-playbook -i inventory/hosts.yml playbooks/deploy-kms-cvm.yml \
  -e "kms_domain=kms.yourdomain.com"
```

The playbook will:
1. **Verify prerequisites** - Docker image, config files, VMM running
2. **Update kms.toml** with the domain for auto-bootstrap
3. **Deploy KMS CVM** via teepod
4. **Wait for health check** - KMS RPC becomes available
5. **Verify bootstrap** - Check certificate files were generated
6. **Retrieve TDX quote** - Confirm attestation is working

### Step 3: Verify Deployment

```bash
ansible-playbook -i inventory/hosts.yml playbooks/verify-kms-cvm.yml
```

---

## What Gets Deployed

When you deploy KMS as a CVM, the following happens:

1. **CVM Creation** - teepod creates a TDX-protected virtual machine
2. **Container Start** - Docker container runs inside the CVM
3. **Auto-Bootstrap** - KMS detects empty certs directory, generates root keys
4. **TDX Quote** - KMS generates attestation quote proving TDX environment
5. **Service Ready** - KMS RPC server starts accepting connections

### Generated Artifacts

Inside the CVM at `/etc/kms/certs/`:

| File | Purpose |
|------|---------|
| `root-ca.crt` | Root Certificate Authority (self-signed) |
| `root-ca.key` | Root CA signing key (P256 ECDSA) |
| `rpc.crt` | TLS certificate for RPC server |
| `rpc.key` | RPC server private key |
| `tmp-ca.crt` | Temporary CA for mutual TLS |
| `tmp-ca.key` | Temporary CA private key |
| `root-k256.key` | Ethereum signing key (secp256k1) |
| `bootstrap-info.json` | Public keys and TDX attestation quote |

---

## Manual Deployment

If you prefer to deploy manually, follow these steps.

### Step 1: Verify Prerequisites

Check that all required components are ready.

#### Verify Docker image exists

```bash
docker images dstack-kms:latest
```

Expected output shows the image with size ~300MB.

#### Verify deployment files

```bash
ls -la ~/kms-deployment/
```

Required files:
- `Dockerfile`
- `docker-compose.yml`
- `kms.toml`
- `auth-eth.env`
- `start-kms.sh`
- `dstack-kms` (binary)
- `auth-eth/` (directory)

#### Verify VMM is running

```bash
systemctl status dstack-vmm
```

The VMM must be active and running.

### Step 2: Configure KMS Domain

Set the domain name for auto-bootstrap in kms.toml:

```bash
cd ~/kms-deployment

# Edit kms.toml
nano kms.toml
```

Find the `[core.onboard]` section and set:

```toml
[core.onboard]
enabled = true
auto_bootstrap_domain = "kms.yourdomain.com"  # Your domain here
quote_enabled = true
address = "0.0.0.0"
port = 9100
```

### Step 3: Deploy via teepod

Use teepod to deploy the KMS container as a CVM:

```bash
cd ~/kms-deployment

# Deploy the CVM
teepod deploy docker-compose.yml
```

> **Note:** The exact teepod command may vary depending on your dstack configuration. Consult your dstack documentation for the specific deployment command.

### Step 4: Monitor Deployment

Watch the CVM startup and bootstrap process:

```bash
# Check teepod status
teepod list

# View CVM logs
teepod logs kms
```

Look for these log messages indicating successful bootstrap:

```
Starting KMS in bootstrap mode
Bootstrap required - keys not found
Generating root CA certificate...
Generating RPC certificate...
Generating K256 key...
Generating TDX quote...
Bootstrap complete
Starting RPC server on 0.0.0.0:9100
```

### Step 5: Verify KMS is Running

Test connectivity to the KMS RPC server:

```bash
# Test RPC endpoint (will fail TLS initially, but confirms port is open)
curl -k https://localhost:9100/

# Or test the onboard endpoint
curl http://localhost:9100/prpc/KMS.GetMeta
```

### Step 6: Retrieve Bootstrap Information

Get the bootstrap information including the TDX attestation quote:

```bash
curl -s http://localhost:9100/prpc/KMS.GetMeta | jq .
```

Expected response:

```json
{
  "ca_pubkey": "0x02a1b2c3d4e5f6...",
  "k256_pubkey": "0x03f1e2d3c4b5a6...",
  "quote": "base64-encoded-tdx-quote",
  "eventlog": "base64-encoded-eventlog"
}
```

The presence of `quote` confirms TDX attestation is working.

---

## Verifying TDX Attestation

With KMS running in a CVM, the TDX quote provides cryptographic proof of integrity.

### View the TDX Quote

```bash
# Get bootstrap info from running KMS
curl -s http://localhost:9100/prpc/KMS.GetMeta | jq -r '.quote'
```

### Quote Contents

The TDX quote contains:
- **MRTD** - Measurement of the TDX environment
- **RTMR** - Runtime measurements
- **Report Data** - KMS public keys bound to the quote
- **Signature** - Intel's attestation signature

### Verification Options

The TDX quote can be verified by:

1. **Intel PCCS** - Platform Configuration and Certification Service
2. **On-chain verification** - Smart contract quote validation
3. **Third-party services** - Independent attestation verification

---

## Architecture

### CVM-based KMS Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     TDX Host                            │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │              dstack-vmm                          │   │
│  │                                                  │   │
│  │  ┌─────────────────────────────────────────┐   │   │
│  │  │           KMS CVM (TDX Protected)        │   │   │
│  │  │                                          │   │   │
│  │  │  ┌──────────────────────────────────┐   │   │   │
│  │  │  │     Docker Container              │   │   │   │
│  │  │  │                                   │   │   │   │
│  │  │  │  ┌─────────┐   ┌──────────────┐  │   │   │   │
│  │  │  │  │  KMS    │◄──│  auth-eth    │  │   │   │   │
│  │  │  │  └────┬────┘   └──────┬───────┘  │   │   │   │
│  │  │  │       │               │          │   │   │   │
│  │  │  │       ▼               ▼          │   │   │   │
│  │  │  │  /etc/kms/certs   Ethereum RPC   │   │   │   │
│  │  │  └──────────────────────────────────┘   │   │   │
│  │  │                                          │   │   │
│  │  │  guest-agent (/var/run/dstack.sock)     │   │   │
│  │  └─────────────────────────────────────────┘   │   │
│  │                                                  │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Port 9100 ◄─── External connections                   │
└─────────────────────────────────────────────────────────┘
```

### Key Differences from Host-based KMS

| Aspect | Host-based KMS | CVM-based KMS |
|--------|----------------|---------------|
| TDX Attestation | Not available | Full attestation with quotes |
| Memory Protection | OS-level only | TDX hardware encryption |
| Key Security | File permissions | Hardware-protected memory |
| Verification | Physical security | Cryptographic proof |
| Deployment | systemd service | teepod CVM |

---

## Troubleshooting

### CVM fails to start

```
Error: Failed to create CVM
```

Check VMM status and logs:

```bash
systemctl status dstack-vmm
journalctl -u dstack-vmm -n 50
```

Ensure VMM has TDX enabled and sufficient resources.

### Bootstrap hangs

```
Waiting for bootstrap to complete...
```

Check if guest-agent is running inside the CVM:

```bash
teepod exec kms -- ls -la /var/run/dstack.sock
```

The socket must exist for TDX quote generation.

### Port 9100 not accessible

```
Connection refused
```

Check CVM network configuration:

```bash
# Verify port mapping in docker-compose.yml
cat ~/kms-deployment/docker-compose.yml | grep ports -A2

# Check if container is running inside CVM
teepod exec kms -- docker ps
```

### TDX quote not generated

```
"quote": null
```

This indicates quote_enabled might be false, or guest-agent issues:

```bash
# Check kms.toml configuration
teepod exec kms -- cat /etc/kms/kms.toml | grep quote_enabled

# Check guest-agent socket
teepod exec kms -- ls -la /var/run/dstack.sock
```

### Authentication errors from auth-eth

```
Error: Contract call failed
```

Verify auth-eth.env configuration:

```bash
cat ~/kms-deployment/auth-eth.env
```

Ensure:
- `ETH_RPC_URL` is accessible
- `KMS_CONTRACT_ADDR` is correct
- Contract is deployed on the network

---

## Certificate Persistence

### Understanding Storage

CVM certificates are stored in a Docker named volume (`kms-certs`). This provides:

- **Container restart persistence** - Certificates survive container restarts
- **CVM restart consideration** - Depending on teepod configuration, volumes may or may not persist

### Backup Recommendations

After successful bootstrap, backup the certificates:

```bash
# Copy certs from CVM to host
teepod cp kms:/etc/kms/certs/ ~/kms-certs-backup/

# Create encrypted backup
tar czf - ~/kms-certs-backup/ | \
  gpg --symmetric --cipher-algo AES256 > kms-backup-$(date +%Y%m%d).tar.gz.gpg
```

Store backups securely offline.

---

## Next Steps

With KMS deployed as a CVM, verify the bootstrap:

- [KMS Bootstrap](/tutorial/kms-bootstrap) - Verify initialization and TDX attestation

## Additional Resources

- [Intel TDX Attestation](https://www.intel.com/content/www/us/en/developer/tools/trust-domain-extensions/overview.html)
- [dstack GitHub Repository](https://github.com/Dstack-TEE/dstack)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

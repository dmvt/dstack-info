---
title: "KMS CVM Deployment"
description: "Deploy dstack KMS as a Confidential Virtual Machine for TDX attestation"
section: "KMS Deployment"
stepNumber: 4
totalSteps: 6
lastUpdated: 2025-12-07
prerequisites:
  - kms-build-configuration
tags:
  - dstack
  - kms
  - cvm
  - tdx
  - vmm
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
- Completed [TDX & SGX Verification](/tutorial/tdx-sgx-verification) - SGX must be working for attestation
- Docker image `dstack-kms:latest` built
- Deployment files in `~/kms-deployment/`
- dstack VMM running (`systemctl status dstack-vmm`)
- VMM web interface available at http://localhost:9080

> **Why SGX is required:** The KMS uses Intel SGX to generate TDX attestation quotes via the `local_key_provider`. SGX Auto MP Registration must be enabled in BIOS so your platform is registered with Intel's Provisioning Certification Service (PCS). Without this registration, KMS cannot generate valid attestation quotes, and bootstrap will fail.

## Quick Start: Deploy with Ansible

For most users, the recommended approach is to use the Ansible playbook.

### Step 1: Run the Deployment Playbook

```bash
cd ~/dstack-info/ansible
ansible-playbook -i inventory/hosts.yml playbooks/deploy-kms-cvm.yml \
  -e "kms_domain=kms.yourdomain.com"
```

Replace `kms.yourdomain.com` with your actual KMS domain.

The playbook will:
1. **Verify prerequisites** - Docker image, config files, VMM running
2. **Update kms.toml** with the domain for auto-bootstrap
3. **Deploy KMS CVM** via VMM web interface
4. **Wait for health check** - KMS RPC becomes available
5. **Verify bootstrap** - Check certificate files were generated
6. **Retrieve TDX quote** - Confirm attestation is working

### Step 2: Verify Deployment

```bash
ansible-playbook -i inventory/hosts.yml playbooks/verify-kms-cvm.yml
```

---

## What Gets Deployed

When you deploy KMS as a CVM, the following happens:

1. **CVM Creation** - VMM creates a TDX-protected virtual machine
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

### Step 3: Deploy via VMM Web Interface

Deploy the KMS container as a CVM using the VMM Management Console.

#### Option A: Web Interface (Recommended)

1. Open the VMM Management Console in your browser:
   ```
   http://localhost:9080
   ```

2. Click **"Deploy a new instance"**

3. Fill in the deployment form:
   - **Name**: `kms`
   - **vCPUs**: `2`
   - **Memory**: `4 GB`
   - **Storage**: `10 GB`
   - **Docker Compose File**: Paste the contents of `~/kms-deployment/docker-compose.yml`

4. Enable these features:
   - **KMS**: Unchecked (this IS the KMS)
   - **dstack Gateway**: Checked (for external access)

5. Click **Deploy**

#### Option B: API (for automation)

```bash
cd ~/kms-deployment

# Deploy via VMM API
curl -X POST http://127.0.0.1:9080/api/deploy \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -d @- << EOF
{
  "name": "kms",
  "vcpu": 2,
  "memory": 4096,
  "disk_size": 10240,
  "compose_file": "$(cat docker-compose.yml | base64 -w0)"
}
EOF
```

> **Note:** Replace `YOUR_AUTH_TOKEN` with the token from your VMM configuration.

### Step 4: Monitor Deployment

Watch the CVM startup and bootstrap process:

#### Via Web Interface

1. In the VMM Console, find the `kms` instance in the VM list
2. Click **Logs** to view real-time startup logs

#### Via API

```bash
# List all instances
curl -s http://127.0.0.1:9080/api/instances | jq '.instances[] | {name, status}'

# View KMS logs
curl -s "http://127.0.0.1:9080/api/instances/kms/logs?lines=50"
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
| Deployment | systemd service | VMM-managed CVM |

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

Check if guest-agent is running inside the CVM. Use the VMM web console to view the instance details, or check the logs:

```bash
# View CVM logs via API
curl -s "http://127.0.0.1:9080/api/instances/kms/logs?lines=100"
```

The `/var/run/dstack.sock` socket must exist inside the CVM for TDX quote generation.

### Port 9100 not accessible

```
Connection refused
```

Check CVM network configuration:

```bash
# Verify port mapping in docker-compose.yml
cat ~/kms-deployment/docker-compose.yml | grep ports -A2

# Check CVM status via VMM API
curl -s http://127.0.0.1:9080/api/instances/kms | jq '{status, ports}'
```

### TDX quote not generated

```
"quote": null
```

This indicates quote_enabled might be false, guest-agent issues, or **SGX not properly configured**:

```bash
# Check CVM logs for TDX-related errors
curl -s "http://127.0.0.1:9080/api/instances/kms/logs?lines=100" | grep -i "quote\|tdx\|sgx"
```

**Common causes:**

1. **SGX not enabled in BIOS** - Verify SGX devices exist on host:
   ```bash
   ls -la /dev/sgx*
   ```
   If missing, configure SGX in BIOS. See [TDX & SGX BIOS Configuration](/tutorial/tdx-bios-configuration).

2. **SGX Auto MP Registration not enabled** - Without this BIOS setting, your platform isn't registered with Intel's PCS, and attestation quotes cannot be verified. Re-enter BIOS and enable "SGX Auto MP Registration".

3. **quote_enabled is false** - Verify your `kms.toml` has `quote_enabled = true` in the `[core.onboard]` section.

4. **Guest-agent not running** - The `/var/run/dstack.sock` socket must exist inside the CVM.

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
- **CVM restart consideration** - Depending on VMM configuration, volumes may or may not persist

### Backup Recommendations

After successful bootstrap, backup the certificates by retrieving the bootstrap info:

```bash
# Save bootstrap info (contains public keys and quote)
curl -s http://localhost:9100/prpc/KMS.GetMeta > ~/kms-bootstrap-info-$(date +%Y%m%d).json

# The private keys remain inside the CVM for security
# For full backup, use the VMM console to export the CVM state
```

Store backup information securely offline.

---

## Next Steps

With KMS deployed as a CVM, verify the bootstrap:

- [KMS Bootstrap](/tutorial/kms-bootstrap) - Verify initialization and TDX attestation

## Additional Resources

- [Intel TDX Attestation](https://www.intel.com/content/www/us/en/developer/tools/trust-domain-extensions/overview.html)
- [dstack GitHub Repository](https://github.com/Dstack-TEE/dstack)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

---
title: "KMS CVM Deployment"
description: "Deploy dstack KMS as a Confidential Virtual Machine for TDX attestation"
section: "KMS Deployment"
stepNumber: 2
totalSteps: 2
lastUpdated: 2026-01-09
prerequisites:
  - kms-build-configuration
  - gramine-key-provider
  - local-docker-registry
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
- Completed [Gramine Key Provider](/tutorial/gramine-key-provider) - Required for CVM boot
- Completed [Local Docker Registry](/tutorial/local-docker-registry) - With KMS image cached
- Completed [TDX & SGX Verification](/tutorial/tdx-sgx-verification) - SGX must be working for attestation
- KMS image pushed to local registry (`registry.yourdomain.com/dstack-kms:fixed`)
- dstack VMM running (`systemctl status dstack-vmm`)
- VMM web interface available at http://localhost:9080

> **Why SGX is required:** The KMS uses Intel SGX to generate TDX attestation quotes via the `local_key_provider`. SGX Auto MP Registration must be enabled in BIOS so your platform is registered with Intel's Provisioning Certification Service (PCS). Without this registration, KMS cannot generate valid attestation quotes, and bootstrap will fail.

> **Why local registry?** The default KMS image uses a rate-limited Ethereum RPC endpoint (Alchemy demo) that causes GetMeta calls to hang. The [Local Docker Registry](/tutorial/local-docker-registry) tutorial shows how to build a fixed image with a working RPC endpoint.

## Quick Start: Deploy with Ansible

> **Using Ansible?** Playbooks are in `~/dstack-info/ansible`. If you haven't set up Ansible yet, see [TDX Software Installation: Quick Start with Ansible](/tutorial/tdx-software-installation#quick-start-install-with-ansible) for initial setup.

For most users, the recommended approach is to use the Ansible playbook.

### Step 1: Run the Deployment Playbook

```bash
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

#### Verify KMS image in local registry

```bash
curl -sk https://registry.yourdomain.com/v2/dstack-kms/tags/list
```

Expected output shows the `:fixed` tag:
```json
{"name":"dstack-kms","tags":["fixed","latest"]}
```

If missing, complete the [Local Docker Registry](/tutorial/local-docker-registry) tutorial first.

#### Verify Gramine Key Provider is running

```bash
docker ps | grep gramine-sealing-key-provider
```

Should show the container running. If not, complete the [Gramine Key Provider](/tutorial/gramine-key-provider) tutorial.

#### Verify VMM is running

```bash
systemctl status dstack-vmm
```

The VMM must be active and running.

### Step 2: Create Deployment Directory

```bash
mkdir -p ~/kms-deploy
cd ~/kms-deploy
```

### Step 3: Create docker-compose.yaml

Create the compose file with your registry domain:

```bash
cat > docker-compose.yaml << 'EOF'
services:
  kms:
    image: registry.yourdomain.com/dstack-kms:fixed
    ports:
      - "9100:9100"
    volumes:
      - /var/run/dstack.sock:/var/run/dstack.sock
      - kms-certs:/etc/kms/certs
    environment:
      - RUST_LOG=info
      - KMS_DOMAIN=kms.yourdomain.com
    restart: unless-stopped
volumes:
  kms-certs:
EOF
```

**Important settings:**
- `image`: Must use your local registry with the `:fixed` tag
- `/var/run/dstack.sock`: Required for TDX attestation
- `KMS_DOMAIN`: Your KMS domain for auto-bootstrap

### Step 4: Deploy via vmm-cli.py

Use the VMM CLI tool to deploy the CVM:

```bash
# Navigate to dstack VMM directory
cd ~/dstack/vmm

# Generate app-compose.json with local key provider enabled
./vmm-cli.py --url http://127.0.0.1:9080 compose \
  --name kms \
  --docker-compose ~/kms-deploy/docker-compose.yaml \
  --local-key-provider \
  --output ~/kms-deploy/app-compose.json

# Deploy the CVM
./vmm-cli.py --url http://127.0.0.1:9080 deploy \
  --name kms \
  --image dstack-0.5.5 \
  --compose ~/kms-deploy/app-compose.json \
  --vcpu 2 \
  --memory 4096 \
  --disk 20 \
  --port tcp:127.0.0.1:9100:9100
```

**Key flags explained:**
- `--local-key-provider`: Enables Gramine key provider for CVM boot
- `--image dstack-0.5.5`: Guest image from VMM images directory
- `--port tcp:127.0.0.1:9100:9100`: Maps host port 9100 to CVM port 9100

> **Note:** Do NOT use `--secure-time` flag - it causes CVM to hang during boot waiting for time sync.

### Step 5: Monitor Deployment

Watch the CVM boot process:

```bash
# List VMs to get the ID
./vmm-cli.py --url http://127.0.0.1:9080 list

# View logs (replace VM_ID with actual ID)
./vmm-cli.py --url http://127.0.0.1:9080 logs --id VM_ID --follow
```

Look for these log messages indicating successful startup:
```
KMS CVM booting...
Docker container starting...
KMS initializing...
Auto-bootstrap enabled for domain kms.yourdomain.com
Generating certificates...
RPC server listening on 0.0.0.0:9100
```

### Step 6: Verify KMS is Running

Test connectivity to the KMS RPC server:

```bash
# Test with HTTPS (KMS uses TLS)
curl -sk https://localhost:9100/prpc/KMS.GetMeta | jq .
```

**Important:** Use HTTPS, not HTTP. The KMS RPC endpoint requires TLS.

### Step 7: Retrieve Bootstrap Information

Get the bootstrap information including the TDX attestation quote:

```bash
curl -sk https://localhost:9100/prpc/KMS.GetMeta | jq .
```

Expected response:

```json
{
  "ca_cert": "-----BEGIN CERTIFICATE-----...",
  "allow_any_upgrade": false,
  "k256_pubkey": "0304c6bfe0ecd9bfa8b8c3450c8fb49f52d6234522bd4e42c0736db852da8c871e",
  "bootstrap_info": null,
  "is_dev": false,
  "gateway_app_id": "",
  "kms_contract_address": "0xe6c23bfE4686E28DcDA15A1996B1c0C549656E26",
  "chain_id": 11155111,
  "app_auth_implementation": "0xc308574F9A0c7d144d7AD887785D25C386D32B54"
}
```

Key fields to verify:
- `ca_cert`: Root CA certificate was generated
- `k256_pubkey`: Ethereum signing key was generated
- `chain_id`: 11155111 indicates Sepolia testnet
- `kms_contract_address`: The deployed KMS contract address

### Step 8: Test Response Time

Verify the RPC responds quickly (not hanging):

```bash
time curl -sk https://localhost:9100/prpc/KMS.GetMeta > /dev/null
```

Expected: Response in < 1 second. If it takes > 10 seconds or hangs, see Troubleshooting section below.

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

### GetMeta Hangs or Times Out

**Symptom:** `curl` to GetMeta hangs indefinitely or times out after 30+ seconds

**Root Cause:** The auth-eth service inside the container is using a rate-limited Ethereum RPC endpoint (Alchemy demo returns HTTP 429).

**Solution:** Use the fixed KMS image from your local registry:

```bash
# Verify you're using the :fixed tag in docker-compose.yaml
grep "image:" ~/kms-deploy/docker-compose.yaml
# Should show: image: registry.yourdomain.com/dstack-kms:fixed
```

If using the unfixed image, rebuild following the [Local Docker Registry](/tutorial/local-docker-registry) tutorial.

**Verification:** The fixed image uses `https://ethereum-sepolia.publicnode.com` instead of the rate-limited Alchemy demo endpoint.

### Authentication errors from auth-eth

```
Error: Contract call failed
```

Verify auth-eth.env configuration inside the container uses a working RPC:

```bash
# The :fixed image should have:
# ETH_RPC_URL=https://ethereum-sepolia.publicnode.com
# KMS_CONTRACT_ADDR=0xe6c23bfE4686E28DcDA15A1996B1c0C549656E26
```

If you need to customize the contract address, rebuild the image following the [Local Docker Registry](/tutorial/local-docker-registry) tutorial.

### CVM Hangs at "Waiting for time to be synchronized"

**Symptom:** CVM boot log shows "Waiting for the system time to be synchronized" and never proceeds

**Root Cause:** The `--secure-time` flag was used during deployment

**Solution:** Redeploy without the `--secure-time` flag:

```bash
./vmm-cli.py --url http://127.0.0.1:9080 deploy \
  --name kms \
  --image dstack-0.5.5 \
  --compose ~/kms-deploy/app-compose.json \
  --vcpu 2 \
  --memory 4096 \
  --disk 20 \
  --port tcp:127.0.0.1:9100:9100
  # Note: NO --secure-time flag
```

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

With KMS deployed as a CVM, proceed to set up the Gateway:

- [Gateway Build & Configuration](/tutorial/gateway-build-configuration) - Build and configure the dstack gateway

## Additional Resources

- [Intel TDX Attestation](https://www.intel.com/content/www/us/en/developer/tools/trust-domain-extensions/overview.html)
- [dstack GitHub Repository](https://github.com/Dstack-TEE/dstack)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

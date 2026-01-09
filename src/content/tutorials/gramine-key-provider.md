---
title: "Gramine Key Provider"
description: "Deploy SGX-based Gramine Sealing Key Provider for CVM attestation"
section: "Prerequisites"
stepNumber: 5
totalSteps: 6
lastUpdated: 2026-01-09
prerequisites:
  - docker-setup
tags:
  - gramine
  - sgx
  - attestation
  - key-provider
  - prerequisites
difficulty: advanced
estimatedTime: "30 minutes"
---

# Gramine Key Provider

This tutorial guides you through deploying the Gramine Sealing Key Provider, an SGX-based service that solves the "chicken-and-egg" problem in CVM deployment. The key provider runs on the host and provides attestation-backed sealing keys to CVMs during boot.

## Why You Need This

When deploying a dstack CVM (like the KMS), there's a fundamental bootstrapping problem:

| The Problem | Why It Matters |
|-------------|----------------|
| CVMs need sealing keys to boot | Keys protect secrets inside the CVM |
| KMS is the service that provides keys | But KMS itself is a CVM that needs keys |
| **Chicken-and-egg:** KMS needs keys, but KMS provides keys | Deployment deadlock |

**The Solution:** The Gramine Sealing Key Provider runs on the **host** using Intel SGX (not TDX). It can provide attestation-backed sealing keys to CVMs during their initial boot. Once the KMS CVM boots successfully, it takes over key management for subsequent deployments.

## How It Works

```
┌─────────────────────────────────────────────────────────────┐
│                       TDX Host                               │
│                                                              │
│  ┌──────────────────────────────────────┐                   │
│  │     Gramine Sealing Key Provider     │                   │
│  │          (SGX Enclave)               │                   │
│  │                                      │                   │
│  │  - Runs in Intel SGX enclave         │                   │
│  │  - Listens on 127.0.0.1:3443         │                   │
│  │  - Provides sealing keys via HTTPS   │                   │
│  │  - Verifies TDX quotes from CVMs     │                   │
│  └──────────────────────┬───────────────┘                   │
│                         │                                    │
│                         ▼ (provides keys)                    │
│  ┌──────────────────────────────────────┐                   │
│  │           KMS CVM (TDX)              │                   │
│  │                                      │                   │
│  │  - Boots with sealing key            │                   │
│  │  - Generates TDX attestation quote   │                   │
│  │  - Takes over key management         │                   │
│  └──────────────────────────────────────┘                   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Key Points:**
- Gramine runs in an SGX enclave (not a TDX CVM)
- Only provides keys to verified TDX CVMs
- Uses PPID (Platform Provisioning ID) verification
- Temporary solution until KMS CVM is running

## Prerequisites

Before starting, ensure you have:

- Completed [TDX & SGX Verification](/tutorial/tdx-sgx-verification) - SGX devices must be present
- Completed [PCCS Configuration](/tutorial/pccs-configuration) - PCCS configured with Intel API key
- Docker installed and running
- SGX devices accessible: `/dev/sgx_enclave`, `/dev/sgx_provision`

### Verify SGX Devices

```bash
ls -la /dev/sgx*
```

Expected output:
```
crw------- 1 root root 10, 125 Dec  8 00:00 /dev/sgx_enclave
crw------- 1 root root 10, 126 Dec  8 00:00 /dev/sgx_provision
crw------- 1 root root 10, 124 Dec  8 00:00 /dev/sgx_vepc
```

If these devices are missing, complete the [TDX BIOS Configuration](/tutorial/tdx-bios-configuration) tutorial first.

---

## Quick Start: Deploy with Ansible

> **Using Ansible?** Playbooks are in `~/dstack-info/ansible`. If you haven't set up Ansible yet, see [TDX Software Installation: Quick Start with Ansible](/tutorial/tdx-software-installation#quick-start-install-with-ansible) for initial setup.

### Step 1: Run the Deployment Playbook

```bash
ansible-playbook -i inventory/hosts.yml playbooks/setup-gramine-key-provider.yml
```

The playbook will:
1. **Verify SGX prerequisites** - Check devices exist
2. **Clone dstack repository** (if not present)
3. **Build Docker images** for aesmd and key provider
4. **Start containers** with proper SGX device access
5. **Verify health** - Check key provider is responding

### Step 2: Verify Deployment

```bash
ansible-playbook -i inventory/hosts.yml playbooks/verify-gramine-key-provider.yml
```

---

## Manual Deployment

If you prefer to deploy manually, follow these steps.

### Step 1: Clone dstack Repository

If you haven't already cloned dstack:

```bash
cd ~
git clone https://github.com/Dstack-TEE/dstack.git
cd dstack
```

Or if already cloned, update to latest:

```bash
cd ~/dstack
git pull
```

### Step 2: Navigate to Key Provider

```bash
cd ~/dstack/key-provider-build
ls -la
```

You should see:
- `docker-compose.yml` - Container orchestration
- `Dockerfile.aesmd` (or similar) - SGX AESM daemon image
- `Dockerfile.gramine` (or similar) - Gramine key provider image

### Step 3: Build Docker Images

```bash
docker compose build
```

This builds two images:
1. **aesmd** - Intel SGX Architectural Enclave Service Manager
2. **gramine-sealing-key-provider** - The actual key provider

Build time: ~5-10 minutes on first run.

### Step 4: Start Services

```bash
docker compose up -d
```

This starts:
- **aesmd container** - Provides SGX enclave services
- **gramine-sealing-key-provider container** - Key provider on port 3443

### Step 5: Verify Services Running

Check container status:

```bash
docker ps | grep -E "(aesmd|gramine)"
```

Expected output shows both containers running:
```
abc123  aesmd                           Up 2 minutes
def456  gramine-sealing-key-provider    Up 2 minutes
```

Check aesmd logs:

```bash
docker logs aesmd 2>&1 | tail -20
```

Look for successful initialization messages.

Check key provider logs:

```bash
docker logs gramine-sealing-key-provider 2>&1 | tail -20
```

Look for messages indicating the enclave is ready and listening.

---

## Verification

### Check Port Binding

```bash
ss -tlnp | grep 3443
```

Expected:
```
LISTEN  0  128  127.0.0.1:3443  *  users:(("gramine-sealing",pid=12345,fd=7))
```

### Check SGX Enclave Status

The key provider should show SGX enclave initialization in its logs:

```bash
docker logs gramine-sealing-key-provider 2>&1 | grep -i "enclave\|sgx\|quote"
```

Look for messages like:
- `SGX enclave initialized`
- `Quote provider ready`
- `Listening on 0.0.0.0:3443`

### Test Key Provider Endpoint

The key provider uses HTTPS with a self-signed certificate. Test connectivity:

```bash
curl -sk https://127.0.0.1:3443/ 2>&1 | head -5
```

A response (even an error response) indicates the service is running.

---

## How CVMs Use the Key Provider

When deploying a CVM with `--local-key-provider` flag, the VMM:

1. CVM boots and needs sealing key
2. CVM generates TDX attestation quote
3. Quote is sent to Gramine Key Provider (127.0.0.1:3443)
4. Key Provider verifies quote authenticity
5. Key Provider returns sealing key to CVM
6. CVM uses key to decrypt/protect secrets

This happens automatically - you don't need to configure anything in the CVM.

---

## Architecture Details

### Container Configuration

```yaml
services:
  aesmd:
    # Intel SGX AESM daemon
    # Provides enclave management services
    devices:
      - /dev/sgx_enclave:/dev/sgx/enclave
      - /dev/sgx_provision:/dev/sgx/provision
    volumes:
      - /var/run/aesmd:/var/run/aesmd

  gramine-sealing-key-provider:
    # Gramine-based key provider
    # Runs inside SGX enclave
    depends_on:
      - aesmd
    ports:
      - "127.0.0.1:3443:3443"
    devices:
      - /dev/sgx_enclave:/dev/sgx/enclave
      - /dev/sgx_provision:/dev/sgx/provision
    volumes:
      - /var/run/aesmd:/var/run/aesmd
```

### Security Considerations

| Aspect | Implementation |
|--------|----------------|
| Network binding | `127.0.0.1:3443` - localhost only |
| Quote verification | Validates TDX quotes before providing keys |
| Enclave protection | Keys never leave SGX enclave in plaintext |
| PPID verification | Ensures keys only go to legitimate CVMs |

---

## Troubleshooting

### Container fails to start: SGX devices not found

**Symptom:** Container exits immediately with device error

**Solution:**
1. Verify SGX devices exist: `ls -la /dev/sgx*`
2. If missing, check BIOS SGX settings
3. Ensure SGX kernel module is loaded: `lsmod | grep sgx`

### Error: AESM service not ready

**Symptom:** Key provider fails with AESM connection error

**Solution:**
```bash
# Restart aesmd first
docker restart aesmd
sleep 5
docker restart gramine-sealing-key-provider

# Check aesmd logs
docker logs aesmd 2>&1 | tail -30
```

### Quote verification failures

**Symptom:** Logs show "quote verification failed"

**Solution:**
1. Verify PCCS is configured: Check [PCCS Configuration](/tutorial/pccs-configuration)
2. Check PCCS is running: `systemctl status pccs`
3. Verify Intel API key is set in PCCS config

### Port 3443 already in use

**Symptom:** Container fails to bind to port

**Solution:**
```bash
# Find what's using the port
ss -tlnp | grep 3443

# Kill the process or change port in docker-compose.yml
```

### SGX enclave initialization timeout

**Symptom:** Container starts but enclave never initializes

**Solution:**
1. Check SGX is enabled in BIOS
2. Verify SGX Auto MP Registration is enabled
3. Check PCCS can reach Intel: `curl -I https://api.trustedservices.intel.com`

---

## Verification Summary

Run this verification script:

```bash
#!/bin/bash
echo "=== Gramine Key Provider Verification ==="
echo

# Check containers running
echo -n "AESMD Container: "
if docker ps | grep -q aesmd; then
    echo "Running"
else
    echo "NOT RUNNING"
    exit 1
fi

echo -n "Key Provider Container: "
if docker ps | grep -q gramine-sealing-key-provider; then
    echo "Running"
else
    echo "NOT RUNNING"
    exit 1
fi

# Check port binding
echo -n "Port 3443 Bound: "
if ss -tln | grep -q "127.0.0.1:3443"; then
    echo "Yes"
else
    echo "NO"
    exit 1
fi

# Check SGX devices accessible
echo -n "SGX Devices: "
if [ -e /dev/sgx_enclave ] && [ -e /dev/sgx_provision ]; then
    echo "Present"
else
    echo "MISSING"
    exit 1
fi

echo
echo "Gramine Key Provider is ready!"
```

Save as `verify-gramine.sh`, make executable with `chmod +x verify-gramine.sh`, and run.

---

## Next Steps

With the Gramine Key Provider running, proceed to:

- [Local Docker Registry](/tutorial/local-docker-registry) - Set up registry for CVM images

## Additional Resources

- [Gramine Documentation](https://gramine.readthedocs.io/)
- [Intel SGX Developer Guide](https://download.01.org/intel-sgx/sgx-dcap/1.14/linux/docs/)
- [dstack GitHub Repository](https://github.com/Dstack-TEE/dstack)

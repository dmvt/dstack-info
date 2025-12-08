---
title: "TDX Attestation Setup"
description: "Configure Intel PCCS with API key for TDX attestation"
section: "Host Setup"
stepNumber: 5
totalSteps: 5
lastUpdated: 2025-12-08
prerequisites:
  - tdx-sgx-verification
tags:
  - tdx
  - attestation
  - pccs
  - intel
  - security
difficulty: "intermediate"
estimatedTime: "20 minutes"
---

# TDX Attestation Setup

This tutorial configures the Intel Provisioning Certificate Caching Service (PCCS) to enable TDX attestation. Attestation is required for dstack CVMs to prove they are running on genuine Intel TDX hardware.

## What You'll Configure

- **Intel API Key** - Register with Intel to access the Provisioning Certification Service
- **PCCS Configuration** - Configure local PCCS to fetch PCK certificates from Intel
- **Attestation Verification** - Confirm quotes can be generated successfully

## Why Attestation Matters

When a CVM boots, it needs to prove to the KMS that it's running on legitimate TDX hardware. This proof comes in the form of a **TDX Quote** - a cryptographically signed statement from the CPU that includes:

- Hardware identity (platform certificates)
- Software measurements (what code is running)
- Runtime data (application-specific claims)

Without proper attestation setup, CVMs cannot obtain sealing keys and will fail to start.

## Prerequisites

Before starting, ensure you have:

- Completed [TDX & SGX Verification](/tutorial/tdx-sgx-verification)
- Internet access to Intel's Provisioning Certification Service
- An email address for Intel registration

## Quick Start: Configure with Ansible

> **Using Ansible?** Playbooks are in `~/dstack-info/ansible`. If you haven't set up Ansible yet, see [TDX Software Installation: Quick Start with Ansible](/tutorial/tdx-software-installation#quick-start-install-with-ansible) for initial setup.

### Step 1: Get Your Intel API Key

You must first obtain an Intel API key (see Step 1 in manual instructions below).

### Step 2: Run the Playbook

```bash
export INTEL_API_KEY="your-api-key-here"
ansible-playbook -i inventory/hosts.yml playbooks/configure-pccs.yml
```

### Step 3: Verify

```bash
ansible-playbook -i inventory/hosts.yml playbooks/verify-pccs-config.yml
```

---

## Step 1: Obtain Intel API Key

To fetch PCK certificates from Intel, you need an API subscription key.

### Register with Intel

1. Go to [Intel Trusted Services API Portal](https://api.portal.trustedservices.intel.com/)

2. Click **Sign In** and create an account (or sign in if you have one)

3. After signing in, go to **Products** in the top menu

4. Find **Intel® SGX and Intel® TDX Provisioning Certification Service**

5. Click **Subscribe** to get access

6. Go to your **Profile** (top right menu)

7. Find your subscription and copy either the **Primary Key** or **Secondary Key**

> **Note:** The API key looks like a 32-character hexadecimal string.

### Save Your API Key

Store the API key securely. You'll need it for the next step.

```bash
# Example: save to environment variable (for this session)
export INTEL_API_KEY="your-32-character-api-key-here"
```

## Step 2: Configure PCCS

The PCCS service is already installed (from TDX Software Installation). Now configure it with your API key.

### Locate the PCCS Configuration

```bash
sudo cat /opt/intel/sgx-dcap-pccs/config/default.json | grep -A2 '"ApiKey"'
```

You should see `"ApiKey": ""` - an empty key that needs to be filled in.

### Update the Configuration

Edit the PCCS configuration file:

```bash
sudo nano /opt/intel/sgx-dcap-pccs/config/default.json
```

Find the line:
```json
"ApiKey": "",
```

Change it to:
```json
"ApiKey": "your-32-character-api-key-here",
```

Save and exit (`Ctrl+X`, then `Y`, then `Enter`).

### Restart PCCS

```bash
sudo systemctl restart pccs
sudo systemctl status pccs
```

The service should show `active (running)`.

## Step 3: Verify Platform Registration

When PCCS receives its first attestation request, it will automatically fetch PCK certificates for your platform from Intel.

### Generate Platform Info

The PCKIDRetrievalTool collects platform-specific information that Intel uses to provision certificates:

```bash
sudo PCKIDRetrievalTool
```

This creates `pckid_retrieval.csv` with your platform's identity. PCCS uses this data when fetching certificates.

### Check PCCS Logs

Watch for certificate fetching activity:

```bash
sudo journalctl -u pccs -f
```

When attestation is first requested, you should see PCCS contacting Intel and caching certificates.

## Step 4: Test Attestation

Verify that TDX quotes can be generated successfully.

### Check QGSD Service

The Quote Generation Service Daemon handles quote requests:

```bash
sudo systemctl status qgsd
```

Should show `active (running)`.

### Test PCCS Health

Verify PCCS can serve cached certificates:

```bash
curl -s http://localhost:8081/sgx/certification/v4/rootcacrl | head -c 100
```

You should see certificate data (not an error message).

### Check for Errors

Look for any attestation errors:

```bash
sudo journalctl -u qgsd -n 50 | grep -i error
sudo journalctl -u pccs -n 50 | grep -i error
```

Common errors and solutions are in the Troubleshooting section below.

## Verification Summary

Run this verification script:

```bash
#!/bin/bash
echo "=== TDX Attestation Verification ==="
echo

# Check PCCS service
echo -n "PCCS Service: "
if systemctl is-active --quiet pccs; then
    echo "Running"
else
    echo "NOT RUNNING"
    exit 1
fi

# Check API key configured
echo -n "API Key Configured: "
if sudo grep '"ApiKey"' /opt/intel/sgx-dcap-pccs/config/default.json | grep -qv '""'; then
    echo "Yes"
else
    echo "NO - API key is empty!"
    exit 1
fi

# Check QGSD service
echo -n "QGSD Service: "
if systemctl is-active --quiet qgsd; then
    echo "Running"
else
    echo "NOT RUNNING"
    exit 1
fi

# Check PCCS health endpoint
echo -n "PCCS Health: "
if curl -s http://localhost:8081/sgx/certification/v4/rootcacrl > /dev/null 2>&1; then
    echo "Responding"
else
    echo "NOT RESPONDING"
    exit 1
fi

echo
echo "TDX attestation infrastructure is configured!"
```

Save as `verify-attestation.sh`, make executable with `chmod +x verify-attestation.sh`, and run.

## Troubleshooting

### Error: 401 Unauthorized from Intel PCS

**Symptom:** PCCS logs show `Intel PCS server returns error(401)`

**Cause:** Invalid or missing API key

**Solution:**
1. Verify your API key is correct (check Intel portal)
2. Ensure the key is properly quoted in the JSON config
3. Restart PCCS after fixing: `sudo systemctl restart pccs`

### Error: No certificate data for this platform

**Symptom:** QGSD logs show `[QPL] No certificate data for this platform`

**Cause:** PCCS hasn't fetched certificates for your platform yet

**Solution:**
1. Check PCCS has a valid API key configured
2. Run `sudo PCKIDRetrievalTool` to ensure platform info is available
3. Trigger a certificate fetch by attempting attestation
4. Check PCCS logs for errors during fetch

### Error: TDX_ATTEST_ERROR_UNEXPECTED

**Symptom:** CVM fails with `Failed to get quote: TDX_ATTEST_ERROR_UNEXPECTED`

**Cause:** Quote generation failed (usually due to missing certificates)

**Solution:**
1. Verify PCCS is running and configured
2. Check QGSD logs for more specific errors
3. Ensure the platform is properly registered with Intel

### PCCS Not Starting

**Symptom:** `systemctl status pccs` shows failed

**Solution:**
```bash
# Check logs for specific error
sudo journalctl -u pccs -n 100

# Common issues:
# - Invalid JSON in config (check syntax)
# - Port 8081 already in use
# - Node.js version issues
```

### Certificate Fetch Timeout

**Symptom:** PCCS takes too long to respond

**Solution:**
1. Check internet connectivity to Intel: `curl -I https://api.trustedservices.intel.com`
2. Check if firewall is blocking outbound HTTPS
3. Verify DNS resolution is working

## Next Steps

With TDX attestation configured, you're ready to proceed with dstack deployment:

- [DNS Configuration](/tutorial/dns-configuration) - Set up domain names for services
- [Blockchain Setup](/tutorial/blockchain-setup) - Configure blockchain for KMS authorization

## Additional Resources

- [Intel DCAP Documentation](https://download.01.org/intel-sgx/latest/dcap-latest/linux/docs/)
- [Intel Trusted Services Portal](https://api.portal.trustedservices.intel.com/)
- [PCCS GitHub Repository](https://github.com/intel/SGXDataCenterAttestationPrimitives/tree/master/QuoteGeneration/pccs)

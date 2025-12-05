---
title: "Intel PCCS Configuration"
description: "Register for an Intel API key and configure PCCS for TDX attestation"
section: "Prerequisites"
stepNumber: 3
totalSteps: 3
lastUpdated: 2025-12-05
prerequisites:
  - tdx-status-verification
tags:
  - intel
  - pccs
  - attestation
  - tdx
  - api-key
  - pckcert
difficulty: "intermediate"
estimatedTime: "15 minutes"
---

# Intel PCCS Configuration

This tutorial guides you through obtaining an Intel API key and configuring the Provisioning Certificate Caching Service (PCCS) for TDX attestation. This is a required step before deploying KMS as a CVM.

## Why This Is Required

TDX attestation generates cryptographic quotes that prove your workload is running in a genuine Intel TDX environment. To generate these quotes, the system needs Platform Certification Keys (PCKs) from Intel.

The attestation flow:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  CVM requests   │────►│  QGS (Quote     │────►│  PCCS (cert     │
│  TDX quote      │     │  Generation)    │     │  caching)       │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                         │
                                                         ▼
                                                ┌─────────────────┐
                                                │  Intel API      │
                                                │  (PCK certs)    │
                                                └─────────────────┘
```

Without PCK certificates from Intel, the Quote Generation Service (QGS) cannot create valid attestation quotes, and CVM deployment fails with:

```
Error: Failed to get sealing key
Caused by:
    0: Failed to get quote
    1: TDX_ATTEST_ERROR_UNEXPECTED
```

## Prerequisites

Before starting, ensure you have:

- Completed [TDX Status Verification](/tutorial/tdx-status-verification) with attestation enabled
- Access to register at Intel's developer portal
- SSH access to your TDX server

Verify PCCS is installed:

```bash
systemctl status pccs
```

If PCCS is not installed, you may need to re-run the TDX setup with attestation enabled:

```bash
cd ~/tdx
sed -i 's/TDX_SETUP_ATTESTATION=0/TDX_SETUP_ATTESTATION=1/' setup-tdx-config
sudo ./setup-tdx-host.sh
```

## Step 1: Register for Intel API Key (FREE)

Intel provides free API keys for accessing their attestation services. This is not a paid service.

### Create an Intel Account

1. Go to [Intel Trusted Services API Portal](https://api.portal.trustedservices.intel.com/)

2. Click **Sign In**

3. On the "Sign In or Create an Account" page, enter your email address:
   - If you have an existing Intel account, you'll be prompted to sign in
   - If you're new, you'll be guided through account creation

4. Complete the sign-in or registration process and verify your email if required

### Subscribe to the Intel SGX/TDX Attestation API

1. After logging in, navigate to **Products** or **API Catalog**

2. Find **Intel SGX and TDX DCAP Attestation Service**

3. Click **Subscribe** or **Get Started**

4. Choose the **Free Tier** (sufficient for development and production use)

5. Accept the terms of service

### Get Your API Key

1. Go to **My Subscriptions** or **Profile** > **Subscriptions**

2. Find your attestation service subscription

3. Copy your **Primary Key** or **API Key**

The key looks like: `a1b2c3d4e5f6789...` (32+ character hex string)

**Important:** Save this key securely. You'll need it for PCCS configuration.

---

## Quick Start: Configure with Ansible

For most users, the recommended approach is to use the Ansible playbook after obtaining your Intel API key.

### Run the PCCS Configuration Playbook

```bash
cd ~/dstack-info/ansible
ansible-playbook -i inventory/hosts.yml playbooks/setup-pccs-apikey.yml \
  -e "intel_api_key=YOUR_API_KEY_HERE"
```

Replace `YOUR_API_KEY_HERE` with the API key you obtained in Step 1.

The playbook will:
1. **Update PCCS configuration** with your Intel API key
2. **Configure QCNL** to use local PCCS
3. **Restart services** (PCCS and QGS)
4. **Verify services** are running correctly
5. **Test certificate retrieval** via PCKIDRetrievalTool

### Verify Configuration

```bash
ansible-playbook -i inventory/hosts.yml playbooks/verify-pccs.yml
```

If the playbook completes successfully, skip to [Next Steps](#next-steps).

---

## Manual Configuration

If you prefer to configure manually, follow these steps.

### Step 2: Configure PCCS with API Key

Edit the PCCS configuration file:

```bash
sudo nano /opt/intel/sgx-dcap-pccs/config/default.json
```

Find the `ApiKey` field and add your key:

```json
{
    "ApiKey": "YOUR_INTEL_API_KEY_HERE",
    "hosts": "0.0.0.0",
    "port": "8081",
    "uri": "https://api.trustedservices.intel.com/sgx/certification/v4/",
    "collateralUri": "https://api.trustedservices.intel.com/sgx/certification/v4/",
    "CachingFillMode": "LAZY",
    "AdminToken": "",
    "UserToken": "",
    ...
}
```

Replace `YOUR_INTEL_API_KEY_HERE` with the API key you obtained in Step 1.

#### Optional: Configure Admin Token

For additional security, set an admin token for PCCS management:

```bash
# Generate a secure token
ADMIN_TOKEN=$(openssl rand -hex 32)
echo "Admin Token: $ADMIN_TOKEN"
```

Update the configuration:

```json
{
    "AdminToken": "YOUR_ADMIN_TOKEN_HERE",
    ...
}
```

Save the file (Ctrl+O, Enter, Ctrl+X in nano).

### Step 3: Restart Attestation Services

Restart PCCS and QGS to apply the configuration:

```bash
# Restart PCCS
sudo systemctl restart pccs

# Restart QGS (Quote Generation Service)
sudo systemctl restart qgsd

# Check status
sudo systemctl status pccs
sudo systemctl status qgsd
```

Both services should show `active (running)`.

### Step 4: Verify PCCS Configuration

Test that PCCS can communicate with Intel's API.

#### Check PCCS Logs

```bash
sudo journalctl -u pccs -n 50 --no-pager
```

Look for successful startup messages. If you see authentication errors, verify your API key is correct.

#### Test PCK Certificate Retrieval

The first time a TDX quote is requested, PCCS will fetch PCK certificates from Intel. You can trigger this by running:

```bash
# Get platform info
sudo PCKIDRetrievalTool
```

This generates platform information and triggers PCCS to fetch certificates.

#### Check PCCS Health

```bash
curl -s http://localhost:8081/sgx/certification/v4/rootcacrl | head -c 100
```

If PCCS is working, this returns certificate data. If it fails, check the logs for errors.

### Step 5: Verify QGS Can Generate Quotes

Test that the Quote Generation Service can now create TDX quotes:

```bash
# Check QGS logs
sudo journalctl -u qgsd -n 20 --no-pager
```

Look for messages like:
```
[QPL] Loaded QCNL library successfully.
[QPL] Successfully fetched quote.
```

If you see `No certificate data for this platform` errors, wait a few minutes for PCCS to cache the certificates, then restart QGS.

---

## Troubleshooting

### Error: Access denied due to invalid subscription key

Your API key is invalid or not activated:

1. Verify the key is copied correctly (no extra spaces)
2. Check your Intel portal subscription is active
3. Try regenerating the API key

### Error: Connection refused to Intel API

Network connectivity issue:

```bash
# Test connectivity
curl -v https://api.trustedservices.intel.com/sgx/certification/v4/
```

Ensure your server can reach Intel's API (port 443 outbound).

### PCCS shows "No certificate data for this platform" (404 Error)

This error means Intel's Provisioning Certification Service doesn't have PCK certificates for your specific platform in their database. Check PCCS logs:

```bash
sudo journalctl -u pccs -n 50 --no-pager
```

If you see:
```
Intel PCS server returns error(404).
Error: No cache data for this platform.
```

**This is a platform registration issue**, not an API key problem. Your API key is working, but Intel's database doesn't contain certificates for your specific CPU/platform combination.

#### Possible Causes

1. **Cloud provider hasn't registered hardware**: Many cloud providers haven't registered their platforms with Intel's provisioning service
2. **New platform not in database**: Newer CPUs may not yet be in Intel's production database
3. **Platform-specific issue**: Some hardware configurations may not support DCAP attestation

#### Solutions

1. **Contact your cloud provider**: Ask them to register their TDX-capable platforms with Intel's Provisioning Certification Service

2. **Run PCK ID retrieval**: Generate platform information for registration:
   ```bash
   sudo PCKIDRetrievalTool
   cat pckid_retrieval.csv
   ```
   The CSV file contains platform identification data that can be submitted to Intel for registration.

3. **Check Intel sandbox endpoint** (for testing only): Some platforms may work with Intel's pre-production endpoint. Edit PCCS config:
   ```bash
   sudo nano /opt/intel/sgx-dcap-pccs/config/default.json
   # Change "uri" to: "https://sbx.api.trustedservices.intel.com/sgx/certification/v4/"
   # Note: Requires a sandbox API key from Intel
   ```

4. **Contact Intel support**: For production deployments, work with Intel to register your platform.

#### Verify API Key Works

Test that your API key is valid (this endpoint doesn't require platform registration):

```bash
curl -H "Ocp-Apim-Subscription-Key: YOUR_API_KEY" \
  "https://api.trustedservices.intel.com/sgx/certification/v4/qe/identity"
```

If this returns JSON data with `enclaveIdentity`, your API key is working correctly.

#### Impact on dstack

Without valid PCK certificates, TDX attestation will fail and CVMs cannot boot. The error manifests as:

```
Error: Failed to get sealing key
    0: Failed to get quote
    1: TDX_ATTEST_ERROR_UNEXPECTED
```

Until the platform is registered with Intel, you cannot deploy CVMs that require TDX attestation.

For more information, see [Intel DCAP GitHub Issue #365](https://github.com/intel/SGXDataCenterAttestationPrimitives/issues/365).

### QGS returns TDX_ATTEST_ERROR_UNEXPECTED

Check QCNL configuration:

```bash
cat /etc/sgx_default_qcnl.conf
```

Ensure it points to local PCCS:

```json
{
  "pccs_url": "https://localhost:8081/sgx/certification/v4/",
  "use_secure_cert": false,
  "retry_times": 6,
  "retry_delay": 10
}
```

If using a custom PCCS setup, update the URL accordingly.

---

## Configuration Reference

### PCCS Configuration File

Location: `/opt/intel/sgx-dcap-pccs/config/default.json`

| Field | Description | Default |
|-------|-------------|---------|
| `ApiKey` | Your Intel API key | "" (required) |
| `hosts` | Listen address | "0.0.0.0" |
| `port` | Listen port | "8081" |
| `uri` | Intel API URL | Intel v4 API |
| `CachingFillMode` | When to fetch certs | "LAZY" |
| `AdminToken` | Admin API token | "" |
| `UserToken` | User API token | "" |

### QCNL Configuration File

Location: `/etc/sgx_default_qcnl.conf`

| Field | Description |
|-------|-------------|
| `pccs_url` | URL to PCCS service |
| `use_secure_cert` | Verify PCCS TLS cert |
| `retry_times` | Retry attempts |
| `retry_delay` | Delay between retries (seconds) |

---

## Next Steps

With PCCS configured and working, you can now deploy KMS as a CVM:

- [KMS Build & Configuration](/tutorial/kms-build-configuration) - Build and configure KMS
- [KMS CVM Deployment](/tutorial/kms-cvm-deployment) - Deploy KMS with TDX attestation

## Additional Resources

- [Intel DCAP Documentation](https://download.01.org/intel-sgx/latest/dcap-latest/linux/docs/)
- [Intel Trusted Services Portal](https://api.portal.trustedservices.intel.com/)
- [Intel TDX Overview](https://www.intel.com/content/www/us/en/developer/tools/trust-domain-extensions/overview.html)

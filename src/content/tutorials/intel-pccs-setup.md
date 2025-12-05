---
title: "Intel PCCS Configuration"
description: "Register for an Intel API key and configure PCCS for TDX attestation"
section: "KMS Deployment"
stepNumber: 3
totalSteps: 7
lastUpdated: 2025-12-05
prerequisites:
  - contract-deployment
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

2. Click **Sign Up** or **Sign In** with your Intel account

3. If creating a new account:
   - Use a valid email address
   - Complete the registration form
   - Verify your email

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

## Step 2: Configure PCCS with API Key

Now configure PCCS to use your Intel API key.

### Edit PCCS Configuration

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

### Optional: Configure Admin Token

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

### Save and Exit

Save the file (Ctrl+O, Enter, Ctrl+X in nano).

## Step 3: Restart Attestation Services

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

## Step 4: Verify PCCS Configuration

Test that PCCS can communicate with Intel's API.

### Check PCCS Logs

```bash
sudo journalctl -u pccs -n 50 --no-pager
```

Look for successful startup messages. If you see authentication errors, verify your API key is correct.

### Test PCK Certificate Retrieval

The first time a TDX quote is requested, PCCS will fetch PCK certificates from Intel. You can trigger this by running:

```bash
# Get platform info
sudo PCKIDRetrievalTool
```

This generates platform information and triggers PCCS to fetch certificates.

### Check PCCS Health

```bash
curl -s http://localhost:8081/sgx/certification/v4/rootcacrl | head -c 100
```

If PCCS is working, this returns certificate data. If it fails, check the logs for errors.

## Step 5: Verify QGS Can Generate Quotes

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

## Ansible Automation

For automated configuration, use the setup playbook:

```bash
cd ~/dstack-info/ansible
ansible-playbook -i inventory/hosts.yml playbooks/setup-pccs-apikey.yml \
  -e "intel_api_key=YOUR_API_KEY_HERE"
```

The playbook will:
1. Update PCCS configuration with your API key
2. Restart PCCS and QGS services
3. Verify services are running
4. Test certificate retrieval

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

### PCCS shows "No certificate data for this platform"

The platform hasn't been registered yet:

```bash
# Run PCK ID retrieval tool
sudo PCKIDRetrievalTool

# Wait for PCCS to cache certificates
sleep 30

# Restart QGS
sudo systemctl restart qgsd
```

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

## Next Steps

With PCCS configured and working, you can now deploy KMS as a CVM:

- [KMS Build & Configuration](/tutorial/kms-build-configuration) - Build and configure KMS
- [KMS CVM Deployment](/tutorial/kms-cvm-deployment) - Deploy KMS with TDX attestation

## Additional Resources

- [Intel DCAP Documentation](https://download.01.org/intel-sgx/latest/dcap-latest/linux/docs/)
- [Intel Trusted Services Portal](https://api.portal.trustedservices.intel.com/)
- [Intel TDX Overview](https://www.intel.com/content/www/us/en/developer/tools/trust-domain-extensions/overview.html)

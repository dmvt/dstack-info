---
title: "Intel Platform Registration Troubleshooting"
description: "Resolve PCCS 404 errors by registering your platform with Intel's Provisioning Certification Service"
section: "Troubleshooting"
stepNumber: 1
totalSteps: 1
lastUpdated: 2025-12-06
prerequisites:
  - intel-pccs-setup
tags:
  - intel
  - pccs
  - attestation
  - registration
  - troubleshooting
  - sgx
  - tdx
difficulty: "advanced"
estimatedTime: "30 minutes"
---

# Intel Platform Registration Troubleshooting

This guide helps you resolve the common "Intel PCS server returns error(404)" issue, which occurs when your platform isn't registered with Intel's Provisioning Certification Service (PCS).

## Understanding the Problem

### Symptoms

When deploying CVMs or running attestation, you see errors like:

```
Intel PCS server returns error(404).
Error: No cache data for this platform.
```

Or in PCCS logs (`sudo journalctl -u pccs`):

```
[error]: Intel PCS server returns error(404).
[error]: Error: No cache data for this platform.
```

### Root Cause

Intel's Provisioning Certification Service (PCS) maintains a database of registered platforms. When your PCCS requests PCK certificates, Intel looks up your platform by its unique identifiers:

- **QE ID**: Quote Enclave ID
- **Encrypted PPID**: Encrypted Platform Provisioning ID
- **CPU SVN**: CPU Security Version Number
- **PCE SVN**: Provisioning Certification Enclave SVN

If Intel doesn't have your platform in their database, they return 404.

### Why This Happens

1. **Platform never registered**: The hardware vendor (OEM/ODM) didn't register the platform during manufacturing
2. **Registration failed**: The Multi-Package Agent (MPA) attempted registration but failed silently
3. **UEFI variables corrupted**: The registration state is inconsistent
4. **Cloud provider issue**: The cloud/bare-metal provider hasn't registered their TDX-capable hardware

---

## Diagnosis

### Step 1: Verify the Error

Check PCCS logs for 404 errors:

```bash
sudo journalctl -u pccs -n 50 --no-pager | grep -E "(404|error)"
```

Expected output if platform is unregistered:
```
Intel PCS server returns error(404).
Error: No cache data for this platform.
```

### Step 2: Check MPA Registration Status

```bash
sudo mpa_manage -get_registration_status
sudo mpa_manage -get_last_registration_error_code
```

Possible outputs:

| Status | Meaning |
|--------|---------|
| `Registration process completed successfully` | MPA thinks it's done (may be incorrect) |
| `Registration not started` | Registration never attempted |
| `Registration in progress` | Currently registering |

### Step 3: Verify SGX Status

```bash
sudo mpa_manage -get_sgx_status
```

Expected: `MP_SGX_ENABLED, which means: SGX is enabled.`

### Step 4: Check Platform Manifest Availability

```bash
sudo mpa_manage -get_platform_manifest /tmp/pm.bin
```

Possible outputs:

| Output | Meaning |
|--------|---------|
| `ERROR: getPlatformManifest: Registration completed, no pending PlatformManifest` | UEFI flag set, PM already retrieved |
| Successfully creates file | PM available, can attempt registration |

If you get "no pending PlatformManifest", you need an **SGX Factory Reset** (see below).

### Step 5: Verify API Key Works

Test that your Intel API key is valid (this endpoint doesn't require platform registration):

```bash
# Replace with your actual API key
curl -s -H "Ocp-Apim-Subscription-Key: YOUR_API_KEY" \
  "https://api.trustedservices.intel.com/sgx/certification/v4/qe/identity" | head -c 200
```

If this returns JSON with `enclaveIdentity`, your API key is working.

---

## Solution: SGX Factory Reset and Re-Registration

The most reliable fix is to reset the SGX UEFI variables and re-register with Intel.

### Prerequisites

- **BIOS/IPMI access**: You need remote console access to the server
- **Intel API key**: From [Intel Trusted Services Portal](https://api.portal.trustedservices.intel.com/)
- **Network connectivity**: Server must reach Intel's API (port 443 outbound)

### Step 1: Access Server BIOS

#### For OpenMetal Bare Metal

1. Log into [OpenMetal Central](https://central.openmetal.io/)
2. Navigate to your cloud → Hardware → Select your server
3. Click **Remote Console** (iDRAC/IPMI access)
4. Use the HTML5 console or Java viewer

#### For Other Providers

- **Dell iDRAC**: Access via `https://<idrac-ip>/`
- **HPE iLO**: Access via `https://<ilo-ip>/`
- **Supermicro IPMI**: Access via `https://<ipmi-ip>/`

### Step 2: Enable SGX Factory Reset in BIOS

1. **Reboot the server** and press the appropriate key to enter BIOS setup:
   - Dell: F2
   - HPE: F9
   - Supermicro: DEL

2. **Navigate to SGX settings** (location varies by vendor):
   - Dell: System BIOS → Processor Settings → SGX Factory Reset
   - HPE: System Configuration → BIOS/Platform Configuration → SGX Factory Reset
   - Supermicro: Advanced → CPU Configuration → SGX Factory Reset

3. **Enable SGX Factory Reset**: Set to "Enable" or "Yes"

4. **Save and Exit**: Save changes and reboot

**Note**: SGX Factory Reset only takes effect on the next boot. After reboot, the setting automatically returns to "Disabled".

### Step 3: Verify Reset Completed

After the server boots back up, SSH in and check:

```bash
# Check if platform manifest is now available
sudo mpa_manage -get_platform_manifest /tmp/pm_test.bin
```

If successful, the file will be created. If you still get "no pending PlatformManifest", the reset didn't work—try again or check BIOS settings.

### Step 4: Trigger Re-Registration

#### Option A: Automatic Registration via MPA

The Multi-Package Agent should automatically register on boot:

```bash
# Restart MPA service
sudo systemctl restart mpa_registration_tool

# Watch the logs
sudo journalctl -u mpa_registration_tool -f
```

Wait 1-2 minutes for registration to complete. Then verify:

```bash
sudo mpa_manage -get_registration_status
```

#### Option B: Manual Registration

If MPA fails, register manually:

1. Get the platform manifest:
   ```bash
   sudo mpa_manage -get_platform_manifest /tmp/platform_manifest.bin
   ls -la /tmp/platform_manifest.bin
   ```

2. Get platform identification data:
   ```bash
   sudo PCKIDRetrievalTool -f /tmp/pckid.csv
   cat /tmp/pckid.csv
   ```

3. Go to [Intel Registration Portal](https://api.portal.trustedservices.intel.com/) and submit the platform manifest.

### Step 5: Clear PCCS Cache and Restart Services

After registration, clear the cache and restart services:

```bash
# Stop services
sudo systemctl stop pccs qgsd

# Clear PCCS cache (forces re-fetch from Intel)
sudo rm -f /opt/intel/sgx-dcap-pccs/pckcache.db

# Restart services
sudo systemctl start pccs
sleep 5
sudo systemctl start qgsd

# Verify services are running
sudo systemctl status pccs qgsd
```

### Step 6: Verify Registration Worked

Test PCK certificate retrieval:

```bash
# This triggers PCCS to fetch from Intel
sudo PCKIDRetrievalTool

# Check PCCS logs for success
sudo journalctl -u pccs -n 20 --no-pager
```

**Success indicators**:
- No 404 errors in PCCS logs
- PCKIDRetrievalTool completes without errors

**Still seeing 404?** Intel's registration may take time to propagate (up to 24 hours in some cases). Wait and retry.

---

## Alternative: Contact Your Provider

If SGX Factory Reset doesn't resolve the issue, the platform may not be registered with Intel at the OEM level.

### For Cloud/Bare Metal Providers

Contact your provider and ask them to:

1. **Register their TDX-capable platforms** with Intel's Provisioning Certification Service
2. **Provide the platform manifest** so you can register it yourself
3. **Confirm TDX attestation is supported** on your specific hardware

### Information to Provide

When contacting support, include:

```bash
# Generate diagnostic info
echo "=== CPU Info ===" > /tmp/tdx_diag.txt
lscpu | grep -E "Model name|CPU family|Model:|Stepping" >> /tmp/tdx_diag.txt

echo -e "\n=== SGX Status ===" >> /tmp/tdx_diag.txt
sudo mpa_manage -get_sgx_status >> /tmp/tdx_diag.txt 2>&1

echo -e "\n=== Registration Status ===" >> /tmp/tdx_diag.txt
sudo mpa_manage -get_registration_status >> /tmp/tdx_diag.txt 2>&1

echo -e "\n=== PCCS Config ===" >> /tmp/tdx_diag.txt
cat /opt/intel/sgx-dcap-pccs/config/default.json | grep -E "uri|ApiKey" >> /tmp/tdx_diag.txt

echo -e "\n=== PCK ID Data ===" >> /tmp/tdx_diag.txt
sudo PCKIDRetrievalTool -f /tmp/pckid.csv 2>&1 >> /tmp/tdx_diag.txt
cat /tmp/pckid.csv >> /tmp/tdx_diag.txt

cat /tmp/tdx_diag.txt
```

---

## Understanding Registration Types

Intel supports two registration methods:

### Direct Registration

- Platform Manifest sent directly to Intel's Registration Service (IRS)
- PCK Certificates have `CachedKeys: true`
- More reliable, recommended approach

### Indirect Registration

- Platform Manifest sent to Intel's PCS, which forwards to IRS
- PCK Certificates have `CachedKeys: false`
- Used when direct registration isn't possible

The MPA typically uses direct registration. If that fails, you can try indirect registration via the PCCS admin API, but this requires additional configuration.

---

## Ansible Automation

After manually completing the SGX Factory Reset via BIOS, you can automate the verification and service restart:

```bash
cd ~/dstack-info/ansible
ansible-playbook -i inventory/hosts.yml playbooks/verify-pccs.yml
```

This playbook:
1. Checks PCCS and QGS service status
2. Tests PCK certificate retrieval
3. Reports registration status

---

## Troubleshooting Checklist

| Issue | Check | Solution |
|-------|-------|----------|
| 404 from Intel | `journalctl -u pccs` | SGX Factory Reset + re-register |
| MPA says "completed" but 404 | UEFI flag set incorrectly | SGX Factory Reset |
| No platform manifest | Already retrieved once | SGX Factory Reset |
| API key invalid | Test with curl | Get new key from Intel portal |
| Network blocked | `curl https://api.trustedservices.intel.com` | Check firewall/proxy |
| Services not running | `systemctl status pccs qgsd` | Restart services |

---

## Next Steps

Once platform registration is successful:

- [Intel PCCS Configuration](/tutorial/intel-pccs-setup) - Verify PCCS is fully configured
- [KMS Build & Configuration](/tutorial/kms-build-configuration) - Continue with KMS deployment

## Additional Resources

- [Intel TDX Enabling Guide - Infrastructure Setup](https://cc-enabling.trustedservices.intel.com/intel-tdx-enabling-guide/02/infrastructure_setup/)
- [Intel SGX DCAP Documentation](https://download.01.org/intel-sgx/latest/dcap-latest/linux/docs/)
- [Intel Trusted Services Portal](https://api.portal.trustedservices.intel.com/)
- [Intel Community - SGX/TDX Support](https://community.intel.com/t5/Intel-Software-Guard-Extensions/bd-p/software-guard-extensions)

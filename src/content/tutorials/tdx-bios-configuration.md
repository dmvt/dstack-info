---
title: "TDX BIOS Configuration"
description: "Configure BIOS settings to enable TDX and verify successful enablement"
section: "Host Setup"
stepNumber: 5
totalSteps: 6
prerequisites:
    - "Completed Part 4: TDX Status Verification"
    - "BIOS/IPMI access to your server"
tags:
    - "tdx"
    - "bios"
    - "configuration"
    - "tme"
    - "hardware-enablement"
difficulty: "intermediate"
estimatedTime: "20 minutes"
lastUpdated: 2025-10-31
---

# TDX BIOS Configuration

This tutorial covers configuring BIOS settings to enable TDX hardware features and verifying successful enablement.

## Step 9: Configure BIOS for TDX

At this point, you have the TDX-enabled kernel and software stack installed, but TDX hardware features are still **disabled in BIOS**. You need to configure BIOS settings to enable TDX.

### Required BIOS Settings

Access your server's BIOS/UEFI (via IPMI/iLO/iDRAC or physical access) and enable:

#### 0. Prerequisites: Disable Physical Address Limit (IMPORTANT!)

**Before enabling TME-MT, you must first disable the CPU physical address limit:**

Navigate to: **Advanced → CPU Configuration** (or **Processor Configuration**)

Find and **disable**:

-   ☐ **Limit CPU Physical Address to 46 bits**
-   May also be labeled: "Physical Address Limit", "Hyper-V Physical Address Limit", or "Address Width Limit"

**Why this matters:** The 46-bit address limit prevents TME-MT from working. Intel MKTME needs the upper address bits for encryption key IDs. If you don't disable this first, TME-MT will be greyed out and unselectable.

After disabling, save and reboot, then re-enter BIOS to continue with the following settings:

#### 1. Memory Encryption Settings

Navigate to: **Advanced → CPU Configuration → Memory Encryption**

Enable these settings:

-   ☑ **Total Memory Encryption (TME)**
-   ☑ **Total Memory Encryption Multi-Tenant (TME-MT)**
-   ☐ **TME-MT Memory Integrity** (Disable this)
-   **TME/TME-MT Key Split** → Set to non-zero value (e.g., 50/50 or as recommended by your server vendor)

#### 2. Intel TDX Settings

Navigate to: **Advanced → CPU Configuration → Security**

Enable these settings:

-   ☑ **Intel Trust Domain Extensions (TDX)**
-   ☑ **TDX SEAM Loader** (Secure Arbitration Mode Loader)

#### 3. Intel SGX Settings (Optional but Recommended)

If available:

-   ☑ **Intel Software Guard Extensions (SGX)**

### BIOS Access Methods

**Option 1: IPMI/BMC (Remote Management)**

Most servers have remote management:

-   Dell: iDRAC
-   HP: iLO
-   Supermicro: IPMI
-   Lenovo: XClarity

Access the web interface or use CLI:

```bash
# Example with ipmitool (if you have IPMI credentials)
ipmitool -I lanplus -H YOUR_BMC_IP -U admin -P password sol activate
```

**Option 2: Physical Access**

1. Reboot server
2. Press appropriate key during POST:
    - Dell: F2
    - HP: F9 or F10
    - Supermicro: Delete
    - Most others: F2 or Delete

### Save and Reboot

After enabling all TDX-related BIOS settings:

1. **Save changes** (usually F10)
2. **Reboot the server**

## Step 9: Verify TDX is Enabled

After rebooting from BIOS configuration, verify TDX is now enabled:

### 1. Check TME/MKTME Status

```bash
dmesg | grep -i tme
```

**Expected output (TME and MKTME enabled):**

```
[    0.000000] x86/tme: enabled by BIOS
[    0.000000] x86/mktme: enabled by BIOS
[    0.000000] x86/mktme: 63 KeyIDs available
```

**What this means:**

-   ✅ TME (Total Memory Encryption) is active
-   ✅ MKTME (Multi-Key TME) is active - this is TME-MT working
-   ✅ 63 KeyIDs available means you can run up to 63 isolated Trust Domains simultaneously

### 2. Check TDX Initialization

```bash
dmesg | grep -i tdx
```

**Expected output (TDX enabled with attestation):**

```
[   58.680744] virt/tdx: BIOS enabled: private KeyID range [32, 64)
[   58.681739] virt/tdx: Disable ACPI S3. Turn off TDX in the BIOS to use ACPI S3.
[  245.715035] virt/tdx: TDX module: attributes 0x0, vendor_id 0x8086, major_version 1, minor_version 5, build_date 20240725, build_num 784
[  245.715041] virt/tdx: CMR: [0x100000, 0x77800000)
[  245.715044] virt/tdx: CMR: [0x100000000, 0x407a000000)
[  245.715046] virt/tdx: CMR: [0x4080000000, 0x807c000000)
[  245.715048] virt/tdx: CMR: [0x8080000000, 0xc07c000000)
[  245.715049] virt/tdx: CMR: [0xc080000000, 0x1007c000000)
[  249.751098] virt/tdx: 4202516 KB allocated for PAMT
[  249.751110] virt/tdx: module initialized
```

**What this means:**

-   ✅ TDX module version 1.5 loaded successfully
-   ✅ Private KeyIDs allocated for TDX guests (32-64)
-   ✅ CMR (Convertible Memory Regions) configured - these are memory ranges available for TDX
-   ✅ PAMT (Physical Address Metadata Table) allocated (~4.2 GB for tracking TD memory)
-   ✅ **Module initialized** - TDX is fully operational

**Note:** ACPI S3 (suspend-to-RAM) is disabled when TDX is enabled. This is expected behavior.

### 3. Check TDX Parameter

```bash
cat /sys/module/kvm_intel/parameters/tdx
```

**Expected output:**

```
Y
```

✅ This confirms KVM has TDX support enabled.

### 4. Check TDX Host CPU Flags

```bash
grep -o 'tdx[^ ]*' /proc/cpuinfo | sort -u
```

**Expected output (TDX host):**

```
tdx_host_platform
tdx_pw_mce
```

**What this means:**

-   ✅ `tdx_host_platform` - Your CPU is running as a TDX host (correct!)
-   ✅ `tdx_pw_mce` - TDX Power Management and Machine Check Exception support

**Note:** The `tdx_guest` flag appears inside TDX guest VMs, not on the host. If you see `tdx_host_platform`, your host is configured correctly.

## Next Steps

Continue to **Part 6: TDX Troubleshooting & Next Steps** for:

-   Troubleshooting common TDX issues
-   What to do after TDX is enabled
-   Testing TDX functionality
-   Deploying dstack
-   Additional resources and documentation

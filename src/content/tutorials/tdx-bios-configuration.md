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

## Step 8: Configure BIOS for TDX

At this point, you have the TDX-enabled kernel and software stack installed, but TDX hardware features are still **disabled in BIOS**. You need to configure BIOS settings to enable TDX.

### Required BIOS Settings

Access your server's BIOS/UEFI (via IPMI/iLO/iDRAC or physical access) and enable:

#### 0. Prerequisites: Disable Physical Address Limit (IMPORTANT!)

**Before enabling TME-MT, you must first disable the CPU physical address limit:**

Navigate to: **Advanced → CPU Configuration** (or **Processor Configuration**)

Find and **disable**:
- ☐ **Limit CPU Physical Address to 46 bits**
- May also be labeled: "Physical Address Limit", "Hyper-V Physical Address Limit", or "Address Width Limit"

**Why this matters:** The 46-bit address limit prevents TME-MT from working. Intel MKTME needs the upper address bits for encryption key IDs. If you don't disable this first, TME-MT will be greyed out and unselectable.

After disabling, save and reboot, then re-enter BIOS to continue with the following settings:

#### 1. Memory Encryption Settings

Navigate to: **Advanced → CPU Configuration → Memory Encryption**

Enable these settings:
- ☑ **Total Memory Encryption (TME)**
- ☑ **Total Memory Encryption Multi-Tenant (TME-MT)**
- ☐ **TME-MT Memory Integrity** (Disable this)
- **TME/TME-MT Key Split** → Set to non-zero value (e.g., 50/50 or as recommended by your server vendor)

#### 2. Intel TDX Settings

Navigate to: **Advanced → CPU Configuration → Security**

Enable these settings:
- ☑ **Intel Trust Domain Extensions (TDX)**
- ☑ **TDX SEAM Loader** (Secure Arbitration Mode Loader)

#### 3. Intel SGX Settings (Optional but Recommended)

If available:
- ☑ **Intel Software Guard Extensions (SGX)**

### BIOS Access Methods

**Option 1: IPMI/BMC (Remote Management)**

Most servers have remote management:
- Dell: iDRAC
- HP: iLO
- Supermicro: IPMI
- Lenovo: XClarity

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

### 1. Check TME Status

```bash
dmesg | grep -i tme
```

**Expected output (TME enabled):**
```
[    0.000000] x86/tme: enabled by BIOS
```

### 2. Check TDX Initialization

```bash
dmesg | grep -i tdx
```

**Expected output (TDX enabled):**
```
[    X.XXXXXX] virt/tdx: module initialized
[    X.XXXXXX] tdx: TDX module: version 1.5
```

### 3. Check TDX Parameter

```bash
cat /sys/module/kvm_intel/parameters/tdx
```

**Expected output:**
```
Y
```

### 4. Check SEAM Firmware

```bash
ls -la /sys/firmware/tdx_seam/
```

**Expected output:**
```
drwxr-xr-x  2 root root    0 Oct 31 19:30 .
dr-xr-xr-x 10 root root    0 Oct 31 19:30 ..
-r--r--r--  1 root root 4096 Oct 31 19:30 seaminfo
```

Check SEAM module info:

```bash
cat /sys/firmware/tdx_seam/seaminfo
```

This will show TDX module version and capabilities.

### 5. Check TDX CPU Flags

```bash
grep -o 'tdx[^ ]*' /proc/cpuinfo | sort -u
```

**Expected output (if TDX guest support is enabled):**
```
tdx_guest
```

## Next Steps

Continue to **Part 6: TDX Troubleshooting & Next Steps** for:
- Troubleshooting common TDX issues
- What to do after TDX is enabled
- Testing TDX functionality
- Deploying dstack
- Additional resources and documentation

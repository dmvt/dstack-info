---
title: "TDX BIOS Configuration"
description: "Configure BIOS settings to enable TDX and verify successful enablement"
section: "Host Setup"
stepNumber: 5
totalSteps: 5
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

## Step 10: Verify TDX is Enabled

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

## Troubleshooting

### Issue: TDX Still Shows "N" After BIOS Config

**Possible causes:**
1. BIOS settings not saved properly
2. TME not enabled
3. Secure Boot interfering (try disabling)
4. SEAM loader not enabled

**Solution:**
- Re-enter BIOS and verify all settings
- Ensure TME and TME-MT are both enabled
- Check that SEAM Loader is enabled
- Try disabling Secure Boot temporarily

### Issue: "x86/tme: not enabled by BIOS"

**Cause:** TME not enabled in BIOS

**Solution:**
- Enter BIOS
- Navigate to CPU Configuration → Memory Encryption
- Enable TME and TME-MT
- Save and reboot

### Issue: No SEAM Firmware After Enabling TDX

**Possible causes:**
1. Server firmware/BIOS needs update
2. Intel TDX SEAM module not installed in firmware

**Solution:**
- Update server BIOS/firmware to latest version
- Check with server vendor for TDX support
- Some early TDX-capable CPUs may need firmware updates

### Issue: Kernel Panic After Enabling TDX

**Cause:** Incompatible BIOS settings or outdated firmware

**Solution:**
- Boot into previous kernel from GRUB menu
- Update server BIOS/firmware
- Check Intel and server vendor documentation for specific TDX requirements

## What's Next?

Now that TDX is enabled on your host, you can:

1. **Create TDX Guest VMs**
   - Use QEMU/libvirt to launch Trust Domains
   - Configure TD guest images with TDX support

2. **Test TDX Functionality**
   - Run Canonical's test suite: `cd tests && ./test-tdx.sh`
   - Verify TD attestation

3. **Enable TD Attestation** (Optional)
   - Configure DCAP (Data Center Attestation Primitives)
   - Set up attestation services

4. **Deploy dstack**
   - Install dstack SDK
   - Deploy confidential applications to TDX VMs

## Summary

You have successfully:

✓ Installed TDX-enabled kernel (6.8.0-1028-intel)
✓ Installed TDX-enabled QEMU, libvirt, and OVMF
✓ Configured GRUB for TDX kernel boot
✓ Enabled TDX hardware features in BIOS
✓ Verified TDX initialization

Your server is now ready to run Intel TDX Trust Domains!

## Additional Resources

- **Intel ARK (Processor Verification):** https://ark.intel.com
- **Intel TDX Enabling Guide:** https://cc-enabling.trustedservices.intel.com/intel-tdx-enabling-guide/
- **Canonical TDX Documentation:** https://github.com/canonical/tdx
- **Intel TDX Overview:** https://www.intel.com/content/www/us/en/developer/tools/trust-domain-extensions/overview.html
- **Ubuntu TDX Wiki:** https://discourse.ubuntu.com/t/intel-tdx-trust-domain-extensions/
- **dstack Documentation:** https://docs.phala.com/dstack/overview

## System Requirements Summary

**Hardware:**
- Intel Xeon Scalable (5th Gen Emerald Rapids or 4th Gen Sapphire Rapids with TDX)
  - Verify TDX support at https://ark.intel.com
- Memory: At least 2 channels populated per socket (identical DIMMs recommended)
- BIOS with TDX support

**Software:**
- Ubuntu 24.04 LTS (Noble)
- linux-image-intel 6.8.0-1028 or later
- QEMU 8.2.2+tdx1.1 or later
- libvirt 10.0.0+tdx1.2 or later
- OVMF 2024.02+tdx1.0 or later

**BIOS Settings:**
- TME enabled
- TME-MT enabled
- TDX enabled
- SEAM Loader enabled
- SGX enabled (optional)

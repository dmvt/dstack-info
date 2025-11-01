---
title: "TDX Status Verification"
description: "Check TDX status and understand what BIOS configuration is needed"
section: "Host Setup"
stepNumber: 4
totalSteps: 5
prerequisites:
    - "Completed Part 3: TDX Kernel Installation"
    - "Server rebooted successfully"
tags:
    - "tdx"
    - "verification"
    - "status"
    - "troubleshooting"
difficulty: "intermediate"
estimatedTime: "10 minutes"
lastUpdated: 2025-10-31
---

# TDX Status Verification

This tutorial covers verifying that the TDX kernel loaded successfully and checking the TDX status to determine what BIOS configuration is needed.

## Verify TDX Kernel Loaded

After reboot, SSH back into the server and verify the TDX kernel is running:

```bash
uname -r
```

**Expected output:**

```
6.8.0-1028-intel
```

✓ Success! You're now running the TDX-enabled Intel kernel.

## Check TDX Status

Now let's check if TDX is enabled in the system.

### Check dmesg for TDX Messages

```bash
dmesg | grep -i tdx
```

**If the TDX Module (SEAM) is enabled (after BIOS config), you should see:**

```
[  XXX.XXXXXX] virt/tdx: TDX module: attributes 0x0, vendor_id 0x8086, major_version 1, minor_version 5, build_date 20240725, build_num 784
[  XXX.XXXXXX] virt/tdx: module initialized
```

**If TDX is NOT enabled (before BIOS config), output will be empty.**

### Check TDX Kernel Module

```bash
ls -la /sys/module/kvm_intel/parameters/ | grep tdx
```

**Expected output:**

```
-r--r--r-- 1 root root 4096 Oct 31 19:04 tdx
```

Check the TDX parameter value:

```bash
cat /sys/module/kvm_intel/parameters/tdx
```

**Output:**

-   `N` = TDX is NOT enabled (BIOS configuration needed)
-   `Y` = TDX is enabled and ready to use

### Check TME (Total Memory Encryption)

TDX requires TME (Total Memory Encryption) to be enabled in BIOS:

```bash
dmesg | grep -i tme
```

**If TME is NOT enabled:**

```
[    0.000000] x86/tme: not enabled by BIOS
```

**If TME is enabled:**

```
[    0.000000] x86/tme: enabled by BIOS
```

## Next Steps

Continue to **Part 5: TDX BIOS Configuration** to enable TDX hardware features in BIOS and complete the setup.

## Optional: Automated Verification

After completing the full TDX setup (including BIOS configuration), you can optionally set up Ansible automation for TDX verification. See **Part 7: Ansible Automation Setup** for complete instructions on automating TDX verification across multiple servers.

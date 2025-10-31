---
title: "TDX Kernel Installation"
description: "Verify TDX kernel installation and boot into the TDX-enabled kernel"
section: "Host Setup"
stepNumber: 3
totalSteps: 5
prerequisites:
  - "Completed Part 2: TDX Software Setup"
tags:
  - "tdx"
  - "kernel"
  - "installation"
  - "reboot"
difficulty: "intermediate"
estimatedTime: "10 minutes"
lastUpdated: 2025-10-31
---

# TDX Kernel Installation

This tutorial covers verifying the TDX kernel installation and rebooting your system to load the TDX-enabled kernel.

## Step 5: Verify Kernel Installation

Before rebooting, verify the TDX kernel was installed:

```bash
ls -la /boot/vmlinuz* | grep intel
```

**Expected output:**

```
lrwxrwxrwx 1 root root       24 Oct 31 18:38 /boot/vmlinuz -> vmlinuz-6.8.0-1028-intel
-rw------- 1 root root 15006088 May 23 15:48 /boot/vmlinuz-6.8.0-1028-intel
```

Check current kernel version:

```bash
uname -r
```

**Example output:**
```
6.8.0-57-generic
```

This shows you're still running the generic kernel. After reboot, you'll be running `6.8.0-1028-intel`.

## Step 6: Reboot to TDX Kernel

Reboot the server to load the TDX-enabled kernel:

```bash
reboot
```

**Note:** The server may take 2-3 minutes to reboot depending on hardware.

## Next Steps

Continue to **Part 4: TDX Status Verification** to verify the TDX kernel loaded successfully and check TDX status.

---
title: "Enable Intel TDX on Ubuntu 24.04"
description: "Complete guide to enabling Intel Trust Domain Extensions (TDX) on Ubuntu 24.04 LTS using Canonical's official TDX stack"
section: "Host Setup"
stepNumber: 1
totalSteps: 10
lastUpdated: 2025-10-31
prerequisites:
  - "Ubuntu 24.04 LTS (Noble) server installation"
  - "Intel Xeon Scalable (5th Gen or later) processor with TDX support"
  - "Root/sudo access to the server"
  - "BIOS/IPMI access for hardware configuration"
tags:
  - "tdx"
  - "setup"
  - "ubuntu"
  - "confidential-computing"
difficulty: "intermediate"
estimatedTime: "45 minutes"
---

# Enable Intel TDX on Ubuntu 24.04

This tutorial walks you through enabling Intel Trust Domain Extensions (TDX) on Ubuntu 24.04 LTS using Canonical's official TDX stack. TDX is Intel's hardware-based confidential computing technology that allows you to run trusted execution environments (TEEs) for secure, isolated workloads.

## What is Intel TDX?

Intel TDX (Trust Domain Extensions) is a hardware-based technology that creates isolated virtual machine environments called Trust Domains (TDs). These TDs provide:

- **Hardware-level isolation** - VMs are isolated from the hypervisor and other VMs
- **Memory encryption** - All TD memory is encrypted with per-TD keys
- **Remote attestation** - Cryptographic proof of TD integrity
- **Minimal TCB** - Reduced trusted computing base for better security

## Prerequisites Check

Before beginning, verify your hardware supports TDX:

### Supported Processors

Intel TDX is available on:
- **Intel Xeon Scalable (5th Gen)** - Emerald Rapids (2024+)
- **Intel Xeon Scalable (4th Gen)** - Sapphire Rapids (some SKUs)

#### Verify TDX Support on Intel ARK

Before beginning, **verify your specific processor model supports TDX** using Intel ARK:

1. Visit **https://ark.intel.com**
2. Search for your processor model (e.g., "Xeon Gold 6530")
3. Scroll down to **Security & Reliability** section
4. Look for: **Intel® Trust Domain Extensions (Intel® TDX)** → **Yes**

**Example for Intel Xeon Gold 6530:**
- TDX Support: **Yes** ✓
- Generation: 5th Gen (Emerald Rapids)
- Release Date: Q1 2024

#### Check Your Current Processor

Check your CPU model:

```bash
grep "model name" /proc/cpuinfo | head -1
```

**Example output:**
```
model name	: INTEL(R) XEON(R) GOLD 6530
```

The Intel Xeon Gold 6530 is a 5th generation processor (Emerald Rapids), which **does support TDX**.

**Note:** Not all Xeon processors support TDX. Always verify on Intel ARK before proceeding.

### Supported Operating Systems

This tutorial covers:
- **Ubuntu 24.04 LTS (Noble)** - Recommended
- Ubuntu 25.04 (Plucky) - Also supported

**Note:** Ubuntu 24.10 (Oracular) and 23.10 (Mantic) are no longer supported by Canonical's TDX PPA.

### Memory Configuration Requirements

**CRITICAL:** Intel TDX has specific memory configuration requirements that must be met:

#### Memory Channel Requirements

According to Intel's TDX Enabling Guide, your server must have:

- **Minimum:** Memory populated in at least **2 channels per socket**
- **Recommended:** Memory populated in **all available channels** for best performance
- **Configuration:** DIMMs should be identical (same capacity, speed, manufacturer)

**Example valid configurations:**
- ✓ 2 DIMMs per socket (minimum)
- ✓ 4 DIMMs per socket (better)
- ✓ 8 DIMMs per socket (optimal for most systems)

**Invalid configurations:**
- ✗ Single DIMM per socket
- ✗ Mixed DIMM capacities or speeds
- ✗ Asymmetric channel population

#### Verify Your Memory Configuration

Check your current memory configuration:

```bash
sudo dmidecode -t memory | grep -E "Size:|Locator:|Speed:|Type:"
```

**For detailed memory requirements, refer to:**
https://cc-enabling.trustedservices.intel.com/intel-tdx-enabling-guide/03/hardware_selection/

**Important:** If your memory configuration doesn't meet these requirements, TDX may fail to initialize even after proper BIOS configuration. Consult with your server vendor if you need to adjust memory configuration.

## Step 1: Enable Root SSH Access

For this setup, you'll need root access. If you're using a non-root user with sudo privileges, you can enable root SSH access:

```bash
# As your regular user with sudo
sudo sed -i 's/^#*PermitRootLogin.*/PermitRootLogin prohibit-password/' /etc/ssh/sshd_config
```

Restart SSH service:

```bash
sudo systemctl restart ssh
```

Copy your SSH keys to root:

```bash
sudo mkdir -p /root/.ssh
sudo cp ~/.ssh/authorized_keys /root/.ssh/authorized_keys
sudo chmod 600 /root/.ssh/authorized_keys
sudo chmod 700 /root/.ssh
```

Test root SSH access:

```bash
ssh root@YOUR_SERVER_IP 'echo "Root access working"'
```

## Step 2: Clone Canonical TDX Repository

Canonical provides official scripts and tools for TDX setup in their GitHub repository.

```bash
cd /root
git clone -b main https://github.com/canonical/tdx.git
cd tdx
```

Verify the repository contents:

```bash
ls -la
```

You should see:
- `setup-tdx-host.sh` - Main setup script for TDX host
- `setup-tdx-guest.sh` - Script for TDX guest VMs
- `setup-tdx-config` - Configuration file
- `setup-tdx-common` - Common functions
- `attestation/` - Attestation components (optional)
- `guest-tools/` - Tools for guest VMs
- `tests/` - Test scripts

## Step 3: Review TDX Configuration

Before running the setup, review the configuration file:

```bash
cat setup-tdx-config
```

**Important configuration options:**

```bash
# TDX PPA to use (default: tdx-release)
TDX_PPA="tdx-release"

# Attestation components (0 = disabled, 1 = enabled)
# Set to 0 for basic TDX setup without attestation
TDX_SETUP_ATTESTATION=0

# NVIDIA H100 GPU support (0 = disabled, 1 = enabled)
TDX_SETUP_NVIDIA_H100=0

# Intel-optimized kernel for guest VMs (0 = generic kernel, 1 = intel kernel)
TDX_SETUP_INTEL_KERNEL=0
```

**For a basic TDX host setup, the defaults are fine.** You can enable attestation later if needed.

## Step 4: Run TDX Host Setup Script

The setup script will:
1. Add Canonical's TDX PPA
2. Install TDX-enabled kernel (linux-image-intel)
3. Install TDX-enabled QEMU, libvirt, and OVMF
4. Configure GRUB to boot the TDX kernel
5. Add your user to the `kvm` group

Run the setup script:

```bash
./setup-tdx-host.sh
```

**Expected output:**

```
Hit:1 http://archive.ubuntu.com/ubuntu noble InRelease
...
Adding repository.
...
Reading package lists... Done
Building dependency tree... Done
Reading state information... Done
The following NEW packages will be installed:
  linux-image-6.8.0-1028-intel linux-image-intel
  qemu-system-x86 libvirt-daemon-system libvirt-clients
  ovmf
  ...
Need to get 304 MB of archives.
After this operation, 746 MB of additional disk space will be used.
...
```

The script will install:
- **linux-image-6.8.0-1028-intel** - TDX-enabled kernel
- **qemu-system-x86 2:8.2.2+ds-0ubuntu1.4+tdx1.1** - TDX-enabled QEMU
- **libvirt0 10.0.0-2ubuntu8.3+tdx1.2** - TDX-enabled libvirt
- **ovmf 2024.02-3+tdx1.0** - TDX-enabled UEFI firmware

**Installation time:** ~5 minutes (depending on network speed)

### What the Script Does

1. **Adds Canonical TDX PPA:**
   ```
   ppa:kobuk-team/tdx-release
   ```

2. **Installs TDX packages:**
   - Intel kernel with `CONFIG_INTEL_TDX_HOST=y`
   - QEMU with TDX support
   - libvirt with TDX VM management
   - OVMF firmware for TDX VMs

3. **Configures GRUB:**
   - Sets intel kernel as default boot option
   - Adds `nohibernate` parameter (TDX doesn't survive S3/S4 sleep states)
   - Creates `/etc/default/grub.d/99-tdx-kernel.cfg`

4. **Updates initramfs and GRUB:**
   ```
   update-initramfs -u
   update-grub
   ```

### Final Setup Message

The script will complete with:

```
========================================================================
The host OS setup has been done successfully. Now, please enable Intel TDX in the BIOS.
========================================================================
```

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

## Step 7: Verify TDX Kernel Loaded

After reboot, SSH back into the server and verify the TDX kernel is running:

```bash
uname -r
```

**Expected output:**
```
6.8.0-1028-intel
```

✓ Success! You're now running the TDX-enabled Intel kernel.

## Step 8: Check TDX Status

Now let's check if TDX is enabled in the system.

### Check dmesg for TDX Messages

```bash
dmesg | grep -i tdx
```

**If TDX is enabled (after BIOS config), you should see:**
```
[    X.XXXXXX] virt/tdx: module initialized
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
- `N` = TDX is NOT enabled (BIOS configuration needed)
- `Y` = TDX is enabled and ready to use

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

### Check for SEAM Firmware

```bash
ls -la /sys/firmware/tdx* 2>/dev/null || echo "No TDX firmware found"
```

**If TDX is NOT enabled:**
```
No TDX firmware found
```

**If TDX is enabled, you'll see:**
```
/sys/firmware/tdx_seam/
```

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

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

## Run TDX Host Setup Script

The setup script will:

1. Add Canonical's TDX PPA
2. Install TDX-enabled kernel (linux-image-intel)
3. Install TDX-enabled QEMU, libvirt, and OVMF
4. Configure GRUB to boot the TDX kernel
5. Add your user to the `kvm` group

Run the setup script:

```bash
sudo ./setup-tdx-host.sh
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

-   **linux-image-6.8.0-1028-intel** - TDX-enabled kernel
-   **qemu-system-x86 2:8.2.2+ds-0ubuntu1.4+tdx1.1** - TDX-enabled QEMU
-   **libvirt0 10.0.0-2ubuntu8.3+tdx1.2** - TDX-enabled libvirt
-   **ovmf 2024.02-3+tdx1.0** - TDX-enabled UEFI firmware

**If attestation is enabled (`TDX_SETUP_ATTESTATION=1`), additional packages:**

-   **tdx-qgs** (1.21) - TDX Quote Generation Service
-   **sgx-dcap-pccs** (1.21) - Provisioning Certificate Caching Service
-   **libsgx-dcap-default-qpl** (1.21) - Quote Provider Library
-   **sgx-ra-service** (1.21) - Remote Attestation Service
-   **libsgx-tdx-logic1** - TDX attestation logic
-   **Node.js 18+** - Required for PCCS web service

**Installation time:**

-   Without attestation: ~5 minutes
-   With attestation: ~10 minutes (30 MB additional packages)

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

5. **Starts attestation services (if enabled):**
    - `qgsd.service` - Quote Generation Service Daemon
    - `pccs.service` - Provisioning Certificate Caching Service (on port 8081)
    - `mpa_registration_tool.service` - Multi-Package Agent registration

### Final Setup Message

The script will complete with:

```
========================================================================
The host OS setup has been done successfully. Now, please enable Intel TDX in the BIOS.
========================================================================
```

## Verify Kernel Installation

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
sudo reboot
```

**Note:** The server may take 2-3 minutes to reboot depending on hardware.

## Next Steps

Continue to **Part 4: TDX Status Verification** to verify the TDX kernel loaded successfully and check TDX status.

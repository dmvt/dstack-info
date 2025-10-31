---
title: "TDX Software Setup"
description: "Install Canonical's TDX software stack including kernel, QEMU, and libvirt"
section: "Host Setup"
stepNumber: 2
totalSteps: 6
prerequisites:
  - "Completed Part 1: TDX Hardware Verification"
  - "Root/sudo access to the server"
  - "Network connectivity for package downloads"
tags:
  - "tdx"
  - "software"
  - "setup"
  - "kernel"
  - "qemu"
difficulty: "intermediate"
estimatedTime: "10 minutes"
lastUpdated: 2025-10-31
---

# TDX Software Setup

This tutorial guides you through installing Canonical's TDX software stack, including the TDX-enabled kernel, QEMU, and libvirt components necessary for running Trust Domains.

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
TDX_SETUP_ATTESTATION=0

# NVIDIA H100 GPU support (0 = disabled, 1 = enabled)
TDX_SETUP_NVIDIA_H100=0

# Intel-optimized kernel for guest VMs (0 = generic kernel, 1 = intel kernel)
TDX_SETUP_INTEL_KERNEL=0
```

### Enable TDX Attestation (Recommended)

**What is Attestation?**
Attestation provides cryptographic proof that:
- Your workload is running in a genuine Intel TDX Trust Domain
- The software stack (kernel, firmware, application) has not been tampered with
- The hardware and configuration meet security requirements

**Why Enable Attestation?**
- 🔒 **Essential for production** - Required for dstack and confidential computing deployments
- ✅ **Verifiable trust** - Cryptographically prove your workload is secure
- 🛡️ **Industry standard** - Expected for enterprise confidential computing

**Enable attestation now:**
Edit the configuration file before running the setup:
```bash
nano setup-tdx-config
# Change: TDX_SETUP_ATTESTATION=0
# To:     TDX_SETUP_ATTESTATION=1
```

Save the file (Ctrl+O, Enter, Ctrl+X).

**Note:** You can skip attestation setup if you only want to test basic TDX functionality. However, for dstack deployments, attestation is required to verify confidential computing guarantees.

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

**If attestation is enabled (`TDX_SETUP_ATTESTATION=1`), additional packages:**
- **tdx-qgs** (1.21) - TDX Quote Generation Service
- **sgx-dcap-pccs** (1.21) - Provisioning Certificate Caching Service
- **libsgx-dcap-default-qpl** (1.21) - Quote Provider Library
- **sgx-ra-service** (1.21) - Remote Attestation Service
- **libsgx-tdx-logic1** - TDX attestation logic
- **Node.js 18+** - Required for PCCS web service

**Installation time:**
- Without attestation: ~5 minutes
- With attestation: ~10 minutes (30 MB additional packages)

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

## Next Steps

Continue to **Part 3: TDX Kernel Installation** to verify the kernel installation and reboot into the TDX-enabled kernel.

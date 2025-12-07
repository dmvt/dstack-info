---
title: "TDX Software Installation"
description: "Install Canonical's TDX software stack, kernel, and attestation components"
section: "Host Setup"
stepNumber: 3
totalSteps: 4
lastUpdated: 2025-12-07
prerequisites:
  - tdx-bios-configuration
tags:
  - tdx
  - software
  - kernel
  - installation
  - attestation
difficulty: "intermediate"
estimatedTime: "20 minutes"
---

# TDX Software Installation

This tutorial guides you through installing Canonical's TDX software stack, including the TDX-enabled kernel, QEMU, libvirt, and attestation components.

## Prerequisites

Before starting, ensure you have:

- Completed [TDX & SGX BIOS Configuration](/tutorial/tdx-bios-configuration)
- Ubuntu 24.04 LTS freshly installed
- Internet connectivity for package downloads

## Set Up Ubuntu User

For this setup, you'll need an `ubuntu` user with passwordless sudo. If you're logged in as root or another user:

```bash
# Create ubuntu user (skip if already exists)
sudo adduser ubuntu

# Add to sudo group
sudo usermod -aG sudo ubuntu

# Configure passwordless sudo
echo 'ubuntu ALL=(ALL) NOPASSWD:ALL' | sudo tee /etc/sudoers.d/ubuntu
sudo chmod 0440 /etc/sudoers.d/ubuntu

# Set up SSH access (copy your authorized_keys)
sudo mkdir -p /home/ubuntu/.ssh
sudo cp ~/.ssh/authorized_keys /home/ubuntu/.ssh/authorized_keys
sudo chown -R ubuntu:ubuntu /home/ubuntu/.ssh
sudo chmod 600 /home/ubuntu/.ssh/authorized_keys
```

From now on, SSH as the ubuntu user:

```bash
ssh ubuntu@YOUR_SERVER_IP
```

## Clone Canonical TDX Repository

Canonical provides official scripts and tools for TDX setup.

```bash
cd ~
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
- `attestation/` - Attestation components
- `guest-tools/` - Tools for guest VMs

## Configure TDX Settings

Before running the setup, review and configure the settings.

### View Current Configuration

```bash
cat setup-tdx-config
```

**Key configuration options:**

| Option | Default | Description |
|--------|---------|-------------|
| `TDX_PPA` | tdx-release | Which PPA to use |
| `TDX_SETUP_ATTESTATION` | 0 | Enable attestation components |
| `TDX_SETUP_NVIDIA_H100` | 0 | NVIDIA H100 GPU support |
| `TDX_SETUP_INTEL_KERNEL` | 0 | Intel-optimized guest kernel |

### Enable Attestation (Required for dstack)

**Attestation is required for dstack deployments.** It provides cryptographic proof that your workloads run in genuine Intel TDX Trust Domains.

Enable attestation:

```bash
sed -i 's/TDX_SETUP_ATTESTATION=0/TDX_SETUP_ATTESTATION=1/' setup-tdx-config
```

Verify the change:

```bash
grep TDX_SETUP_ATTESTATION setup-tdx-config
```

Expected output: `TDX_SETUP_ATTESTATION=1`

## Run TDX Host Setup Script

The setup script will:

1. Add Canonical's TDX PPA (`ppa:kobuk-team/tdx-release`)
2. Install TDX-enabled kernel (`linux-image-intel`)
3. Install TDX-enabled QEMU, libvirt, and OVMF
4. Configure GRUB to boot the TDX kernel
5. Install attestation components (if enabled)
6. Add your user to the `kvm` group

Run the setup:

```bash
sudo ./setup-tdx-host.sh
```

**Expected output:**

```
Hit:1 http://archive.ubuntu.com/ubuntu noble InRelease
...
Adding repository.
...
The following NEW packages will be installed:
  linux-image-6.8.0-1028-intel linux-image-intel
  qemu-system-x86 libvirt-daemon-system libvirt-clients
  ovmf
  ...
Need to get 304 MB of archives.
After this operation, 746 MB of additional disk space will be used.
...
```

### Installed Packages

**Core TDX packages:**

| Package | Version | Description |
|---------|---------|-------------|
| `linux-image-intel` | 6.8.0-1028+ | TDX-enabled kernel |
| `qemu-system-x86` | 8.2.2+tdx | TDX-enabled QEMU |
| `libvirt0` | 10.0.0+tdx | TDX-enabled libvirt |
| `ovmf` | 2024.02+tdx | TDX-enabled UEFI firmware |

**Attestation packages (if enabled):**

| Package | Version | Description |
|---------|---------|-------------|
| `tdx-qgs` | 1.21 | Quote Generation Service |
| `sgx-dcap-pccs` | 1.21 | Provisioning Certificate Caching Service |
| `libsgx-dcap-default-qpl` | 1.21 | Quote Provider Library |
| `sgx-ra-service` | 1.21 | Remote Attestation Service |

**Installation time:**

- Without attestation: ~5 minutes
- With attestation: ~10 minutes

### Setup Completion Message

The script will complete with:

```
========================================================================
The host OS setup has been done successfully. Now, please enable Intel TDX in the BIOS.
========================================================================
```

> **Note:** You've already configured BIOS in the previous tutorial, so you can ignore the BIOS reminder.

## Verify Kernel Installation

Before rebooting, verify the TDX kernel was installed:

```bash
ls -la /boot/vmlinuz* | grep intel
```

**Expected output:**

```
lrwxrwxrwx 1 root root       24 Dec  7 10:30 /boot/vmlinuz -> vmlinuz-6.8.0-1028-intel
-rw------- 1 root root 15006088 May 23 15:48 /boot/vmlinuz-6.8.0-1028-intel
```

Check GRUB is configured to boot the Intel kernel:

```bash
cat /etc/default/grub.d/99-tdx-kernel.cfg
```

Check current kernel (should still be generic):

```bash
uname -r
```

**Example output:**

```
6.8.0-88-generic
```

After reboot, you'll be running the Intel TDX kernel.

## Reboot to TDX Kernel

Reboot the server to load the TDX-enabled kernel:

```bash
sudo reboot
```

**Note:** The server may take 2-3 minutes to reboot. This is normal as TDX initialization takes time during boot.

## Post-Reboot Verification

After reboot, SSH back in and verify the TDX kernel is running:

```bash
ssh ubuntu@YOUR_SERVER_IP
uname -r
```

**Expected output:**

```
6.8.0-1028-intel
```

If you see `6.8.0-1028-intel` (or similar Intel kernel version), the TDX kernel is loaded.

## Troubleshooting

### Script fails with permission denied

```bash
sudo chmod +x setup-tdx-host.sh
sudo ./setup-tdx-host.sh
```

### PPA fails to add

Check internet connectivity:

```bash
ping -c 3 ppa.launchpad.net
```

If behind a proxy, configure apt proxy settings.

### Kernel doesn't change after reboot

Verify GRUB configuration:

```bash
grep -r intel /etc/default/grub.d/
```

Manually select kernel in GRUB menu if needed (hold Shift during boot).

### Attestation services fail to start

This is normal before BIOS is configured. Services will start properly after full TDX enablement.

## Next Steps

Continue to [TDX & SGX Verification](/tutorial/tdx-sgx-verification) to verify TDX and SGX are properly enabled.

## Additional Resources

- [Canonical TDX Repository](https://github.com/canonical/tdx)
- [Ubuntu TDX Documentation](https://github.com/canonical/tdx/blob/main/README.md)
- [Intel TDX Documentation](https://www.intel.com/content/www/us/en/developer/tools/trust-domain-extensions/overview.html)

---
title: "TDX Software Setup"
description: "Install Canonical's TDX software stack including kernel, QEMU, and libvirt"
section: "Host Setup"
stepNumber: 2
totalSteps: 5
prerequisites:
    - "Completed Part 1: TDX Hardware Verification"
    - "Ubuntu user with passwordless sudo access"
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

## Set Up Ubuntu User (if not already done)

For this setup, you'll need an `ubuntu` user with passwordless sudo. If you haven't set this up yet:

```bash
# Create ubuntu user
sudo adduser ubuntu

# Add to sudo group
sudo usermod -aG sudo ubuntu

# Configure passwordless sudo
echo 'ubuntu ALL=(ALL) NOPASSWD:ALL' | sudo tee /etc/sudoers.d/ubuntu
sudo chmod 0440 /etc/sudoers.d/ubuntu

# Set up SSH access
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

Canonical provides official scripts and tools for TDX setup in their GitHub repository.

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

-   `setup-tdx-host.sh` - Main setup script for TDX host
-   `setup-tdx-guest.sh` - Script for TDX guest VMs
-   `setup-tdx-config` - Configuration file
-   `setup-tdx-common` - Common functions
-   `attestation/` - Attestation components (optional)
-   `guest-tools/` - Tools for guest VMs
-   `tests/` - Test scripts

## Review TDX Configuration

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

-   Your workload is running in a genuine Intel TDX Trust Domain
-   The software stack (kernel, firmware, application) has not been tampered with
-   The hardware and configuration meet security requirements

**Why Enable Attestation?**

-   🔒 **Essential for production** - Required for dstack and confidential computing deployments
-   ✅ **Verifiable trust** - Cryptographically prove your workload is secure
-   🛡️ **Industry standard** - Expected for enterprise confidential computing

**Enable attestation now:**
Edit the configuration file before running the setup:

```bash
nano setup-tdx-config
# Change: TDX_SETUP_ATTESTATION=0
# To:     TDX_SETUP_ATTESTATION=1
```

Save the file (Ctrl+O, Enter, Ctrl+X).

**Note:** You can skip attestation setup if you only want to test basic TDX functionality. However, for dstack deployments, attestation is required to verify confidential computing guarantees.

## Next Steps

Continue to **Part 3: TDX Kernel Installation** to install the kernel, verify, and reboot into the TDX-enabled kernel.

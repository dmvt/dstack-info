---
title: "System Baseline & Dependencies"
description: "Update the host system and install required build dependencies for dstack"
section: "dstack Installation"
stepNumber: 1
totalSteps: 5
lastUpdated: 2025-12-04
prerequisites:
  - tdx-bios-configuration
tags:
  - host-setup
  - dependencies
  - build-tools
  - system-update
difficulty: beginner
estimatedTime: 10-15 minutes
---

# System Baseline & Dependencies

Before building dstack components, you need to prepare the host system with updated packages and required build dependencies.

## Prerequisites

Before starting, ensure you have:

- Completed [TDX BIOS Configuration](/tutorial/tdx-bios-configuration)
- SSH access to your TDX-enabled server
- Root or sudo privileges

## Quick Start: Setup with Ansible

For most users, the recommended approach is to use the Ansible playbook which installs all dependencies automatically.

### Step 1: Run the Ansible Playbook

```bash
cd ~/dstack-info/ansible
ansible-playbook -i inventory/hosts.yml playbooks/setup-host-dependencies.yml
```

The playbook will:
1. **Update system packages** - Latest security patches
2. **Install build tools** - gcc, make, and compilation tools
3. **Install development libraries** - Required for building dstack
4. **Install utility tools** - git, curl, and other essentials
5. **Verify all installations**

### Step 2: Verify Installation

```bash
ansible-playbook -i inventory/hosts.yml playbooks/verify-host-dependencies.yml
```

Or run a quick check directly on the server:

```bash
ssh ubuntu@YOUR_SERVER_IP "gcc --version && make --version && git --version"
```

---

## What Gets Installed

| Package | Purpose |
|---------|---------|
| `build-essential` | GCC compiler, make, and essential build tools |
| `chrpath` | Modify rpath in ELF binaries |
| `diffstat` | Produce histogram of diff output |
| `lz4` | Fast compression algorithm |
| `wireguard-tools` | WireGuard VPN utilities for secure networking |
| `xorriso` | ISO 9660 filesystem tool for guest images |
| `git` | Version control for cloning dstack repository |
| `curl` | HTTP client for downloading files |
| `pkg-config` | Helper tool for compiling applications |
| `libssl-dev` | SSL development libraries |

---

## Manual Installation

If you prefer to install dependencies manually, follow these steps.

### Step 1: Connect to Your Server

```bash
ssh ubuntu@YOUR_SERVER_IP
```

### Step 2: Update System Packages

```bash
sudo apt update && sudo apt upgrade -y
```

This may take a few minutes. If prompted about kernel updates or service restarts, accept the defaults.

### Step 3: Install Build Dependencies

```bash
sudo apt install -y \
  build-essential \
  chrpath \
  diffstat \
  lz4 \
  wireguard-tools \
  xorriso \
  git \
  curl \
  pkg-config \
  libssl-dev
```

### Step 4: Verify Installations

```bash
# Check compiler
gcc --version

# Check make
make --version

# Check git
git --version

# Check additional tools
wg --version
xorriso --version
lz4 --version
```

---

## Troubleshooting

### Package Installation Fails

```bash
# Fix broken packages
sudo apt --fix-broken install

# Clear apt cache and retry
sudo apt clean
sudo apt update
sudo apt install -y build-essential
```

### OpenMetal Grub Error

On OpenMetal servers, you may see this error during package installation:

```
grub-install: error: diskfilter writes are not supported.
```

**This error does not affect dstack installation** - your packages are still installed correctly. To prevent this from blocking future apt operations:

```bash
sudo apt-mark hold grub-pc grub-efi-amd64-signed
```

### Kernel Upgrade Prompts

If prompted about kernel upgrades during `apt upgrade`:
1. Select "Keep the local version currently installed" if unsure
2. A reboot may be required after kernel updates

```bash
# Check if reboot is required
cat /var/run/reboot-required 2>/dev/null || echo "No reboot required"
```

---

## Next Steps

With system dependencies installed, proceed to:

- [Rust Toolchain Installation](/tutorial/rust-toolchain-installation) - Install Rust and Cargo for building dstack components

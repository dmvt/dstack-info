---
title: "System Baseline & Dependencies"
description: "Update the host system and install required build dependencies for dstack"
section: "dstack Installation"
stepNumber: 1
totalSteps: 5
lastUpdated: 2025-11-18
prerequisites:
  - "TDX-enabled host (completed TDX Enablement tutorials)"
  - "DNS configured (completed DNS Configuration tutorial)"
  - "Blockchain wallet funded (completed Blockchain Setup tutorial)"
  - "SSH access to the server as ubuntu user with passwordless sudo"
tags:
  - host-setup
  - dependencies
  - build-tools
  - system-update
difficulty: beginner
estimatedTime: 10-15 minutes
---

# System Baseline & Dependencies

Before building dstack components, we need to prepare the host system with updated packages and required build dependencies. This tutorial covers both manual installation and Ansible automation.

## What You'll Install

- **System updates** - Latest security patches and package updates
- **Build tools** - gcc, make, and related compilation tools
- **Development libraries** - Required for building dstack from source
- **Utility tools** - git, curl, and other essential utilities

---

## Manual Installation

Connect to your server via SSH:

```bash
ssh ubuntu@173.231.234.133
```

### Step 1: Update System Packages

First, update the package index and upgrade all installed packages:

```bash
sudo apt update && sudo apt upgrade -y
```

This may take a few minutes depending on how many packages need updating. If prompted about kernel updates or service restarts, accept the defaults.

### Step 2: Install Build Dependencies

Install the required build tools and libraries:

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

**Package descriptions:**

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

### Step 3: Verify Installations

Confirm that the essential tools are installed and accessible:

```bash
# Check compiler
gcc --version

# Check make
make --version

# Check git
git --version

# Check curl
curl --version
```

You should see version output for each command. Example output:

```
gcc (Ubuntu 13.2.0-23ubuntu4) 13.2.0
GNU Make 4.3
git version 2.43.0
curl 8.5.0 (x86_64-pc-linux-gnu)
```

### Step 4: Verify Additional Tools

Check the specialized tools:

```bash
# Check wireguard
wg --version

# Check xorriso
xorriso --version

# Check lz4
lz4 --version
```

---

## Ansible Automation

For automated deployment, use the Ansible playbook to install all dependencies.

### Prerequisites

Ensure you have:
- Ansible installed on your local machine
- SSH access to the target server
- Inventory configured (see [Appendix B: Ansible TDX Automation](/tutorial/ansible-tdx-automation))

### Run the Playbook

From the dstack-info repository on your local machine:

```bash
cd ~/dstack-info/ansible
ansible-playbook playbooks/setup-host-dependencies.yml -i inventory/hosts.yml
```

### What the Playbook Does

1. Updates apt package cache
2. Upgrades all system packages
3. Installs all required build dependencies
4. Verifies critical tools are available

### Expected Output

```
PLAY [Setup Host System Dependencies] ******************************************

TASK [Update apt cache] ********************************************************
ok: [dstack-host]

TASK [Upgrade all packages] ****************************************************
changed: [dstack-host]

TASK [Install build dependencies] **********************************************
changed: [dstack-host]

TASK [Verify gcc installation] *************************************************
ok: [dstack-host]

TASK [Verify make installation] ************************************************
ok: [dstack-host]

TASK [Verify git installation] *************************************************
ok: [dstack-host]

PLAY RECAP *********************************************************************
dstack-host                : ok=6    changed=2    unreachable=0    failed=0
```

---

## Verify Installation

Run this script to confirm all dependencies are installed:

```bash
echo "=== Dependency Check ===" && \
gcc --version | head -1 && \
make --version | head -1 && \
git --version && \
curl --version | head -1 && \
wg --version && \
xorriso --version 2>&1 | head -1 && \
lz4 --version && \
echo "=== All dependencies installed ==="
```

If all commands succeed, you're ready to proceed.

---

## Troubleshooting

### Package Installation Fails

If apt fails to install packages:

```bash
# Fix broken packages
sudo apt --fix-broken install

# Clear apt cache and retry
sudo apt clean
sudo apt update
sudo apt install -y build-essential
```

### Permission Denied

If you get permission errors:

```bash
# Ensure you're using sudo
sudo apt install -y build-essential

# Or check your sudo access
sudo -l
```

### Network Issues

If package downloads fail:

```bash
# Check network connectivity
ping -c 3 archive.ubuntu.com

# Try a different mirror (edit /etc/apt/sources.list if needed)
```

### Kernel Upgrade Prompts

If prompted about kernel upgrades during `apt upgrade`:

1. Select "Keep the local version currently installed" if unsure
2. Or accept the maintainer's version for latest updates
3. A reboot may be required after kernel updates

```bash
# Check if reboot is required
cat /var/run/reboot-required 2>/dev/null || echo "No reboot required"

# Reboot if needed
sudo reboot
```

### OpenMetal Grub Error

On OpenMetal servers, you may see this error during package installation:

```
grub-install: error: diskfilter writes are not supported.
dpkg: error processing package grub-pc (--configure):
```

This occurs because OpenMetal uses a disk configuration (ZFS or RAID) that grub-pc cannot write to directly. **The error does not affect dstack installation** - your packages are still installed correctly.

To prevent this error from blocking future apt operations:

```bash
# Hold the problematic packages
sudo apt-mark hold grub-pc grub-efi-amd64-signed

# Verify packages are held
apt-mark showhold
```

The grub configuration is managed by OpenMetal's infrastructure and doesn't need manual intervention.

---

## Next Steps

With the system dependencies installed, proceed to:

**[Install Rust Toolchain](/tutorial/install-rust-toolchain)** - Install Rust and Cargo for building dstack components

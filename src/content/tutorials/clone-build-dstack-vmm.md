---
title: "Clone & Build dstack-vmm"
description: "Clone the dstack repository and build the Virtual Machine Monitor (VMM) component"
section: "dstack Installation"
stepNumber: 3
totalSteps: 5
lastUpdated: 2025-12-04
prerequisites:
  - rust-toolchain-installation
tags:
  - dstack
  - vmm
  - cargo
  - build
  - compilation
difficulty: "intermediate"
estimatedTime: "20 minutes"
---

# Clone & Build dstack-vmm

This tutorial guides you through cloning the dstack repository and building the Virtual Machine Monitor (VMM) component. The VMM is the core component that manages TEE virtual machines on your host system.

## Prerequisites

Before starting, ensure you have:

- Completed [Rust Toolchain Installation](/tutorial/rust-toolchain-installation)
- SSH access to your TDX-enabled server
- At least 2GB free disk space

## Quick Start: Build with Ansible

For most users, the recommended approach is to use the Ansible playbook which clones, builds, and installs the VMM automatically.

### Step 1: Run the Ansible Playbook

```bash
cd ~/dstack-info/ansible
ansible-playbook -i inventory/hosts.yml playbooks/build-dstack-vmm.yml
```

The playbook will:
1. **Clone the dstack repository** - From GitHub to ~/dstack
2. **Check out stable release** - Uses the latest tagged version
3. **Build dstack-vmm** - Release mode with optimizations
4. **Build dstack-supervisor** - Required companion binary
5. **Install binaries** - Copy to /usr/local/bin
6. **Verify installation** - Test binaries work

### Step 2: Verify Installation

```bash
ansible-playbook -i inventory/hosts.yml playbooks/verify-dstack-vmm.yml
```

Or check directly on the server:

```bash
ssh ubuntu@YOUR_SERVER_IP "dstack-vmm --version"
```

---

## What Gets Built

| Binary | Purpose |
|--------|---------|
| `dstack-vmm` | Virtual Machine Monitor - manages TDX-protected VMs |
| `dstack-supervisor` | Process supervisor - manages processes within VMs |

Both binaries are installed to `/usr/local/bin/` for system-wide access.

---

## Manual Build

If you prefer to build manually, follow these steps.

### Step 1: Connect to Your Server

```bash
ssh ubuntu@YOUR_SERVER_IP
```

All build commands should be run as the `ubuntu` user. Only the final installation step requires `sudo`.

### Step 2: Clone the Repository

```bash
cd ~
git clone https://github.com/Dstack-TEE/dstack.git
cd dstack
```

### Step 3: Check Out a Stable Release

```bash
# List available releases
git tag -l 'v*' --sort=-version:refname | head -10

# Check out the latest stable release
git checkout v0.5.5
```

**Note:** Check the [dstack releases page](https://github.com/Dstack-TEE/dstack/releases) for the latest version.

### Step 4: Build dstack-vmm

```bash
cd ~/dstack/vmm
cargo build --release
```

This takes 5-15 minutes depending on your system. The first build downloads many dependencies.

### Step 5: Build dstack-supervisor

```bash
cd ~/dstack
cargo build --release -p supervisor
```

### Step 6: Install Binaries

```bash
# Install VMM
sudo cp ~/dstack/target/release/dstack-vmm /usr/local/bin/dstack-vmm
sudo chmod 755 /usr/local/bin/dstack-vmm

# Install supervisor
sudo cp ~/dstack/target/release/supervisor /usr/local/bin/dstack-supervisor
sudo chmod 755 /usr/local/bin/dstack-supervisor
```

### Step 7: Verify Installation

```bash
which dstack-vmm
dstack-vmm --version

which dstack-supervisor
ls -la /usr/local/bin/dstack-supervisor
```

---

## Build Options

### Specify a Different Version

```bash
# Check out a specific version
git checkout v0.5.4

# Or use main branch for latest development
git checkout main
git pull
```

### Clean Build

To rebuild from scratch:

```bash
cargo clean
cargo build --release
```

### Debug Build

For development with better error messages:

```bash
cargo build
# Binary at ~/dstack/target/debug/dstack-vmm
```

---

## Troubleshooting

### Network timeout downloading crates

```bash
export CARGO_HTTP_TIMEOUT=300
cargo build --release
```

### Linker errors

Ensure build dependencies are installed:

```bash
sudo apt install -y build-essential pkg-config libssl-dev
```

### Permission denied on install

```bash
# Ensure you're using sudo
sudo cp ~/dstack/target/release/dstack-vmm /usr/local/bin/

# Or install to user directory
mkdir -p ~/.local/bin
cp ~/dstack/target/release/dstack-vmm ~/.local/bin/
```

### Build cache issues

```bash
cargo clean
cargo update
cargo build --release
```

---

## Verification Checklist

Before proceeding, verify:

- [ ] Repository cloned at ~/dstack
- [ ] Checked out a stable release tag
- [ ] dstack-vmm binary built successfully
- [ ] dstack-supervisor binary built successfully
- [ ] Both binaries installed to /usr/local/bin
- [ ] `dstack-vmm --version` works

### Quick Verification Script

```bash
#!/bin/bash
echo "Checking dstack-vmm installation..."

[ -d ~/dstack ] && echo "✓ Repository exists" || echo "✗ Repository missing"
command -v dstack-vmm &>/dev/null && echo "✓ dstack-vmm: $(dstack-vmm --version 2>/dev/null || echo 'installed')" || echo "✗ dstack-vmm not found"
command -v dstack-supervisor &>/dev/null && echo "✓ dstack-supervisor installed" || echo "✗ dstack-supervisor not found"
```

---

## Next Steps

With dstack-vmm built, proceed to:

- [VMM Configuration](/tutorial/vmm-configuration) - Configure the VMM for production

## Additional Resources

- [dstack GitHub Repository](https://github.com/Dstack-TEE/dstack)
- [Cargo Documentation](https://doc.rust-lang.org/cargo/)

---
title: "Rust Toolchain Installation"
description: "Install and configure the Rust programming language toolchain for building dstack components"
section: "dstack Installation"
stepNumber: 2
totalSteps: 6
lastUpdated: 2025-12-07
prerequisites:
  - system-baseline-dependencies
tags:
  - rust
  - cargo
  - rustup
  - toolchain
difficulty: "beginner"
estimatedTime: "10 minutes"
---

# Rust Toolchain Installation

This tutorial guides you through installing the Rust programming language toolchain, which is required for building dstack components.

## Prerequisites

Before starting, ensure you have:

- Completed [System Baseline & Dependencies](/tutorial/system-baseline-dependencies)
- SSH access to your TDX-enabled server

## Quick Start: Setup with Ansible

> **Using Ansible?** Playbooks are in `~/dstack-info/ansible`. If you haven't set up Ansible yet, see [TDX Software Installation: Quick Start with Ansible](/tutorial/tdx-software-installation#quick-start-install-with-ansible) for initial setup.

For most users, the recommended approach is to use the Ansible playbook which installs and configures Rust automatically.

### Step 1: Run the Ansible Playbook

```bash
ansible-playbook -i inventory/hosts.yml playbooks/setup-rust-toolchain.yml
```

The playbook will:
1. **Install rustup** - Rust toolchain installer
2. **Install stable toolchain** - Latest stable Rust compiler
3. **Add components** - clippy (linter) and rustfmt (formatter)
4. **Configure PATH** - Ensure cargo is accessible
5. **Verify installation** - Test compilation works

### Step 2: Verify Installation

```bash
ansible-playbook -i inventory/hosts.yml playbooks/verify-rust-toolchain.yml
```

Or check directly on the server:

```bash
ssh ubuntu@YOUR_SERVER_IP "source ~/.cargo/env && rustc --version && cargo --version"
```

---

## What Gets Installed

| Component | Purpose |
|-----------|---------|
| `rustup` | Rust toolchain installer and version manager |
| `rustc` | Rust compiler |
| `cargo` | Rust package manager and build tool |
| `clippy` | Rust linter for catching common mistakes |
| `rustfmt` | Rust code formatter |

---

## Manual Installation

If you prefer to install Rust manually, follow these steps.

### Step 1: Connect to Your Server

```bash
ssh ubuntu@YOUR_SERVER_IP
```

All commands should be run as the `ubuntu` user (not root). Rust will be installed in your home directory at `~/.cargo` and `~/.rustup`.

### Step 2: Install rustup

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
```

The `-y` flag accepts default options:
- Installs the stable toolchain
- Adds cargo to your PATH
- Sets up shell configuration

### Step 3: Load the Environment

```bash
source $HOME/.cargo/env
```

### Step 4: Install Additional Components

```bash
rustup component add clippy rustfmt
```

### Step 5: Verify Installation

```bash
rustc --version
cargo --version
rustup --version
```

Expected output (versions may vary):
```
rustc 1.82.0 (f6e511eec 2024-10-15)
cargo 1.82.0 (8f40fc59f 2024-08-21)
rustup 1.27.1 (54dd3d00f 2024-04-24)
```

### Step 6: Test Compilation

```bash
cargo new --bin rust-test && cd rust-test && cargo run && cd ~ && rm -rf rust-test
```

You should see "Hello, world!" printed.

---

## Troubleshooting

### rustup command not found

If `rustup` is not found after installation:

```bash
# Manually add to PATH
export PATH="$HOME/.cargo/bin:$PATH"

# Add to shell profile permanently
echo 'export PATH="$HOME/.cargo/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

### Permission denied errors

```bash
# Ensure cargo directory is owned by your user
sudo chown -R $USER:$USER ~/.cargo ~/.rustup
```

### Network timeout during installation

```bash
# Increase timeout and retry
export CARGO_HTTP_TIMEOUT=300
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

### Updating Rust

To update to the latest stable version:

```bash
rustup update stable
```

---

## Next Steps

With Rust installed, proceed to:

- [Clone & Build dstack-vmm](/tutorial/clone-build-dstack-vmm) - Build the dstack virtual machine manager

## Additional Resources

- [The Rust Programming Language Book](https://doc.rust-lang.org/book/)
- [Rust by Example](https://doc.rust-lang.org/rust-by-example/)
- [rustup Documentation](https://rust-lang.github.io/rustup/)

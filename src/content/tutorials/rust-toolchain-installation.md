---
title: "Rust Toolchain Installation"
description: "Install and configure the Rust programming language toolchain for building dstack components"
section: "dstack Installation"
stepNumber: 2
totalSteps: 5
lastUpdated: 2025-11-19
prerequisites: ["system-baseline-dependencies"]
tags: ["rust", "cargo", "rustup", "toolchain"]
difficulty: "beginner"
estimatedTime: "10 minutes"
---

# Rust Toolchain Installation

This tutorial guides you through installing the Rust programming language toolchain, which is required for building dstack components. Rust provides memory safety and performance critical for TEE applications.

## What You'll Install

- **rustup** - Rust toolchain installer and version manager
- **rustc** - Rust compiler
- **cargo** - Rust package manager and build tool
- **clippy** - Rust linter for catching common mistakes
- **rustfmt** - Rust code formatter

## Prerequisites

Before starting, ensure you have:

- Completed [System Baseline & Dependencies](/tutorial/system-baseline-dependencies)
- SSH access to your TDX-enabled server
- Internet connectivity for downloading Rust components

## Step 1: Install rustup

rustup is the official Rust toolchain installer that manages Rust versions and components.

### Install rustup with default settings

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
```

The `-y` flag accepts default options:
- Installs the stable toolchain
- Adds cargo to your PATH
- Sets up shell configuration

### Source the environment

After installation, load the Rust environment into your current shell:

```bash
source $HOME/.cargo/env
```

This command adds `~/.cargo/bin` to your PATH, making `rustc`, `cargo`, and other tools available.

## Step 2: Verify Installation

Confirm that Rust is properly installed by checking the versions:

### Check Rust compiler version

```bash
rustc --version
```

Expected output (version may vary):
```
rustc 1.82.0 (f6e511eec 2024-10-15)
```

### Check Cargo version

```bash
cargo --version
```

Expected output:
```
cargo 1.82.0 (8f40fc59f 2024-08-21)
```

### Check rustup version

```bash
rustup --version
```

Expected output:
```
rustup 1.27.1 (54dd3d00f 2024-04-24)
```

## Step 3: Install Additional Components

Install recommended Rust development tools:

### Install clippy (linter)

```bash
rustup component add clippy
```

Clippy helps catch common mistakes and suggests improvements to your Rust code.

### Install rustfmt (formatter)

```bash
rustup component add rustfmt
```

rustfmt automatically formats Rust code to follow style guidelines.

### Verify components are installed

```bash
rustup component list --installed
```

You should see output including:
```
cargo-x86_64-unknown-linux-gnu
clippy-x86_64-unknown-linux-gnu
rust-docs-x86_64-unknown-linux-gnu
rust-std-x86_64-unknown-linux-gnu
rustc-x86_64-unknown-linux-gnu
rustfmt-x86_64-unknown-linux-gnu
```

## Step 4: Test the Installation

Verify everything works by creating and running a simple test program:

### Create a test project

```bash
cargo new --bin rust-test && cd rust-test
```

### Build and run the test

```bash
cargo run
```

Expected output:
```
   Compiling rust-test v0.1.0 (/home/ubuntu/rust-test)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in X.XXs
     Running `target/debug/rust-test`
Hello, world!
```

### Clean up the test project

```bash
cd ~ && rm -rf rust-test
```

## Ansible Automation

You can also install Rust using Ansible for automated deployments.

### Run the Ansible playbook

```bash
cd ~/dstack-info/ansible
ansible-playbook -i inventory/hosts.yml playbooks/setup-rust-toolchain.yml
```

The playbook will:
1. Install rustup if not present
2. Install the stable Rust toolchain
3. Add clippy and rustfmt components
4. Verify the installation

### Verify with Ansible

After running the playbook, SSH to the server and verify:

```bash
ssh ubuntu@your-server-ip
rustc --version
cargo --version
```

## Troubleshooting

### rustup command not found

If `rustup` is not found after installation:

```bash
# Check if cargo bin exists
ls ~/.cargo/bin/

# Manually add to PATH
export PATH="$HOME/.cargo/bin:$PATH"

# Add to shell profile permanently
echo 'export PATH="$HOME/.cargo/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

### Permission denied errors

If you encounter permission errors:

```bash
# Ensure cargo directory is owned by your user
sudo chown -R $USER:$USER ~/.cargo ~/.rustup
```

### Slow compilation

Rust compilation can be resource-intensive. If builds are slow:

```bash
# Check available memory
free -h

# Use fewer parallel jobs if memory is limited
cargo build -j 2
```

### Network timeout during installation

If rustup installation times out:

```bash
# Use a different mirror (if available)
export RUSTUP_DIST_SERVER=https://mirrors.ustc.edu.cn/rust-static

# Retry installation
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

### Updating Rust

To update to the latest stable Rust version:

```bash
rustup update stable
```

## Verification Checklist

Before proceeding, verify you have:

- [ ] rustup installed and in PATH
- [ ] rustc version 1.70.0 or higher
- [ ] cargo version matching rustc
- [ ] clippy component installed
- [ ] rustfmt component installed
- [ ] Successfully compiled and ran a test program

### Quick verification script

Run this script to verify your Rust installation:

```bash
#!/bin/bash
echo "Checking Rust installation..."

# Check rustup
if command -v rustup &> /dev/null; then
    echo "✓ rustup: $(rustup --version | head -1)"
else
    echo "✗ rustup not found"
    exit 1
fi

# Check rustc
if command -v rustc &> /dev/null; then
    echo "✓ rustc: $(rustc --version)"
else
    echo "✗ rustc not found"
    exit 1
fi

# Check cargo
if command -v cargo &> /dev/null; then
    echo "✓ cargo: $(cargo --version)"
else
    echo "✗ cargo not found"
    exit 1
fi

# Check clippy
if rustup component list --installed | grep -q clippy; then
    echo "✓ clippy installed"
else
    echo "✗ clippy not installed"
    exit 1
fi

# Check rustfmt
if rustup component list --installed | grep -q rustfmt; then
    echo "✓ rustfmt installed"
else
    echo "✗ rustfmt not installed"
    exit 1
fi

echo ""
echo "All Rust components verified successfully!"
```

## Next Steps

With Rust installed, you're ready to proceed to the next tutorial:

- [Clone & Build dstack-vmm](/tutorial/clone-build-dstack-vmm) - Build the dstack virtual machine manager

## Additional Resources

- [The Rust Programming Language Book](https://doc.rust-lang.org/book/)
- [Rust by Example](https://doc.rust-lang.org/rust-by-example/)
- [rustup Documentation](https://rust-lang.github.io/rustup/)
- [Cargo Documentation](https://doc.rust-lang.org/cargo/)

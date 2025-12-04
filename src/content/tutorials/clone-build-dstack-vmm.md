---
title: "Clone & Build dstack-vmm"
description: "Clone the dstack repository and build the Virtual Machine Monitor (VMM) component"
section: "dstack Installation"
stepNumber: 3
totalSteps: 5
lastUpdated: 2025-11-19
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

## What You'll Build

- **dstack-vmm** - The Virtual Machine Monitor binary that:
  - Manages TDX-protected virtual machines
  - Provides API for deployment operations
  - Handles VM lifecycle (create, start, stop, delete)
  - Manages networking and storage for VMs

- **dstack-supervisor** - The process supervisor that:
  - Manages child processes within VMs
  - Handles process lifecycle and monitoring
  - Required by VMM to function properly

## Prerequisites

Before starting, ensure you have:

- Completed [Rust Toolchain Installation](/tutorial/rust-toolchain-installation)
- SSH access to your TDX-enabled server
- At least 2GB free disk space for build artifacts
- Internet connectivity for downloading dependencies

## Connect to Your Server

Connect to your TDX server via SSH as the `ubuntu` user:

```bash
ssh ubuntu@YOUR_SERVER_IP
```

All build commands in this tutorial should be run as the `ubuntu` user. Rust and the source code are in the ubuntu user's home directory. Only the final installation step (copying to `/usr/local/bin`) requires `sudo`.

---

## Step 1: Clone the dstack Repository

The dstack source code is hosted on GitHub. Clone it to your home directory.

### Clone the repository

```bash
cd ~
git clone https://github.com/Dstack-TEE/dstack.git
cd dstack
```

### Check out a specific release

For stability, use a specific release tag rather than the development branch:

```bash
# List available releases
git tag -l 'v*' --sort=-version:refname | head -10

# Check out the latest stable release
git checkout v0.5.5
```

**Note:** Check the [dstack releases page](https://github.com/Dstack-TEE/dstack/releases) for the latest version.

This will create a `~/dstack` directory with the complete source code at the specified version.

### Verify the clone

```bash
ls -la ~/dstack
```

You should see directories including:
- `vmm/` - Virtual Machine Monitor source
- `kms/` - Key Management Service source
- `gateway/` - Gateway service source
- `guest-agent/` - Guest agent source

### Check the repository status

```bash
cd ~/dstack
git status
git log --oneline -5
```

This shows the current branch and recent commits.

## Step 2: Build dstack-vmm

Build the VMM binary using Cargo in release mode for optimal performance.

### Navigate to VMM directory

```bash
cd ~/dstack/vmm
```

### Build in release mode

```bash
cargo build --release
```

This compilation will:
- Download and compile all dependencies
- Build the VMM binary with optimizations
- Take 5-15 minutes depending on your system

**Note:** The first build downloads many crates from crates.io. Subsequent builds are much faster.

### Monitor build progress

You'll see output like:
```
   Compiling proc-macro2 v1.0.70
   Compiling unicode-ident v1.0.12
   Compiling libc v0.2.150
   ...
   Compiling vmm v0.1.0 (/home/ubuntu/dstack/vmm)
    Finished `release` profile [optimized] target(s) in Xm XXs
```

## Step 3: Build dstack-supervisor

The VMM requires the supervisor component to manage processes. Build it from the workspace root.

### Navigate to repository root

```bash
cd ~/dstack
```

### Build supervisor in release mode

```bash
cargo build --release -p supervisor
```

This builds the supervisor package specifically. It typically takes 1-3 minutes since many dependencies are already compiled.

### Verify supervisor binary

```bash
ls -lh ~/dstack/target/release/supervisor
```

Expected output (typically 10-15MB):
```
-rwxrwxr-x 1 ubuntu ubuntu 11M Nov 19 10:35 /home/ubuntu/dstack/target/release/supervisor
```

## Step 4: Verify the Build

After compilation completes, verify both binaries were created successfully.

### Check VMM binary exists

```bash
ls -lh ~/dstack/target/release/dstack-vmm
```

Expected output shows the binary (typically 15-25MB):
```
-rwxrwxr-x 1 ubuntu ubuntu 19M Nov 19 10:30 /home/ubuntu/dstack/target/release/dstack-vmm
```

### Check supervisor binary exists

```bash
ls -lh ~/dstack/target/release/supervisor
```

Expected output (typically 10-15MB):
```
-rwxrwxr-x 1 ubuntu ubuntu 11M Nov 19 10:35 /home/ubuntu/dstack/target/release/supervisor
```

**Note:** Both binaries are in the workspace root `target/` directory because dstack uses a Cargo workspace.

### Test the VMM binary

```bash
~/dstack/target/release/dstack-vmm --help
```

This displays the VMM help message with available commands and options.

### Check version

```bash
~/dstack/target/release/dstack-vmm --version
```

## Step 5: Install to System Path

Install both binaries to a system-wide location. This is required for the VMM service to work.

### Copy binaries to /usr/local/bin

```bash
# Install VMM
sudo cp ~/dstack/target/release/dstack-vmm /usr/local/bin/dstack-vmm
sudo chmod 755 /usr/local/bin/dstack-vmm

# Install supervisor
sudo cp ~/dstack/target/release/supervisor /usr/local/bin/dstack-supervisor
sudo chmod 755 /usr/local/bin/dstack-supervisor
```

### Verify installation

```bash
which dstack-vmm
dstack-vmm --help

which dstack-supervisor
ls -la /usr/local/bin/dstack-supervisor
```

Now you can run both binaries from anywhere on the system.

## Ansible Automation

You can automate the clone and build process using Ansible.

### Run the Ansible playbook

```bash
cd ~/dstack-info/ansible
ansible-playbook -i inventory/hosts.yml playbooks/build-dstack-vmm.yml
```

The playbook will:
1. Clone the dstack repository (or update if exists)
2. Build dstack-vmm in release mode
3. Build dstack-supervisor in release mode
4. Install both binaries to /usr/local/bin
5. Verify the installation

### Verify with Ansible

After running the build playbook, verify the installation:

```bash
cd ~/dstack-info/ansible
ansible-playbook -i inventory/hosts.yml playbooks/verify-dstack-vmm.yml
```

The verification playbook checks:
- Repository is cloned with correct version
- VMM binary is built
- Binary is installed to /usr/local/bin
- Binary executes correctly

## Build Options

### Debug Build

For development with better error messages (larger binary, slower):

```bash
cargo build
ls -lh ~/dstack/vmm/target/debug/vmm
```

### Clean Build

To rebuild from scratch (removes all cached artifacts):

```bash
cargo clean
cargo build --release
```

### Build with Specific Features

Check `Cargo.toml` for available features:

```bash
cargo build --release --features feature-name
```

## Troubleshooting

### Out of memory during build

Rust compilation is memory-intensive. If the build fails with OOM:

```bash
# Check available memory
free -h

# Use fewer parallel jobs
cargo build --release -j 2
```

### Network timeout downloading crates

If crate downloads timeout:

```bash
# Retry the build
cargo build --release

# Or use a different crates.io mirror
export CARGO_HTTP_TIMEOUT=300
cargo build --release
```

### Linker errors

If you see linker errors, ensure build dependencies are installed:

```bash
sudo apt install -y build-essential pkg-config libssl-dev
```

### Permission denied on install

If copying to /usr/local/bin fails:

```bash
# Ensure you're using sudo
sudo cp ~/dstack/vmm/target/release/vmm /usr/local/bin/dstack-vmm

# Or install to user directory
mkdir -p ~/.local/bin
cp ~/dstack/vmm/target/release/vmm ~/.local/bin/dstack-vmm
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

### Build cache issues

If you encounter strange build errors:

```bash
# Clear build cache
cargo clean

# Update dependencies
cargo update

# Rebuild
cargo build --release
```

### Missing TDX-specific dependencies

The VMM may require TDX-specific libraries. If build fails with TDX errors:

```bash
# Ensure TDX development packages are installed
# (specific packages depend on your kernel version)
```

## Verification Checklist

Before proceeding, verify you have:

- [ ] Cloned dstack repository to ~/dstack
- [ ] Built VMM binary in release mode
- [ ] Built supervisor binary in release mode
- [ ] VMM binary exists at ~/dstack/target/release/dstack-vmm
- [ ] Supervisor binary exists at ~/dstack/target/release/supervisor
- [ ] VMM binary runs and shows help message
- [ ] Installed VMM to /usr/local/bin/dstack-vmm
- [ ] Installed supervisor to /usr/local/bin/dstack-supervisor

### Quick verification script

Run this script to verify your build:

```bash
#!/bin/bash
echo "Checking dstack build..."

# Check repository
if [ -d "$HOME/dstack" ]; then
    echo "✓ dstack repository: $HOME/dstack"
else
    echo "✗ dstack repository not found"
    exit 1
fi

# Check VMM source
if [ -d "$HOME/dstack/vmm" ]; then
    echo "✓ VMM source directory exists"
else
    echo "✗ VMM source directory not found"
    exit 1
fi

# Check VMM binary
VMM_BIN="$HOME/dstack/target/release/dstack-vmm"
if [ -f "$VMM_BIN" ]; then
    SIZE=$(ls -lh "$VMM_BIN" | awk '{print $5}')
    echo "✓ VMM binary: $SIZE"
else
    echo "✗ VMM binary not found"
    exit 1
fi

# Check supervisor binary
SUPERVISOR_BIN="$HOME/dstack/target/release/supervisor"
if [ -f "$SUPERVISOR_BIN" ]; then
    SIZE=$(ls -lh "$SUPERVISOR_BIN" | awk '{print $5}')
    echo "✓ Supervisor binary: $SIZE"
else
    echo "✗ Supervisor binary not found"
    exit 1
fi

# Check if VMM binary runs
if $VMM_BIN --help > /dev/null 2>&1; then
    echo "✓ VMM binary executes successfully"
else
    echo "✗ VMM binary failed to execute"
    exit 1
fi

# Check system installation
if command -v dstack-vmm &> /dev/null; then
    echo "✓ dstack-vmm installed to system PATH"
else
    echo "✗ dstack-vmm not installed to system PATH"
    exit 1
fi

if [ -f "/usr/local/bin/dstack-supervisor" ]; then
    echo "✓ dstack-supervisor installed to system PATH"
else
    echo "✗ dstack-supervisor not installed to system PATH"
    exit 1
fi

echo ""
echo "dstack build verified successfully!"
```

## Build Performance Tips

### Use all CPU cores

By default, Cargo uses all available cores. To specify:

```bash
cargo build --release -j $(nproc)
```

### Use sccache for faster rebuilds

Install sccache to cache compiled artifacts:

```bash
cargo install sccache
export RUSTC_WRAPPER=sccache
cargo build --release
```

### Incremental builds

After the first build, subsequent builds only recompile changed code. Keep your build directory intact for faster iterations.

## Next Steps

With dstack-vmm built, you're ready to proceed to configuration:

- [VMM Configuration](/tutorial/vmm-configuration) - Configure the VMM service

## Additional Resources

- [dstack GitHub Repository](https://github.com/Dstack-TEE/dstack)
- [Cargo Documentation](https://doc.rust-lang.org/cargo/)
- [Rust Performance Tips](https://nnethercote.github.io/perf-book/)

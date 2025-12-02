---
title: "Guest OS Image Setup"
description: "Download and configure guest OS images for dstack CVM deployment"
section: "First Application"
stepNumber: 1
totalSteps: 3
lastUpdated: 2025-12-02
prerequisites:
  - gateway-service-setup
tags:
  - dstack
  - cvm
  - guest-os
  - teepod
  - image
difficulty: "intermediate"
estimatedTime: "30 minutes"
---

# Guest OS Image Setup

This tutorial guides you through setting up guest OS images for deploying Confidential Virtual Machines (CVMs) on your dstack infrastructure. Guest images contain the operating system, kernel, and firmware that run inside the TDX-protected environment.

## What You'll Configure

- **Guest OS images** - Pre-built Yocto-based images for CVMs
- **Teepod service** - The CVM manager that launches and manages guest VMs
- **Image directory structure** - Proper organization for multiple image versions

## Understanding Guest OS Images

A dstack guest OS image consists of four core components:

| Component | Description |
|-----------|-------------|
| **OVMF.fd** | Virtual firmware (UEFI BIOS) - boots first, establishes TDX measurements |
| **bzImage** | Linux kernel compiled for TDX guests |
| **initramfs.cpio.gz** | Initial RAM filesystem with early boot scripts |
| **rootfs.cpio** | Root filesystem containing tappd and container runtime |

These components are measured by TDX hardware during boot, creating a cryptographic chain of trust that can be verified through attestation.

## Prerequisites

Before starting, ensure you have:

- Completed [Gateway Service Setup](/tutorial/gateway-service-setup)
- VMM service running
- KMS service running
- Gateway service running
- At least 10GB free disk space for images

## Step 1: Create Image Directory Structure

Create the directory where guest images will be stored:

```bash
sudo mkdir -p /var/lib/dstack/images
sudo chown root:root /var/lib/dstack/images
sudo chmod 755 /var/lib/dstack/images
```

## Step 2: Download Guest OS Image

Download the latest dstack guest OS image from GitHub releases:

```bash
# Check latest release version
DSTACK_VERSION="0.4.0"

# Download the image archive
cd /tmp
wget https://github.com/Dstack-TEE/meta-dstack/releases/download/v${DSTACK_VERSION}/dstack-${DSTACK_VERSION}.tar.gz
```

Verify the download:

```bash
ls -lh dstack-${DSTACK_VERSION}.tar.gz
```

Expected output (size varies by version):

```
-rw-r--r-- 1 root root 150M Dec  2 10:00 dstack-0.4.0.tar.gz
```

## Step 3: Extract and Install Image

Create a versioned directory and extract the image:

```bash
# Create image directory
sudo mkdir -p /var/lib/dstack/images/dstack-${DSTACK_VERSION}

# Extract image components
sudo tar -xvf dstack-${DSTACK_VERSION}.tar.gz -C /var/lib/dstack/images/dstack-${DSTACK_VERSION}/
```

Verify the extracted files:

```bash
ls -la /var/lib/dstack/images/dstack-${DSTACK_VERSION}/
```

Expected output:

```
total 156000
drwxr-xr-x 2 root root     4096 Dec  2 10:05 .
drwxr-xr-x 3 root root     4096 Dec  2 10:05 ..
-rw-r--r-- 1 root root  4194304 Dec  2 10:05 OVMF.fd
-rw-r--r-- 1 root root 12345678 Dec  2 10:05 bzImage
-rw-r--r-- 1 root root 45678901 Dec  2 10:05 initramfs.cpio.gz
-rw-r--r-- 1 root root 98765432 Dec  2 10:05 rootfs.cpio
-rw-r--r-- 1 root root      512 Dec  2 10:05 metadata.json
```

## Step 4: Verify Image Metadata

Check the image metadata to understand its configuration:

```bash
cat /var/lib/dstack/images/dstack-${DSTACK_VERSION}/metadata.json | jq .
```

Expected output:

```json
{
  "version": "dstack-0.4.0",
  "cmdline": "console=hvc0 root=/dev/vda ro rootfstype=squashfs rootflags=loop ...",
  "kernel": "bzImage",
  "initrd": "initramfs.cpio.gz",
  "rootfs": "rootfs.cpio",
  "bios": "OVMF.fd",
  "rootfs_hash": "sha256:abc123...",
  "is_dev": false
}
```

### Metadata Fields Explained

| Field | Description |
|-------|-------------|
| `version` | Image version identifier |
| `cmdline` | Kernel boot parameters including rootfs hash |
| `kernel` | Kernel image filename |
| `initrd` | Initial ramdisk filename |
| `rootfs` | Root filesystem filename |
| `bios` | UEFI firmware filename |
| `rootfs_hash` | Cryptographic hash of rootfs for verification |
| `is_dev` | Whether this is a development image (allows SSH) |

## Step 5: Build Teepod

Teepod is the CVM manager that launches and manages guest VMs. Build it from the dstack repository:

```bash
cd ~/dstack

# Build teepod
source $HOME/.cargo/env
cargo build --release -p teepod
```

This may take several minutes. Expected output ends with:

```
    Finished `release` profile [optimized] target(s) in 2m 30s
```

Install the teepod binary:

```bash
sudo cp target/release/teepod /usr/local/bin/
sudo chmod 755 /usr/local/bin/teepod
```

Verify installation:

```bash
teepod --version
```

## Step 6: Create Teepod Configuration

Create the teepod configuration directory:

```bash
sudo mkdir -p /etc/dstack/teepod
```

Create the teepod configuration file:

```bash
sudo tee /etc/dstack/teepod/teepod.toml > /dev/null <<'EOF'
# Teepod Configuration
# CVM Manager for dstack

# API server configuration
address = "unix:/var/run/teepod.sock"
http_address = "127.0.0.1:9080"

# Image and runtime paths
image_path = "/var/lib/dstack/images"
run_path = "/var/lib/dstack/run"

# CVM configuration
[cvm]
# KMS endpoints for key management
kms_urls = ["http://127.0.0.1:9100"]

# Gateway/tproxy endpoints for network access
tproxy_urls = ["http://127.0.0.1:9070"]

# VSOCK CID pool for CVMs
cid_start = 30000
cid_pool_size = 1000

# Port mapping for CVM network access
[cvm.port_mapping]
enabled = true
address = "127.0.0.1"
range = [
    { protocol = "tcp", from = 1, to = 20000 },
    { protocol = "udp", from = 1, to = 20000 },
]

# Default CVM resources
[cvm.defaults]
vcpus = 2
memory = 2048  # MB
disk_size = 10240  # MB
EOF
```

### Configuration Options Explained

| Setting | Description |
|---------|-------------|
| `address` | Unix socket for local API access |
| `http_address` | HTTP API endpoint for web UI |
| `image_path` | Directory containing guest OS images |
| `run_path` | Runtime directory for VM state |
| `kms_urls` | KMS endpoints for key operations |
| `tproxy_urls` | Gateway endpoints for routing |
| `cid_start` | Starting VSOCK Context ID |
| `cid_pool_size` | Number of available CIDs |

## Step 7: Create Runtime Directories

Create the directories teepod needs at runtime:

```bash
sudo mkdir -p /var/lib/dstack/run
sudo mkdir -p /var/run/teepod
sudo chown root:root /var/lib/dstack/run
sudo chmod 755 /var/lib/dstack/run
```

## Step 8: Create Teepod Systemd Service

Create the systemd service file:

```bash
sudo tee /etc/systemd/system/dstack-teepod.service > /dev/null <<'EOF'
[Unit]
Description=dstack Teepod CVM Manager
Documentation=https://dstack.info
After=network.target dstack-kms.service dstack-gateway.service
Wants=dstack-kms.service dstack-gateway.service

[Service]
Type=simple
User=root
ExecStart=/usr/local/bin/teepod --config /etc/dstack/teepod/teepod.toml
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal

# Working directory
WorkingDirectory=/var/lib/dstack

# Environment
Environment="RUST_LOG=info"

# Security hardening
NoNewPrivileges=false
ProtectSystem=strict
ReadWritePaths=/var/lib/dstack /var/run/teepod /tmp

# Resource limits
LimitNOFILE=65535
LimitNPROC=65535

[Install]
WantedBy=multi-user.target
EOF
```

## Step 9: Enable and Start Teepod

Reload systemd and start the service:

```bash
sudo systemctl daemon-reload
sudo systemctl enable dstack-teepod
sudo systemctl start dstack-teepod
```

Check the service status:

```bash
sudo systemctl status dstack-teepod
```

Expected output:

```
● dstack-teepod.service - dstack Teepod CVM Manager
     Loaded: loaded (/etc/systemd/system/dstack-teepod.service; enabled; preset: enabled)
     Active: active (running) since Mon 2025-12-02 10:30:00 UTC; 5s ago
       Docs: https://dstack.info
   Main PID: 12345 (teepod)
      Tasks: 4 (limit: 154303)
     Memory: 15.2M
        CPU: 123ms
     CGroup: /system.slice/dstack-teepod.service
             └─12345 /usr/local/bin/teepod --config /etc/dstack/teepod/teepod.toml
```

## Step 10: Verify Teepod Operation

### Check teepod logs

```bash
sudo journalctl -u dstack-teepod -n 50
```

Look for successful initialization messages:

```
INFO teepod: Starting teepod CVM manager
INFO teepod: Loading images from /var/lib/dstack/images
INFO teepod: Found image: dstack-0.4.0
INFO teepod: HTTP API listening on 127.0.0.1:9080
INFO teepod: Unix socket at /var/run/teepod.sock
INFO teepod: Ready to accept CVM requests
```

### Test HTTP API

```bash
curl http://127.0.0.1:9080/api/images
```

Expected output:

```json
{
  "images": [
    {
      "name": "dstack-0.4.0",
      "version": "0.4.0",
      "path": "/var/lib/dstack/images/dstack-0.4.0"
    }
  ]
}
```

### List available images

```bash
curl http://127.0.0.1:9080/api/images | jq .
```

## Ansible Automation

You can automate the guest image setup using Ansible.

### Run the Ansible playbook

```bash
cd ~/dstack-info/ansible
ansible-playbook -i inventory/hosts.yml playbooks/setup-guest-images.yml \
  -e "dstack_version=0.4.0"
```

The playbook will:
1. Create image directory structure
2. Download guest OS image
3. Build and install teepod
4. Configure teepod service
5. Start and verify the service

## Managing Multiple Image Versions

You can have multiple image versions installed simultaneously:

```bash
# Download additional version
DSTACK_VERSION="0.3.0"
wget https://github.com/Dstack-TEE/meta-dstack/releases/download/v${DSTACK_VERSION}/dstack-${DSTACK_VERSION}.tar.gz
sudo mkdir -p /var/lib/dstack/images/dstack-${DSTACK_VERSION}
sudo tar -xvf dstack-${DSTACK_VERSION}.tar.gz -C /var/lib/dstack/images/dstack-${DSTACK_VERSION}/
```

List all installed images:

```bash
ls -la /var/lib/dstack/images/
```

When deploying applications, specify which image version to use.

## Troubleshooting

### Teepod fails to start

Check the logs for specific errors:

```bash
sudo journalctl -u dstack-teepod -n 100 --no-pager
```

Common issues:

**Image not found:**
```bash
# Verify image exists
ls -la /var/lib/dstack/images/dstack-*/
```

**Permission denied:**
```bash
# Fix permissions
sudo chown -R root:root /var/lib/dstack
sudo chmod -R 755 /var/lib/dstack/images
```

**Port already in use:**
```bash
sudo lsof -i :9080
```

### Image download fails

Try alternative download methods:

```bash
# Using curl instead of wget
curl -L -o dstack-${DSTACK_VERSION}.tar.gz \
  https://github.com/Dstack-TEE/meta-dstack/releases/download/v${DSTACK_VERSION}/dstack-${DSTACK_VERSION}.tar.gz
```

### Image metadata missing

If metadata.json is missing, the image may be corrupted:

```bash
# Re-download and extract
rm -rf /var/lib/dstack/images/dstack-${DSTACK_VERSION}
# Then repeat Steps 2-3
```

## Verification Checklist

Before proceeding, verify you have:

- [ ] Created image directory structure
- [ ] Downloaded guest OS image
- [ ] Extracted image components (OVMF.fd, bzImage, initramfs, rootfs)
- [ ] Verified metadata.json exists and is valid
- [ ] Built and installed teepod binary
- [ ] Created teepod configuration
- [ ] Started teepod service successfully
- [ ] Verified HTTP API responds

### Quick verification script

```bash
#!/bin/bash
echo "Checking guest image setup..."

# Check image directory
if [ -d "/var/lib/dstack/images" ]; then
    echo "✓ Image directory exists"
else
    echo "✗ Image directory missing"
    exit 1
fi

# Check for at least one image
if ls /var/lib/dstack/images/dstack-* 1> /dev/null 2>&1; then
    echo "✓ Guest OS image(s) found"
else
    echo "✗ No guest OS images found"
    exit 1
fi

# Check teepod binary
if [ -x "/usr/local/bin/teepod" ]; then
    echo "✓ Teepod binary installed"
else
    echo "✗ Teepod binary missing"
    exit 1
fi

# Check teepod service
if sudo systemctl is-active --quiet dstack-teepod; then
    echo "✓ Teepod service running"
else
    echo "✗ Teepod service not running"
    exit 1
fi

# Check HTTP API
if curl -s http://127.0.0.1:9080/api/images > /dev/null 2>&1; then
    echo "✓ Teepod HTTP API responding"
else
    echo "✗ Teepod HTTP API not responding"
    exit 1
fi

echo ""
echo "Guest image setup verified successfully!"
```

## Understanding the Boot Process

When a CVM starts, the following sequence occurs:

```
1. Teepod launches QEMU with TDX enabled
           ↓
2. OVMF (Virtual Firmware) boots
   - Measures itself into MRTD
   - Initializes virtual hardware
           ↓
3. Linux Kernel loads
   - Measured into RTMR1
   - Kernel cmdline measured into RTMR2
           ↓
4. Initramfs runs
   - Measured into RTMR2
   - Mounts rootfs
           ↓
5. Tappd starts
   - Guest daemon for attestation
   - Provides /var/run/tappd.sock
           ↓
6. Docker containers start
   - Application workloads
   - Can request TDX quotes via tappd
```

Each step creates cryptographic measurements that can be verified through TDX attestation.

## Next Steps

With guest images configured and teepod running, you're ready to deploy your first application. The next tutorial covers deploying a Hello World application to verify your setup works correctly.

## Additional Resources

- [meta-dstack Repository](https://github.com/Dstack-TEE/meta-dstack)
- [Teepod Documentation](https://github.com/Dstack-TEE/dstack/tree/main/teepod)
- [Yocto Project](https://www.yoctoproject.org/)
- [TDX Guest Architecture](https://www.intel.com/content/www/us/en/developer/tools/trust-domain-extensions/overview.html)

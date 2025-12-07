---
title: "Guest OS Image Setup"
description: "Download and configure guest OS images for dstack CVM deployment"
section: "dstack Installation"
stepNumber: 6
totalSteps: 6
lastUpdated: 2025-12-07
prerequisites:
  - vmm-service-setup
tags:
  - dstack
  - cvm
  - guest-os
  - vmm
  - image
difficulty: "intermediate"
estimatedTime: "30 minutes"
---

# Guest OS Image Setup

This tutorial guides you through setting up guest OS images for deploying Confidential Virtual Machines (CVMs) on your dstack infrastructure. Guest images contain the operating system, kernel, and firmware that run inside the TDX-protected environment.

## What You'll Configure

- **Guest OS images** - Pre-built Yocto-based images for CVMs
- **VMM image directory** - Proper organization for multiple image versions
- **Image verification** - Confirm VMM can access the images

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

- Completed [VMM Service Setup](/tutorial/vmm-service-setup)
- VMM service running (with web interface at http://localhost:9080)
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

## Step 5: Verify VMM Can Access Images

The VMM service should already be running from the earlier setup. Verify it can see the installed images.

### Check VMM Service Status

```bash
sudo systemctl status dstack-vmm
```

The service should be active and running.

### Verify Images via VMM Web Interface

Open the VMM Management Console in your browser:

```
http://localhost:9080
```

You should see the installed guest images listed in the interface.

### Verify Images via API

```bash
curl -s http://127.0.0.1:9080/api/images | jq .
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

## Step 6: Verify VMM Configuration

Ensure VMM is configured to use the correct image path. Check the configuration:

```bash
cat /etc/dstack/vmm.toml | grep -A5 "image"
```

The `image_path` should point to `/var/lib/dstack/images`.

If VMM isn't finding the images, verify the path in the configuration matches where you installed them.

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
3. Extract and verify image components
4. Verify VMM can access the images

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

Or via the VMM API:

```bash
curl -s http://127.0.0.1:9080/api/images | jq '.images[].name'
```

When deploying applications, specify which image version to use in the docker-compose.yml.

## Troubleshooting

### Images not appearing in VMM

Check the VMM logs for image loading errors:

```bash
sudo journalctl -u dstack-vmm -n 100 --no-pager | grep -i image
```

Common issues:

**Image directory not found:**
```bash
# Verify image directory exists and has correct permissions
ls -la /var/lib/dstack/images/
```

**Metadata.json missing or invalid:**
```bash
# Check if metadata exists
cat /var/lib/dstack/images/dstack-*/metadata.json
```

**VMM not configured for correct path:**
```bash
# Check VMM configuration
grep image_path /etc/dstack/vmm.toml
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

### VMM service not running

```bash
# Check service status
sudo systemctl status dstack-vmm

# View recent logs
sudo journalctl -u dstack-vmm -n 50

# Restart if needed
sudo systemctl restart dstack-vmm
```

## Verification Checklist

Before proceeding, verify you have:

- [ ] Created image directory structure
- [ ] Downloaded guest OS image
- [ ] Extracted image components (OVMF.fd, bzImage, initramfs, rootfs)
- [ ] Verified metadata.json exists and is valid
- [ ] Confirmed VMM service is running
- [ ] Verified VMM API shows the installed images

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

# Check VMM service
if sudo systemctl is-active --quiet dstack-vmm; then
    echo "✓ VMM service running"
else
    echo "✗ VMM service not running"
    exit 1
fi

# Check VMM API
if curl -s http://127.0.0.1:9080/api/images > /dev/null 2>&1; then
    echo "✓ VMM API responding"
else
    echo "✗ VMM API not responding"
    exit 1
fi

# Check images visible to VMM
IMAGE_COUNT=$(curl -s http://127.0.0.1:9080/api/images | jq '.images | length')
if [ "$IMAGE_COUNT" -gt 0 ]; then
    echo "✓ VMM found $IMAGE_COUNT image(s)"
else
    echo "✗ VMM found no images"
    exit 1
fi

echo ""
echo "Guest image setup verified successfully!"
```

## Understanding the Boot Process

When a CVM starts, the following sequence occurs:

```
1. VMM launches QEMU with TDX enabled
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

With guest images configured and VMM able to access them, you're ready to deploy your first application. The next tutorial covers deploying a Hello World application to verify your setup works correctly.

## Additional Resources

- [meta-dstack Repository](https://github.com/Dstack-TEE/meta-dstack)
- [dstack GitHub Repository](https://github.com/Dstack-TEE/dstack)
- [Yocto Project](https://www.yoctoproject.org/)
- [TDX Guest Architecture](https://www.intel.com/content/www/us/en/developer/tools/trust-domain-extensions/overview.html)

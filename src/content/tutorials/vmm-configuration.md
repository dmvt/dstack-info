---
title: "VMM Configuration"
description: "Configure the dstack Virtual Machine Monitor for your environment"
section: "dstack Installation"
stepNumber: 4
totalSteps: 5
lastUpdated: 2025-11-19
prerequisites:
  - clone-build-dstack-vmm
tags:
  - dstack
  - vmm
  - configuration
  - toml
difficulty: "intermediate"
estimatedTime: "15 minutes"
---

# VMM Configuration

This tutorial guides you through configuring the dstack Virtual Machine Monitor (VMM). The VMM uses a TOML configuration file to define server settings, VM resource limits, networking, and service endpoints.

## Configuration Overview

The VMM configuration file controls:

- **Server Settings** - Listen address, worker threads, logging
- **CVM Settings** - VM resource limits, QEMU paths, KMS/Gateway URLs
- **Networking** - VM network mode and IP settings
- **Services** - Gateway, authentication, supervisor, key provider

## Prerequisites

Before starting, ensure you have:

- Completed [Clone & Build dstack-vmm](/tutorial/clone-build-dstack-vmm)
- SSH access to your TDX-enabled server
- Root or sudo privileges for creating system directories

## Step 1: Create Configuration Directory

Create the dstack configuration directory:

```bash
sudo mkdir -p /etc/dstack
```

This directory will hold all dstack configuration files.

## Step 2: Create VMM Configuration File

Create the VMM configuration file with production-ready defaults:

```bash
sudo tee /etc/dstack/vmm.toml > /dev/null <<'EOF'
# dstack VMM Configuration
# See: https://dstack.info/tutorial/vmm-configuration

# Server settings
workers = 8
max_blocking = 64
ident = "dstack VMM"
temp_dir = "/tmp"
keep_alive = 10
log_level = "info"
address = "unix:/var/run/dstack/vmm.sock"
reuse = true
kms_url = "http://127.0.0.1:8081"
event_buffer_size = 20
node_name = ""

[cvm]
qemu_path = ""
kms_urls = ["http://127.0.0.1:8081"]
gateway_urls = ["http://127.0.0.1:8082"]
pccs_url = ""
docker_registry = ""
cid_start = 1000
cid_pool_size = 1000
max_allocable_vcpu = 16
max_allocable_memory_in_mb = 65536
qmp_socket = false
user = ""
use_mrconfigid = true
qemu_pci_hole64_size = 0
qemu_hotplug_off = false

[cvm.networking]
mode = "user"
net = "10.0.2.0/24"
dhcp_start = "10.0.2.10"
restrict = false

[cvm.port_mapping]
enabled = false
address = "127.0.0.1"
range = [
    { protocol = "tcp", from = 1, to = 20000 },
]

[cvm.auto_restart]
enabled = true
interval = 20

[cvm.gpu]
enabled = false
listing = []
exclude = []
include = []
allow_attach_all = false

[gateway]
base_domain = "localhost"
port = 8082
agent_port = 8090

[auth]
enabled = false
tokens = []

[supervisor]
exe = "/usr/local/bin/dstack-supervisor"
sock = "/var/run/dstack/supervisor.sock"
pid_file = "/var/run/dstack/supervisor.pid"
log_file = "/var/log/dstack/supervisor.log"
detached = false
auto_start = true

[host_api]
ident = "dstack VMM"
address = "vsock:2"
port = 10000

[key_provider]
enabled = true
address = "127.0.0.1"
port = 3443
EOF
```

## Step 3: Create Runtime Directories

Create directories for runtime files:

```bash
sudo mkdir -p /var/run/dstack
sudo mkdir -p /var/log/dstack
sudo mkdir -p /var/lib/dstack
```

Set appropriate permissions:

```bash
sudo chmod 755 /var/run/dstack
sudo chmod 755 /var/log/dstack
sudo chmod 755 /var/lib/dstack
```

## Step 4: Verify Configuration

Verify the configuration file exists and is readable:

```bash
cat /etc/dstack/vmm.toml
```

Check configuration syntax by attempting to start VMM (it will fail without KMS, but validates config):

```bash
dstack-vmm --config /etc/dstack/vmm.toml serve &
sleep 2
pkill -f dstack-vmm
```

## Configuration Reference

### Server Settings

| Setting | Description | Default |
|---------|-------------|---------|
| `workers` | Number of worker threads | 8 |
| `max_blocking` | Maximum blocking threads | 64 |
| `log_level` | Logging level (debug, info, warn, error) | info |
| `address` | Listen address (unix socket or TCP) | unix:/var/run/dstack/vmm.sock |
| `kms_url` | Key Management Service URL | http://127.0.0.1:8081 |

### CVM Settings

| Setting | Description | Default |
|---------|-------------|---------|
| `max_allocable_vcpu` | Maximum vCPUs across all VMs | 16 |
| `max_allocable_memory_in_mb` | Maximum memory in MB | 65536 |
| `cid_start` | Starting CID for VMs | 1000 |
| `cid_pool_size` | Number of available CIDs | 1000 |
| `kms_urls` | KMS URLs for VMs | ["http://127.0.0.1:8081"] |
| `gateway_urls` | Gateway URLs for VMs | ["http://127.0.0.1:8082"] |

### Networking Modes

The VMM supports two networking modes:

**User Mode (default):**
- Simple setup, no special privileges required
- Uses QEMU's built-in user networking
- Good for development and testing

**Passt Mode:**
- Better performance
- Requires passt binary installed
- Recommended for production

### Adjusting Resource Limits

Adjust these settings based on your server capabilities:

```toml
[cvm]
# For a server with 32 cores and 128GB RAM
max_allocable_vcpu = 28  # Reserve some for host
max_allocable_memory_in_mb = 110000  # ~107GB for VMs
```

### Enabling GPU Passthrough

To enable GPU passthrough for AI workloads:

```toml
[cvm.gpu]
enabled = true
listing = ["10de:2335"]  # NVIDIA GPU product IDs
allow_attach_all = true
```

**Note:** GPU passthrough requires IOMMU enabled in BIOS and proper VFIO setup.

## Ansible Automation

You can automate the configuration using Ansible.

### Run the Ansible playbook

```bash
cd ~/dstack-info/ansible
ansible-playbook -i inventory/hosts.yml playbooks/setup-vmm-config.yml
```

The playbook will:
1. Create /etc/dstack directory
2. Create vmm.toml configuration file
3. Create runtime directories
4. Set appropriate permissions

### Customizing with command-line variables

The playbook accepts configurable variables via `-e` flags:

| Variable | Description | Default |
|----------|-------------|---------|
| `vmm_workers` | Number of worker threads | 8 |
| `vmm_log_level` | Log level (debug, info, warn, error) | info |
| `cvm_max_vcpu` | Maximum vCPUs per CVM | 16 |
| `cvm_max_memory_mb` | Maximum memory per CVM in MB | 65536 |
| `vmm_kms_url` | KMS service URL | http://127.0.0.1:8081 |
| `cvm_cid_start` | Starting CID for CVMs | 1000 |
| `cvm_cid_pool_size` | Number of CIDs in pool | 1000 |

**Examples:**

```bash
# Custom resource limits for a high-capacity server
ansible-playbook -i inventory/hosts.yml playbooks/setup-vmm-config.yml \
  -e "cvm_max_vcpu=32" -e "cvm_max_memory_mb=131072"

# Enable debug logging for troubleshooting
ansible-playbook -i inventory/hosts.yml playbooks/setup-vmm-config.yml \
  -e "vmm_log_level=debug"

# Development configuration with minimal resources
ansible-playbook -i inventory/hosts.yml playbooks/setup-vmm-config.yml \
  -e "vmm_workers=4" -e "cvm_max_vcpu=4" -e "cvm_max_memory_mb=8192"
```

### Verify with Ansible

After running the setup playbook, verify the configuration:

```bash
cd ~/dstack-info/ansible
ansible-playbook -i inventory/hosts.yml playbooks/verify-vmm-config.yml
```

The verification playbook checks:
- Configuration file exists and is readable
- All runtime directories exist
- Configuration values are valid

## Customization Examples

### Development Configuration

For a development environment with reduced resources:

```toml
workers = 4
log_level = "debug"

[cvm]
max_allocable_vcpu = 4
max_allocable_memory_in_mb = 8192
```

### Production Configuration

For a production server with maximum resources:

```toml
workers = 16
log_level = "info"

[cvm]
max_allocable_vcpu = 48
max_allocable_memory_in_mb = 200000

[auth]
enabled = true
tokens = ["your-secret-token-here"]
```

### Custom Domain Configuration

When using a custom domain for the gateway:

```toml
[gateway]
base_domain = "dstack.yourdomain.com"
port = 8082
agent_port = 8090
```

## Troubleshooting

### Configuration file not found

If VMM reports configuration not found:

```bash
# Check file exists
ls -la /etc/dstack/vmm.toml

# Check permissions
stat /etc/dstack/vmm.toml
```

### TOML syntax errors

If VMM fails to parse configuration:

```bash
# Validate TOML syntax
cat /etc/dstack/vmm.toml | python3 -c "import toml, sys; toml.load(sys.stdin)"

# Or install toml-cli
pip install toml-cli
toml-cli /etc/dstack/vmm.toml
```

### Permission denied on socket

If VMM cannot create socket file:

```bash
# Check directory permissions
ls -la /var/run/dstack/

# Fix ownership
sudo chown $USER:$USER /var/run/dstack/
```

### Resource limit errors

If VMs fail to start due to resource limits:

```bash
# Check current resource usage
ps aux --sort=-%mem | head

# Adjust limits in vmm.toml
# Reduce max_allocable_vcpu or max_allocable_memory_in_mb
```

## Verification Checklist

Before proceeding, verify you have:

- [ ] Created /etc/dstack directory
- [ ] Created /etc/dstack/vmm.toml configuration file
- [ ] Created /var/run/dstack directory
- [ ] Created /var/log/dstack directory
- [ ] Created /var/lib/dstack directory
- [ ] Set appropriate permissions on all directories
- [ ] Reviewed and adjusted resource limits for your server

### Quick verification script

Run this script to verify your configuration:

```bash
#!/bin/bash
echo "Checking VMM configuration..."

# Check config file
if [ -f "/etc/dstack/vmm.toml" ]; then
    echo "✓ Configuration file exists"
else
    echo "✗ Configuration file not found"
    exit 1
fi

# Check directories
for dir in /var/run/dstack /var/log/dstack /var/lib/dstack; do
    if [ -d "$dir" ]; then
        echo "✓ Directory exists: $dir"
    else
        echo "✗ Directory not found: $dir"
        exit 1
    fi
done

# Check config is readable
if cat /etc/dstack/vmm.toml > /dev/null 2>&1; then
    echo "✓ Configuration file is readable"
else
    echo "✗ Configuration file is not readable"
    exit 1
fi

echo ""
echo "VMM configuration verified successfully!"
```

## Next Steps

With VMM configured, proceed to set up the systemd service:

- [VMM Service Setup](/tutorial/vmm-service-setup) - Create and start the VMM service

## Additional Resources

- [dstack GitHub Repository](https://github.com/Dstack-TEE/dstack)
- [TOML Specification](https://toml.io/en/)
- [QEMU Documentation](https://www.qemu.org/docs/master/)

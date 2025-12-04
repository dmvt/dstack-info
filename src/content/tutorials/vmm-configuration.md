---
title: "VMM Configuration"
description: "Configure the dstack Virtual Machine Monitor for your environment"
section: "dstack Installation"
stepNumber: 4
totalSteps: 5
lastUpdated: 2025-12-04
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

This tutorial guides you through configuring the dstack Virtual Machine Monitor (VMM) for **production use**. The VMM uses a TOML configuration file to define server settings, VM resource limits, networking, authentication, and service endpoints.

## Prerequisites

Before starting, ensure you have:

- Completed [Clone & Build dstack-vmm](/tutorial/clone-build-dstack-vmm)
- SSH access to your TDX-enabled server
- Root or sudo privileges
- Your gateway domain configured (e.g., `hosted.dstack.info`)

## Quick Start: Production Setup with Ansible

For most users, the recommended approach is to use the Ansible playbook which **automatically detects** your server's resources and configures VMM with production-ready settings.

### Step 1: Run the Ansible Playbook

```bash
cd ~/dstack-info/ansible
ansible-playbook -i inventory/hosts.yml playbooks/setup-vmm-config.yml \
  -e "cvm_network_mode=passt" \
  -e "gateway_base_domain=YOUR_DOMAIN" \
  -e "auth_enabled=true"
```

Replace `YOUR_DOMAIN` with your actual gateway domain (e.g., `hosted.dstack.info`).

The playbook will:
1. **Detect server resources** - CPU count and total memory
2. **Calculate optimal limits** - Reserve resources for host OS, allocate rest to CVMs
3. **Generate a secure auth token** - For API authentication
4. **Configure passt networking** - Better performance for production
5. **Create all directories** - Config, runtime, logs, data
6. **Set appropriate permissions**

### Step 2: Note Your Auth Token

The playbook generates a secure authentication token and displays it in the output:

```
Authentication:
  - Auth Enabled: true
  - Auth Token: <your-generated-token>

IMPORTANT: Save this token securely! You will need it to access the VMM API.
```

**Save this token** - you'll need it to interact with the VMM API.

### Step 3: Verify Configuration

```bash
ansible-playbook -i inventory/hosts.yml playbooks/verify-vmm-config.yml
```

---

## Ansible Configuration Options

### Required Production Settings

| Variable | Description | Recommended Value |
|----------|-------------|-------------------|
| `cvm_network_mode` | Networking mode | `passt` (production) |
| `gateway_base_domain` | Your gateway domain | Your domain |
| `auth_enabled` | Enable API authentication | `true` |

### Auto-Detected Settings

These are automatically calculated based on your server's resources:

| Variable | Description | Default |
|----------|-------------|---------|
| `cvm_max_vcpu` | Max vCPUs for all CVMs | Total vCPUs - 4 |
| `cvm_max_memory_mb` | Max memory for all CVMs (MB) | Total RAM - 16GB |
| `vmm_workers` | Worker threads | 1 per 8 vCPUs (min 4, max 32) |

### Optional Overrides

| Variable | Description | Default |
|----------|-------------|---------|
| `vmm_log_level` | Log level (debug, info, warn, error) | `info` |
| `host_reserved_vcpu` | vCPUs reserved for host OS | `4` |
| `host_reserved_mem_mb` | Memory reserved for host OS (MB) | `16384` |
| `auth_token` | Custom auth token (auto-generated if not set) | Auto-generated |
| `vmm_kms_url` | KMS service URL | `http://127.0.0.1:8081` |
| `cvm_cid_start` | Starting CID for CVMs | `1000` |
| `cvm_cid_pool_size` | Number of CIDs in pool | `1000` |
| `gateway_port` | Gateway port | `8082` |

### Example Commands

```bash
# Production setup (recommended)
ansible-playbook -i inventory/hosts.yml playbooks/setup-vmm-config.yml \
  -e "cvm_network_mode=passt" \
  -e "gateway_base_domain=hosted.dstack.info" \
  -e "auth_enabled=true"

# Production with custom auth token
ansible-playbook -i inventory/hosts.yml playbooks/setup-vmm-config.yml \
  -e "cvm_network_mode=passt" \
  -e "gateway_base_domain=hosted.dstack.info" \
  -e "auth_enabled=true" \
  -e "auth_token=your-custom-secure-token"

# Production with more host resources reserved
ansible-playbook -i inventory/hosts.yml playbooks/setup-vmm-config.yml \
  -e "cvm_network_mode=passt" \
  -e "gateway_base_domain=hosted.dstack.info" \
  -e "auth_enabled=true" \
  -e "host_reserved_vcpu=8" \
  -e "host_reserved_mem_mb=32768"

# Development setup (no auth, user networking)
ansible-playbook -i inventory/hosts.yml playbooks/setup-vmm-config.yml \
  -e "vmm_log_level=debug"
```

---

## Manual Configuration

If you prefer to configure VMM manually, follow these steps.

### Step 1: Connect to Your Server

```bash
ssh ubuntu@YOUR_SERVER_IP
```

### Step 2: Check Server Resources

```bash
# Check CPU cores
nproc

# Check total memory in MB
free -m | awk '/^Mem:/{print $2}'
```

Calculate your resource limits:
- **Max vCPUs**: Total cores - 4 (reserve for host)
- **Max Memory**: Total MB - 16384 (reserve 16GB for host)
- **Workers**: Total cores / 8 (minimum 4, maximum 32)

For example, on a 128-core, 1TB RAM server:
- Max vCPUs: 128 - 4 = **124**
- Max Memory: 1,007,000 - 16,384 = **990,616 MB**
- Workers: 128 / 8 = **16**

### Step 3: Generate an Auth Token

```bash
# Generate a secure random token
AUTH_TOKEN=$(openssl rand -hex 32)
echo "Your auth token: $AUTH_TOKEN"
echo "Save this token securely!"
```

### Step 4: Create Configuration Directory

```bash
sudo mkdir -p /etc/dstack
```

### Step 5: Create VMM Configuration File

Replace the placeholder values with your actual settings:

```bash
sudo tee /etc/dstack/vmm.toml > /dev/null <<'EOF'
# dstack VMM Configuration - Production
# See: https://dstack.info/tutorial/vmm-configuration

# Server settings
workers = 16                                    # Adjust based on your CPU count
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
max_allocable_vcpu = 124                        # Adjust: total cores - 4
max_allocable_memory_in_mb = 990616             # Adjust: total MB - 16384
qmp_socket = false
user = ""
use_mrconfigid = true
qemu_pci_hole64_size = 0
qemu_hotplug_off = false

[cvm.networking]
mode = "passt"                                  # Production: use passt

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
base_domain = "hosted.dstack.info"              # Your gateway domain
port = 8082
agent_port = 8090

[auth]
enabled = true                                  # Production: enable auth
tokens = ["YOUR_AUTH_TOKEN_HERE"]               # Replace with your token

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

**Important:** Replace `YOUR_AUTH_TOKEN_HERE` with the token you generated in Step 3.

### Step 6: Create Runtime Directories

```bash
sudo mkdir -p /var/run/dstack
sudo mkdir -p /var/log/dstack
sudo mkdir -p /var/lib/dstack
sudo chmod 755 /var/run/dstack /var/log/dstack /var/lib/dstack
```

### Step 7: Install passt (Required for Production)

```bash
sudo apt update
sudo apt install -y passt
```

### Step 8: Verify Configuration

```bash
# Check config file exists
cat /etc/dstack/vmm.toml

# Verify TOML syntax
python3 -c "import tomllib; tomllib.load(open('/etc/dstack/vmm.toml', 'rb'))"
```

---

## Configuration Reference

### Networking Modes

| Mode | Performance | Isolation | Setup | Recommended For |
|------|-------------|-----------|-------|-----------------|
| `passt` | Best | Good | Requires passt package | **Production** |
| `user` | Good | Good | None | Development/Testing |
| `host` | Best | None | None | Special cases only |

**Passt Mode (Production):**
```toml
[cvm.networking]
mode = "passt"
```

**User Mode (Development):**
```toml
[cvm.networking]
mode = "user"
net = "10.0.2.0/24"
dhcp_start = "10.0.2.10"
restrict = false
```

### Authentication

For production, always enable authentication:

```toml
[auth]
enabled = true
tokens = ["your-secure-token-here"]
```

You can specify multiple tokens for different clients:

```toml
[auth]
enabled = true
tokens = [
    "token-for-admin",
    "token-for-ci-cd",
    "token-for-monitoring"
]
```

### GPU Passthrough

To enable GPU passthrough for AI/ML workloads:

```toml
[cvm.gpu]
enabled = true
listing = ["10de:2335"]          # NVIDIA GPU product IDs
allow_attach_all = true
```

**Requirements:**
- IOMMU enabled in BIOS
- VFIO driver configured
- GPU not in use by host

---

## Troubleshooting

### Configuration file not found

```bash
ls -la /etc/dstack/vmm.toml
```

### TOML syntax errors

```bash
python3 -c "import tomllib; tomllib.load(open('/etc/dstack/vmm.toml', 'rb'))"
```

### Permission denied on socket

```bash
sudo ls -la /var/run/dstack/
sudo chmod 755 /var/run/dstack
```

### Passt not found

```bash
sudo apt update && sudo apt install -y passt
which passt
```

### Resource limit errors

Check current usage and adjust limits:

```bash
ps aux --sort=-%mem | head
# Then reduce max_allocable_vcpu or max_allocable_memory_in_mb
```

---

## Next Steps

With VMM configured, proceed to set up the systemd service:

- [VMM Service Setup](/tutorial/vmm-service-setup) - Create and start the VMM service

## Additional Resources

- [dstack GitHub Repository](https://github.com/Dstack-TEE/dstack)
- [TOML Specification](https://toml.io/en/)
- [passt Documentation](https://passt.top/)

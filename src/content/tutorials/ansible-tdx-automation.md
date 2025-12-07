---
title: "Appendix B: Ansible Setup for dstack"
description: "Set up Ansible automation for dstack server management"
section: "Host Setup"
stepNumber: null
totalSteps: null
isAppendix: true
lastUpdated: 2025-12-07
prerequisites:
  - tdx-bios-configuration
tags:
  - ansible
  - automation
  - infrastructure-as-code
difficulty: intermediate
estimatedTime: 15 minutes
---

# Ansible Setup for dstack

This appendix covers setting up Ansible for dstack automation. Once configured, you can run playbooks from any tutorial's "Quick Start with Ansible" section.

## Why Use Ansible?

**Benefits:**
- **Repeatable** - Identical process every time
- **Multi-server** - Manage multiple TDX hosts from one machine
- **Self-documenting** - Infrastructure as code
- **Error handling** - Clear messages with tutorial references

**When to use Ansible:**
- Managing multiple TDX servers
- CI/CD pipelines
- Automated deployment workflows
- Want faster setup than manual steps

**When to skip Ansible:**
- Single server, learning the process
- Prefer understanding each step manually

## Prerequisites

### 1. Ubuntu User on TDX Server

Ansible playbooks expect an `ubuntu` user with passwordless sudo. If you don't have this configured:

```bash
# SSH into your TDX server and run:

# Create ubuntu user (skip if exists)
sudo adduser ubuntu

# Add to sudo group
sudo usermod -aG sudo ubuntu

# Configure passwordless sudo
echo 'ubuntu ALL=(ALL) NOPASSWD:ALL' | sudo tee /etc/sudoers.d/ubuntu
sudo chmod 0440 /etc/sudoers.d/ubuntu

# Set up SSH access (copy your authorized_keys)
sudo mkdir -p /home/ubuntu/.ssh
sudo cp ~/.ssh/authorized_keys /home/ubuntu/.ssh/authorized_keys
sudo chown -R ubuntu:ubuntu /home/ubuntu/.ssh
sudo chmod 600 /home/ubuntu/.ssh/authorized_keys
```

Test from your local machine:
```bash
ssh ubuntu@YOUR_SERVER_IP sudo whoami
# Should output: root (without asking for password)
```

### 2. Install Ansible Locally

Install Ansible on your local machine (not the TDX server):

```bash
# Ubuntu/Debian
sudo apt update && sudo apt install ansible

# macOS
brew install ansible

# Verify installation
ansible --version
```

### 3. Clone dstack-info Repository

```bash
cd ~
git clone https://github.com/dmvt/dstack-info.git
cd dstack-info/ansible
```

## Configure Inventory

The inventory file tells Ansible which servers to manage.

### Step 1: Create Inventory File

```bash
cp inventory/hosts.example.yml inventory/hosts.yml
```

### Step 2: Add Your Server

Edit `inventory/hosts.yml`:

```yaml
all:
  children:
    dstack_servers:
      hosts:
        tdx-host:
          ansible_host: YOUR_SERVER_IP  # Replace with actual IP
          ansible_user: ubuntu
```

**For multiple servers:**

```yaml
all:
  children:
    dstack_servers:
      hosts:
        tdx-host-1:
          ansible_host: 192.168.1.100
          ansible_user: ubuntu
        tdx-host-2:
          ansible_host: 192.168.1.101
          ansible_user: ubuntu
```

> **Security note:** The inventory file (`hosts.yml`) is gitignored. Your server IPs stay private.

## Test Connection

Verify Ansible can connect to your server:

```bash
ansible all -m ping -i inventory/hosts.yml
```

**Expected output:**
```
tdx-host | SUCCESS => {
    "changed": false,
    "ping": "pong"
}
```

If you see an error, verify:
- Server IP is correct in inventory
- SSH key is configured for ubuntu user
- Ubuntu user has passwordless sudo

## Using Playbooks

Once setup is complete, you can run any playbook from the tutorials. All playbooks are in `~/dstack-info/ansible/playbooks/`.

**Example:**
```bash
# From ~/dstack-info/ansible directory
ansible-playbook -i inventory/hosts.yml playbooks/verify-tdx.yml
```

Each tutorial with an Ansible option includes the specific command to run.

## Troubleshooting

### SSH Connection Failed

```bash
# Test SSH manually
ssh ubuntu@YOUR_SERVER_IP

# Test with verbose output
ansible all -m ping -i inventory/hosts.yml -vvv
```

### Permission Denied

```bash
# Verify sudo access
ssh ubuntu@YOUR_SERVER_IP sudo whoami
# Should output: root
```

### Python Not Found

Add to your inventory under the host:
```yaml
ansible_python_interpreter: /usr/bin/python3
```

## Available Playbooks

| Playbook | Purpose |
|----------|---------|
| `setup-tdx-host.yml` | Install TDX software stack |
| `verify-tdx.yml` | Verify TDX & SGX are working |
| `setup-host-dependencies.yml` | Install build dependencies |
| `setup-rust-toolchain.yml` | Install Rust |
| `build-dstack-vmm.yml` | Build VMM from source |
| `setup-vmm-service.yml` | Configure VMM systemd service |

See the [Ansible README](https://github.com/dmvt/dstack-info/tree/main/ansible) for the complete list.

## Additional Resources

- [Ansible Documentation](https://docs.ansible.com/)
- [dstack-info Ansible Directory](https://github.com/dmvt/dstack-info/tree/main/ansible)

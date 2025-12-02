---
title: "Appendix B: Ansible TDX Automation Setup"
description: "Set up Ansible automation for TDX verification and future server deployments"
section: "Host Setup"
stepNumber: null
totalSteps: null
isAppendix: true
lastUpdated: 2025-11-01
prerequisites:
  - tdx-troubleshooting-next-steps
tags:
  - ansible
  - automation
  - tdx
  - verification
  - infrastructure-as-code
difficulty: intermediate
estimatedTime: 20 minutes
---

# Ansible TDX Automation Setup

This optional tutorial guides you through setting up Ansible automation for TDX verification. Once configured, you can verify TDX status across multiple servers with a single command, making it easy to manage TDX deployments at scale.

## Why Use Ansible for TDX?

**Benefits:**
- 🚀 **Quick verification** - Check TDX status on multiple servers in seconds
- 🔄 **Repeatable** - Identical verification process every time
- 📊 **Comprehensive** - 7-point check covering all TDX requirements
- 🛡️ **Error handling** - Clear messages referencing specific tutorials
- 📝 **Documentation** - Self-documenting infrastructure configuration

**When to use Ansible:**
- Managing multiple TDX servers
- CI/CD pipelines requiring TDX verification
- Automated deployment workflows
- Regular health checks and monitoring

**When to skip Ansible:**
- Single server, one-time setup
- Prefer manual verification
- Don't need automation

## Prerequisites

### 1. Set Up Ubuntu User on TDX Server

The Ansible playbook expects an `ubuntu` user with passwordless sudo. If you followed the previous tutorials, you should already have this configured. If not:

```bash
# SSH into your TDX server and run:

# Create ubuntu user
sudo adduser ubuntu

# Add to sudo group
sudo usermod -aG sudo ubuntu

# Configure passwordless sudo
echo 'ubuntu ALL=(ALL) NOPASSWD:ALL' | sudo tee /etc/sudoers.d/ubuntu
sudo chmod 0440 /etc/sudoers.d/ubuntu

# Set up SSH access
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

### 2. Install Ansible on Your Local Machine

Install Ansible on the machine where you'll run the playbooks (not the TDX server):

```bash
# On Ubuntu/Debian
sudo apt update && sudo apt install ansible

# On macOS
brew install ansible

# Verify installation
ansible --version
```

**Expected output:**
```
ansible [core 2.14.0]
  python version = 3.10.12
  ...
```

### 3. Clone dstack-info Repository

Clone the repository containing the Ansible playbooks:

```bash
cd ~
git clone https://github.com/dmvt/dstack-info.git
cd dstack-info/ansible
```

Verify the Ansible directory structure:

```bash
ls -la
```

You should see:
- `README.md` - Ansible documentation
- `playbooks/` - Directory containing playbooks
- `inventory/` - Directory for inventory files
- `group_vars/` - Directory for variable files

## Configure Ansible Inventory

The inventory file tells Ansible which servers to manage.

### Step 1: Create Inventory File

```bash
cp inventory/hosts.example.yml inventory/hosts.yml
```

### Step 2: Edit Inventory with Your Server Details

```bash
nano inventory/hosts.yml
# or
vim inventory/hosts.yml
```

### Step 3: Configure Your Server

Replace `YOUR_SERVER_IP` with your actual TDX server IP:

```yaml
all:
  children:
    dstack_servers:
      hosts:
        tdx-host:
          ansible_host: 192.168.1.100  # Replace with YOUR server IP
          ansible_user: ubuntu          # User with passwordless sudo
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

        tdx-host-3:
          ansible_host: 192.168.1.102
          ansible_user: ubuntu
```

**Security note:**
- The inventory file (`hosts.yml`) is excluded from git
- Your server IPs and configuration stay private
- Only the example file is version controlled

## Test Ansible Connection

Before running the verification playbook, test that Ansible can connect:

```bash
# Test SSH connectivity
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

## Run TDX Verification Playbook

### Syntax Check

Always start with a syntax check:

```bash
ansible-playbook --syntax-check playbooks/verify-tdx.yml
```

**Expected output:**
```
playbook: playbooks/verify-tdx.yml
```

### Dry Run (Check Mode)

Test what the playbook would do without making changes:

```bash
ansible-playbook --check playbooks/verify-tdx.yml -i inventory/hosts.yml
```

### Run Verification

Execute the full verification:

```bash
ansible-playbook playbooks/verify-tdx.yml -i inventory/hosts.yml
```

## Understanding the Verification Output

### Success Output

When TDX is fully enabled, you'll see:

```
PLAY [Verify Intel TDX Host Setup] *****************************************

TASK [Gathering Facts] *****************************************************
ok: [tdx-host]

TASK [Check if running Ubuntu 24.04 LTS] ***********************************
ok: [tdx-host] => {
    "msg": "✓ Running Ubuntu 24.04 LTS"
}

TASK [Check TDX CPU capability] ********************************************
ok: [tdx-host]

TASK [Report CPU supports TDX] *********************************************
ok: [tdx-host] => {
    "msg": "✓ CPU supports Intel TDX"
}

TASK [Check if TDX-enabled kernel is installed] ****************************
ok: [tdx-host]

TASK [Report TDX kernel is running] ****************************************
ok: [tdx-host] => {
    "msg": "✓ Running TDX-enabled kernel: 6.8.0-1028-intel"
}

TASK [Check kvm_intel module has tdx parameter] ****************************
ok: [tdx-host]

TASK [Read kvm_intel tdx parameter value] **********************************
ok: [tdx-host]

TASK [Check if TDX is enabled in kvm_intel] ********************************
ok: [tdx-host]

TASK [Report TDX is enabled in kvm_intel] **********************************
ok: [tdx-host] => {
    "msg": "✓ TDX enabled in kvm_intel module"
}

TASK [Check for TDX module initialization in dmesg] ************************
ok: [tdx-host]

TASK [Report TDX module initialized] ***************************************
ok: [tdx-host] => {
    "msg": "✓ TDX module (SEAM) initialized"
}

TASK [Check TME (Total Memory Encryption) status] **************************
ok: [tdx-host]

TASK [Check if TME is enabled] *********************************************
ok: [tdx-host]

TASK [Report TME is enabled] ***********************************************
ok: [tdx-host] => {
    "msg": "✓ TME (Total Memory Encryption) enabled"
}

TASK [Final TDX verification summary] **************************************
ok: [tdx-host] => {
    "msg": "

═══════════════════════════════════════════════════════════
  ✓ Intel TDX is FULLY ENABLED and VERIFIED
═══════════════════════════════════════════════════════════

Host: fervent-heron
OS: Ubuntu 24.04
Kernel: 6.8.0-1028-intel
CPU: TDX-capable
TDX Module: Initialized
TME: Enabled

Your system is ready for TDX-based confidential computing!

Next steps:
- Proceed to Phase 1.2: Domain & DNS Setup
- Or continue with Phase 2: dstack VMM Installation

See: https://dstack.info/
═══════════════════════════════════════════════════════════
"
}

PLAY RECAP *****************************************************************
tdx-host                   : ok=16   changed=0    unreachable=0    failed=0
```

### Failure Output with Helpful Guidance

If TDX is not enabled, the playbook provides specific guidance:

```
TASK [Fail if TDX not enabled] ********************************************
fatal: [tdx-host]: FAILED! => {
    "msg": "✗ TDX is NOT enabled (kvm_intel tdx parameter = N).

TDX hardware features must be enabled in BIOS.

See tutorial: TDX BIOS Configuration
https://dstack.info/tutorial/tdx-bios-configuration

Required BIOS settings:
- TME (Total Memory Encryption): Enabled
- TME Bypass: Disabled
- TDX: Enabled
- Software Guard Extensions (SGX): Enabled"
}
```

## What the Playbook Checks

The verification playbook performs 7 comprehensive checks:

1. **✓ Operating System** - Ubuntu 24.04 LTS
2. **✓ CPU Capability** - TDX support in `/proc/cpuinfo`
3. **✓ Kernel Version** - TDX-enabled Intel kernel (6.8.0-*-intel)
4. **✓ KVM Module** - `kvm_intel` tdx parameter exists
5. **✓ TDX Status** - `kvm_intel` tdx parameter = Y (enabled)
6. **✓ TDX Module** - SEAM module initialized in dmesg
7. **✓ TME Status** - Total Memory Encryption enabled

Each check includes:
- Clear success messages
- Helpful error messages with tutorial links
- Specific remediation steps
- Appropriate exit codes

## Troubleshooting

### SSH Connection Failed

```bash
# Test SSH manually
ssh ubuntu@YOUR_SERVER_IP

# Verify inventory
ansible-inventory -i inventory/hosts.yml --list

# Test with verbose output
ansible all -m ping -i inventory/hosts.yml -vvv
```

### Permission Denied Errors

```bash
# Verify sudo access
ssh ubuntu@YOUR_SERVER_IP sudo whoami
# Should output: root

# Check sudoers configuration
ssh ubuntu@YOUR_SERVER_IP sudo cat /etc/sudoers.d/ubuntu
```

### Python Not Found

If you see "Python interpreter not found":

```bash
# Add to inventory file under the host:
ansible_python_interpreter: /usr/bin/python3
```

### Playbook Syntax Errors

```bash
# Install ansible-lint for detailed validation
pip install ansible-lint

# Run lint
ansible-lint playbooks/verify-tdx.yml
```

## Best Practices

### 1. Test Before Production

Always run with `--check` first:

```bash
ansible-playbook --check playbooks/verify-tdx.yml -i inventory/hosts.yml
```

### 2. Version Control Your Inventory

Create a git repository for your inventory (separate from dstack-info):

```bash
mkdir ~/ansible-inventory
cd ~/ansible-inventory
git init
cp ~/dstack-info/ansible/inventory/hosts.yml .
git add hosts.yml
git commit -m "Initial TDX inventory"
```

**Security:** Never commit sensitive data. Use Ansible Vault for secrets.

### 3. Use Ansible Vault for Sensitive Data

If you need to store sensitive variables:

```bash
ansible-vault create group_vars/all.yml
# Enter password when prompted
```

### 4. Verify Idempotence

Run the playbook twice to ensure it's idempotent:

```bash
ansible-playbook playbooks/verify-tdx.yml -i inventory/hosts.yml
ansible-playbook playbooks/verify-tdx.yml -i inventory/hosts.yml
```

Both runs should show identical results (no changes).

## Next Steps

**TDX Setup Complete!** ✅

You've now:
- ✅ Verified your hardware supports TDX
- ✅ Installed TDX software stack
- ✅ Enabled TDX in BIOS
- ✅ Set up Ansible automation

**What's next:**

1. **Phase 1.2: Domain & DNS Setup** - Configure your domain for dstack
2. **Phase 1.3: Blockchain Wallet Setup** - Set up wallet for KMS deployment
3. **Phase 2: dstack VMM Installation** - Build and deploy the Virtual Machine Manager

**Using Ansible for future phases:**

As you progress through dstack installation, additional Ansible playbooks will be available for:
- System dependencies installation
- Rust toolchain setup
- dstack component builds
- Service configuration
- End-to-end deployment automation

Continue to the tutorials at **https://dstack.info/**

## Additional Resources

- **Ansible Documentation:** https://docs.ansible.com/
- **Ansible Best Practices:** https://docs.ansible.com/ansible/latest/user_guide/playbooks_best_practices.html
- **dstack Repository:** https://github.com/Dstack-TEE/dstack
- **Intel TDX Guide:** https://cc-enabling.trustedservices.intel.com/intel-tdx-enabling-guide/

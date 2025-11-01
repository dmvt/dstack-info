---
title: "TDX Status Verification"
description: "Check TDX status and understand what BIOS configuration is needed"
section: "Host Setup"
stepNumber: 4
totalSteps: 6
prerequisites:
    - "Completed Part 3: TDX Kernel Installation"
    - "Server rebooted successfully"
tags:
    - "tdx"
    - "verification"
    - "status"
    - "troubleshooting"
difficulty: "intermediate"
estimatedTime: "10 minutes"
lastUpdated: 2025-10-31
---

# TDX Status Verification

This tutorial covers verifying that the TDX kernel loaded successfully and checking the TDX status to determine what BIOS configuration is needed.

## Step 7: Verify TDX Kernel Loaded

After reboot, SSH back into the server and verify the TDX kernel is running:

```bash
uname -r
```

**Expected output:**

```
6.8.0-1028-intel
```

✓ Success! You're now running the TDX-enabled Intel kernel.

## Step 8: Check TDX Status

Now let's check if TDX is enabled in the system.

### Check dmesg for TDX Messages

```bash
dmesg | grep -i tdx
```

**If the TDX Module (SEAM) is enabled (after BIOS config), you should see:**

```
[  XXX.XXXXXX] virt/tdx: TDX module: attributes 0x0, vendor_id 0x8086, major_version 1, minor_version 5, build_date 20240725, build_num 784
[  XXX.XXXXXX] virt/tdx: module initialized
```

**If TDX is NOT enabled (before BIOS config), output will be empty.**

### Check TDX Kernel Module

```bash
ls -la /sys/module/kvm_intel/parameters/ | grep tdx
```

**Expected output:**

```
-r--r--r-- 1 root root 4096 Oct 31 19:04 tdx
```

Check the TDX parameter value:

```bash
cat /sys/module/kvm_intel/parameters/tdx
```

**Output:**

-   `N` = TDX is NOT enabled (BIOS configuration needed)
-   `Y` = TDX is enabled and ready to use

### Check TME (Total Memory Encryption)

TDX requires TME (Total Memory Encryption) to be enabled in BIOS:

```bash
dmesg | grep -i tme
```

**If TME is NOT enabled:**

```
[    0.000000] x86/tme: not enabled by BIOS
```

**If TME is enabled:**

```
[    0.000000] x86/tme: enabled by BIOS
```

## Automated Verification with Ansible

Once you've manually verified TDX is enabled, you can use the Ansible playbook to automate future verification checks.

### Prerequisites

Install Ansible on your local machine:

```bash
# On Ubuntu/Debian
sudo apt update && sudo apt install ansible

# On macOS
brew install ansible

# Verify installation
ansible --version
```

### Configure Inventory

Create your Ansible inventory file:

```bash
cd ansible
cp inventory/hosts.example.yml inventory/hosts.yml
```

Edit `inventory/hosts.yml` with your server details:

```yaml
all:
  children:
    dstack_servers:
      hosts:
        tdx-host:
          ansible_host: 173.231.234.133  # Your server IP
          ansible_user: ubuntu            # Your SSH user
```

### Run TDX Verification Playbook

The playbook performs comprehensive TDX verification:

```bash
# From the ansible directory
cd ansible

# Syntax check
ansible-playbook --syntax-check playbooks/verify-tdx.yml

# Dry run (check mode)
ansible-playbook --check playbooks/verify-tdx.yml -i inventory/hosts.yml

# Run verification
ansible-playbook playbooks/verify-tdx.yml -i inventory/hosts.yml
```

### What the Playbook Checks

The Ansible playbook verifies:

1. **Operating System:** Ubuntu 24.04 LTS
2. **CPU Capability:** TDX support in `/proc/cpuinfo`
3. **Kernel Version:** TDX-enabled Intel kernel (6.8.0-*-intel)
4. **KVM Module:** `kvm_intel` tdx parameter exists
5. **TDX Status:** `kvm_intel` tdx parameter = Y (enabled)
6. **TDX Module:** SEAM module initialized in dmesg
7. **TME Status:** Total Memory Encryption enabled

### Expected Output

**If TDX is fully enabled:**

```
TASK [Final TDX verification summary] *************************************
ok: [tdx-host] => {
    "msg": [
        "",
        "═══════════════════════════════════════════════════════════",
        "  ✓ Intel TDX is FULLY ENABLED and VERIFIED",
        "═══════════════════════════════════════════════════════════",
        "",
        "Host: tdx-host",
        "OS: Ubuntu 24.04",
        "Kernel: 6.8.0-1028-intel",
        "CPU: TDX-capable",
        "TDX Module: Initialized",
        "TME: Enabled",
        "",
        "Your system is ready for TDX-based confidential computing!",
        "",
        "Next steps:",
        "- Proceed to Phase 1.2: Domain & DNS Setup",
        "- Or continue with Phase 2: dstack VMM Installation",
        "",
        "See: https://dstack.info/",
        "═══════════════════════════════════════════════════════════"
    ]
}
```

**If TDX is not enabled:**

The playbook will fail with a clear error message and reference the relevant tutorial to fix the issue.

Example:

```
TASK [Fail if TDX not enabled] ********************************************
fatal: [tdx-host]: FAILED! => {
    "msg": "✗ TDX is NOT enabled (kvm_intel tdx parameter = N).\n\nTDX hardware features must be enabled in BIOS.\n\nSee tutorial: TDX BIOS Configuration\nhttps://dstack.info/tutorial/tdx-bios-configuration\n\nRequired BIOS settings:\n- TME (Total Memory Encryption): Enabled\n- TME Bypass: Disabled\n- TDX: Enabled\n- Software Guard Extensions (SGX): Enabled"
}
```

### Troubleshooting Ansible Issues

**SSH Connection Failed:**
```bash
# Test SSH access manually
ssh ubuntu@173.231.234.133

# Verify inventory settings
ansible-inventory -i inventory/hosts.yml --list
```

**Permission Denied:**
```bash
# Ensure your SSH user has sudo privileges
ssh ubuntu@173.231.234.133 sudo whoami
```

**Playbook Syntax Errors:**
```bash
# Run ansible-lint for detailed validation
ansible-lint playbooks/verify-tdx.yml
```

## Next Steps

Continue to **Part 5: TDX BIOS Configuration** to enable TDX hardware features in BIOS and complete the setup.

**After completing TDX setup, use the Ansible playbook for quick verification on any future server deployments!**

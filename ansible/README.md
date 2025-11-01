# dstack Ansible Automation

This directory contains Ansible playbooks and roles for automating dstack deployment and verification.

## Overview

The Ansible automation in this repository serves two purposes:

1. **Phase 1 (TDX Enablement):** Verification playbooks that check if TDX is properly enabled
2. **Phase 2+ (Infrastructure):** Automation playbooks that deploy dstack components (VMM, KMS, Gateway)

## Directory Structure

```
ansible/
├── README.md                    # This file
├── playbooks/
│   ├── verify-tdx.yml          # Verify TDX host is properly configured (Phase 1.1)
│   └── verify-dns.yml          # Verify DNS configuration for dstack (Phase 1.2)
├── inventory/
│   └── hosts.example.yml       # Example inventory template
└── group_vars/
    └── all.example.yml         # Example variables template
```

## Prerequisites

- Ansible 2.14 or higher
- Python 3.8 or higher
- SSH access to target server
- Ansible collections:
  - `ansible.builtin`
  - `ansible.posix`

## Installation

```bash
# Install Ansible
sudo apt install ansible

# Verify installation
ansible --version

# Clone this repository
git clone https://github.com/dmvt/dstack-info.git
cd dstack-info/ansible
```

## Configuration

### 1. Create Inventory File

Copy the example inventory and customize:

```bash
cp inventory/hosts.example.yml inventory/hosts.yml
```

Edit `inventory/hosts.yml` with your server details:

```yaml
all:
  children:
    dstack_servers:
      hosts:
        tdx-host:
          ansible_host: YOUR_SERVER_IP
          ansible_user: YOUR_SSH_USER
```

### 2. Create Variables File

Copy the example variables and customize:

```bash
cp group_vars/all.example.yml group_vars/all.yml
```

Edit `group_vars/all.yml` with your configuration.

## Usage

### Phase 1.1: Verify TDX Enablement

After manually enabling TDX following the tutorials, verify it's working:

```bash
# Syntax check
ansible-playbook --syntax-check playbooks/verify-tdx.yml

# Dry run
ansible-playbook --check playbooks/verify-tdx.yml -i inventory/hosts.yml

# Run verification
ansible-playbook playbooks/verify-tdx.yml -i inventory/hosts.yml
```

**Expected output:**
- ✓ All checks pass
- ✓ Exit code 0
- ✓ Clear confirmation that TDX is enabled

**If verification fails:**
- Playbook will provide specific error messages
- Error messages reference the relevant tutorial sections
- Follow the referenced tutorials to fix the issue

### Phase 1.2: Verify DNS Configuration

After configuring DNS in Cloudflare, verify it's working:

```bash
# Syntax check
ansible-playbook --syntax-check playbooks/verify-dns.yml

# Run verification (requires variables)
ansible-playbook playbooks/verify-dns.yml \
  -e "domain=yourdomain.com" \
  -e "dstack_subdomain=dstack" \
  -e "server_ip=173.231.234.133"

# Or define variables in group_vars/all.yml and run:
ansible-playbook playbooks/verify-dns.yml
```

**Expected output:**
- ✓ Base subdomain resolves correctly
- ✓ Wildcard DNS resolves correctly
- ✓ Multiple DNS resolvers return consistent results
- ✓ Exit code 0

**If verification fails:**
- Check DNS records in Cloudflare dashboard
- Wait for DNS propagation (up to 48 hours)
- Verify nameservers point to Cloudflare
- See [DNS Configuration Tutorial](https://dstack.info/tutorial/dns-configuration)

## Testing

All playbooks should be tested using:

```bash
# 1. Syntax check
ansible-playbook --syntax-check playbooks/PLAYBOOK_NAME.yml

# 2. Ansible-lint
ansible-lint playbooks/PLAYBOOK_NAME.yml

# 3. Dry run (check mode)
ansible-playbook --check playbooks/PLAYBOOK_NAME.yml -i inventory/hosts.yml

# 4. Functional test
ansible-playbook playbooks/PLAYBOOK_NAME.yml -i inventory/hosts.yml

# 5. Idempotence test (run twice, verify no changes on second run)
ansible-playbook playbooks/PLAYBOOK_NAME.yml -i inventory/hosts.yml
ansible-playbook playbooks/PLAYBOOK_NAME.yml -i inventory/hosts.yml
```

## Playbook Documentation

### verify-tdx.yml

**Purpose:** Verify Intel TDX is properly enabled on the host system

**What it checks:**
- TDX CPU capability (`/proc/cpuinfo`)
- TDX firmware enablement (SEAM module)
- TDX kernel modules loaded (`kvm_intel`, `tdx_guest`)
- Attestation services (if applicable)

**Usage:** See [TDX Status Verification Tutorial](https://dstack.info/tutorial/tdx-status-verification)

**Exit codes:**
- `0` - TDX fully enabled and verified
- `1` - TDX not enabled or verification failed

### verify-dns.yml

**Purpose:** Verify DNS configuration for dstack gateway

**What it checks:**
- Base subdomain resolution (`dstack.yourdomain.com`)
- Wildcard DNS resolution (`*.dstack.yourdomain.com`)
- Multiple test subdomains (test, app, example)
- Consistency across DNS resolvers (Cloudflare, Google)
- CAA records (informational only)

**Required variables:**
- `domain` - Your domain name (e.g., `yourdomain.com`)
- `dstack_subdomain` - Subdomain for dstack (e.g., `dstack`)
- `server_ip` - IP address of dstack server (e.g., `173.231.234.133`)

**Usage:** See [DNS Configuration Tutorial](https://dstack.info/tutorial/dns-configuration)

**Exit codes:**
- `0` - DNS fully configured and verified
- `1` - DNS not configured or verification failed

## Troubleshooting

### Common Issues

**1. "TDX not supported by CPU"**
- Solution: See [TDX Hardware Verification](https://dstack.info/tutorial/tdx-hardware-verification)
- Your CPU may not support TDX
- Verify on Intel ARK: https://ark.intel.com

**2. "TDX firmware not enabled"**
- Solution: See [TDX BIOS Configuration](https://dstack.info/tutorial/tdx-bios-configuration)
- Enable TDX in BIOS settings
- Enable SEAM module

**3. "TDX kernel modules not loaded"**
- Solution: See [TDX Kernel Installation](https://dstack.info/tutorial/tdx-kernel-installation)
- Install Ubuntu's TDX-enabled kernel
- Verify kernel parameters

**4. SSH connection issues**
- Verify `ansible_host` in inventory
- Verify `ansible_user` has SSH access
- Test: `ssh USER@HOST`

**5. Permission denied errors**
- Most tasks require `become: yes` (sudo)
- Verify user has sudo privileges
- Test: `ssh USER@HOST sudo whoami`

## Contributing

When adding new playbooks:

1. Follow Ansible best practices
2. Test thoroughly (syntax, lint, dry-run, functional, idempotence)
3. Add comprehensive documentation
4. Include helpful error messages that reference tutorials
5. Update this README with playbook documentation

## Resources

- **Ansible Documentation:** https://docs.ansible.com/
- **dstack Tutorials:** https://dstack.info/
- **dstack GitHub:** https://github.com/Dstack-TEE/dstack
- **Intel TDX Guide:** https://cc-enabling.trustedservices.intel.com/intel-tdx-enabling-guide/

## License

Same as dstack project license.

# TDX Software Installation via Ansible

**Status:** IMPLEMENTED
**Author:** Claude (with Dan Matthews)
**Created:** 2025-12-07
**Last Updated:** 2025-12-07

## Overview

This spec defines an Ansible playbook to automate the TDX software installation process documented in `tdx-software-installation.md`. The playbook will clone Canonical's TDX repository, configure attestation settings, run the TDX host setup script, verify kernel installation, and trigger a reboot (only if changes were made).

This contributes to the broader goal of having every tutorial step automatable via Ansible, enabling both manual learning and automated deployment paths.

## Requirements

### Must Have
- [x] Create `setup-tdx-host.yml` playbook that:
  - [x] Clones Canonical TDX repository to `~/tdx`
  - [x] Enables attestation in `setup-tdx-config` (`TDX_SETUP_ATTESTATION=1`)
  - [x] Runs `setup-tdx-host.sh` script
  - [x] Verifies Intel kernel was installed (`/boot/vmlinuz*intel` exists)
  - [x] Verifies GRUB configuration (`/etc/default/grub.d/99-tdx-kernel.cfg` exists)
  - [x] Triggers reboot only if changes were made
- [x] Playbook is idempotent (safe to run multiple times)
- [x] Update `ansible/README.md` with playbook documentation
- [x] Update tutorial to reference Ansible quick start option

### Should Have
- [x] Register a handler for reboot to consolidate reboot logic
- [x] Add pre-flight check for Ubuntu 24.04 LTS
- [x] Add pre-flight check that BIOS configuration appears complete (TDX CPU flags present)
- [x] Support configurable attestation setting via variable (default: enabled)

### Must NOT Have
- Post-reboot verification (that's `verify-tdx.yml`'s job)
- Speedrun/combined playbook (out of scope per discussion)
- BIOS configuration (cannot be automated)

## Non-Requirements

- **BIOS configuration** - Cannot be automated; user must configure manually
- **Post-reboot verification** - Handled by existing `verify-tdx.yml` playbook
- **User creation** - Assume `ubuntu` user already exists with SSH access (Ansible requires this)
- **Speedrun playbook** - Will be a separate spec later

## Design

### Architecture

The playbook fits into the existing Host Setup automation:

```
Manual BIOS Config → setup-tdx-host.yml → [REBOOT] → verify-tdx.yml
                           │
                           ├── Clone Canonical TDX repo
                           ├── Configure attestation
                           ├── Run setup-tdx-host.sh
                           ├── Verify kernel installed
                           └── Trigger reboot (if changed)
```

### Components

#### 1. Playbook: `setup-tdx-host.yml`

**Location:** `ansible/playbooks/setup-tdx-host.yml`

**Structure:**
```yaml
---
# Setup TDX Host Software Stack
# Corresponds to: tdx-software-installation tutorial
#
# Prerequisites:
#   - BIOS configured for TDX and SGX (manual step)
#   - Ubuntu 24.04 LTS freshly installed
#   - SSH access as 'ubuntu' user with sudo
#
# Usage:
#   ansible-playbook playbooks/setup-tdx-host.yml -i inventory/hosts.yml
#
# After this playbook completes and the system reboots:
#   ansible-playbook playbooks/verify-tdx.yml -i inventory/hosts.yml

- name: Setup TDX Host Software Stack
  hosts: dstack_servers
  become: yes

  vars:
    tdx_repo_url: "https://github.com/canonical/tdx.git"
    tdx_repo_version: "3.3"  # Pinned tag for reproducibility
    tdx_repo_dest: "/home/{{ ansible_user }}/tdx"
    tdx_enable_attestation: true

  tasks:
    # 1. Early exit check - if TDX kernel running, do nothing
    # 2. Pre-flight checks (Ubuntu version, etc.)
    # 3. Clone repository
    # 4. Configure attestation
    # 5. Run setup script
    # 6. Verify installation
    # 7. Reboot to TDX kernel
```

#### 2. Key Tasks

**Early Exit Check (First Task):**
```yaml
- name: Check if already running TDX kernel
  command: uname -r
  register: current_kernel
  changed_when: false

- name: Set TDX already configured fact
  set_fact:
    tdx_already_configured: "{{ 'intel' in current_kernel.stdout }}"

- name: Report TDX already configured
  debug:
    msg:
      - "✓ TDX kernel already running: {{ current_kernel.stdout }}"
      - "  No action needed. System is already configured."
      - "  Run verify-tdx.yml to confirm TDX is working."
  when: tdx_already_configured

- name: End play if TDX already configured
  meta: end_play
  when: tdx_already_configured
```

**Pre-flight Checks (only runs if not already configured):**
- Verify Ubuntu 24.04 LTS
- Check TDX CPU capability (optional warning if not present)

**Clone Repository:**
```yaml
- name: Clone Canonical TDX repository
  git:
    repo: "{{ tdx_repo_url }}"
    dest: "{{ tdx_repo_dest }}"
    version: "{{ tdx_repo_version }}"
    force: no
  become_user: "{{ ansible_user }}"
```

**Configure Attestation:**
```yaml
- name: Enable attestation in TDX config
  lineinfile:
    path: "{{ tdx_repo_dest }}/setup-tdx-config"
    regexp: '^TDX_SETUP_ATTESTATION='
    line: 'TDX_SETUP_ATTESTATION=1'
  when: tdx_enable_attestation
```

**Run Setup Script:**
```yaml
- name: Run TDX host setup script
  command: ./setup-tdx-host.sh
  args:
    chdir: "{{ tdx_repo_dest }}"
  register: tdx_setup_result
  changed_when: "'linux-image-intel' in tdx_setup_result.stdout"
  notify: Reboot for TDX kernel
```

**Verify Installation:**
```yaml
- name: Verify Intel kernel installed
  find:
    paths: /boot
    patterns: 'vmlinuz-*-intel'
  register: intel_kernel
  failed_when: intel_kernel.files | length == 0
```

**Reboot Handler:**
```yaml
handlers:
  - name: Reboot for TDX kernel
    reboot:
      msg: "Rebooting to load TDX-enabled kernel"
      reboot_timeout: 300
```

Note: No conditional needed on the handler - if we reach this point (didn't early-exit), we need to reboot. The handler is only notified when the setup script makes changes.

### Idempotency Strategy

The playbook achieves idempotency through an **early exit pattern**:

1. **First task**: Check if already running Intel TDX kernel (`uname -r` contains `intel`)
2. **If TDX kernel running**: Skip ALL remaining tasks, report "already configured"
3. **If not running TDX kernel**: Proceed with clone, configure, setup, verify, reboot

This means:
- Running the playbook on an already-configured system does **nothing** (no git clone, no script execution)
- The playbook is safe to include in larger automation without side effects
- Clear messaging tells the user the system is already set up

### Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `tdx_repo_url` | `https://github.com/canonical/tdx.git` | Canonical TDX repository URL |
| `tdx_repo_version` | `3.3` | Git tag to clone (pinned for reproducibility) |
| `tdx_repo_dest` | `/home/{{ ansible_user }}/tdx` | Clone destination |
| `tdx_enable_attestation` | `true` | Enable attestation components |

### Error Handling

| Scenario | Handling |
|----------|----------|
| Already running Intel kernel | Early exit with success message (no tasks run) |
| Clone fails (network) | Task fails with clear error message |
| Setup script fails | Task fails, stdout captured for debugging |
| Kernel not installed after script | Task fails with verification error |

## Open Questions

- [x] Should ubuntu user setup be included?
  - **Resolved:** No - assume Ansible can already connect (SSH access prerequisite)
- [x] Should we pin a specific TDX repo commit/tag for reproducibility?
  - **Resolved:** Yes - pin to tag `3.3` (latest stable release, Jun 2025)

## Alternatives Considered

### Alternative 1: Direct package installation instead of Canonical script
**Rejected because:** The Canonical script handles PPA addition, package dependencies, GRUB configuration, and group membership. Replicating this logic would be fragile and require ongoing maintenance as Canonical updates their process.

### Alternative 2: Include user setup in playbook
**Rejected because:** Ansible requires SSH access to run. If we can run Ansible, the user already exists. Including user setup creates chicken-and-egg complexity.

### Alternative 3: Combine with verify-tdx.yml
**Rejected because:** Verification must happen after reboot. Combining them would require complex wait_for_connection logic and obscure the two-phase nature of TDX setup.

## Traceability

*Filled in during implementation*

| Requirement | Implementation | Tests |
|-------------|----------------|-------|
| Clone TDX repo | `setup-tdx-host.yml` git task | Manual verification |
| Enable attestation | `setup-tdx-host.yml` lineinfile task | Manual verification |
| Run setup script | `setup-tdx-host.yml` command task | Manual verification |
| Verify kernel | `setup-tdx-host.yml` find task | Manual verification |
| Conditional reboot | `setup-tdx-host.yml` handler | Manual verification |
| Idempotency | All tasks use idempotent modules | Run playbook twice |
| README update | `ansible/README.md` | Visual inspection |

## Implementation Plan

1. Create `ansible/playbooks/setup-tdx-host.yml` with all tasks
2. Test on fresh Ubuntu 24.04 install (after BIOS config)
3. Run playbook twice to verify idempotency
4. Update `ansible/README.md` with playbook documentation
5. Update `tdx-software-installation.md` to include Ansible quick start
6. Commit and deploy

## Changelog

| Date | Author | Changes |
|------|--------|---------|
| 2025-12-07 | Claude | Initial draft |

# Fix Tutorial and Ansible Discrepancies

**Status:** DRAFT
**Author:** Claude
**Created:** 2025-12-13
**Last Updated:** 2025-12-13

## Overview

This spec addresses inconsistencies between the Ansible playbooks and manual tutorials discovered during a comprehensive audit. These discrepancies can cause deployment failures, confusion for users, and unreliable CVM deployments. The goal is to ensure the Quick Start Ansible deployment works reliably from a fresh OS install.

## Requirements

### Must Have

- [ ] **R1:** Fix `deploy-kms-cvm.yml` variable injection - playbook must receive `kms_domain` and `docker_image` from `quick-start.yml`
- [ ] **R2:** Fix `build-kms.yml` RPC endpoint - change from rate-limited Alchemy demo to PublicNode
- [ ] **R3:** Ensure all playbooks that need configuration load `vars/quick-start.yml` via `vars_files`
- [ ] **R4:** Update `guest-image-setup.md` tutorial to reference version 0.5.5 (not 0.4.0)
- [ ] **R5:** Add missing verification playbooks referenced in tutorials (`verify-gramine-key-provider.yml`)
- [ ] **R6:** Ensure consistent RPC endpoint across all files (`https://ethereum-sepolia.publicnode.com`)

### Should Have

- [ ] **R7:** Add QCNL config documentation to `gramine-key-provider.md` tutorial (matches what playbook creates)
- [ ] **R8:** Improve error messages in `deploy-contracts-local.yml` for missing dstack repo
- [ ] **R9:** Add pre-flight check in `site.yml` to validate all required variables before starting deployment
- [ ] **R10:** Create end-to-end test script that validates entire deployment from fresh OS

### Must NOT Have

- Breaking changes to existing working deployments
- Changes to the fundamental architecture
- New features unrelated to fixing discrepancies

## Non-Requirements

- Refactoring playbook structure
- Adding new deployment phases
- Changing the overall Quick Start workflow
- Performance optimizations

## Design

### Architecture

No architectural changes. This is a consistency and bug-fix effort across existing files.

### Components to Modify

#### Critical Fixes (Blocking Deployment)

**1. `ansible/playbooks/deploy-kms-cvm.yml`**

Current problem: Requires `kms_domain` and `docker_image` but doesn't load vars file.

Fix: Add `vars_files` section:

```yaml
- name: Deploy dstack KMS as CVM
  hosts: dstack_servers
  become: false

  vars_files:
    - ../vars/quick-start.yml
    - ../vars/contract-addresses.yml  # Optional, may not exist

  vars:
    kms_rpc_port: 9100
    # ... rest of vars
    # Override docker_image to use local registry
    docker_image: "{{ registry_domain }}/dstack-kms:fixed"
```

**2. `ansible/playbooks/build-kms.yml` (line 308)**

Current:
```yaml
ETH_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/demo
```

Fix:
```yaml
ETH_RPC_URL={{ eth_rpc_url | default('https://ethereum-sepolia.publicnode.com') }}
```

Also add `vars_files` to load `quick-start.yml`.

#### Documentation Fixes

**3. `src/content/tutorials/guest-image-setup.md`**

Update all references from `0.4.0` to `0.5.5`:
- Line 100: `DSTACK_VERSION="0.4.0"` → `DSTACK_VERSION="0.5.5"`
- Line 104: URL path
- Line 117: Expected output
- All other version references

**4. `src/content/tutorials/gramine-key-provider.md`**

Add section documenting QCNL configuration that the playbook creates:

```markdown
### QCNL Configuration

The Ansible playbook creates a QCNL configuration file for the key provider:

```json
{
  "pccs_url": "https://127.0.0.1:8081/sgx/certification/v4/",
  "use_secure_cert": false,
  "retry_times": 6,
  "retry_delay": 10
}
```

This configures the key provider to use the local PCCS for quote verification.
```

#### Missing Playbooks

**5. Create `ansible/playbooks/verify-gramine-key-provider.yml`**

```yaml
---
# Verify Gramine Key Provider deployment
- name: Verify Gramine Key Provider
  hosts: dstack_servers
  become: yes

  tasks:
    - name: Check aesmd container running
      ansible.builtin.command:
        cmd: docker ps --filter "name=aesmd" --format "{{ '{{' }}.Status{{ '}}' }}"
      register: aesmd_status
      changed_when: false

    - name: Check gramine container running
      ansible.builtin.command:
        cmd: docker ps --filter "name=gramine-sealing-key-provider" --format "{{ '{{' }}.Status{{ '}}' }}"
      register: gramine_status
      changed_when: false

    - name: Check port 3443 is listening
      ansible.builtin.wait_for:
        host: 127.0.0.1
        port: 3443
        timeout: 5
        state: started
      register: port_check
      failed_when: false

    - name: Display verification summary
      ansible.builtin.debug:
        msg:
          - "============================================"
          - "Gramine Key Provider Verification"
          - "============================================"
          - "aesmd: {{ 'Running' if 'Up' in aesmd_status.stdout else 'NOT RUNNING' }}"
          - "gramine: {{ 'Running' if 'Up' in gramine_status.stdout else 'NOT RUNNING' }}"
          - "Port 3443: {{ 'Listening' if port_check is success else 'NOT LISTENING' }}"
          - "============================================"

    - name: Fail if not healthy
      ansible.builtin.fail:
        msg: "Gramine key provider is not healthy. Check container logs."
      when: "'Up' not in aesmd_status.stdout or 'Up' not in gramine_status.stdout"
```

#### Variable Consistency

**6. Audit all playbooks for `vars_files` inclusion**

Playbooks that need `vars/quick-start.yml`:
- `deploy-kms-cvm.yml` - MISSING
- `build-kms.yml` - MISSING (uses hardcoded values)
- `verify-kms-cvm.yml` - Check
- `build-gateway.yml` - Check
- `setup-gateway-service.yml` - Check

Add to each:
```yaml
vars_files:
  - ../vars/quick-start.yml
```

**7. Create centralized RPC endpoint variable**

In `vars/quick-start.example.yml`, ensure this is the canonical source:
```yaml
eth_rpc_url: "https://ethereum-sepolia.publicnode.com"
```

Then reference `{{ eth_rpc_url }}` everywhere instead of hardcoding.

### Interfaces

No new interfaces. All changes are internal consistency fixes.

### Data Model

No data model changes.

## Open Questions

- [ ] Should we add a pre-flight validation play in `site.yml` that checks ALL required variables before starting any deployment? (Recommended: Yes)
- [ ] Should `deploy-kms-cvm.yml` default to using the local registry image or require explicit specification? (Recommended: Default to local registry)
- [ ] Should we create a single `vars/all.yml` that consolidates common variables? (Recommended: No, keep current structure)

## Alternatives Considered

### Alternative 1: Restructure all playbooks to use roles

**Rejected because:** This is a larger refactoring effort. The current playbook structure works; we just need consistency fixes. Can be considered for a future improvement spec.

### Alternative 2: Create a single monolithic playbook

**Rejected because:** The current modular structure is better for debugging, selective execution, and maintenance. Just need to ensure proper variable passing.

### Alternative 3: Remove build-kms.yml in favor of always using pre-built images

**Rejected because:** Building locally is useful for customization and development. We should fix the RPC endpoint issue, not remove the capability.

## Implementation Plan

### Phase 1: Critical Fixes (Must complete before testing)

1. Fix `deploy-kms-cvm.yml` - add vars_files, set default docker_image
2. Fix `build-kms.yml` - change RPC endpoint, add vars_files
3. Verify `site.yml` properly passes variables through imports

### Phase 2: Missing Components

4. Create `verify-gramine-key-provider.yml`
5. Audit all playbooks for consistent vars_files usage

### Phase 3: Documentation Updates

6. Update `guest-image-setup.md` version references
7. Update `gramine-key-provider.md` with QCNL config section
8. Review all tutorials for version consistency

### Phase 4: Validation

9. Fresh OS install test
10. Run complete `ansible-playbook site.yml -i inventory/hosts.yml`
11. Verify KMS CVM responds to GetMeta
12. Document any additional issues found

## Traceability

*Filled in during implementation*

| Requirement | Implementation | Tests |
|-------------|----------------|-------|
| R1 | | |
| R2 | | |
| R3 | | |
| R4 | | |
| R5 | | |
| R6 | | |

## Changelog

| Date | Author | Changes |
|------|--------|---------|
| 2025-12-13 | Claude | Initial draft based on audit findings |

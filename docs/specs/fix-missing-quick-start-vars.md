# Spec: Pre-flight Configuration Validation for Ansible Playbooks

**Status:** IMPLEMENTED
**Author:** Claude
**Created:** 2025-12-11
**Last Updated:** 2025-12-11

---

## Overview

Running `ansible-playbook site.yml -i inventory/hosts.yml` fails with a cryptic error when required configuration files are missing:

```
'base_domain' is undefined
```

This is confusing because the actual problem is that `vars/quick-start.yml` doesn't exist (only the example file ships with the repo). Users have no idea what went wrong or how to fix it.

This spec adds pre-flight validation that checks all required configuration files exist BEFORE Ansible attempts to load them, providing clear actionable error messages.

---

## Requirements

### Must Have

- [ ] Pre-flight check runs BEFORE any play that loads `vars/quick-start.yml`
- [ ] Clear error message when `vars/quick-start.yml` is missing
- [ ] Error message includes exact `cp` command to create the file
- [ ] Error message lists the required variables to configure
- [ ] Pre-flight runs on localhost (no SSH connection required to fail fast)
- [ ] Existing playbook behavior unchanged when config files exist

### Should Have

- [ ] Similar validation for `deploy-contracts-local.yml` checking `vars/local-secrets.yml`
- [ ] Validation error message formatted with visual separators for clarity
- [ ] Pre-flight play tagged with `always` so it runs regardless of `--tags`

### Must NOT Have

- Validation of variable VALUES (just file existence)
- Changes to the actual deployment logic
- New dependencies or Ansible collections

---

## Non-Requirements

- **Inventory file validation**: Ansible already provides clear errors for missing inventory (`Unable to parse inventory source`)
- **Variable value validation**: The existing `assert` tasks handle this (e.g., contract address validation)
- **Schema validation**: Not checking if quick-start.yml has all required keys

---

## Design

### The Problem (Technical Detail)

The current `site.yml` structure:

```yaml
- name: Quick Start - Pre-flight Checks
  hosts: dstack_servers
  gather_facts: no
  tags: [always]

  vars_files:
    - vars/quick-start.yml  # <-- Evaluated BEFORE tasks run!

  tasks:
    - name: Display deployment plan
      # ...
```

**Why Option A (from original spec) doesn't work:**

Ansible evaluates `vars_files` when a play is PARSED, not when tasks execute. Adding a localhost play that checks the file won't help because the `dstack_servers` play's `vars_files` is still evaluated before we can fail gracefully.

### Solution: Option D - Fail Before Problematic Play Parses

Ansible parses plays sequentially. If we add a localhost play at the TOP that:
1. Checks required files exist
2. Fails immediately if missing

...then the subsequent plays (which have `vars_files`) never get parsed, and we avoid the cryptic error.

```yaml
# This play is parsed first, runs first, and fails fast if config missing
- name: Configuration Validation
  hosts: localhost
  connection: local
  gather_facts: no
  tags: [always]

  tasks:
    - name: Check vars/quick-start.yml exists
      stat:
        path: "{{ playbook_dir }}/vars/quick-start.yml"
      register: quick_start_file

    - name: Fail with helpful message if config missing
      fail:
        msg: |
          ... helpful error ...
      when: not quick_start_file.stat.exists

# This play's vars_files only gets parsed if the above play succeeds
- name: Quick Start - Pre-flight Checks
  hosts: dstack_servers
  vars_files:
    - vars/quick-start.yml
  # ...
```

### Architecture

```
site.yml execution flow:
┌──────────────────────────────────────┐
│ Play 1: Configuration Validation     │  ← NEW (localhost)
│   - Check vars/quick-start.yml       │
│   - Fail with helpful error if missing│
└──────────────────┬───────────────────┘
                   │ (only if files exist)
                   ▼
┌──────────────────────────────────────┐
│ Play 2: Quick Start - Pre-flight     │  ← EXISTING (now loads vars_files safely)
│   - vars_files: quick-start.yml      │
│   - Display deployment plan          │
└──────────────────┬───────────────────┘
                   │
                   ▼
┌──────────────────────────────────────┐
│ Remaining plays...                   │
└──────────────────────────────────────┘
```

### Error Message Design

```
TASK [Fail with helpful message if config missing] *****************************
fatal: [localhost]: FAILED! => {"changed": false, "msg": "
═══════════════════════════════════════════════════════════════════════════════
 CONFIGURATION REQUIRED
═══════════════════════════════════════════════════════════════════════════════

 The file vars/quick-start.yml was not found.

 Before running site.yml, you must create and configure this file:

 Step 1: Copy the example file
   cd ansible
   cp vars/quick-start.example.yml vars/quick-start.yml

 Step 2: Edit with your settings
   vim vars/quick-start.yml

   Required settings:
     base_domain:        Your domain (e.g., example.com)
     intel_pccs_api_key: Your Intel PCCS API key
                         Get one at: https://api.portal.trustedservices.intel.com/

 Step 3: (If not already done) Deploy contracts locally
   ansible-playbook playbooks/deploy-contracts-local.yml

 For full instructions, see:
   https://dstack.info/tutorial/quick-start-ansible

═══════════════════════════════════════════════════════════════════════════════
"}
```

---

## Implementation

### Files to Modify

| File | Change |
|------|--------|
| `ansible/site.yml` | Add Configuration Validation play at top |
| `ansible/playbooks/deploy-contracts-local.yml` | Add validation for `vars/local-secrets.yml` |

### Step 1: Add pre-flight validation to site.yml

Insert new play at the very top of `site.yml` (before line 33):

```yaml
# =============================================================================
# PHASE 0: Configuration Validation (runs on localhost, fails fast)
# =============================================================================

- name: Configuration Validation
  hosts: localhost
  connection: local
  gather_facts: no
  tags: [always]

  tasks:
    - name: Check vars/quick-start.yml exists
      ansible.builtin.stat:
        path: "{{ playbook_dir }}/vars/quick-start.yml"
      register: quick_start_file

    - name: Fail if vars/quick-start.yml is missing
      ansible.builtin.fail:
        msg: |

          ═══════════════════════════════════════════════════════════════════════════════
           CONFIGURATION REQUIRED
          ═══════════════════════════════════════════════════════════════════════════════

           The file vars/quick-start.yml was not found.

           Before running site.yml, you must create and configure this file:

           Step 1: Copy the example file
             cd ansible
             cp vars/quick-start.example.yml vars/quick-start.yml

           Step 2: Edit with your settings
             vim vars/quick-start.yml

             Required settings:
               base_domain:        Your domain (e.g., example.com)
               intel_pccs_api_key: Your Intel PCCS API key
                                   Get one at: https://api.portal.trustedservices.intel.com/

           Step 3: (If not already done) Deploy contracts locally
             ansible-playbook playbooks/deploy-contracts-local.yml

           For full instructions, see:
             https://dstack.info/tutorial/quick-start-ansible

          ═══════════════════════════════════════════════════════════════════════════════

      when: not quick_start_file.stat.exists
```

### Step 2: Add similar validation to deploy-contracts-local.yml

Add at the top of `ansible/playbooks/deploy-contracts-local.yml`:

```yaml
- name: Configuration Validation
  hosts: localhost
  connection: local
  gather_facts: no

  tasks:
    - name: Check vars/local-secrets.yml exists
      ansible.builtin.stat:
        path: "{{ playbook_dir }}/../vars/local-secrets.yml"
      register: local_secrets_file

    - name: Fail if vars/local-secrets.yml is missing
      ansible.builtin.fail:
        msg: |

          ═══════════════════════════════════════════════════════════════════════════════
           CONFIGURATION REQUIRED
          ═══════════════════════════════════════════════════════════════════════════════

           The file vars/local-secrets.yml was not found.

           Before deploying contracts, you must create this file with your private key:

           Step 1: Copy the example file
             cd ansible
             cp vars/local-secrets.example.yml vars/local-secrets.yml

           Step 2: Add your Ethereum private key
             vim vars/local-secrets.yml

             Required:
               deployer_private_key: "0x..."  (Sepolia testnet wallet with ETH)

           SECURITY: This file is gitignored. Never commit private keys!

           For full instructions, see:
             https://dstack.info/tutorial/quick-start-ansible

          ═══════════════════════════════════════════════════════════════════════════════

      when: not local_secrets_file.stat.exists
```

---

## Open Questions

- [x] Should we check inventory file too? → **No**, Ansible's native error is clear enough
- [x] Should we validate variable values? → **No**, existing `assert` tasks handle this
- [ ] Should we add a `--skip-validation` tag for advanced users? → Probably not needed

---

## Alternatives Considered

### Option A: Pre-flight play checks file, then load vars_files (Original Spec)

**Rejected:** Doesn't work. The `vars_files` directive is evaluated when the play is parsed, not when tasks run. The error still occurs before our check can run.

### Option B: Wrapper playbook that imports site.yml

```yaml
# run-site.yml
- name: Validate config
  hosts: localhost
  tasks:
    - stat: path=vars/quick-start.yml
    - fail: ...

- import_playbook: site.yml
```

**Rejected:** Changes the user command from `site.yml` to `run-site.yml`. Breaks existing documentation and muscle memory.

### Option C: Use include_vars instead of vars_files

Replace static `vars_files` with dynamic `include_vars` that can be wrapped in conditionals.

**Rejected:** Significant restructuring of existing playbook. `vars_files` is cleaner for configuration that's always needed.

---

## Success Criteria

1. Running `site.yml` without `vars/quick-start.yml` shows clear error with setup instructions
2. Running `deploy-contracts-local.yml` without `vars/local-secrets.yml` shows clear error
3. Running either playbook with proper config proceeds normally (no behavior change)
4. Error messages include exact `cp` commands and required variables
5. Error messages link to tutorial documentation

---

## Testing

```bash
# === Test 1: site.yml without quick-start.yml ===
cd ansible
rm -f vars/quick-start.yml
ansible-playbook site.yml -i inventory/hosts.yml
# Expected: Clear error message with setup instructions
# Should NOT show: "'base_domain' is undefined"

# === Test 2: site.yml with quick-start.yml ===
cp vars/quick-start.example.yml vars/quick-start.yml
# Edit with real values...
ansible-playbook site.yml -i inventory/hosts.yml
# Expected: Playbook runs (may fail later for other reasons, but passes validation)

# === Test 3: deploy-contracts-local.yml without local-secrets.yml ===
rm -f vars/local-secrets.yml
ansible-playbook playbooks/deploy-contracts-local.yml
# Expected: Clear error message about local-secrets.yml

# === Test 4: deploy-contracts-local.yml with local-secrets.yml ===
cp vars/local-secrets.example.yml vars/local-secrets.yml
# Edit with real values...
ansible-playbook playbooks/deploy-contracts-local.yml
# Expected: Playbook runs
```

---

## Traceability

| Requirement | Implementation | Verified |
|-------------|----------------|----------|
| Pre-flight check before vars_files | `site.yml` lines 37-81 | [x] |
| Clear error for missing quick-start.yml | `site.yml` lines 49-81 | [x] |
| Error includes cp command | `site.yml` line 63 | [x] |
| Error lists required variables | `site.yml` lines 68-71 | [x] |
| Validation for quick-start.yml in deploy | `deploy-contracts-local.yml` lines 27-66 | [x] |
| Validation for local-secrets.yml | `deploy-contracts-local.yml` lines 68-104 | [x] |

---

## Changelog

| Date | Author | Changes |
|------|--------|---------|
| 2025-12-11 | Claude | Initial draft |
| 2025-12-11 | Claude | Revised: Fixed technical approach (Option D), expanded scope to include local-secrets.yml validation |

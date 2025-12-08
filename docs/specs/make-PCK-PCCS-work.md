# TDX Attestation Infrastructure (PCCS/PCK Configuration)

**Status:** COMPLETE
**Author:** Claude
**Created:** 2025-12-08
**Last Updated:** 2025-12-08

## Overview

TDX Confidential VMs (CVMs) require attestation to prove they are running on genuine Intel TDX hardware. This attestation relies on PCK (Provisioning Certification Key) certificates that must be fetched from Intel's Provisioning Certification Service (PCS).

Currently, our tutorials cover TDX kernel installation and verification, but **do not** configure the attestation infrastructure. As a result, CVMs fail to start with:

```
Error: Failed to get sealing key
    0: Failed to get quote
    1: TDX_ATTEST_ERROR_UNEXPECTED
```

This spec defines what's needed to complete the TDX attestation setup.

## Problem Statement

### Current State
- TDX kernel is installed and working
- SGX devices are present
- PCCS (Provisioning Certificate Caching Service) is installed and running
- QGSD (Quote Generation Service Daemon) is installed and running

### Failure Point
- PCCS has **no Intel API key** configured (`"ApiKey": ""`)
- Platform is **not registered** with Intel's PCK service
- When a CVM requests attestation, PCCS tries to fetch PCK certs from Intel
- Intel returns HTTP 401 (invalid subscription key)
- CVM cannot get TDX quote, fails to start

### Error Chain
```
CVM boots → tappd requests sealing key → needs TDX quote →
QGSD calls PCCS → PCCS calls Intel PCS → 401 Unauthorized →
No PCK certs → Quote generation fails → CVM shutdown
```

## Requirements

### Must Have
- [ ] **New Tutorial:** `tdx-attestation-setup.md` covering Intel API key setup and PCCS configuration
- [ ] **Ansible Playbook:** `configure-pccs.yml` to automate PCCS configuration (referenced by tutorial)
- [ ] **Ansible Playbook:** `verify-attestation.yml` to verify attestation works (referenced by tutorial)
- [ ] **Update:** `deploy-kms-cvm.yml` to check attestation prerequisites before deployment
- [ ] **Update:** Tutorial ordering - attestation is step 5 in Host Setup (required, not appendix)
- [ ] **Update:** Host Setup tutorials 1-4 to have `totalSteps: 5`

### Should Have
- [ ] Pre-flight check in KMS deployment that gives clear error if attestation not configured
- [ ] Verification script users can run to confirm attestation end-to-end
- [ ] Troubleshooting section for common attestation errors

### Must NOT Have
- Embedding Intel API keys in the repository
- Development/testing bypass modes (`quote_enabled = false`)
- Air-gapped/offline scenarios (require internet access to Intel PCS)
- Automatic registration without user awareness

## Non-Requirements

- Supporting non-Intel TDX platforms (AMD SEV-SNP is out of scope)
- Implementing our own attestation verification service
- Caching PCK certificates long-term (PCCS handles this)

## Design

### Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────────┐
│   Intel PCS     │────>│  PCCS (local)    │────>│  QGSD               │
│  (cloud)        │     │  :8081           │     │  Quote Generation   │
└─────────────────┘     └──────────────────┘     └─────────────────────┘
        ^                       │                         │
        │                       v                         v
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────────┐
│ Intel API Key   │     │ PCK Cert Cache   │     │  CVM (TDX Guest)    │
│ (user provides) │     │ (SQLite DB)      │     │  tappd → attestation│
└─────────────────┘     └──────────────────┘     └─────────────────────┘
```

### Primary Deliverable: New Tutorial

**File:** `src/content/tutorials/tdx-attestation-setup.md`
**Section:** "Host Setup"
**Position:** Step 5 (after tdx-sgx-verification which is step 4)

The tutorial drives the user through the process. Ansible playbooks are provided as the "Quick Start" option at the top.

**Tutorial Structure:**

```markdown
# TDX Attestation Setup

## Quick Start: Configure with Ansible
> ansible-playbook -i inventory/hosts.yml playbooks/configure-pccs.yml

---

## Step 1: Obtain Intel API Key
[Manual instructions for getting API key from Intel portal]

## Step 2: Configure PCCS
[Manual instructions for editing config and restarting]

## Step 3: Verify Platform Registration
[Manual verification steps]

## Step 4: Test Attestation
[End-to-end test to confirm quotes work]

## Troubleshooting
[Common errors and solutions]
```

**Content outline:**

1. **Prerequisites**
   - TDX & SGX verified working (link to tdx-sgx-verification)
   - Internet access to Intel PCS

2. **Obtain Intel API Key**
   - Register at https://api.portal.trustedservices.intel.com/
   - Subscribe to "Intel SGX and Intel TDX Provisioning Certification Service"
   - Copy Primary or Secondary API key
   - **Note:** This is a blocking step - user must complete before continuing

3. **Configure PCCS**
   - Update `/opt/intel/sgx-dcap-pccs/config/default.json`
   - Set `ApiKey` field
   - Restart PCCS service

4. **Platform Registration**
   - Run `PCKIDRetrievalTool` to generate platform data
   - PCCS will auto-fetch certs on first attestation request
   - Or: Manual upload to Intel portal (for air-gapped)

5. **Verify Attestation**
   - Test quote generation
   - Check PCCS logs for successful cert fetch

### New Ansible Playbooks

#### 1. `playbooks/configure-pccs.yml`

```yaml
- name: Configure PCCS with Intel API Key
  hosts: tdx-host
  vars:
    intel_api_key: "{{ lookup('env', 'INTEL_API_KEY') }}"
  tasks:
    - name: Fail if API key not provided
      fail:
        msg: "INTEL_API_KEY environment variable required"
      when: intel_api_key == ""

    - name: Update PCCS config
      ansible.builtin.replace:
        path: /opt/intel/sgx-dcap-pccs/config/default.json
        regexp: '"ApiKey": ""'
        replace: '"ApiKey": "{{ intel_api_key }}"'

    - name: Restart PCCS
      systemd:
        name: pccs
        state: restarted
```

#### 2. `playbooks/verify-attestation.yml`

```yaml
- name: Verify TDX Attestation Infrastructure
  hosts: tdx-host
  tasks:
    - name: Check PCCS is running
      systemd:
        name: pccs
      register: pccs_status

    - name: Check PCCS has API key configured
      shell: grep -o '"ApiKey": "[^"]*"' /opt/intel/sgx-dcap-pccs/config/default.json
      register: api_key_check

    - name: Fail if API key empty
      fail:
        msg: "PCCS API key not configured. Run configure-pccs.yml first."
      when: '"ApiKey": ""' in api_key_check.stdout

    - name: Test PCCS health
      uri:
        url: http://localhost:8081/sgx/certification/v4/rootcacrl
        return_content: yes
      register: pccs_health

    - name: Display attestation status
      debug:
        msg: "TDX attestation infrastructure is configured and healthy"
```

### Update to KMS Deployment

Add pre-flight check in `deploy-kms-cvm.yml`:

```yaml
- name: Verify attestation before CVM deployment
  include_tasks: verify-attestation.yml
```

### Tutorial Ordering Impact

The new tutorial changes the Host Setup section ordering:

**Before:**
```
Host Setup (4 steps + 2 appendices)
  1. tdx-hardware-verification
  2. tdx-bios-configuration
  3. tdx-software-installation
  4. tdx-sgx-verification
  [appendix] tdx-troubleshooting-next-steps
  [appendix] ansible-tdx-automation
```

**After:**
```
Host Setup (5 steps + 2 appendices)
  1. tdx-hardware-verification
  2. tdx-bios-configuration
  3. tdx-software-installation
  4. tdx-sgx-verification
  5. tdx-attestation-setup          <-- NEW
  [appendix] tdx-troubleshooting-next-steps
  [appendix] ansible-tdx-automation
```

This means:
- Update `totalSteps` in tutorials 1-5 from 4 to 5
- Set `stepNumber: 5` in the new tutorial
- Update `prerequisites` in Prerequisites section tutorials (dns-configuration, blockchain-setup)
- Update E2E tests that reference tutorial order

### KMS Deployment Pre-flight Check

Update `deploy-kms-cvm.yml` to verify attestation is configured:

```yaml
- name: Check PCCS API key is configured
  shell: grep '"ApiKey"' /opt/intel/sgx-dcap-pccs/config/default.json | grep -v '""'
  register: api_key_check
  ignore_errors: true

- name: Fail if attestation not configured
  fail:
    msg: |
      PCCS is not configured with an Intel API key.

      TDX attestation is REQUIRED for CVM deployment.

      Please complete the attestation setup tutorial:
        https://dstack.info/tutorial/tdx-attestation-setup
  when: api_key_check.rc != 0
```

## Open Questions

All resolved:

- [x] ~~Should we support development mode with `quote_enabled = false`?~~ **No.** Production only, no security tradeoffs.
- [x] ~~Support air-gapped scenarios?~~ **No.** Require internet access to Intel PCS.
- [x] ~~Numbered step or appendix?~~ **Numbered step.** Required things are steps, optional things are appendices.

## Alternatives Considered

### Alternative 1: Integrate into tdx-sgx-verification
**Rejected because:** That tutorial is already focused on basic verification. Attestation setup requires user to get Intel API key, which is a blocking step that deserves its own tutorial.

### Alternative 2: Skip attestation for development
**Rejected:** No security tradeoffs. Attestation is required for production use.

### Alternative 3: Use Azure/GCP DCAP proxy
**Deferred:** Cloud-hosted DCAP proxies could eliminate need for Intel API key, but adds complexity and may not work for on-prem deployments.

## Traceability

*Filled in during implementation*

| Requirement | Implementation | Tests |
|-------------|----------------|-------|
| | | |

## Changelog

| Date | Author | Changes |
|------|--------|---------|
| 2025-12-08 | Claude | Initial draft based on KMS CVM deployment failure |
| 2025-12-08 | Claude | Resolved open questions: no dev mode, no offline, attestation is step 5. Status → REVIEW |

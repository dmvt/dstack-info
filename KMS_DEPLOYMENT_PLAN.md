# KMS Deployment Plan - SGX Key Provider Bootstrap Approach

**Created:** 2025-12-05
**Status:** Planning
**Based on:** Phala team recommendation

---

## Problem Summary

When deploying KMS as a CVM, we encountered a chicken-and-egg problem:
- CVMs request keys from KMS during boot
- KMS is what we're trying to deploy
- No external KMS exists to provide keys

The error during CVM boot:
```
requesting app keys
Error: RPC error: 500: Failed to get app keys
```

---

## Phala's Recommended Solution

**Three-step bootstrap process:**
1. Run an SGX local key provider (built into VMM)
2. Bootstrap KMS CVM using the SGX local key provider
3. Bootstrap the gateway using the KMS

---

## Implementation Plan

### Phase 1: Understand SGX Local Key Provider

**Research tasks:**
1. Locate key provider configuration in VMM code/config
2. Understand how `local_key_provider_enabled` works in VMM
3. Determine if key provider runs on host or needs separate service
4. Find documentation on key provider setup

**Expected location:** `vmm.toml` → `[key_provider]` section

Current vmm.toml has:
```toml
[key_provider]
enabled = true
address = "127.0.0.1"
port = 3443
```

### Phase 2: Update VMM Configuration for Key Provider

**Tasks:**
1. Verify key provider is enabled in vmm.toml
2. Determine if any additional setup needed (SGX dependencies?)
3. Test key provider endpoint is responding
4. Document the key provider configuration

**Tutorial updates needed:**
- `vmm-configuration.md` - Add key provider section explanation

### Phase 3: Deploy KMS CVM with Local Key Provider

**Tasks:**
1. Update KMS CVM app manifest to use `local_key_provider_enabled: true`
2. Configure KMS CVM to NOT require external KMS (`kms_enabled: false`)
3. Deploy KMS CVM via VMM API
4. Verify KMS boots successfully with local key provider
5. Verify KMS generates certificates and TDX quote

**Tutorial updates needed:**
- `deploy-kms-cvm.yml` playbook - Use local key provider settings
- `kms-bootstrap.md` - Document the bootstrap process with key provider

### Phase 4: Transition to KMS-Based Key Management

**After KMS is running:**
1. Update VMM configuration to point CVMs to the new KMS
2. CVMs now use the deployed KMS for key management
3. Key provider can potentially be disabled (or kept for redundancy)

**Configuration change:**
```toml
[cvm]
kms_urls = ["http://127.0.0.1:9100"]  # Point to deployed KMS
```

### Phase 5: Bootstrap Gateway Using KMS

**Tasks:**
1. Gateway configuration already points to KMS
2. Verify gateway can communicate with KMS
3. Gateway obtains certificates from KMS
4. Test gateway functionality

---

## Files to Update

### Ansible Playbooks

| File | Changes |
|------|---------|
| `setup-vmm-config.yml` | Ensure key_provider enabled, document settings |
| `deploy-kms-cvm.yml` | Use local_key_provider_enabled in manifest |
| `verify-kms-cvm.yml` | Verify KMS bootstrapped correctly |

### Tutorials

| File | Changes |
|------|---------|
| `vmm-configuration.md` | Add key_provider section documentation |
| `kms-bootstrap.md` | Update for key provider bootstrap flow |
| `kms-service-setup.md` | Create new tutorial for KMS CVM management |

---

## Technical Details

### App Manifest for KMS CVM

The KMS CVM app manifest needs:
```json
{
  "manifest_version": 2,
  "name": "kms",
  "runner": "docker-compose",
  "docker_compose_file": "<compose yaml>",
  "kms_enabled": false,
  "local_key_provider_enabled": true,
  "gateway_enabled": false,
  "public_logs": true,
  "public_sysinfo": true,
  "public_tcbinfo": true,
  "no_instance_id": true
}
```

### Key Changes from Previous Attempt

| Setting | Previous | New |
|---------|----------|-----|
| `kms_enabled` | false | false |
| `local_key_provider_enabled` | false | **true** |
| `no_instance_id` | true | true |

The critical change is `local_key_provider_enabled: true` which tells the CVM to use the VMM's built-in key provider instead of an external KMS.

---

## Testing Plan

### Manual Testing Steps

1. **Verify VMM key provider:**
   ```bash
   # Check VMM config has key_provider enabled
   grep -A5 '\[key_provider\]' /etc/dstack/vmm.toml

   # Verify VMM is running
   systemctl status dstack-vmm
   ```

2. **Deploy KMS CVM:**
   ```bash
   ansible-playbook -i inventory/hosts.yml playbooks/deploy-kms-cvm.yml \
     -e "kms_domain=kms.hosted.dstack.info"
   ```

3. **Verify KMS bootstrap:**
   ```bash
   # Wait for KMS port
   curl -s http://localhost:9100/prpc/KMS.GetMeta | jq .

   # Check for TDX quote
   curl -s http://localhost:9100/prpc/KMS.GetMeta | jq '.quote'
   ```

4. **Verify KMS CVM logs:**
   ```bash
   curl -s "http://127.0.0.1:9080/api/instances/kms/logs?lines=100"
   ```

### Ansible Testing

After manual verification, rebuild OS and test full Ansible automation:
```bash
# Phase 2: dstack Installation
ansible-playbook -i inventory/hosts.yml playbooks/setup-host-dependencies.yml
ansible-playbook -i inventory/hosts.yml playbooks/setup-rust-toolchain.yml
ansible-playbook -i inventory/hosts.yml playbooks/build-dstack-vmm.yml
ansible-playbook -i inventory/hosts.yml playbooks/setup-vmm-config.yml
ansible-playbook -i inventory/hosts.yml playbooks/setup-vmm-service.yml
ansible-playbook -i inventory/hosts.yml playbooks/setup-guest-images.yml

# Phase 3: KMS Deployment
ansible-playbook -i inventory/hosts.yml playbooks/build-kms.yml
ansible-playbook -i inventory/hosts.yml playbooks/deploy-kms-cvm.yml \
  -e "kms_domain=kms.hosted.dstack.info"
ansible-playbook -i inventory/hosts.yml playbooks/verify-kms-cvm.yml
```

---

## Execution Order

1. [ ] Read dstack source code for key_provider implementation
2. [ ] Verify current VMM config has key_provider enabled
3. [ ] Update deploy-kms-cvm.yml with local_key_provider_enabled: true
4. [ ] Test KMS CVM deployment manually
5. [ ] Verify KMS bootstrap succeeds
6. [ ] Update tutorials with key provider documentation
7. [ ] Test full Ansible automation
8. [ ] Commit and deploy changes

---

## BLOCKER: TDX Attestation Infrastructure Required

**Status:** BLOCKING - Requires Intel PCCS API key configuration

### Issue Discovered

When testing `local_key_provider_enabled: true`, the CVM still fails during boot with:

```
Getting keys from local key provider
Error: Failed to get sealing key
Caused by:
    0: Failed to get quote
    1: TDX_ATTEST_ERROR_UNEXPECTED
```

### Root Cause

The local key provider uses TDX attestation to generate sealing keys, but TDX quote generation fails because:

1. **Quote Generation Service (QGS)** runs on host and is working
2. **Quote Provider Library (QPL)** tries to get Platform Certification Keys (PCKs)
3. **PCCS (Provisioning Certificate Caching Service)** has no cached PCKs
4. **Intel API** requires a subscription key to fetch PCKs

QGS log shows:
```
[QPL] No certificate data for this platform.
Error returned from the p_sgx_get_quote_config API. 0xe011
tee_att_init_quote return 0x11001
```

### Intel API Key Requirement

To enable TDX attestation, one of the following is needed:

1. **Intel API Key** - Register at [Intel Developer Zone](https://api.portal.trustedservices.intel.com/) to get a subscription key for the Intel TDX API
2. **Platform Registration** - Run MPA (Multi-Package Agent) registration tool with API key to cache PCKs

### QCNL Configuration

The `/etc/sgx_default_qcnl.conf` file needs to be configured. Current config:
```json
{
  "pccs_url": "https://api.trustedservices.intel.com/sgx/certification/v4/",
  "use_secure_cert": true,
  "retry_times": 6,
  "retry_delay": 10
}
```

**But the API requires authentication** - without an API key, PCK certificate retrieval fails.

### PCCS Configuration (Alternative)

If using local PCCS (`/opt/intel/sgx-dcap-pccs/config/default.json`):
```json
{
  "ApiKey": "<YOUR_INTEL_API_KEY>",
  ...
}
```

### Next Steps

1. **Option A:** Obtain Intel API key and configure PCCS
   - Register at Intel Developer Zone
   - Add API key to PCCS config
   - Restart PCCS and QGS services
   - Re-test CVM deployment

2. **Option B:** Research if there's a way to skip attestation for initial bootstrap
   - Check if dstack supports running without TDX quotes initially
   - May need to consult Phala team

3. **Option C:** Document PCCS/API key requirement in tutorials
   - Add prerequisite for Intel API key
   - Add tutorial for PCCS configuration

### Impact on Tutorials

The following tutorials need to be updated:

| Tutorial | Required Updates |
|----------|------------------|
| `tdx-kernel-installation.md` | Add PCCS API key configuration step |
| `attestation-verification.md` | Document PCK certificate requirements |
| `kms-build-configuration.md` | Note that TDX attestation requires PCCS |

---

## Questions to Resolve

1. Does the SGX key provider require any SGX-specific setup beyond VMM config?
   - **ANSWERED:** Yes, requires PCCS with Intel API key for PCK certificates
2. Should key provider remain enabled after KMS is running?
3. Are there any security implications to using local key provider vs KMS?
4. **NEW:** Can we obtain an Intel API key for this server?
5. **NEW:** Is there a development mode that doesn't require TDX attestation?

---

## Related Files

- `/Users/lsdan/dstack/dstack-info/ansible/playbooks/deploy-kms-cvm.yml`
- `/Users/lsdan/dstack/dstack-info/ansible/playbooks/setup-vmm-config.yml`
- `/Users/lsdan/dstack/dstack-info/src/content/tutorials/kms-bootstrap.md`
- `/Users/lsdan/dstack/dstack-info/src/content/tutorials/vmm-configuration.md`

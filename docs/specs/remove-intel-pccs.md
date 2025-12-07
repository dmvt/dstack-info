# Remove Intel PCCS Check from Host Verification

**Status:** IMPLEMENTED
**Author:** Claude (with Dan Matthews)
**Created:** 2025-12-07
**Last Updated:** 2025-12-07

## Overview

The `verify-tdx.yml` playbook currently includes a check for Intel PCCS (Provisioning Certification Caching Service) connectivity. This check is misplaced—PCCS is used by KMS inside the CVM for quote verification, not by the host during TDX/SGX setup verification.

The check currently shows a warning "⚠ Intel PCCS not reachable (may affect attestation)" which is confusing to users since:
1. PCCS connectivity isn't required at the host verification stage
2. The warning implies something is wrong when nothing needs to be fixed
3. Attestation happens inside the CVM, not on the host

## Requirements

### Must Have
- [x] Remove PCCS connectivity check from `verify-tdx.yml`
- [x] Remove PCCS line from final verification summary
- [x] Update `tdx-sgx-verification.md` tutorial to remove PCCS section

### Should Have
- [x] Verify no other playbooks depend on PCCS check results
- [x] Clean commit with clear rationale

### Must NOT Have
- Adding PCCS checks elsewhere (belongs in KMS verification, if anywhere)

## Non-Requirements

- **KMS PCCS verification** - If PCCS checking is needed for KMS, that's a separate spec
- **PCCS setup/configuration** - Out of scope for host verification

## Design

### Changes to `ansible/playbooks/verify-tdx.yml`

Remove these tasks:
1. "Test Intel PCCS connectivity" - uri check to api.trustedservices.intel.com
2. "Report Intel PCCS connectivity" - debug message

Update:
1. Final summary - remove the "Intel PCCS:" line

### Changes to `src/content/tutorials/tdx-sgx-verification.md`

Remove entire "Part 5: Verify SGX Registration (for KMS)" section:
- Remove PCCS connectivity test (`curl` to Intel)
- Remove local PCCS service check (`systemctl status pccs`)
- Remove local QGSD service check (`systemctl status qgsd`)

## Open Questions

- [x] Should PCCS checks be added to KMS verification instead?
  - **Resolved:** Out of scope for this spec. If needed, create separate spec.

## Alternatives Considered

### Alternative 1: Make PCCS check informational (no warning)
**Rejected because:** Still implies the check matters at this stage. Better to remove entirely and add to KMS verification if needed.

### Alternative 2: Fix the PCCS endpoint/check
**Rejected because:** The check itself works—the issue is that it doesn't belong in host verification.

## Traceability

| Requirement | Implementation | Tests |
|-------------|----------------|-------|
| Remove PCCS from playbook | `verify-tdx.yml` | Run playbook |
| Remove PCCS from tutorial | `tdx-sgx-verification.md` | Build site |

## Changelog

| Date | Author | Changes |
|------|--------|---------|
| 2025-12-07 | Claude | Initial draft |

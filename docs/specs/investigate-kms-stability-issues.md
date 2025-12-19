# Investigate KMS Stability Issues

**Status:** DRAFT
**Author:** Claude
**Created:** 2025-12-18
**Last Updated:** 2025-12-18

## Overview

The KMS CVM deploys and bootstraps successfully but becomes unresponsive after some time. This spec outlines the investigation plan to diagnose the root cause and implement a fix.

## Problem Statement

### Observed Behavior
1. KMS CVM deploys via VMM API successfully
2. KMS bootstraps and responds to `GetMeta` requests initially
3. After an indeterminate period (minutes to hours), KMS stops responding
4. Port 9100 remains listening (QEMU port forwarding active)
5. SSL handshake succeeds (`openssl s_client` connects)
6. HTTP requests timeout (no response from application layer)
7. CVM remains running (QEMU process exists, VMM service active)
8. Serial log shows successful boot, no crash messages

### Implications
- The issue is in the KMS application layer, not CVM or networking
- Something causes the KMS service to hang (not crash)
- Blocking for production deployment validation

## Requirements

### Must Have
- [ ] Root cause identified with evidence
- [ ] Reproducible test case documented
- [ ] Findings documented with logs/data

### Should Have
- [ ] Recommended fix approach identified
- [ ] Impact assessment of the issue

### Must NOT Have
- Implementation of fixes (separate spec)
- Changes to production systems during research

## Non-Requirements

- Performance optimization (unless cause of hang)
- Feature additions to KMS
- Changes to attestation flow (unless cause of hang)

## Investigation Plan

### Phase 1: Reproduce and Characterize

1. **Establish baseline timing**
   - Deploy fresh KMS CVM
   - Poll `GetMeta` endpoint every 30 seconds
   - Record time-to-failure

2. **Gather diagnostics when hung**
   - Check container status inside CVM (if accessible)
   - Check KMS process state (running, zombie, stuck in syscall)
   - Check memory usage inside CVM
   - Check for open file descriptor exhaustion
   - Check network connections state

3. **Check logs**
   - KMS application logs (if any)
   - Docker container logs inside CVM
   - Guest agent (tappd) logs

### Phase 2: Hypotheses to Test

#### Hypothesis A: PCCS/Attestation Hang
- KMS may be attempting TDX quote generation that hangs
- Test: Check if PCCS is reachable from CVM network (10.0.2.2:8081)
- Test: Monitor PCCS logs during KMS operation

#### Hypothesis B: Ethereum RPC Connection Issue
- KMS may be polling Ethereum and connection hangs
- Test: Check RPC endpoint accessibility from CVM
- Test: Monitor auth-eth process

#### Hypothesis C: Memory Exhaustion
- CVM has 4GB RAM, may be insufficient
- Test: Check memory usage over time
- Test: Increase CVM memory allocation

#### Hypothesis D: Rust Async Runtime Deadlock
- KMS uses async Rust, potential for deadlocks
- Test: Check thread states when hung
- Test: Enable debug logging

#### Hypothesis E: TLS Session/Connection Pool Exhaustion
- Long-lived connections may exhaust pools
- Test: Check connection counts over time
- Test: Look for connection leaks

### Phase 3: Document Findings

Based on findings from Phase 2:
- Document root cause with evidence
- Create reproducible test case
- Write recommended fix approach (for separate implementation spec)

## Diagnostic Commands

```bash
# Check if KMS responding
curl -sk --max-time 5 https://localhost:9100/prpc/KMS.GetMeta

# Check port listening
ss -tlnp | grep 9100

# Check QEMU process
ps aux | grep qemu

# Check CVM serial log
sudo tail -100 /root/.dstack-vmm/vm/*/serial.log

# Check VMM logs
sudo journalctl -u dstack-vmm -n 100

# Check PCCS accessibility (from host - CVM uses 10.0.2.2)
curl -sk https://localhost:8081/sgx/certification/v4/platforms

# Monitor KMS endpoint
watch -n 30 'curl -sk --max-time 5 https://localhost:9100/prpc/KMS.GetMeta | jq -r .k256_pubkey'
```

## Open Questions

- [ ] How to access logs inside CVM when it's running but unresponsive?
- [ ] Can we add a health check endpoint to KMS?
- [ ] Is there a way to get thread dumps from the Rust KMS binary?
- [ ] What is the expected memory footprint of KMS?

## Alternatives Considered

### Restart on failure (watchdog)
Rejected because it masks the root cause and may cause key regeneration issues.

### Increase timeouts
Rejected because it doesn't address the underlying issue.

## Traceability

*Filled in during implementation*

| Requirement | Implementation | Tests |
|-------------|----------------|-------|
| | | |

## Changelog

| Date | Author | Changes |
|------|--------|---------|
| 2025-12-18 | Claude | Initial draft |

# KMS Freeze Issue Fix

**Status:** DRAFT
**Author:** Claude
**Created:** 2025-12-27
**Last Updated:** 2025-12-27

## Overview

The KMS (Key Management Service) running inside a TDX CVM freezes shortly after successful bootstrap, causing HTTP requests to timeout while the port remains open and SSL handshakes succeed. This is a critical blocker for production deployment.

## Problem Statement

### Observed Behavior (Confirmed)
1. KMS CVM deploys successfully via VMM API
2. Docker container `dstack-kms-1` starts inside CVM
3. KMS bootstraps successfully - generates CA certificate and K256 key
4. KMS responds to `GetMeta` requests initially (verified working)
5. **Within seconds to minutes, KMS stops responding**
6. Port 9100 remains listening (QEMU port forwarding active)
7. SSL handshake succeeds (`openssl s_client` shows valid certificate)
8. HTTP requests timeout (no response from application layer)
9. CVM remains running (QEMU process exists)
10. No crash or error messages in serial log

### Evidence from Latest Run
```bash
# KMS initially responded with valid data:
{
  "ca_cert": "-----BEGIN CERTIFICATE-----...",
  "k256_pubkey": "02cd54be89e2aaa448a22855f256d916def645f0f2eee54d777d9ec800444ecf8d",
  "kms_contract_address": "0x05648a78E9064C77F38433c55aaB1E15da68b238",
  "chain_id": 11155111
}

# Seconds later, same request times out
# But SSL still works (shows certificate: CN = kms.hosted.dstack.info)
```

### Root Cause Analysis

The freeze pattern (port open + SSL works + HTTP timeout) indicates:
- TCP connection establishment works (QEMU port forwarding functional)
- TLS session established (KMS HTTP server listening)
- HTTP request processing blocked (application thread frozen)

This is a **Rust async runtime deadlock** or **blocking operation in async context**.

## Requirements

### Must Have
- [ ] KMS remains responsive after bootstrap
- [ ] KMS survives at least 10 minutes of continuous polling
- [ ] Bootstrap completes within playbook timeout (150 seconds)
- [ ] No changes to KMS functionality

### Should Have
- [ ] Debug logging to identify hang location
- [ ] Health check endpoint for monitoring

### Must NOT Have
- Workarounds that mask the issue (watchdog restarts)
- Significant architectural changes

## Design

### Investigation Phase

#### Step 1: Add Debug Logging to KMS Startup
Modify `start-kms.sh` to capture KMS stdout/stderr:

```bash
#!/bin/bash
set -e

# Enable verbose logging
export RUST_LOG=debug
export RUST_BACKTRACE=1

# Start auth-eth with logging
cd /opt/auth-eth
node dist/src/main.js > /var/log/auth-eth.log 2>&1 &
AUTH_ETH_PID=$!
echo "Started auth-eth with PID: $AUTH_ETH_PID"

# Wait for auth-eth
sleep 2

# Verify auth-eth is running
if ! kill -0 $AUTH_ETH_PID 2>/dev/null; then
    echo "ERROR: auth-eth failed to start"
    cat /var/log/auth-eth.log
    exit 1
fi

# Start KMS with logging
exec /usr/local/bin/dstack-kms --config /etc/kms/kms.toml 2>&1 | tee /var/log/kms.log
```

#### Step 2: Test Without Quote Generation
Disable TDX quote generation to isolate the issue:

```toml
# In kms.toml
[core.onboard]
quote_enabled = false  # Was: true
```

If KMS works without quotes, the issue is in PCCS/attestation.

#### Step 3: Test Without auth-eth
Start KMS without the auth-eth webhook:

```toml
# In kms.toml
[core.auth_api]
type = "none"  # Was: webhook
```

If KMS works without auth-eth, the issue is in Ethereum RPC polling.

#### Step 4: Monitor CVM Resources
Check if the freeze correlates with resource exhaustion:

```bash
# Inside CVM (if accessible)
watch -n 1 'free -m; ps aux | head -10'
```

### Likely Root Causes (Ranked by Probability)

#### 1. Blocking PCCS Call in Async Context (Most Likely)
The KMS may be making blocking PCCS calls within async tasks. When the PCCS connection is slow or times out, it blocks the async runtime, freezing all tasks including the HTTP server.

**Evidence:**
- PCCS check shows "Authentication failed" - suggesting connectivity issues
- Freeze happens after successful initial response
- Pattern matches async runtime starvation

**Fix:**
```rust
// Wrap PCCS calls in spawn_blocking
tokio::task::spawn_blocking(move || {
    pccs_client.get_quote(...)
}).await
```

#### 2. auth-eth Webhook Timeout
The auth-eth webhook might be blocking on Ethereum RPC calls, causing the KMS to wait indefinitely.

**Evidence:**
- auth-eth uses public demo RPC (`eth-sepolia.g.alchemy.com/v2/demo`)
- Demo endpoints have rate limits

**Fix:**
- Add timeout to webhook calls in KMS
- Use dedicated Alchemy API key instead of demo

#### 3. TLS Session Accumulation
Long-running TLS sessions or certificate operations might be exhausting resources.

**Evidence:**
- SSL handshake still works when frozen
- Could indicate TLS state accumulation

**Fix:**
- Add connection limits
- Enable TLS session timeouts

### Implementation Plan

#### Phase 1: Diagnostic Build (Day 1)
1. Create debug Dockerfile with enhanced logging
2. Deploy and capture logs when freeze occurs
3. Identify exact location of hang

```dockerfile
# Debug Dockerfile additions
ENV RUST_LOG=debug
ENV RUST_BACKTRACE=1
COPY start-kms-debug.sh /usr/local/bin/start-kms.sh
```

#### Phase 2: Isolate Component (Day 1-2)
Based on logs, test with components disabled:
1. Test: `quote_enabled = false`
2. Test: `auth_api.type = "none"`
3. Test: Increased timeout values

#### Phase 3: Apply Fix (Day 2-3)
Based on findings:
1. If PCCS: Add spawn_blocking wrapper or async PCCS client
2. If auth-eth: Add timeout to webhook, use real API key
3. If TLS: Add session limits

#### Phase 4: Validation (Day 3)
1. Deploy fixed KMS
2. Poll GetMeta continuously for 30+ minutes
3. Verify no freezes

## Diagnostic Playbook

Create `playbooks/debug-kms-freeze.yml`:

```yaml
---
- name: Debug KMS Freeze Issue
  hosts: dstack_servers
  vars:
    kms_rpc_port: 9100
  tasks:
    - name: Check KMS is responding
      uri:
        url: "https://localhost:{{ kms_rpc_port }}/prpc/KMS.GetMeta"
        method: GET
        validate_certs: false
        timeout: 5
      register: kms_check
      failed_when: false

    - name: Display KMS status
      debug:
        msg: "KMS Status: {{ 'RESPONDING' if kms_check.status == 200 else 'FROZEN (timeout)' }}"

    - name: Get container logs (if frozen)
      shell: |
        docker logs dstack-kms-1 2>&1 | tail -100
      register: container_logs
      when: kms_check.status != 200
      become: yes

    - name: Display container logs
      debug:
        var: container_logs.stdout_lines
      when: container_logs.stdout_lines is defined
```

## Open Questions

- [x] Does KMS respond initially? **Yes - confirmed**
- [x] Is port still open when frozen? **Yes - confirmed**
- [x] Does SSL work when frozen? **Yes - confirmed**
- [ ] What is the exact timeout duration before freeze?
- [ ] What does `RUST_LOG=debug` show at freeze time?
- [ ] Does disabling quotes fix the issue?

## Alternatives Considered

### Watchdog Restart
Automatically restart KMS when it stops responding.

**Rejected:** Masks root cause, may cause key regeneration issues, doesn't solve production reliability.

### Increase All Timeouts
Set very long timeouts everywhere.

**Rejected:** Doesn't fix the underlying blocking issue, just delays the freeze.

### Run KMS Outside CVM
Deploy KMS on host instead of in CVM.

**Rejected:** Defeats the purpose of TDX protection, not a real solution.

## Traceability

| Requirement | Implementation | Tests |
|-------------|----------------|-------|
| Remains responsive | TBD | Poll for 30 min |
| Debug logging | start-kms-debug.sh | View logs |
| Bootstrap in time | Fix blocking calls | Playbook timeout |

## Changelog

| Date | Author | Changes |
|------|--------|---------|
| 2025-12-27 | Claude | Initial draft with investigation plan |

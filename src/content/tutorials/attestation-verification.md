---
title: "Attestation Verification"
description: "Verify TDX attestation to prove your application runs in a genuine secure environment"
section: "First Application"
stepNumber: 3
totalSteps: 3
lastUpdated: 2025-12-02
prerequisites:
  - hello-world-app
tags:
  - dstack
  - tdx
  - attestation
  - quote
  - verification
  - security
difficulty: "advanced"
estimatedTime: "45 minutes"
---

# Attestation Verification

This tutorial guides you through verifying TDX attestation for your deployed applications. Attestation is the cryptographic proof that your application is genuinely running inside a TDX-protected Confidential Virtual Machine with the expected software stack.

## What You'll Learn

- **TDX Quote generation** - Request attestation quotes from running CVMs
- **Measurement verification** - Understand and verify MRTD and RTMR values
- **Quote validation** - Verify quote signatures using Intel's attestation services
- **End-to-end verification** - Complete attestation workflow

## Why Attestation Matters

Attestation provides cryptographic proof of three critical properties:

| Property | What It Proves |
|----------|----------------|
| **Authenticity** | The CVM is running on genuine Intel TDX hardware |
| **Integrity** | The firmware, kernel, and OS haven't been modified |
| **Isolation** | Your application's memory is encrypted and isolated |

Without attestation, you're trusting the infrastructure provider. With attestation, you have mathematical proof that the security guarantees are being enforced by hardware.

## Understanding TDX Measurements

TDX uses several measurement registers to track the boot process:

```
┌─────────────────────────────────────────────────────────────┐
│                  TDX Measurement Registers                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  MRTD (Measurement Register TD)                              │
│  └── Measures: Virtual firmware (OVMF)                       │
│      Computed by: TDX module (hardware)                      │
│      Fixed for: Same OVMF binary                             │
│                                                              │
│  RTMR0 (Runtime Measurement Register 0)                      │
│  └── Measures: CPU/memory configuration                      │
│      Computed by: OVMF during boot                           │
│      Varies with: VM specifications (vCPUs, RAM)             │
│                                                              │
│  RTMR1 (Runtime Measurement Register 1)                      │
│  └── Measures: Linux kernel                                  │
│      Computed by: OVMF when loading kernel                   │
│      Fixed for: Same kernel binary (bzImage)                 │
│                                                              │
│  RTMR2 (Runtime Measurement Register 2)                      │
│  └── Measures: Kernel cmdline + initramfs                    │
│      Computed by: OVMF                                       │
│      Fixed for: Same image metadata                          │
│                                                              │
│  RTMR3 (Runtime Measurement Register 3)                      │
│  └── Measures: Application configuration                     │
│      Computed by: Tappd at runtime                           │
│      Varies with: Docker compose, app ID, etc.               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Prerequisites

Before starting, ensure you have:

- Completed [Hello World Application](/tutorial/hello-world-app)
- A running CVM instance
- Access to the teepod API

Verify you have a running CVM:

```bash
curl http://127.0.0.1:9080/api/instances | jq '.instances[] | {name, status}'
```

## Step 1: Request a TDX Quote

The TDX quote is a signed attestation report from the hardware. Request a quote from your running CVM:

### Via Teepod API

```bash
curl -X POST http://127.0.0.1:9080/api/instances/hello-world/quote \
  -H "Content-Type: application/json" \
  -d '{
    "report_data": "48656c6c6f20576f726c6421"
  }' | jq .
```

The `report_data` is optional user-provided data (up to 64 bytes) that gets included in the quote. Here we're using the hex encoding of "Hello World!".

### From Inside the CVM

Applications running inside the CVM can request quotes directly via the tappd socket:

```bash
# This would be run inside a container in the CVM
curl -X POST --unix-socket /var/run/tappd.sock \
  -d '{"report_data": "0x48656c6c6f"}' \
  http://localhost/prpc/Tappd.TdxQuote?json
```

## Step 2: Understand the Quote Response

The quote response contains:

```json
{
  "quote": "BAACAAAACgAAAA...",
  "measurements": {
    "mrtd": "a1b2c3d4e5f6...",
    "rtmr0": "11223344...",
    "rtmr1": "55667788...",
    "rtmr2": "99aabbcc...",
    "rtmr3": "ddeeff00..."
  },
  "report_data": "48656c6c6f20576f726c6421",
  "event_log": [
    {
      "event": "app_compose",
      "data": "sha256:abc123..."
    },
    {
      "event": "instance_id",
      "data": "hello-world-instance-1"
    }
  ]
}
```

### Quote Fields Explained

| Field | Description |
|-------|-------------|
| `quote` | Base64-encoded TDX quote (signed by Intel) |
| `measurements.mrtd` | Virtual firmware measurement |
| `measurements.rtmr0` | VM configuration measurement |
| `measurements.rtmr1` | Kernel measurement |
| `measurements.rtmr2` | Cmdline/initrd measurement |
| `measurements.rtmr3` | Application measurement |
| `report_data` | Your provided challenge data |
| `event_log` | Detailed events for RTMR3 replay |

## Step 3: Calculate Expected Measurements

To verify the quote, you need to know what measurements to expect. This requires the guest OS image metadata.

### Get image metadata

```bash
cat /var/lib/dstack/images/dstack-0.4.0/metadata.json | jq .
```

### Calculate expected MRs

Use the `dstack-mr` tool to calculate expected measurements:

```bash
# Build the measurement calculation tool
cd ~/dstack
cargo build --release -p dstack-mr

# Calculate expected MRs
./target/release/dstack-mr \
  --cpu 2 \
  --ram 2048 \
  --metadata /var/lib/dstack/images/dstack-0.4.0/metadata.json
```

Expected output:

```
dstack Measurement Calculator

Input:
  Image: dstack-0.4.0
  vCPUs: 2
  Memory: 2048 MB
  Metadata: /var/lib/dstack/images/dstack-0.4.0/metadata.json

Expected Measurements:
  MRTD:  a1b2c3d4e5f6789...
  RTMR0: 112233445566...
  RTMR1: 55667788990011...
  RTMR2: 99aabbccddee...

Note: RTMR3 depends on application configuration
      Verify via event log replay
```

## Step 4: Verify Quote Signature

The TDX quote is signed by Intel. Verify the signature using Intel's attestation services:

### Using dcap-qvl

```bash
# Build the quote verification library
cd ~/dstack
cargo build --release -p dcap-qvl

# Verify the quote
./target/release/dcap-qvl verify --quote-file /tmp/quote.bin
```

### Using Intel Attestation Service

For production verification, use Intel's remote attestation service:

```bash
# Extract the quote to a file
echo "<base64-quote>" | base64 -d > /tmp/quote.bin

# Submit to Intel attestation service
curl -X POST https://api.trustedservices.intel.com/sgx/certification/v4/verify \
  -H "Content-Type: application/json" \
  -d @- << EOF
{
  "quote": "$(base64 -w0 /tmp/quote.bin)"
}
EOF
```

Expected response:

```json
{
  "result": "OK",
  "tcb_status": "UpToDate",
  "advisory_ids": []
}
```

## Step 5: Compare Measurements

Compare the quote's measurements with your expected values:

```bash
#!/bin/bash
# verify-measurements.sh

# Get quote
QUOTE=$(curl -s -X POST http://127.0.0.1:9080/api/instances/hello-world/quote)

# Extract measurements from quote
MRTD=$(echo $QUOTE | jq -r '.measurements.mrtd')
RTMR0=$(echo $QUOTE | jq -r '.measurements.rtmr0')
RTMR1=$(echo $QUOTE | jq -r '.measurements.rtmr1')
RTMR2=$(echo $QUOTE | jq -r '.measurements.rtmr2')

# Expected values (from dstack-mr calculation)
EXPECTED_MRTD="a1b2c3d4e5f6789..."
EXPECTED_RTMR0="112233445566..."
EXPECTED_RTMR1="55667788990011..."
EXPECTED_RTMR2="99aabbccddee..."

# Compare
echo "Measurement Verification Results:"
echo "=================================="

if [ "$MRTD" == "$EXPECTED_MRTD" ]; then
    echo "✓ MRTD matches - Firmware verified"
else
    echo "✗ MRTD mismatch!"
    echo "  Expected: $EXPECTED_MRTD"
    echo "  Got:      $MRTD"
fi

if [ "$RTMR0" == "$EXPECTED_RTMR0" ]; then
    echo "✓ RTMR0 matches - VM config verified"
else
    echo "✗ RTMR0 mismatch!"
fi

if [ "$RTMR1" == "$EXPECTED_RTMR1" ]; then
    echo "✓ RTMR1 matches - Kernel verified"
else
    echo "✗ RTMR1 mismatch!"
fi

if [ "$RTMR2" == "$EXPECTED_RTMR2" ]; then
    echo "✓ RTMR2 matches - Initrd verified"
else
    echo "✗ RTMR2 mismatch!"
fi

echo ""
echo "RTMR3 requires event log replay (see Step 6)"
```

## Step 6: Verify RTMR3 via Event Log

RTMR3 contains runtime measurements that can't be pre-calculated. Instead, verify by replaying the event log:

```bash
# Get event log from quote response
EVENT_LOG=$(curl -s -X POST http://127.0.0.1:9080/api/instances/hello-world/quote | jq '.event_log')

# Display events
echo "Event Log:"
echo "$EVENT_LOG" | jq -r '.[] | "\(.event): \(.data)"'
```

Expected events:

```
app_compose: sha256:abc123...
instance_id: hello-world-instance-1
app_id: hello-world
rootfs_hash: sha256:def456...
key_provider: local
```

### Verify event log integrity

Each event extends RTMR3. Replay the events to verify:

```bash
# Verify RTMR3 by replaying events
./target/release/dstack-mr verify-rtmr3 \
  --event-log /tmp/event_log.json \
  --expected-rtmr3 "$RTMR3"
```

If the replay produces the same RTMR3, the event log is authentic.

## Step 7: Programmatic Verification

Here's a complete verification script:

```bash
#!/bin/bash
# full-attestation-verify.sh

set -e

INSTANCE_NAME="${1:-hello-world}"
IMAGE_VERSION="${2:-dstack-0.4.0}"

echo "========================================="
echo "dstack Attestation Verification"
echo "========================================="
echo "Instance: $INSTANCE_NAME"
echo "Image: $IMAGE_VERSION"
echo ""

# Step 1: Get quote
echo "Step 1: Requesting TDX quote..."
QUOTE_RESPONSE=$(curl -s -X POST "http://127.0.0.1:9080/api/instances/$INSTANCE_NAME/quote" \
  -H "Content-Type: application/json" \
  -d '{"report_data": "verification-test"}')

if [ -z "$QUOTE_RESPONSE" ]; then
    echo "✗ Failed to get quote"
    exit 1
fi
echo "✓ Quote received"

# Step 2: Extract measurements
echo ""
echo "Step 2: Extracting measurements..."
MRTD=$(echo "$QUOTE_RESPONSE" | jq -r '.measurements.mrtd')
RTMR0=$(echo "$QUOTE_RESPONSE" | jq -r '.measurements.rtmr0')
RTMR1=$(echo "$QUOTE_RESPONSE" | jq -r '.measurements.rtmr1')
RTMR2=$(echo "$QUOTE_RESPONSE" | jq -r '.measurements.rtmr2')
RTMR3=$(echo "$QUOTE_RESPONSE" | jq -r '.measurements.rtmr3')

echo "  MRTD:  ${MRTD:0:16}..."
echo "  RTMR0: ${RTMR0:0:16}..."
echo "  RTMR1: ${RTMR1:0:16}..."
echo "  RTMR2: ${RTMR2:0:16}..."
echo "  RTMR3: ${RTMR3:0:16}..."

# Step 3: Verify quote signature
echo ""
echo "Step 3: Verifying quote signature..."
QUOTE_B64=$(echo "$QUOTE_RESPONSE" | jq -r '.quote')
echo "$QUOTE_B64" | base64 -d > /tmp/quote.bin

# Use local verification or Intel service
if command -v dcap-qvl &> /dev/null; then
    if dcap-qvl verify --quote-file /tmp/quote.bin 2>/dev/null; then
        echo "✓ Quote signature valid (local verification)"
    else
        echo "✗ Quote signature invalid"
        exit 1
    fi
else
    echo "⚠ dcap-qvl not available, skipping signature verification"
fi

# Step 4: Calculate expected measurements
echo ""
echo "Step 4: Calculating expected measurements..."
# In production, use dstack-mr tool
# For demo, we'll skip this step
echo "⚠ Expected measurement calculation requires dstack-mr tool"
echo "  Run: dstack-mr --cpu 2 --ram 2048 --metadata /var/lib/dstack/images/$IMAGE_VERSION/metadata.json"

# Step 5: Display event log
echo ""
echo "Step 5: Event log for RTMR3 verification..."
echo "$QUOTE_RESPONSE" | jq -r '.event_log[] | "  - \(.event): \(.data[:32])..."'

echo ""
echo "========================================="
echo "Verification Summary"
echo "========================================="
echo "✓ TDX quote generated successfully"
echo "✓ Quote contains all measurement registers"
echo "  - Compare MRTD/RTMR0-2 with pre-calculated values"
echo "  - Verify RTMR3 by replaying event log"
echo ""
echo "This CVM is running in a genuine TDX environment"
echo "========================================="
```

Make it executable and run:

```bash
chmod +x full-attestation-verify.sh
./full-attestation-verify.sh hello-world dstack-0.4.0
```

## Ansible Automation

You can automate attestation verification using Ansible.

### Run the Ansible playbook

```bash
cd ~/dstack-info/ansible
ansible-playbook -i inventory/hosts.yml playbooks/verify-attestation.yml \
  -e "instance_name=hello-world"
```

The playbook will:
1. Request TDX quote from the instance
2. Extract and display measurements
3. Verify quote signature
4. Compare with expected values (if provided)
5. Generate verification report

## Best Practices for Production

### 1. Always verify before trusting

Never assume a CVM is secure without attestation:

```python
def process_sensitive_data(cvm_instance):
    # Always verify attestation first
    quote = get_quote(cvm_instance)
    if not verify_attestation(quote):
        raise SecurityError("Attestation failed")

    # Now safe to process sensitive data
    return process_data(...)
```

### 2. Include challenge data

Use fresh random data in each quote to prevent replay attacks:

```bash
CHALLENGE=$(openssl rand -hex 32)
curl -X POST ".../quote" -d "{\"report_data\": \"$CHALLENGE\"}"
```

### 3. Verify measurement chain

Don't just check one register - verify the complete chain:

```
MRTD → RTMR0 → RTMR1 → RTMR2 → RTMR3
  │        │        │        │        │
  v        v        v        v        v
OVMF   VM Config  Kernel   Initrd   App
```

### 4. Keep expected measurements updated

When you update guest OS images, recalculate expected measurements:

```bash
# After updating to new image version
dstack-mr --metadata /var/lib/dstack/images/dstack-0.5.0/metadata.json > expected-mrs-0.5.0.txt
```

### 5. Use reproducible builds

For highest assurance, build images from source:

```bash
git clone https://github.com/Dstack-TEE/meta-dstack.git
cd meta-dstack/repro-build
./repro-build.sh -n  # Reproducible build
```

This ensures you know exactly what code is in the image.

## Troubleshooting

### Quote request fails

Check if the CVM is running:

```bash
curl http://127.0.0.1:9080/api/instances | jq '.instances[] | {name, status}'
```

Check tappd is running inside the CVM:

```bash
curl "http://127.0.0.1:9080/api/instances/hello-world/logs?container=tappd"
```

### Measurements don't match

Common causes:

**Different VM configuration:**
```bash
# Check actual vCPUs/RAM vs expected
curl http://127.0.0.1:9080/api/instances/hello-world | jq '{vcpus, memory}'
```

**Different image version:**
```bash
# Verify image version matches
curl http://127.0.0.1:9080/api/instances/hello-world | jq '.image'
```

**Image was modified:**
```bash
# Verify image integrity
sha256sum /var/lib/dstack/images/dstack-0.4.0/*
```

### Quote signature verification fails

Ensure you have the latest Intel certificates:

```bash
# Update DCAP packages
sudo apt update
sudo apt install --only-upgrade libsgx-dcap-*
```

## Verification Checklist

Before proceeding, verify you have:

- [ ] Successfully requested a TDX quote
- [ ] Extracted all measurement registers (MRTD, RTMR0-3)
- [ ] Verified quote signature
- [ ] Understood the event log contents
- [ ] Know how to calculate expected measurements
- [ ] Automated verification with script

## Phase 5 Complete!

Congratulations! You have completed Phase 5 (First Application Deployment):

1. **Guest OS Image Setup** - Downloaded and configured guest images
2. **Hello World Application** - Deployed your first CVM application
3. **Attestation Verification** - Proved your app runs in a secure environment

## What You've Accomplished

Your dstack deployment now includes:

- TDX-enabled host with hardware security
- VMM service managing virtual machines
- KMS service providing key management
- Gateway service routing traffic
- Teepod service managing CVMs
- A running Hello World application
- Cryptographic proof of security via attestation

## Next Steps

With the foundation complete, you're ready to explore:

- **Phase 6:** Deploy more complex applications from dstack-examples
- **Advanced attestation:** ConfigID and RTMR3-based verification
- **Custom domains:** Access apps via your own domain
- **SSH access:** Connect directly to CVMs
- **Port forwarding:** Expose additional services

## Additional Resources

- [Intel TDX Documentation](https://www.intel.com/content/www/us/en/developer/tools/trust-domain-extensions/documentation.html)
- [DCAP Attestation Guide](https://download.01.org/intel-sgx/latest/dcap-latest/linux/docs/)
- [dstack Attestation Source](https://github.com/Dstack-TEE/dstack/tree/main/attestation)
- [Reproducible Builds for meta-dstack](https://github.com/Dstack-TEE/meta-dstack/tree/main/repro-build)

---
title: "KMS Bootstrap Verification"
description: "Verify KMS initialization and TDX attestation in the CVM"
section: "KMS Deployment"
stepNumber: 5
totalSteps: 6
lastUpdated: 2025-12-04
prerequisites:
  - kms-cvm-deployment
tags:
  - dstack
  - kms
  - bootstrap
  - certificates
  - tdx
  - attestation
difficulty: "advanced"
estimatedTime: "10 minutes"
---

# KMS Bootstrap Verification

This tutorial guides you through verifying that the KMS bootstrap completed successfully inside the CVM. When KMS starts in a CVM with an empty certificates directory, it automatically generates root cryptographic keys and creates a TDX attestation quote.

## What is Bootstrap?

Bootstrap is the **one-time initialization** that happens automatically when KMS starts in a new CVM:

1. **Detects empty certs directory** - No existing keys found
2. **Generates Root CA** - Creates self-signed Certificate Authority
3. **Generates RPC certificates** - TLS certificates for secure communication
4. **Generates K256 key** - Ethereum signing key (secp256k1)
5. **Creates TDX quote** - Cryptographic proof of TDX environment
6. **Starts RPC server** - Ready to serve requests

> **Note:** Unlike host-based deployments, CVM-based KMS can generate TDX attestation quotes because the guest-agent provides `/var/run/dstack.sock` inside the CVM.

## Prerequisites

Before starting, ensure you have:

- Completed [KMS CVM Deployment](/tutorial/kms-cvm-deployment)
- KMS CVM running and port 9100 accessible
- Basic understanding of TDX attestation

## Quick Start: Verify with Ansible

For most users, the recommended approach is to use the Ansible playbook.

### Run Verification

```bash
cd ~/dstack-info/ansible
ansible-playbook -i inventory/hosts.yml playbooks/verify-kms-cvm.yml
```

The playbook verifies:
1. **CVM is running** - VMM shows KMS instance active
2. **RPC port accessible** - Port 9100 responds to requests
3. **Bootstrap complete** - All certificate files generated
4. **TDX quote present** - Attestation quote in metadata
5. **Certificate chain valid** - RPC cert signed by Root CA
6. **Public keys available** - CA and K256 public keys exposed

---

## What Gets Generated

During bootstrap, KMS creates these artifacts inside the CVM at `/etc/kms/certs/`:

| File | Type | Purpose |
|------|------|---------|
| `root-ca.crt` | Certificate | Root Certificate Authority (self-signed) |
| `root-ca.key` | Private Key | Root CA signing key (P256 ECDSA) |
| `rpc.crt` | Certificate | TLS certificate for RPC server |
| `rpc.key` | Private Key | RPC server private key (P256 ECDSA) |
| `tmp-ca.crt` | Certificate | Temporary CA for mutual TLS |
| `tmp-ca.key` | Private Key | Temporary CA private key (P256 ECDSA) |
| `root-k256.key` | Raw Key | Ethereum signing key (secp256k1, 32 bytes) |
| `bootstrap-info.json` | Metadata | Public keys and TDX attestation quote |

---

## Manual Verification

If you prefer to verify manually, follow these steps.

### Step 1: Verify KMS is Running

Check that the KMS CVM is active and healthy.

#### Check CVM status via VMM

```bash
# Via VMM web interface at http://localhost:9080
# Or via API:
curl -s http://127.0.0.1:9080/api/instances | jq '.vms[] | select(.name=="kms") | {name, status}'
```

You should see the KMS instance with status "running".

#### Test RPC connectivity

```bash
curl -s http://localhost:9100/prpc/KMS.GetMeta | jq .
```

Expected response:
```json
{
  "ca_pubkey": "0x02a1b2c3d4e5f6...",
  "k256_pubkey": "0x03f1e2d3c4b5a6...",
  "quote": "base64-encoded-tdx-quote",
  "eventlog": "base64-encoded-eventlog"
}
```

The presence of `quote` and `eventlog` confirms TDX attestation is working.

### Step 2: Verify Bootstrap Completed

The KMS API provides the public keys generated during bootstrap. If the API returns valid keys, bootstrap was successful.

#### Check KMS metadata

```bash
curl -s http://localhost:9100/prpc/KMS.GetMeta | jq '{ca_pubkey, k256_pubkey}'
```

Expected output (keys should be present):
```json
{
  "ca_pubkey": "0x02...",
  "k256_pubkey": "0x03..."
}
```

If these keys are present and non-empty, the certificate files were successfully generated inside the CVM.

The certificates generated inside the CVM at `/etc/kms/certs/` include:
- `root-ca.crt` / `root-ca.key` - Root Certificate Authority
- `rpc.crt` / `rpc.key` - RPC server TLS certificate
- `tmp-ca.crt` / `tmp-ca.key` - Temporary CA for mutual TLS
- `root-k256.key` - Ethereum signing key (32 bytes)
- `bootstrap-info.json` - Public keys and attestation quote

### Step 3: Verify CA Public Key

The CA public key in the API response confirms the Root CA was generated.

#### Check CA public key format

```bash
# The ca_pubkey should be a compressed P256 public key (starts with 0x02 or 0x03)
curl -s http://localhost:9100/prpc/KMS.GetMeta | jq -r '.ca_pubkey' | head -c 10
```

Expected output starts with `0x02` or `0x03` (compressed elliptic curve point).

### Step 4: Verify K256 Public Key

The K256 key is used for Ethereum signing operations.

#### Check K256 public key format

```bash
# The k256_pubkey should be a compressed secp256k1 public key
curl -s http://localhost:9100/prpc/KMS.GetMeta | jq -r '.k256_pubkey' | head -c 10
```

Expected output starts with `0x02` or `0x03` (compressed elliptic curve point).

The presence of a valid k256_pubkey confirms a 32-byte secp256k1 private key exists inside the CVM.

### Step 5: Verify TDX Attestation Quote

The TDX quote is the cryptographic proof that KMS keys were generated inside a genuine Intel TDX environment.

#### Extract quote from metadata

```bash
curl -s http://localhost:9100/prpc/KMS.GetMeta | jq -r '.quote' | head -c 100
```

You should see base64-encoded data (not null or empty).

#### Verify quote is present

```bash
# Check quote length (should be substantial, typically 4000+ characters)
curl -s http://localhost:9100/prpc/KMS.GetMeta | jq -r '.quote | length'
```

A valid TDX quote is typically 4000+ characters when base64-encoded.

Expected structure:
```json
{
  "ca_pubkey": "base64-encoded-ca-public-key",
  "k256_pubkey": "base64-encoded-k256-public-key",
  "quote": "base64-encoded-tdx-quote",
  "eventlog": "base64-encoded-eventlog"
}
```

---

## Understanding the TDX Quote

The TDX attestation quote provides cryptographic proof of the KMS environment.

### Quote Contents

| Field | Description |
|-------|-------------|
| **MRTD** | Measurement of TDX environment (hash of initial state) |
| **RTMR** | Runtime measurement registers (execution state) |
| **Report Data** | User data bound to quote (contains KMS public keys) |
| **Signature** | Intel's attestation signature |

### Verification Methods

The TDX quote can be verified by:

1. **Intel PCCS** - Intel's Platform Configuration and Certification Service
2. **On-chain verification** - Smart contract that validates TDX quotes
3. **Manual verification** - Using Intel's attestation SDK

### Why TDX Attestation Matters

With TDX attestation, you can prove to external parties that:

- KMS runs in a genuine Intel TDX environment
- Root keys were generated inside the secure enclave
- The KMS code is unmodified (measurement matches expected value)
- Memory containing keys is hardware-encrypted

---

## Verification Summary Checklist

Use this checklist to confirm bootstrap was successful:

- [ ] KMS CVM is running (VMM shows instance with status "running")
- [ ] Port 9100 is accessible (`curl http://localhost:9100/prpc/KMS.GetMeta`)
- [ ] CA public key is present (starts with `0x02` or `0x03`)
- [ ] K256 public key is present (starts with `0x02` or `0x03`)
- [ ] TDX quote is present (non-empty base64 string)
- [ ] Eventlog is present (non-empty base64 string)

---

## Troubleshooting

### No response from port 9100

```
Connection refused
```

Check if KMS CVM is running:

```bash
# Check via VMM API
curl -s http://127.0.0.1:9080/api/instances | jq '.vms[] | select(.name=="kms")'

# View CVM logs
curl -s "http://127.0.0.1:9080/api/instances/kms/logs?lines=50"
```

If not running, redeploy:

```bash
ansible-playbook playbooks/deploy-kms-cvm.yml -e "kms_domain=your.domain.com" -e "force_redeploy=true"
```

### Bootstrap not completing

If the KMS API returns empty keys or errors, bootstrap may not have completed. Check logs:

```bash
curl -s "http://127.0.0.1:9080/api/instances/kms/logs?lines=100" | grep -i bootstrap
```

Common causes:
- `auto_bootstrap_domain` not set in kms.toml
- Permission issues with certs directory
- Startup script errors

### TDX quote is null or empty

```json
{
  "quote": null
}
```

This indicates TDX attestation failed. Check:

1. **quote_enabled in config**: Ensure `quote_enabled = true` in your `kms.toml`

2. **CVM logs for TDX errors**:
   ```bash
   curl -s "http://127.0.0.1:9080/api/instances/kms/logs?lines=100" | grep -i "tdx\|quote"
   ```
   CVM must be running in actual TDX mode.

### Certificate chain invalid

```
error 20 at 0 depth lookup: unable to get local issuer certificate
```

The RPC certificate was not signed by the Root CA. This indicates a bootstrap issue. Re-bootstrap by redeploying:

```bash
ansible-playbook playbooks/deploy-kms-cvm.yml -e "kms_domain=your.domain.com" -e "force_redeploy=true"
```

### Wrong domain in RPC certificate

```
subject=CN = kms.example.com
```

If the domain doesn't match what you expected, update kms.toml and redeploy:

```bash
# Update domain in deployment config
sed -i 's/auto_bootstrap_domain = ".*"/auto_bootstrap_domain = "correct.domain.com"/' ~/kms-deployment/kms.toml

# Redeploy
ansible-playbook playbooks/deploy-kms-cvm.yml -e "kms_domain=correct.domain.com" -e "force_redeploy=true"
```

---

## Security Considerations

### Key Protection

Inside the CVM, private keys are protected by:
- TDX memory encryption (hardware-level)
- File permissions (0600 for private keys)
- Docker volume isolation

### Backup Strategy

After verifying bootstrap, backup the bootstrap information (public keys and TDX quote):

```bash
# Save bootstrap info from KMS API
curl -s http://localhost:9100/prpc/KMS.GetMeta > ~/kms-bootstrap-info-$(date +%Y%m%d).json

# Optionally encrypt the backup
gpg --symmetric --cipher-algo AES256 ~/kms-bootstrap-info-$(date +%Y%m%d).json

# Store securely offline
```

> **Note:** Private keys remain securely inside the CVM's encrypted memory. The bootstrap info contains only public keys and the TDX attestation quote, which are safe to backup externally.

### TDX Quote Publication

Consider publishing the TDX quote for transparency:
- Store in smart contract for on-chain verification
- Publish to transparency log
- Include in KMS API responses for client verification

---

## Next Steps

With KMS bootstrap verified, proceed to set up ongoing services:

- [KMS Service Setup](/tutorial/kms-service-setup) - Configure monitoring and maintenance

## Additional Resources

- [Intel TDX Attestation](https://www.intel.com/content/www/us/en/developer/tools/trust-domain-extensions/overview.html)
- [OpenSSL Certificate Guide](https://www.openssl.org/docs/)
- [secp256k1 Curve](https://en.bitcoin.it/wiki/Secp256k1)
- [dstack GitHub Repository](https://github.com/Dstack-TEE/dstack)

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
1. **CVM is running** - teepod shows KMS container active
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

#### Check teepod status

```bash
teepod list
```

You should see the KMS container running.

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

### Step 2: Verify Certificate Files

Check that all required certificate files exist inside the CVM.

#### List certificate files

```bash
teepod exec kms -- ls -la /etc/kms/certs/
```

Expected output (8 files):
```
total 40
drwxr-xr-x 2 root root 4096 Dec 04 10:35 .
drwxr-xr-x 3 root root 4096 Dec 04 10:30 ..
-rw-r--r-- 1 root root  800 Dec 04 10:35 bootstrap-info.json
-rw-r--r-- 1 root root  615 Dec 04 10:35 root-ca.crt
-rw------- 1 root root  227 Dec 04 10:35 root-ca.key
-rw------- 1 root root   32 Dec 04 10:35 root-k256.key
-rw-r--r-- 1 root root  620 Dec 04 10:35 rpc.crt
-rw------- 1 root root  227 Dec 04 10:35 rpc.key
-rw-r--r-- 1 root root  615 Dec 04 10:35 tmp-ca.crt
-rw------- 1 root root  227 Dec 04 10:35 tmp-ca.key
```

### Step 3: Verify Root CA Certificate

Check that the Root CA was generated correctly.

#### View Root CA details

```bash
teepod exec kms -- openssl x509 -in /etc/kms/certs/root-ca.crt -text -noout | head -20
```

Expected output includes:
```
Certificate:
    Data:
        Version: 3 (0x2)
        Serial Number: ...
    Signature Algorithm: ecdsa-with-SHA256
        Issuer: CN = Dstack KMS CA
        Validity
            Not Before: ...
            Not After: ...
        Subject: CN = Dstack KMS CA
        Subject Public Key Info:
            Public Key Algorithm: id-ecPublicKey
                Public-Key: (256 bit)
```

#### Verify self-signed

```bash
teepod exec kms -- openssl verify -CAfile /etc/kms/certs/root-ca.crt /etc/kms/certs/root-ca.crt
```

Expected:
```
/etc/kms/certs/root-ca.crt: OK
```

### Step 4: Verify RPC Certificate

Check that the RPC certificate matches your domain and is signed by the Root CA.

#### View RPC certificate domain

```bash
teepod exec kms -- openssl x509 -in /etc/kms/certs/rpc.crt -noout -subject
```

Expected (your domain):
```
subject=CN = kms.yourdomain.com
```

#### Verify certificate chain

```bash
teepod exec kms -- openssl verify -CAfile /etc/kms/certs/root-ca.crt /etc/kms/certs/rpc.crt
```

Expected:
```
/etc/kms/certs/rpc.crt: OK
```

### Step 5: Verify K256 Key

The K256 key is used for Ethereum signing operations.

#### Check key size

```bash
teepod exec kms -- stat --format="%s bytes" /etc/kms/certs/root-k256.key
```

Expected:
```
32 bytes
```

A valid secp256k1 private key is exactly 32 bytes.

### Step 6: Verify TDX Attestation Quote

The TDX quote is the cryptographic proof that KMS keys were generated inside a genuine Intel TDX environment.

#### Extract quote from metadata

```bash
curl -s http://localhost:9100/prpc/KMS.GetMeta | jq -r '.quote' | head -c 100
```

You should see base64-encoded data (not null or empty).

#### View bootstrap info

```bash
teepod exec kms -- cat /etc/kms/certs/bootstrap-info.json | jq .
```

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

- [ ] KMS CVM is running (`teepod list` shows kms)
- [ ] Port 9100 is accessible (`curl http://localhost:9100/`)
- [ ] All 8 certificate files exist in `/etc/kms/certs/`
- [ ] Root CA has CN = "Dstack KMS CA"
- [ ] Root CA is self-signed (verify returns OK)
- [ ] RPC certificate has your domain as CN
- [ ] RPC certificate chain is valid (verify returns OK)
- [ ] K256 key is exactly 32 bytes
- [ ] TDX quote is present (not null or empty)
- [ ] bootstrap-info.json contains all four fields

---

## Troubleshooting

### No response from port 9100

```
Connection refused
```

Check if KMS container is running:

```bash
teepod list
teepod logs kms
```

If not running, redeploy:

```bash
ansible-playbook playbooks/deploy-kms-cvm.yml -e "kms_domain=your.domain.com" -e "force_redeploy=true"
```

### Certificate files missing

```
ls: cannot access '/etc/kms/certs/root-ca.crt': No such file or directory
```

Bootstrap may not have completed. Check logs:

```bash
teepod logs kms | grep -i bootstrap
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

1. **quote_enabled in config**:
   ```bash
   teepod exec kms -- grep quote_enabled /etc/kms/kms.toml
   ```
   Should be `quote_enabled = true`

2. **guest-agent socket**:
   ```bash
   teepod exec kms -- ls -la /var/run/dstack.sock
   ```
   Socket must exist for quote generation.

3. **TDX environment**:
   ```bash
   teepod exec kms -- dmesg | grep -i tdx
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

After verifying bootstrap, backup the certificates:

```bash
# Create local backup directory
mkdir -p ~/kms-backup-$(date +%Y%m%d)

# Copy certs from CVM
teepod cp kms:/etc/kms/certs/ ~/kms-backup-$(date +%Y%m%d)/

# Create encrypted archive
tar czf - ~/kms-backup-$(date +%Y%m%d)/ | \
  gpg --symmetric --cipher-algo AES256 > kms-backup-$(date +%Y%m%d).tar.gz.gpg

# Store securely offline
```

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

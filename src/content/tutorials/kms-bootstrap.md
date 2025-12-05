---
title: "KMS Bootstrap"
description: "Initialize the dstack KMS with root keys and certificates"
section: "KMS Deployment"
stepNumber: 4
totalSteps: 5
lastUpdated: 2025-12-04
prerequisites:
  - kms-build-configuration
tags:
  - dstack
  - kms
  - bootstrap
  - certificates
  - cryptography
difficulty: "advanced"
estimatedTime: "15 minutes"
---

# KMS Bootstrap

This tutorial guides you through bootstrapping the dstack KMS - the one-time initialization process that generates the root cryptographic keys and certificates. This establishes the KMS as a trusted authority for managing application keys.

## Prerequisites

Before starting, ensure you have:

- Completed [KMS Build & Configuration](/tutorial/kms-build-configuration)
- KMS binary installed at /usr/local/bin/dstack-kms
- Configuration file at /etc/kms/kms.toml
- Empty certificates directory at /etc/kms/certs/

## Quick Start: Bootstrap with Ansible

For most users, the recommended approach is to use the Ansible playbook.

### Step 1: Run the Bootstrap Playbook

```bash
cd ~/dstack-info/ansible
ansible-playbook -i inventory/hosts.yml playbooks/bootstrap-kms.yml \
  -e "kms_domain=kms.yourdomain.com"
```

**Without TDX attestation (if tappd is not running):**

```bash
ansible-playbook -i inventory/hosts.yml playbooks/bootstrap-kms.yml \
  -e "kms_domain=kms.yourdomain.com" -e "quote_enabled=false"
```

The playbook accepts these variables:
- `kms_domain` (required) - Domain name for the KMS server
- `quote_enabled` (default: true) - Generate TDX attestation quote. Set to `false` if tappd is not running
- `force_rebootstrap` (default: false) - Destroy existing keys and re-bootstrap

The playbook will:
1. **Verify KMS is configured** for bootstrap mode
2. **Start KMS temporarily** to trigger bootstrap
3. **Generate root CA** and RPC certificates
4. **Generate K256 key** for Ethereum signing
5. **Create TDX quote** (if quote_enabled=true and tappd is running)
6. **Verify all certificate files** were generated (7 files, or 8 with TDX quote)

### Step 2: Verify Bootstrap

```bash
ls -la /etc/kms/certs/
```

You should see 7 core files: root-ca.crt, root-ca.key, rpc.crt, rpc.key, tmp-ca.crt, tmp-ca.key, and root-k256.key. If `quote_enabled=true`, you'll also see bootstrap-info.json (8 files total).

---

## What Gets Generated

Bootstrap is a **one-time initialization** that creates:

| File | Type | Purpose |
|------|------|---------|
| `root-ca.crt` | Certificate | Root Certificate Authority (self-signed) |
| `root-ca.key` | Private Key | Root CA signing key (P256 ECDSA) |
| `rpc.crt` | Certificate | TLS certificate for RPC server |
| `rpc.key` | Private Key | RPC server private key (P256 ECDSA) |
| `tmp-ca.crt` | Certificate | Temporary CA for mutual TLS |
| `tmp-ca.key` | Private Key | Temporary CA private key (P256 ECDSA) |
| `root-k256.key` | Raw Key | Ethereum signing key (secp256k1, 32 bytes) |
| `bootstrap-info.json` | Metadata | Public keys and TDX quote (only with quote_enabled=true) |

---

## Manual Bootstrap

If you prefer to bootstrap manually, follow these steps.

### Step 1: Verify Bootstrap Mode Configuration

Check that KMS is configured for bootstrap mode.

### Check configuration

```bash
cat /etc/kms/kms.toml | grep -A 5 "\[core.onboard\]"
```

Expected output:
```toml
[core.onboard]
enabled = true
auto_bootstrap_domain = ""
quote_enabled = true
address = "0.0.0.0"
port = 9100
```

**Key settings:**
- `enabled = true` - Allows bootstrap/onboard operations
- `auto_bootstrap_domain = ""` - Empty means manual bootstrap via web UI
- `quote_enabled = true` - Generate TDX attestation quote
- `port = 9100` - Web UI and RPC listen port

### Verify certificates directory is empty

```bash
ls -la /etc/kms/certs/
```

Should show an empty directory (or only `.` and `..`).

## Step 2: Start KMS in Bootstrap Mode

Launch the KMS service. It will detect that bootstrap is needed and start the web UI.

### Start KMS

```bash
dstack-kms --config /etc/kms/kms.toml
```

Expected output:
```
2025-11-20T10:35:20Z INFO Starting KMS in bootstrap mode
2025-11-20T10:35:20Z INFO Bootstrap required - keys not found
2025-11-20T10:35:20Z INFO Starting onboarding service
2025-11-20T10:35:20Z INFO Rocket has launched from http://0.0.0.0:9100
```

The KMS is now waiting for you to trigger bootstrap.

### Verify service is running

In a new terminal:

```bash
curl http://localhost:9100/
```

You should see HTML output from the onboarding web interface.

## Step 3: Bootstrap via Web UI

Use the interactive web interface to bootstrap the KMS.

### Open the web UI

```bash
# If running locally with GUI
open http://localhost:9100

# Or use SSH tunnel from your local machine
ssh -L 9100:localhost:9100 user@your-server-ip
# Then open http://localhost:9100 in your browser
```

### Perform bootstrap

1. **Click "Bootstrap"** button on the web page
2. **Enter domain name** - Use your KMS domain (e.g., `kms.example.com`)
3. **Click "Submit"**
4. **Wait for completion** - Keys are generated (takes a few seconds)
5. **Copy the output** - Save the public keys and quote for your records
6. **Click "Finish Setup"**

The service will shut down after clicking Finish.

### Alternative: Bootstrap via API

If you prefer command-line:

```bash
# Trigger bootstrap
curl -X POST http://localhost:9100/prpc/Onboard.Bootstrap?json \
  -H "Content-Type: application/json" \
  -d '{"domain":"kms.example.com"}' | jq .

# Finish bootstrap
curl http://localhost:9100/finish
```

Expected API response:
```json
{
  "ca_pubkey": "0x02a1b2c3d4e5f6...",
  "k256_pubkey": "0x03f1e2d3c4b5a6...",
  "quote": "0xa0b1c2d3e4f5...",
  "eventlog": "0x01020304050607..."
}
```

## Step 4: Verify Bootstrap Completion

Check that all keys and certificates were generated correctly.

### List generated files

```bash
ls -la /etc/kms/certs/
```

Expected output (8 files):
```
total 40
drwxr-xr-x 2 ubuntu ubuntu 4096 Nov 20 10:35 .
drwxr-xr-x 3 ubuntu ubuntu 4096 Nov 20 10:30 ..
-rw-r--r-- 1 ubuntu ubuntu  424 Nov 20 10:35 bootstrap-info.json
-rw-r--r-- 1 ubuntu ubuntu  615 Nov 20 10:35 root-ca.crt
-rw------- 1 ubuntu ubuntu  227 Nov 20 10:35 root-ca.key
-rw------- 1 ubuntu ubuntu   32 Nov 20 10:35 root-k256.key
-rw-r--r-- 1 ubuntu ubuntu  620 Nov 20 10:35 rpc.crt
-rw------- 1 ubuntu ubuntu  227 Nov 20 10:35 rpc.key
-rw-r--r-- 1 ubuntu ubuntu  615 Nov 20 10:35 tmp-ca.crt
-rw------- 1 ubuntu ubuntu  227 Nov 20 10:35 tmp-ca.key
```

### Verify Root CA certificate

```bash
openssl x509 -in /etc/kms/certs/root-ca.crt -text -noout | grep -A 2 "Subject:"
```

Expected:
```
Subject: CN = Dstack KMS CA
Subject Public Key Info:
    Public Key Algorithm: id-ecPublicKey
```

### Verify RPC certificate domain

```bash
openssl x509 -in /etc/kms/certs/rpc.crt -text -noout | grep -A 1 "Subject:"
```

Expected:
```
Subject: CN = kms.example.com
Subject Public Key Info:
```

### Check certificate chain

```bash
openssl verify -CAfile /etc/kms/certs/root-ca.crt /etc/kms/certs/rpc.crt
```

Expected:
```
/etc/kms/certs/rpc.crt: OK
```

### Inspect bootstrap metadata

```bash
cat /etc/kms/certs/bootstrap-info.json | jq .
```

Expected:
```json
{
  "ca_pubkey": "base64-encoded-public-key",
  "k256_pubkey": "base64-encoded-k256-key",
  "quote": "base64-encoded-tdx-quote",
  "eventlog": "base64-encoded-eventlog"
}
```

---

## Automatic Bootstrap (Optional)

For automation, you can configure automatic bootstrap.

### Update configuration

```bash
# Edit /etc/kms/kms.toml
nano /etc/kms/kms.toml
```

Change:
```toml
[core.onboard]
auto_bootstrap_domain = "kms.example.com"  # Set your domain
```

### Run automatic bootstrap

```bash
dstack-kms --config /etc/kms/kms.toml
```

The KMS will:
1. Detect bootstrap is needed
2. Generate all keys automatically
3. Exit immediately

This is useful for:
- Ansible automation
- CI/CD pipelines
- Reproducible deployments

## Troubleshooting

### Keys already exist

```
Error: Bootstrap already completed
```

The KMS was previously bootstrapped. To re-bootstrap (⚠️ destroys existing keys):

```bash
# Backup existing keys first!
sudo cp -r /etc/kms/certs /etc/kms/certs.backup

# Remove existing keys
sudo rm -f /etc/kms/certs/*

# Re-run bootstrap
dstack-kms --config /etc/kms/kms.toml
```

### Permission denied writing certificates

```
Error: Permission denied: /etc/kms/certs/root-ca.key
```

Fix permissions:

```bash
sudo chown -R $USER:$USER /etc/kms/certs
chmod 755 /etc/kms/certs
```

### TDX quote generation failed

```
Error: tappd socket not found
```

The KMS cannot generate TDX quote because tappd is not running. Options:

**Option 1:** Disable quote generation (for testing):
```toml
[core.onboard]
quote_enabled = false
```

**Option 2:** Start tappd service (for production):
```bash
# tappd must be running on the TEE host
systemctl status tappd
```

### Port already in use

```
Error: Address already in use (os error 98)
```

Another service is using port 9100:

```bash
# Check what's using the port
sudo lsof -i :9100

# Change port in config
nano /etc/kms/kms.toml
# Update: port = 9101
```

### Web UI not accessible

If you can't access http://localhost:9100:

```bash
# Check KMS is running
ps aux | grep dstack-kms

# Check port is listening
ss -tlnp | grep 9100

# Test locally
curl -v http://localhost:9100/
```

## Security Considerations

### Key Protection

- **root-ca.key** - Most critical key, signs all certificates
- **root-k256.key** - Used for Ethereum signing operations
- Both should have restrictive permissions (600 or 400)

### Backup Strategy

```bash
# Create encrypted backup
tar czf - /etc/kms/certs/ | \
  gpg --symmetric --cipher-algo AES256 > kms-keys-$(date +%Y%m%d).tar.gz.gpg

# Store backup offline securely
# - Hardware security module (HSM)
# - Offline encrypted drive
# - Secure key management system
```

### TDX Quote Verification

The TDX quote in `bootstrap-info.json` can be verified by:

1. External parties querying `/prpc/KMS.GetMeta`
2. Intel PCCS (Platform Configuration and Certification Service)
3. Smart contract verification (on-chain quote verification)

This proves the keys were generated inside a genuine Intel TDX environment.

## Next Steps

With KMS bootstrapped, the next step is to configure systemd services for KMS and auth-eth (tutorial coming soon).

## Additional Resources

- [OpenSSL Certificate Guide](https://www.openssl.org/docs/)
- [Intel TDX Attestation](https://www.intel.com/content/www/us/en/developer/tools/trust-domain-extensions/overview.html)
- [secp256k1 Curve](https://en.bitcoin.it/wiki/Secp256k1)
- [dstack GitHub Repository](https://github.com/Dstack-TEE/dstack)

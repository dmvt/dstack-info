---
title: "KMS Service Management"
description: "Manage and monitor the dstack KMS running inside a CVM"
section: "KMS Deployment"
stepNumber: 6
totalSteps: 6
lastUpdated: 2025-12-04
prerequisites:
  - kms-bootstrap
tags:
  - dstack
  - kms
  - cvm
  - teepod
  - monitoring
  - management
difficulty: "intermediate"
estimatedTime: "15 minutes"
---

# KMS Service Management

This tutorial guides you through managing and monitoring the dstack Key Management Service (KMS) running inside a Confidential Virtual Machine (CVM). Unlike traditional systemd services, KMS operates within a TDX-protected CVM managed by teepod.

## Understanding the CVM Architecture

KMS runs inside a CVM rather than as a host systemd service. This provides:

| Benefit | Description |
|---------|-------------|
| **TDX Protection** | Keys protected by hardware memory encryption |
| **TDX Attestation** | Cryptographic proof of KMS integrity |
| **Isolation** | KMS isolated from host operating system |
| **Container Management** | Standard Docker container inside CVM |

### Service Components

Inside the KMS CVM, two services run:

| Service | Port | Purpose |
|---------|------|---------|
| **auth-eth** | 9200 | Webhook that verifies permissions via Ethereum smart contracts |
| **KMS** | 9100 | Main KMS service that manages cryptographic keys |

Both services run inside the same container, managed by a startup script.

## Prerequisites

Before starting, ensure you have:

- Completed [KMS Bootstrap Verification](/tutorial/kms-bootstrap)
- KMS CVM running (`teepod list` shows kms)
- Access to teepod command-line tool

## Quick Start: Service Management with Ansible

For most users, the recommended approach is to use Ansible playbooks.

### Check KMS Status

```bash
cd ~/dstack-info/ansible
ansible-playbook -i inventory/hosts.yml playbooks/verify-kms-cvm.yml
```

### Restart KMS CVM

```bash
ansible-playbook -i inventory/hosts.yml playbooks/deploy-kms-cvm.yml \
  -e "kms_domain=kms.yourdomain.com" -e "force_redeploy=true"
```

> **Warning:** Force redeploy will regenerate certificates if the volume is not persistent.

---

## CVM Management Commands

### View Running CVMs

List all CVMs including KMS:

```bash
teepod list
```

Expected output:
```
NAME    STATUS    PORTS           CREATED
kms     running   9100:9100       2025-12-04 10:00:00
```

### Check KMS CVM Status

Get detailed status for the KMS CVM:

```bash
teepod status kms
```

### View KMS Logs

View recent logs from inside the CVM:

```bash
teepod logs kms
```

For real-time log streaming:

```bash
teepod logs kms -f
```

### Execute Commands Inside CVM

Run commands inside the running KMS CVM:

```bash
# Check processes inside CVM
teepod exec kms -- ps aux

# View KMS configuration
teepod exec kms -- cat /etc/kms/kms.toml

# Check certificate files
teepod exec kms -- ls -la /etc/kms/certs/

# View auth-eth logs
teepod exec kms -- cat /var/log/auth-eth.log
```

---

## Stopping and Starting KMS

### Stop KMS CVM

```bash
teepod stop kms
```

### Start KMS CVM

```bash
teepod start kms
```

### Restart KMS CVM

```bash
teepod restart kms
```

### Remove KMS CVM (Warning: Data Loss)

```bash
# Stop the CVM first
teepod stop kms

# Remove the CVM and its volumes
teepod rm kms
```

> **Warning:** Removing the CVM will delete the certificate volume. Always backup certificates before removing.

---

## Monitoring and Health Checks

### Check KMS RPC Health

Verify KMS is responding to RPC requests:

```bash
curl -s http://localhost:9100/prpc/KMS.GetMeta | jq .
```

Expected response includes `ca_pubkey`, `k256_pubkey`, and `quote`.

### Check Auth-ETH Health

Verify auth-eth webhook is responding:

```bash
curl -s http://localhost:9200/health
```

Or test with a sample authorization request:

```bash
curl -X POST http://localhost:9200 \
  -H "Content-Type: application/json" \
  -d '{"method":"is_app_allowed","params":{"app_id":"test"}}'
```

### Check Port Connectivity

Verify ports are accessible:

```bash
# Check KMS RPC port
nc -zv localhost 9100

# Check auth-eth port (inside CVM)
teepod exec kms -- nc -zv localhost 9200
```

### Resource Usage

Check CVM resource usage:

```bash
teepod stats kms
```

---

## Log Analysis

### View Bootstrap Logs

If bootstrap failed, check the bootstrap log:

```bash
teepod logs kms | grep -i bootstrap
```

Look for:
- "Bootstrap required" - Indicates certs directory was empty
- "Generating root CA" - CA generation started
- "Bootstrap complete" - All keys generated successfully

### View Auth-ETH Logs

Check authorization service logs:

```bash
teepod logs kms | grep -i auth-eth
```

Look for:
- "Server listening" - Auth-eth started successfully
- "Connected to Ethereum RPC" - RPC connection established
- "Contract loaded" - Smart contract accessible

### View KMS RPC Logs

Check KMS server logs:

```bash
teepod logs kms | grep -i "rpc\|rocket"
```

Look for:
- "Rocket has launched" - RPC server started
- "Incoming request" - Requests being processed

---

## Configuration Updates

### Update KMS Configuration

To update KMS configuration:

1. Edit the configuration in deployment directory:
   ```bash
   nano ~/kms-deployment/kms.toml
   ```

2. Redeploy the CVM:
   ```bash
   ansible-playbook playbooks/deploy-kms-cvm.yml \
     -e "kms_domain=kms.yourdomain.com"
   ```

> **Note:** Configuration changes require CVM redeployment. Existing certificates are preserved if using persistent volumes.

### Update Auth-ETH Environment

To update Ethereum RPC or contract address:

1. Edit the environment file:
   ```bash
   nano ~/kms-deployment/auth-eth.env
   ```

2. Redeploy the CVM:
   ```bash
   ansible-playbook playbooks/deploy-kms-cvm.yml \
     -e "kms_domain=kms.yourdomain.com"
   ```

---

## Backup and Recovery

### Backup Certificates

Create a backup of KMS certificates:

```bash
# Create backup directory
mkdir -p ~/kms-backups

# Copy certificates from CVM
teepod cp kms:/etc/kms/certs/ ~/kms-backups/certs-$(date +%Y%m%d)/

# Create encrypted archive
cd ~/kms-backups
tar czf - certs-$(date +%Y%m%d)/ | \
  gpg --symmetric --cipher-algo AES256 > kms-certs-$(date +%Y%m%d).tar.gz.gpg

# Verify backup
gpg --decrypt kms-certs-$(date +%Y%m%d).tar.gz.gpg | tar tzf -
```

### Restore Certificates

To restore certificates to a new CVM:

1. Decrypt and extract backup:
   ```bash
   gpg --decrypt kms-certs-YYYYMMDD.tar.gz.gpg | tar xzf -
   ```

2. Copy to CVM:
   ```bash
   teepod cp certs-YYYYMMDD/ kms:/etc/kms/certs/
   ```

3. Restart KMS:
   ```bash
   teepod restart kms
   ```

---

## Troubleshooting

### CVM Not Starting

Check teepod logs:

```bash
teepod logs kms
```

Common issues:
- **Docker image not found**: Rebuild with `docker build -t dstack-kms:latest .`
- **Port conflict**: Check if 9100 is already in use
- **VMM not running**: Start VMM with `sudo systemctl start dstack-vmm`

### KMS Not Responding

If KMS port 9100 doesn't respond:

```bash
# Check if CVM is running
teepod list

# Check processes inside CVM
teepod exec kms -- ps aux

# View recent logs
teepod logs kms -n 50

# Check if startup script completed
teepod exec kms -- cat /var/log/startup.log
```

### Auth-ETH Connection Failed

If KMS can't reach auth-eth:

```bash
# Check auth-eth is running inside CVM
teepod exec kms -- curl localhost:9200/health

# Check environment variables loaded
teepod exec kms -- cat /etc/kms/auth-eth.env

# Check network inside container
teepod exec kms -- netstat -tlnp
```

### TDX Quote Missing

If TDX quote is null:

```bash
# Check quote_enabled setting
teepod exec kms -- grep quote_enabled /etc/kms/kms.toml

# Check guest-agent socket
teepod exec kms -- ls -la /var/run/dstack.sock

# Check TDX is available in CVM
teepod exec kms -- dmesg | grep -i tdx
```

### Certificate Chain Issues

If certificate verification fails:

```bash
# View certificate details
teepod exec kms -- openssl x509 -in /etc/kms/certs/root-ca.crt -text -noout

# Verify chain
teepod exec kms -- openssl verify \
  -CAfile /etc/kms/certs/root-ca.crt \
  /etc/kms/certs/rpc.crt
```

---

## Security Best Practices

### Regular Backups

Schedule regular certificate backups:

```bash
# Add to crontab
crontab -e

# Add this line for weekly backups
0 2 * * 0 ~/dstack-info/scripts/backup-kms-certs.sh
```

### Monitor for Unauthorized Access

Check KMS logs regularly for unauthorized access attempts:

```bash
# Search for denied requests
teepod logs kms | grep -i "denied\|unauthorized\|failed"
```

### Keep Images Updated

Periodically rebuild and redeploy with latest security patches:

```bash
# Update base image and rebuild
cd ~/kms-deployment
docker pull ubuntu:24.04
docker build -t dstack-kms:latest --no-cache .

# Redeploy
ansible-playbook playbooks/deploy-kms-cvm.yml \
  -e "kms_domain=kms.yourdomain.com" -e "force_redeploy=true"
```

### Audit TDX Quote

Periodically verify TDX attestation is working:

```bash
curl -s http://localhost:9100/prpc/KMS.GetMeta | jq -r '.quote' | base64 -d | xxd | head
```

The quote should contain valid binary data, not null or empty.

---

## Service Architecture Summary

### CVM Internal Architecture

```
┌─────────────────────────────────────────────────────┐
│                    KMS CVM                          │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │           Docker Container                   │   │
│  │                                              │   │
│  │  start-kms.sh                               │   │
│  │       │                                      │   │
│  │       ├── auth-eth (background)             │   │
│  │       │   └── port 9200                     │   │
│  │       │                                      │   │
│  │       └── dstack-kms (foreground)           │   │
│  │           └── port 9100                     │   │
│  │                                              │   │
│  │  Volumes:                                    │   │
│  │    /etc/kms/kms.toml (config, read-only)   │   │
│  │    /etc/kms/auth-eth.env (config)          │   │
│  │    /etc/kms/certs/ (persistent volume)     │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  guest-agent: /var/run/dstack.sock                 │
│    (provides TDX attestation)                      │
└─────────────────────────────────────────────────────┘
          │
          │ Port 9100 exposed
          ▼
    External Clients
```

### External Dependencies

| Component | Purpose | Location |
|-----------|---------|----------|
| dstack-vmm | Manages CVM lifecycle | Host systemd service |
| teepod | CVM deployment tool | Host CLI |
| Ethereum RPC | Smart contract queries | External (Alchemy) |
| Intel PCCS | Quote verification | External (Intel) |

---

## Next Steps

You have completed Phase 3 (KMS Deployment). KMS is now running in a TDX-protected CVM with:
- Valid TDX attestation quotes
- Automatic key generation
- Ethereum-based authorization

The next phase is Gateway Deployment, which will enable external access to your dstack installation. Gateway tutorials are coming soon.

## Additional Resources

- [teepod Documentation](https://github.com/Dstack-TEE/dstack)
- [Docker Documentation](https://docs.docker.com/)
- [Intel TDX Attestation](https://www.intel.com/content/www/us/en/developer/tools/trust-domain-extensions/overview.html)
- [dstack GitHub Repository](https://github.com/Dstack-TEE/dstack)

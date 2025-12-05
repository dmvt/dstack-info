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
  - vmm
  - monitoring
  - management
difficulty: "intermediate"
estimatedTime: "15 minutes"
---

# KMS Service Management

This tutorial guides you through managing and monitoring the dstack Key Management Service (KMS) running inside a Confidential Virtual Machine (CVM). Unlike traditional systemd services, KMS operates within a TDX-protected CVM managed by the dstack VMM.

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
- KMS CVM running (check via VMM web interface or API)
- Access to VMM web interface at http://localhost:9080

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

List all CVMs including KMS using the VMM web interface or API:

#### Via Web Interface
Open http://localhost:9080 to see the VM list with status, ports, and actions.

#### Via API
```bash
curl -s http://127.0.0.1:9080/api/instances | jq '.instances[] | {name, status, uptime}'
```

Expected output:
```json
{
  "name": "kms",
  "status": "running",
  "uptime": "2h 30m"
}
```

### Check KMS CVM Status

Get detailed status for the KMS CVM:

```bash
curl -s http://127.0.0.1:9080/api/instances/kms | jq '{status, vcpus, memory, ports}'
```

### View KMS Logs

View recent logs from inside the CVM:

```bash
curl -s "http://127.0.0.1:9080/api/instances/kms/logs?lines=50"
```

Or use the **Logs** button in the VMM web interface for interactive viewing.

### KMS API Commands

Query the KMS service directly:

```bash
# Get KMS metadata (public keys and TDX quote)
curl -s http://localhost:9100/prpc/KMS.GetMeta | jq .

# View CVM logs for startup/configuration info
curl -s "http://127.0.0.1:9080/api/instances/kms/logs?lines=100"
```

---

## Stopping and Starting KMS

### Stop KMS CVM

Via VMM web interface: Click **Stop** on the KMS instance.

Via API:
```bash
curl -X POST http://127.0.0.1:9080/api/instances/kms/stop
```

### Start KMS CVM

Via VMM web interface: Click **Start** on the KMS instance.

Via API:
```bash
curl -X POST http://127.0.0.1:9080/api/instances/kms/start
```

### Restart KMS CVM

Via VMM web interface: Click **Restart** on the KMS instance.

Via API:
```bash
curl -X POST http://127.0.0.1:9080/api/instances/kms/restart
```

### Remove KMS CVM (Warning: Data Loss)

Via VMM web interface: Click **Delete** on the KMS instance.

Via API:
```bash
# Stop the CVM first
curl -X POST http://127.0.0.1:9080/api/instances/kms/stop

# Remove the CVM
curl -X DELETE http://127.0.0.1:9080/api/instances/kms
```

> **Warning:** Removing the CVM will delete the certificate volume. Always backup bootstrap info before removing.

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
# Via CVM logs - internal commands not available via API
# curl -s "http://127.0.0.1:9080/api/instances/kms/logs?lines=50"
# nc -zv localhost 9200
```

### Resource Usage

Check CVM resource usage:

```bash
curl -s http://127.0.0.1:9080/api/instances/kms | jq '{vcpus, memory}'
```

---

## Log Analysis

### View Bootstrap Logs

If bootstrap failed, check the bootstrap log:

```bash
curl -s "http://127.0.0.1:9080/api/instances/kms/logs?lines=100" | grep -i bootstrap
```

Look for:
- "Bootstrap required" - Indicates certs directory was empty
- "Generating root CA" - CA generation started
- "Bootstrap complete" - All keys generated successfully

### View Auth-ETH Logs

Check authorization service logs:

```bash
curl -s "http://127.0.0.1:9080/api/instances/kms/logs?lines=100" | grep -i auth-eth
```

Look for:
- "Server listening" - Auth-eth started successfully
- "Connected to Ethereum RPC" - RPC connection established
- "Contract loaded" - Smart contract accessible

### View KMS RPC Logs

Check KMS server logs:

```bash
curl -s "http://127.0.0.1:9080/api/instances/kms/logs?lines=100" | grep -i "rpc\|rocket"
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

### Backup Bootstrap Information

Since KMS runs inside a CVM with TDX protection, private keys cannot be directly extracted (this is a security feature). Instead, backup the public bootstrap information:

```bash
# Create backup directory
mkdir -p ~/kms-backups

# Save bootstrap info (public keys and TDX quote) from KMS API
curl -s http://localhost:9100/prpc/KMS.GetMeta > ~/kms-backups/kms-bootstrap-info-$(date +%Y%m%d).json

# Optionally encrypt the backup
gpg --symmetric --cipher-algo AES256 ~/kms-backups/kms-bootstrap-info-$(date +%Y%m%d).json

# Verify backup contents
cat ~/kms-backups/kms-bootstrap-info-$(date +%Y%m%d).json | jq .
```

> **Note:** Private keys remain inside the CVM's TDX-encrypted memory for security. The bootstrap info contains public keys and attestation quote, which are safe to backup externally.

### Certificate Persistence

KMS certificates persist in a Docker named volume (`kms-certs`) inside the CVM. To ensure persistence:

1. **Container restarts**: Certificates survive container restarts automatically
2. **CVM restarts**: Depending on VMM configuration, volumes may persist
3. **Full redeployment**: Use `force_redeploy=false` to preserve existing volumes

### Restore from Backup

If you need to restore KMS after data loss, the recommended approach is to redeploy:

```bash
# Redeploy KMS CVM (will re-bootstrap with new keys)
ansible-playbook playbooks/deploy-kms-cvm.yml \
  -e "kms_domain=kms.yourdomain.com" -e "force_redeploy=true"

# Restart KMS via VMM API
curl -X POST http://127.0.0.1:9080/api/instances/kms/restart
```

> **Warning:** Re-bootstrapping generates new keys. Any applications using the old KMS public keys will need to be updated.

---

## Troubleshooting

### CVM Not Starting

Check CVM logs via VMM:

```bash
curl -s "http://127.0.0.1:9080/api/instances/kms/logs?lines=50"
```

Common issues:
- **Docker image not found**: Rebuild with `docker build -t dstack-kms:latest .`
- **Port conflict**: Check if 9100 is already in use
- **VMM not running**: Start VMM with `sudo systemctl start dstack-vmm`

### KMS Not Responding

If KMS port 9100 doesn't respond:

```bash
# Check if CVM is running
curl -s http://127.0.0.1:9080/api/instances | jq '.instances[] | {name, status}'

# Check processes inside CVM
# Via CVM logs - internal commands not available via API
# curl -s "http://127.0.0.1:9080/api/instances/kms/logs?lines=50"
# ps aux

# View recent logs
curl -s "http://127.0.0.1:9080/api/instances/kms/logs?lines=50" -n 50

# Check if startup script completed
# Via CVM logs - internal commands not available via API
# curl -s "http://127.0.0.1:9080/api/instances/kms/logs?lines=50"
# cat /var/log/startup.log
```

### Auth-ETH Connection Failed

If KMS can't reach auth-eth:

```bash
# Check auth-eth is running inside CVM
# Via CVM logs - internal commands not available via API
# curl -s "http://127.0.0.1:9080/api/instances/kms/logs?lines=50"
# curl localhost:9200/health

# Check environment variables loaded
# Via CVM logs - internal commands not available via API
# curl -s "http://127.0.0.1:9080/api/instances/kms/logs?lines=50"
# cat /etc/kms/auth-eth.env

# Check network inside container
# Via CVM logs - internal commands not available via API
# curl -s "http://127.0.0.1:9080/api/instances/kms/logs?lines=50"
# netstat -tlnp
```

### TDX Quote Missing

If TDX quote is null:

```bash
# Check quote_enabled setting
# Via CVM logs - internal commands not available via API
# curl -s "http://127.0.0.1:9080/api/instances/kms/logs?lines=50"
# grep quote_enabled /etc/kms/kms.toml

# Check guest-agent socket
# Via CVM logs - internal commands not available via API
# curl -s "http://127.0.0.1:9080/api/instances/kms/logs?lines=50"
# ls -la /var/run/dstack.sock

# Check TDX is available in CVM
# Via CVM logs - internal commands not available via API
# curl -s "http://127.0.0.1:9080/api/instances/kms/logs?lines=50"
# dmesg | grep -i tdx
```

### Certificate Chain Issues

If certificate verification fails:

```bash
# View certificate details
# Via CVM logs - internal commands not available via API
# curl -s "http://127.0.0.1:9080/api/instances/kms/logs?lines=50"
# openssl x509 -in /etc/kms/certs/root-ca.crt -text -noout

# Verify chain
# Via CVM logs - internal commands not available via API
# curl -s "http://127.0.0.1:9080/api/instances/kms/logs?lines=50"
# openssl verify \
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
curl -s "http://127.0.0.1:9080/api/instances/kms/logs?lines=100" | grep -i "denied\|unauthorized\|failed"
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
| dstack-vmm | Manages CVM lifecycle, web UI, API | Host systemd service |
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

- [dstack GitHub Repository](https://github.com/Dstack-TEE/dstack)
- [Docker Documentation](https://docs.docker.com/)
- [Intel TDX Attestation](https://www.intel.com/content/www/us/en/developer/tools/trust-domain-extensions/overview.html)

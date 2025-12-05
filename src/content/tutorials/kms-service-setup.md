---
title: "KMS Service Setup"
description: "Configure dstack KMS to run as systemd services with automatic startup"
section: "KMS Deployment"
stepNumber: 5
totalSteps: 5
lastUpdated: 2025-12-04
prerequisites:
  - kms-bootstrap
tags:
  - dstack
  - kms
  - systemd
  - service
  - auth-eth
difficulty: "intermediate"
estimatedTime: "15 minutes"
---

# KMS Service Setup

This tutorial guides you through setting up the dstack Key Management Service (KMS) as systemd services. Running KMS as services ensures they start automatically on boot and restart if they crash.

## Prerequisites

Before starting, ensure you have:

- Completed [KMS Bootstrap](/tutorial/kms-bootstrap)
- KMS binary installed at /usr/local/bin/dstack-kms
- Configuration file at /etc/kms/kms.toml
- Auth-eth environment file at /etc/kms/auth-eth.env
- Bootstrap completed with root keys generated

## Quick Start: Setup with Ansible

For most users, the recommended approach is to use the Ansible playbook.

### Step 1: Run the Service Setup Playbook

```bash
cd ~/dstack-info/ansible
ansible-playbook -i inventory/hosts.yml playbooks/setup-kms-services.yml
```

The playbook will:
1. **Create auth-eth systemd service** (starts before KMS)
2. **Create KMS systemd service** (depends on auth-eth)
3. **Enable both services** for automatic startup
4. **Start both services** and verify they're running

### Step 2: Verify Services

```bash
ansible-playbook -i inventory/hosts.yml playbooks/verify-kms-services.yml
```

---

## What Gets Set Up

The KMS deployment requires two services:

| Service | Port | Purpose |
|---------|------|---------|
| **dstack-auth-eth** | 9200 | Webhook that verifies permissions via Ethereum smart contracts |
| **dstack-kms** | 9100 | Main KMS service that manages cryptographic keys |

Both services work together: KMS calls auth-eth to verify app permissions before releasing keys.

---

## Manual Setup

If you prefer to set up services manually, follow these steps.

### Step 1: Create Auth-ETH Systemd Service

The auth-eth service must start before KMS, as KMS depends on it for authorization.

### Create the service file

```bash
sudo tee /etc/systemd/system/dstack-auth-eth.service > /dev/null <<'EOF'
[Unit]
Description=dstack KMS Auth-ETH Webhook
Documentation=https://dstack.info
After=network.target
Before=dstack-kms.service

[Service]
Type=simple
User=root
WorkingDirectory=/root/dstack/kms/auth-eth
EnvironmentFile=/etc/kms/auth-eth.env
ExecStart=/usr/bin/node /root/dstack/kms/auth-eth/dist/src/main.js
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal

# Security hardening
NoNewPrivileges=true
ProtectSystem=strict
ReadWritePaths=/var/log /tmp

[Install]
WantedBy=multi-user.target
EOF
```

### Service Configuration Explained

| Setting | Description |
|---------|-------------|
| `Type=simple` | Service runs as a foreground process |
| `WorkingDirectory` | Run from auth-eth build directory |
| `EnvironmentFile` | Load Ethereum RPC and contract config |
| `Restart=always` | Automatically restart on failure |
| `Before=dstack-kms.service` | Start before KMS |

## Step 2: Create KMS Systemd Service

Create the systemd service unit file for dstack-kms:

```bash
sudo tee /etc/systemd/system/dstack-kms.service > /dev/null <<'EOF'
[Unit]
Description=dstack Key Management Service
Documentation=https://dstack.info
After=network.target dstack-auth-eth.service
Requires=dstack-auth-eth.service

[Service]
Type=simple
User=root
ExecStart=/usr/local/bin/dstack-kms --config /etc/kms/kms.toml
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal

# Security hardening
NoNewPrivileges=false
ProtectSystem=strict
ReadWritePaths=/var/run/kms /var/log/kms /etc/kms/certs /tmp

[Install]
WantedBy=multi-user.target
EOF
```

### Service Configuration Explained

| Setting | Description |
|---------|-------------|
| `Type=simple` | Service runs as a foreground process |
| `User=root` | KMS requires root for cryptographic operations |
| `After` | Start after network and auth-eth |
| `Requires` | KMS cannot run without auth-eth |
| `Restart=always` | Automatically restart on failure |
| `ReadWritePaths` | Directories KMS can write to |

## Step 3: Reload Systemd and Enable Services

Reload systemd to recognize the new services:

```bash
sudo systemctl daemon-reload
```

Enable both services to start on boot:

```bash
sudo systemctl enable dstack-auth-eth dstack-kms
```

You should see output like:

```
Created symlink /etc/systemd/system/multi-user.target.wants/dstack-auth-eth.service → /etc/systemd/system/dstack-auth-eth.service.
Created symlink /etc/systemd/system/multi-user.target.wants/dstack-kms.service → /etc/systemd/system/dstack-kms.service.
```

## Step 4: Start the Services

Start both services (auth-eth first, then KMS):

```bash
sudo systemctl start dstack-auth-eth
sudo systemctl start dstack-kms
```

Check the service status:

```bash
sudo systemctl status dstack-auth-eth
```

Expected output shows auth-eth as active:

```
● dstack-auth-eth.service - dstack KMS Auth-ETH Webhook
     Loaded: loaded (/etc/systemd/system/dstack-auth-eth.service; enabled; preset: enabled)
     Active: active (running) since Mon 2025-12-01 10:00:00 UTC; 5s ago
       Docs: https://dstack.info
   Main PID: 12345 (node)
      Tasks: 11 (limit: 154303)
     Memory: 45.2M
        CPU: 234ms
     CGroup: /system.slice/dstack-auth-eth.service
             └─12345 /usr/bin/node /root/dstack/kms/auth-eth/dist/src/main.js
```

Check KMS status:

```bash
sudo systemctl status dstack-kms
```

Expected output shows KMS as active:

```
● dstack-kms.service - dstack Key Management Service
     Loaded: loaded (/etc/systemd/system/dstack-kms.service; enabled; preset: enabled)
     Active: active (running) since Mon 2025-12-01 10:00:05 UTC; 5s ago
       Docs: https://dstack.info
   Main PID: 12350 (dstack-kms)
      Tasks: 9 (limit: 154303)
     Memory: 15.2M
        CPU: 123ms
     CGroup: /system.slice/dstack-kms.service
             └─12350 /usr/local/bin/dstack-kms --config /etc/kms/kms.toml
```

## Step 5: Verify Service Operation

### Check Auth-ETH Logs

View recent logs from the auth-eth service:

```bash
sudo journalctl -u dstack-auth-eth -n 50
```

For real-time log streaming:

```bash
sudo journalctl -u dstack-auth-eth -f
```

Expected logs show:

```
Server listening on 127.0.0.1:9200
Connected to Ethereum RPC: https://eth-sepolia.g.alchemy.com/v2/...
KMS contract loaded: 0x...
```

### Check KMS Logs

View recent logs from the KMS service:

```bash
sudo journalctl -u dstack-kms -n 50
```

Expected logs show:

```
KMS initialized successfully
RPC server listening on 0.0.0.0:9100
Auth API configured: webhook at http://127.0.0.1:9200
```

### Check Socket File

Verify the KMS created its RPC socket:

```bash
ls -la /var/run/kms/
```

Expected output:

```
drwxr-xr-x 2 root root  60 Dec  1 10:00 .
drwxr-xr-x 27 root root 840 Dec  1 10:00 ..
```

### Test Service Restart

Verify both services automatically restart after stopping:

```bash
# Get the current PIDs
sudo systemctl show dstack-kms --property=MainPID
sudo systemctl show dstack-auth-eth --property=MainPID

# Kill both processes (simulating crash)
sudo kill $(sudo systemctl show dstack-kms --property=MainPID --value)
sudo kill $(sudo systemctl show dstack-auth-eth --property=MainPID --value)

# Wait for restart
sleep 6

# Check status - should show new PIDs
sudo systemctl status dstack-kms
sudo systemctl status dstack-auth-eth
```

Both services should show as active with new PIDs.

## Service Management Commands

### Common Operations

| Command | Description |
|---------|-------------|
| `sudo systemctl start dstack-kms` | Start KMS service |
| `sudo systemctl stop dstack-kms` | Stop KMS service |
| `sudo systemctl restart dstack-kms` | Restart KMS service |
| `sudo systemctl status dstack-kms` | Check KMS status |
| `sudo systemctl start dstack-auth-eth` | Start auth-eth service |
| `sudo systemctl stop dstack-auth-eth` | Stop auth-eth service |
| `sudo systemctl restart dstack-auth-eth` | Restart auth-eth service |
| `sudo systemctl status dstack-auth-eth` | Check auth-eth status |

### Log Commands

| Command | Description |
|---------|-------------|
| `journalctl -u dstack-kms` | View all KMS logs |
| `journalctl -u dstack-kms -n 100` | View last 100 lines |
| `journalctl -u dstack-kms -f` | Follow KMS logs in real-time |
| `journalctl -u dstack-auth-eth -f` | Follow auth-eth logs in real-time |
| `journalctl -u dstack-kms --since "1 hour ago"` | KMS logs from last hour |
| `journalctl -u dstack-kms -p err` | Show only KMS errors |

## Troubleshooting

### Auth-ETH fails to start

Check auth-eth environment file configuration:

```bash
cat /etc/kms/auth-eth.env
```

Verify:
- `ETH_RPC_URL` is set to valid Alchemy endpoint
- `KMS_CONTRACT_ADDR` matches your deployed contract address
- Node.js binary exists: `which node`

Check logs for specific error:

```bash
sudo journalctl -u dstack-auth-eth -n 100
```

### KMS fails to start

Verify bootstrap completed:

```bash
ls -la /etc/kms/certs/
```

Should contain:
- `root-ca.crt` - Root certificate authority
- `rpc.crt` - RPC TLS certificate
- `rpc.key` - RPC TLS private key
- `tmp-ca.crt` - Temporary CA

If certificates missing, run bootstrap again (see [KMS Bootstrap](/tutorial/kms-bootstrap)).

### Permission denied errors

Ensure directories have correct ownership:

```bash
sudo chown -R root:root /etc/kms
sudo chmod 755 /etc/kms
sudo chmod 600 /etc/kms/auth-eth.env
sudo chmod 644 /etc/kms/kms.toml
```

### Service starts but cannot connect

Check firewall rules:

```bash
# For local testing (auth-eth on 127.0.0.1:9200)
sudo netstat -tlnp | grep 9200

# For RPC (KMS on 0.0.0.0:9100)
sudo netstat -tlnp | grep 9100
```

Verify auth-eth webhook URL in KMS config:

```bash
cat /etc/kms/kms.toml | grep -A 3 "\[core.auth_api.webhook\]"
```

Should show:

```toml
[core.auth_api.webhook]
url = "http://127.0.0.1:9200"
```

### Both services running but not working together

Test auth-eth webhook manually:

```bash
curl -X POST http://127.0.0.1:9200 \
  -H "Content-Type: application/json" \
  -d '{"method":"is_app_allowed","params":{"app_id":"test"}}'
```

Expected response shows auth-eth is responding:

```json
{"result":false}
```

---

## Understanding the Service Architecture

### Service Dependency Chain

```
network.target
    ↓
dstack-auth-eth.service (webhook for blockchain authorization)
    ↓
dstack-kms.service (main KMS)
```

### Port Usage

| Service | Port | Interface | Purpose |
|---------|------|-----------|---------|
| auth-eth | 9200 | 127.0.0.1 | Webhook for KMS authorization |
| KMS RPC | 9100 | 0.0.0.0 | TLS-secured RPC for key operations |

### Data Flow

1. **Client Request** → KMS (port 9100 via mTLS)
2. **KMS** → Auth-ETH webhook (port 9200 via HTTP)
3. **Auth-ETH** → Ethereum RPC (Sepolia via HTTPS)
4. **Auth-ETH** ← Smart contract response (allowed/denied)
5. **KMS** ← Authorization result
6. **Client** ← Key operation result (if authorized)

## Next Steps

With KMS services running, you have completed Phase 3 (KMS Deployment).

The next phase is Gateway Deployment, which will enable external access to your dstack installation. Gateway tutorials are coming soon.

## Additional Resources

- [systemd Documentation](https://www.freedesktop.org/software/systemd/man/systemd.service.html)
- [journalctl Guide](https://www.freedesktop.org/software/systemd/man/journalctl.html)
- [dstack GitHub Repository](https://github.com/Dstack-TEE/dstack)
- [KMS Architecture](https://github.com/Dstack-TEE/dstack/tree/main/kms)

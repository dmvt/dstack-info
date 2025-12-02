---
title: "Gateway Service Setup"
description: "Configure dstack gateway to run as a systemd service and register with KMS"
section: "Gateway Deployment"
stepNumber: 3
totalSteps: 3
lastUpdated: 2025-12-02
prerequisites:
  - gateway-build-configuration
tags:
  - dstack
  - gateway
  - systemd
  - service
  - kms
  - registration
difficulty: "intermediate"
estimatedTime: "20 minutes"
---

# Gateway Service Setup

This tutorial guides you through setting up the dstack gateway as a systemd service and registering it with the Key Management Service (KMS). Running the gateway as a service ensures it starts automatically on boot and integrates with the rest of your dstack deployment.

## What You'll Set Up

- **dstack-gateway.service** - Systemd service for the gateway
- **Gateway-KMS registration** - Connect gateway to KMS for key operations
- **Certificate renewal automation** - Automatic certificate management

## Prerequisites

Before starting, ensure you have:

- Completed [Gateway Build & Configuration](/tutorial/gateway-build-configuration)
- Gateway binary at /usr/local/bin/dstack-gateway
- Gateway configuration at /etc/dstack/gateway/gateway.toml
- WireGuard interface running
- SSL certificates at /etc/dstack/certs/
- KMS service running (from Phase 3)

## Step 1: Create Gateway Systemd Service

Create the systemd service unit file:

```bash
sudo tee /etc/systemd/system/dstack-gateway.service > /dev/null <<'EOF'
[Unit]
Description=dstack Gateway Service
Documentation=https://dstack.info
After=network.target dstack-kms.service wg-quick@dgw.service
Wants=dstack-kms.service wg-quick@dgw.service

[Service]
Type=simple
User=root
ExecStart=/usr/local/bin/dstack-gateway --config /etc/dstack/gateway/gateway.toml
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal

# Environment variables for Cloudflare (certificate renewal)
EnvironmentFile=-/etc/dstack/cloudflare/credentials.env

# Security hardening
NoNewPrivileges=false
ProtectSystem=strict
ReadWritePaths=/etc/dstack/certs /var/log /tmp

# Resource limits
LimitNOFILE=65535

[Install]
WantedBy=multi-user.target
EOF
```

### Service Configuration Explained

| Setting | Description |
|---------|-------------|
| `Type=simple` | Gateway runs as a foreground process |
| `After` | Start after network, KMS, and WireGuard |
| `Wants` | Prefer KMS and WireGuard running (non-fatal if missing) |
| `Restart=always` | Automatically restart on failure |
| `RestartSec=5` | Wait 5 seconds between restarts |
| `LimitNOFILE=65535` | Allow many open connections |
| `ReadWritePaths` | Directories gateway can write to |

## Step 2: Reload Systemd and Enable Service

Reload systemd to recognize the new service:

```bash
sudo systemctl daemon-reload
```

Enable the gateway to start on boot:

```bash
sudo systemctl enable dstack-gateway
```

Expected output:

```
Created symlink /etc/systemd/system/multi-user.target.wants/dstack-gateway.service → /etc/systemd/system/dstack-gateway.service.
```

## Step 3: Start the Gateway Service

Start the gateway:

```bash
sudo systemctl start dstack-gateway
```

Check the service status:

```bash
sudo systemctl status dstack-gateway
```

Expected output shows gateway as active:

```
● dstack-gateway.service - dstack Gateway Service
     Loaded: loaded (/etc/systemd/system/dstack-gateway.service; enabled; preset: enabled)
     Active: active (running) since Mon 2025-12-02 10:00:00 UTC; 5s ago
       Docs: https://dstack.info
   Main PID: 12345 (dstack-gateway)
      Tasks: 8 (limit: 154303)
     Memory: 25.5M
        CPU: 234ms
     CGroup: /system.slice/dstack-gateway.service
             └─12345 /usr/local/bin/dstack-gateway --config /etc/dstack/gateway/gateway.toml

Dec 02 10:00:00 host systemd[1]: Started dstack Gateway Service.
Dec 02 10:00:01 host dstack-gateway[12345]: Gateway starting on 0.0.0.0:443
Dec 02 10:00:01 host dstack-gateway[12345]: WireGuard interface: dgw
Dec 02 10:00:01 host dstack-gateway[12345]: KMS endpoint: http://127.0.0.1:9100
```

## Step 4: Verify Gateway Operation

### Check gateway logs

View recent logs:

```bash
sudo journalctl -u dstack-gateway -n 50
```

For real-time log streaming:

```bash
sudo journalctl -u dstack-gateway -f
```

Expected logs show:

```
Gateway initialized successfully
Listening on 0.0.0.0:443 (HTTPS)
Listening on 0.0.0.0:80 (HTTP redirect)
RPC server listening on 0.0.0.0:9070
WireGuard interface dgw connected
KMS connection established
```

### Check ports are listening

```bash
sudo ss -tlnp | grep dstack-gateway
```

Expected output:

```
LISTEN 0      511         0.0.0.0:80        0.0.0.0:*    users:(("dstack-gateway",pid=12345,fd=5))
LISTEN 0      511         0.0.0.0:443       0.0.0.0:*    users:(("dstack-gateway",pid=12345,fd=6))
LISTEN 0      511         0.0.0.0:9070      0.0.0.0:*    users:(("dstack-gateway",pid=12345,fd=7))
```

### Test HTTPS connectivity

Test the gateway responds to HTTPS requests:

```bash
curl -k https://localhost/health 2>/dev/null || echo "No health endpoint (expected)"
```

Test from external (replace with your domain):

```bash
curl -I https://hosted.yourdomain.com/
```

Expected response (when no CVMs running):

```
HTTP/2 503
server: dstack-gateway
content-type: text/plain
```

### Test HTTP redirect

```bash
curl -I http://hosted.yourdomain.com/
```

Expected response (redirect to HTTPS):

```
HTTP/1.1 301 Moved Permanently
Location: https://hosted.yourdomain.com/
```

## Step 5: Register Gateway with KMS (Optional)

If your gateway needs to communicate with KMS for key operations (required for TEE attestation):

### Create gateway application ID

Generate a unique application ID for the gateway:

```bash
export GATEWAY_APP_ID=$(uuidgen | tr '[:upper:]' '[:lower:]')
echo "Gateway App ID: ${GATEWAY_APP_ID}"
```

Save this ID for KMS registration:

```bash
echo "GATEWAY_APP_ID=${GATEWAY_APP_ID}" | sudo tee -a /etc/dstack/gateway/gateway.env
```

### Register with KMS smart contract

Using the same wallet from blockchain setup, register the gateway:

```bash
# Load wallet credentials
source ~/.dstack/secrets/wallet.env

# Register gateway (using cast from Foundry)
cast send $KMS_CONTRACT_ADDR \
  "registerApp(bytes32,string)" \
  $(echo -n "${GATEWAY_APP_ID}" | xxd -p -c 32) \
  "dstack-gateway" \
  --rpc-url $ETH_RPC_URL \
  --private-key $WALLET_PRIVATE_KEY
```

### Verify registration

```bash
cast call $KMS_CONTRACT_ADDR \
  "isAppRegistered(bytes32)(bool)" \
  $(echo -n "${GATEWAY_APP_ID}" | xxd -p -c 32) \
  --rpc-url $ETH_RPC_URL
```

Expected output:

```
true
```

## Step 6: Set Up Certificate Renewal

Create a systemd timer for automatic certificate renewal:

### Create renewal service

```bash
sudo tee /etc/systemd/system/dstack-certbot-renew.service > /dev/null <<'EOF'
[Unit]
Description=dstack Certificate Renewal
After=network.target

[Service]
Type=oneshot
ExecStart=/usr/bin/certbot renew --quiet --deploy-hook /etc/letsencrypt/renewal-hooks/deploy/dstack-gateway.sh
EOF
```

### Create renewal timer

```bash
sudo tee /etc/systemd/system/dstack-certbot-renew.timer > /dev/null <<'EOF'
[Unit]
Description=Run dstack certificate renewal twice daily

[Timer]
OnCalendar=*-*-* 00,12:00:00
RandomizedDelaySec=3600
Persistent=true

[Install]
WantedBy=timers.target
EOF
```

### Enable the timer

```bash
sudo systemctl daemon-reload
sudo systemctl enable dstack-certbot-renew.timer
sudo systemctl start dstack-certbot-renew.timer
```

### Verify timer is active

```bash
sudo systemctl list-timers | grep certbot
```

Expected output:

```
Mon 2025-12-02 12:00:00 UTC  1h left    n/a                          n/a          dstack-certbot-renew.timer  dstack-certbot-renew.service
```

## Service Management Commands

### Common Operations

| Command | Description |
|---------|-------------|
| `sudo systemctl start dstack-gateway` | Start gateway service |
| `sudo systemctl stop dstack-gateway` | Stop gateway service |
| `sudo systemctl restart dstack-gateway` | Restart gateway service |
| `sudo systemctl reload dstack-gateway` | Reload configuration |
| `sudo systemctl status dstack-gateway` | Check gateway status |

### Log Commands

| Command | Description |
|---------|-------------|
| `journalctl -u dstack-gateway` | View all gateway logs |
| `journalctl -u dstack-gateway -n 100` | View last 100 lines |
| `journalctl -u dstack-gateway -f` | Follow logs in real-time |
| `journalctl -u dstack-gateway --since "1 hour ago"` | Logs from last hour |
| `journalctl -u dstack-gateway -p err` | Show only errors |

### Service Dependencies

Check dependency chain:

```bash
systemctl list-dependencies dstack-gateway
```

## Ansible Automation

You can automate the service setup using Ansible.

### Run the Ansible playbook

```bash
cd ~/dstack-info/ansible
ansible-playbook -i inventory/hosts.yml playbooks/setup-gateway-service.yml
```

The playbook will:
1. Create gateway systemd service
2. Enable and start the service
3. Set up certificate renewal timer
4. Verify gateway is running

## Troubleshooting

### Gateway fails to start

Check the logs for specific errors:

```bash
sudo journalctl -u dstack-gateway -n 100 --no-pager
```

Common issues:

**Port already in use:**
```bash
sudo lsof -i :443
sudo lsof -i :80
```

Stop conflicting services and restart gateway.

**Certificate errors:**
```bash
openssl x509 -in /etc/dstack/certs/fullchain.pem -noout -dates
```

Ensure certificate is valid and not expired.

**WireGuard not running:**
```bash
sudo wg show dgw
```

Start WireGuard if down:
```bash
sudo wg-quick up dgw
```

### Gateway starts but cannot reach KMS

Verify KMS is running:

```bash
sudo systemctl status dstack-kms
```

Check KMS connectivity:

```bash
curl -k http://127.0.0.1:9100/health 2>/dev/null || echo "KMS health check unavailable"
```

### HTTPS requests fail

Check certificate chain:

```bash
openssl s_client -connect localhost:443 -servername hosted.yourdomain.com < /dev/null 2>/dev/null | openssl x509 -noout -text | head -20
```

Verify certificate matches domain:

```bash
openssl x509 -in /etc/dstack/certs/fullchain.pem -noout -subject -issuer
```

### Gateway cannot connect to CVMs

Check WireGuard interface:

```bash
sudo wg show dgw
```

Verify WireGuard has peers (CVMs):

```bash
sudo wg show dgw peers
```

If no peers, CVMs may not be running or registered.

### Certificate renewal fails

Test renewal manually:

```bash
sudo certbot renew --dry-run
```

Check Cloudflare credentials:

```bash
sudo cat /etc/dstack/cloudflare/cloudflare.ini
```

Verify API token is valid.

## Verification Checklist

Before proceeding, verify you have:

- [ ] Created gateway systemd service
- [ ] Enabled gateway service for automatic startup
- [ ] Started gateway service successfully
- [ ] Verified gateway logs show no errors
- [ ] Confirmed ports 80, 443, 9070 are listening
- [ ] Tested HTTPS connectivity
- [ ] Set up certificate renewal timer
- [ ] (Optional) Registered gateway with KMS

### Quick verification script

```bash
#!/bin/bash
echo "Checking gateway service setup..."

# Check gateway service
if sudo systemctl is-active --quiet dstack-gateway; then
    echo "✓ Gateway service running"
else
    echo "✗ Gateway service not running"
    exit 1
fi

# Check gateway enabled
if sudo systemctl is-enabled --quiet dstack-gateway; then
    echo "✓ Gateway enabled for boot"
else
    echo "✗ Gateway not enabled for boot"
    exit 1
fi

# Check HTTPS port
if sudo ss -tlnp | grep -q ':443.*dstack-gateway'; then
    echo "✓ HTTPS port 443 listening"
else
    echo "✗ HTTPS port 443 not listening"
    exit 1
fi

# Check HTTP port
if sudo ss -tlnp | grep -q ':80.*dstack-gateway'; then
    echo "✓ HTTP port 80 listening"
else
    echo "✗ HTTP port 80 not listening"
    exit 1
fi

# Check WireGuard
if ip link show dgw > /dev/null 2>&1; then
    echo "✓ WireGuard interface active"
else
    echo "✗ WireGuard interface not found"
    exit 1
fi

# Check certificate renewal timer
if sudo systemctl is-active --quiet dstack-certbot-renew.timer; then
    echo "✓ Certificate renewal timer active"
else
    echo "⚠ Certificate renewal timer not active"
fi

# Check KMS connectivity
if systemctl is-active --quiet dstack-kms; then
    echo "✓ KMS service running"
else
    echo "⚠ KMS service not running (gateway may still work for basic routing)"
fi

echo ""
echo "Gateway service setup verified successfully!"
echo ""
echo "Service Status:"
sudo systemctl status dstack-gateway --no-pager | grep -E "Active:|Main PID:"
```

## Understanding Gateway Service Architecture

### Service Dependency Chain

```
network.target
    ↓
wg-quick@dgw.service (WireGuard)
    ↓
dstack-kms.service (optional, for TEE operations)
    ↓
dstack-gateway.service
```

### Port Usage

| Port | Protocol | Interface | Purpose |
|------|----------|-----------|---------|
| 80 | TCP | 0.0.0.0 | HTTP redirect to HTTPS |
| 443 | TCP | 0.0.0.0 | HTTPS for client traffic |
| 9070 | TCP | 0.0.0.0 | Internal RPC |
| 9182 | UDP | 0.0.0.0 | WireGuard tunnel |

### Request Flow

```
┌──────────────────────────────────────────────────────────────┐
│                     Internet                                  │
│                         │                                     │
│                    HTTPS Request                              │
│                         ↓                                     │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                dstack-gateway                          │  │
│  │  1. TLS Termination (fullchain.pem, privkey.pem)      │  │
│  │  2. Domain Parsing (app-id.hosted.domain.com)         │  │
│  │  3. CVM Lookup (WireGuard peer by app-id)             │  │
│  │  4. Request Forwarding (via WireGuard tunnel)         │  │
│  └────────────────────────┬──────────────────────────────┘  │
│                           │                                   │
│                    WireGuard Tunnel                           │
│                           ↓                                   │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                    CVM (10.0.3.x)                      │  │
│  │                    Application                         │  │
│  └───────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

## Phase 4 Complete!

Congratulations! You have completed Phase 4 (Gateway Deployment):

1. **Gateway SSL Setup** - Certificates and Cloudflare configuration
2. **Gateway Build & Configuration** - Built gateway and created config
3. **Gateway Service Setup** - Running as systemd service

## Next Steps

With the gateway running, you're ready to deploy your first application to a CVM. The next phase will cover:

- Guest OS image preparation
- Deploying a Hello World application
- Attestation verification

Stay tuned for Phase 5 tutorials!

## Additional Resources

- [systemd Documentation](https://www.freedesktop.org/software/systemd/man/systemd.service.html)
- [journalctl Guide](https://www.freedesktop.org/software/systemd/man/journalctl.html)
- [dstack Gateway Source](https://github.com/Dstack-TEE/dstack/tree/main/gateway)
- [WireGuard Documentation](https://www.wireguard.com/)

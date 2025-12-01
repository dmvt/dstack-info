---
title: "VMM Service Setup"
description: "Configure dstack VMM to run as a systemd service with automatic startup"
section: "dstack Installation"
stepNumber: 5
totalSteps: 5
lastUpdated: 2025-11-19
prerequisites: ["vmm-configuration"]
tags:
  - dstack
  - vmm
  - systemd
  - service
difficulty: "intermediate"
estimatedTime: "10 minutes"
---

# VMM Service Setup

This tutorial guides you through setting up the dstack Virtual Machine Monitor (VMM) as a systemd service. Running VMM as a service ensures it starts automatically on boot and restarts if it crashes.

## Prerequisites

Before starting, ensure you have:

- Completed [VMM Configuration](/tutorial/vmm-configuration)
- SSH access to your TDX-enabled server
- Root or sudo privileges

## Step 1: Create the Systemd Service File

Create the systemd service unit file for dstack-vmm:

```bash
sudo tee /etc/systemd/system/dstack-vmm.service > /dev/null <<'EOF'
[Unit]
Description=dstack Virtual Machine Monitor
Documentation=https://dstack.info
After=network.target

[Service]
Type=simple
User=root
ExecStart=/usr/local/bin/dstack-vmm --config /etc/dstack/vmm.toml serve
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal

# Security hardening
NoNewPrivileges=false
ProtectSystem=strict
ReadWritePaths=/var/run/dstack /var/log/dstack /var/lib/dstack /tmp

[Install]
WantedBy=multi-user.target
EOF
```

### Service Configuration Explained

| Setting | Description |
|---------|-------------|
| `Type=simple` | Service runs as a foreground process |
| `User=root` | VMM requires root for VM management |
| `Restart=always` | Automatically restart on failure |
| `RestartSec=5` | Wait 5 seconds before restarting |
| `ProtectSystem=strict` | Read-only access to system directories |
| `ReadWritePaths` | Directories VMM can write to |

## Step 2: Reload Systemd and Enable Service

Reload systemd to recognize the new service:

```bash
sudo systemctl daemon-reload
```

Enable the service to start on boot:

```bash
sudo systemctl enable dstack-vmm
```

You should see output like:

```
Created symlink /etc/systemd/system/multi-user.target.wants/dstack-vmm.service → /etc/systemd/system/dstack-vmm.service.
```

## Step 3: Start the Service

Start the VMM service:

```bash
sudo systemctl start dstack-vmm
```

Check the service status:

```bash
sudo systemctl status dstack-vmm
```

Expected output shows the service as active:

```
● dstack-vmm.service - dstack Virtual Machine Monitor
     Loaded: loaded (/etc/systemd/system/dstack-vmm.service; enabled; preset: enabled)
     Active: active (running) since Tue 2025-11-19 22:45:00 UTC; 5s ago
       Docs: https://dstack.info
   Main PID: 12345 (dstack-vmm)
      Tasks: 9 (limit: 154303)
     Memory: 15.2M
        CPU: 123ms
     CGroup: /system.slice/dstack-vmm.service
             └─12345 /usr/local/bin/dstack-vmm --config /etc/dstack/vmm.toml serve
```

## Step 4: Verify Service Operation

### Check Logs

View recent logs from the VMM service:

```bash
sudo journalctl -u dstack-vmm -n 50
```

For real-time log streaming:

```bash
sudo journalctl -u dstack-vmm -f
```

### Check Socket File

Verify the VMM created its Unix socket:

```bash
ls -la /var/run/dstack/vmm.sock
```

Expected output:

```
srwxr-xr-x 1 root root 0 Nov 19 22:45 /var/run/dstack/vmm.sock
```

### Test Service Restart

Verify the service automatically restarts after stopping:

```bash
# Get the current PID
sudo systemctl show dstack-vmm --property=MainPID

# Kill the process (simulating crash)
sudo kill $(sudo systemctl show dstack-vmm --property=MainPID --value)

# Wait a few seconds, then check status
sleep 6
sudo systemctl status dstack-vmm
```

The service should show as active with a new PID.

## Service Management Commands

### Common Operations

| Command | Description |
|---------|-------------|
| `sudo systemctl start dstack-vmm` | Start the service |
| `sudo systemctl stop dstack-vmm` | Stop the service |
| `sudo systemctl restart dstack-vmm` | Restart the service |
| `sudo systemctl status dstack-vmm` | Check service status |
| `sudo systemctl enable dstack-vmm` | Enable start on boot |
| `sudo systemctl disable dstack-vmm` | Disable start on boot |

### Log Commands

| Command | Description |
|---------|-------------|
| `journalctl -u dstack-vmm` | View all logs |
| `journalctl -u dstack-vmm -n 100` | View last 100 lines |
| `journalctl -u dstack-vmm -f` | Follow logs in real-time |
| `journalctl -u dstack-vmm --since "1 hour ago"` | Logs from last hour |
| `journalctl -u dstack-vmm -p err` | Show only errors |

## Ansible Automation

You can automate the service setup using Ansible.

### Run the Ansible playbook

```bash
cd ~/dstack-info/ansible
ansible-playbook -i inventory/hosts.yml playbooks/setup-vmm-service.yml
```

The playbook will:
1. Create the systemd service file
2. Reload systemd daemon
3. Enable the service for boot
4. Start the service
5. Verify it's running

### Verify with Ansible

After running the setup playbook, verify the service:

```bash
cd ~/dstack-info/ansible
ansible-playbook -i inventory/hosts.yml playbooks/verify-vmm-service.yml
```

The verification playbook checks:
- Service file exists
- Service is enabled
- Service is running
- Socket file exists
- No recent errors in logs

## Troubleshooting

### Service fails to start

Check the logs for error details:

```bash
sudo journalctl -u dstack-vmm -n 100 --no-pager
```

Common causes:

1. **Configuration error:**
   ```bash
   # Validate config syntax
   dstack-vmm --config /etc/dstack/vmm.toml validate
   ```

2. **Binary not found:**
   ```bash
   # Check binary exists
   which dstack-vmm
   ls -la /usr/local/bin/dstack-vmm
   ```

3. **Permissions issue:**
   ```bash
   # Check directory permissions
   ls -la /var/run/dstack/
   ls -la /etc/dstack/
   ```

### Service keeps restarting

Check for crash loops:

```bash
sudo journalctl -u dstack-vmm --since "10 minutes ago" | grep -i error
```

If the service is crash-looping, check:
- Memory limits (is the system out of memory?)
- Configuration file syntax
- Required dependencies (KMS, gateway)

### Socket file not created

If `/var/run/dstack/vmm.sock` doesn't exist:

```bash
# Check directory exists
ls -la /var/run/dstack/

# Create if missing
sudo mkdir -p /var/run/dstack
sudo chmod 755 /var/run/dstack

# Restart service
sudo systemctl restart dstack-vmm
```

### Permission denied errors

If you see permission errors in logs:

```bash
# Check SELinux status (if applicable)
getenforce

# Check AppArmor status (Ubuntu)
sudo aa-status

# Ensure directories are writable
sudo chmod 755 /var/run/dstack /var/log/dstack /var/lib/dstack
```

### Service enabled but not starting on boot

```bash
# Check if service is enabled
systemctl is-enabled dstack-vmm

# Re-enable if needed
sudo systemctl enable dstack-vmm

# Check for failed services blocking boot
systemctl --failed
```

## Advanced Configuration

### Adjusting Resource Limits

For production servers, you may want to adjust resource limits:

```bash
sudo mkdir -p /etc/systemd/system/dstack-vmm.service.d
sudo tee /etc/systemd/system/dstack-vmm.service.d/limits.conf > /dev/null <<'EOF'
[Service]
LimitNOFILE=65536
LimitNPROC=4096
EOF
sudo systemctl daemon-reload
sudo systemctl restart dstack-vmm
```

### Environment Variables

To pass environment variables to the service:

```bash
sudo tee /etc/systemd/system/dstack-vmm.service.d/environment.conf > /dev/null <<'EOF'
[Service]
Environment="RUST_LOG=info"
Environment="RUST_BACKTRACE=1"
EOF
sudo systemctl daemon-reload
sudo systemctl restart dstack-vmm
```

### Custom ExecStart for Debugging

For debugging, create an override with verbose logging:

```bash
sudo systemctl edit dstack-vmm
```

Add:

```ini
[Service]
ExecStart=
ExecStart=/usr/local/bin/dstack-vmm --config /etc/dstack/vmm.toml serve --verbose
```

## Verification Checklist

Before proceeding, verify you have:

- [ ] Created /etc/systemd/system/dstack-vmm.service
- [ ] Reloaded systemd daemon
- [ ] Enabled dstack-vmm service
- [ ] Started dstack-vmm service
- [ ] Verified service status is active (running)
- [ ] Verified socket file exists at /var/run/dstack/vmm.sock
- [ ] Reviewed logs for any errors

### Quick verification script

Run this script to verify your service setup:

```bash
#!/bin/bash
echo "Checking VMM service setup..."

# Check service file
if [ -f "/etc/systemd/system/dstack-vmm.service" ]; then
    echo "✓ Service file exists"
else
    echo "✗ Service file not found"
    exit 1
fi

# Check enabled
if systemctl is-enabled dstack-vmm > /dev/null 2>&1; then
    echo "✓ Service is enabled"
else
    echo "✗ Service is not enabled"
    exit 1
fi

# Check running
if systemctl is-active dstack-vmm > /dev/null 2>&1; then
    echo "✓ Service is running"
else
    echo "✗ Service is not running"
    exit 1
fi

# Check socket
if [ -S "/var/run/dstack/vmm.sock" ]; then
    echo "✓ Socket file exists"
else
    echo "✗ Socket file not found"
    exit 1
fi

# Check for recent errors
if journalctl -u dstack-vmm --since "5 minutes ago" -p err --quiet | grep -q .; then
    echo "⚠ Recent errors in logs"
    journalctl -u dstack-vmm --since "5 minutes ago" -p err --no-pager
else
    echo "✓ No recent errors in logs"
fi

echo ""
echo "VMM service setup verified successfully!"
```

## Next Steps

With VMM running as a service, proceed to deploy the Key Management Service:

- [KMS Deployment](/tutorial/kms-deployment) - Deploy the Key Management Service

## Additional Resources

- [systemd Documentation](https://www.freedesktop.org/software/systemd/man/systemd.service.html)
- [journalctl Manual](https://www.freedesktop.org/software/systemd/man/journalctl.html)
- [dstack GitHub Repository](https://github.com/Dstack-TEE/dstack)

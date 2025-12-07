---
title: "VMM Service Setup"
description: "Configure dstack VMM to run as a systemd service with automatic startup"
section: "dstack Installation"
stepNumber: 5
totalSteps: 5
lastUpdated: 2025-12-04
prerequisites:
  - vmm-configuration
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

## Quick Start: Setup with Ansible

> **Using Ansible?** Playbooks are in `~/dstack-info/ansible`. If you haven't set up Ansible yet, see [TDX Software Installation: Quick Start with Ansible](/tutorial/tdx-software-installation#quick-start-install-with-ansible) for initial setup.

For most users, the recommended approach is to use the Ansible playbook which creates and configures the systemd service automatically.

### Step 1: Run the Ansible Playbook

```bash
ansible-playbook -i inventory/hosts.yml playbooks/setup-vmm-service.yml
```

The playbook will:
1. **Create systemd service file** - At /etc/systemd/system/dstack-vmm.service
2. **Configure security hardening** - ReadOnly system, limited write paths
3. **Reload systemd daemon** - Register the new service
4. **Enable service** - Start automatically on boot
5. **Start the service** - Begin running immediately
6. **Verify operation** - Check service is active

### Step 2: Verify Service Status

```bash
ansible-playbook -i inventory/hosts.yml playbooks/verify-vmm-service.yml
```

Or check directly on the server:

```bash
ssh ubuntu@YOUR_SERVER_IP "sudo systemctl status dstack-vmm"
```

---

## Service Management Commands

| Command | Description |
|---------|-------------|
| `sudo systemctl start dstack-vmm` | Start the service |
| `sudo systemctl stop dstack-vmm` | Stop the service |
| `sudo systemctl restart dstack-vmm` | Restart the service |
| `sudo systemctl status dstack-vmm` | Check service status |
| `sudo systemctl enable dstack-vmm` | Enable start on boot |
| `sudo systemctl disable dstack-vmm` | Disable start on boot |

### View Logs

| Command | Description |
|---------|-------------|
| `journalctl -u dstack-vmm` | View all logs |
| `journalctl -u dstack-vmm -n 100` | View last 100 lines |
| `journalctl -u dstack-vmm -f` | Follow logs in real-time |
| `journalctl -u dstack-vmm --since "1 hour ago"` | Logs from last hour |
| `journalctl -u dstack-vmm -p err` | Show only errors |

---

## Manual Setup

If you prefer to set up the service manually, follow these steps.

### Step 1: Create the Systemd Service File

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

### Step 2: Reload Systemd and Enable Service

```bash
sudo systemctl daemon-reload
sudo systemctl enable dstack-vmm
```

### Step 3: Start the Service

```bash
sudo systemctl start dstack-vmm
```

### Step 4: Verify Service Status

```bash
sudo systemctl status dstack-vmm
```

Expected output:
```
● dstack-vmm.service - dstack Virtual Machine Monitor
     Loaded: loaded (/etc/systemd/system/dstack-vmm.service; enabled)
     Active: active (running) since ...
```

### Step 5: Verify VMM is Working

Check that the HTTP API is responding:

```bash
curl -s http://127.0.0.1:9080/ | head -5
```

Check that the supervisor socket exists:

```bash
ls -la /var/run/dstack/supervisor.sock
```

---

## Service Configuration

### Service File Explained

| Setting | Description |
|---------|-------------|
| `Type=simple` | Service runs as a foreground process |
| `User=root` | VMM requires root for VM management |
| `Restart=always` | Automatically restart on failure |
| `RestartSec=5` | Wait 5 seconds before restarting |
| `ProtectSystem=strict` | Read-only access to system directories |
| `ReadWritePaths` | Directories VMM can write to |

### Adjusting Resource Limits

For production servers with many VMs:

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

To enable debug logging:

```bash
sudo tee /etc/systemd/system/dstack-vmm.service.d/environment.conf > /dev/null <<'EOF'
[Service]
Environment="RUST_LOG=debug"
Environment="RUST_BACKTRACE=1"
EOF
sudo systemctl daemon-reload
sudo systemctl restart dstack-vmm
```

---

## Troubleshooting

### Service fails to start

```bash
# Check logs for error details
sudo journalctl -u dstack-vmm -n 100 --no-pager

# Check binary exists
which dstack-vmm
ls -la /usr/local/bin/dstack-vmm

# Check config exists
ls -la /etc/dstack/vmm.toml
```

### Service keeps restarting

```bash
# Check for crash loops
sudo journalctl -u dstack-vmm --since "10 minutes ago" | grep -i error

# Check memory
free -h
```

### HTTP API not responding

```bash
# Check VMM is listening on port 9080
sudo ss -tlnp | grep 9080

# Check logs for binding errors
sudo journalctl -u dstack-vmm -n 50 | grep -i "endpoint\|bind\|error"

# Restart service
sudo systemctl restart dstack-vmm
```

### Supervisor socket not created

```bash
# Check directory exists
ls -la /var/run/dstack/

# Create if missing and restart
sudo mkdir -p /var/run/dstack
sudo chmod 755 /var/run/dstack
sudo systemctl restart dstack-vmm
```

### Permission denied errors

```bash
# Ensure directories are writable
sudo chmod 755 /var/run/dstack /var/log/dstack /var/lib/dstack
```

---

## Next Steps

With VMM running as a service, proceed to deploy the Key Management Service:

- [Smart Contract Compilation](/tutorial/smart-contract-compilation) - Start the KMS deployment process

## Additional Resources

- [systemd Documentation](https://www.freedesktop.org/software/systemd/man/systemd.service.html)
- [journalctl Manual](https://www.freedesktop.org/software/systemd/man/journalctl.html)
- [dstack GitHub Repository](https://github.com/Dstack-TEE/dstack)

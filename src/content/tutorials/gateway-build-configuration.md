---
title: "Gateway Build & Configuration"
description: "Build dstack gateway from source and configure it for your environment"
section: "Gateway Deployment"
stepNumber: 2
totalSteps: 3
lastUpdated: 2025-12-02
prerequisites:
  - gateway-ssl-setup
  - clone-build-dstack-vmm
tags:
  - dstack
  - gateway
  - build
  - configuration
  - wireguard
difficulty: "intermediate"
estimatedTime: "25 minutes"
---

# Gateway Build & Configuration

This tutorial guides you through building the dstack gateway from source and configuring it for your environment. The gateway acts as a reverse proxy that forwards TLS connections to Confidential Virtual Machines (CVMs) running on your TDX host.

## What You'll Build

- **dstack-gateway** - Reverse proxy for CVM traffic with automatic TLS termination
- **dstack-certbot** - Certificate management tool (built alongside gateway)

## Prerequisites

Before starting, ensure you have:

- Completed [Gateway SSL Setup](/tutorial/gateway-ssl-setup)
- Completed [Clone & Build dstack-vmm](/tutorial/clone-build-dstack-vmm)
- dstack repository cloned at ~/dstack
- Rust toolchain installed
- SSL certificates at /etc/dstack/certs/

## Step 1: Build the Gateway Binary

Navigate to the dstack repository and build the gateway:

```bash
cd ~/dstack
cargo build --release -p dstack-gateway
```

Build time is typically 2-5 minutes depending on your system.

Expected output:

```
   Compiling dstack-gateway v0.5.5 (/root/dstack/gateway)
    Finished `release` profile [optimized] target(s) in 2m 34s
```

### Verify the binary was created

```bash
ls -lh ~/dstack/target/release/dstack-gateway
```

Expected output:

```
-rwxr-xr-x 2 root root 18M Dec  2 10:00 /root/dstack/target/release/dstack-gateway
```

### Check the gateway version

```bash
~/dstack/target/release/dstack-gateway --version
```

## Step 2: Build the Certbot Tool

The gateway includes a certbot tool for certificate management:

```bash
cd ~/dstack
cargo build --release -p dstack-certbot
```

Verify the certbot binary:

```bash
ls -lh ~/dstack/target/release/dstack-certbot
```

## Step 3: Install Gateway Binaries

Copy the gateway binaries to the system path:

```bash
sudo cp ~/dstack/target/release/dstack-gateway /usr/local/bin/
sudo cp ~/dstack/target/release/dstack-certbot /usr/local/bin/
sudo chmod 755 /usr/local/bin/dstack-gateway
sudo chmod 755 /usr/local/bin/dstack-certbot
```

Verify installation:

```bash
which dstack-gateway
dstack-gateway --version
```

## Step 4: Set Up WireGuard Interface

The gateway uses WireGuard to securely communicate with CVMs.

### Install WireGuard (if not already installed)

```bash
sudo apt update
sudo apt install -y wireguard-tools
```

### Generate WireGuard keys

```bash
sudo mkdir -p /etc/dstack/wireguard
cd /etc/dstack/wireguard
wg genkey | sudo tee privatekey | wg pubkey | sudo tee publickey
sudo chmod 600 privatekey
```

### Create WireGuard interface configuration

```bash
sudo tee /etc/wireguard/dgw.conf > /dev/null <<'EOF'
[Interface]
PrivateKey = GATEWAY_PRIVATE_KEY
Address = 10.0.3.1/24
ListenPort = 9182
EOF
```

Replace the private key:

```bash
PRIV_KEY=$(sudo cat /etc/dstack/wireguard/privatekey)
sudo sed -i "s|GATEWAY_PRIVATE_KEY|${PRIV_KEY}|" /etc/wireguard/dgw.conf
```

### Start the WireGuard interface

```bash
sudo wg-quick up dgw
```

Verify the interface is running:

```bash
sudo wg show dgw
```

Expected output:

```
interface: dgw
  public key: <your-public-key>
  private key: (hidden)
  listening port: 9182
```

### Enable WireGuard on boot

```bash
sudo systemctl enable wg-quick@dgw
```

## Step 5: Create Gateway Configuration

Create the gateway configuration directory:

```bash
sudo mkdir -p /etc/dstack/gateway
```

Create the gateway configuration file:

```bash
sudo tee /etc/dstack/gateway/gateway.toml > /dev/null <<'EOF'
# dstack Gateway Configuration

[server]
# Public domain for the gateway (wildcard domain base)
public_domain = "hosted.yourdomain.com"

# HTTP/HTTPS ports
http_port = 80
https_port = 443

# RPC port for internal communication
rpc_port = 9070

# Number of worker threads (0 = auto-detect)
workers = 0

# Log level: trace, debug, info, warn, error
log_level = "info"

[tls]
# Path to SSL certificate (fullchain)
cert_path = "/etc/dstack/certs/fullchain.pem"

# Path to SSL private key
key_path = "/etc/dstack/certs/privkey.pem"

[wireguard]
# WireGuard interface name
interface = "dgw"

# WireGuard listen port
listen_port = 9182

# Gateway WireGuard IP address
ip = "10.0.3.1"

# Subnet mask for CVM network
subnet = "10.0.3.0/24"

[kms]
# KMS RPC endpoint
url = "http://127.0.0.1:9100"

# Enable mTLS to KMS (recommended for production)
mtls = false

[routing]
# Default HTTP port in CVM
default_http_port = 80

# Default HTTPS port for TLS passthrough
default_https_port = 443

# Enable gRPC support (HTTP/2)
enable_grpc = true

[limits]
# Maximum connections per CVM
max_connections_per_cvm = 1000

# Connection timeout in seconds
connection_timeout = 30

# Request timeout in seconds
request_timeout = 300
EOF
```

### Update configuration with your domain

```bash
sudo sed -i 's/hosted.yourdomain.com/your-actual-subdomain.yourdomain.com/' \
  /etc/dstack/gateway/gateway.toml
```

Verify the configuration:

```bash
cat /etc/dstack/gateway/gateway.toml | head -20
```

## Step 6: Configure Certbot Tool

Create the certbot configuration:

```bash
sudo tee /etc/dstack/gateway/certbot.toml > /dev/null <<'EOF'
# dstack Certbot Configuration

[acme]
# Let's Encrypt ACME URL
# Production: https://acme-v02.api.letsencrypt.org/directory
# Staging: https://acme-staging-v02.api.letsencrypt.org/directory
url = "https://acme-v02.api.letsencrypt.org/directory"

# Contact email for certificate notifications
email = "your-email@example.com"

[cloudflare]
# Cloudflare API credentials
api_token_env = "CF_API_TOKEN"
zone_id_env = "CF_ZONE_ID"

[domain]
# Base domain for certificates
base = "hosted.yourdomain.com"

# Request wildcard certificate
wildcard = true

[output]
# Certificate output directory
cert_dir = "/etc/dstack/certs"

# Certificate filename
cert_file = "fullchain.pem"

# Private key filename
key_file = "privkey.pem"
EOF
```

Update with your values:

```bash
sudo sed -i 's/your-email@example.com/your-actual-email@example.com/' \
  /etc/dstack/gateway/certbot.toml
sudo sed -i 's/hosted.yourdomain.com/your-actual-subdomain.yourdomain.com/' \
  /etc/dstack/gateway/certbot.toml
```

## Step 7: Verify Configuration

### Test gateway configuration syntax

```bash
dstack-gateway --config /etc/dstack/gateway/gateway.toml --check
```

If the command doesn't have a `--check` flag, you can test by starting briefly:

```bash
sudo timeout 5 dstack-gateway --config /etc/dstack/gateway/gateway.toml || true
```

Expected: Either exits with timeout or shows startup messages (no config errors).

### Check certificate paths

```bash
ls -la /etc/dstack/certs/
```

Expected output shows certificate files:

```
-rw-r--r-- 1 root root 3749 Dec  2 10:00 fullchain.pem
-rw------- 1 root root 1704 Dec  2 10:00 privkey.pem
```

### Verify WireGuard interface

```bash
ip addr show dgw
```

Expected output shows the WireGuard interface with IP:

```
12: dgw: <POINTOPOINT,NOARP,UP,LOWER_UP> mtu 1420 qdisc noqueue state UNKNOWN
    inet 10.0.3.1/24 scope global dgw
```

### Check port availability

Verify the required ports are not in use:

```bash
sudo ss -tlnp | grep -E ':(80|443|9070|9182)'
```

Should show empty or only WireGuard on 9182.

## Configuration Reference

### Gateway Configuration Options

| Section | Option | Description | Default |
|---------|--------|-------------|---------|
| server | public_domain | Base domain for routing | required |
| server | http_port | HTTP redirect port | 80 |
| server | https_port | HTTPS listen port | 443 |
| server | rpc_port | Internal RPC port | 9070 |
| server | workers | Worker threads | auto |
| server | log_level | Logging verbosity | info |
| tls | cert_path | Certificate file path | required |
| tls | key_path | Private key file path | required |
| wireguard | interface | WireGuard interface name | dgw |
| wireguard | listen_port | WireGuard UDP port | 9182 |
| wireguard | ip | Gateway WireGuard IP | 10.0.3.1 |
| wireguard | subnet | CVM network subnet | 10.0.3.0/24 |
| kms | url | KMS RPC endpoint | http://127.0.0.1:9100 |
| kms | mtls | Enable mTLS to KMS | false |

### Domain Routing Patterns

The gateway routes requests based on subdomain patterns:

| Pattern | Destination | Example |
|---------|-------------|---------|
| `<id>.base_domain` | CVM port 80 | `app123.hosted.example.com` |
| `<id>-<port>.base_domain` | CVM specific port | `app123-8080.hosted.example.com` |
| `<id>s.base_domain` | TLS passthrough to 443 | `app123s.hosted.example.com` |
| `<id>-<port>g.base_domain` | gRPC on specific port | `app123-50051g.hosted.example.com` |

## Ansible Automation

You can automate the build and configuration using Ansible.

### Run the Ansible playbook

```bash
cd ~/dstack-info/ansible
ansible-playbook -i inventory/hosts.yml playbooks/build-gateway.yml
```

The playbook will:
1. Build dstack-gateway and dstack-certbot
2. Install binaries to /usr/local/bin
3. Set up WireGuard interface
4. Create gateway configuration
5. Create certbot configuration

## Troubleshooting

### Build fails with missing dependencies

Ensure all build dependencies are installed:

```bash
sudo apt install -y build-essential pkg-config libssl-dev
```

### WireGuard interface fails to start

Check for existing interface conflicts:

```bash
sudo ip link show | grep dgw
```

If exists, remove it first:

```bash
sudo wg-quick down dgw
```

Check WireGuard configuration:

```bash
sudo wg-quick up dgw 2>&1
```

### Configuration file syntax errors

Validate TOML syntax:

```bash
cat /etc/dstack/gateway/gateway.toml | python3 -c "import sys,tomllib; tomllib.load(sys.stdin.buffer)"
```

If Python reports an error, check the TOML syntax.

### Port 80/443 already in use

Check what's using the ports:

```bash
sudo lsof -i :80
sudo lsof -i :443
```

Stop conflicting services (e.g., nginx, apache):

```bash
sudo systemctl stop nginx
sudo systemctl stop apache2
```

### Certificate permission errors

Ensure certificate files have correct permissions:

```bash
sudo chmod 644 /etc/dstack/certs/fullchain.pem
sudo chmod 600 /etc/dstack/certs/privkey.pem
sudo chown root:root /etc/dstack/certs/*
```

## Verification Checklist

Before proceeding, verify you have:

- [ ] Built dstack-gateway successfully
- [ ] Built dstack-certbot successfully
- [ ] Installed binaries to /usr/local/bin
- [ ] Generated WireGuard keys
- [ ] Created and started WireGuard interface
- [ ] Created gateway configuration file
- [ ] Created certbot configuration file
- [ ] Verified certificate files exist
- [ ] Checked ports are available

### Quick verification script

```bash
#!/bin/bash
echo "Checking gateway build and configuration..."

# Check gateway binary
if [ -x "/usr/local/bin/dstack-gateway" ]; then
    echo "✓ Gateway binary installed"
else
    echo "✗ Gateway binary not found"
    exit 1
fi

# Check certbot binary
if [ -x "/usr/local/bin/dstack-certbot" ]; then
    echo "✓ Certbot binary installed"
else
    echo "✗ Certbot binary not found"
    exit 1
fi

# Check WireGuard interface
if ip link show dgw > /dev/null 2>&1; then
    echo "✓ WireGuard interface exists"
else
    echo "✗ WireGuard interface not found"
    exit 1
fi

# Check gateway config
if [ -f "/etc/dstack/gateway/gateway.toml" ]; then
    echo "✓ Gateway configuration exists"
else
    echo "✗ Gateway configuration not found"
    exit 1
fi

# Check certificates
if [ -f "/etc/dstack/certs/fullchain.pem" ] && [ -f "/etc/dstack/certs/privkey.pem" ]; then
    echo "✓ Certificates exist"
else
    echo "✗ Certificates not found"
    exit 1
fi

# Check certificate validity
DAYS_LEFT=$(openssl x509 -in /etc/dstack/certs/fullchain.pem -noout -checkend 0 && \
  echo "valid" || echo "expired")
if [ "$DAYS_LEFT" = "valid" ]; then
    EXPIRY=$(openssl x509 -in /etc/dstack/certs/fullchain.pem -noout -enddate | cut -d= -f2)
    echo "✓ Certificate valid until: $EXPIRY"
else
    echo "✗ Certificate expired!"
    exit 1
fi

echo ""
echo "Gateway build and configuration verified successfully!"
```

## Understanding Gateway Architecture

### Request Flow

```
Client HTTPS Request
       ↓
[Internet] → [Gateway :443]
                   ↓
            TLS Termination
                   ↓
            Domain Routing
                   ↓
    [WireGuard Tunnel] → [CVM]
                              ↓
                        Application
```

### Component Interactions

```
┌─────────────────────────────────────────────────────┐
│                  TDX Host                           │
│  ┌───────────────┐  ┌──────────────┐  ┌─────────┐  │
│  │    Gateway    │  │     KMS      │  │   VMM   │  │
│  │  :443 :9070   │──│    :9100     │──│  :8090  │  │
│  └───────┬───────┘  └──────────────┘  └────┬────┘  │
│          │                                  │       │
│          │ WireGuard (dgw)                  │       │
│          │ 10.0.3.0/24                      │       │
│          ↓                                  ↓       │
│  ┌───────────────┐  ┌───────────────┐            │
│  │    CVM 1      │  │    CVM 2      │   ...      │
│  │  10.0.3.2     │  │  10.0.3.3     │            │
│  └───────────────┘  └───────────────┘            │
└─────────────────────────────────────────────────────┘
```

## Next Steps

With the gateway built and configured, proceed to [Gateway Service Setup](/tutorial/gateway-service-setup) to run the gateway as a systemd service and register it with KMS.

## Additional Resources

- [WireGuard Documentation](https://www.wireguard.com/quickstart/)
- [dstack Gateway Source](https://github.com/Dstack-TEE/dstack/tree/main/gateway)
- [TOML Configuration Format](https://toml.io/en/)

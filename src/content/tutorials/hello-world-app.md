---
title: "Hello World Application"
description: "Deploy your first application to a dstack Confidential Virtual Machine"
section: "First Application"
stepNumber: 1
totalSteps: 2
lastUpdated: 2025-12-07
prerequisites:
  - guest-image-setup
tags:
  - dstack
  - cvm
  - deployment
  - docker-compose
  - hello-world
difficulty: "intermediate"
estimatedTime: "30 minutes"
---

# Hello World Application

This tutorial guides you through deploying your first application to a dstack Confidential Virtual Machine (CVM). You'll deploy a simple nginx web server that runs inside a TDX-protected environment, verifying that your entire dstack infrastructure is working correctly.

## What You'll Deploy

- **nginx web server** - Running inside a CVM
- **Docker Compose configuration** - Standard format for defining applications
- **CVM instance** - A TDX-protected virtual machine

## How CVM Deployment Works

When you deploy an application to dstack:

1. **VMM** receives your Docker Compose configuration
2. **QEMU with TDX** launches a new protected VM
3. **Guest OS** boots with measured firmware and kernel
4. **Tappd** (guest daemon) starts inside the CVM
5. **Docker containers** are launched based on your compose file
6. **Gateway** routes traffic to your application via WireGuard

```
┌─────────────────────────────────────────────────────────────┐
│                    Your Request                              │
│                         ↓                                    │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                      VMM                               │  │
│  │  Creates CVM, passes docker-compose configuration      │  │
│  └────────────────────────┬──────────────────────────────┘  │
│                           ↓                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              CVM (TDX Protected)                       │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │              Your Application                    │  │  │
│  │  │              (nginx container)                   │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │              Tappd + Docker Runtime              │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Prerequisites

Before starting, ensure you have:

- Completed [Guest OS Image Setup](/tutorial/guest-image-setup)
- VMM service running (with web interface at http://localhost:9080)
- At least one guest OS image available
- KMS and Gateway services running

Verify services are running:

```bash
sudo systemctl status dstack-vmm dstack-kms dstack-gateway
```

## Step 1: Create Application Directory

Create a directory for your first application:

```bash
mkdir -p ~/dstack-apps/hello-world
cd ~/dstack-apps/hello-world
```

## Step 2: Create Docker Compose File

Create a simple Docker Compose file for nginx:

```bash
cat > docker-compose.yaml << 'EOF'
version: '3'
services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./html:/usr/share/nginx/html:ro
      - /var/run/tappd.sock:/var/run/tappd.sock
    restart: always
    environment:
      - NGINX_HOST=localhost
      - NGINX_PORT=80
EOF
```

### Understanding the Configuration

| Setting | Description |
|---------|-------------|
| `image: nginx:alpine` | Lightweight nginx image |
| `ports: "80:80"` | Expose port 80 inside CVM |
| `/var/run/tappd.sock` | Access to attestation daemon |
| `restart: always` | Restart container if it fails |

## Step 3: Create Custom HTML Content

Create a simple HTML page to serve:

```bash
mkdir -p html
cat > html/index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>dstack Hello World</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        .container {
            background: white;
            border-radius: 10px;
            padding: 40px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        }
        h1 {
            color: #333;
            margin-bottom: 20px;
        }
        .success {
            background: #d4edda;
            border: 1px solid #c3e6cb;
            color: #155724;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
        }
        .info {
            background: #e7f3ff;
            border: 1px solid #b6d4fe;
            color: #084298;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
        }
        code {
            background: #f4f4f4;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: monospace;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Hello from dstack CVM!</h1>

        <div class="success">
            <strong>Success!</strong> Your application is running inside a
            TDX-protected Confidential Virtual Machine.
        </div>

        <div class="info">
            <strong>What this means:</strong>
            <ul>
                <li>Your code is running in encrypted memory</li>
                <li>The host cannot inspect your application's data</li>
                <li>Hardware attestation proves this environment is genuine</li>
            </ul>
        </div>

        <h2>Environment Details</h2>
        <p>This nginx server is running inside a CVM with:</p>
        <ul>
            <li>Intel TDX hardware protection</li>
            <li>Measured boot chain (MRTD, RTMR0-3)</li>
            <li>Encrypted memory isolation</li>
            <li>Remote attestation capability</li>
        </ul>

        <h2>Next Steps</h2>
        <p>Try requesting a TDX attestation quote from your application
           using the <code>/var/run/tappd.sock</code> socket.</p>
    </div>
</body>
</html>
EOF
```

## Step 4: Deploy the Application

### Option A: Deploy via VMM Web Interface (Recommended)

1. Open the VMM Management Console in your browser:
   ```
   http://localhost:9080
   ```

2. Click **"Deploy a new instance"**

3. Fill in the deployment form:
   - **Name**: `hello-world`
   - **vCPUs**: `2`
   - **Memory**: `2048` MB
   - **Image**: Select `dstack-0.4.0`
   - **Docker Compose**: Paste the contents of your docker-compose.yaml

4. Click **Deploy**

### Option B: Deploy via VMM API

```bash
# Deploy using VMM HTTP API
curl -X POST http://127.0.0.1:9080/api/deploy \
  -H "Content-Type: application/json" \
  -d '{
    "name": "hello-world",
    "image": "dstack-0.4.0",
    "compose": "'$(base64 -w0 docker-compose.yaml)'",
    "vcpus": 2,
    "memory": 2048,
    "env": {}
  }'
```

Expected response:

```json
{
  "status": "success",
  "instance_id": "abc123-def456-...",
  "app_id": "hello-world",
  "cid": 30001,
  "ports": {
    "80": 10080
  }
}
```

## Step 5: Monitor Deployment Progress

Watch the deployment in the VMM web interface, or check the logs:

```bash
# View VMM logs
sudo journalctl -u dstack-vmm -f
```

You should see:

```
INFO vmm: Received deploy request for hello-world
INFO vmm: Using image dstack-0.4.0
INFO vmm: Allocated CID 30001
INFO vmm: Starting QEMU with TDX enabled
INFO vmm: CVM boot initiated
INFO vmm: Guest OS booting...
INFO vmm: Tappd started in guest
INFO vmm: Docker containers starting
INFO vmm: Application hello-world deployed successfully
```

## Step 6: Verify CVM is Running

### Via VMM Web Interface

Open http://localhost:9080 and check the instance list. The hello-world instance should show status "running".

### Via VMM API

```bash
curl -s http://127.0.0.1:9080/api/instances | jq .
```

Expected output:

```json
{
  "instances": [
    {
      "id": "abc123-def456-...",
      "name": "hello-world",
      "status": "running",
      "image": "dstack-0.4.0",
      "cid": 30001,
      "vcpus": 2,
      "memory": 2048,
      "created": "2025-12-02T10:45:00Z",
      "ports": {
        "80": 10080
      }
    }
  ]
}
```

## Step 7: Access the Application

### Via local port mapping

If port mapping is enabled, access via the mapped port:

```bash
curl http://127.0.0.1:10080/
```

You should see the HTML content of your page.

### Via Gateway (production access)

Once your gateway is properly configured with DNS, access via:

```
https://<app-id>.hosted.yourdomain.com/
```

The gateway routes HTTPS traffic through the WireGuard tunnel to your CVM.

### Test the response

```bash
curl -s http://127.0.0.1:10080/ | grep -o '<title>.*</title>'
```

Expected output:

```
<title>dstack Hello World</title>
```

## Step 8: View Application Logs

### Via VMM Web Interface

Click **Logs** on the hello-world instance in the VMM console.

### Via VMM API

```bash
curl -s "http://127.0.0.1:9080/api/instances/hello-world/logs?lines=50"
```

Expected nginx access logs:

```
172.17.0.1 - - [02/Dec/2025:10:50:00 +0000] "GET / HTTP/1.1" 200 1234 "-" "curl/7.81.0"
```

## Step 9: Inspect CVM Details

Get detailed information about the running CVM:

```bash
curl -s http://127.0.0.1:9080/api/instances/hello-world | jq .
```

Response includes:

```json
{
  "id": "abc123-def456-...",
  "name": "hello-world",
  "status": "running",
  "image": "dstack-0.4.0",
  "cid": 30001,
  "vcpus": 2,
  "memory": 2048,
  "ip_address": "10.0.3.2",
  "created": "2025-12-02T10:45:00Z",
  "uptime": "5m30s",
  "ports": {
    "80": 10080
  },
  "attestation": {
    "available": true,
    "mrtd": "abc123...",
    "rtmr0": "def456..."
  }
}
```

## Managing the Application

### Via VMM Web Interface

Use the action buttons (Stop, Start, Restart, Delete) on the instance in the VMM console.

### Via VMM API

**Stop the application:**
```bash
curl -X POST http://127.0.0.1:9080/api/instances/hello-world/stop
```

**Start it again:**
```bash
curl -X POST http://127.0.0.1:9080/api/instances/hello-world/start
```

**Restart:**
```bash
curl -X POST http://127.0.0.1:9080/api/instances/hello-world/restart
```

**Delete the application:**
```bash
curl -X DELETE http://127.0.0.1:9080/api/instances/hello-world
```

## Ansible Automation

You can automate application deployment using Ansible.

### Run the Ansible playbook

```bash
cd ~/dstack-info/ansible
ansible-playbook -i inventory/hosts.yml playbooks/deploy-hello-world.yml
```

The playbook will:
1. Create application directory
2. Generate Docker Compose configuration
3. Deploy via VMM API
4. Verify deployment succeeded
5. Test application accessibility

## Troubleshooting

### CVM fails to start

Check VMM logs for specific errors:

```bash
sudo journalctl -u dstack-vmm -n 100 --no-pager | grep -i error
```

Common issues:

**Not enough resources:**
```bash
# Reduce resource allocation
curl -X POST http://127.0.0.1:9080/api/deploy \
  -d '{"vcpus": 1, "memory": 1024, ...}'
```

**Image not found:**
```bash
# Verify image exists
curl -s http://127.0.0.1:9080/api/images
```

**TDX not available:**
```bash
# Check TDX status
dmesg | grep -i tdx
```

### Application doesn't respond

Check if the container is running inside the CVM:

```bash
# View container logs
curl -s "http://127.0.0.1:9080/api/instances/hello-world/logs?container=nginx"
```

Check port mapping:

```bash
# Verify port is listening
ss -tlnp | grep 10080
```

### Cannot pull Docker images

The CVM needs network access to pull images. Verify:

```bash
# Check CVM network connectivity
curl -s http://127.0.0.1:9080/api/instances/hello-world/exec \
  -d '{"cmd": ["ping", "-c", "1", "8.8.8.8"]}'
```

If offline, pre-load images into the guest OS image or use a local registry.

## Verification Checklist

Before proceeding, verify you have:

- [ ] Created Docker Compose configuration
- [ ] Created custom HTML content
- [ ] Deployed application via VMM
- [ ] Verified CVM is running
- [ ] Accessed application via port mapping
- [ ] Viewed application logs
- [ ] Successfully stopped and restarted application

### Quick verification script

```bash
#!/bin/bash
echo "Checking Hello World deployment..."

# Check VMM is running
if ! curl -s http://127.0.0.1:9080/api/images > /dev/null 2>&1; then
    echo "✗ VMM not responding"
    exit 1
fi
echo "✓ VMM responding"

# Check for running instances
INSTANCES=$(curl -s http://127.0.0.1:9080/api/instances | jq -r '.instances | length')
if [ "$INSTANCES" -gt 0 ]; then
    echo "✓ Running instances: $INSTANCES"
else
    echo "⚠ No running instances"
fi

# Check hello-world specifically
if curl -s http://127.0.0.1:9080/api/instances | jq -e '.instances[] | select(.name=="hello-world")' > /dev/null 2>&1; then
    echo "✓ hello-world instance found"

    # Get port
    PORT=$(curl -s http://127.0.0.1:9080/api/instances | jq -r '.instances[] | select(.name=="hello-world") | .ports["80"]')

    # Test accessibility
    if curl -s http://127.0.0.1:${PORT}/ | grep -q "dstack"; then
        echo "✓ Application responding on port $PORT"
    else
        echo "✗ Application not responding"
    fi
else
    echo "⚠ hello-world instance not found"
fi

echo ""
echo "Hello World verification complete!"
```

## What's Running Inside Your CVM

When you deploy an application, the CVM contains:

```
┌─────────────────────────────────────────────────────────────┐
│                         CVM                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                   Your Containers                      │  │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐     │  │
│  │  │   nginx     │ │  (future)   │ │  (future)   │     │  │
│  │  │  :80        │ │  containers │ │  containers │     │  │
│  │  └─────────────┘ └─────────────┘ └─────────────┘     │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                    Tappd Daemon                        │  │
│  │  - TDX quote generation                                │  │
│  │  - Container lifecycle management                      │  │
│  │  - Logging and monitoring                              │  │
│  │  - Socket: /var/run/tappd.sock                        │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                   Guest OS (Linux)                     │  │
│  │  - Docker runtime                                      │  │
│  │  - Network stack                                       │  │
│  │  - TDX guest kernel                                    │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                   TDX Protection                       │  │
│  │  - Encrypted memory                                    │  │
│  │  - Hardware measurements (MRTD, RTMRs)                 │  │
│  │  - Isolated from host                                  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Next Steps

Your Hello World application is now running inside a TDX-protected CVM. The next tutorial covers how to verify the attestation - proving cryptographically that your application is genuinely running in a secure environment.

## Additional Resources

- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [nginx Documentation](https://nginx.org/en/docs/)
- [dstack GitHub Repository](https://github.com/Dstack-TEE/dstack)
- [dstack Examples Repository](https://github.com/Dstack-TEE/dstack-examples)

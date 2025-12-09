---
title: "Local Docker Registry"
description: "Deploy a local Docker registry with SSL for reliable CVM image pulls"
section: "Prerequisites"
stepNumber: 5
totalSteps: 5
lastUpdated: 2025-12-09
prerequisites:
  - ssl-certificate-setup
tags:
  - docker
  - registry
  - ssl
  - prerequisites
difficulty: intermediate
estimatedTime: "30 minutes"
---

# Local Docker Registry

This tutorial guides you through deploying a local Docker registry with SSL certificates. A local registry ensures reliable image pulls during CVM deployment, avoiding Docker Hub rate limits and network issues.

## Why Local Registry?

| Challenge | Solution |
|-----------|----------|
| Docker Hub rate limits | Local registry has no pull limits |
| Network reliability | Local pulls are fast and consistent |
| CVM boot timing | Registry must respond quickly during boot |
| Image availability | Cached images always available |

When a CVM boots, it pulls Docker images. If this fails, the CVM fails to start. A local registry with proper SSL ensures reliable deployments.

## Prerequisites

Before starting, ensure you have:

- Completed [DNS Configuration](/tutorial/dns-configuration) - DNS record for registry subdomain
- Docker installed and running
- Let's Encrypt certbot installed
- Port 80 accessible for Let's Encrypt HTTP-01 challenge
- Port 443 available for the registry

### DNS Record Required

You need a DNS record pointing to your server. Example:
```
registry.yourdomain.com -> YOUR_SERVER_IP
```

Verify the DNS record:

```bash
dig +short registry.yourdomain.com
```

Should return your server's IP address.

---

## Quick Start: Deploy with Ansible

> **Using Ansible?** Playbooks are in `~/dstack-info/ansible`. If you haven't set up Ansible yet, see [TDX Software Installation: Quick Start with Ansible](/tutorial/tdx-software-installation#quick-start-install-with-ansible) for initial setup.

### Step 1: Run the Deployment Playbook

```bash
ansible-playbook -i inventory/hosts.yml playbooks/setup-local-registry.yml \
  -e "registry_domain=registry.yourdomain.com"
```

Replace `registry.yourdomain.com` with your actual registry domain.

The playbook will:
1. **Install certbot** if not present
2. **Obtain SSL certificate** via Let's Encrypt
3. **Create certificate directory** for Docker registry
4. **Deploy registry container** with SSL
5. **Cache required images** (dstack-kms)
6. **Verify health** - Check registry responds

### Step 2: Verify Deployment

```bash
ansible-playbook -i inventory/hosts.yml playbooks/verify-local-registry.yml \
  -e "registry_domain=registry.yourdomain.com"
```

---

## Manual Deployment

If you prefer to deploy manually, follow these steps.

### Step 1: Install Certbot

```bash
sudo apt update
sudo apt install -y certbot
```

### Step 2: Obtain SSL Certificate

Get a Let's Encrypt certificate for your registry domain:

```bash
# Stop any service using port 80 temporarily
sudo systemctl stop nginx 2>/dev/null || true

# Obtain certificate
sudo certbot certonly --standalone \
  -d registry.yourdomain.com \
  --non-interactive \
  --agree-tos \
  --email your-email@example.com
```

Certificates are stored in:
```
/etc/letsencrypt/live/registry.yourdomain.com/
├── fullchain.pem  # Certificate + intermediates
├── privkey.pem    # Private key
└── ...
```

### Step 3: Create Registry Certificate Directory

Copy certificates to a directory the registry container can access:

```bash
# Create directory
sudo mkdir -p /etc/docker/registry/certs

# Copy certificates (following symlinks)
sudo cp -L /etc/letsencrypt/live/registry.yourdomain.com/fullchain.pem \
  /etc/docker/registry/certs/
sudo cp -L /etc/letsencrypt/live/registry.yourdomain.com/privkey.pem \
  /etc/docker/registry/certs/

# Set permissions
sudo chmod 644 /etc/docker/registry/certs/fullchain.pem
sudo chmod 600 /etc/docker/registry/certs/privkey.pem
```

### Step 4: Create Registry Storage Directory

```bash
sudo mkdir -p /var/lib/registry
```

### Step 5: Deploy Registry Container

```bash
docker run -d \
  --name registry \
  --restart always \
  -p 443:443 \
  -v /etc/docker/registry/certs:/certs:ro \
  -v /var/lib/registry:/var/lib/registry \
  -e REGISTRY_HTTP_ADDR=0.0.0.0:443 \
  -e REGISTRY_HTTP_TLS_CERTIFICATE=/certs/fullchain.pem \
  -e REGISTRY_HTTP_TLS_KEY=/certs/privkey.pem \
  registry:2
```

### Step 6: Verify Registry is Running

```bash
docker ps | grep registry
```

Expected output shows container running:
```
abc123   registry:2   ...   Up 2 minutes   0.0.0.0:443->443/tcp   registry
```

Test the registry API:

```bash
curl -sk https://registry.yourdomain.com/v2/
```

Expected response: `{}`

Check the catalog (empty initially):

```bash
curl -sk https://registry.yourdomain.com/v2/_catalog
```

Expected response: `{"repositories":[]}`

---

## Cache KMS Images

Before deploying KMS CVMs, cache the required images in your local registry.

### Option A: Pull from Docker Hub (If Available)

```bash
# Pull the official image
docker pull dstack0/dstack-kms:0.5.5

# Tag for local registry
docker tag dstack0/dstack-kms:0.5.5 registry.yourdomain.com/dstack-kms:latest

# Push to local registry
docker push registry.yourdomain.com/dstack-kms:latest
```

### Option B: Build Custom Image with Working RPC

The default KMS image uses a rate-limited Ethereum RPC endpoint. For reliable operation, build a custom image:

```bash
# Create build directory
mkdir -p ~/kms-image-build
cd ~/kms-image-build

# Create auth-eth.env with working RPC
cat > auth-eth.env << 'EOF'
HOST=127.0.0.1
PORT=9200
ETH_RPC_URL=https://ethereum-sepolia.publicnode.com
KMS_CONTRACT_ADDR=0xe6c23bfE4686E28DcDA15A1996B1c0C549656E26
EOF

# Create Dockerfile
cat > Dockerfile << 'EOF'
FROM dstack0/dstack-kms:0.5.5
COPY auth-eth.env /etc/kms/auth-eth.env
EOF

# Build and tag
docker build -t registry.yourdomain.com/dstack-kms:fixed .

# Push to local registry
docker push registry.yourdomain.com/dstack-kms:fixed

# Also tag as latest
docker tag registry.yourdomain.com/dstack-kms:fixed \
  registry.yourdomain.com/dstack-kms:latest
docker push registry.yourdomain.com/dstack-kms:latest
```

**Why the custom image?** The default image uses `eth-sepolia.g.alchemy.com/v2/demo` which returns HTTP 429 (rate limited). This causes the auth-eth service to hang, which makes KMS GetMeta calls timeout. The PublicNode endpoint works reliably.

### Verify Images Cached

```bash
curl -sk https://registry.yourdomain.com/v2/_catalog
```

Expected response:
```json
{"repositories":["dstack-kms"]}
```

Check available tags:

```bash
curl -sk https://registry.yourdomain.com/v2/dstack-kms/tags/list
```

Expected response:
```json
{"name":"dstack-kms","tags":["latest","fixed"]}
```

---

## Certificate Renewal

Let's Encrypt certificates expire after 90 days. Set up automatic renewal:

### Test Renewal

```bash
sudo certbot renew --dry-run
```

### Set Up Renewal Hook

Create a hook to copy new certificates and restart the registry:

```bash
sudo cat > /etc/letsencrypt/renewal-hooks/deploy/registry-certs.sh << 'EOF'
#!/bin/bash
# Copy renewed certificates to registry directory
DOMAIN="registry.yourdomain.com"
cp -L /etc/letsencrypt/live/$DOMAIN/fullchain.pem /etc/docker/registry/certs/
cp -L /etc/letsencrypt/live/$DOMAIN/privkey.pem /etc/docker/registry/certs/
chmod 644 /etc/docker/registry/certs/fullchain.pem
chmod 600 /etc/docker/registry/certs/privkey.pem

# Restart registry to pick up new certs
docker restart registry
EOF

sudo chmod +x /etc/letsencrypt/renewal-hooks/deploy/registry-certs.sh
```

### Certbot Timer

Certbot installs a systemd timer that runs twice daily:

```bash
systemctl status certbot.timer
```

---

## Verification Summary

Run this verification script:

```bash
#!/bin/bash
DOMAIN="registry.yourdomain.com"

echo "=== Local Docker Registry Verification ==="
echo

# Check container running
echo -n "Registry Container: "
if docker ps | grep -q registry; then
    echo "Running"
else
    echo "NOT RUNNING"
    exit 1
fi

# Check port binding
echo -n "Port 443 Bound: "
if ss -tln | grep -q ":443"; then
    echo "Yes"
else
    echo "NO"
    exit 1
fi

# Check SSL certificate
echo -n "SSL Certificate: "
if openssl s_client -connect $DOMAIN:443 -servername $DOMAIN </dev/null 2>/dev/null | \
   grep -q "Verify return code: 0"; then
    echo "Valid"
else
    echo "INVALID or expired"
    exit 1
fi

# Check registry API
echo -n "Registry API: "
if curl -sk https://$DOMAIN/v2/ | grep -q "{}"; then
    echo "Responding"
else
    echo "NOT RESPONDING"
    exit 1
fi

# Check for cached images
echo -n "KMS Image Cached: "
if curl -sk https://$DOMAIN/v2/_catalog | grep -q "dstack-kms"; then
    echo "Yes"
else
    echo "NO - Run image caching steps"
fi

echo
echo "Local Docker Registry is ready!"
```

Save as `verify-registry.sh`, update `DOMAIN`, make executable with `chmod +x verify-registry.sh`, and run.

---

## Troubleshooting

### Certificate Verification Failed

**Symptom:** `curl` returns SSL certificate error

**Solution:**
```bash
# Check certificate dates
openssl x509 -in /etc/docker/registry/certs/fullchain.pem -dates -noout

# If expired, renew
sudo certbot renew --force-renewal

# Copy new certs
sudo cp -L /etc/letsencrypt/live/registry.yourdomain.com/fullchain.pem \
  /etc/docker/registry/certs/
sudo cp -L /etc/letsencrypt/live/registry.yourdomain.com/privkey.pem \
  /etc/docker/registry/certs/

# Restart registry
docker restart registry
```

### Port 443 Already in Use

**Symptom:** Container fails to start with port binding error

**Solution:**
```bash
# Find what's using port 443
ss -tlnp | grep :443

# Stop conflicting service (e.g., nginx)
sudo systemctl stop nginx
docker start registry
```

### DNS Not Resolving

**Symptom:** Certificate obtention fails with DNS error

**Solution:**
1. Verify DNS record exists: `dig +short registry.yourdomain.com`
2. Wait for DNS propagation (up to 48 hours for new records)
3. Check Cloudflare/DNS provider dashboard

### Cannot Push Images

**Symptom:** `docker push` fails with authentication error

**Solution for insecure registry:**
```bash
# If using self-signed cert, add to Docker daemon config
cat > /etc/docker/daemon.json << EOF
{
  "insecure-registries": ["registry.yourdomain.com"]
}
EOF
sudo systemctl restart docker
```

**Note:** With Let's Encrypt certificates, this shouldn't be necessary.

### Image Pull Fails in CVM

**Symptom:** CVM boot fails with "manifest not found"

**Solution:**
1. Verify image exists: `curl -sk https://registry.yourdomain.com/v2/_catalog`
2. Check exact tag: `curl -sk https://registry.yourdomain.com/v2/dstack-kms/tags/list`
3. Re-push image if missing

---

## Usage in CVM Deployment

When deploying CVMs, use the local registry image path:

```yaml
# docker-compose.yaml for CVM
services:
  kms:
    image: registry.yourdomain.com/dstack-kms:fixed
    # ... other config
```

The CVM will pull from your local registry instead of Docker Hub.

---

## Next Steps

With the local Docker registry running and images cached, proceed to:

- [Smart Contract Compilation](/tutorial/smart-contract-compilation) - Compile KMS contracts locally
- [KMS Build & Configuration](/tutorial/kms-build-configuration) - Prepare KMS for CVM deployment

## Additional Resources

- [Docker Registry Documentation](https://docs.docker.com/registry/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [Certbot Documentation](https://certbot.eff.org/docs/)

---
title: "SSL Certificate Setup"
description: "Obtain Let's Encrypt SSL certificates for dstack services"
section: "Prerequisites"
stepNumber: 3
totalSteps: 5
lastUpdated: 2025-12-09
prerequisites:
  - dns-configuration
tags:
  - ssl
  - certificates
  - letsencrypt
  - https
  - prerequisites
difficulty: intermediate
estimatedTime: "20 minutes"
---

# SSL Certificate Setup

This tutorial guides you through obtaining SSL certificates from Let's Encrypt for your dstack deployment. These certificates enable HTTPS for the local Docker registry and other services.

## What You'll Configure

| Certificate | Used By | Domain Example |
|-------------|---------|----------------|
| Registry certificate | Local Docker registry | `registry.yourdomain.com` |
| Gateway wildcard | dstack Gateway | `*.yourdomain.com` |
| KMS certificate | KMS external access | `kms.yourdomain.com` |

For this tutorial, we'll focus on the **registry certificate** which is required for the [Local Docker Registry](/tutorial/local-docker-registry) tutorial.

## Prerequisites

Before starting, ensure you have:

- Completed [DNS Configuration](/tutorial/dns-configuration) - DNS records must exist
- Domain pointing to your server (verified via `dig`)
- Port 80 accessible for Let's Encrypt HTTP-01 challenge
- SSH access to your TDX server

### Verify DNS Resolution

```bash
# Replace with your domain
dig +short registry.yourdomain.com
```

Should return your server's IP address. If not, the certificate request will fail.

---

## Quick Start: Configure with Ansible

> **Using Ansible?** Playbooks are in `~/dstack-info/ansible`. If you haven't set up Ansible yet, see [TDX Software Installation: Quick Start with Ansible](/tutorial/tdx-software-installation#quick-start-install-with-ansible) for initial setup.

### Step 1: Run the SSL Playbook

```bash
ansible-playbook -i inventory/hosts.yml playbooks/setup-ssl-certificates.yml \
  -e "registry_domain=registry.yourdomain.com" \
  -e "email=your-email@example.com"
```

The playbook will:
1. **Install certbot** if not present
2. **Obtain certificate** via HTTP-01 challenge
3. **Create registry cert directory** at `/etc/docker/registry/certs/`
4. **Copy certificates** for Docker registry use
5. **Set up auto-renewal** via systemd timer

### Step 2: Verify

```bash
ansible-playbook -i inventory/hosts.yml playbooks/verify-ssl-certificates.yml \
  -e "registry_domain=registry.yourdomain.com"
```

---

## Manual Setup

If you prefer to configure manually, follow these steps.

### Step 1: Install Certbot

```bash
sudo apt update
sudo apt install -y certbot
```

Verify installation:

```bash
certbot --version
```

### Step 2: Stop Services Using Port 80

Let's Encrypt's HTTP-01 challenge requires port 80. Stop any services using it:

```bash
# Check what's using port 80
ss -tlnp | grep :80

# Stop nginx if running
sudo systemctl stop nginx 2>/dev/null || true

# Stop apache if running
sudo systemctl stop apache2 2>/dev/null || true
```

### Step 3: Obtain Registry Certificate

Request a certificate for your registry domain:

```bash
sudo certbot certonly --standalone \
  -d registry.yourdomain.com \
  --non-interactive \
  --agree-tos \
  --email your-email@example.com
```

**Replace:**
- `registry.yourdomain.com` with your actual registry domain
- `your-email@example.com` with your email (for expiry notifications)

**Expected output:**

```
Successfully received certificate.
Certificate is saved at: /etc/letsencrypt/live/registry.yourdomain.com/fullchain.pem
Key is saved at:         /etc/letsencrypt/live/registry.yourdomain.com/privkey.pem
```

### Step 4: Create Registry Certificate Directory

Docker registry needs certificates in a specific location:

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

### Step 5: Verify Certificate

Check the certificate is valid:

```bash
openssl x509 -in /etc/docker/registry/certs/fullchain.pem -text -noout | \
  grep -E "(Subject:|Not After)"
```

Expected output shows your domain and expiry date (90 days from now):

```
        Subject: CN = registry.yourdomain.com
            Not After : Mar  9 12:00:00 2025 GMT
```

---

## Certificate Auto-Renewal

Let's Encrypt certificates expire after 90 days. Certbot sets up automatic renewal.

### Verify Auto-Renewal Timer

```bash
systemctl status certbot.timer
```

Should show the timer is active and running.

### Test Renewal Process

```bash
sudo certbot renew --dry-run
```

Should complete without errors.

### Set Up Renewal Hook for Registry

When certificates renew, the registry needs updated copies:

```bash
sudo cat > /etc/letsencrypt/renewal-hooks/deploy/registry-certs.sh << 'EOF'
#!/bin/bash
# Update registry certificates after renewal

DOMAIN="registry.yourdomain.com"
CERT_DIR="/etc/docker/registry/certs"

# Copy new certificates
cp -L /etc/letsencrypt/live/$DOMAIN/fullchain.pem $CERT_DIR/
cp -L /etc/letsencrypt/live/$DOMAIN/privkey.pem $CERT_DIR/

# Fix permissions
chmod 644 $CERT_DIR/fullchain.pem
chmod 600 $CERT_DIR/privkey.pem

# Restart registry to use new certs (if running)
docker restart registry 2>/dev/null || true

echo "Registry certificates updated: $(date)"
EOF

sudo chmod +x /etc/letsencrypt/renewal-hooks/deploy/registry-certs.sh
```

**Update `DOMAIN` in the script to match your registry domain.**

---

## Additional Certificates (Optional)

### Gateway Wildcard Certificate

For the dstack Gateway, you may want a wildcard certificate. This requires DNS-01 challenge with Cloudflare:

```bash
# Install Cloudflare plugin
sudo apt install -y python3-certbot-dns-cloudflare

# Create credentials file
sudo mkdir -p /etc/cloudflare
sudo cat > /etc/cloudflare/credentials.ini << EOF
dns_cloudflare_api_token = YOUR_CLOUDFLARE_API_TOKEN
EOF
sudo chmod 600 /etc/cloudflare/credentials.ini

# Obtain wildcard certificate
sudo certbot certonly --dns-cloudflare \
  --dns-cloudflare-credentials /etc/cloudflare/credentials.ini \
  -d "*.yourdomain.com" \
  -d "yourdomain.com" \
  --non-interactive \
  --agree-tos \
  --email your-email@example.com
```

**Note:** Wildcard certificates are configured later in the [Gateway SSL Setup](/tutorial/gateway-ssl-setup) tutorial.

---

## Verification Summary

Run this verification script:

```bash
#!/bin/bash
DOMAIN="registry.yourdomain.com"

echo "=== SSL Certificate Verification ==="
echo

# Check certbot installed
echo -n "Certbot Installed: "
if command -v certbot &> /dev/null; then
    echo "Yes"
else
    echo "NO"
    exit 1
fi

# Check certificate exists
echo -n "Certificate Exists: "
if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    echo "Yes"
else
    echo "NO"
    exit 1
fi

# Check registry cert directory
echo -n "Registry Certs Directory: "
if [ -f "/etc/docker/registry/certs/fullchain.pem" ]; then
    echo "Yes"
else
    echo "NO - Run step 4"
    exit 1
fi

# Check certificate validity
echo -n "Certificate Valid: "
if openssl x509 -checkend 86400 -noout -in /etc/docker/registry/certs/fullchain.pem 2>/dev/null; then
    echo "Yes"
else
    echo "NO - Certificate expired or expiring soon"
    exit 1
fi

# Check auto-renewal timer
echo -n "Auto-Renewal Timer: "
if systemctl is-active --quiet certbot.timer; then
    echo "Active"
else
    echo "NOT ACTIVE"
fi

echo
echo "SSL certificates are configured!"
```

Save as `verify-ssl.sh`, update `DOMAIN`, make executable with `chmod +x verify-ssl.sh`, and run.

---

## Troubleshooting

### Challenge Failed: Could not connect

**Symptom:** Certbot fails with connection error

**Solution:**
1. Verify port 80 is open: `ss -tlnp | grep :80`
2. Stop any services using port 80
3. Check firewall allows port 80: `sudo ufw status`
4. Verify DNS resolves to your server: `dig +short registry.yourdomain.com`

### Rate Limit Exceeded

**Symptom:** Let's Encrypt returns rate limit error

**Solution:**
1. Wait 1 hour and retry
2. Use `--staging` flag for testing (creates invalid certs)
3. Check https://letsencrypt.org/docs/rate-limits/

### DNS Resolution Failed

**Symptom:** Certbot can't verify domain ownership

**Solution:**
1. Check DNS record exists: `dig +short registry.yourdomain.com`
2. Wait for DNS propagation (up to 48 hours for new records)
3. Verify record points to correct IP

### Permission Denied Copying Certificates

**Symptom:** Can't copy certificates to registry directory

**Solution:**
```bash
# Use sudo for all operations
sudo mkdir -p /etc/docker/registry/certs
sudo cp -L /etc/letsencrypt/live/registry.yourdomain.com/fullchain.pem \
  /etc/docker/registry/certs/
```

---

## Next Steps

With SSL certificates configured, proceed to:

- [Gramine Key Provider](/tutorial/gramine-key-provider) - Deploy SGX-based key provider
- [Local Docker Registry](/tutorial/local-docker-registry) - Uses these certificates

## Additional Resources

- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [Certbot Documentation](https://certbot.eff.org/docs/)
- [Cloudflare DNS Plugin](https://certbot-dns-cloudflare.readthedocs.io/)

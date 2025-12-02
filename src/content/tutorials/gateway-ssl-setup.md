---
title: "Gateway SSL Setup"
description: "Configure Certbot and SSL certificates for dstack gateway using Cloudflare DNS"
section: "Gateway Deployment"
stepNumber: 1
totalSteps: 3
lastUpdated: 2025-12-02
prerequisites:
  - kms-service-setup
  - dns-configuration
tags:
  - dstack
  - gateway
  - ssl
  - certbot
  - cloudflare
  - letsencrypt
difficulty: "intermediate"
estimatedTime: "20 minutes"
---

# Gateway SSL Setup

This tutorial guides you through setting up SSL certificates for the dstack gateway using Certbot and Cloudflare DNS validation. The gateway uses these certificates to provide secure HTTPS access to applications running in Confidential Virtual Machines (CVMs).

## What You'll Configure

- Cloudflare API token for DNS-01 ACME validation
- Certbot for automatic certificate management
- CAA DNS records to restrict certificate issuance
- SSL certificates for your gateway domain

## Prerequisites

Before starting, ensure you have:

- Completed [KMS Service Setup](/tutorial/kms-service-setup)
- Completed [DNS Configuration](/tutorial/dns-configuration) with wildcard DNS
- Cloudflare account managing your domain
- Domain with wildcard DNS pointing to your TDX server

## Step 1: Create Cloudflare API Token

The gateway needs a Cloudflare API token with DNS edit permissions for automatic certificate renewal.

### Generate an API token

1. Log into [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Go to **My Profile** → **API Tokens**
3. Click **Create Token**
4. Select **Create Custom Token**
5. Configure the token:
   - **Token name:** `dstack-gateway-dns`
   - **Permissions:** Zone → DNS → Edit
   - **Zone Resources:** Include → Specific zone → Select your domain
6. Click **Continue to summary** then **Create Token**
7. Copy and save the token securely

### Test the API token

Verify the token works with Cloudflare:

```bash
# Replace with your token and zone ID
export CF_API_TOKEN="your-cloudflare-api-token"
export CF_ZONE_ID="your-cloudflare-zone-id"

curl -X GET "https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/dns_records" \
  -H "Authorization: Bearer ${CF_API_TOKEN}" \
  -H "Content-Type: application/json" | jq '.success'
```

Expected output:

```
true
```

### Find your Zone ID

If you don't know your Zone ID:

1. Go to Cloudflare Dashboard
2. Select your domain
3. Scroll down on the Overview page
4. Zone ID is in the right sidebar under **API**

## Step 2: Store Cloudflare Credentials

Create a secure location for Cloudflare credentials:

```bash
sudo mkdir -p /etc/dstack/cloudflare
sudo chmod 700 /etc/dstack/cloudflare
```

Create the credentials file:

```bash
sudo tee /etc/dstack/cloudflare/credentials.env > /dev/null <<EOF
# Cloudflare API credentials for dstack gateway
CF_API_TOKEN=your-cloudflare-api-token
CF_ZONE_ID=your-cloudflare-zone-id
CF_ACCOUNT_ID=your-cloudflare-account-id
EOF
```

Secure the credentials file:

```bash
sudo chmod 600 /etc/dstack/cloudflare/credentials.env
```

Verify the file is readable only by root:

```bash
ls -la /etc/dstack/cloudflare/credentials.env
```

Expected output:

```
-rw------- 1 root root 156 Dec  2 10:00 /etc/dstack/cloudflare/credentials.env
```

## Step 3: Configure CAA Records

CAA (Certificate Authority Authorization) records restrict which certificate authorities can issue certificates for your domain. This prevents unauthorized certificate issuance.

### Add CAA records in Cloudflare

For your hosted subdomain (e.g., `hosted.yourdomain.com`):

1. Go to Cloudflare Dashboard → DNS → Records
2. Click **Add record**
3. Create CAA record for Let's Encrypt:
   - **Type:** CAA
   - **Name:** `hosted` (or your subdomain)
   - **Tag:** Select "Only allow specific hostnames"
   - **CA domain name:** `letsencrypt.org`
   - **Flags:** `0`
   - **TTL:** Auto
4. Click **Save**

If CAA records are already configured on the parent domain, they will be inherited by subdomains.

### Verify CAA records

```bash
dig CAA hosted.yourdomain.com +short
```

Expected output (may show parent domain records):

```
0 issue "letsencrypt.org"
```

Or check the parent domain:

```bash
dig CAA yourdomain.com +short
```

## Step 4: Create Certbot Configuration

Create the certbot configuration directory:

```bash
sudo mkdir -p /etc/dstack/certbot
sudo chmod 755 /etc/dstack/certbot
```

Create the certbot configuration file:

```bash
sudo tee /etc/dstack/certbot/certbot.toml > /dev/null <<'EOF'
# dstack Gateway Certbot Configuration

[acme]
# Let's Encrypt production URL (use staging for testing)
# Staging: https://acme-staging-v02.api.letsencrypt.org/directory
url = "https://acme-v02.api.letsencrypt.org/directory"

# Email for certificate notifications
email = "your-email@example.com"

[cloudflare]
# Cloudflare API credentials (loaded from environment)
# api_token and zone_id are set via environment variables

[domain]
# Base domain for gateway certificates
base = "hosted.yourdomain.com"

# Enable wildcard certificate for all subdomains
wildcard = true

[output]
# Certificate output directory
cert_dir = "/etc/dstack/certs"
EOF
```

### Update the configuration

Replace the placeholder values:

```bash
sudo sed -i 's/your-email@example.com/your-actual-email@example.com/' /etc/dstack/certbot/certbot.toml
sudo sed -i 's/hosted.yourdomain.com/your-actual-subdomain.yourdomain.com/' /etc/dstack/certbot/certbot.toml
```

Verify the configuration:

```bash
cat /etc/dstack/certbot/certbot.toml
```

## Step 5: Create Certificate Directory

Create the directory for storing certificates:

```bash
sudo mkdir -p /etc/dstack/certs
sudo chmod 755 /etc/dstack/certs
```

## Step 6: Install Certbot (if not already installed)

Install certbot and the Cloudflare DNS plugin:

```bash
sudo apt update
sudo apt install -y certbot python3-certbot-dns-cloudflare
```

Verify installation:

```bash
certbot --version
```

Expected output:

```
certbot 2.x.x
```

## Step 7: Create Cloudflare Credentials File for Certbot

Certbot requires credentials in a specific format:

```bash
sudo tee /etc/dstack/cloudflare/cloudflare.ini > /dev/null <<EOF
# Cloudflare API credentials for Certbot
dns_cloudflare_api_token = your-cloudflare-api-token
EOF
```

Secure the credentials file:

```bash
sudo chmod 600 /etc/dstack/cloudflare/cloudflare.ini
```

## Step 8: Request Initial Certificate

Request a wildcard certificate for your gateway domain:

```bash
sudo certbot certonly \
  --dns-cloudflare \
  --dns-cloudflare-credentials /etc/dstack/cloudflare/cloudflare.ini \
  --dns-cloudflare-propagation-seconds 60 \
  -d "*.hosted.yourdomain.com" \
  -d "hosted.yourdomain.com" \
  --cert-path /etc/dstack/certs/cert.pem \
  --key-path /etc/dstack/certs/key.pem \
  --fullchain-path /etc/dstack/certs/fullchain.pem \
  --chain-path /etc/dstack/certs/chain.pem \
  --agree-tos \
  --non-interactive \
  --email your-email@example.com
```

Expected output:

```
Saving debug log to /var/log/letsencrypt/letsencrypt.log
Plugins selected: Authenticator dns-cloudflare, Installer None
Requesting a certificate for *.hosted.yourdomain.com and hosted.yourdomain.com
Waiting 60 seconds for DNS changes to propagate
Successfully received certificate.
Certificate is saved at: /etc/letsencrypt/live/hosted.yourdomain.com/fullchain.pem
Key is saved at:         /etc/letsencrypt/live/hosted.yourdomain.com/privkey.pem
```

### Copy certificates to dstack directory

```bash
sudo cp /etc/letsencrypt/live/hosted.yourdomain.com/fullchain.pem /etc/dstack/certs/
sudo cp /etc/letsencrypt/live/hosted.yourdomain.com/privkey.pem /etc/dstack/certs/
sudo chmod 600 /etc/dstack/certs/privkey.pem
sudo chmod 644 /etc/dstack/certs/fullchain.pem
```

## Step 9: Set Up Automatic Renewal

Create a renewal hook to copy certificates to dstack directory:

```bash
sudo mkdir -p /etc/letsencrypt/renewal-hooks/deploy
sudo tee /etc/letsencrypt/renewal-hooks/deploy/dstack-gateway.sh > /dev/null <<'EOF'
#!/bin/bash
# Copy renewed certificates to dstack directory
cp /etc/letsencrypt/live/hosted.yourdomain.com/fullchain.pem /etc/dstack/certs/
cp /etc/letsencrypt/live/hosted.yourdomain.com/privkey.pem /etc/dstack/certs/
chmod 600 /etc/dstack/certs/privkey.pem
chmod 644 /etc/dstack/certs/fullchain.pem

# Reload gateway service if running
systemctl is-active --quiet dstack-gateway && systemctl reload dstack-gateway
EOF

sudo chmod +x /etc/letsencrypt/renewal-hooks/deploy/dstack-gateway.sh
```

Update the script with your domain:

```bash
sudo sed -i 's/hosted.yourdomain.com/your-actual-subdomain.yourdomain.com/g' \
  /etc/letsencrypt/renewal-hooks/deploy/dstack-gateway.sh
```

### Test automatic renewal

```bash
sudo certbot renew --dry-run
```

Expected output:

```
Congratulations, all renewals succeeded.
```

## Ansible Automation

You can automate the SSL setup using Ansible.

### Run the Ansible playbook

```bash
cd ~/dstack-info/ansible
ansible-playbook -i inventory/hosts.yml playbooks/setup-gateway-ssl.yml
```

The playbook will:
1. Create Cloudflare credentials directory
2. Store API credentials securely
3. Install certbot and Cloudflare plugin
4. Request initial certificate
5. Set up automatic renewal hooks

## Troubleshooting

### Certbot fails with DNS validation error

Check that DNS propagation has completed:

```bash
dig TXT _acme-challenge.hosted.yourdomain.com +short
```

If empty, wait a few minutes and try again. You can increase propagation wait time:

```bash
sudo certbot certonly \
  --dns-cloudflare \
  --dns-cloudflare-credentials /etc/dstack/cloudflare/cloudflare.ini \
  --dns-cloudflare-propagation-seconds 120 \
  ...
```

### Invalid API token error

Verify your token has DNS:Edit permission:

```bash
curl -X GET "https://api.cloudflare.com/client/v4/user/tokens/verify" \
  -H "Authorization: Bearer $(cat /etc/dstack/cloudflare/cloudflare.ini | grep api_token | cut -d= -f2 | tr -d ' ')" \
  -H "Content-Type: application/json"
```

### CAA record prevents issuance

Ensure CAA records allow letsencrypt.org:

```bash
dig CAA yourdomain.com +short
```

If needed, add CAA record in Cloudflare allowing Let's Encrypt.

### Certificate not trusted

Ensure you're using the fullchain certificate (includes intermediate CA):

```bash
openssl x509 -in /etc/dstack/certs/fullchain.pem -noout -issuer
```

Should show Let's Encrypt as issuer.

## Verification Checklist

Before proceeding, verify you have:

- [ ] Created Cloudflare API token with DNS:Edit permission
- [ ] Stored Cloudflare credentials securely
- [ ] Configured CAA records for Let's Encrypt
- [ ] Created certbot configuration
- [ ] Requested wildcard certificate successfully
- [ ] Copied certificates to /etc/dstack/certs/
- [ ] Set up automatic renewal hooks
- [ ] Tested dry-run renewal

### Quick verification script

```bash
#!/bin/bash
echo "Checking gateway SSL setup..."

# Check credentials exist
if [ -f "/etc/dstack/cloudflare/cloudflare.ini" ]; then
    echo "✓ Cloudflare credentials exist"
else
    echo "✗ Cloudflare credentials not found"
    exit 1
fi

# Check certificate exists
if [ -f "/etc/dstack/certs/fullchain.pem" ]; then
    echo "✓ Certificate exists"
else
    echo "✗ Certificate not found"
    exit 1
fi

# Check private key exists
if [ -f "/etc/dstack/certs/privkey.pem" ]; then
    echo "✓ Private key exists"
else
    echo "✗ Private key not found"
    exit 1
fi

# Check certificate validity
EXPIRY=$(openssl x509 -in /etc/dstack/certs/fullchain.pem -noout -enddate | cut -d= -f2)
echo "✓ Certificate expires: $EXPIRY"

# Check renewal hook
if [ -x "/etc/letsencrypt/renewal-hooks/deploy/dstack-gateway.sh" ]; then
    echo "✓ Renewal hook installed"
else
    echo "⚠ Renewal hook not found or not executable"
fi

echo ""
echo "Gateway SSL setup verified successfully!"
```

## Understanding SSL for dstack Gateway

### Certificate Chain

```
Let's Encrypt Root CA
    ↓
Let's Encrypt Intermediate CA (R3 or E1)
    ↓
Your Domain Certificate (*.hosted.yourdomain.com)
```

### How Gateway Uses Certificates

1. **TLS Termination:** Gateway terminates TLS connections from clients
2. **Wildcard Coverage:** Single certificate covers all application subdomains
3. **Automatic Renewal:** Certbot renews before expiration (90-day certificates)
4. **Zero Downtime:** Renewal hook reloads gateway without interruption

### Security Considerations

| Feature | Purpose |
|---------|---------|
| CAA Records | Prevent unauthorized CA from issuing certificates |
| DNS-01 Validation | Prove domain ownership without exposing server |
| Private Key Protection | Key stored with 600 permissions (root only) |
| Automatic Renewal | Prevents certificate expiration |

## Next Steps

With SSL certificates configured, proceed to [Gateway Build & Configuration](/tutorial/gateway-build-configuration) to build and configure the dstack gateway.

## Additional Resources

- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [Certbot Cloudflare Plugin](https://certbot-dns-cloudflare.readthedocs.io/)
- [Cloudflare API Documentation](https://api.cloudflare.com/)
- [CAA Records RFC 8659](https://tools.ietf.org/html/rfc8659)

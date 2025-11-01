---
title: "DNS Configuration"
description: "Configure Cloudflare DNS with wildcard domain support for dstack gateway deployment"
section: "Prerequisites"
stepNumber: 1
totalSteps: 3
lastUpdated: 2025-11-01
prerequisites:
  - "Domain registered with registrar"
  - "Cloudflare account (free tier works)"
tags:
  - dns
  - cloudflare
  - prerequisites
difficulty: beginner
estimatedTime: "30 minutes"
---

# DNS Configuration

In this tutorial, you'll configure DNS for your dstack deployment using Cloudflare. The dstack gateway requires a wildcard domain to automatically provision subdomains for deployed applications with TLS certificates.

## Why Cloudflare?

The dstack gateway is designed to work with Cloudflare's DNS API for automatic TLS certificate provisioning. While you can use other DNS providers, Cloudflare integration provides:

- **Automatic TLS**: Gateway provisions Let's Encrypt certificates via DNS-01 challenge
- **Free tier**: No cost for DNS and CDN services
- **Fast propagation**: DNS changes typically propagate within minutes
- **API access**: Programmatic DNS management for automation

## Prerequisites

Before starting, ensure you have:

- A registered domain name (example: `yourdomain.com`)
- Access to your domain registrar's DNS settings
- A Cloudflare account (sign up at https://cloudflare.com if needed)

## Step 1: Add Domain to Cloudflare

### 1.1 Log into Cloudflare Dashboard

Visit https://dash.cloudflare.com and log into your account.

### 1.2 Add Your Domain

1. Click **"+ Add"** in the top right navigation
2. Click **"Connect a domain"** in the submenu
3. Enter your domain name (e.g., `yourdomain.com`) and fill out the rest of the form according to your preferences
4. Click **"Continue"**
5. Select the **Free** plan (unless you need paid features)

### 1.3 Update Nameservers at Your Registrar

Cloudflare will display two nameservers (e.g., `aden.ns.cloudflare.com` and `olga.ns.cloudflare.com`) and instructions for updating your domain. For ease, these steps are:

1. Log into your DNS provider (most likely your registrar)
2. Make sure DNSSEC is off
3. Replace your current nameservers with Cloudflare nameservers
4. Use the **"Check nameservers now"** button to confirm completion

**Note:** Nameserver changes can take 24-48 hours to fully propagate, but often complete within a few hours.

## Step 2: Configure DNS Records

Once your domain is active on Cloudflare, configure the DNS records for dstack.

### 2.1 Add A Record for Host

Create an A record pointing your subdomain to the dstack host server:

1. In Cloudflare dashboard, click on your domain
2. Navigate to **DNS** → **Records**
3. Click **"Add record"**
4. Configure:
   - **Type**: A
   - **Name**: `dstack` (or your preferred subdomain)
   - **IPv4 address**: Your server IP (e.g., `173.231.234.133`)
   - **Proxy status**: DNS only (gray cloud) - **Important!**
   - **TTL**: Auto
5. Click **"Save"**

**Why DNS only?** Cloudflare's proxy (orange cloud) would route traffic through their CDN, breaking TDX attestation. Use **gray cloud (DNS only)** to direct traffic straight to your server.

### 2.2 Add Wildcard DNS Record

Create a wildcard A record for application subdomains:

1. Click **"Add record"** again
2. Configure:
   - **Type**: A
   - **Name**: `*.dstack` (wildcard under your subdomain)
   - **IPv4 address**: Same server IP as above
   - **Proxy status**: DNS only (gray cloud)
   - **TTL**: Auto
3. Click **"Save"**

This allows the gateway to automatically provision subdomains like:
- `app1.dstack.yourdomain.com`
- `app2.dstack.yourdomain.com`
- `custom-name.dstack.yourdomain.com`

### 2.3 Add CAA Records (Optional but Recommended)

CAA records restrict which Certificate Authorities can issue certificates for your domain:

1. Click **"Add record"**
2. Configure:
   - **Type**: CAA
   - **Name**: `@` (for root domain, or use `dstack` for subdomain only)
   - **Flags**: `0`
   - **Tag**: Select **"Only allow specific hostnames"** from dropdown
   - **CA domain name**: `letsencrypt.org`
   - **TTL**: Auto
3. Click **"Save"**

Repeat for wildcard subdomain:
1. Click **"Add record"**
2. Configure:
   - **Type**: CAA
   - **Name**: `*.dstack`
   - **Flags**: `0`
   - **Tag**: Select **"Only allow specific hostnames"** from dropdown
   - **CA domain name**: `letsencrypt.org`
   - **TTL**: Auto
3. Click **"Save"**

**Note:** The "Only allow specific hostnames" tag option corresponds to the `issue` tag in CAA record syntax. This ensures only Let's Encrypt can issue certificates for your domain, improving security.

## Step 3: Generate Cloudflare API Token

The dstack gateway needs API access to manage DNS records for TLS certificate provisioning.

### 3.1 Create API Token

1. In Cloudflare dashboard, click your profile icon (top right)
2. Select **"My Profile"**
3. Navigate to **API Tokens** tab
4. Click **"Create Token"**
5. Use the **"Edit zone DNS"** template
6. Configure:
   - **Permissions**:
     - Zone → DNS → Edit
   - **Zone Resources**:
     - Include → Specific zone → Select your domain
   - **TTL**: Not set (token doesn't expire, or set expiration if preferred)
7. Click **"Continue to summary"**
8. Review permissions
9. Click **"Create Token"**

### 3.2 Save API Token Securely

**IMPORTANT:** Copy the API token immediately and save it securely. You'll need this for gateway configuration.

The token will look like: `abcdef123456789_example_token_xyz`

**Store this token securely** - you won't be able to see it again in Cloudflare dashboard. Consider using:
- Password manager
- Encrypted file
- Secret management system (if deploying in production)

### 3.3 Test API Token

Verify the token works with a simple API test:

```bash
# Replace TOKEN with your actual API token
# Replace ZONE_ID with your Cloudflare zone ID (found in domain Overview)
curl -X GET "https://api.cloudflare.com/client/v4/zones/ZONE_ID/dns_records" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

Expected response: JSON with `"success": true` and list of your DNS records.

## Step 4: Test DNS Resolution

Verify your DNS configuration is working correctly.

### 4.1 Test Base Domain

```bash
# Replace with your actual subdomain
dig dstack.yourdomain.com

# Should return your server IP in the ANSWER section
# Example output:
# dstack.yourdomain.com.  300  IN  A  173.231.234.133
```

### 4.2 Test Wildcard Domain

```bash
# Test a random subdomain under wildcard
dig test.dstack.yourdomain.com
dig app.dstack.yourdomain.com
dig anything.dstack.yourdomain.com

# All should return your server IP
```

### 4.3 Verify from Multiple Locations

DNS propagation can vary by location. Test from different DNS resolvers:

```bash
# Google DNS
dig @8.8.8.8 dstack.yourdomain.com

# Cloudflare DNS
dig @1.1.1.1 dstack.yourdomain.com

# Your local DNS (no @)
dig dstack.yourdomain.com
```

All should return your server IP.

## Step 5: DNS Record Summary

After completion, you should have these DNS records in Cloudflare:

| Type | Name | Value | Proxy Status |
|------|------|-------|--------------|
| A | `dstack` | Your server IP | DNS only (gray) |
| A | `*.dstack` | Your server IP | DNS only (gray) |
| CAA | `dstack` | `letsencrypt.org` | N/A |
| CAA | `*.dstack` | `letsencrypt.org` | N/A |

## Troubleshooting

### DNS Not Resolving

**Issue:** `dig` returns `NXDOMAIN` or no answer.

**Solutions:**
1. Wait for DNS propagation (can take up to 48 hours)
2. Check nameservers are set correctly at registrar
3. Verify Cloudflare shows domain as "Active"
4. Ensure DNS records saved correctly in Cloudflare dashboard

### Wildcard Not Working

**Issue:** Base domain resolves, but `*.dstack.yourdomain.com` doesn't.

**Solutions:**
1. Verify wildcard record uses `*.dstack` not `*`
2. Check wildcard record has same IP as base record
3. Confirm proxy status is "DNS only" (gray cloud)
4. Wait for DNS cache to expire (TTL)

### API Token Permission Denied

**Issue:** `curl` test returns `"success": false` or permission errors.

**Solutions:**
1. Verify token has "Zone → DNS → Edit" permission
2. Ensure token is scoped to correct zone (your domain)
3. Check token hasn't expired (if TTL was set)
4. Regenerate token if compromised

### Propagation Taking Too Long

**Issue:** DNS changes not visible after several hours.

**Solutions:**
1. Check nameservers at registrar match Cloudflare's
2. Use `dig @1.1.1.1` to query Cloudflare DNS directly (bypasses local cache)
3. Clear local DNS cache: `sudo systemd-resolve --flush-caches` (Linux) or `sudo dscacheutil -flushcache` (macOS)
4. Test from external DNS checker: https://www.whatsmydns.net/

## Next Steps

With DNS configured, you're ready to proceed to blockchain setup:

- **Next Tutorial:** [Blockchain Wallet Setup](./blockchain-setup)

After completing all prerequisites (DNS + Blockchain), you'll configure the dstack gateway to use:
- Your domain for TLS certificate provisioning
- Your Cloudflare API token for DNS management
- Your blockchain wallet for KMS interactions

---

**Important Notes:**

- Keep your Cloudflare API token secure - treat it like a password
- Use DNS only (gray cloud) for dstack records to preserve TDX attestation
- Wildcard DNS enables automatic subdomain provisioning for applications
- CAA records improve security by restricting certificate issuance

# DNSimple Setup for dstack.info → Cloudflare Pages

Your site is now deployed at: **https://408573bd.dstack-info.pages.dev**

To point dstack.info to Cloudflare Pages, you have 2 options:

## Option 1: CNAME to Cloudflare Pages (Quickest - 5 min)

### At DNSimple:

1. Log in to https://dnsimple.com
2. Go to dstack.info domain settings
3. Add these DNS records:

**For root domain (dstack.info):**
```
Type: ALIAS (or ANAME if ALIAS not available)
Name: @
Target: dstack-info.pages.dev
TTL: 300
```

**For www subdomain:**
```
Type: CNAME
Name: www
Target: dstack-info.pages.dev
TTL: 300
```

### Then at Cloudflare:

You'll need to add the custom domain through the Cloudflare dashboard (CLI doesn't support this yet):

1. Go to https://dash.cloudflare.com/
2. Navigate to: **Workers & Pages** > **dstack-info** project
3. Click **Custom domains** tab
4. Click **Set up a custom domain**
5. Enter: `dstack.info`
6. Click **Continue** and follow validation steps

**Wait 5-15 minutes** for DNS propagation and SSL certificate provisioning.

---

## Option 2: Transfer DNS to Cloudflare (Better Performance - 10 min)

This gives you better performance, DDoS protection, and easier management.

### Step 1: Add domain to Cloudflare

1. Go to https://dash.cloudflare.com/
2. Click **Add a site**
3. Enter: `dstack.info`
4. Select **Free** plan
5. Click **Continue**

### Step 2: Cloudflare will scan your DNS records

Review and confirm they're correct.

### Step 3: Change nameservers at DNSimple

1. Cloudflare will show you 2 nameservers like:
   ```
   aron.ns.cloudflare.com
   vera.ns.cloudflare.com
   ```

2. At DNSimple:
   - Go to dstack.info domain settings
   - Click **DNS** > **Name servers**
   - Change from DNSimple nameservers to Cloudflare nameservers
   - Save changes

3. Wait for DNS propagation (can take up to 24 hours, usually <1 hour)

### Step 4: Add custom domain to Pages

Once nameservers are updated:

1. Go to **Workers & Pages** > **dstack-info**
2. Click **Custom domains** tab
3. Click **Set up a custom domain**
4. Enter: `dstack.info`
5. Cloudflare will auto-configure everything

---

## Which Option Should You Choose?

**Option 1 (CNAME):** Fastest, keeps DNSimple management
**Option 2 (Transfer):** Better performance, built-in analytics, easier management

## Current Status

✅ Site deployed to Cloudflare Pages
✅ Live at: https://408573bd.dstack-info.pages.dev
⏳ Waiting for custom domain setup (requires dashboard access)

## Verification

After DNS setup, verify with:
```bash
# Check DNS propagation
dig dstack.info

# Should show either:
# - ALIAS/ANAME → dstack-info.pages.dev (Option 1)
# - Cloudflare IPs (Option 2)
```

Test the site loads at: https://dstack.info

---

**Need help?** The Cloudflare dashboard steps are required because wrangler CLI doesn't support custom domain management yet.

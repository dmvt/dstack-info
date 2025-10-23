# Final Step: Add Custom Domain in Cloudflare

## ✅ What's Done

- ✅ Site deployed to Cloudflare Pages: https://408573bd.dstack-info.pages.dev
- ✅ DNS records configured at DNSimple:
  - `dstack.info` → ALIAS → `dstack-info.pages.dev`
  - `www.dstack.info` → CNAME → `dstack-info.pages.dev`
- ✅ DNS is already resolving to Cloudflare IPs!

```bash
$ dig +short dstack.info
172.66.44.134
172.66.47.122
```

## ⏳ One Quick Dashboard Step (2 minutes)

The DNS is ready, but we need to tell Cloudflare Pages to accept traffic for dstack.info.

### Steps:

1. **Go to Cloudflare Dashboard:**
   https://dash.cloudflare.com/e479dace4a219412650dc7fa6d8e860d/pages/view/dstack-info

2. **Click "Custom domains" tab**

3. **Click "Set up a custom domain"**

4. **Enter:** `dstack.info`

5. **Click "Continue"**

6. Cloudflare will automatically:
   - Validate DNS (already pointing correctly)
   - Provision SSL certificate (takes 1-2 minutes)
   - Enable HTTPS

7. **Repeat for www:**
   - Add another custom domain: `www.dstack.info`

## Expected Result

In 2-5 minutes:
- ✅ https://dstack.info will load your site
- ✅ https://www.dstack.info will also work
- ✅ SSL certificate automatically provisioned
- ✅ HTTP → HTTPS redirect automatic

## Verification

Once added, test:
```bash
curl -I https://dstack.info
# Should return: HTTP/2 200
```

---

**Why can't I automate this?**
Cloudflare's API requires a different auth method for custom domains that wrangler OAuth doesn't support. This is literally a 30-second click operation in the dashboard.

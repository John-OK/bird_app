# Content Security Policy (CSP) Deployment Guide

## Overview

This document explains how Content Security Policy (CSP) headers are configured for HelloBirdie in both development and production environments.

## What is CSP?

Content Security Policy (CSP) is an HTTP security header that helps prevent Cross-Site Scripting (XSS) attacks, clickjacking, and other code injection attacks by controlling which resources the browser is allowed to load.

**How it works:**
1. Server sends CSP header with response
2. Browser reads the policy
3. Browser enforces the policy by blocking unauthorized resources

## Development Configuration

### Django Middleware

CSP headers are added by Django middleware in development:

**File:** `backend/bird_app/middleware.py`

The `CSPMiddleware` class automatically adds CSP headers to all Django responses.

**Current Policy:**
```
default-src 'self';
script-src 'self';
style-src 'self';
img-src 'self' https://tile.openstreetmap.org https://*.tile.thunderforest.com data;
connect-src 'self' https://xeno-canto.org https://www.iplocate.io https://api.ipgeolocation.io https://ip-intelligence.abstractapi.com;
font-src 'self';
frame-src 'none';
object-src 'none';
base-uri 'self';
form-action 'self';
report-uri /csp-violation-report/
```

**Testing in Development:**
```bash
# Start Django server
cd backend
python manage.py runserver

# Check CSP header
curl -I http://localhost:8000/whoami/
```

You should see `Content-Security-Policy` in the response headers.

---

## Production Configuration

### Architecture Decision: Django vs Nginx

**Two options for adding CSP headers in production:**

1. **Django Middleware** (Current Implementation)
   - ✅ Already implemented
   - ✅ Works automatically
   - ✅ Easy to update (just deploy code)
   - ✅ Consistent between dev and prod
   - ⚠️ Slight performance overhead (minimal)

2. **Nginx Headers** (Alternative)
   - ✅ Slightly better performance
   - ❌ Requires nginx config changes
   - ❌ Requires manual nginx reload after changes
   - ❌ Different configuration between dev and prod

**Recommendation:** Use Django middleware (current implementation) for simplicity and consistency.

### Option 1: Django Middleware (Recommended)

**No nginx changes needed!** The Django middleware will add CSP headers to all responses automatically.

**Deployment steps:**
1. Merge CSP changes to `production` branch
2. Deploy to VPS (pull latest code)
3. Restart gunicorn: `sudo systemctl restart hellobirdie.service`
4. Verify headers are present (see verification section below)

**Advantages:**
- Already working
- No server configuration changes
- Easy to update CSP policy (just deploy code)
- Same behavior in dev and prod

---

### Option 2: Nginx Headers (Alternative)

If you prefer to add CSP headers at the nginx level instead of Django, follow these steps.

**⚠️ Note:** If you use this option, you should **disable** the Django middleware to avoid duplicate headers.

#### Step 1: Locate Nginx Configuration

Your nginx config is likely at one of these locations:
```bash
# Main config
/etc/nginx/nginx.conf

# Site-specific config (most likely)
/etc/nginx/sites-available/hellobirdie
/etc/nginx/sites-enabled/hellobirdie

# Or custom location
/etc/nginx/conf.d/hellobirdie.conf
```

#### Step 2: Add CSP Headers to Nginx Config

Edit your nginx site configuration:

```bash
sudo nano /etc/nginx/sites-available/hellobirdie
```

Add the CSP header inside your `server` block:

```nginx
server {
    listen 80;
    server_name hellobirdie.2masterlight.site;

    # CSP Header
    add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' https://tile.openstreetmap.org https://*.tile.thunderforest.com data:; connect-src 'self' https://xeno-canto.org https://www.iplocate.io https://api.ipgeolocation.io https://ip-intelligence.abstractapi.com; font-src 'self'; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'; report-uri /csp-violation-report/" always;

    # Other security headers (if not already present)
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "same-origin" always;
    add_header Cross-Origin-Opener-Policy "same-origin" always;

    # Your existing location blocks
    location / {
        proxy_pass http://127.0.0.1:8900;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static files
    location /static/ {
        alias /home/john/websites/bird_app/backend/static/;
    }

    # Media files (if applicable)
    location /media/ {
        alias /home/john/websites/bird_app/backend/media/;
    }
}
```

**Important Notes:**
- The `always` parameter ensures headers are added even for error responses
- Keep the CSP policy on a single line (no line breaks)
- Adjust paths to match your actual deployment structure

#### Step 3: Test Nginx Configuration

Before reloading, test the configuration for syntax errors:

```bash
sudo nginx -t
```

Expected output:
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

#### Step 4: Reload Nginx

If the test passes, reload nginx:

```bash
sudo systemctl reload nginx
```

Or restart if reload doesn't work:

```bash
sudo systemctl restart nginx
```

#### Step 5: Disable Django Middleware (If Using Nginx Headers)

To avoid duplicate headers, comment out the middleware in Django settings:

**File:** `backend/bird_proj/settings.py`

```python
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    # 'bird_app.middleware.CSPMiddleware',  # ← Comment out if using nginx
]
```

Then restart gunicorn:
```bash
sudo systemctl restart hellobirdie.service
```

---

## Verification

### Check Headers in Production

**Method 1: Using curl**
```bash
curl -I https://hellobirdie.2masterlight.site/whoami/
```

Look for:
```
Content-Security-Policy: default-src 'self'; script-src 'self'; ...
```

**Method 2: Using browser DevTools**
1. Open https://hellobirdie.2masterlight.site
2. Open DevTools (F12)
3. Go to **Network** tab
4. Refresh page
5. Click on any request
6. Check **Response Headers**
7. Look for `Content-Security-Policy`

**Method 3: Online CSP checker**
- Visit: https://csp-evaluator.withgoogle.com/
- Enter your site URL
- Review CSP policy analysis

### Test CSP Enforcement

**Test that CSP is working:**
1. Open browser console on your site
2. Try to execute inline script: `eval('alert("test")')`
3. Should see CSP violation error (blocked)

**Check for violations:**
- Open browser console
- Look for CSP violation warnings
- Violations are also logged to `/csp-violation-report/` endpoint

---

## Monitoring CSP Violations

### Violation Reports

Browsers send violation reports to: `https://hellobirdie.2masterlight.site/csp-violation-report/`

**View logs:**
```bash
# If using systemd journal
sudo journalctl -u hellobirdie.service -f | grep "CSP Violation"

# If using log files
tail -f /path/to/django/logs/django.log | grep "CSP Violation"
```

**Violation log format:**
```
WARNING CSP Violation detected
  document_uri: https://hellobirdie.2masterlight.site/
  violated_directive: script-src 'self'
  blocked_uri: https://evil.com/malicious.js
  source_file: https://hellobirdie.2masterlight.site/static/main.js
  line_number: 42
```

### Common Violations to Investigate

**Legitimate violations (need to whitelist):**
- New external API added but not in CSP policy
- New CDN for fonts/images
- Analytics or monitoring tools

**Security violations (potential attacks):**
- Unknown domains trying to load scripts
- Inline scripts being injected
- Unexpected external connections

---

## Updating CSP Policy

### When to Update

Update the CSP policy when you:
- Add new external APIs or services
- Add new CDNs (fonts, images, scripts)
- Change map tile providers
- Add analytics or monitoring tools

### How to Update

**If using Django middleware (recommended):**

1. Edit `backend/bird_app/middleware.py`
2. Update the `directives` dictionary in `_build_csp_policy()`
3. Commit and push changes
4. Deploy to production
5. Restart gunicorn: `sudo systemctl restart hellobirdie.service`

**If using nginx headers:**

1. SSH to VPS
2. Edit nginx config: `sudo nano /etc/nginx/sites-available/hellobirdie`
3. Update the `add_header Content-Security-Policy` line
4. Test config: `sudo nginx -t`
5. Reload nginx: `sudo systemctl reload nginx`

### Example: Adding a New API

If you add a new API (e.g., `https://api.newservice.com`):

**Django middleware:**
```python
"connect-src": [
    "'self'",
    "https://xeno-canto.org",
    "https://www.iplocate.io",
    "https://api.ipgeolocation.io",
    "https://ip-intelligence.abstractapi.com",
    "https://api.newservice.com",  # ← Add here
],
```

**Nginx config:**
```nginx
add_header Content-Security-Policy "... connect-src 'self' https://xeno-canto.org https://api.newservice.com; ..." always;
```

---

## CSP Directives Reference

### Current Directives Explained

| Directive | Value | Purpose |
|-----------|-------|---------|
| `default-src` | `'self'` | Default policy for all resource types |
| `script-src` | `'self'` | Only allow scripts from same origin |
| `style-src` | `'self'` | Only allow stylesheets from same origin |
| `img-src` | `'self'` + map tiles + `data:` | Allow images from same origin, map providers, and data URIs |
| `connect-src` | `'self'` + APIs | Allow AJAX/fetch to same origin and whitelisted APIs |
| `font-src` | `'self'` | Only allow fonts from same origin |
| `frame-src` | `'none'` | Block all iframes |
| `object-src` | `'none'` | Block Flash, Java, etc. |
| `base-uri` | `'self'` | Restrict `<base>` tag to same origin |
| `form-action` | `'self'` | Forms can only submit to same origin |
| `report-uri` | `/csp-violation-report/` | Where to send violation reports |

### Special Keywords

- `'self'` - Same origin (must be quoted)
- `'none'` - Block everything (must be quoted)
- `'unsafe-inline'` - Allow inline scripts/styles (security risk, avoid if possible)
- `'unsafe-eval'` - Allow eval() (security risk, avoid)
- `data:` - Allow data URIs (no quotes)
- `https:` - Allow any HTTPS resource (too permissive, avoid)

---

## Troubleshooting

### CSP Headers Not Appearing

**Check 1: Verify Django middleware is enabled**
```bash
# In backend/bird_proj/settings.py
grep -n "CSPMiddleware" backend/bird_proj/settings.py
```

**Check 2: Restart gunicorn**
```bash
sudo systemctl restart hellobirdie.service
sudo systemctl status hellobirdie.service
```

**Check 3: Check nginx isn't stripping headers**
```bash
# Test direct to gunicorn (bypass nginx)
curl -I http://127.0.0.1:8900/whoami/
```

### Resources Being Blocked

**Symptom:** Console shows CSP violations, features broken

**Solution:**
1. Check browser console for violation details
2. Identify the blocked resource domain
3. Add domain to appropriate CSP directive
4. Deploy updated policy
5. Test again

**Example violation:**
```
Refused to load image 'https://cdn.example.com/logo.png' because it violates CSP directive "img-src 'self' ..."
```

**Fix:** Add `https://cdn.example.com` to `img-src` directive

### Duplicate CSP Headers

**Symptom:** Multiple `Content-Security-Policy` headers in response

**Cause:** Both Django middleware AND nginx adding headers

**Solution:** Choose one approach:
- **Recommended:** Use Django middleware only (remove nginx `add_header`)
- **Alternative:** Use nginx only (disable Django middleware)

---

## Security Best Practices

### Do's

✅ **Start restrictive, relax as needed**
- Begin with `'self'` only
- Add external domains only when necessary

✅ **Avoid `'unsafe-inline'` and `'unsafe-eval'`**
- These defeat much of CSP's protection
- Use nonces or hashes for inline scripts if needed

✅ **Monitor violation reports**
- Set up alerts for CSP violations
- Investigate unexpected violations

✅ **Test thoroughly before production**
- Test all app features with CSP enabled
- Check console for violations

✅ **Use HTTPS for external resources**
- Always use `https://` URLs in CSP
- Never allow `http://` in production

### Don'ts

❌ **Don't use wildcards broadly**
- `https://*` allows any HTTPS resource (too permissive)
- Use specific domains instead

❌ **Don't disable CSP when issues arise**
- Fix the policy instead
- Use CSP report-only mode for testing if needed

❌ **Don't forget to update CSP when adding features**
- New external APIs need to be whitelisted
- Document CSP requirements in feature PRs

---

## CSP Report-Only Mode (Optional)

For testing CSP changes without breaking the site:

**Django middleware:**
```python
# In middleware.py, change:
response['Content-Security-Policy'] = csp_policy

# To:
response['Content-Security-Policy-Report-Only'] = csp_policy
```

**Nginx:**
```nginx
# Change:
add_header Content-Security-Policy "..." always;

# To:
add_header Content-Security-Policy-Report-Only "..." always;
```

**Effect:**
- Browser logs violations but doesn't block resources
- Useful for testing new policies
- Switch back to `Content-Security-Policy` when ready

---

## Related Documentation

- [Django Security Middleware](https://docs.djangoproject.com/en/4.0/ref/middleware/#module-django.middleware.security)
- [MDN CSP Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [CSP Evaluator](https://csp-evaluator.withgoogle.com/)
- [OWASP CSP Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html)

---

## Summary

**Current Implementation:**
- ✅ CSP headers added via Django middleware
- ✅ Works in both development and production
- ✅ Violation reporting endpoint configured
- ✅ No nginx changes required

**Deployment Checklist:**
1. Merge CSP branch to `production`
2. Pull latest code on VPS
3. Restart gunicorn: `sudo systemctl restart hellobirdie.service`
4. Verify headers: `curl -I https://hellobirdie.2masterlight.site/whoami/`
5. Test site functionality
6. Monitor logs for violations

**Maintenance:**
- Update CSP policy when adding new external services
- Monitor violation reports regularly
- Review and tighten policy periodically

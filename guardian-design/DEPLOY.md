# Deploy Body Boundary to Web (5 Minutes)

## Fastest Path: Vercel (Free)

### Step 1: Test Locally First
1. Open `body-boundary.html` in Chrome
2. Complete setup flow
3. Try logging a day
4. Start a focus session
5. Verify it works

### Step 2: Prepare for Deploy
Create these files in `guardian-design/` folder:

**vercel.json:**
```json
{
  "rewrites": [
    { "source": "/", "destination": "/body-boundary.html" },
    { "source": "/(.*)", "destination": "/$1" }
  ]
}
```

**package.json** (optional, for modern build):
```json
{
  "name": "body-boundary",
  "version": "1.0.0",
  "description": "Focus app for cycle-aware productivity",
  "scripts": {
    "dev": "npx serve .",
    "build": "echo 'Static site, nothing to build'"
  }
}
```

### Step 3: Deploy to Vercel
1. Go to https://vercel.com
2. Sign up with GitHub
3. Click "New Project"
4. Import the `guardian-design` folder
5. Leave all settings default
6. Click "Deploy"
7. Done! You'll get a URL like: `https://body-boundary.vercel.app`

### Step 4: Custom Domain (Optional)
1. Buy domain at Namecheap (e.g., `bodyboundary.app` - $12/year)
2. In Vercel project settings → Domains
3. Add your domain
4. Update DNS records (Vercel gives you instructions)
5. Wait 10 minutes → live!

---

## Alternative: GitHub Pages (Also Free)

1. Create new GitHub repo: `body-boundary`
2. Push `guardian-design` folder contents
3. Go to Settings → Pages
4. Source: main branch, root folder
5. Save
6. Live at: `https://yourusername.github.io/body-boundary`

---

## Alternative: Netlify (Also Free)

1. Drag and drop the `guardian-design` folder to https://app.netlify.com/drop
2. Done! Instant deploy
3. Get a URL like: `https://body-boundary-xyz123.netlify.app`

---

## What Gets Deployed

All files in `guardian-design/`:
- body-boundary.html (main app)
- test-binaural-beats.html (focus session player)
- js/*.js (all scripts)
- All images (cat mascots, etc.)
- primer-manifest.json

No build step needed - it's pure HTML/JS/CSS.

---

## After Deploy: Share for Testing

1. Open deployed URL on your phone
2. Add to home screen (acts like an app)
3. Share link with 5-10 friends
4. Ask them to use for 7 days
5. Collect feedback

---

## PWA Enhancement (Optional - Day 2)

To make it feel more like a native app, add:

**manifest.json:**
```json
{
  "name": "Body Boundary",
  "short_name": "Body Boundary",
  "description": "Focus app for cycle-aware productivity",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#fce7f3",
  "theme_color": "#a591ff",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

Add to `body-boundary.html` `<head>`:
```html
<link rel="manifest" href="/manifest.json">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
```

Users can now "Add to Home Screen" and it behaves like a native app!

---

## Cost: $0

- Vercel: Free tier (unlimited static sites)
- Netlify: Free tier (100GB bandwidth/month)
- GitHub Pages: Free (unlimited for public repos)

Only cost is custom domain if you want one ($12/year).

---

## Timeline

- Test locally: 30 minutes
- Deploy to Vercel: 5 minutes
- Custom domain (optional): 15 minutes

**Total: Under 1 hour to go live.**

# Deployment Guide

This guide walks you through deploying the Manufacturing Cell Status Keeper with:
- **Frontend**: GitHub Pages (static React app)
- **Backend**: Render (Node.js/Express API)
- **Database**: Neon (PostgreSQL)

---

## Prerequisites

- [x] GitHub account
- [x] Neon database with connection string
- [ ] Render account (free at https://render.com)
- [ ] Repository pushed to GitHub

---

## Step 1: Deploy Backend to Render

### 1.1 Create Render Account
1. Go to https://render.com
2. Sign up with GitHub (recommended for easy repo connection)

### 1.2 Create New Web Service
1. Dashboard → **New** → **Web Service**
2. Connect your GitHub repository: `rwaynewhite15/CellStatus`
3. Click **Connect**

### 1.3 Configure Service Settings

**Basic Settings:**
- **Name**: `cellstatus-api` (or your preference)
- **Region**: Choose closest to your users
- **Branch**: `main`
- **Root Directory**: leave blank
- **Runtime**: `Node`
- **Build Command**: 
  ```
  npm install && npm run build
  ```
- **Start Command**: 
  ```
  npm start
  ```

**Advanced Settings:**
- **Plan**: Free (or paid for better performance)
- **Auto-Deploy**: Yes (deploys on git push)

### 1.4 Add Environment Variables

Click **Environment** → **Add Environment Variable** for each:

| Key | Value | Notes |
|-----|-------|-------|
| `DATABASE_URL` | `postgresql://user:pass@host/db` | Copy from Neon dashboard |
| `SESSION_SECRET` | Generate random string | Run: `openssl rand -base64 32` |
| `NODE_ENV` | `production` | Optional |
| `PORT` | (leave unset) | Render sets this automatically |

**Important**: Do NOT set `REPL_ID` (keeps local dev auth mode active)

### 1.5 Deploy
1. Click **Create Web Service**
2. Wait 2-5 minutes for first deploy
3. Copy your service URL: `https://cellstatus-api.onrender.com`

### 1.6 Verify Backend
Visit `https://your-service.onrender.com/api/machines` - should return `[]` or your data.

---

## Step 2: Deploy Frontend to GitHub Pages

### 2.1 Set Backend URL
Create `client/.env.production`:

```env
VITE_API_BASE_URL=https://cellstatus-api.onrender.com
```

Replace with your actual Render URL from Step 1.5.

### 2.2 Build and Deploy

```bash
npm run build
npm run deploy
```

This builds the React app with your backend URL and publishes to `gh-pages` branch.

### 2.3 Enable GitHub Pages
1. Go to GitHub repo → **Settings** → **Pages**
2. Source: **Deploy from a branch**
3. Branch: `gh-pages` / `root`
4. Click **Save**

### 2.4 Access Your App
After 1-2 minutes: `https://rwaynewhite15.github.io/CellStatus/`

---

## Step 3: Initialize Database

Run migrations to create tables:

```bash
npm run db:push
```

Or set up via Render shell:
1. Render Dashboard → Your Service → **Shell**
2. Run: `npm run db:push`

---

## Environment Variables Summary

### Local Development (`.env`)
```env
DATABASE_URL=postgresql://user:pass@host/db
# No REPL_ID = mock auth for local dev
```

### Render (Production Backend)
```env
DATABASE_URL=postgresql://user:pass@host/db
SESSION_SECRET=<random-string>
NODE_ENV=production
```

### GitHub Pages (Production Frontend)
Create `client/.env.production`:
```env
VITE_API_BASE_URL=https://cellstatus-api.onrender.com
```

---

## Updating Your Deployment

### Update Backend
```bash
git add .
git commit -m "Update backend"
git push
```
Render auto-deploys on push to `main`.

### Update Frontend
```bash
# Update backend URL if changed
echo "VITE_API_BASE_URL=https://new-url.onrender.com" > client/.env.production

# Build and deploy
npm run build
npm run deploy
```

---

## Troubleshooting

### Backend not responding
- Check Render logs: Dashboard → Service → **Logs**
- Verify environment variables are set
- Ensure `DATABASE_URL` is correct

### CORS errors
- Verify frontend URL in `server/index.ts` CORS config
- Check browser DevTools console for specific error

### Database connection failed
- Test Neon connection from Render shell: 
  ```bash
  npx drizzle-kit push
  ```
- Ensure Neon project is not paused (free tier pauses after inactivity)

### GitHub Pages 404
- Check repo Settings → Pages is enabled
- Ensure `vite.config.ts` `base` matches repo name: `/CellStatus/`
- Wait 1-2 minutes after deploy

### API calls fail from frontend
- Open DevTools → Network tab
- Verify requests go to correct backend URL
- Check if `client/.env.production` has correct `VITE_API_BASE_URL`

---

## Security Checklist

- [x] CORS restricted to GitHub Pages origin
- [x] Rate limiting enabled (100 req/15min per IP)
- [x] Database URL not exposed in client code
- [x] HTTPS enforced (Render + GitHub Pages both use HTTPS)
- [ ] Update `SESSION_SECRET` regularly
- [ ] Monitor Render logs for suspicious activity
- [ ] Consider adding authentication beyond mock local dev mode

---

## Cost Breakdown

| Service | Plan | Cost |
|---------|------|------|
| Neon | Free | $0/month (512 MB storage, 3 projects) |
| Render | Free | $0/month (750 hrs/month, sleeps after 15min inactivity) |
| GitHub Pages | Free | $0/month (1 GB storage, 100 GB bandwidth) |
| **Total** | | **$0/month** |

**Note**: Render free tier sleeps after 15 minutes of inactivity. First request after sleep takes ~30 seconds to wake up.

---

## Production Upgrade Path

For higher traffic or always-on availability:

1. **Render Paid Plan** ($7/month): Always-on, no sleep, faster CPU
2. **Neon Paid Plan** ($19/month): More storage, better performance
3. **Custom Domain**: Point your domain to both services
4. **CDN**: Cloudflare for better global performance

---

## Support

- Render Docs: https://render.com/docs
- Neon Docs: https://neon.tech/docs
- GitHub Pages: https://docs.github.com/pages

For issues with this app, check repo issues or contact maintainer.

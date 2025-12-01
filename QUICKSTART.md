# Quick Deployment Reference

## 🚀 First-Time Deployment

### 1. Deploy Backend to Render
1. Go to https://render.com → Sign up with GitHub
2. New → Web Service → Connect `rwaynewhite15/CellStatus`
3. Settings:
   - Build: `npm install && npm run build`
   - Start: `npm start`
4. Add Environment Variables:
   - `DATABASE_URL`: (from Neon)
   - `SESSION_SECRET`: (run `openssl rand -base64 32`)
5. Deploy → Copy URL: `https://your-app.onrender.com`

### 2. Update Frontend Config
Edit `client/.env.production`:
```env
VITE_API_BASE_URL=https://your-app.onrender.com
```

### 3. Deploy Frontend to GitHub Pages
```bash
npm run build
npm run deploy
```

### 4. Enable GitHub Pages
- Repo Settings → Pages → Source: `gh-pages` branch
- Wait 2 minutes → Visit: `https://rwaynewhite15.github.io/CellStatus/`

---

## 🔄 Update Deployments

### Backend (auto-deploys on push)
```bash
git add .
git commit -m "Update backend"
git push
```

### Frontend
```bash
npm run build
npm run deploy
```

---

## 🔧 Local Development

```bash
npm run dev
```
Access: `http://localhost:5000`

---

## 📊 Database Migrations

```bash
npm run db:push
```

---

## ⚙️ Environment Files

| File | Purpose | Commit? |
|------|---------|---------|
| `.env` | Local secrets | ❌ No |
| `.env.example` | Template | ✅ Yes |
| `client/.env.development` | Local dev API | ✅ Yes |
| `client/.env.production` | Production API | ✅ Yes |

---

## 🔐 Security Checklist

- [x] CORS restricted to GitHub Pages
- [x] Rate limiting enabled
- [x] Database URL only on backend
- [x] HTTPS enforced everywhere
- [x] `.env` in `.gitignore`

---

## 📝 URLs

- **Frontend**: https://rwaynewhite15.github.io/CellStatus/
- **Backend**: https://your-app.onrender.com
- **Database**: Neon console → https://console.neon.tech

---

## 🆘 Troubleshooting

### CORS error
Check `server/index.ts` allowedOrigins includes your GitHub Pages URL

### API not reachable
Verify `client/.env.production` has correct backend URL

### Render service sleeping
Free tier sleeps after 15min. First request takes ~30s to wake.

### Database connection failed
Check Neon project isn't paused (free tier auto-pauses after inactivity)

---

## 💰 Costs

All free tier:
- Neon: $0/month
- Render: $0/month (sleeps when idle)
- GitHub Pages: $0/month

**Total: $0/month**

---

For detailed instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)

# RazorGrowth AI - Deployment Guide

## Quick Deployment (5 minutes)

### Frontend - Vercel
Your frontend is already connected to Vercel and will auto-deploy from GitHub on every push!

**Live Frontend:** Will be available at `https://buildathon-[id].vercel.app`

### Backend - Render

1. **Create Render Account:**
   - Go to https://render.com
   - Sign up with GitHub

2. **Deploy Backend:**
   - Click "New" → "Web Service"
   - Connect your GitHub repository: `ANJALIAGARWAL-7355/BUILDATHON`
   - Set build command: `pip install -r backend/requirements.txt`
   - Set start command: `cd backend && gunicorn -w 4 -b 0.0.0.0:$PORT app.main:app`
   - Choose Free tier
   - Click "Create Web Service"

3. **Get API URL:**
   - After deployment, you'll get a URL like: `https://buildathon-api-xxx.onrender.com`
   - Copy this URL

4. **Update Frontend API URL:**
   - In Vercel dashboard
   - Go to Project Settings → Environment Variables
   - Add: `VITE_API_URL = https://buildathon-api-xxx.onrender.com/api`
   - Redeploy frontend

---

## Deployment Status

- ✅ Frontend: Ready for Vercel
- ✅ Backend: Ready for Render  
- ✅ GitHub: Fully pushed
- ✅ Database: Using SQLite (auto-initialized)

## Environment Variables (Render)

```
DATABASE_URL=sqlite:///./razorgrowth.db
USE_MOCK_PAYMENTS=true
AI_PROVIDER=mock
```

These are pre-configured in `render.yaml`

---

## Live URLs (Once Deployed)

Frontend: https://buildathon-[id].vercel.app  
Backend API: https://buildathon-api-xxx.onrender.com

Enjoy! 🚀

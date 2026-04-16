# Deployment & Maintenance Guide

## 🎉 Backend is Live! (Render)
For Python/FastAPI backends that handle file uploads and local databases (SQLite), **Render** is the optimal hosting platform. Unlike Vercel, Render provides a persistent server environment rather than shutting down after every request.

### 1. Deploying Backend to Render
1. Go to your [Render Dashboard](https://dashboard.render.com/).
2. Click **New** -> **Web Service**.
3. Connect your GitHub repository (`spinevision-api` or `SPINEVISION-AI`).
4. **Configuration**:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Click **Deploy**.
6. **Save your URL**: Once deployed, copy your URL from the top left (it looks like `https://spinevision-api.onrender.com`). You will need this for the Frontend.

---

## 🚀 Deploying the Frontend (Netlify or Vercel)

The React/Vite Single Page Application (SPA) must be deployed separately and pointed toward the Render backend.

### Option A: Netlify (Recommended)
Netlify handles React SPA routing perfectly via the included `netlify.toml` file.
1. Sign into [Netlify](https://www.netlify.com/).
2. Click **Add new site** -> **Import an existing project** -> GitHub.
3. Select your repository.
4. **Configuration**:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`
5. Click **Add environment variables**:
   - Key: `VITE_API_URL`
   - Value: `YOUR_RENDER_BACKEND_URL` (e.g., `https://spinevision-api.onrender.com`)
6. Click **Deploy**.

### Option B: Vercel
1. Sign into [Vercel](https://vercel.com/dashboard).
2. Click **Add New...** -> **Project**.
3. Import your repository.
4. **Configuration (CRITICAL)**:
   - **Root Directory**: Click "Edit", type `frontend`, and save.
   - **Framework Preset**: Vite
5. Expand **Environment Variables**:
   - Key: `VITE_API_URL`
   - Value: `YOUR_RENDER_BACKEND_URL`
6. Click **Deploy**.

*(Note: The routing logic is protected via the `vercel.json` and `BrowserRouter` setups committed to the codebase).*

---

## 🔒 Important: CORS Policy Connections
If your Frontend browser console shows a **"CORS policy error"**, your Backend does not recognize your Frontend URL!
To fix it:
1. Open `backend/app/main.py`.
2. Locate the `allow_origins=` list.
3. Add your exact frontend URL to the list (e.g., `"https://spinevisionai.netlify.app"` or `"https://your-custom.vercel.app"`).
4. Commit, push, and wait for Render to automatically redeploy the backend!

---

## ⚡ How to Handle Free Tier Limitations

You are using the **Render Free Tier**. Here is what you need to know and how to manage it:

### 1. The "Sleep" Phenomenon (Cold Starts)
- **What happens:** If no one visits your site for 15 minutes, Render puts your backend to "sleep" to save resources.
- **The Consequence:** The *first* person to visit after a break will experience a **delay of 45-60 seconds** while the server "wakes up".
- **Is it broken?** No! It's just waking up.

### 2. How to Prevent "Sleeping" (Keep-Alive Strategy)
To ensure your app is always instant, use a free "uptime monitor" to ping your site every 10 minutes.
1. Sign up for a free account at [UptimeRobot](https://uptimerobot.com/).
2. Create a new **Monitor**.
   - **Monitor Type**: HTTP(s)
   - **URL**: `https://YOUR-APP-NAME.onrender.com/health`
   - **Interval**: 10 minutes
3. Save it. This external service will visit your API every 10 minutes, so it **never goes to sleep**.

### 3. Database Persistence WARNING
- You are using SQLite (`spinevision.db`) and local upload folders (`storage/uploads`).
- **Warning:** On the free tier, when a Render instance restarts (due to inactivity or pushing new code to GitHub), **disk files are reset**.
- **Permanent Fix:** For a real production app, do not rely on local SQLite files. Instead, attach the app to an external PostgreSQL database (Render provides free ones) and use an S3 bucket or Cloudinary for X-ray uploads.

# Deploy (free: Vercel + Render)

Follow this order so the app runs smoothly with no CORS or auth issues.

---

## 1. Backend (Render)

1. Go to [Render](https://render.com) → **New** → **Web Service**.
2. Connect your Git repo. Set **Root Directory** to `backend`.
3. **Build Command**: `pip install -r requirements.txt`
4. **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`  
   (Python version is read from `backend/.python-version` if present; otherwise Render uses its default.)
5. **Environment** (add in dashboard):
   - `ALLOWED_ORIGINS` = `https://your-app.vercel.app`  
     (Replace with your real Vercel URL after step 2. You can add multiple origins separated by commas, e.g. for preview deployments.)
6. Optional: Under **Settings** → **Health Check Path** set `/api/v1/health` so Render pings your app correctly.
7. Deploy. Note your backend URL, e.g. `https://excel-transform-api.onrender.com`.

---

## 2. Frontend (Vercel)

1. Go to [Vercel](https://vercel.com) → **Add New** → **Project** → import your repo.
2. **Root Directory**: `frontend`
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`
5. **Environment variables** (add all; no trailing slash on `VITE_API_URL`):

   | Name | Value |
   |------|--------|
   | `VITE_API_URL` | `https://YOUR-BACKEND-URL.onrender.com/api/v1` |
   | `VITE_SUPABASE_URL` | Your Supabase project URL |
   | `VITE_SUPABASE_ANON_KEY` | Your Supabase anon/public key |

6. Deploy. Note your frontend URL, e.g. `https://your-app.vercel.app`.

---

## 3. CORS (Render)

1. In Render → your backend service → **Environment**.
2. Set `ALLOWED_ORIGINS` to your **exact** Vercel URL (e.g. `https://your-app.vercel.app`).
3. If you use Vercel preview deployments, add them too, e.g.  
   `https://your-app.vercel.app,https://your-app-*.vercel.app` (if Render supports the wildcard) or list each preview URL.
4. Save; Render will redeploy if needed.

---

## 4. Supabase (auth redirects)

1. In [Supabase](https://app.supabase.com) → your project → **Authentication** → **URL Configuration**.
2. Under **Redirect URLs**, add:
   - `https://your-app.vercel.app/**`
   - (Optional) any preview URLs, e.g. `https://*.vercel.app/**`
3. Set **Site URL** to `https://your-app.vercel.app` if you want auth to redirect back to production.

---

## 5. Check it works

1. Open your Vercel URL. The app should load (landing page).
2. **Transform flow**: Upload a file → Preview → Pipeline → Results → Download. If any step fails, check the browser console and Network tab (e.g. CORS or 404 to the API).
3. **Auth** (if using Supabase): Sign in / Sign up. If redirect fails, confirm Redirect URLs and Site URL in Supabase.
4. **Backend cold start**: On Render free tier the service sleeps after ~15 min; the first request can take 30–60 s. Later requests are fast.

---

## Local dev (unchanged)

- **Frontend**: No `VITE_API_URL` in `.env` → uses `/api/v1` with Vite proxy to `localhost:8000`.
- **Backend**: No `ALLOWED_ORIGINS` → allows `http://localhost:5173` and `http://localhost:3000`.

See [README](README.md) for running the app locally.

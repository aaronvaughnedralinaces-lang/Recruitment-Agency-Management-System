# Deployment & Setup Guide

## Overview

This is a full-stack MERN app split into:
- **Frontend**: Vite + React + TypeScript (port 5173 dev, `dist/` in production)
- **Backend**: Express.js + MySQL (port 5000)

The app has been configured with environment-aware API routing so it works seamlessly in local development and on Railway production.

## Local Development Setup

### 1. Install Dependencies

```bash
# Install frontend dependencies (in project root)
npm install

# Install backend dependencies
npm install --prefix backend
```

### 2. Configure Local Environment

Create a `.env.local` file in the project root (already exists):
```
VITE_API_URL=http://localhost:5000/api
```

This tells your local Vite dev server where to find the backend API.

### 3. Set Backend Database Configuration

Edit `backend/.env` with your local MySQL credentials:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=rams_db
JWT_SECRET=local_development_secret_key
PORT=5000
NODE_ENV=development
```

Make sure MySQL is running and the `rams_db` database exists.

### 4. Run Locally

In two separate terminals:

**Terminal 1 - Frontend (Vite dev server on port 5173):**
```bash
npm run dev
```

**Terminal 2 - Backend (Express on port 5000):**
```bash
npm run dev --prefix backend
```

Then open: http://localhost:5173

The frontend will automatically proxy `/api` calls to `http://localhost:5000/api` via Vite's dev server proxy.

### 5. Test the Setup

- Visit http://localhost:5173
- Try the login/register flow
- Check browser DevTools Network tab - API calls should go to localhost:5000

---

## Production Deployment (Railway)

### Critical Issue: Database Configuration Required

The app is currently failing because **Railway environment variables are not configured**.

### Error Symptom
```
getJobs error: ECONNREFUSED undefined
```

This means the backend cannot connect to any database.

---

## Production Deployment (Railway)

### Step 1: Connect Your GitHub Repository to Railway

1. Go to [Railway.app](https://railway.app)
2. Create a new project or select your existing "Recruitment-Agency-Management-System" project
3. Connect your GitHub repository
4. Railway will auto-detect the Node.js project and create a service

### Step 2: Configure Backend Environment Variables on Railway

The **frontend** is built and served statically, so it bakes in the API URL at build time. The backend needs runtime environment variables.

1. Go to Railway Dashboard → Your Project → Settings
2. Click **Variables** tab
3. Add these environment variables:

| Variable | Value | Notes |
|----------|-------|-------|
| `DB_HOST` | `mysql-prod.railway.internal` or your MySQL hostname | Check Railway MySQL service for this value |
| `DB_USER` | `root` | Your MySQL username |
| `DB_PASSWORD` | Your secure MySQL password | Use a strong password |
| `DB_NAME` | `rams_db` | Database name |
| `JWT_SECRET` | Any random secret string (e.g., `super_secret_key_12345`) | Generate a secure random string |
| `NODE_ENV` | `production` | Optional, helps with error messages |
| `PORT` | `5000` | Internal port (Railway handles external routing) |

### Step 3: Build & Deploy

1. Railway will automatically build and deploy when you push to main
2. Or manually trigger: Dashboard → Deployments → Deploy button
3. Wait for build to complete (watch the Logs tab)

### Step 4: Configure Frontend API URL for Production

When you deploy to Railway, your frontend needs to know the backend URL.

**Update `.env.production`** (create if it doesn't exist):
```
VITE_API_URL=https://your-app.up.railway.app/api
```

Replace `your-app` with your actual Railway app URL.

Then rebuild and redeploy:
```bash
npm run build
git add .
git commit -m "Set production API URL"
git push
```

### Step 5: Verify the Deployment

Test the health endpoint:
```
GET https://your-app.up.railway.app/api/health
```

**Expected response:**
```json
{
  "status": "ok",
  "message": "Database connected"
}
```

If you see database connection errors, check:
1. Railway Dashboard → Logs (find the exact error)
2. Verify DB_HOST, DB_USER, DB_PASSWORD are correct
3. Ensure MySQL service is running on Railway

---

## How It All Works Together

### Local Development Flow
1. Run `npm run dev` → Vite dev server on port 5173
2. Run `npm run dev --prefix backend` → Express API on port 5000
3. Frontend loads VITE_API_URL from `.env.local` → `http://localhost:5000/api`
4. Vite dev server proxy forwards `/api` → backend on port 5000

### Production Flow
1. Build frontend: `npm run build` → Creates `dist/` folder with production-ready SPA
2. Backend serves the SPA statically from `/dist`
3. Frontend has VITE_API_URL baked in at build time → production Railway backend URL
4. All requests to `/api` go to your Railway backend (same domain as frontend)

---

## Troubleshooting

### Issue: Login returns 500 Internal Server Error
- ✅ Check backend is running: `curl http://localhost:5000/api/health`
- ✅ Verify MySQL is running locally
- ✅ Check backend `.env` has correct DB credentials
- ✅ In production, check Railway Logs tab for exact error

### Issue: API calls fail with 404 or CORS errors
- ✅ Verify VITE_API_URL in frontend `.env`
- ✅ Verify backend is responding at that URL
- ✅ Check browser DevTools Network tab for actual request URL

### Issue: Database connection error
- ✅ Verify DB_HOST, DB_USER, DB_PASSWORD are correct
- ✅ Ensure MySQL is running and accessible
- ✅ In production (Railway), ensure MySQL service is linked to your app

### Issue: Database tables don't exist
- ✅ Run migration scripts on your MySQL database
- ✅ Import initial schema if you have a backup

### View Production Logs
1. Railway Dashboard → Deployments
2. Click the latest deployment
3. Click "Logs" tab
4. Look for `[DB Config]` or error messages

### Test Database Connection
```bash
# Local
curl http://localhost:5000/api/health

# Production (Railway)
curl https://your-app.up.railway.app/api/health

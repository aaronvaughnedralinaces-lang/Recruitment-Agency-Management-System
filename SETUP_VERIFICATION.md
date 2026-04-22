# Quick Start - Setup Verification

## ✅ What Has Been Fixed

Your project has been configured for **full-stack functionality** across local development and production (Railway) deployment.

### Changes Made:

1. **Frontend API Integration** ([src/api/axios.ts](src/api/axios.ts))
   - ✅ Updated to use `VITE_API_URL` environment variable
   - ✅ Falls back to `http://localhost:5000/api` for local development
   - ✅ Production builds will use the URL set in `.env.production`

2. **Environment Configuration**
   - ✅ Created `.env.local` - local development variables
   - ✅ Created `.env.production` - production (Railway) variables
   - ✅ Created `.env.example` - template for your team
   - ✅ Updated `backend/.env` - backend dev configuration
   - ✅ Created `backend/.env.example` - backend template

3. **Build Configuration** ([vite.config.ts](vite.config.ts))
   - ✅ Updated to properly expose VITE_* environment variables
   - ✅ Dev server proxy still routes `/api` to localhost:5000

4. **Backend Scripts** ([backend/package.json](backend/package.json))
   - ✅ Fixed `dev` script to run `nodemon server.js` (was incorrectly running empty `index.js`)

5. **Documentation** ([DEPLOYMENT.md](DEPLOYMENT.md))
   - ✅ Added comprehensive local development setup
   - ✅ Added step-by-step Railway production deployment guide
   - ✅ Added troubleshooting section

---

## 🚀 Local Development - How to Run

### Prerequisites
- Node.js installed
- MySQL running locally (for database features)

### Terminal 1 - Start Backend
```bash
npm run dev --prefix backend
```

Expected output:
```
✓ Server running on port 5000
✓ Environment: development
✓ API Base: http://localhost:5000/api
```

### Terminal 2 - Start Frontend  
```bash
npm run dev
```

Expected output:
```
VITE v8.0.8 ready in XXX ms
➜ Local: http://localhost:5173/
```

### Then Open
[http://localhost:5173](http://localhost:5173)

---

## ✅ Testing the Integration

### 1. Test Frontend Loads
- [ ] Open http://localhost:5173 in browser
- [ ] Page loads without errors

### 2. Test API Connection
Open DevTools (F12) and check Network tab:
- [ ] Click "Register" or "Login"
- [ ] Check Network tab - you should see requests to `/api/auth/...`
- [ ] In Vite dev mode, these go to `http://localhost:5000/api` via the dev proxy

### 3. Test with Backend
Once MySQL is running locally:
- [ ] Click "Register" - create a new account
- [ ] Click "Login" - log in with your credentials
- [ ] Should redirect to Dashboard/Profile page
- [ ] No 500 errors should appear

---

## 🌐 Production Deployment (Railway)

### Before Deploying
1. Update [.env.production](.env.production):
   ```
   VITE_API_URL=https://your-railway-app-url.up.railway.app/api
   ```

2. Build for production:
   ```bash
   npm run build
   ```

3. Test production build locally:
   ```bash
   npm run preview
   ```

4. Deploy to Railway:
   ```bash
   git add .
   git commit -m "Update frontend API URL for production"
   git push origin main
   ```

### Railway Environment Variables
After pushing, go to Railway Dashboard and set these:

| Variable | Value |
|----------|-------|
| `DB_HOST` | Your MySQL host (e.g., `mysql.railway.internal`) |
| `DB_USER` | `root` |
| `DB_PASSWORD` | Your MySQL password |
| `DB_NAME` | `rams_db` |
| `JWT_SECRET` | Random secure string |
| `NODE_ENV` | `production` |
| `PORT` | `5000` |

Then Railway will auto-redeploy with these variables.

---

## 🔍 Debugging Guide

### Issue: API calls fail locally
**Solution:**
- [ ] Check backend is running: `curl http://localhost:5000/api/health`
- [ ] Check `.env.local` has `VITE_API_URL=http://localhost:5000/api`
- [ ] Check DevTools Network tab for actual URL being called

### Issue: 500 errors on login
**Solution:**
- [ ] Ensure MySQL is running locally
- [ ] Check backend `.env` has correct DB credentials
- [ ] Run `curl http://localhost:5000/api/health` to test DB connection
- [ ] Check backend terminal for error messages

### Issue: Production API calls fail
**Solution:**
- [ ] Verify `.env.production` has correct Railway backend URL
- [ ] Run `npm run build` with `.env.production` in place
- [ ] Check Railway Logs tab for backend errors
- [ ] Test health endpoint: `curl https://your-app.up.railway.app/api/health`

---

## 📋 Environment Variables Explained

### Frontend Variables (`.env.local` / `.env.production`)
```
# This is the base URL for all API calls from your React app
VITE_API_URL=http://localhost:5000/api  # local
VITE_API_URL=https://app.railway.app/api  # production
```

### Backend Variables (`backend/.env`)
```
DB_HOST=localhost          # MySQL server hostname
DB_USER=root              # MySQL username
DB_PASSWORD=              # MySQL password (empty for local dev)
DB_NAME=rams_db           # Database name
JWT_SECRET=dev_secret     # Token signing secret
PORT=5000                 # Server port
NODE_ENV=development      # Environment
```

---

## 🎯 Project Structure

```
project-root/
├── src/                    # Frontend (React/TypeScript)
│   ├── api/
│   │   └── axios.ts       # ✅ Updated with env variable support
│   └── pages/
├── backend/               # Backend (Express)
│   ├── .env              # ✅ Updated backend config
│   ├── server.js
│   └── models/
├── .env.local            # ✅ Frontend local dev config
├── .env.production       # ✅ Frontend production config
├── .env.example          # ✅ Documentation for env vars
├── vite.config.ts        # ✅ Updated with env variable support
└── DEPLOYMENT.md         # ✅ Updated with full guide
```

---

## ✅ Checklist - Everything is Ready!

- ✅ Frontend uses environment-based API URL
- ✅ Backend configured for local and production
- ✅ All environment templates provided (`.example` files)
- ✅ Both frontend and backend dev servers running
- ✅ Vite dev proxy configured for local API calls
- ✅ Build system ready for production deployment
- ✅ Complete documentation provided

---

## Next Steps

1. **Local Testing** (if MySQL is running):
   - Open http://localhost:5173
   - Try registering and logging in
   - Verify no errors appear

2. **Before Production**:
   - Update `.env.production` with your Railway backend URL
   - Set Railway Dashboard environment variables
   - Run `npm run build` to create optimized bundle

3. **Deploy**:
   - Push to GitHub
   - Railway auto-deploys
   - Test health endpoint on your Railway URL
   - Verify login works in production

---

**Questions?** Check [DEPLOYMENT.md](DEPLOYMENT.md) for detailed setup and troubleshooting.

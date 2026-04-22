# Railway Dashboard - Required Backend Configuration

## 🚀 What Just Happened
- ✅ Frontend code pushed to GitHub with `.env.production`
- ✅ Railway is now rebuilding the frontend
- ⏳ Frontend will automatically use correct API URL after rebuild (5-10 min)

## ⚙️ CRITICAL: Configure Backend Environment Variables

The frontend will be fixed, but the **backend still needs database configuration**.

### Step-by-Step:

1. **Go to Railway Dashboard**
   - https://railway.app/project/YOUR_PROJECT_ID
   - Select your "Recruitment Agency Management System" project

2. **Find Your Services**
   - Should see: `Recruitment Agency Management System` (main service)
   - Should see: `mysql` (database service) if Railway MySQL is provisioned

3. **Click on Main Service** (the Express backend)
   - Click on the service name

4. **Go to Variables Tab**
   - Look for the "Variables" button/section
   - You'll see current environment variables

5. **Add/Update These Variables:**

   | Name | Value | Notes |
   |------|-------|-------|
   | `DB_HOST` | `mysql.railway.internal` | Check your MySQL service connection string |
   | `DB_USER` | `root` | Default MySQL user |
   | `DB_PASSWORD` | Your MySQL password | From Railway MySQL service |
   | `DB_NAME` | `rams_db` | Database name |
   | `JWT_SECRET` | Generate random string (e.g., `abc123xyz789`) | Keep this secret and secure |
   | `NODE_ENV` | `production` | Set environment |
   | `PORT` | `5000` | Internal port |

   **How to find MySQL connection details:**
   - Go back to project
   - Click on the `mysql` service (if it exists)
   - Look for "CONNECTION" or "DATABASE" section
   - Copy: host, user, password, database name

6. **After Adding Variables**
   - Railway will automatically redeploy the backend
   - Wait for deployment to complete (check "Deployments" tab)

7. **Test the Health Endpoint**
   - Run in terminal:
   ```bash
   curl https://recruitment-agency-management-system-production.up.railway.app/api/health
   ```
   - Should return: `{"status":"ok","message":"Database connected"}`
   - If database still fails, check MySQL service is running and variables are correct

---

## ✅ Timeline

| Time | Action | Status |
|------|--------|--------|
| Now | Frontend code pushed + env files committed | ✅ Done |
| Now | Railway detects git push | ⏳ In progress |
| 5-10 min | Railway rebuilds frontend | ⏳ Pending |
| Whenever | You configure backend variables | ⏳ Waiting for you |
| After backend config | Railway redeploys backend | ⏳ Pending |

---

## 🧪 After Configuration - Test the Flow

1. **Test Frontend**
   - Open: https://recruitment-agency-management-system-production.up.railway.app
   - Should load without errors

2. **Test API Health**
   ```bash
   curl https://recruitment-agency-management-system-production.up.railway.app/api/health
   ```
   - Should show: `{"status":"ok","message":"Database connected"}`

3. **Test Login**
   - Visit production site
   - Try to login/register
   - Should work without 404 or 500 errors

---

## 📋 Common Issues

### "Still getting 404 on /auth/login"
- ✅ Wait 10 more minutes for Railway rebuild to complete
- ✅ Hard refresh browser (Ctrl+Shift+R)
- ✅ Check Railway Deployments - should show recent deployment

### "API health returns database error"
- ✅ Verify DB_HOST, DB_USER, DB_PASSWORD are correct
- ✅ Ensure MySQL service is running on Railway
- ✅ Check database `rams_db` exists (may need to create it)

### "Can't find MySQL connection details"
- ✅ In Railway, go to MySQL service
- ✅ Look for "References" or "Connection" string
- ✅ Parse: `mysql://user:password@host:port/database`

---

## 📞 Need Help?

1. **Check Railway Logs** - Always the first place to look:
   - Dashboard → Your project → Deployments tab
   - Click latest deployment
   - Click "Logs" → See exact error messages

2. **See DEPLOYMENT.md** in repo for full guide

3. **Common Command to Test:**
   ```bash
   # Test if backend is accessible
   curl https://recruitment-agency-management-system-production.up.railway.app/api/health
   
   # Test if you're getting to the right endpoint
   curl -X POST https://recruitment-agency-management-system-production.up.railway.app/api/auth/login -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"test123"}'
   ```

---

**Current Status:** Frontend deployment in progress ⏳ → Backend config needed ⚙️ → Full production system ready ✅

# Deployment Guide - Railway

## Critical Issue: Database Configuration Required

The app is currently failing because **Railway environment variables are not configured**.

### Error Symptom
```
getJobs error: ECONNREFUSED undefined
```

This means the backend cannot connect to any database.

---

## Quick Fix: Configure Railway Environment Variables

### 1. Get Your Database Credentials
You need:
- **DB_HOST** - MySQL server hostname (e.g., `mysql-prod.railway.app`)
- **DB_USER** - MySQL username (usually `root`)
- **DB_PASSWORD** - MySQL password
- **JWT_SECRET** - Any random secret string for token signing

### 2. Set Variables on Railway Dashboard

1. Go to [Railway Dashboard](https://railway.app)
2. Select your **Recruitment Agency Management System** project
3. Click **Settings** (gear icon)
4. Find **Variables** section
5. Add these key-value pairs:

| Variable | Example Value | Notes |
|----------|---------------|-------|
| `DB_HOST` | `mysql.railway.internal` | Or your actual MySQL host |
| `DB_USER` | `root` | Your MySQL username |
| `DB_PASSWORD` | `your_secure_password` | Your MySQL password |
| `JWT_SECRET` | `super_secret_key_12345` | Make this random and secure |
| `NODE_ENV` | `production` | Optional, helps with error messages |

### 3. Redeploy

After adding variables:
1. Railway will auto-redeploy, OR
2. Manually trigger: Go to Deployments → Click "Deploy" button

### 4. Verify

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

**If still failing:**
Check Railway logs → Deployments → Logs tab for exact error message.

---

## Common Issues

### Issue: "Database connection error"
- ✓ Verify DB_HOST, DB_USER, DB_PASSWORD are correct
- ✓ Ensure MySQL is running on Railway
- ✓ Check database exists (`rams_db`)

### Issue: "Unknown database 'rams_db'"
- ✓ Create the database on your MySQL instance
- ✓ Or change `DB_NAME` variable to match your actual database name

### Issue: Database tables don't exist
- ✓ Run migration scripts on your MySQL database
- ✓ Import initial schema if you have a backup

---

## Local Development

For local testing, your `.env` file should have:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=rams_db
JWT_SECRET=local_dev_secret
PORT=5000
```

Run locally:
```bash
npm install --prefix backend
npm run dev --prefix backend
```

---

## Troubleshooting

### View Recent Logs
1. Railway Dashboard → Deployments
2. Click the latest deployment
3. Click "Logs" tab
4. Look for `[DB Config]` or error messages

### Test Database Connection
```bash
curl https://your-app.up.railway.app/api/health
```

### Check Current Environment
The server logs will show:
```
[DB Config] { host: 'xxx', user: 'xxx', database: 'xxx', port: 3306, hasPassword: true }
```

If `host` shows `localhost`, the variables aren't set on Railway.

---

## Next Steps

1. **Set Railway environment variables** (see step 2 above)
2. **Redeploy** (auto or manual)
3. **Test** the `/api/health` endpoint
4. **Verify** `/api/jobs` now returns job listings instead of 500 error

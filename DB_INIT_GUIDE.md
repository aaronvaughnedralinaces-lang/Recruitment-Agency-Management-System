# Fix: Database Tables Missing on Railway

## Problem
Your backend is returning 500 errors because the MySQL database on Railway **doesn't have the required tables** (users, companies, jobs, etc.).

## Solution: Run Database Initialization

You have two options to create the tables:

---

## Option 1: Run via Railway CLI (Recommended)

### Step 1: Get Railway CLI
If you don't have it, install from: https://docs.railway.app/cli/quick-start

### Step 2: Connect to Railway
```bash
railway link
```
(Select your project when prompted)

### Step 3: Run the Initialization Script
```bash
railway run npm run init-db --prefix backend
```

This command will:
- Connect to your Railway MySQL database
- Create all required tables (users, companies, jobs, education, career, documents, etc.)
- Show success messages for each table created

### Expected Output:
```
🔄 Starting database initialization...

✓ Created users table
✓ Created companies table
✓ Created jobs table
✓ Created tags table
✓ Created job_tags table
✓ Created education table
✓ Created career table
✓ Created documents table

✅ Database initialization complete!
```

---

## Option 2: Run Manually in Railway Shell

### Step 1: Go to Railway Dashboard
- https://railway.app
- Select your "Recruitment Agency Management System" project

### Step 2: Open Service Shell
- Click your main service (Express backend)
- Click "Shell" tab at the top
- You'll get a terminal connected to your Railway service

### Step 3: Run the Script
In the Railway shell terminal, type:
```bash
npm run init-db --prefix backend
```

---

## Option 3: Use SQL File Directly

If you prefer to run SQL directly:

### Step 1: Copy Schema
Get the full SQL from [backend/schema.sql](../backend/schema.sql)

### Step 2: Connect to Railway MySQL
Use any MySQL client (MySQL Workbench, DataGrip, etc.):
- **Host**: From Railway MySQL service connection string
- **User**: `root`
- **Password**: Your MySQL password
- **Database**: `rams_db`

### Step 3: Run All SQL
Paste the entire contents of `schema.sql` and execute.

---

## After Initialization

### Verify Success
Run this command to confirm database is working:
```bash
curl https://recruitment-agency-management-system-production.up.railway.app/api/health
```

Should return:
```json
{"status":"ok","message":"Database connected"}
```

### Test Login
1. Open https://recruitment-agency-management-system-production.up.railway.app
2. Try registering a new account
3. Should work without 500 errors

---

## If Still Getting Errors

### Check Railway Logs
1. Dashboard → Deployments tab
2. Click latest deployment
3. Click "Logs" tab
4. Look for error messages

### Common Issues

**"Can't connect to MySQL server"**
- Verify DB_HOST, DB_USER, DB_PASSWORD are correct on Railway
- Ensure MySQL service is running

**"Access denied for user 'root'"**
- Check DB_PASSWORD is correct
- May need to reset MySQL root password on Railway

**"Unknown database 'rams_db'"**
- The database doesn't exist
- Create it manually or check DB_NAME environment variable

---

## Quick Summary

```bash
# Local test (optional):
npm run init-db --prefix backend

# Production (Railway):
railway run npm run init-db --prefix backend
```

After running initialization, your login should work! 🚀

# 🔧 SUPABASE CLI SETUP GUIDE
## Fixing Production Connection Issues

The issue is that your Supabase connection is using placeholder values instead of real credentials. Here's how to fix it:

## 🎯 **IMMEDIATE FIXES NEEDED:**

### 1. **Get Your Real Supabase Credentials**

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard
2. **Select Your Project**: jb-alwikobra-ecommerce (or similar)
3. **Go to Settings** → **API**
4. **Copy the following values**:
   - **Project URL**: `https://YOUR_PROJECT_ID.supabase.co`
   - **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **Service Role Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 2. **Update .env File with Real Values**

Replace the placeholder values in `.env` with your actual credentials:

```bash
# Frontend (Public) - REPLACE WITH REAL VALUES
REACT_APP_SUPABASE_URL=https://YOUR_ACTUAL_PROJECT_ID.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.YOUR_ACTUAL_ANON_KEY

# Backend (Private) - REPLACE WITH REAL VALUES  
SUPABASE_URL=https://YOUR_ACTUAL_PROJECT_ID.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.YOUR_ACTUAL_SERVICE_KEY
```

### 3. **Update Vercel Environment Variables**

The same placeholder values are probably in Vercel. Update them:

1. **Go to**: https://vercel.com/digitalindo/jbalwikobra-com-digid
2. **Settings** → **Environment Variables**
3. **Update these variables with REAL values**:
   ```
   REACT_APP_SUPABASE_URL = https://YOUR_ACTUAL_PROJECT_ID.supabase.co
   REACT_APP_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.YOUR_ACTUAL_ANON_KEY
   SUPABASE_URL = https://YOUR_ACTUAL_PROJECT_ID.supabase.co
   SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.YOUR_ACTUAL_SERVICE_KEY
   ```

---

## 🔧 **SUPABASE CLI COMMANDS TO HELP:**

### **Link to Your Existing Project:**
```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_ID
```

### **Check Connection Status:**
```bash
npx supabase status
```

### **Get Database URL:**
```bash
npx supabase status | findstr "API URL"
```

### **Generate Types (Optional):**
```bash
npx supabase gen types typescript --local > types/supabase.ts
```

---

## 🔍 **DEBUGGING STEPS:**

### **Step 1: Test Local Connection**
After updating `.env` with real values:
```bash
node test-supabase-connection.js
```

### **Step 2: Check Database Tables**
```bash
npx supabase db dump --schema public
```

### **Step 3: Verify Project Info**
```bash
npx supabase projects list
```

---

## 🚨 **COMMON ISSUES & SOLUTIONS:**

### **Issue 1: "Project not found"**
- **Cause**: Wrong project ID or not linked
- **Solution**: Run `npx supabase link` with correct project ID

### **Issue 2: "Invalid API key"**
- **Cause**: Using placeholder keys or wrong keys
- **Solution**: Copy fresh keys from Supabase dashboard

### **Issue 3: "Permission denied"**
- **Cause**: RLS policies blocking access
- **Solution**: Check RLS policies in Supabase dashboard

### **Issue 4: "Table not found"**
- **Cause**: Database not set up or missing migrations
- **Solution**: Run migrations or create tables manually

---

## 📋 **CURRENT STATUS:**

✅ **Supabase CLI**: Installed and ready  
❌ **Connection**: Failing due to placeholder credentials  
❌ **Database**: Cannot access with current credentials  
⏳ **Tables**: Unknown status until connection is fixed  

---

## ⚡ **NEXT STEPS:**

1. **GET REAL CREDENTIALS**: Copy from Supabase dashboard
2. **UPDATE .env**: Replace placeholder values
3. **UPDATE VERCEL**: Replace placeholder values in Vercel dashboard
4. **TEST CONNECTION**: Run `node test-supabase-connection.js`
5. **REDEPLOY**: After verifying connection works
6. **VERIFY PRODUCTION**: Check if data loads properly

---

## 🎯 **CRITICAL ACTION:**

**The reason you're seeing only mock data is because the app can't connect to the real database due to placeholder credentials. Once you update the credentials with real values, the connection will work.**

---

Would you like me to help you with any specific step, such as setting up the database schema or checking specific table structures once you have the credentials updated?

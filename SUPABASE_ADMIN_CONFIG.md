# Supabase Admin Configuration Guide

## Overview

This document explains how to properly configure Supabase environment variables to fix the "[SupabaseAdmin] Missing/invalid service config" error.

## Problem

The admin panel shows empty user and order tables because the Supabase admin client cannot initialize due to missing or improperly configured environment variables.

## Environment Variables Required

### For Local Development

Create a `.env.local` file (never commit this to git) with:

```bash
# Frontend variables (safe to use in browser)
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_anon_key_here

# Backend/API variables (NEVER expose to frontend)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### For Vercel Deployment

Add these environment variables in your Vercel project settings:

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add the following variables:

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `REACT_APP_SUPABASE_URL` | Your Supabase project URL | Production, Preview, Development |
| `REACT_APP_SUPABASE_ANON_KEY` | Your Supabase anon key | Production, Preview, Development |
| `SUPABASE_URL` | Your Supabase project URL | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key | Production, Preview, Development |

## Security Best Practices

### ✅ DO:

- Store service role keys in environment variables
- Use service role keys only in backend/API routes
- Set service role keys in Vercel environment variables
- Use anon keys in frontend code with proper RLS policies

### ❌ DON'T:

- Never add service role keys to `REACT_APP_*` variables
- Never commit `.env.local` or real keys to version control
- Never expose service role keys to the browser
- Never use placeholder values like "YOUR_KEY_HERE"

## How to Get Your Keys

### 1. Supabase URL

1. Go to your Supabase project dashboard
2. Navigate to Settings → API
3. Copy the "Project URL"
4. Example: `https://abcdefghijklm.supabase.co`

### 2. Anon Key (Public)

1. In the same API settings page
2. Copy the "anon public" key
3. This key is safe to use in frontend code

### 3. Service Role Key (Secret)

1. In the same API settings page
2. Copy the "service_role" key
3. ⚠️ **NEVER** expose this key to the browser or commit it to git
4. Only use this in backend/API contexts

## Verifying Configuration

### Check if Admin Client is Initialized

1. Open browser console in development
2. You should see either:
   - `[SupabaseAdmin] Initialized with service role key` (backend/API)
   - `[OptimizedQueries] Supabase admin client initialized` (API routes)

3. If you see errors:
   - `Missing service config` → Environment variables not set
   - `Environment variables contain placeholder values` → Using placeholder values
   - `SECURITY WARNING: Service role key detected in browser context` → Service key exposed to frontend

### Test Admin Panel

1. Log in as an admin user (user with `is_admin = true` in database)
2. Navigate to the admin dashboard
3. Check if:
   - User count is displayed correctly
   - Order count is displayed correctly
   - Order list shows actual orders
   - User list shows actual users

## Troubleshooting

### Problem: "Missing/invalid service config"

**Solution:**
- Verify environment variables are set in Vercel
- Check for typos in variable names
- Ensure values don't start with "YOUR_", "your_", or other placeholders
- Redeploy after adding environment variables

### Problem: "User table and order table not showing"

**Solutions:**

1. **Check Environment Variables**: Ensure `SUPABASE_SERVICE_ROLE_KEY` is set in Vercel

2. **Check RLS Policies**: Run the migration `supabase/migrations/20251228_complete_admin_panel_fix.sql` in your Supabase SQL editor

3. **Check Admin User**: Ensure your user has `is_admin = true`:
   ```sql
   UPDATE public.users 
   SET is_admin = true 
   WHERE email = 'your-admin-email@example.com';
   ```

4. **Check API Logs**: Look at Vercel function logs to see if API routes are working

### Problem: Tables show but are empty

**Solution:**
- This is likely an RLS policy issue
- Apply the complete admin panel fix migration
- Ensure user is logged in as admin
- Check browser console for errors

## Database Migrations

Apply these migrations in order in your Supabase SQL editor:

1. `20251228_fix_users_rls_service_role.sql` - Adds service_role policy to users
2. `20251228_add_service_role_policies_orders.sql` - Adds service_role policy to orders
3. `20251228_add_service_role_policies_admin_tables.sql` - Adds policies to other tables
4. `20251228_add_authenticated_admin_policies.sql` - Adds authenticated admin policies
5. `20251228_complete_admin_panel_fix.sql` - **Recommended: Use this consolidated migration**

## Additional Resources

- [Environment Variables Documentation](.env.template)
- [Security Best Practices](./SECRET_MANAGEMENT_GUIDELINES.md)
- [Admin Panel Fix Guide](./ADMIN_PANEL_FIX_GUIDE.md)
- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

## Support

If you continue to have issues after following this guide:

1. Check Vercel function logs for detailed error messages
2. Review browser console for client-side errors
3. Verify Supabase project is active and accessible
4. Ensure you're logged in as an admin user

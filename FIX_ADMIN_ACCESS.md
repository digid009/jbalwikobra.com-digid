# Fix for Admin Panel Access Issue

## Problem
User logging in with `admin@jbalwikobra.com` is not recognized as an admin. The user appears as anonymous/guest instead of admin, preventing access to the admin panel.

## Root Cause
The `is_admin` column in the `users` table is not set to `true` for the admin@jbalwikobra.com user. Even though the authentication flow is working correctly and mapping the field properly, if the database value is `false` or `NULL`, the user will not have admin access.

## Solution

You have two options to fix this:

### Option 1: Run the Migration SQL (Recommended for Production)

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy and paste the content of: `supabase/migrations/20251228_set_admin_flag_for_admin_email.sql`
4. Click "Run"
5. Check the output to verify the update was successful

### Option 2: Run the Fix Script (Recommended for Development)

This script will:
- Check if the admin user exists
- Show current admin status
- Update is_admin to true if needed
- Provide clear feedback

```bash
# Export required environment variables
export SUPABASE_URL="your-supabase-url"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Run the script
node scripts/fix-admin-status.js
```

Or with REACT_APP_ prefix:
```bash
export REACT_APP_SUPABASE_URL="your-supabase-url"
export REACT_APP_SUPABASE_ANON_KEY="your-anon-key"  # Not used by this script
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

node scripts/fix-admin-status.js
```

## After Applying the Fix

1. **Log out** from the application
2. **Clear browser cache and localStorage** (or open incognito/private window)
3. **Log back in** with admin@jbalwikobra.com
4. You should now have admin access to the admin panel

## Verification

To verify the fix was applied correctly:

```sql
-- Run this in Supabase SQL Editor
SELECT id, email, name, is_admin, created_at 
FROM users 
WHERE email = 'admin@jbalwikobra.com';
```

The `is_admin` column should be `true`.

## Debugging

If you're still having issues after applying the fix, check the browser console for debug logs. The code has been instrumented with detailed logging:

- `[DEBUG] User from database - is_admin:` - Shows what the API received from database
- `[DEBUG] Sending user response - is_admin:` - Shows what the API is sending to frontend
- `[DEBUG] Login response data.user.is_admin:` - Shows what the frontend received
- `[DEBUG] Mapped user - isAdmin:` - Shows the mapped user object
- `[DEBUG] RequireAdmin - user:` - Shows what RequireAdmin component sees

Look for any place where `is_admin` or `isAdmin` is `false`, `null`, or `undefined`.

## Technical Details

The authentication flow is:
1. API queries `users` table with `is_admin` field
2. API returns user object with `is_admin` to frontend
3. Frontend maps `is_admin` → `isAdmin` (camelCase)
4. Frontend stores mapped user in localStorage as `user_data`
5. `RequireAdmin` component checks `user.isAdmin` to grant/deny access

The issue was at step 1: the database had `is_admin = false` or `NULL`, so all subsequent steps correctly propagated the wrong value.

## Files Changed

- `supabase/migrations/20251228_set_admin_flag_for_admin_email.sql` - SQL migration to set admin flag
- `scripts/fix-admin-status.js` - Node.js script to verify and fix admin status
- `api/auth.ts` - Added debug logging
- `src/contexts/TraditionalAuthContext.tsx` - Added debug logging
- `src/components/RequireAdmin.tsx` - Added debug logging
- `FIX_ADMIN_ACCESS.md` - This documentation

## Prevention

To prevent this issue in the future, when creating admin users:

```sql
-- When creating a new admin user
INSERT INTO users (email, name, phone, password_hash, is_admin, is_active)
VALUES ('admin@example.com', 'Admin Name', '+1234567890', 'hashed_password', true, true);

-- Or when updating an existing user to admin
UPDATE users SET is_admin = true WHERE email = 'admin@example.com';
```

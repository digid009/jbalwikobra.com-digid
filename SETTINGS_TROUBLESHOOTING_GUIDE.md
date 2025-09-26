# Website Settings Persistence Issue - Troubleshooting Guide

## Problem
Admin settings save successfully but revert after page refresh, indicating data is not persisting to the database.

## Most Likely Cause
The `hero_button_url` column doesn't exist in the database yet, causing the save operation to silently fail or skip that field.

## 🚀 **SOLUTION STEPS**

### **Step 1: Run Database Migration**
1. Open **Supabase Dashboard**
2. Go to **SQL Editor**
3. Run this migration script:

```sql
-- Safe Hero Button URL Column Addition
DO $$
BEGIN
    -- Check if hero_button_url column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'website_settings' 
        AND column_name = 'hero_button_url'
    ) THEN
        -- Add the column if it doesn't exist
        ALTER TABLE public.website_settings 
        ADD COLUMN hero_button_url TEXT;
        
        -- Add default value for existing rows
        UPDATE public.website_settings 
        SET hero_button_url = 'https://jbalwikobra.com/special-offer'
        WHERE hero_button_url IS NULL;
        
        RAISE NOTICE 'hero_button_url column added successfully';
    ELSE
        RAISE NOTICE 'hero_button_url column already exists';
    END IF;
END $$;

-- Verify the column exists
SELECT 
  id,
  site_name,
  hero_button_url,
  topup_game_url,
  whatsapp_channel_url,
  updated_at
FROM public.website_settings;
```

### **Step 2: Clear Application Cache**
After running the migration:
1. **Clear browser cache** (Ctrl+Shift+R or Cmd+Shift+R)
2. **Open browser console** (F12)
3. **Run debug command**: `window.debugSettings.debugStatus()`

### **Step 3: Test Admin Settings**
1. Go to **Admin Panel > Settings > Links & URLs**
2. Update the **Hero Button URL** field
3. **Save** the settings
4. **Refresh the page**
5. Check if the URL persists

## 🔧 **Debug Tools Added**

### **Browser Console Commands**
Open browser console (F12) and use these commands:

```javascript
// Check current cache and database state
window.debugSettings.debugStatus()

// Force refresh settings (bypass cache)
window.debugSettings.forceRefresh()

// Clear settings cache
window.debugSettings.clearCache()
```

### **Enhanced Logging**
The following areas now have detailed logging:
- SettingsService.get() - Shows cache vs database fetch
- SettingsService.upsert() - Shows save operations
- AdminSettings component - Shows form loading

## 🐛 **If Still Not Working**

### **Check Browser Console**
Look for error messages during:
1. Loading admin settings
2. Saving settings
3. Page refresh

### **Verify Database Changes**
Run this SQL in Supabase Dashboard:
```sql
-- Check if column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'website_settings' 
AND column_name = 'hero_button_url';

-- Check current data
SELECT id, hero_button_url, updated_at 
FROM website_settings;
```

### **Test Direct Database Update**
Try updating directly in Supabase:
```sql
UPDATE website_settings 
SET hero_button_url = 'https://test-direct-update.com'
WHERE id = (SELECT id FROM website_settings LIMIT 1);
```

## 🔍 **Common Issues & Solutions**

### **Issue 1: Column Doesn't Exist**
**Symptoms**: Save appears successful but data doesn't persist
**Solution**: Run the database migration script above

### **Issue 2: Cache Not Clearing**
**Symptoms**: Old data shows even after save
**Solution**: Use `window.debugSettings.clearCache()` in browser console

### **Issue 3: Browser Cache**
**Symptoms**: UI shows old data after refresh
**Solution**: Hard refresh (Ctrl+Shift+R) or clear browser cache

### **Issue 4: Database Permissions**
**Symptoms**: Console shows permission errors
**Solution**: Check Supabase RLS policies for website_settings table

## 📋 **Files Modified with Enhanced Debugging**
- `src/services/settingsService.ts` - Added debug methods and better error handling
- `src/pages/admin/AdminSettings.tsx` - Added force refresh after save
- `safe_add_hero_button_url.sql` - Safe migration script

## ✅ **Verification Checklist**
- [ ] Database migration run successfully
- [ ] Column exists in website_settings table
- [ ] Browser cache cleared
- [ ] Admin settings save without console errors
- [ ] Settings persist after page refresh
- [ ] Hero button uses updated URL on homepage

---

**Next Steps:**
1. Run the database migration first
2. Test the admin settings
3. Use browser console debug tools if needed
4. Report back with any console errors if issues persist

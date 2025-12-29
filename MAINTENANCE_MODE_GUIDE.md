# 🔧 Maintenance Mode Guide

## Overview

The maintenance mode feature allows you to display a dedicated maintenance page to all visitors while you perform updates, fixes, or scheduled maintenance on your application.

## How It Works

When maintenance mode is enabled, all routes in the application will redirect to a professional maintenance page instead of showing the normal application interface. This includes:
- Homepage
- Product pages
- Admin dashboard
- All other routes

## Enabling Maintenance Mode

### For Local Development

1. Open your `.env.local` file (or create it from `.env.example`)
2. Add or modify the following line:
   ```
   REACT_APP_MAINTENANCE_MODE=true
   ```
3. Restart your development server:
   ```bash
   npm start
   ```

### For Production (Vercel)

1. Go to your Vercel dashboard
2. Navigate to your project settings
3. Go to "Environment Variables"
4. Add a new environment variable:
   - **Name:** `REACT_APP_MAINTENANCE_MODE`
   - **Value:** `true`
   - **Environment:** Select Production (or all environments as needed)
5. Click "Save"
6. Redeploy your application for changes to take effect

## Disabling Maintenance Mode

### For Local Development

1. Open your `.env.local` file
2. Change the value to:
   ```
   REACT_APP_MAINTENANCE_MODE=false
   ```
   Or simply remove the line entirely
3. Restart your development server

### For Production (Vercel)

1. Go to your Vercel dashboard
2. Navigate to Environment Variables
3. Either:
   - Change `REACT_APP_MAINTENANCE_MODE` to `false`
   - Or delete the environment variable entirely
4. Redeploy your application

## Testing Maintenance Mode

Before deploying to production, test the maintenance mode locally:

```bash
# 1. Enable maintenance mode in .env.local
REACT_APP_MAINTENANCE_MODE=true

# 2. Start the development server
npm start

# 3. Visit any route - you should see the maintenance page
```

## Maintenance Page Features

The maintenance page includes:
- ✨ Professional design matching your brand
- 🎨 Responsive layout (mobile and desktop)
- 🔄 Refresh button to check if maintenance is complete
- 💡 User-friendly messaging
- 📱 Mobile-optimized interface

## Best Practices

### Before Enabling Maintenance Mode

1. **Notify Users:** Send advance notice via email, social media, or in-app notifications
2. **Schedule Downtime:** Choose low-traffic hours
3. **Prepare Updates:** Have all changes ready to deploy
4. **Backup Data:** Ensure you have recent backups

### During Maintenance

1. **Monitor Progress:** Keep track of maintenance tasks
2. **Test Thoroughly:** Verify all changes before disabling maintenance mode
3. **Keep It Short:** Minimize downtime duration

### After Maintenance

1. **Test Live:** Verify everything works before announcing completion
2. **Monitor Errors:** Watch for any issues that arise
3. **Notify Users:** Let users know the site is back online
4. **Document Changes:** Keep a log of what was updated

## Deployment Workflow Example

### Scheduled Maintenance

```bash
# 1. Enable maintenance mode in production
# (Via Vercel dashboard or CLI)

# 2. Deploy your updates
vercel --prod

# 3. Test the changes
# Visit your production URL to verify

# 4. Disable maintenance mode
# (Via Vercel dashboard or CLI)

# 5. Redeploy to apply the change
vercel --prod
```

## Emergency Maintenance

If you need to quickly enable maintenance mode:

### Using Vercel CLI

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Login to Vercel
vercel login

# Add environment variable
vercel env add REACT_APP_MAINTENANCE_MODE production
# When prompted, enter: true

# Redeploy
vercel --prod
```

## Customizing the Maintenance Page

The maintenance page is located at:
```
src/pages/MaintenancePage.tsx
```

You can customize:
- **Colors:** Modify the Tailwind classes
- **Messages:** Update the text content
- **Icons:** Change the SVG icons
- **Branding:** Add your logo or custom elements

Example customization:
```tsx
// Add your logo
<img src="/logo.png" alt="Logo" className="w-32 h-32 mx-auto mb-4" />

// Change the message
<h1 className="text-4xl font-bold mb-4">
  We'll Be Right Back!
</h1>

// Add estimated time
<p className="text-gray-400">
  Expected completion: 2:00 PM UTC
</p>
```

## Troubleshooting

### Maintenance Mode Not Showing

1. **Check Environment Variable:**
   ```bash
   # Verify the value is exactly 'true' (lowercase)
   echo $REACT_APP_MAINTENANCE_MODE
   ```

2. **Clear Cache:**
   - Clear browser cache
   - Clear Vercel deployment cache

3. **Verify Deployment:**
   - Ensure you redeployed after changing the environment variable
   - Check Vercel deployment logs

### Can't Disable Maintenance Mode

1. **Check Environment Variable:**
   - Ensure it's set to `false` or removed entirely
   - Not `'false'` (string) but `false` (value)

2. **Redeploy:**
   - Environment changes require a redeploy to take effect

3. **Wait for Propagation:**
   - Changes may take a few minutes to propagate

## Security Considerations

- ✅ Maintenance mode uses environment variables (secure)
- ✅ No hardcoded values in source code
- ✅ Can be controlled without code deployment
- ❌ Does not expose sensitive information
- ❌ Does not affect data security or authentication

## FAQ

**Q: Will the maintenance page affect SEO?**  
A: For short maintenance windows, no significant impact. For longer periods, consider returning a 503 status code.

**Q: Can admins bypass the maintenance page?**  
A: Currently, no. You can modify the code to add an admin bypass if needed.

**Q: Does this affect API endpoints?**  
A: No, the maintenance mode only affects the frontend. API endpoints continue to work unless specifically disabled.

**Q: Can I schedule automatic maintenance mode?**  
A: You would need to implement a scheduling system using Vercel Cron Jobs or a similar service.

## Support

If you encounter issues with maintenance mode:
1. Check this guide thoroughly
2. Review the [App.tsx](src/App.tsx) implementation
3. Check Vercel deployment logs
4. Verify environment variable configuration

---

**Last Updated:** December 29, 2025  
**Feature Version:** 1.0

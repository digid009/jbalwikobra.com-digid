# 🛠️ LOCAL DEVELOPMENT SETUP FOR PAYMENT TESTING

## 🚨 Issue Identified
The "Failed to create direct payment" error occurs because local development is missing required environment variables that are only available in Vercel production environment.

## 📋 Required Environment Variables for Local Testing

Create a `.env.local` file in the root directory with these variables:

```bash
# Xendit Payment Variables (Required for local testing)
XENDIT_SECRET_KEY=xnd_development_your_development_secret_key_here
XENDIT_CALLBACK_TOKEN=your_xendit_callback_token_here

# Supabase Variables (Already in .env but required for API routes)
SUPABASE_URL=https://xeithuvgldzxnggxadri.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlaXRodXZnbGR6eG5nZ3hhZHJpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjQ2MzMyMSwiZXhwIjoyMDcyMDM5MzIxfQ.pLPA5-pZ4jpjzhsevyMJoRLmLYbPbESfMbt14PBMXd8
```

## 🔧 How to Get Xendit Development Keys

1. **Log into Xendit Dashboard**: https://dashboard.xendit.co/
2. **Switch to Development Mode**: Look for a toggle in the top-right
3. **Get Secret Key**: Go to Settings → API Keys → Copy the Development Secret Key
4. **Get Callback Token**: Go to Settings → Callbacks → Copy the Callback Token

## 🚀 Testing Steps

1. Create `.env.local` with the variables above
2. Restart the development server:
   ```bash
   npm start
   ```
3. Test rental payment flow
4. Check browser console for any remaining errors

## 🔍 Error Diagnosis

The error occurs in `api/xendit/create-direct-payment.ts` at line ~13 where:
```typescript
const XENDIT_SECRET_KEY = process.env.XENDIT_SECRET_KEY;
```

If `XENDIT_SECRET_KEY` is undefined, the Xendit API calls will fail with "Failed to create direct payment".

## 🌐 Production vs Local Environment

- **Production (Vercel)**: Has all environment variables set in Vercel dashboard
- **Local Development**: Missing secret keys, needs `.env.local` file

## ⚠️ Security Note

- Never commit `.env.local` to git
- Use development keys for local testing
- Production keys should only be in Vercel environment variables

# 🔧 Environment Configuration Guide

## 📋 Overview
This guide explains how to properly configure environment variables for the JB Alwikobra e-commerce application, following security best practices.

## 🚀 Quick Setup

### For Development
1. Copy `.env.example` to `.env.local`
2. Replace placeholder values with your development keys
3. Run `npm run dev` to start development server

### For Production
1. Configure all backend variables in Vercel environment variables
2. Ensure frontend variables are properly set
3. Test with staging environment first

## 📁 File Structure

```
├── .env.example          # Comprehensive template with all variables
├── .env.local           # Your local development config (gitignored)
└── .gitignore           # Ensures .env files aren't committed
```

## 🔐 Security Model

### ✅ Frontend Variables (Safe for Browser)
- **Prefix**: `REACT_APP_*`
- **Exposure**: Public, visible in browser
- **Examples**: Public API keys, site URLs, feature flags

### ❌ Backend Variables (Server-Side Only)
- **Prefix**: No `REACT_APP_` prefix
- **Exposure**: Private, server-side only
- **Examples**: Secret keys, database credentials, private API keys

## 🌍 Environment Types

### Development Environment
- **File**: `.env.local` (gitignored)
- **Keys**: Use development/test keys only
- **Security**: Lower security requirements for testing

### Production Environment
- **Location**: Vercel environment variables
- **Keys**: Live production keys
- **Security**: Maximum security, encrypted storage

## 📋 Required Variables

### Frontend (Public)
```bash
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_anon_key
REACT_APP_XENDIT_PUBLIC_KEY=xnd_public_your_key
REACT_APP_SITE_NAME=JB Alwikobra
REACT_APP_SITE_URL=https://yourdomain.com
REACT_APP_WHATSAPP_NUMBER=628xxxxxxxxxx
```

### Backend (Private - Vercel Only)
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_key
XENDIT_SECRET_KEY=xnd_development_or_production_key
XENDIT_CALLBACK_TOKEN=your_callback_token
WHATSAPP_API_KEY=your_whatsapp_key
WHATSAPP_GROUP_ID=your_group@g.us
```

## 🛡️ Security Best Practices

### ✅ DO
- Use `.env.local` for local development (gitignored)
- Store production secrets in Vercel environment variables
- Use different keys for development vs production
- Regularly rotate API keys and tokens
- Validate environment variables at runtime
- Use Supabase RLS policies for data security

### ❌ DON'T
- Commit `.env` files with real secrets to git
- Put service role keys in `REACT_APP_*` variables
- Use production keys in development
- Share environment files with real secrets
- Store sensitive data in frontend variables

## 🔧 Configuration Examples

### Local Development Setup
```bash
# Copy the template
cp .env.example .env.local

# Edit with your development keys
nano .env.local

# Start development
npm run dev
```

### Vercel Production Setup
```bash
# Using Vercel CLI
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add XENDIT_SECRET_KEY production
vercel env add WHATSAPP_API_KEY production

# Or use Vercel Dashboard
# https://vercel.com/your-project/settings/environment-variables
```

## 🧪 Testing Configuration

### Validate Local Environment
```bash
# Test that all required variables are set
node -e "
const required = ['XENDIT_SECRET_KEY', 'SUPABASE_SERVICE_ROLE_KEY'];
required.forEach(key => {
  console.log(key + ':', process.env[key] ? '✅ Set' : '❌ Missing');
});
"
```

### Validate Frontend Variables
```javascript
// In your React component
const isConfigValid = !!(
  process.env.REACT_APP_SUPABASE_URL &&
  process.env.REACT_APP_SUPABASE_ANON_KEY &&
  process.env.REACT_APP_XENDIT_PUBLIC_KEY
);
```

## 🚨 Security Incidents

### If Secrets Are Compromised
1. **Immediately rotate all affected keys**
2. **Update Vercel environment variables**
3. **Check git history for exposed secrets**
4. **Update `.gitignore` if needed**
5. **Review access logs for unauthorized usage**

### Prevention
- Regular security audits
- Automated secret scanning
- Team training on secure practices
- Clear documentation and guidelines

## 📚 Resources

- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Supabase Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Xendit API Documentation](https://developers.xendit.co/)
- [React Environment Variables](https://create-react-app.dev/docs/adding-custom-environment-variables/)

## 🔄 Maintenance

### Regular Tasks
- [ ] Rotate API keys quarterly
- [ ] Review and update environment variables
- [ ] Audit git history for accidental secret commits
- [ ] Test environment configuration in staging
- [ ] Update team on any configuration changes

---

**Last Updated**: September 18, 2025  
**Version**: 2.4.5  
**Status**: ✅ Cleaned up and secured

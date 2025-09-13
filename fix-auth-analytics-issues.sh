#!/bin/bash

# Fix Critical Environment Variables Issues
# This script addresses the auth login failure and WebSocket issues

echo "🔧 Fixing Critical Auth & Analytics Issues..."

# 1. Environment Variables Check
echo "1. Checking environment variables..."
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ Missing server-side environment variables"
    echo "📋 Required for Vercel deployment:"
    echo "   SUPABASE_URL=https://xeithuvgldzxnggxadri.supabase.co"
    echo "   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlaXRodXZnbGR6eG5nZ3hhZHJpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjQ2MzMyMSwiZXhwIjoyMDcyMDM5MzIxfQ.pLPA5-pZ4jpjzhsevyMJoRLmLYbPbESfMbt14PBMXd8"
fi

# 2. Clean API Key Check
echo "2. Checking for API key formatting issues..."
API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlaXRodXZnbGR6eG5nZ3hhZHJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0NjMzMjEsImV4cCI6MjA3MjAzOTMyMX0.g8n_0wiTn7BQK_uujfU9d4zqb5lSQcW6oGC8GxIhjAQ"
if [[ $API_KEY == *$'\r'* ]] || [[ $API_KEY == *$'\n'* ]]; then
    echo "❌ API key contains CRLF characters"
else
    echo "✅ API key format looks clean"
fi

# 3. Database Connection Test
echo "3. Testing database connection..."
echo "   This should be done in the actual deployment environment"

# 4. Solutions Summary
echo ""
echo "🚀 SOLUTIONS REQUIRED:"
echo ""
echo "1. SET VERCEL ENVIRONMENT VARIABLES:"
echo "   vercel env add SUPABASE_URL"
echo "   vercel env add SUPABASE_SERVICE_ROLE_KEY"
echo ""
echo "2. REDEPLOY WITH CORRECT ENV VARS:"
echo "   vercel --prod"
echo ""
echo "3. IF WEBSOCKET ISSUES PERSIST:"
echo "   - Check Supabase project settings"
echo "   - Verify realtime is enabled"
echo "   - Check API key permissions"
echo ""
echo "4. ORDER ANALYTICS FIX:"
echo "   - Ensure 'orders' table exists"
echo "   - Check RLS policies for service role"
echo "   - Verify time-series endpoint connectivity"

echo ""
echo "✅ Diagnostic complete. See solutions above."

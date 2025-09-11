@echo off
REM 🚀 JB Alwikobra E-commerce - Production Deployment Script (Windows)
REM This script prepares and validates the application for production deployment

echo 🚀 Starting production deployment preparation...

REM Check if Node.js and npm are installed
echo ℹ️ Checking system requirements...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo ✅ Node.js and npm are installed

REM Check for environment file
echo ℹ️ Checking environment configuration...
if not exist .env (
    echo ⚠️ No .env file found. Please create one from .env.example
    echo ℹ️ You can copy the template: copy .env.example .env
    echo ⚠️ Make sure to fill in all required values before deploying
) else (
    echo ✅ Environment file found
)

REM Install dependencies
echo ℹ️ Installing dependencies...
call npm install --production=false
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)
echo ✅ Dependencies installed successfully

REM Run TypeScript check
echo ℹ️ Running TypeScript compilation check...
call npm run tsc
if %errorlevel% neq 0 (
    echo ❌ TypeScript compilation failed
    pause
    exit /b 1
)
echo ✅ TypeScript compilation successful

REM Run linting
echo ℹ️ Running ESLint check...
call npm run lint
if %errorlevel% neq 0 (
    echo ❌ Linting failed
    pause
    exit /b 1
)
echo ✅ Linting passed

REM Run security audit
echo ℹ️ Running security audit...
call npm audit --audit-level=high
if %errorlevel% equ 0 (
    echo ✅ No high-severity vulnerabilities found
) else (
    echo ⚠️ Some vulnerabilities found. Consider running 'npm audit fix'
)

REM Build the application
echo ℹ️ Building production bundle...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Production build failed
    pause
    exit /b 1
)
echo ✅ Production build successful

REM Check build size
echo ℹ️ Checking build size...
for /f %%i in ('dir build /s /-c ^| findstr "bytes"') do set BUILD_SIZE=%%i
echo ℹ️ Build directory created successfully

REM Final deployment checklist
echo.
echo 🎯 DEPLOYMENT CHECKLIST:
echo ════════════════════════
echo ✅ Dependencies installed
echo ✅ TypeScript compilation passed
echo ✅ Linting passed
echo ✅ Production build successful
echo ⚠️ Security audit completed (review warnings above)
echo.

echo ℹ️ Your application is ready for deployment!
echo ℹ️ Build files are in the ./build directory
echo.
echo ℹ️ Next steps:
echo 1. 🔧 Configure environment variables in your deployment platform
echo 2. 🌐 Set up domain and SSL certificates
echo 3. 🚀 Deploy the ./build directory
echo 4. 🔍 Test the deployed application
echo 5. 📊 Set up monitoring and analytics
echo.

REM Platform-specific deployment commands
echo 📋 PLATFORM DEPLOYMENT COMMANDS:
echo ════════════════════════════════
echo.
echo 🔷 Vercel:
echo    vercel --prod
echo.
echo 🔷 Netlify:
echo    netlify deploy --prod --dir=build
echo.
echo 🔷 Static Server (testing):
echo    npm install -g serve
echo    serve -s build
echo.

echo ✅ Deployment preparation complete! 🎉
pause

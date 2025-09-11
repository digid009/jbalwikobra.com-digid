#!/bin/bash

# 🚀 JB Alwikobra E-commerce - Production Deployment Script
# This script prepares and validates the application for production deployment

echo "🚀 Starting production deployment preparation..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️ $1${NC}"
}

# Check if Node.js and npm are installed
print_info "Checking system requirements..."
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

print_status "Node.js and npm are installed"

# Check for environment file
print_info "Checking environment configuration..."
if [ ! -f .env ]; then
    print_warning "No .env file found. Please create one from .env.example"
    print_info "You can copy the template: cp .env.example .env"
    print_warning "Make sure to fill in all required values before deploying"
else
    print_status "Environment file found"
fi

# Install dependencies
print_info "Installing dependencies..."
if npm install --production=false; then
    print_status "Dependencies installed successfully"
else
    print_error "Failed to install dependencies"
    exit 1
fi

# Run TypeScript check
print_info "Running TypeScript compilation check..."
if npm run tsc; then
    print_status "TypeScript compilation successful"
else
    print_error "TypeScript compilation failed"
    exit 1
fi

# Run linting
print_info "Running ESLint check..."
if npm run lint; then
    print_status "Linting passed"
else
    print_error "Linting failed"
    exit 1
fi

# Run security audit
print_info "Running security audit..."
npm audit --audit-level=high
if [ $? -eq 0 ]; then
    print_status "No high-severity vulnerabilities found"
else
    print_warning "Some vulnerabilities found. Consider running 'npm audit fix'"
fi

# Build the application
print_info "Building production bundle..."
if npm run build; then
    print_status "Production build successful"
else
    print_error "Production build failed"
    exit 1
fi

# Check build size
print_info "Checking build size..."
BUILD_SIZE=$(du -sh build/ | cut -f1)
print_info "Total build size: $BUILD_SIZE"

# Display build files
print_info "Build contents:"
ls -la build/static/js/main.*.js | head -1
ls -la build/static/css/main.*.css | head -1

print_status "Build analysis complete"

# Final deployment checklist
echo ""
echo "🎯 DEPLOYMENT CHECKLIST:"
echo "════════════════════════"
echo "✅ Dependencies installed"
echo "✅ TypeScript compilation passed" 
echo "✅ Linting passed"
echo "✅ Production build successful"
echo "⚠️ Security audit completed (review warnings above)"
echo ""

print_info "Your application is ready for deployment!"
print_info "Build files are in the ./build directory"
print_info ""
print_info "Next steps:"
echo "1. 🔧 Configure environment variables in your deployment platform"
echo "2. 🌐 Set up domain and SSL certificates"
echo "3. 🚀 Deploy the ./build directory"
echo "4. 🔍 Test the deployed application"
echo "5. 📊 Set up monitoring and analytics"
echo ""

# Platform-specific deployment commands
echo "📋 PLATFORM DEPLOYMENT COMMANDS:"
echo "════════════════════════════════"
echo ""
echo "🔷 Vercel:"
echo "   vercel --prod"
echo ""
echo "🔷 Netlify:"
echo "   netlify deploy --prod --dir=build"
echo ""
echo "🔷 Static Server (testing):"
echo "   npm install -g serve"
echo "   serve -s build"
echo ""

print_status "Deployment preparation complete! 🎉"

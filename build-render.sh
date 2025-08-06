#!/bin/bash
set -e

echo "=== SmartView2.0 Render Build Process ==="

# Install ALL dependencies (production AND dev dependencies)
echo "Installing all dependencies..."
npm install

# Verify required build tools are available
echo "Verifying build tools..."
npx vite --version
npx esbuild --version

# Build frontend using production config
echo "Building frontend..."
npx vite build --config vite.prod.config.js

# Build backend
echo "Building backend..."
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outfile=dist/index.js

echo "=== Build Complete ==="

# Verify outputs
if [ -f "dist/index.js" ]; then
    echo "✅ Backend built successfully"
else
    echo "❌ Backend build failed"
    exit 1
fi

if [ -d "dist/public" ] && [ -f "dist/public/index.html" ]; then
    echo "✅ Frontend built successfully"
else
    echo "❌ Frontend build failed"
    exit 1
fi

echo "🚀 SmartView2.0 is ready for deployment!"
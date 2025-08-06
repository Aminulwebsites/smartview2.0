#!/bin/bash
set -e

echo "=== SmartView2.0 Build Process ==="

# Set NODE_ENV for production build
export NODE_ENV=production

# Install dependencies including devDependencies
echo "Installing dependencies..."
npm ci

# Build frontend
echo "Building frontend..."
cd client
npx vite build --outDir ../dist/public
cd ..

# Build backend
echo "Building backend..."
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outfile=dist/index.js

echo "=== Build Complete ==="
echo "Frontend: dist/public/"
echo "Backend: dist/index.js"

# Verify build outputs
if [ -f "dist/index.js" ] && [ -f "dist/public/index.html" ]; then
    echo "✅ Build successful!"
    exit 0
else
    echo "❌ Build failed - missing output files"
    exit 1
fi
#!/bin/bash
set -e

echo "=== SmartView2.0 Final Build ==="

# Clean any previous builds
rm -rf dist/

# Install dependencies
echo "Installing dependencies..."
npm install

# Verify tools
echo "Build tools:"
npx vite --version
npx esbuild --version

# Build frontend with clean config
echo "Building frontend..."
npx vite build --config vite.prod.config.js

# Build backend
echo "Building backend..."
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outfile=dist/index.js

# Verify outputs
echo "Build verification:"
ls -la dist/
ls -la dist/public/

if [ -f "dist/index.js" ] && [ -f "dist/public/index.html" ]; then
    echo "✅ SmartView2.0 build successful!"
else
    echo "❌ Build failed"
    exit 1
fi
#!/bin/bash
set -e

echo "=== SmartView2.0 Render Deployment Build ==="

# Clean start
rm -rf dist/ node_modules/.vite-temp/ || true

# Install ALL dependencies 
echo "Installing dependencies..."
npm install

# Build frontend from root directory
echo "Building frontend from root..."
npx vite build --config client/vite.config.ts

# Build backend
echo "Building backend..."
npx esbuild server/index.ts \
  --platform=node \
  --packages=external \
  --bundle \
  --format=esm \
  --outfile=dist/index.js

# Verify build
if [ -f "dist/index.js" ] && [ -f "dist/public/index.html" ]; then
    echo "✅ Build successful - SmartView2.0 ready!"
    echo "Files created:"
    ls -la dist/
    ls -la dist/public/assets/ | head -5
else
    echo "❌ Build failed"
    exit 1
fi
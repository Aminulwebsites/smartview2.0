#!/bin/bash
set -e

echo "=== SmartView2.0 Simple Render Build ==="

# Clean previous builds
rm -rf dist/

# Install all dependencies
echo "Installing dependencies..."
npm install

# Build using the existing working vite config from root
echo "Building with root vite config..."
npx vite build

# Build backend
echo "Building backend..."
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outfile=dist/index.js

# Initialize database schema if DATABASE_URL is available
if [ -n "$DATABASE_URL" ]; then
    echo "Pushing database schema..."
    npx drizzle-kit push --verbose || echo "Database push failed, will retry at startup"
fi

# Verify
if [ -f "dist/index.js" ] && [ -f "dist/public/index.html" ]; then
    echo "✅ Build complete!"
else
    echo "❌ Build failed"
    exit 1
fi
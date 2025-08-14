#!/bin/bash
set -e

echo "Starting build process..."

# Install all dependencies (including devDependencies for build)
npm ci

echo "Building frontend with Vite using production config..."
npx vite build --config vite.config.prod.js

echo "Building backend with ESBuild..."
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

echo "Build completed successfully!"
echo "Built files:"
ls -la dist/
ls -la dist/public/ || echo "No public directory found"
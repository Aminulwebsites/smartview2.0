#!/bin/bash
set -e

echo "=== SmartView2.0 Production Startup ==="

# Push database schema to ensure tables exist
echo "Initializing database schema..."
npx drizzle-kit push --verbose

# Start the application
echo "Starting SmartView2.0..."
NODE_ENV=production node dist/index.js
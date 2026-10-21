#!/bin/bash

# Artax Asset Manager - Deploy Script
# This script builds and prepares the app for deployment

echo "Building Artax Asset Manager for deployment..."
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm ci --ignore-scripts
  echo ""
fi

# Build the application
echo "Building the application..."
npm run build

if [ $? -ne 0 ]; then
  echo "Build failed! Please check the errors above."
  exit 1
fi

echo ""
echo "Build completed successfully!"
echo "Output directory: dist/"
echo ""
echo "Deployment Steps:"
echo "1. Review SECURITY.md and configure the authenticated Node backend and HTTPS proxy."
echo "2. Keep all credentials server-side and database files outside the public document root."
echo "3. This script only builds files; it does not publish a production release."
echo ""
echo "To preview the build locally, run: npm run preview"

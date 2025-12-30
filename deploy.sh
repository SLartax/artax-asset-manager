#!/bin/bash

# Artax Asset Manager - Deploy Script
# This script builds and prepares the app for deployment

echo "Building Artax Asset Manager for deployment..."
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
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
echo "1. Upload the contents of the 'dist' folder to your web server"
echo "2. Set the GEMINI_API_KEY environment variable on your server"
echo "3. Configure your server to route all requests to index.html (for client-side routing)"
echo ""
echo "To preview the build locally, run: npm run preview"

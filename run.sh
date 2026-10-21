#!/bin/bash

# Artax Asset Manager - Run Script
# This script starts the development server

echo "Starting Artax Asset Manager..."
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm ci --ignore-scripts
  echo ""
fi

echo "Configure and start the authenticated backend separately; see SECURITY.md."

echo "Starting development server..."
npm run dev

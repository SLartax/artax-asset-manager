#!/bin/bash

# Artax Asset Manager - Run Script
# This script starts the development server

echo "Starting Artax Asset Manager..."
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
  echo ""
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
  echo "Warning: .env.local file not found!"
  echo "Creating .env.local with GEMINI_API_KEY placeholder..."
  echo "GEMINI_API_KEY=your-gemini-api-key-here" > .env.local
  echo "Please update .env.local with your actual Gemini API key."
  echo ""
fi

echo "Starting development server..."
npm run dev

# Artax Asset Manager - Scripts Documentation

This document describes all available scripts for the Artax Asset Manager project.

## Available Scripts

### Development Scripts

#### `npm run dev`
Starts the Vite development server for local development.
- **Port**: http://localhost:5173 (default)
- **Hot Reload**: Enabled - changes are reflected immediately
- **Use case**: Local development and testing

**Command**:
```bash
npm run dev
```

#### `npm run run` (or `bash run.sh`)
Wrapper script that starts the development server with additional setup.
- **Dependencies**: Automatically installs npm packages if missing
- **Environment**: Creates .env.local with placeholder if not exists
- **Use case**: Quick start for development

**Commands**:
```bash
npm run run
# or
bash run.sh
```

### Build & Deployment Scripts

#### `npm run build`
Builds the application for production with optimizations.
- **Output**: `dist/` folder
- **Optimization**: Minified and optimized for performance
- **Use case**: Creating production-ready build

**Command**:
```bash
npm run build
```

#### `npm run deploy` (or `bash deploy.sh`)
Full deployment script that builds and prepares the app for production.
- **Steps**:
  1. Installs dependencies if needed
  2. Builds the application
  3. Provides deployment instructions
  4. Shows preview command
- **Output**: `dist/` folder ready for deployment
- **Use case**: Preparing app for server deployment

**Commands**:
```bash
npm run deploy
# or
bash deploy.sh
```

#### `npm run preview`
Previews the production build locally before deploying.
- **Use case**: Testing the built application locally
- **Port**: Default preview port (usually http://localhost:4173)

**Command**:
```bash
npm run preview
```

## Quick Start

### For Development
```bash
npm run run
```
This will:
1. Install dependencies
2. Create .env.local if needed
3. Start the development server

### For Production Deployment
```bash
npm run deploy
```
Then follow the on-screen instructions for deployment steps.

## Environment Variables

### Required
- **GEMINI_API_KEY**: Your Google Gemini API key for the application to function
  - Located in: `.env.local`
  - Format: `GEMINI_API_KEY=your-key-here`

## Deployment Steps

After running `npm run deploy`:

1. **Upload Files**: Copy all contents from the `dist/` folder to your web server
2. **Set Environment**: Configure `GEMINI_API_KEY` on your server
3. **Configure Server**: Ensure your server routes all requests to `index.html` (for client-side routing support)
4. **Test**: Verify the app works on your deployment domain

## Troubleshooting

### Build fails
- Check TypeScript errors: `npm run build`
- Ensure all dependencies are installed: `npm install`
- Check Node.js version compatibility

### Development server won't start
- Check if port 5173 is available
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check .env.local has valid GEMINI_API_KEY

### App not working in production
- Verify GEMINI_API_KEY is set on server
- Check server logs for errors
- Ensure server routes all requests to index.html
- Clear browser cache

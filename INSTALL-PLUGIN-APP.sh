#!/bin/bash

# Install and Run Gasket Vite Plugin App
# This script installs dependencies for both the plugin and the app

set -e  # Exit on error

echo "======================================"
echo "Gasket Vite Plugin App Installation"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Install Plugin Dependencies
echo -e "${BLUE}[1/3]${NC} Installing plugin dependencies..."
echo ""
cd /Users/jordanpina/dev/gasket-os/gasket/packages/gasket-plugin-vite
npm install
echo ""
echo -e "${GREEN}✓${NC} Plugin dependencies installed!"
echo ""

# Step 2: Install App Dependencies
echo -e "${BLUE}[2/3]${NC} Installing app dependencies..."
echo ""
cd /Users/jordanpina/dev/gasket-os/gasket/my-gasket-vite-app-with-plugin
npm install
echo ""
echo -e "${GREEN}✓${NC} App dependencies installed!"
echo ""

# Step 3: Summary
echo -e "${BLUE}[3/3]${NC} Installation complete!"
echo ""
echo "======================================"
echo -e "${GREEN}✨ Ready to run!${NC}"
echo "======================================"
echo ""
echo "To start the development server:"
echo -e "  ${YELLOW}cd /Users/jordanpina/dev/gasket-os/gasket/my-gasket-vite-app-with-plugin${NC}"
echo -e "  ${YELLOW}npm run local${NC}"
echo ""
echo "Then open: http://localhost:3000"
echo ""
echo "Other commands:"
echo -e "  ${YELLOW}npm run build${NC}   - Build for production"
echo -e "  ${YELLOW}npm run preview${NC} - Run production build"
echo ""


#!/bin/bash

# NextCore ERP - GitHub Upload Script
# Run this script after creating the repository on GitHub

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 NextCore ERP - GitHub Upload Script${NC}"
echo -e "${BLUE}======================================${NC}"

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "services" ]; then
    echo -e "${YELLOW}⚠️  Please run this script from the NextCore ERP root directory${NC}"
    exit 1
fi

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo -e "${YELLOW}⚠️  Git repository not initialized. Initializing...${NC}"
    git init
    git config user.name "MuhamedZanabal"
    git config user.email "muhamed.zanabal@example.com"
fi

# Add remote origin
echo -e "${BLUE}📡 Adding GitHub remote...${NC}"
git remote remove origin 2>/dev/null || true
git remote add origin https://github.com/MuhamedZanabal/nextcore-erp.git

# Ensure we're on main branch
echo -e "${BLUE}🌿 Setting up main branch...${NC}"
git branch -M main

# Show current status
echo -e "${BLUE}📊 Current repository status:${NC}"
git status --short

# Push to GitHub
echo -e "${BLUE}⬆️  Pushing to GitHub...${NC}"
git push -u origin main

# Verify upload
echo -e "${GREEN}✅ Upload completed successfully!${NC}"
echo -e "${GREEN}🎉 Your NextCore ERP repository is now live at:${NC}"
echo -e "${GREEN}   https://github.com/MuhamedZanabal/nextcore-erp${NC}"
echo ""
echo -e "${BLUE}📋 Next steps:${NC}"
echo -e "   1. Visit your repository on GitHub"
echo -e "   2. Add repository topics and description"
echo -e "   3. Create your first release (v1.0.0)"
echo -e "   4. Star your repository ⭐"
echo -e "   5. Share your amazing work! 🚀"
echo ""
echo -e "${GREEN}🏆 Congratulations on building NextCore ERP!${NC}"
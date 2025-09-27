#!/bin/bash
# Activation script for DeFi Portfolio Manager virtual environment

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 DeFi Portfolio Manager - Virtual Environment Setup${NC}"
echo -e "${BLUE}=================================================${NC}"

# Check if we're already in the venv
if [[ "$VIRTUAL_ENV" != "" ]]; then
    echo -e "${YELLOW}✅ Virtual environment is already active: $VIRTUAL_ENV${NC}"
else
    echo -e "${BLUE}🔧 Activating virtual environment...${NC}"
    source venv/bin/activate
    echo -e "${GREEN}✅ Virtual environment activated!${NC}"
fi

echo ""
echo -e "${BLUE}📦 Installed packages:${NC}"
echo "  ✅ FastMCP (MCP Server Framework)"
echo "  ✅ MCP (Model Context Protocol)"  
echo "  ✅ httpx (HTTP Client)"
echo "  ✅ pandas & numpy (Data Analysis)"
echo "  ✅ web3 & eth-account (Blockchain)"
echo "  ✅ hyperon (MeTTa Knowledge Graph)"
echo "  ✅ pytest (Testing)"
echo ""

echo -e "${BLUE}🎯 Quick Start Commands:${NC}"
echo "  🧠 Test MeTTa Integration:    cd agents && python test_integration.py"
echo "  🚀 Start MCP Server:          cd agents && python server.py"
echo "  ⚡ Start Frontend:             cd frontend && npm run dev"
echo "  🧪 Run Tests:                 pytest"
echo ""

echo -e "${YELLOW}💡 Don't forget to set up your .env file with API keys!${NC}"
echo -e "${GREEN}🎉 Happy coding!${NC}"
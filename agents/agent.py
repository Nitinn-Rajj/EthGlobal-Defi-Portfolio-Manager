import os
from dotenv import load_dotenv
from uagents import Agent
from uagents_adapter import MCPServerAdapter
from server import mcp

# Load environment variables
load_dotenv()

# Get API key from environment variable
ASI_ONE_API_KEY = os.getenv("ASI_ONE_API_KEY")

if not ASI_ONE_API_KEY:
    raise ValueError("ASI_ONE_API_KEY not found in environment variables")

# Create an MCP adapter with your MCP server
mcp_adapter = MCPServerAdapter(
    mcp_server=mcp,                     # (FastMCP) Your MCP server instance
    asi1_api_key=ASI_ONE_API_KEY,  
    model="asi1-mini"                   # (str) Model to use: "asi1-mini", "asi1-extended", or "asi1-fast"
)

# Create a uAgent with mailbox enabled
agent = Agent(
    name="wallet-market-fgi-agent",
    port=8000,
    seed="ETH",
    mailbox=True        # Enable mailbox functionality
) 

# Copy the address shown below
print(f"Your agent's address is: {agent.address}")

# Include protocols from the adapter
for protocol in mcp_adapter.protocols:
    agent.include(protocol, publish_manifest=True)

if __name__ == "__main__":
    # Run the MCP adapter with the agent
    mcp_adapter.run(agent)
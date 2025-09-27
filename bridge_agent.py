from uagents import Agent, Context, Model
from typing import Optional, Dict, Any
import time
import asyncio
from datetime import datetime, timezone
from uuid import uuid4
from uagents_core.contrib.protocols.chat import (
    ChatMessage,
    TextContent,
    ChatAcknowledgement
)

# REST API models (following the examples exactly)
class Request(Model):
    text: str

class Response(Model):
    timestamp: int
    text: str
    agent_address: str

# Create bridge agent
bridge_agent = Agent(
    name="bridge_agent",
    port=8001,
    seed='random',
    endpoint=["http://127.0.0.1:8001/submit"],
)

# Configuration
MAIN_AGENT_ADDRESS = "agent1qddv4n7t4dp393655mgfa8y3vqdulesskf7vea9ydrq68f3mhqrdgv2sm78"  # Update this with your actual agent address

# Global storage for pending requests and responses
pending_requests: Dict[str, asyncio.Future] = {}
request_order = []  # Track order of requests for FIFO response handling

# Bridge agent setup

@bridge_agent.on_event("startup")
async def startup_handler(ctx: Context):
    ctx.logger.info(f"Bridge agent started with address: {ctx.agent.address}")
    ctx.logger.info(f"Will communicate with main agent at: {MAIN_AGENT_ADDRESS}")
    ctx.logger.info("REST API available at:")
    ctx.logger.info("  POST http://127.0.0.1:8001/chat")
    ctx.logger.info("  GET  http://127.0.0.1:8001/health")

@bridge_agent.on_rest_post("/chat", Request, Response)
async def chat_endpoint(ctx: Context, req: Request) -> Response:
    """
    Forward a query to the main agent and wait for response using asynchronous communication
    """
    try:
        ctx.logger.info(f"Received REST request: {req.text}")
        ctx.logger.info(f"Forwarding query to main agent: {MAIN_AGENT_ADDRESS}")
        
        # Create unique message ID for correlation
        msg_id = uuid4()
        msg_id_str = str(msg_id)
        
        # Create a future to wait for the response
        response_future = asyncio.Future()
        pending_requests[msg_id_str] = response_future
        request_order.append(msg_id_str)  # Track order for FIFO response handling
        
        # Send message to main agent using ChatMessage format
        chat_msg = ChatMessage(
            content=[TextContent(type="text", text=req.text)],
            msg_id=msg_id,
            timestamp=datetime.now(timezone.utc)
        )
        
        # Send the message asynchronously
        await ctx.send(MAIN_AGENT_ADDRESS, chat_msg)
        
        try:
            # Wait for response with timeout (30 seconds)
            response_text = await asyncio.wait_for(response_future, timeout=60.0)
            
            # Clean up the pending request
            pending_requests.pop(msg_id_str, None)
            if msg_id_str in request_order:
                request_order.remove(msg_id_str)
            
            return Response(
                text=response_text,
                agent_address=ctx.agent.address,
                timestamp=int(time.time())
            )
            
        except asyncio.TimeoutError:
            # Clean up the pending request
            pending_requests.pop(msg_id_str, None)
            if msg_id_str in request_order:
                request_order.remove(msg_id_str)
            ctx.logger.error("Timeout waiting for response from main agent")
            return Response(
                text="Timeout: No response received from main agent within 30 seconds",
                agent_address=ctx.agent.address,
                timestamp=int(time.time())
            )
            
    except Exception as e:
        ctx.logger.error(f"Error in chat endpoint: {str(e)}")
        return Response(
            text=f"Error: {str(e)}",
            agent_address=ctx.agent.address,
            timestamp=int(time.time())
        )

@bridge_agent.on_rest_get("/health", Response)
async def health_endpoint(ctx: Context) -> Dict[str, Any]:
    """Health check endpoint"""
    ctx.logger.info("Received health check request")
    return {
        "timestamp": int(time.time()),
        "text": "Bridge agent is healthy and ready to forward requests",
        "agent_address": ctx.agent.address,
    }

@bridge_agent.on_rest_post("/ping", Request, Response)
async def ping_main_agent(ctx: Context, req: Request) -> Response:
    """
    Ping endpoint to test communication with main agent using ctx.send (one-way)
    """
    try:
        ctx.logger.info(f"Pinging main agent with message: {req.text}")
        
        # Send one-way message to main agent using ctx.send with ChatMessage
        ping_msg = ChatMessage(
            content=[TextContent(type="text", text=f"Ping from bridge agent: {req.text}")],
            msg_id=uuid4(),
            timestamp=datetime.now(timezone.utc)
        )
        await ctx.send(MAIN_AGENT_ADDRESS, ping_msg)
        
        return Response(
            text=f"Ping message sent to main agent: {req.text}",
            agent_address=ctx.agent.address,
            timestamp=int(time.time())
        )
        
    except Exception as e:
        ctx.logger.error(f"Error in ping endpoint: {str(e)}")
        return Response(
            text=f"Failed to ping main agent: {str(e)}",
            agent_address=ctx.agent.address,
            timestamp=int(time.time())
        )

# Handle responses from the main agent (using proper ChatMessage format)
@bridge_agent.on_message(model=ChatMessage)
async def handle_chat_message(ctx: Context, sender: str, msg: ChatMessage):
    """Handle ChatMessage responses from other agents and complete pending requests"""
    ctx.logger.info(f"Received ChatMessage from {sender}")
    
    # Extract response text from ChatMessage content
    response_text = ""
    for content_item in msg.content:
        if isinstance(content_item, TextContent):
            ctx.logger.info(f"Content: {content_item.text}")
            response_text += content_item.text
    
    # Complete the oldest pending request (FIFO order)
    if request_order and pending_requests:
        oldest_request_id = request_order[0]
        if oldest_request_id in pending_requests:
            ctx.logger.info(f"Completing pending request for message ID: {oldest_request_id}")
            future = pending_requests[oldest_request_id]
            if not future.done():
                future.set_result(response_text)
            # Don't remove from pending_requests here - let the REST endpoint clean up
        else:
            ctx.logger.warning(f"Oldest request ID {oldest_request_id} not found in pending_requests")
    else:
        ctx.logger.info(f"No pending requests to complete")
    
    # Send acknowledgment back (as required by chat protocol)
    ack = ChatAcknowledgement(
        timestamp=datetime.now(timezone.utc),
        acknowledged_msg_id=msg.msg_id
    )
    await ctx.send(sender, ack)

@bridge_agent.on_message(model=ChatAcknowledgement)
async def handle_chat_ack(ctx: Context, sender: str, msg: ChatAcknowledgement):
    """Handle chat acknowledgments"""
    ctx.logger.info(f"Received acknowledgment from {sender} for message {msg.acknowledged_msg_id}")

if __name__ == "__main__":
    print("=" * 60)
    print("BRIDGE AGENT (Updated for ChatMessage)")
    print("=" * 60)
    print("This bridge agent will:")
    print("1. Expose REST endpoints at http://127.0.0.1:8001")
    print("2. Forward requests to the main MCP agent using ChatMessage format")
    print("3. Use proper chat protocol with acknowledgments")
    print()
    print("IMPORTANT: Update MAIN_AGENT_ADDRESS with your actual agent address!")
    print(f"Current target: {MAIN_AGENT_ADDRESS}")
    print()
    print("Available endpoints:")
    print("  POST /chat   - Forward query and get response (ctx.send_and_receive)")
    print("  POST /ping   - Send one-way message (ctx.send)")
    print("  GET  /health - Health check")
    print()
    print("Message format: ChatMessage with TextContent (MCP compatible)")
    print("Starting bridge agent...")
    bridge_agent.run()
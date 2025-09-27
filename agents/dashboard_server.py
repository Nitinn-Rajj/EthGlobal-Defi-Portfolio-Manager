from flask import Flask, request, jsonify
import asyncio
import json
import time
import sys
import os

# Add current directory to path for imports
sys.path.append(os.path.dirname(__file__))

# Import dashboard function
try:
    from server import get_comprehensive_dashboard_data
    DASHBOARD_AVAILABLE = True
    print("✅ Dashboard function imported successfully")
except ImportError as e:
    DASHBOARD_AVAILABLE = False
    print(f"❌ Dashboard function import failed: {e}")

app = Flask(__name__)

@app.route('/dashboard', methods=['POST'])
def dashboard_endpoint():
    """
    Get comprehensive dashboard data for a wallet address.
    Expects JSON: {"text": "wallet_address"}
    """
    try:
        data = request.get_json()
        if not data or 'text' not in data:
            return jsonify({
                "error": "Request must contain 'text' field with wallet address",
                "timestamp": int(time.time())
            }), 400
        
        wallet_address = data['text'].strip()
        print(f"Dashboard request for wallet: {wallet_address}")
        
        if not DASHBOARD_AVAILABLE:
            return jsonify({
                "error": "Dashboard function not available", 
                "timestamp": int(time.time())
            }), 500
        
        # Run the async dashboard function
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            dashboard_data = loop.run_until_complete(get_comprehensive_dashboard_data(wallet_address))
        finally:
            loop.close()
        
        print(f"Dashboard data generated successfully for {wallet_address}")
        
        # Return in same format as bridge agent
        return jsonify({
            "text": json.dumps(dashboard_data, indent=2, default=str),
            "agent_address": "dashboard_server",
            "timestamp": int(time.time())
        })
        
    except Exception as e:
        print(f"Error in dashboard endpoint: {str(e)}")
        return jsonify({
            "text": json.dumps({
                "error": f"Dashboard request failed: {str(e)}",
                "timestamp": int(time.time())
            }, indent=2),
            "agent_address": "dashboard_server", 
            "timestamp": int(time.time())
        }), 500

@app.route('/health', methods=['GET'])
def health_endpoint():
    """Health check endpoint"""
    return jsonify({
        "timestamp": int(time.time()),
        "text": "Dashboard server is healthy and ready",
        "agent_address": "dashboard_server"
    })

if __name__ == '__main__':
    print("=" * 60)
    print("DASHBOARD API SERVER")
    print("=" * 60)
    print("Starting Flask dashboard server...")
    print("Available endpoints:")
    print("  POST http://127.0.0.1:5000/dashboard - Get dashboard data")
    print("  GET  http://127.0.0.1:5000/health    - Health check")
    print()
    app.run(host='127.0.0.1', port=5000, debug=False)
from flask import Flask, request, jsonify
import asyncio
import json
import time
import sys
import os

# Add current directory to path for imports
sys.path.append(os.path.dirname(__file__))

# Import all available functions for comprehensive dashboard
try:
    # Portfolio functions
    from server import get_portfolio_summary
    from wallet_functions import get_eth_balance, get_transactions
    
    # Market functions  
    from market_functions import (
        get_coin_price, 
        get_coin_market_data, 
        get_multiple_coin_prices
    )
    
    # Fear & Greed Index functions
    from fgi_functions import (
        get_fear_greed_index, 
        get_fear_greed_history,
        interpret_fgi_value
    )
    
    # Correlation functions
    from correlation_functions import get_crypto_correlations, interpret_correlation
    
    # All available server functions
    from server import (
        get_crypto_price,
        get_crypto_market_data, 
        get_multiple_crypto_prices,
        get_fear_greed_index as server_fgi,
        get_fear_greed_history as server_fgi_history,
        get_coin_correlations,
        get_intelligent_crypto_analysis,
        get_ai_portfolio_recommendation,
        get_metta_knowledge_status
    )
    
    DASHBOARD_AVAILABLE = True
    print("✅ All dashboard functions imported successfully")
except ImportError as e:
    DASHBOARD_AVAILABLE = False
    print(f"❌ Dashboard functions import failed: {e}")

async def create_comprehensive_dashboard_data(wallet_address: str):
    """Create comprehensive dashboard data with all available information"""
    dashboard_data = {
        "timestamp": int(time.time()),
        "wallet_address": wallet_address,
        "portfolio": {},
        "market_data": {},
        "sentiment": {},
        "correlations": {},
        "ai_insights": {},
        "system_status": {}
    }
    
    try:
        print(f"🔍 Gathering comprehensive data for {wallet_address}")
        
        # === PORTFOLIO DATA ===
        print("📊 Getting portfolio data...")
        try:
            balance = await get_eth_balance(wallet_address)
            transactions = await get_transactions(wallet_address)
            eth_price = await get_coin_price("ETH")
            
            dashboard_data["portfolio"] = {
                "wallet_address": wallet_address,
                "network": "Ethereum Mainnet",
                "total_balance_eth": float(balance),
                "total_balance_usd": float(balance * eth_price) if eth_price else None,
                "eth_price": float(eth_price) if eth_price else None,
                "transaction_count": len(transactions) if transactions else 0,
                "recent_transactions": []
            }
            
            # Add recent transactions
            if transactions:
                for tx in transactions[:10]:  # Top 10 transactions
                    tx_data = {
                        "hash": tx.get('hash', 'N/A') if isinstance(tx, dict) else getattr(tx, 'hash', 'N/A'),
                        "value_eth": float(tx.get('value_eth', 0)) if isinstance(tx, dict) else float(getattr(tx, 'value_eth', 0)),
                        "value_usd": None
                    }
                    if eth_price and tx_data['value_eth']:
                        tx_data['value_usd'] = tx_data['value_eth'] * float(eth_price)
                    dashboard_data["portfolio"]["recent_transactions"].append(tx_data)
                    
        except Exception as e:
            dashboard_data["portfolio"]["error"] = str(e)
        
        # === COMPREHENSIVE MARKET DATA ===
        print("💰 Getting market data for all major cryptocurrencies...")
        try:
            # Major cryptocurrencies to track
            major_coins = ["BTC", "ETH", "SOL", "ADA", "DOT", "MATIC", "AVAX", "LINK", "UNI", "AAVE"]
            
            # Get prices for all major coins
            prices_result = await get_multiple_coin_prices(major_coins)
            dashboard_data["market_data"]["current_prices"] = prices_result
            
            # Get detailed market data for top coins
            detailed_market = {}
            for coin in ["BTC", "ETH", "SOL"]:
                try:
                    market_data = await get_coin_market_data(coin)
                    detailed_market[coin] = market_data
                except:
                    detailed_market[coin] = {"error": "Failed to fetch"}
            
            dashboard_data["market_data"]["detailed_analysis"] = detailed_market
            
        except Exception as e:
            dashboard_data["market_data"]["error"] = str(e)
        
        # === MARKET SENTIMENT ===
        print("😱 Getting market sentiment data...")
        try:
            # Current Fear & Greed Index
            fgi_current = await get_fear_greed_index()
            fgi_history = await get_fear_greed_history(30)  # 30 days history
            
            dashboard_data["sentiment"] = {
                "current_fgi": fgi_current,
                "fgi_history": fgi_history,
                "interpretation": interpret_fgi_value(fgi_current.get('value', 50)) if fgi_current else None
            }
            
        except Exception as e:
            dashboard_data["sentiment"]["error"] = str(e)
        
        # === CORRELATION ANALYSIS ===
        print("🔗 Getting correlation analysis...")
        try:
            # Analyze correlations between major cryptocurrencies
            correlation_symbols = "BTC,ETH,SOL,ADA"
            correlations = await get_crypto_correlations(correlation_symbols, 30)
            
            dashboard_data["correlations"] = {
                "symbols_analyzed": correlation_symbols.split(","),
                "timeframe_days": 30,
                "correlation_data": correlations
            }
            
        except Exception as e:
            dashboard_data["correlations"]["error"] = str(e)
        
        # === AI INSIGHTS ===
        print("🤖 Getting AI insights...")
        try:
            # Get AI analysis for major coins
            ai_insights = {}
            
            # Bitcoin analysis
            btc_analysis = await get_intelligent_crypto_analysis("BTC")
            ai_insights["BTC_analysis"] = btc_analysis
            
            # Ethereum analysis  
            eth_analysis = await get_intelligent_crypto_analysis("ETH")
            ai_insights["ETH_analysis"] = eth_analysis
            
            # Portfolio recommendations
            portfolio_rec_conservative = await get_ai_portfolio_recommendation("conservative", 10000.0)
            portfolio_rec_aggressive = await get_ai_portfolio_recommendation("aggressive", 10000.0)
            
            ai_insights["portfolio_recommendations"] = {
                "conservative": portfolio_rec_conservative,
                "aggressive": portfolio_rec_aggressive
            }
            
            dashboard_data["ai_insights"] = ai_insights
            
        except Exception as e:
            dashboard_data["ai_insights"]["error"] = str(e)
        
        # === SYSTEM STATUS ===
        print("⚙️ Getting system status...")
        try:
            metta_status = await get_metta_knowledge_status()
            dashboard_data["system_status"] = {
                "metta_knowledge_graph": metta_status,
                "data_sources": {
                    "coingecko": "active",
                    "etherscan": "active", 
                    "fear_greed_api": "active"
                }
            }
            
        except Exception as e:
            dashboard_data["system_status"]["error"] = str(e)
        
        print("✅ Comprehensive dashboard data complete!")
        return dashboard_data
        
    except Exception as e:
        return {
            "error": f"Failed to create comprehensive dashboard: {str(e)}",
            "wallet_address": wallet_address,
            "timestamp": int(time.time())
        }

app = Flask(__name__)

# Manual CORS handling - disable all restrictions
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', '*')
    response.headers.add('Access-Control-Allow-Methods', '*')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    response.headers.add('Access-Control-Max-Age', '86400')
    return response

# Handle preflight OPTIONS requests
@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        response = jsonify({'status': 'ok'})
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add('Access-Control-Allow-Headers', "*")
        response.headers.add('Access-Control-Allow-Methods', "*")
        return response

@app.route('/dashboard/<wallet_address>', methods=['GET'])
def dashboard_endpoint(wallet_address):
    """
    Get comprehensive dashboard data for a wallet address.
    Simple GET request: /dashboard/0x123...wallet_address
    """
    try:
        wallet_address = wallet_address.strip()
        print(f"Dashboard request for wallet: {wallet_address}")
        
        if not wallet_address:
            return jsonify({
                "error": "Wallet address is required",
                "timestamp": int(time.time())
            }), 400
        
        if not DASHBOARD_AVAILABLE:
            return jsonify({
                "error": "Dashboard function not available", 
                "timestamp": int(time.time())
            }), 500
        
        # Run the comprehensive dashboard function
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            dashboard_data = loop.run_until_complete(create_comprehensive_dashboard_data(wallet_address))
        finally:
            loop.close()
        
        print(f"Dashboard data generated successfully for {wallet_address}")
        
        # Return dashboard data directly as JSON
        return jsonify(dashboard_data)
        
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
    print("  GET http://127.0.0.1:5000/dashboard/<wallet_address> - Get dashboard data")
    print("  GET http://127.0.0.1:5000/health                     - Health check")
    print()
    print("Example usage:")
    print("  curl http://127.0.0.1:5000/dashboard/0x742d35Cc6C8F2B2E9E5B2F2F4F6F2F2F2F2F2F2F")
    print()
    app.run(host='127.0.0.1', port=5000, debug=False)
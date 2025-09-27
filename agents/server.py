from typing import Any
import os
import sys
import time
from mcp.server.fastmcp import FastMCP
from wallet_functions import get_eth_balance, get_transactions
from market_functions import get_coin_price, get_coin_market_data, get_multiple_coin_prices
from fgi_functions import get_fear_greed_index as fetch_fgi, get_fear_greed_history as fetch_fgi_history, interpret_fgi_value
from correlation_functions import get_crypto_correlations, interpret_correlation

# Add parent directory to path for metta_kg import
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

# Try to import MeTTa Knowledge Graph (optional enhancement)
try:
    from metta_kg.knowledge_graph import DeFiKnowledgeGraph
    from metta_kg.utils import format_risk_level, interpret_market_condition, format_portfolio_allocation
    METTA_AVAILABLE = True
    print("✅ MeTTa Knowledge Graph: ENABLED")
except ImportError as e:
    METTA_AVAILABLE = False
    print(f"⚠️  MeTTa Knowledge Graph: DISABLED ({e})")
    print("   Enhanced features not available. Install with: pip install hyperon")

# Create a FastMCP server instance
mcp = FastMCP("wallet-market-fgi")

# Global session storage (in production, use Redis or database)
user_sessions = {}

# Initialize MeTTa Knowledge Graph (optional)
knowledge_graph = None
if METTA_AVAILABLE:
    try:
        knowledge_graph = DeFiKnowledgeGraph()
        if knowledge_graph.is_available():
            print("🧠 Knowledge Graph initialized with symbolic reasoning capabilities")
            # Clean up any expired sessions on startup
            knowledge_graph.cleanup_expired_sessions()
        else:
            print("⚠️  Knowledge Graph initialized in fallback mode (MeTTa not available)")
    except Exception as e:
        print(f"⚠️  Failed to initialize Knowledge Graph: {e}")
        METTA_AVAILABLE = False

def get_coin_name(symbol):
    """Get human-readable name for cryptocurrency symbol."""
    coin_names = {
        'BTC': 'Bitcoin',
        'ETH': 'Ethereum', 
        'SOL': 'Solana',
        'ADA': 'Cardano',
        'DOT': 'Polkadot',
        'MATIC': 'Polygon',
        'AVAX': 'Avalanche',
        'LINK': 'Chainlink',
        'UNI': 'Uniswap',
        'LTC': 'Litecoin'
    }
    return coin_names.get(symbol.upper(), symbol.upper())

@mcp.tool()
async def create_user_session(session_id: str, wallet_address: str, risk_profile: str = "moderate") -> str:
    """Create a user session with wallet address. This should be called when user connects their wallet."""
    try:
        if not knowledge_graph or not knowledge_graph.is_available():
            return "Knowledge Graph not available. Session management disabled."
        
        # Validate wallet address format
        if not wallet_address.startswith('0x') or len(wallet_address) != 42:
            return "Invalid wallet address format. Please provide a valid Ethereum address."
        
        # Create preferences
        preferences = {
            'risk_profile': risk_profile,
            'created_via': 'wallet_connection'
        }
        
        success = knowledge_graph.create_user_session(session_id, wallet_address, preferences)
        
        if success:
            result = f"✅ User session created successfully!\n"
            result += f"Session ID: {session_id}\n"
            result += f"Wallet: {wallet_address}\n"
            result += f"Risk Profile: {risk_profile}\n"
            result += f"Now I can help you with portfolio analysis without asking for your wallet address repeatedly!"
            return result
        else:
            return "❌ Failed to create user session. Please try again."
            
    except Exception as e:
        return f"Error creating user session: {str(e)}"

@mcp.tool()
async def get_session_info(session_id: str) -> str:
    """Get information about the current user session."""
    try:
        if not knowledge_graph or not knowledge_graph.is_available():
            return "Knowledge Graph not available. Session management disabled."
        
        summary = knowledge_graph.get_session_summary(session_id)
        
        if not summary.get('session_active'):
            return f"No active session found for ID: {session_id}. Please connect your wallet first."
        
        result = f"📊 Session Information:\n"
        result += f"Session ID: {session_id}\n"
        result += f"Wallet Address: {summary.get('wallet_address', 'Not found')}\n"
        result += f"Risk Profile: {summary.get('preferences', {}).get('risk_profile', 'Not set')}\n"
        result += f"Session Active: {summary.get('session_active', False)}\n"
        result += f"Last Active: {summary.get('last_active', 'Unknown')}\n"
        
        cache_status = summary.get('cache_status', {})
        result += f"\n💾 Cache Status:\n"
        result += f"Cached Symbols: {len(cache_status.get('cached_symbols', []))}\n"
        if cache_status.get('cached_symbols'):
            result += f"Symbols: {', '.join(cache_status['cached_symbols'])}\n"
        result += f"Cache Duration: {cache_status.get('cache_duration_minutes', 0)} minutes\n"
        
        return result
        
    except Exception as e:
        return f"Error retrieving session info: {str(e)}"

@mcp.tool()
async def get_wallet_balance(wallet_address: str = None, session_id: str = None) -> str:
    """Get ETH balance for a wallet address with USD equivalent. Can use session_id instead of wallet_address if user is already connected."""
    try:
        # Try to get wallet from session if not provided
        if not wallet_address and session_id and knowledge_graph:
            wallet_address = knowledge_graph.get_user_wallet(session_id)
            if not wallet_address:
                return "❌ No wallet address found in session. Please provide wallet_address or connect your wallet first using create_user_session."
        
        if not wallet_address:
            return "❌ Please provide either wallet_address or session_id with active session."
            
        balance = await get_eth_balance(wallet_address)
        # Get transaction count for portfolio summary
        transactions = await get_transactions(wallet_address)
        transaction_count = len(transactions) if transactions else 0
        
        # Try to get ETH price from cache first
        eth_price = None
        balance_usd = None
        
        if knowledge_graph and knowledge_graph.is_available():
            cached_data = knowledge_graph.get_cached_market_data("ETH")
            if cached_data and 'current_price' in cached_data:
                eth_price = cached_data['current_price']
                balance_usd = balance * eth_price
                print("💰 Using cached ETH price for balance calculation")
        
        # Fallback to API if no cached price
        if eth_price is None:
            try:
                eth_price = await get_coin_price("ETH")
                balance_usd = balance * eth_price
                
                # Cache the price data
                if knowledge_graph and knowledge_graph.is_available():
                    knowledge_graph.cache_market_data("ETH", {
                        'current_price': eth_price,
                        'symbol': 'ETH'
                    })
            except Exception as price_error:
                print(f"⚠️  Failed to fetch ETH price: {price_error}")
        
        result = f"💼 Wallet Balance Information:\n"
        result += f"Address: {wallet_address}\n"
        result += f"ETH Balance: {balance} ETH\n"
        
        if balance_usd is not None and eth_price is not None:
            result += f"USD Equivalent: ${balance_usd:,.2f} USD (at ${eth_price:,.2f} per ETH)\n"
        else:
            result += f"USD Equivalent: Unable to fetch current ETH price\n"
            
        result += f"Total Transactions: {transaction_count}\n"
        
        if session_id:
            result += f"\n🔗 Retrieved using session: {session_id[:8]}...\n"
        
        return result
    except Exception as e:
        return f"Error fetching wallet balance: {str(e)}. Please check the address and try again."

@mcp.tool()
async def get_wallet_transactions(wallet_address: str) -> str:
    """Get recent transactions for a wallet address with USD equivalent balances."""
    try:
        balance = await get_eth_balance(wallet_address)
        transactions = await get_transactions(wallet_address)
        transaction_count = len(transactions) if transactions else 0
        
        # Get current ETH price for USD conversion
        try:
            eth_price = await get_coin_price("ETH")
            balance_usd = balance * eth_price
        except Exception as price_error:
            eth_price = None
            balance_usd = None
        
        result = f"Wallet Transaction Summary:\n"
        result += f"Address: {wallet_address}\n"
        result += f"Current ETH Balance: {balance} ETH\n"
        
        if balance_usd is not None and eth_price is not None:
            result += f"Current USD Value: ${balance_usd:,.2f} USD (at ${eth_price:,.2f} per ETH)\n"
        else:
            result += f"Current USD Value: Unable to fetch current ETH price\n"
            
        result += f"Total Transactions: {transaction_count}\n"
        
        if transactions:
            result += "\nRecent Transactions:\n"
            for i, tx in enumerate(transactions[:5]):  # Show first 5 transactions
                tx_value = tx.get('value_eth', 0) if isinstance(tx, dict) else getattr(tx, 'value_eth', 0)
                tx_hash = tx.get('hash', 'N/A') if isinstance(tx, dict) else getattr(tx, 'hash', 'N/A')
                
                result += f"{i+1}. Hash: {tx_hash[:20]}...\n"
                result += f"   Value: {tx_value} ETH"
                
                # Convert transaction value to USD if we have the price
                if eth_price is not None and tx_value:
                    tx_value_usd = float(tx_value) * eth_price
                    result += f" (${tx_value_usd:,.2f} USD)\n"
                else:
                    result += "\n"
        
        return result
    except Exception as e:
        return f"Error fetching wallet transactions: {str(e)}. Please check the address and try again."

@mcp.tool()
async def get_crypto_price(coin_symbol: str) -> str:
    """Get current price for a cryptocurrency (BTC, ETH, SOL, etc.). Uses cached data when available to reduce API calls."""
    try:
        coin_symbol = coin_symbol.upper()
        coin_name = get_coin_name(coin_symbol)
        
        # Try to get price from cache first
        price = None
        source = "API"
        
        if knowledge_graph and knowledge_graph.is_available():
            cached_data = knowledge_graph.get_cached_market_data(coin_symbol)
            if cached_data and 'current_price' in cached_data:
                price = cached_data['current_price']
                source = "Cache"
                
        # Fallback to API if no cached price
        if price is None:
            price = await get_coin_price(coin_symbol)
            
            # Cache the new price data
            if knowledge_graph and knowledge_graph.is_available():
                knowledge_graph.cache_market_data(coin_symbol, {
                    'current_price': price,
                    'symbol': coin_symbol
                })
        
        result = f"💹 Current Price Information:\n"
        result += f"Coin: {coin_name} ({coin_symbol})\n"
        result += f"Price: ${price:,.2f} USD\n"
        result += f"Data Source: {source}\n"
        
        return result
    except Exception as e:
        return f"Error fetching price for {coin_symbol}: {str(e)}. Please try again."

@mcp.tool()
async def get_crypto_market_data(coin_symbol: str) -> str:
    """Get detailed market data including 7-day price history for a cryptocurrency."""
    try:
        data = await get_coin_market_data(coin_symbol)
        coin_name = get_coin_name(coin_symbol)
        
        result = f"Market Data for {coin_name} ({coin_symbol.upper()}):\n"
        result += f"Current Price: ${data['current_price']:,.2f} USD\n"
        
        if 'market_cap' in data:
            result += f"Market Cap: ${data['market_cap']:,.0f} USD\n"
        if 'price_change_24h' in data:
            result += f"24h Change: {data['price_change_24h']:+.2f}%\n"
        if 'volume_24h' in data:
            result += f"24h Volume: ${data['volume_24h']:,.0f} USD\n"
        
        return result
    except Exception as e:
        return f"Error fetching market data for {coin_symbol}: {str(e)}. Please try again."

@mcp.tool()
async def get_multiple_crypto_prices(coin_symbols: str) -> str:
    """Get current prices for multiple cryptocurrencies. Provide symbols separated by commas (e.g., 'BTC,ETH,SOL'). Uses cached data when available."""
    try:
        symbols = [s.strip().upper() for s in coin_symbols.split(',')]
        
        cached_prices = {}
        symbols_to_fetch = []
        
        # Check cache first
        if knowledge_graph and knowledge_graph.is_available():
            cached_prices = knowledge_graph.get_multiple_cached_prices(symbols)
            symbols_to_fetch = [symbol for symbol, price in cached_prices.items() if price is None]
            cached_count = len([p for p in cached_prices.values() if p is not None])
            
            if cached_count > 0:
                print(f"📊 Found {cached_count} prices in cache, need to fetch {len(symbols_to_fetch)} from API")
        else:
            symbols_to_fetch = symbols
        
        # Fetch missing prices from API
        api_prices = {}
        if symbols_to_fetch:
            api_prices = await get_multiple_coin_prices(symbols_to_fetch)
            
            # Cache the new prices
            if knowledge_graph and knowledge_graph.is_available():
                for symbol, price in api_prices.items():
                    knowledge_graph.cache_market_data(symbol, {
                        'current_price': price,
                        'symbol': symbol
                    })
        
        # Combine cached and API prices
        all_prices = {}
        for symbol in symbols:
            if symbol in cached_prices and cached_prices[symbol] is not None:
                all_prices[symbol] = {'price': cached_prices[symbol], 'source': 'Cache'}
            elif symbol in api_prices:
                all_prices[symbol] = {'price': api_prices[symbol], 'source': 'API'}
        
        if not all_prices:
            return "No prices found for the provided symbols. Please check the symbols and try again."
        
        result = "💹 Current Cryptocurrency Prices:\n\n"
        for symbol in symbols:
            if symbol in all_prices:
                coin_name = get_coin_name(symbol)
                price_info = all_prices[symbol]
                result += f"{coin_name} ({symbol}): ${price_info['price']:,.2f} USD ({price_info['source']})\n"
            else:
                result += f"{symbol}: Price not available\n"
        
        # Add cache efficiency info
        if knowledge_graph and knowledge_graph.is_available():
            cached_count = len([info for info in all_prices.values() if info['source'] == 'Cache'])
            if cached_count > 0:
                result += f"\n💾 Cache Efficiency: {cached_count}/{len(all_prices)} prices from cache"
        
        return result
    except Exception as e:
        return f"Error fetching multiple prices: {str(e)}. Please check the symbols and try again."

@mcp.tool()
async def get_fear_greed_index() -> str:
    """Get the current Fear & Greed Index for the cryptocurrency market."""
    try:
        fgi_data = await fetch_fgi()
        interpretation = interpret_fgi_value(fgi_data['value'])
        
        result = f"Current Fear & Greed Index:\n"
        result += f"Value: {fgi_data['value']}/100\n"
        result += f"Classification: {fgi_data['classification']}\n"
        result += f"Interpretation: {interpretation}\n"
        if fgi_data.get('time_until_update'):
            result += f"Next update in: {fgi_data['time_until_update']}\n"
        
        return result
    except Exception as e:
        return f"Error fetching Fear & Greed Index: {str(e)}. Please try again later."

@mcp.tool()
async def get_fear_greed_history(days: int = 7) -> str:
    """Get historical Fear & Greed Index data for the specified number of days (default: 7 days)."""
    try:
        if days < 1 or days > 365:
            days = 7  # Default fallback
            
        history = await fetch_fgi_history(days)
        
        result = f"Fear & Greed Index History (Last {days} days):\n\n"
        for i, entry in enumerate(history):
            result += f"Day {i+1}: {entry['value']}/100 - {entry['classification']}\n"
        
        # Calculate average
        if history:
            avg_value = sum(entry['value'] for entry in history) / len(history)
            result += f"\nAverage FGI over {days} days: {avg_value:.1f}/100\n"
            result += f"Average Sentiment: {interpret_fgi_value(int(avg_value))}\n"
        
        return result
    except Exception as e:
        return f"Error fetching Fear & Greed Index history: {str(e)}. Please try again later."

@mcp.tool()
async def get_portfolio_summary(wallet_address: str = None, session_id: str = None) -> str:
    """Get comprehensive portfolio summary with USD values and asset breakdown. Can use session_id instead of wallet_address if user is already connected."""
    try:
        # Try to get wallet from session if not provided
        if not wallet_address and session_id and knowledge_graph:
            wallet_address = knowledge_graph.get_user_wallet(session_id)
            if not wallet_address:
                return "❌ No wallet address found in session. Please provide wallet_address or connect your wallet first using create_user_session."
        
        if not wallet_address:
            return "❌ Please provide either wallet_address or session_id with active session."
            
        balance = await get_eth_balance(wallet_address)
        transactions = await get_transactions(wallet_address)
        transaction_count = len(transactions) if transactions else 0
        
        # Try to get ETH price from cache first
        eth_price = None
        total_balance_usd = None
        price_source = "API"
        
        if knowledge_graph and knowledge_graph.is_available():
            cached_data = knowledge_graph.get_cached_market_data("ETH")
            if cached_data and 'current_price' in cached_data:
                eth_price = cached_data['current_price']
                total_balance_usd = balance * eth_price
                price_source = "Cache"
        
        # Fallback to API if no cached price
        if eth_price is None:
            try:
                eth_price = await get_coin_price("ETH")
                total_balance_usd = balance * eth_price
                
                # Cache the price data
                if knowledge_graph and knowledge_graph.is_available():
                    knowledge_graph.cache_market_data("ETH", {
                        'current_price': eth_price,
                        'symbol': 'ETH'
                    })
            except Exception as price_error:
                print(f"⚠️  Failed to fetch ETH price: {price_error}")
        
        result = f"📊 Portfolio Summary:\n"
        result += f"Wallet Address: {wallet_address}\n"
        result += f"Network: Ethereum Mainnet\n"
        
        if session_id:
            result += f"Session: {session_id[:8]}...\n"
        
        result += "\n"
        
        # Total portfolio value
        if total_balance_usd is not None:
            result += f"💰 Total Portfolio Value: ${total_balance_usd:,.2f} USD\n\n"
        else:
            result += f"💰 Total Portfolio Value: Unable to calculate (ETH price unavailable)\n\n"
            
        # Asset breakdown
        result += f"📈 Assets:\n"
        result += f"• ETH: {balance} ETH"
        if eth_price is not None and total_balance_usd is not None:
            result += f" (${total_balance_usd:,.2f} USD, 100.0%)\n"
        else:
            result += f" (USD value unavailable)\n"
            
        result += f"\n📋 Transaction History:\n"
        result += f"Total Transactions: {transaction_count}\n"
        
        if transactions:
            result += f"\n🔄 Recent Activity:\n"
            for i, tx in enumerate(transactions[:3]):  # Show top 3 transactions
                tx_value = tx.get('value_eth', 0) if isinstance(tx, dict) else getattr(tx, 'value_eth', 0)
                tx_hash = tx.get('hash', 'N/A') if isinstance(tx, dict) else getattr(tx, 'hash', 'N/A')
                
                result += f"{i+1}. {tx_hash[:10]}... - {tx_value} ETH"
                
                # Convert transaction value to USD if we have the price
                if eth_price is not None and tx_value:
                    tx_value_usd = float(tx_value) * eth_price
                    result += f" (${tx_value_usd:,.2f} USD)\n"
                else:
                    result += "\n"
        
        if eth_price is not None:
            result += f"\n💹 Current ETH Price: ${eth_price:,.2f} USD ({price_source})\n"
            
        return result
    except Exception as e:
        return f"Error fetching portfolio summary: {str(e)}. Please check the address and try again."

@mcp.tool()
async def get_coin_correlations(symbols: str, days: int = 30) -> str:
    """Get correlation analysis between cryptocurrencies over a specified time period. Provide symbols separated by commas (e.g., 'BTC,ETH,SOL')."""
    try:
        # Parse and validate input
        if not symbols or not symbols.strip():
            return "Error: Please provide at least one cryptocurrency symbol."
        
        symbol_list = [s.strip().upper() for s in symbols.split(',') if s.strip()]
        
        if len(symbol_list) < 2:
            return "Error: At least 2 cryptocurrency symbols are required for correlation analysis."
        
        if len(symbol_list) > 10:
            return "Error: Maximum 10 cryptocurrency symbols allowed for correlation analysis."
        
        # Validate days parameter
        if days < 7:
            days = 7
        elif days > 365:
            days = 365
        
        # Fetch correlation data
        correlation_data = await get_crypto_correlations(symbol_list, days)
        
        result = f"Cryptocurrency Correlation Analysis:\n"
        result += f"Analysis Period: {days} days\n"
        result += f"Data Points: {correlation_data['data_points']}\n"
        result += f"Cryptocurrencies: {', '.join(correlation_data['symbols'])}\n\n"
        
        if not correlation_data['correlations']:
            return f"{result}No correlation data available for the provided symbols."
        
        result += "Correlation Matrix:\n"
        result += "-" * 50 + "\n"
        
        # Sort correlations by absolute value (strongest first)
        correlations = correlation_data['correlations']
        sorted_pairs = sorted(
            correlations.items(), 
            key=lambda x: abs(x[1]['correlation']) if x[1]['correlation'] is not None else 0, 
            reverse=True
        )
        
        for pair_key, corr_data in sorted_pairs:
            symbol1 = corr_data['symbol1']
            symbol2 = corr_data['symbol2']
            correlation = corr_data['correlation']
            
            if correlation is not None:
                # Format correlation with appropriate arrow and color indication
                if correlation >= 0.7:
                    arrow = "↗↗"  # Strong positive
                elif correlation >= 0.3:
                    arrow = "↗"   # Moderate positive
                elif correlation >= -0.3:
                    arrow = "↔"   # Weak/neutral
                elif correlation >= -0.7:
                    arrow = "↙"   # Moderate negative
                else:
                    arrow = "↙↙"  # Strong negative
                
                interpretation = interpret_correlation(correlation)
                result += f"{symbol1} {arrow} {symbol2}: {correlation:+.3f} ({interpretation})\n"
            else:
                error_msg = corr_data.get('error', 'calculation failed')
                result += f"{symbol1} ↔ {symbol2}: Error - {error_msg}\n"
        
        # Add summary insights
        valid_correlations = [
            corr_data['correlation'] 
            for corr_data in correlations.values() 
            if corr_data['correlation'] is not None
        ]
        
        if valid_correlations:
            avg_correlation = sum(valid_correlations) / len(valid_correlations)
            max_correlation = max(valid_correlations)
            min_correlation = min(valid_correlations)
            
            result += f"\nSummary Insights:\n"
            result += f"Average Correlation: {avg_correlation:+.3f}\n"
            result += f"Highest Correlation: {max_correlation:+.3f}\n"
            result += f"Lowest Correlation: {min_correlation:+.3f}\n"
            
            if avg_correlation >= 0.5:
                result += "Overall: Cryptocurrencies show strong positive correlation (tend to move together)\n"
            elif avg_correlation >= 0.2:
                result += "Overall: Cryptocurrencies show moderate positive correlation\n"
            elif avg_correlation >= -0.2:
                result += "Overall: Cryptocurrencies show weak correlation (relatively independent movements)\n"
            else:
                result += "Overall: Cryptocurrencies show negative correlation (tend to move in opposite directions)\n"
        
        return result
        
    except ValueError as ve:
        return f"Validation Error: {str(ve)}. Please check your input and try again."
    except Exception as e:
        return f"Error fetching correlation data: {str(e)}. Please try again later."

# ===== METTA KNOWLEDGE GRAPH ENHANCED TOOLS =====
# These tools provide additional AI-powered analysis when MeTTa is available

@mcp.tool()
async def get_intelligent_crypto_analysis(coin_symbol: str) -> str:
    """Get enhanced cryptocurrency analysis with AI-powered insights and risk assessment."""
    try:
        coin_symbol = coin_symbol.upper()
        coin_name = get_coin_name(coin_symbol)
        
        # Get basic market data (using existing functionality)
        try:
            market_data = await get_coin_market_data(coin_symbol)
            price = market_data['current_price']
        except Exception as e:
            return f"Error fetching market data for {coin_symbol}: {str(e)}"
        
        result = f"🧠 Enhanced Analysis for {coin_name} ({coin_symbol}):\\n\\n"
        
        # Market Data Section (existing functionality)
        result += f"📊 Current Market Data:\\n"
        result += f"Price: ${price:,.2f} USD\\n"
        if 'market_cap' in market_data:
            result += f"Market Cap: ${market_data['market_cap']:,.0f} USD\\n"
        if 'price_change_24h' in market_data:
            result += f"24h Change: {market_data['price_change_24h']:+.2f}%\\n"
        if 'volume_24h' in market_data:
            result += f"24h Volume: ${market_data['volume_24h']:,.0f} USD\\n"
        
        # Enhanced Analysis with MeTTa Knowledge (if available)
        if knowledge_graph and knowledge_graph.is_available():
            result += f"\\n🔍 AI-Powered Knowledge Analysis:\\n"
            
            # Update knowledge graph with fresh market data
            try:
                knowledge_graph.add_market_data(
                    coin_symbol, 
                    price,
                    market_data.get('volume_24h', 0),
                    market_data.get('market_cap', 0),
                    market_data.get('price_change_24h', 0)
                )
            except:
                pass  # Don't fail if market data update fails
            
            # Get comprehensive crypto info from knowledge graph
            crypto_info = knowledge_graph.query_crypto_info(coin_symbol)
            
            if crypto_info:
                if 'category' in crypto_info:
                    result += f"Category: {crypto_info['category'].title()}\\n"
                
                if 'risk_score' in crypto_info:
                    risk_score = crypto_info['risk_score']
                    risk_level = format_risk_level(risk_score)
                    result += f"Risk Assessment: {risk_level} (Score: {risk_score}/100)\\n"
                
                if 'volatility_level' in crypto_info and 'volatility_value' in crypto_info:
                    vol_level = crypto_info['volatility_level']
                    vol_value = crypto_info['volatility_value']
                    result += f"Volatility: {vol_level.title()} (~{vol_value}% annually)\\n"
            
            # Get market sentiment insights
            try:
                fgi_data = await fetch_fgi()
                fgi_value = fgi_data['value']
                market_condition = interpret_market_condition(fgi_value)
                market_insights = knowledge_graph.query_market_insights(fgi_value)
                
                result += f"\\n💭 Market Sentiment Analysis:\\n"
                result += f"Fear & Greed Index: {fgi_value}/100 ({market_condition['condition']} {market_condition['emoji']})\\n"
                result += f"Market Advice: {market_condition['advice']}\\n"
                
                # Show relevant insights for this specific coin
                relevant_insights = [insight for insight in market_insights if coin_symbol in insight]
                if relevant_insights:
                    result += f"\\n📈 {coin_symbol} Specific Insights:\\n"
                    for insight in relevant_insights[:2]:  # Show top 2 relevant insights
                        result += f"• {insight}\\n"
                        
            except Exception as e:
                result += f"• Market sentiment data unavailable: {str(e)}\\n"
        
        else:
            result += f"\\n⚠️  Enhanced AI analysis unavailable (MeTTa not installed)\\n"
            result += f"Install MeTTa for advanced risk assessment and market intelligence\\n"
        
        return result
        
    except Exception as e:
        return f"Error in intelligent analysis for {coin_symbol}: {str(e)}"

@mcp.tool()
async def get_ai_portfolio_recommendation(risk_profile: str, investment_amount: float = 10000.0) -> str:
    """Get AI-powered portfolio recommendations with risk assessment and market timing advice."""
    try:
        risk_profile = risk_profile.lower().strip()
        
        if risk_profile not in ['conservative', 'moderate', 'aggressive']:
            return "Error: Risk profile must be 'conservative', 'moderate', or 'aggressive'"
        
        result = f"🎯 AI-Powered Portfolio Recommendation:\\n"
        result += f"Risk Profile: {risk_profile.title()}\\n"
        result += f"Investment Amount: ${investment_amount:,.2f}\\n\\n"
        
        # Enhanced recommendations with MeTTa knowledge
        if knowledge_graph and knowledge_graph.is_available():
            allocation = knowledge_graph.get_portfolio_allocation(risk_profile)
            
            if not allocation:
                return f"Error: No allocation data available for {risk_profile} risk profile in knowledge graph"
            
            result += f"📋 AI-Recommended Allocation:\\n"
            formatted_allocation = format_portfolio_allocation(allocation, investment_amount)
            
            for item in formatted_allocation:
                symbol = item['symbol']
                percentage = item['percentage']
                amount = item.get('formatted_amount', f"${(percentage/100 * investment_amount):,.2f}")
                
                # Get risk indicator from knowledge graph
                crypto_info = knowledge_graph.query_crypto_info(symbol)
                risk_indicator = ""
                if 'risk_score' in crypto_info:
                    risk_score = crypto_info['risk_score']
                    risk_indicator = f" {format_risk_level(risk_score)}"
                
                coin_name = get_coin_name(symbol)
                result += f"• {symbol} ({coin_name}): {percentage}% ({amount}){risk_indicator}\\n"
            
            # Portfolio risk assessment
            risk_assessment = knowledge_graph.get_risk_assessment(allocation)
            
            result += f"\\n📊 Portfolio Risk Analysis:\\n"
            result += f"Overall Risk Score: {risk_assessment['total_risk_score']:.1f}/100\\n"
            result += f"Risk Level: {format_risk_level(risk_assessment['total_risk_score'])}\\n"
            result += f"Expected Portfolio Volatility: {risk_assessment['total_volatility']:.1f}%\\n"
            
            # Market timing advice
            try:
                fgi_data = await fetch_fgi()
                fgi_value = fgi_data['value']
                market_condition = interpret_market_condition(fgi_value)
                
                result += f"\\n⏰ Market Timing Advice:\\n"
                result += f"Current Market: {market_condition['condition']} {market_condition['emoji']} (FGI: {fgi_value})\\n"
                result += f"Investment Strategy: {market_condition['advice']}\\n"
                
                if market_condition['urgency'] == 'high':
                    result += f"⚡ High urgency - {market_condition['action']} opportunity!\\n"
                
            except Exception as e:
                result += f"• Market timing data unavailable: {str(e)}\\n"
            
            result += f"\\n💡 AI Recommendations:\\n"
            result += f"• Rebalance portfolio monthly during volatile periods\\n"
            result += f"• Monitor correlation changes during market stress\\n"
            result += f"• Maintain minimum 5-10% stablecoin allocation for opportunities\\n"
            result += f"• Consider dollar-cost averaging for large positions\\n"
        
        else:
            # Fallback recommendations without MeTTa
            result += f"⚠️  Basic recommendation (Enhanced AI unavailable)\\n\\n"
            if risk_profile == 'conservative':
                basic_allocation = {'BTC': 40, 'ETH': 30, 'USDC': 30}
            elif risk_profile == 'moderate':
                basic_allocation = {'BTC': 30, 'ETH': 35, 'SOL': 20, 'USDC': 15}
            else:  # aggressive
                basic_allocation = {'BTC': 20, 'ETH': 25, 'SOL': 25, 'ADA': 15, 'MATIC': 15}
            
            result += "Recommended Allocation:\\n"
            for symbol, percent in basic_allocation.items():
                amount = (percent / 100) * investment_amount
                coin_name = get_coin_name(symbol)
                result += f"• {symbol} ({coin_name}): {percent}% (${amount:,.2f})\\n"
        
        return result
        
    except Exception as e:
        return f"Error generating AI portfolio recommendation: {str(e)}"

@mcp.tool()
async def manage_cache(action: str = "status", symbol: str = None) -> str:
    """Manage market data cache. Actions: 'status', 'clear', 'clear_all', 'refresh'. Optional symbol parameter for specific operations."""
    try:
        if not knowledge_graph or not knowledge_graph.is_available():
            return "Knowledge Graph not available. Cache management disabled."
        
        if action == "status":
            # Show cache status
            cache_status = knowledge_graph.market_data_cache
            result = f"💾 Market Data Cache Status:\n"
            result += f"Cached Symbols: {len(cache_status)}\n"
            result += f"Cache Duration: {knowledge_graph.cache_duration // 60} minutes\n\n"
            
            if cache_status:
                result += f"📊 Cached Data:\n"
                for symbol, cache_entry in cache_status.items():
                    age_seconds = time.time() - cache_entry['timestamp']
                    age_minutes = int(age_seconds // 60)
                    price = cache_entry['data'].get('current_price', 'N/A')
                    result += f"• {symbol}: ${price:,.2f} USD (Age: {age_minutes}m {int(age_seconds % 60)}s)\n"
            else:
                result += "No cached data available.\n"
                
            return result
            
        elif action == "clear" and symbol:
            # Clear specific symbol cache
            symbol = symbol.upper()
            knowledge_graph.invalidate_cache(symbol)
            return f"✅ Cleared cache for {symbol}"
            
        elif action == "clear_all":
            # Clear all cache
            knowledge_graph.invalidate_cache()
            return "✅ Cleared all market data cache"
            
        elif action == "refresh" and symbol:
            # Refresh specific symbol (clear cache and fetch new data)
            symbol = symbol.upper()
            knowledge_graph.invalidate_cache(symbol)
            
            # Fetch fresh data
            try:
                price = await get_coin_price(symbol)
                knowledge_graph.cache_market_data(symbol, {
                    'current_price': price,
                    'symbol': symbol
                })
                return f"🔄 Refreshed {symbol}: ${price:,.2f} USD"
            except Exception as e:
                return f"❌ Failed to refresh {symbol}: {e}"
                
        else:
            return "❌ Invalid action. Use: 'status', 'clear' (with symbol), 'clear_all', or 'refresh' (with symbol)"
            
    except Exception as e:
        return f"Error managing cache: {str(e)}"

@mcp.tool()
async def cleanup_sessions(max_age_hours: int = 24) -> str:
    """Cleanup expired user sessions and cache data. Default: remove sessions older than 24 hours."""
    try:
        if not knowledge_graph or not knowledge_graph.is_available():
            return "Knowledge Graph not available. Session cleanup disabled."
            
        cleaned_count = knowledge_graph.cleanup_expired_sessions(max_age_hours)
        
        if cleaned_count > 0:
            return f"🧹 Cleanup completed! Removed {cleaned_count} expired sessions and old cache entries."
        else:
            return f"✅ No expired sessions found. System is clean!"
            
    except Exception as e:
        return f"Error during cleanup: {str(e)}"

@mcp.tool()
async def get_metta_knowledge_status() -> str:
    """Get status and capabilities of the MeTTa Knowledge Graph system."""
    try:
        result = f"🧠 MeTTa Knowledge Graph Status:\\n\\n"
        
        if knowledge_graph and knowledge_graph.is_available():
            result += f"✅ Status: Active and Operational\\n"
            result += f"✅ Symbolic Reasoning: Enabled\\n"
            result += f"✅ Market Intelligence: Available\\n\\n"
            
            # Get knowledge statistics
            summary = knowledge_graph.get_knowledge_summary()
            
            result += f"📊 Knowledge Base Statistics:\\n"
            result += f"• Cryptocurrencies: {summary.get('cryptocurrencies', 0)}\\n"
            result += f"• Correlation relationships: {summary.get('correlations', 0)}\\n"
            result += f"• Risk assessments: {summary.get('risk_assessments', 0)}\\n\\n"
            
            result += f"🚀 Enhanced Capabilities Available:\\n"
            result += f"• Intelligent crypto analysis with risk scoring\\n"
            result += f"• AI-powered portfolio recommendations\\n"
            result += f"• Market sentiment integration (Fear & Greed Index)\\n"
            result += f"• Multi-factor risk assessment\\n"
            result += f"• Correlation-aware portfolio construction\\n"
            result += f"• Symbolic reasoning for complex decisions\\n\\n"
            
            result += f"📈 Supported Assets:\\n"
            supported_assets = [
                "BTC (Bitcoin) - Layer 1", "ETH (Ethereum) - Layer 1", 
                "SOL (Solana) - Layer 1", "ADA (Cardano) - Layer 1",
                "DOT (Polkadot) - Layer 1", "AVAX (Avalanche) - Layer 1",
                "MATIC (Polygon) - Layer 2", "UNI (Uniswap) - DeFi",
                "LINK (Chainlink) - DeFi Oracle", "DOGE (Dogecoin) - Memecoin",
                "USDC (USD Coin) - Stablecoin", "USDT (Tether) - Stablecoin"
            ]
            
            for i, asset in enumerate(supported_assets, 1):
                result += f"{i:2d}. {asset}\\n"
                
        elif METTA_AVAILABLE:
            result += f"⚠️  Status: Initialized but MeTTa unavailable\\n"
            result += f"❌ Symbolic Reasoning: Disabled\\n"
            result += f"⚠️  Running in fallback mode\\n\\n"
            result += f"Issue: MeTTa package installed but not functional\\n"
            
        else:
            result += f"❌ Status: Not Available\\n"
            result += f"❌ Symbolic Reasoning: Disabled\\n"
            result += f"❌ Enhanced Analysis: Unavailable\\n\\n"
            result += f"📦 Installation Instructions:\\n"
            result += f"1. pip install hyperon\\n"
            result += f"2. Restart the MCP server\\n"
            result += f"3. Run get_metta_knowledge_status() to verify\\n\\n"
        
        result += f"🔧 Available MCP Tools (Always Available):\\n"
        result += f"• get_wallet_balance() - Wallet information\\n"
        result += f"• get_crypto_price() - Current prices\\n"
        result += f"• get_coin_correlations() - Correlation analysis\\n"
        result += f"• get_fear_greed_index() - Market sentiment\\n"
        result += f"• get_portfolio_summary() - Wallet analysis\\n"
        
        if knowledge_graph and knowledge_graph.is_available():
            result += f"\\n🚀 Enhanced MCP Tools (MeTTa-Powered):\\n"
            result += f"• get_intelligent_crypto_analysis() - AI analysis\\n"
            result += f"• get_ai_portfolio_recommendation() - Smart allocation\\n"
        
        return result
        
    except Exception as e:
        return f"Error checking MeTTa knowledge status: {str(e)}"

if __name__ == "__main__":
    print("🚀 Starting Enhanced DeFi Portfolio Manager MCP Agent")
    print(f"📡 Server: wallet-market-fgi with {len(mcp._tools)} MCP tools")
    
    # Show MeTTa status
    if METTA_AVAILABLE and knowledge_graph and knowledge_graph.is_available():
        print("🧠 AI Enhancement: MeTTa Knowledge Graph ACTIVE")
        print("   ✅ Symbolic reasoning enabled")
        print("   ✅ Intelligent portfolio recommendations")
        print("   ✅ Risk assessment with market sentiment")
        summary = knowledge_graph.get_knowledge_summary()
        print(f"   📊 Knowledge: {summary.get('cryptocurrencies', 0)} assets, {summary.get('correlations', 0)} correlations")
    elif METTA_AVAILABLE:
        print("⚠️  AI Enhancement: MeTTa installed but not functional")
        print("   🔄 Running in fallback mode")
    else:
        print("💡 AI Enhancement: Install 'pip install hyperon' for advanced features")
    
    print("\\n🔧 Available Enhanced Tools:")
    print("   • get_intelligent_crypto_analysis() - AI-powered crypto analysis")
    print("   • get_ai_portfolio_recommendation() - Smart portfolio allocation") 
    print("   • get_metta_knowledge_status() - Check AI system status")
    print("\\n🔗 Standard Tools: wallet balance, prices, correlations, market data")
    print("\\n" + "="*60)
    
    # Initialize and run the server
    mcp.run(transport='stdio')
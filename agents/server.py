from typing import Any
import os
from mcp.server.fastmcp import FastMCP
from wallet_functions import get_eth_balance, get_transactions
from market_functions import get_coin_price, get_coin_market_data, get_multiple_coin_prices
from fgi_functions import get_fear_greed_index as fetch_fgi, get_fear_greed_history as fetch_fgi_history, interpret_fgi_value

# Create a FastMCP server instance
mcp = FastMCP("wallet-market-fgi")

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
async def get_wallet_balance(wallet_address: str) -> str:
    """Get ETH balance for a wallet address with USD equivalent."""
    try:
        balance = await get_eth_balance(wallet_address)
        # Get transaction count for portfolio summary
        transactions = await get_transactions(wallet_address)
        transaction_count = len(transactions) if transactions else 0
        
        # Get current ETH price for USD conversion
        try:
            eth_price = await get_coin_price("ETH")
            balance_usd = balance * eth_price
        except Exception as price_error:
            eth_price = None
            balance_usd = None
        
        result = f"Wallet Balance Information:\n"
        result += f"Address: {wallet_address}\n"
        result += f"ETH Balance: {balance} ETH\n"
        
        if balance_usd is not None and eth_price is not None:
            result += f"USD Equivalent: ${balance_usd:,.2f} USD (at ${eth_price:,.2f} per ETH)\n"
        else:
            result += f"USD Equivalent: Unable to fetch current ETH price\n"
            
        result += f"Total Transactions: {transaction_count}\n"
        
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
    """Get current price for a cryptocurrency (BTC, ETH, SOL, etc.)."""
    try:
        price = await get_coin_price(coin_symbol)
        coin_name = get_coin_name(coin_symbol)
        
        result = f"Current Price Information:\n"
        result += f"Coin: {coin_name} ({coin_symbol.upper()})\n"
        result += f"Price: ${price:,.2f} USD\n"
        
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
    """Get current prices for multiple cryptocurrencies. Provide symbols separated by commas (e.g., 'BTC,ETH,SOL')."""
    try:
        symbols = [s.strip() for s in coin_symbols.split(',')]
        prices = await get_multiple_coin_prices(symbols)
        
        if not prices:
            return "No prices found for the provided symbols. Please check the symbols and try again."
        
        result = "Current Cryptocurrency Prices:\n\n"
        for symbol, price in prices.items():
            coin_name = get_coin_name(symbol)
            result += f"{coin_name} ({symbol.upper()}): ${price:,.2f} USD\n"
        
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
async def get_portfolio_summary(wallet_address: str) -> str:
    """Get comprehensive portfolio summary with USD values and asset breakdown."""
    try:
        balance = await get_eth_balance(wallet_address)
        transactions = await get_transactions(wallet_address)
        transaction_count = len(transactions) if transactions else 0
        
        # Get current ETH price for USD conversion
        try:
            eth_price = await get_coin_price("ETH")
            total_balance_usd = balance * eth_price
        except Exception as price_error:
            eth_price = None
            total_balance_usd = None
        
        result = f"Portfolio Summary:\n"
        result += f"Wallet Address: {wallet_address}\n"
        result += f"Network: Ethereum Mainnet\n\n"
        
        # Total portfolio value
        if total_balance_usd is not None:
            result += f"Total Portfolio Value: ${total_balance_usd:,.2f} USD\n\n"
        else:
            result += f"Total Portfolio Value: Unable to calculate (ETH price unavailable)\n\n"
            
        # Asset breakdown
        result += f"Assets:\n"
        result += f"• ETH: {balance} ETH"
        if eth_price is not None and total_balance_usd is not None:
            result += f" (${total_balance_usd:,.2f} USD, 100.0%)\n"
        else:
            result += f" (USD value unavailable)\n"
            
        result += f"\nTransaction History:\n"
        result += f"Total Transactions: {transaction_count}\n"
        
        if transactions:
            result += f"\nRecent Activity:\n"
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
            result += f"\nCurrent ETH Price: ${eth_price:,.2f} USD\n"
            
        return result
    except Exception as e:
        return f"Error fetching portfolio summary: {str(e)}. Please check the address and try again."

if __name__ == "__main__":
    # Initialize and run the server
    mcp.run(transport='stdio')
"""
Cryptocurrency correlation functions for the MCP server.
Fetches correlation data between different cryptocurrencies.
"""

import aiohttp
import asyncio
from typing import Dict, List, Any
import json

async def get_crypto_correlations(symbols: List[str], days: int = 30) -> Dict[str, Any]:
    """
    Get correlation matrix for cryptocurrency pairs over specified time period.
    Uses CoinGecko API for price data and calculates correlations.
    
    Args:
        symbols: List of cryptocurrency symbols (e.g., ['BTC', 'ETH', 'SOL'])
        days: Number of days to look back for correlation calculation
        
    Returns:
        Dictionary containing correlation data between coin pairs
    """
    
    # Mapping of symbols to CoinGecko IDs
    symbol_to_id = {
        'BTC': 'bitcoin',
        'ETH': 'ethereum',
        'SOL': 'solana',
        'ADA': 'cardano',
        'DOT': 'polkadot',
        'MATIC': 'matic-network',
        'AVAX': 'avalanche-2',
        'LINK': 'chainlink',
        'UNI': 'uniswap',
        'LTC': 'litecoin',
        'DOGE': 'dogecoin',
        'XRP': 'ripple',
        'BNB': 'binancecoin',
        'USDC': 'usd-coin',
        'USDT': 'tether'
    }
    
    # Convert symbols to CoinGecko IDs
    coin_ids = []
    valid_symbols = []
    
    for symbol in symbols:
        symbol_upper = symbol.upper()
        if symbol_upper in symbol_to_id:
            coin_ids.append(symbol_to_id[symbol_upper])
            valid_symbols.append(symbol_upper)
    
    if len(coin_ids) < 2:
        raise ValueError("At least 2 valid cryptocurrency symbols are required for correlation analysis")
    
    # Limit days to reasonable range
    days = max(7, min(days, 365))
    
    async with aiohttp.ClientSession() as session:
        # Fetch historical price data for each coin
        price_data = {}
        
        for i, coin_id in enumerate(coin_ids):
            symbol = valid_symbols[i]
            url = f"https://api.coingecko.com/api/v3/coins/{coin_id}/market_chart"
            params = {
                'vs_currency': 'usd',
                'days': str(days),
                'interval': 'daily'
            }
            
            try:
                async with session.get(url, params=params, timeout=10) as response:
                    if response.status == 200:
                        data = await response.json()
                        if 'prices' in data and data['prices']:
                            # Extract daily closing prices
                            prices = [price[1] for price in data['prices']]
                            price_data[symbol] = prices
                        else:
                            raise ValueError(f"No price data available for {symbol}")
                    else:
                        raise ValueError(f"Failed to fetch data for {symbol}: HTTP {response.status}")
                        
            except asyncio.TimeoutError:
                raise ValueError(f"Timeout while fetching data for {symbol}")
            except Exception as e:
                raise ValueError(f"Error fetching data for {symbol}: {str(e)}")
        
        # Calculate correlations between all pairs
        correlations = {}
        
        for i, symbol1 in enumerate(valid_symbols):
            for j, symbol2 in enumerate(valid_symbols[i+1:], i+1):
                try:
                    correlation = calculate_correlation(price_data[symbol1], price_data[symbol2])
                    pair_key = f"{symbol1}_{symbol2}"
                    correlations[pair_key] = {
                        'symbol1': symbol1,
                        'symbol2': symbol2,
                        'correlation': correlation,
                        'days': days
                    }
                except Exception as e:
                    # If correlation calculation fails, set to None
                    pair_key = f"{symbol1}_{symbol2}"
                    correlations[pair_key] = {
                        'symbol1': symbol1,
                        'symbol2': symbol2,
                        'correlation': None,
                        'days': days,
                        'error': str(e)
                    }
    
    return {
        'correlations': correlations,
        'symbols': valid_symbols,
        'days': days,
        'data_points': len(price_data.get(valid_symbols[0], [])) if valid_symbols else 0
    }

def calculate_correlation(prices1: List[float], prices2: List[float]) -> float:
    """
    Calculate Pearson correlation coefficient between two price series.
    
    Args:
        prices1: List of prices for first cryptocurrency
        prices2: List of prices for second cryptocurrency
        
    Returns:
        Correlation coefficient between -1 and 1
    """
    if len(prices1) != len(prices2) or len(prices1) < 2:
        raise ValueError("Price series must have same length and at least 2 data points")
    
    n = len(prices1)
    
    # Calculate means
    mean1 = sum(prices1) / n
    mean2 = sum(prices2) / n
    
    # Calculate correlation coefficient
    numerator = sum((prices1[i] - mean1) * (prices2[i] - mean2) for i in range(n))
    
    sum_sq1 = sum((prices1[i] - mean1) ** 2 for i in range(n))
    sum_sq2 = sum((prices2[i] - mean2) ** 2 for i in range(n))
    
    denominator = (sum_sq1 * sum_sq2) ** 0.5
    
    if denominator == 0:
        return 0.0
    
    correlation = numerator / denominator
    
    # Ensure result is within valid range
    return max(-1.0, min(1.0, correlation))

def interpret_correlation(correlation: float) -> str:
    """
    Interpret correlation coefficient with descriptive text.
    
    Args:
        correlation: Correlation coefficient between -1 and 1
        
    Returns:
        String description of correlation strength and direction
    """
    abs_corr = abs(correlation)
    direction = "positive" if correlation >= 0 else "negative"
    
    if abs_corr >= 0.9:
        strength = "very strong"
    elif abs_corr >= 0.7:
        strength = "strong"
    elif abs_corr >= 0.5:
        strength = "moderate"
    elif abs_corr >= 0.3:
        strength = "weak"
    else:
        strength = "very weak"
    
    return f"{strength} {direction} correlation"
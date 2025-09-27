# market_functions.py

import os
import time
import asyncio
from typing import List, Optional
from datetime import datetime
import httpx
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# ====== 📚 CONFIGURATION ======
COINGECKO_API_URL = "https://api.coingecko.com/api/v3"
COIN_GECKO_IDS = {
    "BTC": "bitcoin",
    "ETH": "ethereum",
    "SOL": "solana",
    "MATIC": "matic-network",
    "USDC": "usd-coin",
    "ADA": "cardano",
    "DOT": "polkadot",
    "LINK": "chainlink",
    "UNI": "uniswap",
    "AVAX": "avalanche-2"
}

class PriceDataPoint:
    """Represents a single price point in time for historical data."""
    def __init__(self, timestamp: int, price: float):
        self.timestamp = timestamp
        self.price = price

# ====== 💰 DATA FETCHER (ASYNC) ======
async def get_coin_price(coin_symbol: str) -> float:
    """Fetches current price for a coin from CoinGecko API."""
    coin_id = COIN_GECKO_IDS.get(coin_symbol.upper())
    if not coin_id:
        raise ValueError(f"Unsupported coin symbol: '{coin_symbol}'")
    
    async with httpx.AsyncClient() as client:
        price_url = f"{COINGECKO_API_URL}/simple/price"
        price_params = {"ids": coin_id, "vs_currencies": "usd"}
        price_resp = await client.get(price_url, params=price_params, timeout=10)
        price_resp.raise_for_status()
        
        price_data = price_resp.json()
        current_price = price_data.get(coin_id, {}).get("usd")
        if current_price is None:
            raise RuntimeError(f"Could not parse current price for {coin_id}")
        
        return float(current_price)

async def get_coin_market_data(coin_symbol: str) -> dict:
    """Fetches detailed market data including price history from CoinGecko API."""
    coin_id = COIN_GECKO_IDS.get(coin_symbol.upper())
    if not coin_id:
        raise ValueError(f"Unsupported coin symbol: '{coin_symbol}'")
    
    async with httpx.AsyncClient() as client:
        # Get current price
        price_url = f"{COINGECKO_API_URL}/simple/price"
        price_params = {"ids": coin_id, "vs_currencies": "usd"}
        price_resp = await client.get(price_url, params=price_params, timeout=10)
        price_resp.raise_for_status()
        
        price_data = price_resp.json()
        current_price = price_data.get(coin_id, {}).get("usd")
        if current_price is None:
            raise RuntimeError(f"Could not parse current price for {coin_id}")

        # Get 7-day historical data
        chart_url = f"{COINGECKO_API_URL}/coins/{coin_id}/market_chart"
        chart_params = {"vs_currency": "usd", "days": "7", "interval": "daily"}
        chart_resp = await client.get(chart_url, params=chart_params, timeout=10)
        chart_resp.raise_for_status()

        chart_data = chart_resp.json()
        historical_prices = []
        for item in chart_data.get("prices", []):
            historical_prices.append({
                "date": datetime.fromtimestamp(int(item[0] / 1000)).strftime('%Y-%m-%d'),
                "price": round(item[1], 2)
            })

        return {
            "symbol": coin_symbol.upper(),
            "current_price": float(current_price),
            "historical_prices": historical_prices,
        }

async def get_multiple_coin_prices(coin_symbols: List[str]) -> dict:
    """Fetches current prices for multiple coins from CoinGecko API."""
    coin_ids = []
    symbol_to_id = {}
    
    for symbol in coin_symbols:
        symbol_upper = symbol.upper()
        coin_id = COIN_GECKO_IDS.get(symbol_upper)
        if coin_id:
            coin_ids.append(coin_id)
            symbol_to_id[coin_id] = symbol_upper
    
    if not coin_ids:
        raise ValueError("No supported coin symbols provided")
    
    async with httpx.AsyncClient() as client:
        price_url = f"{COINGECKO_API_URL}/simple/price"
        price_params = {"ids": ",".join(coin_ids), "vs_currencies": "usd"}
        price_resp = await client.get(price_url, params=price_params, timeout=10)
        price_resp.raise_for_status()
        
        price_data = price_resp.json()
        results = {}
        
        for coin_id, data in price_data.items():
            symbol = symbol_to_id.get(coin_id)
            if symbol and "usd" in data:
                results[symbol] = float(data["usd"])
        
        return results
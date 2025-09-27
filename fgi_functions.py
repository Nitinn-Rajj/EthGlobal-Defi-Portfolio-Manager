# fgi_functions.py

import os
import asyncio
import httpx
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Alternative Fear & Greed Index API (free)
ALTERNATIVE_FGI_URL = "https://api.alternative.me/fng/"

async def get_fear_greed_index() -> dict:
    """
    Fetch the latest Fear & Greed Index from Alternative.me (free API).
    
    Returns:
        dict: Contains value, classification, and timestamp
    """
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(ALTERNATIVE_FGI_URL, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            if "data" in data and data["data"]:
                latest = data["data"][0]
                return {
                    "value": int(latest.get("value", 0)),
                    "classification": latest.get("value_classification", "Unknown"),
                    "timestamp": latest.get("timestamp", ""),
                    "time_until_update": latest.get("time_until_update", "")
                }
            else:
                raise ValueError("No FGI data available")
                
    except Exception as e:
        raise ConnectionError(f"Failed to fetch Fear & Greed Index: {str(e)}")

async def get_fear_greed_history(days: int = 7) -> list:
    """
    Fetch historical Fear & Greed Index data.
    
    Args:
        days: Number of days to fetch (default: 7)
    
    Returns:
        list: Historical FGI data points
    """
    try:
        params = {"limit": str(days)}
        async with httpx.AsyncClient() as client:
            response = await client.get(ALTERNATIVE_FGI_URL, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            if "data" in data and data["data"]:
                history = []
                for item in data["data"]:
                    history.append({
                        "value": int(item.get("value", 0)),
                        "classification": item.get("value_classification", "Unknown"),
                        "timestamp": item.get("timestamp", "")
                    })
                return history
            else:
                raise ValueError("No historical FGI data available")
                
    except Exception as e:
        raise ConnectionError(f"Failed to fetch Fear & Greed Index history: {str(e)}")

def interpret_fgi_value(value: int) -> str:
    """
    Provide interpretation of FGI value.
    
    Args:
        value: FGI value (0-100)
    
    Returns:
        str: Detailed interpretation
    """
    if value <= 25:
        return f"Extreme Fear ({value}) - Market sentiment is extremely fearful. This could indicate a buying opportunity as fear often leads to oversold conditions."
    elif value <= 45:
        return f"Fear ({value}) - Market sentiment is fearful. Investors are worried and selling may increase."
    elif value <= 55:
        return f"Neutral ({value}) - Market sentiment is neutral. Neither fear nor greed is dominating."
    elif value <= 75:
        return f"Greed ({value}) - Market sentiment is greedy. Investors are optimistic and buying pressure may increase."
    else:
        return f"Extreme Greed ({value}) - Market sentiment is extremely greedy. This could indicate a selling opportunity as greed often leads to overbought conditions."
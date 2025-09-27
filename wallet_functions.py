# wallet_functions.py

import os
import time
import asyncio
import logging
from typing import List
import httpx
from web3 import Web3
from dotenv import load_dotenv
from wallet_models import Transaction

# Load environment variables
load_dotenv()

INFURA_URL = os.getenv("INFURA_URL")
ETHERSCAN_API_KEY = os.getenv("ETHERSCAN_API_KEY")
logger = logging.getLogger("wallet_functions")

last_request_time = 0
async def rate_limit():
    global last_request_time
    now = time.time()
    if now - last_request_time < 2: 
        await asyncio.sleep(2 - (now - last_request_time))
    last_request_time = time.time()

async def get_eth_balance(wallet_address: str) -> float:
    await rate_limit()
    
    if not INFURA_URL:
        raise ValueError("INFURA_URL environment variable is not set")
        
    w3 = Web3(Web3.HTTPProvider(INFURA_URL))
    
    if not w3.is_address(wallet_address):
        raise ValueError("Invalid Ethereum address format")
    
    try:
        # Test connection first
        if not w3.is_connected():
            raise ConnectionError("Cannot connect to Ethereum network via Infura")
            
        balance_wei = await asyncio.to_thread(w3.eth.get_balance, wallet_address)
        return float(w3.from_wei(balance_wei, "ether"))
    except Exception as e:
        raise ConnectionError(f"Infura connection failed: {e}") from e

async def get_transactions(wallet_address: str) -> List[Transaction]:
    await rate_limit()
    
    if not ETHERSCAN_API_KEY:
        raise ValueError("ETHERSCAN_API_KEY environment variable is not set")
    
    url = (
        f"https://api.etherscan.io/api?module=account&action=txlist&address={wallet_address}"
        f"&startblock=0&endblock=99999999&sort=desc&apikey={ETHERSCAN_API_KEY}"
    )
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, timeout=15)
            response.raise_for_status()
        
        data = response.json()
        
        if data["status"] != "1":
            raise RuntimeError(f'Etherscan API error: {data.get("message", "Unknown")}')
        
        w3 = Web3() 
        return [
            Transaction(
                hash=tx["hash"],
                from_address=tx["from"],
                to_address=tx["to"],
                value_eth=float(w3.from_wei(int(tx["value"]), "ether")),
                timestamp=int(tx["timeStamp"]),
                status="confirmed" if tx.get("txreceipt_status") == "1" else "failed",
            ) for tx in data["result"][:20]
        ]
    except httpx.RequestError as e:
        raise ConnectionError("Etherscan connection timeout or error") from e
# wallet_models.py

from typing import List, Optional, Dict

class TokenBalance:
    def __init__(self, contract: str, symbol: str, decimals: int, balance: float, value_usd: float):
        self.contract = contract
        self.symbol = symbol
        self.decimals = decimals
        self.balance = balance
        self.value_usd = value_usd

class Transaction:
    def __init__(self, hash: str, from_address: str, to_address: str, value_eth: float, timestamp: int, status: str, token_transfers: List[Dict] = None):
        self.hash = hash
        self.from_address = from_address
        self.to_address = to_address
        self.value_eth = value_eth
        self.timestamp = timestamp
        self.status = status
        self.token_transfers = token_transfers or []
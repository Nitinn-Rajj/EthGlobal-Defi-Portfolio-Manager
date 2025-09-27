# Agent API Documentation

## Bridge Agent API
**Base URL:** `http://127.0.0.1:8001`

### POST `/chat`
Main cryptocurrency query endpoint with 4 different response types.

**Input:**
```json
{
  "text": "string"
}
```

**Output:**
```json
{
  "timestamp": "integer",
  "text": "string", 
  "agent_address": "string"
}
```

## 4 Response Types

The `text` field contains JSON with one of these 4 message types:

### 1. Portfolio Details
```json
{
  "message_type": "portfolio_details",
  "content": {
    "division": {
      "Ethereum": {
        "balance": "",
        "usd_value": "",
        "network": "main net", 
        "tokens": [{
          "symbol": "ETH",
          "amount": "0.0047",
          "usd_value": ""
        }]
      }
    }
  }
}
```

### 2. Current Prices
```json
{
  "message_type": "current_prices",
  "content": {
    "price_book": {
      "BTC": {
        "symbol": "BTC",
        "price_usd": "109379.0",
        "price_btc": "",
        "24h_change": ""
      }
    }
  }
}
```

### 3. Swap/Trade
```json
{
  "message_type": "swap",
  "content": {
    "taker_asset": "ETH",
    "maker_asset": "USDC",
    "taking_amount": "0.5",
    "making_amount": "",
    "exchange_rate": "",
    "network": "",
    "status": "",
    "transaction_hash": null
  }
}
```

### 4. Plain Text (Fallback)
```json
{
  "message_type": "plain_text",
  "content": {
    "text": "original query text"
  }
}
```

## Dashboard Server API
**Base URL:** `http://127.0.0.1:5000`

### POST `/dashboard`
Get comprehensive dashboard data for a wallet address.

**Input:**
```json
{
  "text": "wallet_address"
}
```

**Output:**
```json
{
  "text": "{...comprehensive_dashboard_json...}",
  "agent_address": "dashboard_server",
  "timestamp": "integer"
}
```

**Dashboard JSON Structure (inside `text` field):**
```json
{
  "wallet_address": "0x123...",
  "total_balance_usd": "1234.56",
  "assets": [
    {
      "symbol": "ETH",
      "balance": "0.5",
      "usd_value": "1200.00",
      "percentage": "97.3"
    }
  ],
  "transaction_count": 25,
  "recent_transactions": [...],
  "market_data": {...},
  "portfolio_metrics": {...}
}
```

## Example Usage

```bash
# Chat query
curl -X POST http://127.0.0.1:8001/chat \
  -H "Content-Type: application/json" \
  -d '{"text": "What is Bitcoin price?"}'

# Dashboard data
curl -X POST http://127.0.0.1:5000/dashboard \
  -H "Content-Type: application/json" \
  -d '{"text": "0x742d35Cc6C8F2B2E9E5B2F2F4F6F2F2F2F2F2F2F"}'
```


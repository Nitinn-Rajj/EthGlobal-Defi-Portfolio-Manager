## Base URL
`http://127.0.0.1:8001`

## Endpoints

### POST `/chat`
Main chat interface for cryptocurrency queries.

**Input Model (Request):**
```json
{
  "text": "string"
}
```

## Response Types

The `text` field in responses contains JSON with these message types:

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


## Query Examples
- `"Your current ethereum balance on main net is 0.0047"`
- `"Bitcoin price is $109,379"`
- `"Swap 0.5 ETH for USDC"`
- `"Show me BTC, ETH, and SOL prices"`
- `"How is the market today?"` (returns plain_text)


# Agent API Documentation

## Bridge Agent API
**Base URL:** `http://127.0.0.1:8001`

### POST `/chat`
Main cryptocurrency query endpoint.

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

The `text` field contains the direct response from the cryptocurrency agent without JSON formatting.

## Dashboard Server API
**Base URL:** `http://127.0.0.1:5000`

### GET `/dashboard/<wallet_address>`
Get comprehensive dashboard data for a wallet address.

**Input:** Wallet address in URL path

**Output:** Direct JSON with dashboard data
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
# Chat query - returns plain text response
curl -X POST http://127.0.0.1:8001/chat \
  -H "Content-Type: application/json" \
  -d '{"text": "What is Bitcoin price?"}'

# Dashboard data - simple GET request
curl http://127.0.0.1:5000/dashboard/0x742d35Cc6C8F2B2E9E5B2F2F4F6F2F2F2F2F2F2F
```


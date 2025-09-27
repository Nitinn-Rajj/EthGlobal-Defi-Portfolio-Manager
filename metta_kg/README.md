# MeTTa Knowledge Graph Integration

## 🧠 Overview

This module provides MeTTa Knowledge Graph integration for enhanced DeFi portfolio management with symbolic reasoning capabilities.

## 📦 Installation

```bash
# From the metta_kg directory
pip install -r requirements.txt

# Or install MeTTa directly
pip install hyperon
```

## 🚀 Usage

```python
from metta_kg import DeFiKnowledgeGraph

# Initialize knowledge graph
kg = DeFiKnowledgeGraph()

# Check if MeTTa is available
if kg.is_available():
    print("MeTTa Knowledge Graph is ready!")
else:
    print("MeTTa not available - using fallback mode")

# Query crypto information
btc_info = kg.query_crypto_info("BTC")
print(btc_info)  # {'name': 'Bitcoin', 'category': 'layer1', 'risk_score': 35}

# Get portfolio allocation
allocation = kg.get_portfolio_allocation("moderate")
print(allocation)  # {'BTC': 30, 'ETH': 35, 'SOL': 15, 'UNI': 10, 'USDC': 10}
```

## 🔧 Features

- **Graceful Fallback**: Works without MeTTa installed (reduced functionality)
- **Crypto Knowledge**: 12+ cryptocurrencies with categories and risk scores
- **Portfolio Rules**: Risk-based allocation strategies
- **Market Intelligence**: Fear & Greed Index integration
- **Real-time Data**: Market data integration capabilities

## 📊 Knowledge Structure

### Cryptocurrencies
- Basic info (symbol, name, blockchain)
- Categories (layer1, layer2, defi, stablecoin, memecoin)
- Risk scores and volatility levels
- Market correlations

### Portfolio Management
- Risk-based allocations (conservative, moderate, aggressive)
- Diversification rules
- Rebalancing thresholds

### Market Intelligence  
- Bull/bear market patterns
- Sector relationships
- Sentiment-based insights
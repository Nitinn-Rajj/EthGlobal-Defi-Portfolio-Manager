# MeTTa Knowledge Graph Integration - Project Structure

## 📁 Project Structure

```
EthGlobal-Defi-Portfolio-Manager/
├── frontend/                    # React frontend (unchanged)
├── backend/                     # Backend services (unchanged)  
├── agents/                      # MCP server with existing tools
│   ├── server.py               # ✅ Enhanced with MeTTa integration
│   ├── test_integration.py     # Test suite for integration
│   ├── wallet_functions.py     # Existing wallet functionality
│   ├── market_functions.py     # Existing market data functions
│   ├── fgi_functions.py        # Existing Fear & Greed functions
│   └── correlation_functions.py # Existing correlation analysis
└── metta_kg/                   # 🧠 NEW: MeTTa Knowledge Graph module
    ├── __init__.py             # Module initialization
    ├── knowledge_graph.py      # Core MeTTa knowledge graph
    ├── utils.py               # Utility functions
    ├── requirements.txt       # MeTTa dependencies  
    └── README.md              # Module documentation
```

## 🚀 Integration Summary

### ✅ What Was Enhanced
- **`agents/server.py`** - Enhanced with 3 new MCP tools while preserving all existing functionality
- **Graceful Integration** - MeTTa features are additive, no existing features broken
- **Fallback Mode** - Works without MeTTa installed (reduced functionality)
- **Modular Design** - MeTTa code isolated in separate `metta_kg/` directory

### 🧠 New MCP Tools Added
1. **`get_intelligent_crypto_analysis(coin_symbol)`** - AI-powered crypto analysis with risk scoring
2. **`get_ai_portfolio_recommendation(risk_profile, amount)`** - Smart portfolio allocation
3. **`get_metta_knowledge_status()`** - System status and capabilities

### 🔧 Existing Tools (Unchanged)
- `get_wallet_balance()` - Wallet information  
- `get_crypto_price()` - Current cryptocurrency prices
- `get_coin_correlations()` - Price correlation analysis
- `get_fear_greed_index()` - Market sentiment data
- `get_portfolio_summary()` - Comprehensive wallet analysis
- All other existing MCP tools remain intact

## 📦 Installation & Usage

### Quick Start (No MeTTa)
```bash
cd agents/
python server.py  # Works with existing functionality
```

### Enhanced Mode (With MeTTa)
```bash
# Install MeTTa
pip install hyperon

# Install from metta_kg directory
cd metta_kg/
pip install -r requirements.txt

# Run enhanced server
cd ../agents/
python server.py
```

### Test Integration
```bash
cd agents/
python test_integration.py
```

## 🧠 MeTTa Knowledge Graph Features

### Core Knowledge
- **12+ Cryptocurrencies** with categories (Layer 1, Layer 2, DeFi, Stablecoin, Memecoin)
- **Risk Scoring** (0-100 scale) with volatility assessments  
- **Correlation Data** between major cryptocurrency pairs
- **Portfolio Rules** for conservative/moderate/aggressive allocations

### AI Capabilities
- **Symbolic Reasoning** for complex financial decisions
- **Pattern Matching** for market condition analysis
- **Multi-factor Risk Assessment** combining multiple data sources
- **Market Sentiment Integration** with Fear & Greed Index
- **Real-time Data Updates** with market data integration

### Benefits
- 🎯 **Intelligent Decisions** - Move beyond simple technical indicators
- 🛡️ **Advanced Risk Management** - Multi-dimensional risk assessment
- 🔍 **Explainable AI** - Transparent reasoning process
- 📈 **Adaptive Strategies** - Market condition-based adjustments
- 🧩 **Extensible Knowledge** - Easy to add new assets and rules

## 🎯 Example Usage

### Basic Analysis (Always Available)
```python
# Get current price
get_crypto_price("BTC")

# Get correlation analysis  
get_coin_correlations("BTC,ETH,SOL", 30)

# Get market sentiment
get_fear_greed_index()
```

### Enhanced Analysis (With MeTTa)
```python
# Get AI-powered analysis
get_intelligent_crypto_analysis("BTC")
# Returns: market data + risk scoring + sentiment analysis + market insights

# Get smart portfolio recommendation
get_ai_portfolio_recommendation("moderate", 10000.0) 
# Returns: allocation + risk assessment + market timing advice

# Check system capabilities
get_metta_knowledge_status()
# Returns: system status + knowledge stats + available features
```

## 🔄 Migration Notes

### For Existing Users
- ✅ **No Breaking Changes** - All existing MCP tools work exactly the same
- ✅ **Optional Enhancement** - MeTTa features are additive, not required
- ✅ **Backward Compatible** - Existing integrations continue to work

### For New Users  
- 🚀 **Enhanced Experience** - Install MeTTa for full AI capabilities
- 📚 **Rich Knowledge** - Pre-loaded with DeFi expertise
- 🎯 **Smart Recommendations** - AI-powered portfolio management

## 🛠 Development

### Extending Knowledge
```python
# Add new cryptocurrency
kg.metta.space().add_atom(E(S("crypto"), S("NEW"), S("New Token")))
kg.metta.space().add_atom(E(S("risk_score"), S("NEW"), ValueAtom(75)))
```

### Adding Rules
```python
# Add portfolio rule
kg.metta.space().add_atom(E(S("allocation"), S("custom"), S("BTC"), ValueAtom(50)))
```

### Integration Points
- **Market Data** - Real-time price updates fed into knowledge graph
- **Sentiment Data** - Fear & Greed Index integration for market timing
- **Portfolio Analysis** - Risk assessment with correlation awareness

---

🎉 **Your DeFi Portfolio Manager now has the power of symbolic AI reasoning while maintaining all existing functionality!**
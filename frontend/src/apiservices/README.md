# API Services Documentation

## Overview
This directory contains API service functions for communicating with the backend services.

## Services

### Chat Service (`chatService.js`)
Handles communication with the Bridge Agent API (http://127.0.0.1:8001)

**Key Functions:**
- `sendChatQuery(text)` - Send query and get full response with metadata
- `getChatResponse(text)` - Get just the plain text response
- `getChatResponseWithMetadata(text)` - Get response with timestamp and agent info

**Usage:**
```javascript
import { getChatResponse, getChatResponseWithMetadata } from './apiservices/chatService';

// Get just the text response
const response = await getChatResponse("What is Bitcoin price?");
console.log(response); // Plain text response

// Get full response with metadata
const fullResponse = await getChatResponseWithMetadata("What is Bitcoin price?");
console.log(fullResponse.text); // Response text
console.log(fullResponse.timestamp); // Timestamp
console.log(fullResponse.agent_address); // Agent address
```

### Dashboard Service (`dashboardService.js`)
Handles communication with the Dashboard Server API (http://127.0.0.1:5000)
**Features**: Local caching, comprehensive data extraction, AI insights, market analysis

**Key Functions:**
- `getDashboardData(walletAddress, forceRefresh)` - Get dashboard data with optional cache bypass
- `getDashboardDataAndParse(walletAddress, forceRefresh)` - Alias for backward compatibility
- **Cache Management**: `clearCachedData()`, `clearAllCachedData()`, `getCacheStatus()`

**Data Extractors by Category:**

**Portfolio Data:**
- `getPortfolioData()`, `getWalletAddress()`, `getTotalBalanceUSD()`, `getTotalBalanceETH()`
- `getTransactionCount()`, `getRecentTransactions()`, `getNetwork()`

**Market Data:**
- `getMarketData()`, `getCurrentPrices()`, `getDetailedMarketAnalysis()`
- `getCryptoPriceBySymbol()`, `getHistoricalPrices()`

**AI Insights:**
- `getAIInsights()`, `getBTCAnalysis()`, `getETHAnalysis()`
- `getPortfolioRecommendations()`, `getAggressiveRecommendation()`, `getConservativeRecommendation()`

**Sentiment Analysis:**
- `getSentimentData()`, `getCurrentFearGreedIndex()`, `getFearGreedHistory()`
- `getSentimentInterpretation()`, `getMarketSentimentClassification()`, `getMarketSentimentValue()`

**System Status:**
- `getSystemStatus()`, `getDataSourcesStatus()`, `getMettaKnowledgeGraphStatus()`
- `isSystemFullyOperational()`, `getInactiveDataSources()`

**Utilities:**
- `isValidDashboardData()`, `getDataAgeInMinutes()`, `isDataFresh()`
- `getAvailableCryptoSymbols()`, `hasHistoricalData()`, `formatCurrency()`

**Usage:**
```javascript
import { 
  getDashboardData, 
  getAIInsights, 
  getCurrentPrices,
  getAggressiveRecommendation,
  getMarketSentimentValue,
  getCacheStatus
} from './apiservices/dashboardService';

// Get dashboard data (uses cache if available)
const dashboardData = await getDashboardData("0x742d35Cc6C8F2B2E9E5B2F2F4F6F2F2F2F2F2F2F");

// Force refresh from API
const freshData = await getDashboardData(walletAddress, true);

// Extract specific data
const aiInsights = getAIInsights(dashboardData);
const btcPrice = getCryptoPriceBySymbol(dashboardData, 'BTC');
const aggressiveRec = getAggressiveRecommendation(dashboardData);
const sentiment = getMarketSentimentValue(dashboardData);

// Check cache status
const cacheInfo = getCacheStatus(walletAddress);
console.log(`Cache age: ${cacheInfo.ageInMinutes} minutes`);
```

**Dashboard Data Structure:**
```javascript
{
  portfolio: {
    wallet_address: "0x...",
    total_balance_usd: "1.88",
    total_balance_eth: "0.00047",
    transaction_count: 2,
    recent_transactions: [...],
    network: "Ethereum Mainnet"
  },
  market_data: {
    current_prices: { BTC: 109463.0, ETH: 3993.56, ... },
    detailed_analysis: {
      BTC: { current_price: 109462.0, historical_prices: [...] },
      ETH: { current_price: 3993.57, historical_prices: [...] }
    }
  },
  ai_insights: {
    BTC_analysis: "🧠 Enhanced Analysis for Bitcoin...",
    ETH_analysis: "Analysis text...",
    portfolio_recommendations: {
      aggressive: "🎯 AI-Powered Portfolio Recommendation...",
      conservative: "Conservative recommendation..."
    }
  },
  sentiment: {
    current_fgi: { value: 33, classification: "Fear" },
    fgi_history: [...],
    interpretation: "Fear (33) - Market sentiment is fearful..."
  },
  correlations: { ... },
  system_status: {
    data_sources: { coingecko: "active", etherscan: "active" },
    metta_knowledge_graph: "🧠 MeTTa Knowledge Graph Status..."
  },
  timestamp: 1759000592
}
```

## API Changes (Updated)

### Chat API
- **Method**: POST `/chat`
- **Input**: `{"text": "query"}`
- **Output**: `{"timestamp": 123, "text": "plain text response", "agent_address": "agent"}`
- **Change**: Now returns plain text directly in the `text` field (no JSON parsing needed)

### Dashboard API  
- **Method**: GET `/dashboard/{wallet_address}`
- **Input**: Wallet address in URL path
- **Output**: Comprehensive JSON dashboard data with AI insights, market analysis, sentiment data
- **Features**: Local caching (5-minute TTL), fallback to cache on API failure
- **Change**: Now uses GET request with address in URL, returns comprehensive data structure

## Configuration
All API endpoints and settings are centralized in `config.js`. Environment-specific overrides are supported through environment variables:
- `REACT_APP_CHAT_API_URL` - Override chat API URL
- `REACT_APP_DASHBOARD_API_URL` - Override dashboard API URL
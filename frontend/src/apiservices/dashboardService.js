/**
 * Dashboard Service - Dashboard Server API
 * Base URL: http://127.0.0.1:5000
 * 
 * Handles communication with the dashboard server for comprehensive wallet data
 * Now uses GET request with wallet address in URL path
 * Includes local storage for fast access to dashboard data
 */

import { API_CONFIG } from './config.js';

const DASHBOARD_BASE_URL = API_CONFIG.DASHBOARD_API.BASE_URL;

// Local storage keys
const STORAGE_KEYS = {
  DASHBOARD_DATA: 'dashboard_data_',
  LAST_UPDATED: 'dashboard_last_updated_',
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes in milliseconds
};

/**
 * Check if cached data is still valid
 * @param {string} walletAddress - The wallet address
 * @returns {boolean} True if cached data is valid
 */
const isCacheValid = (walletAddress) => {
  try {
    const lastUpdated = localStorage.getItem(STORAGE_KEYS.LAST_UPDATED + walletAddress);
    if (!lastUpdated) return false;
    
    const now = Date.now();
    const cacheAge = now - parseInt(lastUpdated);
    return cacheAge < STORAGE_KEYS.CACHE_DURATION;
  } catch (error) {
    console.error('Error checking cache validity:', error);
    return false;
  }
};

/**
 * Get cached dashboard data
 * @param {string} walletAddress - The wallet address
 * @returns {Object|null} Cached dashboard data or null
 */
const getCachedData = (walletAddress) => {
  try {
    if (!isCacheValid(walletAddress)) return null;
    
    const cachedData = localStorage.getItem(STORAGE_KEYS.DASHBOARD_DATA + walletAddress);
    return cachedData ? JSON.parse(cachedData) : null;
  } catch (error) {
    console.error('Error getting cached data:', error);
    return null;
  }
};

/**
 * Cache dashboard data locally
 * @param {string} walletAddress - The wallet address
 * @param {Object} data - The dashboard data to cache
 */
const cacheData = (walletAddress, data) => {
  try {
    localStorage.setItem(STORAGE_KEYS.DASHBOARD_DATA + walletAddress, JSON.stringify(data));
    localStorage.setItem(STORAGE_KEYS.LAST_UPDATED + walletAddress, Date.now().toString());
  } catch (error) {
    console.error('Error caching data:', error);
  }
};

/**
 * Clear cached data for a wallet
 * @param {string} walletAddress - The wallet address
 */
export const clearCachedData = (walletAddress) => {
  try {
    localStorage.removeItem(STORAGE_KEYS.DASHBOARD_DATA + walletAddress);
    localStorage.removeItem(STORAGE_KEYS.LAST_UPDATED + walletAddress);
  } catch (error) {
    console.error('Error clearing cached data:', error);
  }
};

/**
 * Clear all cached dashboard data
 */
export const clearAllCachedData = () => {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(STORAGE_KEYS.DASHBOARD_DATA) || key.startsWith(STORAGE_KEYS.LAST_UPDATED)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Error clearing all cached data:', error);
  }
};

/**
 * Get comprehensive dashboard data for a wallet address
 * @param {string} walletAddress - The wallet address to get data for
 * @param {boolean} forceRefresh - Force refresh from API (skip cache)
 * @returns {Promise<Object>} Direct JSON dashboard data
 */
export const getDashboardData = async (walletAddress, forceRefresh = false) => {
  try {
    // Check cache first unless force refresh is requested
    if (!forceRefresh) {
      const cachedData = getCachedData(walletAddress);
      if (cachedData) {
        console.log('Returning cached dashboard data for', walletAddress);
        return cachedData;
      }
    }

    console.log('Fetching fresh dashboard data for', walletAddress);
    const response = await fetch(`${DASHBOARD_BASE_URL}${API_CONFIG.DASHBOARD_API.ENDPOINTS.DASHBOARD}/${walletAddress}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Cache the fresh data
    cacheData(walletAddress, data);
    
    return data;
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    
    // Try to return cached data as fallback
    const cachedData = getCachedData(walletAddress);
    if (cachedData) {
      console.warn('API failed, returning cached data for', walletAddress);
      return cachedData;
    }
    
    throw error;
  }
};

/**
 * Get dashboard data (alias for getDashboardData for backward compatibility)
 * @param {string} walletAddress - The wallet address to get data for
 * @param {boolean} forceRefresh - Force refresh from API (skip cache)
 * @returns {Promise<Object>} Direct JSON dashboard data
 */
export const getDashboardDataAndParse = async (walletAddress, forceRefresh = false) => {
  return await getDashboardData(walletAddress, forceRefresh);
};

// =============================================================================
// PORTFOLIO DATA EXTRACTORS
// =============================================================================

/**
 * Extract portfolio data from dashboard
 * @param {Object} dashboardData - Direct dashboard data from API
 * @returns {Object|null} Portfolio data or null if not available
 */
export const getPortfolioData = (dashboardData) => {
  return dashboardData.portfolio || null;
};

/**
 * Extract wallet address from dashboard data
 * @param {Object} dashboardData - Direct dashboard data from API
 * @returns {string|null} Wallet address or null if not available
 */
export const getWalletAddress = (dashboardData) => {
  return dashboardData.portfolio?.wallet_address || dashboardData.wallet_address || null;
};

/**
 * Extract total balance in USD from dashboard data
 * @param {Object} dashboardData - Direct dashboard data from API
 * @returns {string|null} Total balance in USD or null if not available
 */
export const getTotalBalanceUSD = (dashboardData) => {
  return dashboardData.portfolio?.total_balance_usd || dashboardData.total_balance_usd || null;
};

/**
 * Extract total balance in ETH from dashboard data
 * @param {Object} dashboardData - Direct dashboard data from API
 * @returns {string|null} Total balance in ETH or null if not available
 */
export const getTotalBalanceETH = (dashboardData) => {
  return dashboardData.portfolio?.total_balance_eth || null;
};

/**
 * Extract transaction count from dashboard data
 * @param {Object} dashboardData - Direct dashboard data from API
 * @returns {number|null} Transaction count or null if not available
 */
export const getTransactionCount = (dashboardData) => {
  return dashboardData.portfolio?.transaction_count || dashboardData.transaction_count || null;
};

/**
 * Extract recent transactions from dashboard data
 * @param {Object} dashboardData - Direct dashboard data from API
 * @returns {Array|null} Recent transactions array or null if not available
 */
export const getRecentTransactions = (dashboardData) => {
  return dashboardData.portfolio?.recent_transactions || dashboardData.recent_transactions || null;
};

/**
 * Extract network information
 * @param {Object} dashboardData - Direct dashboard data from API
 * @returns {string|null} Network name or null if not available
 */
export const getNetwork = (dashboardData) => {
  return dashboardData.portfolio?.network || null;
};

// =============================================================================
// MARKET DATA EXTRACTORS
// =============================================================================

/**
 * Extract market data from dashboard data
 * @param {Object} dashboardData - Direct dashboard data from API
 * @returns {Object|null} Market data object or null if not available
 */
export const getMarketData = (dashboardData) => {
  return dashboardData.market_data || null;
};

/**
 * Extract current prices from market data
 * @param {Object} dashboardData - Direct dashboard data from API
 * @returns {Object|null} Current prices object or null if not available
 */
export const getCurrentPrices = (dashboardData) => {
  return dashboardData.market_data?.current_prices || null;
};

/**
 * Extract detailed market analysis
 * @param {Object} dashboardData - Direct dashboard data from API
 * @returns {Object|null} Detailed analysis object or null if not available
 */
export const getDetailedMarketAnalysis = (dashboardData) => {
  return dashboardData.market_data?.detailed_analysis || null;
};

/**
 * Get price for specific cryptocurrency
 * @param {Object} dashboardData - Direct dashboard data from API
 * @param {string} symbol - Cryptocurrency symbol (e.g., 'BTC', 'ETH')
 * @returns {number|null} Price or null if not available
 */
export const getCryptoPriceBySymbol = (dashboardData, symbol) => {
  const prices = getCurrentPrices(dashboardData);
  return prices?.[symbol] || null;
};

/**
 * Get historical prices for specific cryptocurrency
 * @param {Object} dashboardData - Direct dashboard data from API
 * @param {string} symbol - Cryptocurrency symbol (e.g., 'BTC', 'ETH')
 * @returns {Array|null} Historical prices array or null if not available
 */
export const getHistoricalPrices = (dashboardData, symbol) => {
  const detailedAnalysis = getDetailedMarketAnalysis(dashboardData);
  return detailedAnalysis?.[symbol]?.historical_prices || null;
};

// =============================================================================
// AI INSIGHTS EXTRACTORS
// =============================================================================

/**
 * Extract AI insights from dashboard data
 * @param {Object} dashboardData - Direct dashboard data from API
 * @returns {Object|null} AI insights object or null if not available
 */
export const getAIInsights = (dashboardData) => {
  return dashboardData.ai_insights || null;
};

/**
 * Extract BTC AI analysis
 * @param {Object} dashboardData - Direct dashboard data from API
 * @returns {string|null} BTC analysis text or null if not available
 */
export const getBTCAnalysis = (dashboardData) => {
  return dashboardData.ai_insights?.BTC_analysis || null;
};

/**
 * Extract ETH AI analysis
 * @param {Object} dashboardData - Direct dashboard data from API
 * @returns {string|null} ETH analysis text or null if not available
 */
export const getETHAnalysis = (dashboardData) => {
  return dashboardData.ai_insights?.ETH_analysis || null;
};

/**
 * Extract portfolio recommendations
 * @param {Object} dashboardData - Direct dashboard data from API
 * @returns {Object|null} Portfolio recommendations object or null if not available
 */
export const getPortfolioRecommendations = (dashboardData) => {
  return dashboardData.ai_insights?.portfolio_recommendations || null;
};

/**
 * Extract aggressive portfolio recommendation
 * @param {Object} dashboardData - Direct dashboard data from API
 * @returns {string|null} Aggressive recommendation text or null if not available
 */
export const getAggressiveRecommendation = (dashboardData) => {
  return dashboardData.ai_insights?.portfolio_recommendations?.aggressive || null;
};

/**
 * Extract conservative portfolio recommendation
 * @param {Object} dashboardData - Direct dashboard data from API
 * @returns {string|null} Conservative recommendation text or null if not available
 */
export const getConservativeRecommendation = (dashboardData) => {
  return dashboardData.ai_insights?.portfolio_recommendations?.conservative || null;
};

// =============================================================================
// SENTIMENT DATA EXTRACTORS
// =============================================================================

/**
 * Extract sentiment data from dashboard
 * @param {Object} dashboardData - Direct dashboard data from API
 * @returns {Object|null} Sentiment data object or null if not available
 */
export const getSentimentData = (dashboardData) => {
  return dashboardData.sentiment || null;
};

/**
 * Extract current Fear & Greed Index
 * @param {Object} dashboardData - Direct dashboard data from API
 * @returns {Object|null} Current FGI data or null if not available
 */
export const getCurrentFearGreedIndex = (dashboardData) => {
  return dashboardData.sentiment?.current_fgi || null;
};

/**
 * Extract Fear & Greed Index history
 * @param {Object} dashboardData - Direct dashboard data from API
 * @returns {Array|null} FGI history array or null if not available
 */
export const getFearGreedHistory = (dashboardData) => {
  return dashboardData.sentiment?.fgi_history || null;
};

/**
 * Extract sentiment interpretation
 * @param {Object} dashboardData - Direct dashboard data from API
 * @returns {string|null} Sentiment interpretation text or null if not available
 */
export const getSentimentInterpretation = (dashboardData) => {
  return dashboardData.sentiment?.interpretation || null;
};

// =============================================================================
// CORRELATION DATA EXTRACTORS
// =============================================================================

/**
 * Extract correlation data from dashboard
 * @param {Object} dashboardData - Direct dashboard data from API
 * @returns {Object|null} Correlation data or null if not available
 */
export const getCorrelationData = (dashboardData) => {
  return dashboardData.correlations || null;
};

// =============================================================================
// SYSTEM STATUS EXTRACTORS
// =============================================================================

/**
 * Extract system status from dashboard
 * @param {Object} dashboardData - Direct dashboard data from API
 * @returns {Object|null} System status object or null if not available
 */
export const getSystemStatus = (dashboardData) => {
  return dashboardData.system_status || null;
};

/**
 * Extract data sources status
 * @param {Object} dashboardData - Direct dashboard data from API
 * @returns {Object|null} Data sources status or null if not available
 */
export const getDataSourcesStatus = (dashboardData) => {
  return dashboardData.system_status?.data_sources || null;
};

/**
 * Extract MeTTa Knowledge Graph status
 * @param {Object} dashboardData - Direct dashboard data from API
 * @returns {string|null} MeTTa KG status text or null if not available
 */
export const getMettaKnowledgeGraphStatus = (dashboardData) => {
  return dashboardData.system_status?.metta_knowledge_graph || null;
};

/**
 * Get timestamp of the dashboard data
 * @param {Object} dashboardData - Direct dashboard data from API
 * @returns {number|null} Timestamp or null if not available
 */
export const getTimestamp = (dashboardData) => {
  return dashboardData.timestamp || null;
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Check if dashboard data is available and valid
 * @param {Object} dashboardData - Direct dashboard data from API
 * @returns {boolean} True if data is valid
 */
export const isValidDashboardData = (dashboardData) => {
  return dashboardData && typeof dashboardData === 'object' && dashboardData.timestamp;
};

/**
 * Get data age in minutes
 * @param {Object} dashboardData - Direct dashboard data from API
 * @returns {number|null} Age in minutes or null if timestamp unavailable
 */
export const getDataAgeInMinutes = (dashboardData) => {
  const timestamp = getTimestamp(dashboardData);
  if (!timestamp) return null;
  
  const now = Date.now();
  const dataTime = timestamp * 1000; // Convert to milliseconds
  return Math.floor((now - dataTime) / (1000 * 60));
};

/**
 * Check if data is fresh (less than 5 minutes old)
 * @param {Object} dashboardData - Direct dashboard data from API
 * @returns {boolean} True if data is fresh
 */
export const isDataFresh = (dashboardData) => {
  const ageInMinutes = getDataAgeInMinutes(dashboardData);
  return ageInMinutes !== null && ageInMinutes < 5;
};

/**
 * Get all available cryptocurrency symbols from current prices
 * @param {Object} dashboardData - Direct dashboard data from API
 * @returns {Array} Array of cryptocurrency symbols
 */
export const getAvailableCryptoSymbols = (dashboardData) => {
  const prices = getCurrentPrices(dashboardData);
  return prices ? Object.keys(prices) : [];
};

/**
 * Check if a specific cryptocurrency has historical data
 * @param {Object} dashboardData - Direct dashboard data from API
 * @param {string} symbol - Cryptocurrency symbol
 * @returns {boolean} True if historical data exists
 */
export const hasHistoricalData = (dashboardData, symbol) => {
  const historicalPrices = getHistoricalPrices(dashboardData, symbol);
  return historicalPrices && historicalPrices.length > 0;
};

/**
 * Get market sentiment classification
 * @param {Object} dashboardData - Direct dashboard data from API
 * @returns {string|null} Sentiment classification or null
 */
export const getMarketSentimentClassification = (dashboardData) => {
  const currentFGI = getCurrentFearGreedIndex(dashboardData);
  return currentFGI?.classification || null;
};

/**
 * Get market sentiment value (0-100)
 * @param {Object} dashboardData - Direct dashboard data from API
 * @returns {number|null} Sentiment value or null
 */
export const getMarketSentimentValue = (dashboardData) => {
  const currentFGI = getCurrentFearGreedIndex(dashboardData);
  return currentFGI?.value || null;
};

/**
 * Check if system is fully operational
 * @param {Object} dashboardData - Direct dashboard data from API
 * @returns {boolean} True if all data sources are active
 */
export const isSystemFullyOperational = (dashboardData) => {
  const dataSources = getDataSourcesStatus(dashboardData);
  if (!dataSources) return false;
  
  return Object.values(dataSources).every(status => status === 'active');
};

/**
 * Get inactive data sources
 * @param {Object} dashboardData - Direct dashboard data from API
 * @returns {Array} Array of inactive data source names
 */
export const getInactiveDataSources = (dashboardData) => {
  const dataSources = getDataSourcesStatus(dashboardData);
  if (!dataSources) return [];
  
  return Object.entries(dataSources)
    .filter(([_, status]) => status !== 'active')
    .map(([name, _]) => name);
};

/**
 * Format currency value
 * @param {number|string} value - The value to format
 * @param {string} currency - Currency type ('USD' or 'ETH')
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (value, currency = 'USD') => {
  const numValue = parseFloat(value);
  if (isNaN(numValue)) return '0';
  
  if (currency === 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numValue);
  } else if (currency === 'ETH') {
    return `${numValue.toFixed(6)} ETH`;
  }
  
  return numValue.toString();
};

/**
 * Get cache status for wallet
 * @param {string} walletAddress - The wallet address
 * @returns {Object} Cache status information
 */
export const getCacheStatus = (walletAddress) => {
  try {
    const lastUpdated = localStorage.getItem(STORAGE_KEYS.LAST_UPDATED + walletAddress);
    const hasCachedData = localStorage.getItem(STORAGE_KEYS.DASHBOARD_DATA + walletAddress) !== null;
    
    if (!lastUpdated || !hasCachedData) {
      return {
        hasCache: false,
        isValid: false,
        ageInMinutes: null,
        lastUpdated: null
      };
    }
    
    const lastUpdateTime = parseInt(lastUpdated);
    const now = Date.now();
    const ageInMinutes = Math.floor((now - lastUpdateTime) / (1000 * 60));
    const isValid = ageInMinutes < (STORAGE_KEYS.CACHE_DURATION / (1000 * 60));
    
    return {
      hasCache: true,
      isValid,
      ageInMinutes,
      lastUpdated: new Date(lastUpdateTime).toISOString()
    };
  } catch (error) {
    console.error('Error getting cache status:', error);
    return {
      hasCache: false,
      isValid: false,
      ageInMinutes: null,
      lastUpdated: null
    };
  }
};
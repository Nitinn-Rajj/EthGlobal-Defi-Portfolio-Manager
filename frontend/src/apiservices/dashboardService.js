/**
 * Dashboard Service - Dashboard Server API
 * Base URL: http://127.0.0.1:5000
 * 
 * Handles communication with the dashboard server for comprehensive wallet data
 */

import { API_CONFIG } from './config.js';

const DASHBOARD_BASE_URL = API_CONFIG.DASHBOARD_API.BASE_URL;

/**
 * Get comprehensive dashboard data for a wallet address
 * @param {string} walletAddress - The wallet address to get data for
 * @returns {Promise<Object>} Response with text (JSON string), agent_address, and timestamp
 */
export const getDashboardData = async (walletAddress) => {
  try {
    const response = await fetch(`${DASHBOARD_BASE_URL}${API_CONFIG.DASHBOARD_API.ENDPOINTS.DASHBOARD}`, {
      method: 'POST',
      headers: API_CONFIG.REQUEST_CONFIG.HEADERS,
      body: JSON.stringify({ text: walletAddress }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
};

/**
 * Parse the response from dashboard API and extract the dashboard content
 * @param {Object} response - Raw response from getDashboardData
 * @returns {Object} Parsed dashboard data
 */
export const parseDashboardResponse = (response) => {
  try {
    const dashboardData = JSON.parse(response.text);
    return {
      dashboardData,
      agentAddress: response.agent_address,
      timestamp: response.timestamp
    };
  } catch (error) {
    console.error('Error parsing dashboard response:', error);
    throw error;
  }
};

/**
 * Get dashboard data and parse response
 * @param {string} walletAddress - The wallet address to get data for
 * @returns {Promise<Object>} Parsed dashboard data
 */
export const getDashboardDataAndParse = async (walletAddress) => {
  const rawResponse = await getDashboardData(walletAddress);
  return parseDashboardResponse(rawResponse);
};

/**
 * Extract wallet address from dashboard data
 * @param {Object} parsedResponse - Response from parseDashboardResponse
 * @returns {string|null} Wallet address or null if not available
 */
export const getWalletAddress = (parsedResponse) => {
  return parsedResponse.dashboardData.wallet_address || null;
};

/**
 * Extract total balance in USD from dashboard data
 * @param {Object} parsedResponse - Response from parseDashboardResponse
 * @returns {string|null} Total balance in USD or null if not available
 */
export const getTotalBalanceUSD = (parsedResponse) => {
  return parsedResponse.dashboardData.total_balance_usd || null;
};

/**
 * Extract assets array from dashboard data
 * @param {Object} parsedResponse - Response from parseDashboardResponse
 * @returns {Array|null} Assets array or null if not available
 */
export const getAssets = (parsedResponse) => {
  return parsedResponse.dashboardData.assets || null;
};

/**
 * Extract transaction count from dashboard data
 * @param {Object} parsedResponse - Response from parseDashboardResponse
 * @returns {number|null} Transaction count or null if not available
 */
export const getTransactionCount = (parsedResponse) => {
  return parsedResponse.dashboardData.transaction_count || null;
};

/**
 * Extract recent transactions from dashboard data
 * @param {Object} parsedResponse - Response from parseDashboardResponse
 * @returns {Array|null} Recent transactions array or null if not available
 */
export const getRecentTransactions = (parsedResponse) => {
  return parsedResponse.dashboardData.recent_transactions || null;
};

/**
 * Extract market data from dashboard data
 * @param {Object} parsedResponse - Response from parseDashboardResponse
 * @returns {Object|null} Market data object or null if not available
 */
export const getMarketData = (parsedResponse) => {
  return parsedResponse.dashboardData.market_data || null;
};

/**
 * Extract portfolio metrics from dashboard data
 * @param {Object} parsedResponse - Response from parseDashboardResponse
 * @returns {Object|null} Portfolio metrics object or null if not available
 */
export const getPortfolioMetrics = (parsedResponse) => {
  return parsedResponse.dashboardData.portfolio_metrics || null;
};

/**
 * Get asset by symbol from assets array
 * @param {Object} parsedResponse - Response from parseDashboardResponse
 * @param {string} symbol - Asset symbol to find
 * @returns {Object|null} Asset object or null if not found
 */
export const getAssetBySymbol = (parsedResponse, symbol) => {
  const assets = getAssets(parsedResponse);
  if (!assets) return null;
  
  return assets.find(asset => asset.symbol === symbol) || null;
};

/**
 * Get total portfolio value from assets
 * @param {Object} parsedResponse - Response from parseDashboardResponse
 * @returns {number} Total portfolio value calculated from assets
 */
export const calculateTotalPortfolioValue = (parsedResponse) => {
  const assets = getAssets(parsedResponse);
  if (!assets) return 0;
  
  return assets.reduce((total, asset) => {
    return total + parseFloat(asset.usd_value || 0);
  }, 0);
};

/**
 * Get assets sorted by USD value (descending)
 * @param {Object} parsedResponse - Response from parseDashboardResponse
 * @returns {Array|null} Sorted assets array or null if not available
 */
export const getAssetsSortedByValue = (parsedResponse) => {
  const assets = getAssets(parsedResponse);
  if (!assets) return null;
  
  return [...assets].sort((a, b) => parseFloat(b.usd_value || 0) - parseFloat(a.usd_value || 0));
};

/**
 * Check if wallet has any assets
 * @param {Object} parsedResponse - Response from parseDashboardResponse
 * @returns {boolean} True if wallet has assets, false otherwise
 */
export const hasAssets = (parsedResponse) => {
  const assets = getAssets(parsedResponse);
  return assets && assets.length > 0;
};
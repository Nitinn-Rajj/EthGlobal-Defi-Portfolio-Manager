

import { API_CONFIG } from './config.js';
import { 
  getTotalBalanceUSD, 
  getTotalBalanceETH, 
  getWalletAddress, 
  getPortfolioData,
  getCurrentPrices 
} from './dashboardService.js';

const CHAT_BASE_URL = API_CONFIG.CHAT_API.BASE_URL;

/**
 * Build context string from wallet and dashboard data
 * @param {Object} walletContext - Wallet context containing account, balance, network, etc.
 * @param {Object} dashboardData - Dashboard data containing portfolio, prices, etc.
 * @returns {string} Formatted context string
 */
const buildWalletContext = (walletContext, dashboardData) => {
  let context = "\n--- WALLET & PORTFOLIO CONTEXT ---\n";
  
  // Basic wallet info
  if (walletContext?.account) {
    context += `Wallet Address: ${walletContext.account}\n`;
  }
  
  if (walletContext?.network) {
    context += `Network: ${walletContext.network}\n`;
  }
  
  if (walletContext?.balance) {
    context += `ETH Balance: ${walletContext.balance} ETH\n`;
  }
  
  // Dashboard data
  if (dashboardData) {
    const totalUSD = getTotalBalanceUSD(dashboardData);
    const totalETH = getTotalBalanceETH(dashboardData);
    const portfolioData = getPortfolioData(dashboardData);
    const currentPrices = getCurrentPrices(dashboardData);
    
    if (totalUSD) {
      context += `Total Portfolio Value: $${totalUSD}\n`;
    }
    
    if (totalETH) {
      context += `Total Portfolio Value in ETH: ${totalETH} ETH\n`;
    }
    
    // Portfolio holdings
    if (portfolioData?.holdings && Array.isArray(portfolioData.holdings)) {
      context += "\nCurrent Holdings:\n";
      portfolioData.holdings.forEach((holding, index) => {
        const symbol = holding.symbol || holding.token || `Asset ${index + 1}`;
        const balance = holding.balance || holding.amount || '0';
        const value = holding.value_usd || holding.usd_value || '0';
        context += `- ${symbol}: ${balance} (≈$${value})\n`;
      });
    }
    
    // Current prices
    if (currentPrices && Object.keys(currentPrices).length > 0) {
      context += "\nCurrent Token Prices:\n";
      Object.entries(currentPrices).forEach(([token, price]) => {
        context += `- ${token}: $${price}\n`;
      });
    }
    
    // Recent transactions
    if (portfolioData?.recent_transactions && Array.isArray(portfolioData.recent_transactions)) {
      context += "\nRecent Transactions:\n";
      portfolioData.recent_transactions.slice(0, 5).forEach(tx => {
        context += `- ${tx.type || 'Transaction'}: ${tx.amount || ''} ${tx.token || ''} (${tx.timestamp || ''})\n`;
      });
    }
  }
  
  context += "--- END CONTEXT ---\n\n";
  return context;
};

/**
 * Send a chat query to the bridge agent
 * @param {string} text - The query text to send
 * @param {Object} walletContext - Optional wallet context
 * @param {Object} dashboardData - Optional dashboard data
 * @returns {Promise<Object>} Response with timestamp, text (plain text), and agent_address
 */
export const sendChatQuery = async (text, walletContext = null, dashboardData = null) => {
  try {
    // Build the enhanced text with context
    let enhancedText = text;
    
    if (walletContext || dashboardData) {
      const contextString = buildWalletContext(walletContext, dashboardData);
      enhancedText = contextString + "User Query: " + text;
      
      console.log('🔍 Enhanced query with context:', enhancedText);
    }
    
    const response = await fetch(`${CHAT_BASE_URL}${API_CONFIG.CHAT_API.ENDPOINTS.CHAT}`, {
      method: 'POST',
      headers: API_CONFIG.REQUEST_CONFIG.HEADERS,
      body: JSON.stringify({ text: enhancedText }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error sending chat query:', error);
    throw error;
  }
};

/**
 * Get the plain text response from chat query
 * @param {string} text - The query text to send
 * @param {Object} walletContext - Optional wallet context
 * @param {Object} dashboardData - Optional dashboard data
 * @returns {Promise<string>} Plain text response
 */
export const getChatResponse = async (text, walletContext = null, dashboardData = null) => {
  const response = await sendChatQuery(text, walletContext, dashboardData);
  return response.text;
};

/**
 * Get full chat response with metadata
 * @param {string} text - The query text to send
 * @param {Object} walletContext - Optional wallet context
 * @param {Object} dashboardData - Optional dashboard data
 * @returns {Promise<Object>} Full response with timestamp, text, and agent_address
 */
export const getChatResponseWithMetadata = async (text, walletContext = null, dashboardData = null) => {
  return await sendChatQuery(text, walletContext, dashboardData);
};
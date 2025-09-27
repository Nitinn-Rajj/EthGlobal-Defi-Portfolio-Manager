/**
 * API Configuration
 * 
 * Centralized configuration for all API endpoints and settings
 */

// Base URLs for different services
export const API_CONFIG = {
  // Bridge Agent API for chat queries
  CHAT_API: {
    BASE_URL: 'http://127.0.0.1:8001',
    ENDPOINTS: {
      CHAT: '/chat'
    }
  },
  
  // Dashboard Server API for comprehensive wallet data
  DASHBOARD_API: {
    BASE_URL: 'http://127.0.0.1:5000',
    ENDPOINTS: {
      DASHBOARD: '/dashboard'
    }
  },
  
  // Ethereum Token Trading API for swaps and limit orders
  TRADING_API: {
    BASE_URL: 'http://localhost:3000',
    ENDPOINTS: {
      SWAP: '/swap',
      SWAP_QUOTE: '/swap/quote',
      SWAP_TOKENS: '/swap/tokens',
      SWAP_ALLOWANCE: '/swap/allowance',
      LIMIT_ORDER: '/limit-order',
      TOKEN_INFO: '/token-info',
      WALLET_BALANCES: '/wallet-balances',
      HEALTH: '/health',
      TOKENS: '/tokens'
    }
  },
  
  // Default request settings
  REQUEST_CONFIG: {
    HEADERS: {
      'Content-Type': 'application/json'
    },
    TIMEOUT: 30000, // 30 seconds
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000 // 1 second
  }
};

// Export API_BASE_URL for backward compatibility and convenience
export const API_BASE_URL = API_CONFIG.TRADING_API.BASE_URL;

// Environment-based configuration
export const getApiConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  
  switch (env) {
    case 'production':
      // In production, these would point to actual deployed endpoints
      return {
        ...API_CONFIG,
        CHAT_API: {
          ...API_CONFIG.CHAT_API,
          BASE_URL: process.env.REACT_APP_CHAT_API_URL || API_CONFIG.CHAT_API.BASE_URL
        },
        DASHBOARD_API: {
          ...API_CONFIG.DASHBOARD_API,
          BASE_URL: process.env.REACT_APP_DASHBOARD_API_URL || API_CONFIG.DASHBOARD_API.BASE_URL
        }
      };
    
    case 'development':
    default:
      return API_CONFIG;
  }
};

export default getApiConfig();
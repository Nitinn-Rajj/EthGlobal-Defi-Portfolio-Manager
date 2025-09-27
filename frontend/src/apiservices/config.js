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

// Message types returned by chat API
export const CHAT_MESSAGE_TYPES = {
  PORTFOLIO_DETAILS: 'portfolio_details',
  CURRENT_PRICES: 'current_prices',
  SWAP: 'swap',
  PLAIN_TEXT: 'plain_text'
};

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
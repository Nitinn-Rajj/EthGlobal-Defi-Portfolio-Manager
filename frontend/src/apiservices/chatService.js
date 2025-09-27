/**
 * Chat Service - Bridge Agent API
 * Base URL: http://127.0.0.1:8001
 * 
 * Handles communication with the bridge agent for cryptocurrency queries
 * Returns one of 4 response types: portfolio_details, current_prices, swap, plain_text
 */

import { API_CONFIG, CHAT_MESSAGE_TYPES } from './config.js';

const CHAT_BASE_URL = API_CONFIG.CHAT_API.BASE_URL;

/**
 * Send a chat query to the bridge agent
 * @param {string} text - The query text to send
 * @returns {Promise<Object>} Response with timestamp, text (JSON string), and agent_address
 */
export const sendChatQuery = async (text) => {
  try {
    const response = await fetch(`${CHAT_BASE_URL}${API_CONFIG.CHAT_API.ENDPOINTS.CHAT}`, {
      method: 'POST',
      headers: API_CONFIG.REQUEST_CONFIG.HEADERS,
      body: JSON.stringify({ text }),
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
 * Parse the response from chat query and extract the message content
 * @param {Object} response - Raw response from sendChatQuery
 * @returns {Object} Parsed message with type and content
 */
export const parseChatResponse = (response) => {
  try {
    const parsedText = JSON.parse(response.text);
    return {
      messageType: parsedText.message_type,
      content: parsedText.content,
      timestamp: response.timestamp,
      agentAddress: response.agent_address
    };
  } catch (error) {
    console.error('Error parsing chat response:', error);
    // Return as plain text if parsing fails
    return {
      messageType: 'plain_text',
      content: { text: response.text },
      timestamp: response.timestamp,
      agentAddress: response.agent_address
    };
  }
};

/**
 * Send chat query and get parsed response
 * @param {string} text - The query text to send
 * @returns {Promise<Object>} Parsed response with message type and content
 */
export const sendChatQueryAndParse = async (text) => {
  const rawResponse = await sendChatQuery(text);
  return parseChatResponse(rawResponse);
};

/**
 * Check if response is portfolio details
 * @param {Object} parsedResponse - Response from parseChatResponse
 * @returns {boolean}
 */
export const isPortfolioDetails = (parsedResponse) => {
  return parsedResponse.messageType === CHAT_MESSAGE_TYPES.PORTFOLIO_DETAILS;
};

/**
 * Check if response is current prices
 * @param {Object} parsedResponse - Response from parseChatResponse
 * @returns {boolean}
 */
export const isCurrentPrices = (parsedResponse) => {
  return parsedResponse.messageType === CHAT_MESSAGE_TYPES.CURRENT_PRICES;
};

/**
 * Check if response is swap/trade
 * @param {Object} parsedResponse - Response from parseChatResponse
 * @returns {boolean}
 */
export const isSwap = (parsedResponse) => {
  return parsedResponse.messageType === CHAT_MESSAGE_TYPES.SWAP;
};

/**
 * Check if response is plain text
 * @param {Object} parsedResponse - Response from parseChatResponse
 * @returns {boolean}
 */
export const isPlainText = (parsedResponse) => {
  return parsedResponse.messageType === CHAT_MESSAGE_TYPES.PLAIN_TEXT;
};

/**
 * Extract portfolio data from portfolio details response
 * @param {Object} parsedResponse - Response from parseChatResponse
 * @returns {Object|null} Portfolio division data or null if not portfolio details
 */
export const getPortfolioData = (parsedResponse) => {
  if (isPortfolioDetails(parsedResponse)) {
    return parsedResponse.content.division;
  }
  return null;
};

/**
 * Extract price data from current prices response
 * @param {Object} parsedResponse - Response from parseChatResponse
 * @returns {Object|null} Price book data or null if not current prices
 */
export const getPriceData = (parsedResponse) => {
  if (isCurrentPrices(parsedResponse)) {
    return parsedResponse.content.price_book;
  }
  return null;
};

/**
 * Extract swap data from swap response
 * @param {Object} parsedResponse - Response from parseChatResponse
 * @returns {Object|null} Swap data or null if not swap
 */
export const getSwapData = (parsedResponse) => {
  if (isSwap(parsedResponse)) {
    return parsedResponse.content;
  }
  return null;
};

/**
 * Extract plain text from plain text response
 * @param {Object} parsedResponse - Response from parseChatResponse
 * @returns {string|null} Plain text or null if not plain text
 */
export const getPlainText = (parsedResponse) => {
  if (isPlainText(parsedResponse)) {
    return parsedResponse.content.text;
  }
  return null;
};
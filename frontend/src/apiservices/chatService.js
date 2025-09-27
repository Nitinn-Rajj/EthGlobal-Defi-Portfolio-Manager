/**
 * Chat Service - Bridge Agent API
 * Base URL: http://127.0.0.1:8001
 * 
 * Handles communication with the bridge agent for cryptocurrency queries
 * Returns plain text response directly (no JSON parsing needed)
 */

import { API_CONFIG } from './config.js';

const CHAT_BASE_URL = API_CONFIG.CHAT_API.BASE_URL;

/**
 * Send a chat query to the bridge agent
 * @param {string} text - The query text to send
 * @returns {Promise<Object>} Response with timestamp, text (plain text), and agent_address
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
 * Get the plain text response from chat query
 * @param {string} text - The query text to send
 * @returns {Promise<string>} Plain text response
 */
export const getChatResponse = async (text) => {
  const response = await sendChatQuery(text);
  return response.text;
};

/**
 * Get full chat response with metadata
 * @param {string} text - The query text to send
 * @returns {Promise<Object>} Full response with timestamp, text, and agent_address
 */
export const getChatResponseWithMetadata = async (text) => {
  return await sendChatQuery(text);
};
/**
 * Trading Service
 * 
 * API functions for trading operations including swaps and limit orders
 */

import { API_CONFIG } from './config.js';

// Trading API runs on different server (port 3000)
const TRADING_BASE_URL = 'http://localhost:3000';
const REQUEST_CONFIG = API_CONFIG.REQUEST_CONFIG;

/**
 * Create a limit order on the 1inch protocol
 * @param {Object} params - Limit order parameters
 * @param {string} params.makerTokenAddress - Token you want to sell (use 0x0000...0000 for ETH)
 * @param {string} params.takerTokenAddress - Token you want to buy (use 0x0000...0000 for ETH)
 * @param {string} params.makerAmount - Amount of maker token in smallest units
 * @param {string} params.takerAmount - Amount of taker token in smallest units
 * @param {string} params.privateKey - Wallet private key
 * @param {number} [params.expirationHours=24] - Order expiration in hours (1-8760)
 * @returns {Promise<Object>} Order creation response
 */
export const createLimitOrder = async ({
  makerTokenAddress,
  takerTokenAddress,
  makerAmount,
  takerAmount,
  privateKey,
  expirationHours = 24
}) => {
  try {
    const response = await fetch(`${TRADING_BASE_URL}/limit-order`, {
      method: 'POST',
      headers: REQUEST_CONFIG.HEADERS,
      body: JSON.stringify({
        makerTokenAddress,
        takerTokenAddress,
        makerAmount,
        takerAmount,
        privateKey,
        expirationHours
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('Error creating limit order:', error);
    throw error;
  }
};

/**
 * Execute an immediate token swap using 1inch aggregator
 * @param {Object} params - Swap parameters
 * @param {string} params.srcToken - Source token contract address
 * @param {string} params.dstToken - Destination token contract address
 * @param {string} params.amount - Amount to swap in smallest units (wei)
 * @param {string} params.privateKey - Wallet private key
 * @param {string} params.walletAddress - Wallet address
 * @param {number} [params.slippage=1] - Slippage tolerance (0-50)
 * @returns {Promise<Object>} Swap execution response
 */
export const executeSwap = async ({
  srcToken,
  dstToken,
  amount,
  privateKey,
  walletAddress,
  slippage = 1
}) => {
  try {
    const response = await fetch(`${TRADING_BASE_URL}/swap`, {
      method: 'POST',
      headers: REQUEST_CONFIG.HEADERS,
      body: JSON.stringify({
        srcToken,
        dstToken,
        amount,
        slippage,
        privateKey,
        walletAddress
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('Error executing swap:', error);
    throw error;
  }
};
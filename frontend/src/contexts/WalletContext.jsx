import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import {
  connectMetaMask,
  getCurrentAccount,
  isMetaMaskInstalled,
  onAccountsChanged,
  onChainChanged,
  disconnectWallet,
  clearWalletCache,
  shouldShowDisconnectGuidance,
  forceWalletReset,
  getManualDisconnectInstructions,
  getDisconnectStatusMessage,
} from '../utils/wallet';
import { getDashboardDataAndParse } from '../apiservices/dashboardService';

// Initial state
const initialState = {
  isConnected: false,
  account: null,
  balance: '0',
  network: null,
  isConnecting: false,
  error: null,
  dashboardData: null,
  isLoadingDashboard: false,
  hasLoadedDashboardThisSession: false,
  lastDashboardRequestTime: null,
};

// Action types
const WALLET_ACTIONS = {
  SET_CONNECTING: 'SET_CONNECTING',
  SET_CONNECTED: 'SET_CONNECTED',
  SET_DISCONNECTED: 'SET_DISCONNECTED',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  UPDATE_BALANCE: 'UPDATE_BALANCE',
  SET_LOADING_DASHBOARD: 'SET_LOADING_DASHBOARD',
  SET_DASHBOARD_DATA: 'SET_DASHBOARD_DATA',
  SET_DASHBOARD_ERROR: 'SET_DASHBOARD_ERROR',
  SET_DASHBOARD_LOADED_THIS_SESSION: 'SET_DASHBOARD_LOADED_THIS_SESSION',
  SET_LAST_DASHBOARD_REQUEST_TIME: 'SET_LAST_DASHBOARD_REQUEST_TIME',
};

// Reducer
const walletReducer = (state, action) => {
  switch (action.type) {
    case WALLET_ACTIONS.SET_CONNECTING:
      return {
        ...state,
        isConnecting: true,
        error: null,
      };
    case WALLET_ACTIONS.SET_CONNECTED:
      return {
        ...state,
        isConnected: true,
        isConnecting: false,
        account: action.payload.address,
        balance: action.payload.balance,
        network: action.payload.network,
        error: null,
      };
    case WALLET_ACTIONS.SET_DISCONNECTED:
      return {
        ...initialState,
      };
    case WALLET_ACTIONS.SET_ERROR:
      return {
        ...state,
        isConnecting: false,
        error: action.payload,
      };
    case WALLET_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    case WALLET_ACTIONS.UPDATE_BALANCE:
      return {
        ...state,
        balance: action.payload,
      };
    case WALLET_ACTIONS.SET_LOADING_DASHBOARD:
      return {
        ...state,
        isLoadingDashboard: action.payload,
      };
    case WALLET_ACTIONS.SET_DASHBOARD_DATA:
      return {
        ...state,
        dashboardData: action.payload,
        isLoadingDashboard: false,
        hasLoadedDashboardThisSession: true,
      };
    case WALLET_ACTIONS.SET_DASHBOARD_ERROR:
      return {
        ...state,
        isLoadingDashboard: false,
        error: action.payload,
      };
    case WALLET_ACTIONS.SET_DASHBOARD_LOADED_THIS_SESSION:
      return {
        ...state,
        hasLoadedDashboardThisSession: action.payload,
      };
    case WALLET_ACTIONS.SET_LAST_DASHBOARD_REQUEST_TIME:
      return {
        ...state,
        lastDashboardRequestTime: action.payload,
      };
    default:
      return state;
  }
};

// Create context
const WalletContext = createContext();

// Rate limiting constants
const DASHBOARD_REQUEST_RATE_LIMIT_MS = 60 * 1000; // 1 minute in milliseconds

// Global request lock to prevent concurrent requests
let dashboardRequestInProgress = false;
let requestCounter = 0;

// Provider component
export const WalletProvider = ({ children }) => {
  const [state, dispatch] = useReducer(walletReducer, initialState);

  // Check if enough time has passed since last dashboard request
  const canMakeDashboardRequest = () => {
    if (!state.lastDashboardRequestTime) return true;
    
    const now = Date.now();
    const timeSinceLastRequest = now - state.lastDashboardRequestTime;
    return timeSinceLastRequest >= DASHBOARD_REQUEST_RATE_LIMIT_MS;
  };

  // Get remaining time before next request is allowed
  const getRemainingRateLimitTime = () => {
    if (!state.lastDashboardRequestTime) return 0;
    
    const now = Date.now();
    const timeSinceLastRequest = now - state.lastDashboardRequestTime;
    const remainingTime = DASHBOARD_REQUEST_RATE_LIMIT_MS - timeSinceLastRequest;
    return Math.max(0, remainingTime);
  };

  // Load dashboard data for connected wallet
  const loadDashboardData = useCallback(async (walletAddress, forceRefresh = false) => {
    if (!walletAddress) {
      console.log('❌ No wallet address provided, skipping dashboard data load');
      return;
    }

    // Prevent concurrent requests
    if (dashboardRequestInProgress) {
      console.log('🔒 Dashboard request already in progress, skipping...');
      return;
    }

    requestCounter++;
    const currentRequestId = requestCounter;
    console.log(`🔍 Dashboard load check #${currentRequestId}:`, {
      walletAddress,
      forceRefresh,
      hasLoadedThisSession: state.hasLoadedDashboardThisSession,
      canMakeRequest: canMakeDashboardRequest(),
      lastRequestTime: state.lastDashboardRequestTime,
      currentTime: Date.now()
    });

    // If data has already been loaded this session and not forcing refresh, skip
    if (state.hasLoadedDashboardThisSession && !forceRefresh) {
      console.log(`⏭️ Dashboard data already loaded this session, skipping request #${currentRequestId}...`);
      return;
    }

    // Check rate limiting unless forcing refresh
    if (!forceRefresh && !canMakeDashboardRequest()) {
      const remainingTime = Math.ceil(getRemainingRateLimitTime() / 1000);
      console.log(`⏳ Dashboard request #${currentRequestId} rate limited. Wait ${remainingTime} seconds before next request.`);
      return;
    }

    // Set the global lock
    dashboardRequestInProgress = true;
    console.log(`🚀 Making dashboard API request #${currentRequestId}...`);
    dispatch({ type: WALLET_ACTIONS.SET_LOADING_DASHBOARD, payload: true });

    try {
      // Update the last request time before making the request
      const requestTime = Date.now();
      dispatch({
        type: WALLET_ACTIONS.SET_LAST_DASHBOARD_REQUEST_TIME,
        payload: requestTime,
      });

      const dashboardData = await getDashboardDataAndParse(walletAddress, forceRefresh);
      console.log(`✅ Dashboard data loaded successfully for request #${currentRequestId}`);
      dispatch({
        type: WALLET_ACTIONS.SET_DASHBOARD_DATA,
        payload: dashboardData,
      });
    } catch (error) {
      console.error(`❌ Error loading dashboard data for request #${currentRequestId}:`, error);
      dispatch({
        type: WALLET_ACTIONS.SET_DASHBOARD_ERROR,
        payload: 'Failed to load portfolio data',
      });
      
      // Clear dashboard error after 5 seconds
      setTimeout(() => {
        dispatch({ type: WALLET_ACTIONS.CLEAR_ERROR });
      }, 5000);
    } finally {
      // Always release the lock
      dashboardRequestInProgress = false;
      console.log(`🔓 Released lock for dashboard request #${currentRequestId}`);
    }
  }, [state.hasLoadedDashboardThisSession, state.lastDashboardRequestTime]);

  // Connect wallet function
  const connect = async () => {
    if (!isMetaMaskInstalled()) {
      dispatch({
        type: WALLET_ACTIONS.SET_ERROR,
        payload: 'MetaMask is not installed. Please install MetaMask to continue.',
      });
      return;
    }

    dispatch({ type: WALLET_ACTIONS.SET_CONNECTING });

    try {
      const walletData = await connectMetaMask();
      dispatch({
        type: WALLET_ACTIONS.SET_CONNECTED,
        payload: walletData,
      });
      
      // Load dashboard data for the connected wallet
      await loadDashboardData(walletData.address);
    } catch (error) {
      let errorMessage = 'Failed to connect wallet';
      
      if (error.code === 4001) {
        errorMessage = 'Connection rejected by user';
      } else if (error.code === -32002) {
        errorMessage = 'Connection request already pending';
      } else if (error.message) {
        errorMessage = error.message;
      }

      dispatch({
        type: WALLET_ACTIONS.SET_ERROR,
        payload: errorMessage,
      });
    }
  };

  // Disconnect wallet function
  const disconnect = async () => {
    dispatch({ type: WALLET_ACTIONS.SET_CONNECTING }); // Show loading state during disconnect
    
    try {
      const result = await disconnectWallet();
      
      // Always clear local state
      dispatch({ type: WALLET_ACTIONS.SET_DISCONNECTED });
      
      // Provide user feedback based on disconnect method
      if (result.success) {
        if (result.method === 'revoke-permissions') {
          console.log('Wallet disconnected successfully - permissions revoked');
        } else if (result.method === 'user-rejected') {
          console.log('Wallet disconnected successfully - user rejected reconnection');
        } else {
          console.log('Wallet disconnected successfully');
        }
      } else if (result.method === 'manual') {
        // Check if manual disconnection guidance is needed
        const needsGuidance = await shouldShowDisconnectGuidance();
        
        if (needsGuidance) {
          console.log('Wallet state cleared locally. MetaMask still shows connection.');
          
          // Show informational message to user
          dispatch({
            type: WALLET_ACTIONS.SET_ERROR,
            payload: 'Disconnected locally. For complete disconnect, click the MetaMask extension → Connected sites → Disconnect this site.'
          });
          
          // Clear this informational message after 10 seconds
          setTimeout(() => {
            dispatch({ type: WALLET_ACTIONS.CLEAR_ERROR });
          }, 10000);
        } else {
          console.log('Wallet disconnected successfully');
        }
      } else if (result.method === 'error') {
        dispatch({
          type: WALLET_ACTIONS.SET_ERROR,
          payload: `Disconnect error: ${result.message}`
        });
        
        // Clear error after delay
        setTimeout(() => {
          dispatch({ type: WALLET_ACTIONS.CLEAR_ERROR });
        }, 5000);
      }
      
      // Force a brief delay and then check if we're truly disconnected
      setTimeout(async () => {
        try {
          const currentAccount = await getCurrentAccount();
          if (currentAccount) {
            // Still connected, show guidance
            dispatch({
              type: WALLET_ACTIONS.SET_ERROR,
              payload: 'For complete disconnect, please manually disconnect from MetaMask extension.'
            });
            
            setTimeout(() => {
              dispatch({ type: WALLET_ACTIONS.CLEAR_ERROR });
            }, 8000);
          }
        } catch (error) {
          // Error getting account likely means we're disconnected, which is good
          console.log('Disconnect verification complete');
        }
      }, 1000);
      
    } catch (error) {
      // Fallback: always clear local state even if disconnect fails
      dispatch({ type: WALLET_ACTIONS.SET_DISCONNECTED });
      console.error('Error during disconnect:', error);
      
      dispatch({
        type: WALLET_ACTIONS.SET_ERROR,
        payload: 'Wallet disconnected locally. Some cached data may persist in MetaMask.'
      });
      
      // Clear error after a delay
      setTimeout(() => {
        dispatch({ type: WALLET_ACTIONS.CLEAR_ERROR });
      }, 6000);
    }
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: WALLET_ACTIONS.CLEAR_ERROR });
  };

  // Force complete wallet disconnect with page reload
  const forceDisconnect = async () => {
    dispatch({ type: WALLET_ACTIONS.SET_CONNECTING });
    
    try {
      const result = await forceWalletReset();
      
      if (result.success) {
        console.log('Force disconnect initiated - page will reload');
        // The forceWalletReset function handles the page reload
      } else {
        dispatch({ type: WALLET_ACTIONS.SET_DISCONNECTED });
        dispatch({
          type: WALLET_ACTIONS.SET_ERROR,
          payload: `Force disconnect failed: ${result.message}`
        });
      }
    } catch (error) {
      dispatch({ type: WALLET_ACTIONS.SET_DISCONNECTED });
      dispatch({
        type: WALLET_ACTIONS.SET_ERROR,
        payload: 'Force disconnect failed. Please manually disconnect from MetaMask.'
      });
    }
  };

  // Check if already connected on mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const account = await getCurrentAccount();
        if (account) {
          dispatch({
            type: WALLET_ACTIONS.SET_CONNECTED,
            payload: account,
          });
          
          // Load dashboard data for the existing connected wallet
          await loadDashboardData(account.address);
        }
      } catch (error) {
        console.error('Error checking existing connection:', error);
      }
    };

    checkConnection();
  }, []);

  // Refresh dashboard data if wallet is connected (useful for page refreshes)
  const refreshDashboardData = useCallback(async (forceRefresh = false) => {
    console.log('📱 refreshDashboardData called:', {
      isConnected: state.isConnected,
      account: state.account,
      forceRefresh,
      hasLoadedThisSession: state.hasLoadedDashboardThisSession
    });

    if (state.isConnected && state.account) {
      // If data has already been loaded this session and not forcing refresh, skip
      if (state.hasLoadedDashboardThisSession && !forceRefresh) {
        console.log('⏭️ Dashboard data already loaded this session, skipping refresh...');
        return;
      }

      // Check rate limiting unless forcing refresh
      if (!forceRefresh && !canMakeDashboardRequest()) {
        const remainingTime = Math.ceil(getRemainingRateLimitTime() / 1000);
        console.log(`⏳ Dashboard refresh rate limited. Wait ${remainingTime} seconds before next request.`);
        return;
      }
      
      console.log('🔄 Refreshing dashboard data for connected wallet');
      await loadDashboardData(state.account, forceRefresh);
    } else {
      console.log('❌ Cannot refresh dashboard data: wallet not connected or no account');
    }
  }, [state.isConnected, state.account, state.hasLoadedDashboardThisSession, loadDashboardData]);

  // Reset the session flag to allow data loading again
  const resetDashboardSessionFlag = () => {
    dispatch({
      type: WALLET_ACTIONS.SET_DASHBOARD_LOADED_THIS_SESSION,
      payload: false,
    });
  };

  // Get request statistics for debugging
  const getDashboardRequestStats = () => {
    return {
      totalRequests: requestCounter,
      hasLoadedThisSession: state.hasLoadedDashboardThisSession,
      lastRequestTime: state.lastDashboardRequestTime,
      canMakeRequest: canMakeDashboardRequest(),
      remainingRateLimitMs: getRemainingRateLimitTime(),
      requestInProgress: dashboardRequestInProgress
    };
  };

  // Listen to account changes
  useEffect(() => {
    if (!isMetaMaskInstalled()) return;

    const handleAccountsChanged = async (accounts) => {
      if (accounts.length === 0) {
        disconnect();
      } else {
        try {
          const account = await getCurrentAccount();
          if (account) {
            // Reset session flag when account changes to allow loading new account data
            dispatch({
              type: WALLET_ACTIONS.SET_DASHBOARD_LOADED_THIS_SESSION,
              payload: false,
            });
            
            dispatch({
              type: WALLET_ACTIONS.SET_CONNECTED,
              payload: account,
            });
            
            // Load dashboard data for the new account (force refresh for account changes)
            await loadDashboardData(account.address, true);
          }
        } catch (error) {
          console.error('Error handling account change:', error);
          disconnect();
        }
      }
    };

    const handleChainChanged = () => {
      // Reload the page when chain changes to avoid issues
      window.location.reload();
    };

    const cleanupAccounts = onAccountsChanged(handleAccountsChanged);
    const cleanupChain = onChainChanged(handleChainChanged);

    return () => {
      if (cleanupAccounts) cleanupAccounts();
      if (cleanupChain) cleanupChain();
    };
  }, []);

  const value = {
    ...state,
    connect,
    disconnect,
    forceDisconnect,
    clearError,
    loadDashboardData,
    refreshDashboardData,
    resetDashboardSessionFlag,
    canMakeDashboardRequest,
    getRemainingRateLimitTime,
    getDashboardRequestStats,
    getManualDisconnectInstructions,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

// Hook to use wallet context
export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
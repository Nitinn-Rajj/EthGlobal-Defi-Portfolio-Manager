import React, { createContext, useContext, useReducer, useEffect } from 'react';
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

// Initial state
const initialState = {
  isConnected: false,
  account: null,
  balance: '0',
  network: null,
  isConnecting: false,
  error: null,
};

// Action types
const WALLET_ACTIONS = {
  SET_CONNECTING: 'SET_CONNECTING',
  SET_CONNECTED: 'SET_CONNECTED',
  SET_DISCONNECTED: 'SET_DISCONNECTED',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  UPDATE_BALANCE: 'UPDATE_BALANCE',
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
    default:
      return state;
  }
};

// Create context
const WalletContext = createContext();

// Provider component
export const WalletProvider = ({ children }) => {
  const [state, dispatch] = useReducer(walletReducer, initialState);

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
        }
      } catch (error) {
        console.error('Error checking existing connection:', error);
      }
    };

    checkConnection();
  }, []);

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
            dispatch({
              type: WALLET_ACTIONS.SET_CONNECTED,
              payload: account,
            });
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
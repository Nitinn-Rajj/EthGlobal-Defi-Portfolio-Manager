import { ethers } from 'ethers';

// Check if MetaMask is installed
export const isMetaMaskInstalled = () => {
  return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
};

// Connect to MetaMask
export const connectMetaMask = async () => {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed');
  }

  try {
    // Request account access
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });

    if (accounts.length === 0) {
      throw new Error('No accounts found');
    }

    // Create provider and signer
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    const balance = await provider.getBalance(address);
    
    // Get network information
    const network = await provider.getNetwork();
    
    return {
      address,
      balance: ethers.formatEther(balance),
      provider,
      signer,
      network: {
        chainId: Number(network.chainId),
        name: network.name
      }
    };
  } catch (error) {
    console.error('Error connecting to MetaMask:', error);
    throw error;
  }
};

// Disconnect wallet (attempt to revoke permissions and clear local state)
export const disconnectWallet = async () => {
  if (!isMetaMaskInstalled()) {
    return { success: true, method: 'no-metamask' };
  }

  // Always clear local cache first
  clearWalletCache();

  try {
    // Try to revoke permissions (newer MetaMask versions)
    if (window.ethereum.request) {
      try {
        await window.ethereum.request({
          method: 'wallet_revokePermissions',
          params: [{
            eth_accounts: {}
          }]
        });
        return { success: true, method: 'revoke-permissions' };
      } catch (revokeError) {
        console.log('wallet_revokePermissions not available:', revokeError.message);
        
        // Try alternative approach - request accounts with rejection
        try {
          // This will trigger MetaMask popup, which user can reject to disconnect
          await window.ethereum.request({
            method: 'eth_requestAccounts',
          });
          
          // If user approves, we still clear local state
          return { 
            success: false, 
            method: 'manual',
            message: 'Please manually disconnect from MetaMask for complete disconnection'
          };
        } catch (requestError) {
          // If user rejects the request, that's actually what we want for disconnect
          if (requestError.code === 4001) {
            return { success: true, method: 'user-rejected' };
          }
          console.log('wallet_requestAccounts disconnect not successful:', requestError.message);
        }
      }
    }
    
    // If API methods don't work, clear local state and return guidance
    return { 
      success: false, 
      method: 'manual',
      message: 'Complete disconnection requires manual action in MetaMask'
    };
  } catch (error) {
    console.error('Error during disconnect:', error);
    return { 
      success: false, 
      method: 'error',
      message: error.message
    };
  }
};

// Get current account if already connected
export const getCurrentAccount = async () => {
  if (!isMetaMaskInstalled()) {
    return null;
  }

  try {
    const accounts = await window.ethereum.request({
      method: 'eth_accounts',
    });

    if (accounts.length === 0) {
      return null;
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    const balance = await provider.getBalance(address);
    const network = await provider.getNetwork();
    
    return {
      address,
      balance: ethers.formatEther(balance),
      provider,
      signer,
      network: {
        chainId: Number(network.chainId),
        name: network.name
      }
    };
  } catch (error) {
    console.error('Error getting current account:', error);
    return null;
  }
};

// Format address for display (show first 6 and last 4 characters)
export const formatAddress = (address) => {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

// Format balance for display
export const formatBalance = (balance) => {
  if (!balance) return '0';
  const num = parseFloat(balance);
  return num.toFixed(4);
};

// Listen to account changes
export const onAccountsChanged = (callback) => {
  if (!isMetaMaskInstalled()) return;
  
  window.ethereum.on('accountsChanged', callback);
  
  // Return cleanup function
  return () => {
    window.ethereum.removeListener('accountsChanged', callback);
  };
};

// Listen to network changes
export const onChainChanged = (callback) => {
  if (!isMetaMaskInstalled()) return;
  
  window.ethereum.on('chainChanged', callback);
  
  // Return cleanup function
  return () => {
    window.ethereum.removeListener('chainChanged', callback);
  };
};

// Clear local storage and session data related to wallet
export const clearWalletCache = () => {
  try {
    // Clear any wallet-related items from localStorage
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('wallet') || key.includes('metamask') || key.includes('ethereum'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // Clear any wallet-related items from sessionStorage
    const sessionKeysToRemove = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && (key.includes('wallet') || key.includes('metamask') || key.includes('ethereum'))) {
        sessionKeysToRemove.push(key);
      }
    }
    sessionKeysToRemove.forEach(key => sessionStorage.removeItem(key));
    
    console.log('Wallet cache cleared');
  } catch (error) {
    console.error('Error clearing wallet cache:', error);
  }
};

// Check if user needs manual disconnection guidance
export const shouldShowDisconnectGuidance = async () => {
  if (!isMetaMaskInstalled()) return false;
  
  try {
    // Check if there are still connected accounts after our disconnect attempt
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    return accounts && accounts.length > 0;
  } catch (error) {
    return false;
  }
};

// Force a complete reset of wallet connection state
export const forceWalletReset = async () => {
  if (!isMetaMaskInstalled()) {
    return { success: true, method: 'no-metamask' };
  }

  try {
    // Clear all local cache
    clearWalletCache();
    
    // Try to revoke all permissions first
    try {
      await window.ethereum.request({
        method: 'wallet_revokePermissions',
        params: [{
          eth_accounts: {}
        }]
      });
    } catch (error) {
      console.log('Could not revoke permissions:', error.message);
    }

    // Clear any cached provider instances
    if (window.ethereum._providers) {
      window.ethereum._providers.clear();
    }
    
    // Force a page reload after a short delay to ensure clean state
    setTimeout(() => {
      console.log('Forcing page reload to ensure clean wallet state...');
      window.location.reload();
    }, 1500);
    
    return { success: true, method: 'force-reset' };
  } catch (error) {
    console.error('Error during force wallet reset:', error);
    return { 
      success: false, 
      method: 'error',
      message: error.message 
    };
  }
};

// Get manual disconnect instructions for user
export const getManualDisconnectInstructions = () => {
  return {
    title: "Complete Wallet Disconnect",
    steps: [
      "1. Click the MetaMask extension icon in your browser",
      "2. Click on 'Connected' or the connection indicator", 
      "3. Find this website in the connected sites list",
      "4. Click 'Disconnect' next to this site",
      "5. Refresh the page to ensure clean state"
    ],
    shortInstruction: "MetaMask extension → Connected sites → Disconnect this site"
  };
};

// Get user-friendly disconnect status message
export const getDisconnectStatusMessage = (result) => {
  switch (result.method) {
    case 'revoke-permissions':
      return {
        type: 'success',
        message: 'Successfully disconnected and revoked permissions!'
      };
    case 'user-rejected':
      return {
        type: 'success', 
        message: 'Disconnected successfully!'
      };
    case 'force-reset':
      return {
        type: 'info',
        message: 'Force disconnect initiated. Page will reload to ensure clean state.'
      };
    case 'manual':
      return {
        type: 'warning',
        message: 'Disconnected locally. For complete disconnect, manually disconnect from MetaMask extension.'
      };
    case 'error':
      return {
        type: 'error',
        message: `Disconnect error: ${result.message || 'Unknown error'}`
      };
    default:
      return {
        type: 'info',
        message: 'Wallet disconnected locally.'
      };
  }
};
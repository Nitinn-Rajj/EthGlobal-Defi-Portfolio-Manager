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

// Disconnect wallet (clear local state)
export const disconnectWallet = () => {
  // Note: We can't actually disconnect MetaMask programmatically
  // This function is for clearing local application state
  return null;
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
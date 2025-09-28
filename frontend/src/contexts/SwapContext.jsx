import React, { createContext, useContext, useState } from 'react';

const SwapContext = createContext();

export const useSwap = () => {
  const context = useContext(SwapContext);
  if (!context) {
    throw new Error('useSwap must be used within a SwapProvider');
  }
  return context;
};

export const SwapProvider = ({ children }) => {
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [swapConfig, setSwapConfig] = useState(null);

  const openSwapModal = (config = null) => {
    console.log('🔄 Opening swap modal with config:', config);
    setSwapConfig(config);
    setIsSwapModalOpen(true);
  };

  const closeSwapModal = () => {
    console.log('❌ Closing swap modal');
    setIsSwapModalOpen(false);
    setSwapConfig(null);
  };

  const value = {
    isSwapModalOpen,
    swapConfig,
    openSwapModal,
    closeSwapModal,
  };

  return (
    <SwapContext.Provider value={value}>
      {children}
    </SwapContext.Provider>
  );
};
import React, { createContext, useContext, useState } from 'react';

const LimitOrderContext = createContext();

export const useLimitOrder = () => {
  const context = useContext(LimitOrderContext);
  if (!context) {
    throw new Error('useLimitOrder must be used within a LimitOrderProvider');
  }
  return context;
};

export const LimitOrderProvider = ({ children }) => {
  const [isLimitOrderModalOpen, setIsLimitOrderModalOpen] = useState(false);
  const [limitOrderConfig, setLimitOrderConfig] = useState(null);

  const openLimitOrderModal = (config = null) => {
    console.log('📋 Opening limit order modal with config:', config);
    setLimitOrderConfig(config);
    setIsLimitOrderModalOpen(true);
  };

  const closeLimitOrderModal = () => {
    console.log('❌ Closing limit order modal');
    setIsLimitOrderModalOpen(false);
    setLimitOrderConfig(null);
  };

  const value = {
    isLimitOrderModalOpen,
    limitOrderConfig,
    openLimitOrderModal,
    closeLimitOrderModal,
  };

  return (
    <LimitOrderContext.Provider value={value}>
      {children}
    </LimitOrderContext.Provider>
  );
};
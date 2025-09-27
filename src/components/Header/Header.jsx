import React, { useState, useEffect } from 'react';
import { useWallet } from '../../contexts/WalletContext';
import { formatAddress, formatBalance } from '../../utils/wallet';
import { scrollToDashboard } from '../../utils/scroll';
import './Header.css';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { 
    isConnected, 
    account, 
    balance, 
    network,
    isConnecting, 
    error, 
    connect, 
    disconnect,
    clearError
  } = useWallet();

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setIsScrolled(scrollTop > 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const handleWalletClick = () => {
    if (isConnected) {
      disconnect();
    } else {
      connect();
    }
  };

  const handleDashboardClick = () => {
    scrollToDashboard();
  };

  return (
    <header className={`header ${isScrolled ? 'header--scrolled' : ''}`}>
      <div className="header__container">
        <div className="header__content">
          <div className="header__logo">
            <span className="header__logo-icon">⚡</span>
            <span className="header__logo-text">Portfolio Manager</span>
          </div>
          <div className="header__actions">
            <button className="header__nav-btn" onClick={handleDashboardClick}>
              Dashboards
            </button>
            
            {/* Error Display */}
            {error && (
              <div className="header__error">
                <span className="header__error-text">{error}</span>
                <button 
                  className="header__error-close"
                  onClick={clearError}
                  title="Close error"
                >
                  ×
                </button>
              </div>
            )}
            
            {/* Wallet Button */}
            <div className="header__wallet">
              <button 
                className={`header__wallet-btn ${isConnected ? 'header__wallet-btn--connected' : ''}`}
                onClick={handleWalletClick}
                disabled={isConnecting}
              >
                {isConnecting ? (
                  <>
                    <span className="header__wallet-spinner"></span>
                    Connecting...
                  </>
                ) : isConnected ? (
                  <div className="header__wallet-info">
                    <div className="header__wallet-address">
                      {formatAddress(account)}
                    </div>
                    <div className="header__wallet-balance">
                      {formatBalance(balance)} ETH
                    </div>
                  </div>
                ) : (
                  'Connect Wallet'
                )}
              </button>
              
              {/* Network Info */}
              {isConnected && network && (
                <div className="header__network">
                  <span className="header__network-indicator"></span>
                  <span className="header__network-name">
                    {network.name === 'unknown' ? `Chain ${network.chainId}` : network.name}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
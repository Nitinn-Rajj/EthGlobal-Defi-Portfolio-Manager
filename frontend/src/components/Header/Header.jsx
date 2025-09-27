import React, { useState, useEffect } from 'react';
import { useWallet } from '../../contexts/WalletContext';
import { useChat } from '../../contexts/ChatContext';
import { formatAddress, formatBalance } from '../../utils/wallet';
import { scrollToDashboard } from '../../utils/scroll';
import logoImage from '../../assets/logo.jpeg';
import './Header.css';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showDisconnectOptions, setShowDisconnectOptions] = useState(false);
  const { 
    isConnected, 
    account, 
    balance, 
    network,
    isConnecting, 
    error, 
    connect, 
    disconnect,
    forceDisconnect,
    clearError
  } = useWallet();
  
  const { isChatOpen, toggleChat } = useChat();

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
      // For connected wallets, show disconnect options or just disconnect
      setShowDisconnectOptions(!showDisconnectOptions);
    } else {
      connect();
    }
  };

  const handleRegularDisconnect = () => {
    setShowDisconnectOptions(false);
    disconnect();
  };

  const handleForceDisconnect = () => {
    setShowDisconnectOptions(false);
    forceDisconnect();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDisconnectOptions && !event.target.closest('.header__wallet')) {
        setShowDisconnectOptions(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showDisconnectOptions]);

  const handleDashboardClick = () => {
    scrollToDashboard();
  };

  return (
    <header className={`header ${isScrolled ? 'header--scrolled' : ''}`}>
      <div className="header__container">
        <div className="header__content">
          <div className="header__logo">
            <img src={logoImage} alt="FinverseX Logo" className="header__logo-icon" />
            <span className="header__logo-text">ASI FinverseX</span>
          </div>
          <div className="header__actions">
            <button className="header__nav-btn" onClick={handleDashboardClick}>
              Dashboards
            </button>
            
            <button 
              className={`header__nav-btn header__nav-btn--chat ${isChatOpen ? 'header__nav-btn--active' : ''}`}
              onClick={toggleChat}
              title={isChatOpen ? 'Close AI Chat' : 'Open AI Chat'}
            >
              {/* <span className="header__nav-btn-icon"></span> */}
              AI Chat
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
                    {isConnected ? 'Disconnecting...' : 'Connecting...'}
                  </>
                ) : isConnected ? (
                  <div className="header__wallet-info">
                    <div className="header__wallet-address">
                      {formatAddress(account)}
                    </div>
                    {/* <div className="header__wallet-balance">
                      {formatBalance(balance)} ETH
                    </div> */}
                  </div>
                ) : (
                  'Connect Wallet'
                )}
              </button>
              
              {/* Disconnect Options Dropdown */}
              {isConnected && showDisconnectOptions && (
                <div className="header__disconnect-dropdown">
                  <button 
                    className="header__disconnect-option"
                    onClick={handleRegularDisconnect}
                    title="Disconnect locally and attempt to revoke permissions"
                  >
                    <span className="header__disconnect-icon">🔌</span>
                    Quick Disconnect
                  </button>
                  <button 
                    className="header__disconnect-option header__disconnect-option--force"
                    onClick={handleForceDisconnect}
                    title="Force complete disconnect with page reload"
                  >
                    <span className="header__disconnect-icon">⚡</span>
                    Force Disconnect
                  </button>
                  {/* <div className="header__disconnect-info">
                    <small>Force disconnect clears all data and reloads the page</small>
                  </div> */}
                </div>
              )}
              
              {/* Network Info */}
              {/* {isConnected && network && !showDisconnectOptions && (
                <div className="header__network">
                  <span className="header__network-indicator"></span>
                  <span className="header__network-name">
                    {network.name === 'unknown' ? `Chain ${network.chainId}` : network.name}
                  </span>
                </div>
              )} */}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
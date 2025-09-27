import React, { useState, useEffect } from 'react';
import { useWallet } from '../../contexts/WalletContext';
import { formatBalance } from '../../utils/wallet';
import './Dashboard.css';

const Dashboard = () => {
  const { 
    isConnected, 
    account, 
    balance, 
    network, 
    connect,
    disconnect,
    isConnecting,
    error,
    clearError
  } = useWallet();

  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrollY(currentScrollY);
      
      // Show dashboard when scrolled down 300px
      setIsVisible(currentScrollY > 300);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Clear error after 5 seconds (consistent with header)
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  if (!isConnected) {
    return (
      <section className="dashboard dashboard--empty">
        <div className="dashboard__container">
          <div className="dashboard__empty-state">
            <div className="dashboard__empty-icon">🔗</div>
            <h2 className="dashboard__empty-title">Connect Your Wallet</h2>
            <p className="dashboard__empty-subtitle">
              Connect your MetaMask wallet to view your portfolio and start managing your DeFi investments.
            </p>
            <button 
              className="dashboard__connect-btn" 
              onClick={connect}
              disabled={isConnecting}
            >
              {isConnecting ? (
                <>
                  <span className="dashboard__connect-spinner"></span>
                  Connecting...
                </>
              ) : (
                'Connect Wallet'
              )}
            </button>
            {error && (
              <div className="dashboard__error">
                <span className="dashboard__error-text">{error}</span>
                <button 
                  className="dashboard__error-close"
                  onClick={clearError}
                  title="Close error"
                >
                  ×
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`dashboard ${isVisible ? 'dashboard--visible' : ''}`}>
      <div className="dashboard__container">
        <div className="dashboard__header">
          <div className="dashboard__title-section">
            <h2 className="dashboard__title">Portfolio Dashboard</h2>
            <p className="dashboard__subtitle">Your DeFi portfolio overview</p>
          </div>
          <button 
            className="dashboard__disconnect-btn"
            onClick={disconnect}
            title="Disconnect Wallet"
          >
            Disconnect
          </button>
        </div>

        <div className="dashboard__grid">
          {/* Account Overview */}
          <div className="dashboard__card dashboard__card--account">
            <div className="dashboard__card-header">
              <h3 className="dashboard__card-title">Account Overview</h3>
              <div className="dashboard__account-status">
                <div className="dashboard__status-indicator"></div>
                <span>Connected</span>
              </div>
            </div>
            <div className="dashboard__card-content">
              <div className="dashboard__account-info">
                <div className="dashboard__account-address">
                  <label>Address:</label>
                  <div className="dashboard__address-display">
                    <span className="dashboard__address">{account}</span>
                    <button 
                      className="dashboard__copy-btn"
                      onClick={() => navigator.clipboard.writeText(account)}
                      title="Copy address"
                    >
                      📋
                    </button>
                  </div>
                </div>
                {network && (
                  <div className="dashboard__network-info">
                    <label>Network:</label>
                    <div className="dashboard__network-display">
                      <span className="dashboard__network-name">
                        {network.name === 'unknown' ? `Chain ${network.chainId}` : network.name}
                      </span>
                      <span className="dashboard__chain-id">Chain ID: {network.chainId}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Balance Card */}
          <div className="dashboard__card dashboard__card--balance">
            <div className="dashboard__card-header">
              <h3 className="dashboard__card-title">ETH Balance</h3>
              <div className="dashboard__balance-icon">⚡</div>
            </div>
            <div className="dashboard__card-content">
              <div className="dashboard__balance-amount">
                <span className="dashboard__balance-value">{formatBalance(balance)}</span>
                <span className="dashboard__balance-currency">ETH</span>
              </div>
              <div className="dashboard__balance-usd">
                <span>≈ $0.00 USD</span>
                <small>(Price data coming soon)</small>
              </div>
            </div>
          </div>

          {/* Portfolio Summary */}
          <div className="dashboard__card dashboard__card--portfolio">
            <div className="dashboard__card-header">
              <h3 className="dashboard__card-title">Portfolio Summary</h3>
              <span className="dashboard__portfolio-change">+0.00%</span>
            </div>
            <div className="dashboard__card-content">
              <div className="dashboard__portfolio-stats">
                <div className="dashboard__stat">
                  <label>Total Value:</label>
                  <span>{formatBalance(balance)} ETH</span>
                </div>
                <div className="dashboard__stat">
                  <label>Assets:</label>
                  <span>1 Token</span>
                </div>
                <div className="dashboard__stat">
                  <label>24h Change:</label>
                  <span className="dashboard__stat--positive">+0.00%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="dashboard__card dashboard__card--activity">
            <div className="dashboard__card-header">
              <h3 className="dashboard__card-title">Recent Activity</h3>
              <button className="dashboard__view-all">View All</button>
            </div>
            <div className="dashboard__card-content">
              <div className="dashboard__activity-list">
                <div className="dashboard__activity-empty">
                  <span>🔄</span>
                  <p>No recent transactions</p>
                  <small>Your transaction history will appear here</small>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="dashboard__card dashboard__card--actions">
            <div className="dashboard__card-header">
              <h3 className="dashboard__card-title">Quick Actions</h3>
            </div>
            <div className="dashboard__card-content">
              <div className="dashboard__action-buttons">
                <button className="dashboard__action-btn dashboard__action-btn--send">
                  <span className="dashboard__action-icon">📤</span>
                  Send
                </button>
                <button className="dashboard__action-btn dashboard__action-btn--receive">
                  <span className="dashboard__action-icon">📥</span>
                  Receive
                </button>
                <button className="dashboard__action-btn dashboard__action-btn--swap">
                  <span className="dashboard__action-icon">🔄</span>
                  Swap
                </button>
                <button className="dashboard__action-btn dashboard__action-btn--stake">
                  <span className="dashboard__action-icon">🏦</span>
                  Stake
                </button>
              </div>
            </div>
          </div>

          {/* Token List */}
          <div className="dashboard__card dashboard__card--tokens">
            <div className="dashboard__card-header">
              <h3 className="dashboard__card-title">Your Tokens</h3>
              <button className="dashboard__add-token">+ Add Token</button>
            </div>
            <div className="dashboard__card-content">
              <div className="dashboard__token-list">
                <div className="dashboard__token-item">
                  <div className="dashboard__token-info">
                    <div className="dashboard__token-icon">Ξ</div>
                    <div className="dashboard__token-details">
                      <span className="dashboard__token-name">Ethereum</span>
                      <span className="dashboard__token-symbol">ETH</span>
                    </div>
                  </div>
                  <div className="dashboard__token-balance">
                    <span className="dashboard__token-amount">{formatBalance(balance)}</span>
                    <span className="dashboard__token-value">$0.00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
import React, { useState, useEffect } from 'react';
import { useWallet } from '../../contexts/WalletContext';
import { getCurrentPrices } from '../../apiservices/dashboardService';
import './SwapModal.css';

const SwapModal = ({ isOpen, onClose }) => {
  // Available tokens for swapping
  const AVAILABLE_TOKENS = [
    { symbol: 'ETH', name: 'Ethereum', icon: '⟠', color: '#627EEA' },
    { symbol: 'BTC', name: 'Bitcoin', icon: '₿', color: '#F7931A' },
    { symbol: 'USDC', name: 'USD Coin', icon: '$', color: '#2775CA' },
    { symbol: 'USDT', name: 'Tether', icon: '$', color: '#26A17B' },
    { symbol: 'SOL', name: 'Solana', icon: '◎', color: '#9945FF' },
    { symbol: 'ADA', name: 'Cardano', icon: '₳', color: '#0033AD' },
    { symbol: 'DOT', name: 'Polkadot', icon: '●', color: '#E6007A' },
    { symbol: 'LINK', name: 'Chainlink', icon: '🔗', color: '#375BD2' },
  ];

  // State management
  const [currentStep, setCurrentStep] = useState(1); // 1: Swap Details, 2: Review, 3: Private Key
  const [fromToken, setFromToken] = useState(AVAILABLE_TOKENS[0]);
  const [toToken, setToToken] = useState(AVAILABLE_TOKENS[2]);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [slippage, setSlippage] = useState('0.5');
  const [privateKey, setPrivateKey] = useState('');
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Get wallet context
  const { dashboardData, isConnected, account, balance } = useWallet();

  // Get current token prices
  const getTokenPrices = () => {
    if (!dashboardData) return {};
    const prices = getCurrentPrices(dashboardData) || {};
    return {
      ...prices,
      USDC: 1.00,
      USDT: 1.00
    };
  };

  // Calculate estimated swap amount
  const calculateEstimatedAmount = () => {
    if (!fromAmount || !fromToken || !toToken) return '';
    const prices = getTokenPrices();
    const fromPrice = prices[fromToken.symbol] || 0;
    const toPrice = prices[toToken.symbol] || 0;
    
    if (fromPrice && toPrice) {
      const usdValue = parseFloat(fromAmount) * fromPrice;
      const estimatedAmount = usdValue / toPrice;
      return estimatedAmount.toFixed(6);
    }
    return '';
  };

  // Handle token swap
  const handleSwapTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  // Handle form submission
  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
      if (currentStep === 1) {
        setToAmount(calculateEstimatedAmount());
      }
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleExecuteSwap = () => {
    if (!privateKey.trim()) {
      setError('Private key is required to execute the swap');
      return;
    }
    
    setIsLoading(true);
    // Simulate swap execution
    setTimeout(() => {
      setIsLoading(false);
      alert('Swap executed successfully! (This is a simulation)');
      onClose();
      // Reset form
      setCurrentStep(1);
      setFromAmount('');
      setToAmount('');
      setPrivateKey('');
      setError('');
    }, 2000);
  };

  const handleClose = () => {
    setCurrentStep(1);
    setFromAmount('');
    setToAmount('');
    setPrivateKey('');
    setError('');
    onClose();
  };

  // Don't render if modal is not open
  if (!isOpen) return null;

  return (
    <div className="swap-modal-overlay" onClick={handleClose}>
      <div className="swap-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="swap-modal__header">
          <h2 className="swap-modal__title">
            {currentStep === 1 ? 'Swap Tokens' : currentStep === 2 ? 'Review Swap' : 'Confirm Transaction'}
          </h2>
          <button className="swap-modal__close" onClick={handleClose}>
            ×
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="swap-modal__progress">
          <div className={`swap-modal__step ${currentStep >= 1 ? 'active' : ''}`}>
            <span>1</span>
            <small>Details</small>
          </div>
          <div className={`swap-modal__step ${currentStep >= 2 ? 'active' : ''}`}>
            <span>2</span>
            <small>Review</small>
          </div>
          <div className={`swap-modal__step ${currentStep >= 3 ? 'active' : ''}`}>
            <span>3</span>
            <small>Confirm</small>
          </div>
        </div>

        {/* Content */}
        <div className="swap-modal__content">
          {/* Step 1: Swap Details */}
          {currentStep === 1 && (
            <div className="swap-step">
              <div className="swap-section">
                <label className="swap-label">From</label>
                <div className="swap-input-group">
                  <div className="token-selector" onClick={() => setShowFromDropdown(!showFromDropdown)}>
                    <div className="token-display">
                      <span className="token-icon" style={{ color: fromToken.color }}>
                        {fromToken.icon}
                      </span>
                      <div className="token-info">
                        <span className="token-symbol">{fromToken.symbol}</span>
                        <small className="token-name">{fromToken.name}</small>
                      </div>
                    </div>
                    <span className="dropdown-arrow">▼</span>
                  </div>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={fromAmount}
                    onChange={(e) => setFromAmount(e.target.value)}
                    className="amount-input"
                  />
                </div>
                {showFromDropdown && (
                  <div className="token-dropdown">
                    {AVAILABLE_TOKENS.map((token) => (
                      <div
                        key={token.symbol}
                        className="token-option"
                        onClick={() => {
                          setFromToken(token);
                          setShowFromDropdown(false);
                        }}
                      >
                        <span className="token-icon" style={{ color: token.color }}>
                          {token.icon}
                        </span>
                        <span className="token-symbol">{token.symbol}</span>
                        <span className="token-name">{token.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="swap-divider">
                <button className="swap-button" onClick={handleSwapTokens}>
                  ⇅
                </button>
              </div>

              <div className="swap-section">
                <label className="swap-label">To</label>
                <div className="swap-input-group">
                  <div className="token-selector" onClick={() => setShowToDropdown(!showToDropdown)}>
                    <div className="token-display">
                      <span className="token-icon" style={{ color: toToken.color }}>
                        {toToken.icon}
                      </span>
                      <div className="token-info">
                        <span className="token-symbol">{toToken.symbol}</span>
                        <small className="token-name">{toToken.name}</small>
                      </div>
                    </div>
                    <span className="dropdown-arrow">▼</span>
                  </div>
                  <input
                    type="text"
                    placeholder="0.00"
                    value={calculateEstimatedAmount()}
                    readOnly
                    className="amount-input"
                  />
                </div>
                {showToDropdown && (
                  <div className="token-dropdown">
                    {AVAILABLE_TOKENS.map((token) => (
                      <div
                        key={token.symbol}
                        className="token-option"
                        onClick={() => {
                          setToToken(token);
                          setShowToDropdown(false);
                        }}
                      >
                        <span className="token-icon" style={{ color: token.color }}>
                          {token.icon}
                        </span>
                        <span className="token-symbol">{token.symbol}</span>
                        <span className="token-name">{token.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="swap-settings">
                <label className="swap-label">Slippage Tolerance</label>
                <div className="slippage-options">
                  {['0.1', '0.5', '1.0'].map((value) => (
                    <button
                      key={value}
                      className={`slippage-btn ${slippage === value ? 'active' : ''}`}
                      onClick={() => setSlippage(value)}
                    >
                      {value}%
                    </button>
                  ))}
                  <input
                    type="number"
                    placeholder="Custom"
                    value={slippage}
                    onChange={(e) => setSlippage(e.target.value)}
                    className="slippage-custom"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Review */}
          {currentStep === 2 && (
            <div className="swap-step">
              <div className="swap-review">
                <h3>Review Your Swap</h3>
                <div className="review-item">
                  <span>From:</span>
                  <span>{fromAmount} {fromToken.symbol}</span>
                </div>
                <div className="review-item">
                  <span>To:</span>
                  <span>{calculateEstimatedAmount()} {toToken.symbol}</span>
                </div>
                <div className="review-item">
                  <span>Slippage:</span>
                  <span>{slippage}%</span>
                </div>
                <div className="review-item">
                  <span>Network:</span>
                  <span>Ethereum</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Private Key */}
          {currentStep === 3 && (
            <div className="swap-step">
              <div className="private-key-section">
                <h3>Confirm Transaction</h3>
                <p className="security-warning">
                  ⚠️ Enter your private key to sign and execute the transaction. 
                  Your key is never stored and used only for this transaction.
                </p>
                <div className="input-group">
                  <label className="swap-label">Private Key</label>
                  <input
                    type="password"
                    placeholder="Enter your private key"
                    value={privateKey}
                    onChange={(e) => setPrivateKey(e.target.value)}
                    className="private-key-input"
                  />
                </div>
                <div className="transaction-summary">
                  <div className="summary-item">
                    <span>Swapping:</span>
                    <span>{fromAmount} {fromToken.symbol} → {calculateEstimatedAmount()} {toToken.symbol}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="swap-modal__footer">
          {currentStep > 1 && (
            <button
              className="btn btn-secondary"
              onClick={handlePreviousStep}
              disabled={isLoading}
            >
              Previous
            </button>
          )}
          
          {currentStep < 3 ? (
            <button
              className="btn btn-primary"
              onClick={handleNextStep}
              disabled={!fromAmount || isLoading}
            >
              Next
            </button>
          ) : (
            <button
              className="btn btn-primary"
              onClick={handleExecuteSwap}
              disabled={!privateKey.trim() || isLoading}
            >
              {isLoading ? 'Executing...' : 'Execute Swap'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SwapModal;
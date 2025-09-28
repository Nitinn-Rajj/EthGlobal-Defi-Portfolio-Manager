import React, { useState, useEffect } from 'react';
import { useWallet } from '../../contexts/WalletContext';
import { createLimitOrder } from '../../apiservices/tradingService';
import './LimitOrderModal.css';

const LimitOrderModal = ({ isOpen, onClose }) => {
  // Available tokens for limit orders
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

  // Token contract addresses (using common Ethereum mainnet addresses)
  const TOKEN_ADDRESSES = {
    'ETH': '0x0000000000000000000000000000000000000000', // ETH placeholder
    'BTC': '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', // WBTC
    'USDC': '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    'USDT': '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    'SOL': '0xD31a59c85aE9D8edEFeC411D448f90841571b89c', // SOL on Ethereum
    'ADA': '0x3Ee2200Efb3400fAbB9AacF31297cBdD1d435D47', // ADA on Ethereum
    'DOT': '0x7083609fCE4d1d8Dc0C979AAb8c869Ea2C873402', // DOT on Ethereum
    'LINK': '0x514910771AF9Ca656af840dff83E8264EcF986CA',
  };

  // State management
  const [currentStep, setCurrentStep] = useState(1); // 1: Order Details, 2: Review, 3: Private Key
  const [makerToken, setMakerToken] = useState(AVAILABLE_TOKENS[0]); // Token you're offering
  const [takerToken, setTakerToken] = useState(AVAILABLE_TOKENS[2]); // Token you want
  const [makingAmount, setMakingAmount] = useState(''); // Amount you're offering
  const [takingAmount, setTakingAmount] = useState(''); // Amount you want
  const [priceRatio, setPriceRatio] = useState(''); // Price ratio for limit order
  const [privateKey, setPrivateKey] = useState('');
  const [showMakerDropdown, setShowMakerDropdown] = useState(false);
  const [showTakerDropdown, setShowTakerDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [expiryTime, setExpiryTime] = useState('24'); // Default 24 hours
  
  // Get wallet context
  const { isConnected, account, balance } = useWallet();

  // No token price conversion required

  // Calculate price ratio from making and taking amounts
  const calculatePriceRatioFromAmounts = () => {
    if (!makingAmount || !takingAmount) return '';
    const ratio = parseFloat(takingAmount) / parseFloat(makingAmount);
    return ratio.toFixed(6);
  };

  // Update price ratio when amounts change
  useEffect(() => {
    if (makingAmount && takingAmount) {
      const newRatio = calculatePriceRatioFromAmounts();
      if (newRatio) {
        setPriceRatio(newRatio);
      }
    }
  }, [makingAmount, takingAmount]);

  // Handle token swap
  const handleSwapTokens = () => {
    const tempToken = makerToken;
    setMakerToken(takerToken);
    setTakerToken(tempToken);
    
    if (makingAmount && takingAmount) {
      setMakingAmount(takingAmount);
      setTakingAmount(makingAmount);
    }
  };

  // Handle form submission
  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCreateOrder = async () => {
    if (!privateKey.trim()) {
      setError('Private key is required to create the limit order');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // Convert amounts to wei (assuming 18 decimals for most tokens)
      const makerAmountInWei = (parseFloat(makingAmount) * Math.pow(10, 18)).toString();
      const takerAmountInWei = (parseFloat(takingAmount) * Math.pow(10, 18)).toString();
      
      const orderParams = {
        makerTokenAddress: TOKEN_ADDRESSES[makerToken.symbol],
        takerTokenAddress: TOKEN_ADDRESSES[takerToken.symbol],
        makerAmount: makerAmountInWei,
        takerAmount: takerAmountInWei,
        privateKey: privateKey.trim(),
        expirationHours: parseFloat(expiryTime)
      };

      const result = await createLimitOrder(orderParams);
      
      if (result.success) {
        onClose();
        // Reset form
        setCurrentStep(1);
        setMakingAmount('');
        setTakingAmount('');
        setPriceRatio('');
        setPrivateKey('');
        setError('');
      } else {
        setError(result.error || 'Order creation failed');
      }
    } catch (error) {
      console.error('Order creation error:', error);
      setError(error.message || 'Failed to create limit order');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setCurrentStep(1);
    setMakingAmount('');
    setTakingAmount('');
    setPriceRatio('');
    setPrivateKey('');
    setError('');
    onClose();
  };

  // No price difference calculation needed

  // Don't render if modal is not open
  if (!isOpen) return null;

  return (
    <div className="swap-modal-overlay" onClick={handleClose}>
      <div className="swap-modal limit-order-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="swap-modal__header">
          <h2 className="swap-modal__title">
            {currentStep === 1 ? 'Create Limit Order' : currentStep === 2 ? 'Review Order' : 'Confirm Order'}
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
          {/* Step 1: Order Details */}
          {currentStep === 1 && (
            <div className="swap-step">
              <div className="swap-section">
                <label className="swap-label">You Pay (Maker Asset)</label>
                <div className="swap-input-group">
                  <div className="token-selector" onClick={() => setShowMakerDropdown(!showMakerDropdown)}>
                    <div className="token-display">
                      <span className="token-icon" style={{ color: makerToken.color }}>
                        {makerToken.icon}
                      </span>
                      <div className="token-info">
                        <span className="token-symbol">{makerToken.symbol}</span>
                        <small className="token-name">{makerToken.name}</small>
                      </div>
                    </div>
                    <span className="dropdown-arrow">▼</span>
                  </div>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={makingAmount}
                    onChange={(e) => setMakingAmount(e.target.value)}
                    className="amount-input"
                  />
                </div>
                {showMakerDropdown && (
                  <div className="token-dropdown">
                    {AVAILABLE_TOKENS.map((token) => (
                      <div
                        key={token.symbol}
                        className="token-option"
                        onClick={() => {
                          setMakerToken(token);
                          setShowMakerDropdown(false);
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
                <label className="swap-label">You Receive (Taker Asset)</label>
                <div className="swap-input-group">
                  <div className="token-selector" onClick={() => setShowTakerDropdown(!showTakerDropdown)}>
                    <div className="token-display">
                      <span className="token-icon" style={{ color: takerToken.color }}>
                        {takerToken.icon}
                      </span>
                      <div className="token-info">
                        <span className="token-symbol">{takerToken.symbol}</span>
                        <small className="token-name">{takerToken.name}</small>
                      </div>
                    </div>
                    <span className="dropdown-arrow">▼</span>
                  </div>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={takingAmount}
                    onChange={(e) => setTakingAmount(e.target.value)}
                    className="amount-input"
                  />
                </div>
                {showTakerDropdown && (
                  <div className="token-dropdown">
                    {AVAILABLE_TOKENS.map((token) => (
                      <div
                        key={token.symbol}
                        className="token-option"
                        onClick={() => {
                          setTakerToken(token);
                          setShowTakerDropdown(false);
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
                <label className="swap-label">Price Ratio</label>
                <div className="price-display">
                  <div className="price-ratio">
                    <span>1 {makerToken.symbol} = </span>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={priceRatio}
                      onChange={(e) => setPriceRatio(e.target.value)}
                      className="price-input"
                    />
                    <span> {takerToken.symbol}</span>
                  </div>
                </div>
              </div>

              <div className="swap-settings">
                <label className="swap-label">Order Expiry</label>
                <div className="expiry-options">
                  {['1', '24', '48', '72'].map((hours) => (
                    <button
                      key={hours}
                      className={`expiry-btn ${expiryTime === hours ? 'active' : ''}`}
                      onClick={() => setExpiryTime(hours)}
                    >
                      {hours === '1' ? '1 Hour' : `${hours} Hours`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Review */}
          {currentStep === 2 && (
            <div className="swap-step">
              <div className="swap-review">
                <h3>Review Your Order</h3>
                <div className="review-item">
                  <span>You Pay:</span>
                  <span>{makingAmount} {makerToken.symbol}</span>
                </div>
                <div className="review-item">
                  <span>You Receive:</span>
                  <span>{takingAmount} {takerToken.symbol}</span>
                </div>
                <div className="review-item">
                  <span>Price Ratio:</span>
                  <span>1 {makerToken.symbol} = {priceRatio} {takerToken.symbol}</span>
                </div>
                <div className="review-item">
                  <span>Expiry:</span>
                  <span>{expiryTime} Hour{expiryTime !== '1' ? 's' : ''}</span>
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
                <h3>Confirm Order</h3>
                <p className="security-warning">
                  ⚠️ Enter your private key to sign and create the limit order. 
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
                    <span>Limit Order:</span>
                    <span>{makingAmount} {makerToken.symbol} → {takingAmount} {takerToken.symbol}</span>
                  </div>
                  <div className="summary-item">
                    <span>Price:</span>
                    <span>1 {makerToken.symbol} = {priceRatio} {takerToken.symbol}</span>
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
              disabled={!makingAmount || !takingAmount || isLoading}
            >
              Next
            </button>
          ) : (
            <button
              className="btn btn-primary"
              onClick={handleCreateOrder}
              disabled={!privateKey.trim() || isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Limit Order'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LimitOrderModal;

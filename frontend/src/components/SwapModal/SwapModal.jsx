import React, { useState, useEffect, useCallback } from 'react';
import { useWallet } from '../../contexts/WalletContext';
import { getCurrentPrices } from '../../apiservices/dashboardService';
import './SwapModal.css';

const SwapModal = ({ isOpen, onClose }) => {
  // Available tokens for swapping
  const AVAILABLE_TOKENS = [
    { symbol: 'ETH', name: 'Ethereum', icon: '⟠' },
    { symbol: 'BTC', name: 'Bitcoin', icon: '₿' },
    { symbol: 'USDC', name: 'USD Coin', icon: '$' },
    { symbol: 'USDT', name: 'Tether', icon: '$' },
    { symbol: 'SOL', name: 'Solana', icon: '◎' },
    { symbol: 'ADA', name: 'Cardano', icon: '₳' },
    { symbol: 'DOT', name: 'Polkadot', icon: '●' },
    { symbol: 'LINK', name: 'Chainlink', icon: '🔗' },
    { symbol: 'MATIC', name: 'Polygon', icon: '◆' },
    { symbol: 'UNI', name: 'Uniswap', icon: '🦄' },
    { symbol: 'AVAX', name: 'Avalanche', icon: '🔺' },
  ];

  // State management
  const [fromToken, setFromToken] = useState(AVAILABLE_TOKENS[0]);
  const [toToken, setToToken] = useState(AVAILABLE_TOKENS[2]);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [slippage, setSlippage] = useState('5.5');
  const [isFromInput, setIsFromInput] = useState(true);
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Get wallet context and prices
  const { dashboardData, isConnected, account, balance, usdValue, tokenPrices, portfolioData, loading, error: walletError, network } = useWallet();
  
  // Console log all context when modal opens
  useEffect(() => {
    if (isOpen) {
      console.log('=== SwapModal Context Debug ===');
      console.log('isConnected:', isConnected);
      console.log('account:', account);
      console.log('balance:', balance);
      console.log('usdValue:', usdValue);
      console.log('tokenPrices:', tokenPrices);
      console.log('portfolioData:', portfolioData);
      console.log('loading:', loading);
      console.log('walletError:', walletError);
      console.log('network:', network);
      console.log('dashboardData:', dashboardData);
      
      // Log the current prices function result
      const currentPrices = getCurrentPrices(dashboardData);
      console.log('getCurrentPrices result:', currentPrices);
      
      // Log available tokens
      console.log('AVAILABLE_TOKENS:', AVAILABLE_TOKENS);
      
      // Log current modal state
      console.log('fromToken:', fromToken);
      console.log('toToken:', toToken);
      console.log('fromAmount:', fromAmount);
      console.log('toAmount:', toAmount);
      console.log('slippage:', slippage);
      console.log('================================');
    }
  }, [isOpen, dashboardData, isConnected, account, balance, usdValue, tokenPrices, portfolioData, loading, walletError, network, fromToken, toToken, fromAmount, toAmount, slippage]);

  // Disable/enable scroll when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      // Disable scroll
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '15px'; // Prevent content shift due to scrollbar
    } else {
      // Enable scroll
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
    }

    // Cleanup function to restore scroll when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
    };
  }, [isOpen]);
  
  // Get current prices from dashboard data
  const getCurrentTokenPrices = useCallback(() => {
    if (!dashboardData) return {};
    
    const prices = getCurrentPrices(dashboardData) || {};
    
    // USDC is the base currency, so it should always be 1 USD
    // Other tokens are priced in USDC terms
    const adjustedPrices = {
      ...prices,
      USDC: 1.00,  // Hardcode USDC to 1 USD since it's the base currency
      USDT: 1.00   // USDT is also typically ~1 USD
    };
    
    console.log('Raw prices from API:', prices);
    console.log('Adjusted prices with USDC=1:', adjustedPrices);
    
    return adjustedPrices;
  }, [dashboardData]);

  // Calculate exchange rate and opposite amount
  const calculateSwapAmount = useCallback((amount, fromSymbol, toSymbol, isFromToTo = true) => {
    const prices = getCurrentTokenPrices();
    
    console.log('=== calculateSwapAmount Debug ===');
    console.log('amount:', amount);
    console.log('fromSymbol:', fromSymbol);
    console.log('toSymbol:', toSymbol);
    console.log('isFromToTo:', isFromToTo);
    console.log('prices:', prices);
    console.log('prices[fromSymbol]:', prices[fromSymbol]);
    console.log('prices[toSymbol]:', prices[toSymbol]);
    
    if (!amount || !prices[fromSymbol] || !prices[toSymbol]) {
      console.log('Calculation failed - missing data:', {
        hasAmount: !!amount,
        hasFromPrice: !!prices[fromSymbol],
        hasToPrice: !!prices[toSymbol]
      });
      return '';
    }

    const fromPrice = prices[fromSymbol];
    const toPrice = prices[toSymbol];
    
    let result;
    if (isFromToTo) {
      // Converting from -> to
      const usdValue = parseFloat(amount) * fromPrice;
      const toTokenAmount = usdValue / toPrice;
      result = toTokenAmount.toFixed(6);
      console.log('From->To calculation:', {
        amount: parseFloat(amount),
        fromPrice,
        usdValue,
        toPrice,
        toTokenAmount,
        result
      });
    } else {
      // Converting to -> from
      const usdValue = parseFloat(amount) * toPrice;
      const fromTokenAmount = usdValue / fromPrice;
      result = fromTokenAmount.toFixed(6);
      console.log('To->From calculation:', {
        amount: parseFloat(amount),
        toPrice,
        usdValue,
        fromPrice,
        fromTokenAmount,
        result
      });
    }
    console.log('=== End calculateSwapAmount ===');
    return result;
  }, [getCurrentTokenPrices]);

  // Handle amount input changes
  const handleFromAmountChange = (value) => {
    setFromAmount(value);
    setIsFromInput(true);
    const calculatedToAmount = calculateSwapAmount(value, fromToken.symbol, toToken.symbol, true);
    setToAmount(calculatedToAmount);
    setError('');
  };

  const handleToAmountChange = (value) => {
    setToAmount(value);
    setIsFromInput(false);
    const calculatedFromAmount = calculateSwapAmount(value, toToken.symbol, fromToken.symbol, false);
    setFromAmount(calculatedFromAmount);
    setError('');
  };

  // Handle token selection
  const handleFromTokenSelect = (token) => {
    if (token.symbol === toToken.symbol) {
      // Swap tokens if selecting the same as "to" token
      setToToken(fromToken);
    }
    setFromToken(token);
    setShowFromDropdown(false);
    
    // Recalculate amounts
    if (fromAmount && isFromInput) {
      const calculatedToAmount = calculateSwapAmount(fromAmount, token.symbol, toToken.symbol, true);
      setToAmount(calculatedToAmount);
    } else if (toAmount && !isFromInput) {
      const calculatedFromAmount = calculateSwapAmount(toAmount, toToken.symbol, token.symbol, false);
      setFromAmount(calculatedFromAmount);
    }
  };

  const handleToTokenSelect = (token) => {
    if (token.symbol === fromToken.symbol) {
      // Swap tokens if selecting the same as "from" token
      setFromToken(toToken);
    }
    setToToken(token);
    setShowToDropdown(false);
    
    // Recalculate amounts
    if (fromAmount && isFromInput) {
      const calculatedToAmount = calculateSwapAmount(fromAmount, fromToken.symbol, token.symbol, true);
      setToAmount(calculatedToAmount);
    } else if (toAmount && !isFromInput) {
      const calculatedFromAmount = calculateSwapAmount(toAmount, token.symbol, fromToken.symbol, false);
      setFromAmount(calculatedFromAmount);
    }
  };

  // Swap tokens
  const handleSwapTokens = () => {
    const tempToken = fromToken;
    setFromToken(toToken);
    setToToken(tempToken);
    
    const tempAmount = fromAmount;
    setFromAmount(toAmount);
    setToAmount(tempAmount);
    setIsFromInput(!isFromInput);
  };

  // Handle slippage change
  const handleSlippageChange = (value) => {
    const numValue = parseFloat(value);
    if (numValue >= 0 && numValue <= 50) {
      setSlippage(value);
      setError('');
    } else {
      setError('Slippage must be between 0% and 50%');
    }
  };

  // Get exchange rate
  const getExchangeRate = () => {
    const prices = getCurrentTokenPrices();
    if (!prices[fromToken.symbol] || !prices[toToken.symbol]) return null;
    
    const rate = prices[fromToken.symbol] / prices[toToken.symbol];
    return rate.toFixed(6);
  };

  // Handle swap execution
  const handleSwap = async () => {
    if (!isConnected) {
      setError('Please connect your wallet first');
      return;
    }

    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (!toAmount || parseFloat(toAmount) <= 0) {
      setError('Invalid swap calculation');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Here you would integrate with your chat API to execute the swap
      // For now, we'll just simulate the swap process
      
      console.log('Executing swap:', {
        from: fromToken.symbol,
        to: toToken.symbol,
        fromAmount,
        toAmount,
        slippage
      });

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Reset form after successful swap
      setFromAmount('');
      setToAmount('');
      setError('');
      
      alert(`Swap successful! ${fromAmount} ${fromToken.symbol} → ${toAmount} ${toToken.symbol}`);
      onClose();
      
    } catch (err) {
      setError('Swap failed. Please try again.');
      console.error('Swap error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowFromDropdown(false);
      setShowToDropdown(false);
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const prices = getCurrentTokenPrices();
  const exchangeRate = getExchangeRate();

  return (
    <div className="swap-modal-overlay" onClick={onClose}>
      <div className="swap-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="swap-modal-header">
          <h2>Swap Tokens</h2>
          <button className="swap-modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        {/* Swap Form */}
        <div className="swap-form">
          {/* From Token */}
          <div className="swap-input-section">
            <div className="swap-input-header">
              <span>From</span>
              <span className="swap-balance">
                Balance: -- {fromToken.symbol}
              </span>
            </div>
            
            <div className="swap-input-container">
              <div className="swap-token-select" onClick={(e) => {
                e.stopPropagation();
                setShowFromDropdown(!showFromDropdown);
                setShowToDropdown(false);
              }}>
                <span className="token-icon">{fromToken.icon}</span>
                <span className="token-symbol">{fromToken.symbol}</span>
                <span className="dropdown-arrow">▼</span>
                
                {showFromDropdown && (
                  <div className="token-dropdown">
                    {AVAILABLE_TOKENS.filter(token => token.symbol !== toToken.symbol).map(token => (
                      <div
                        key={token.symbol}
                        className="token-option"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFromTokenSelect(token);
                        }}
                      >
                        <span className="token-icon">{token.icon}</span>
                        <div className="token-info">
                          <span className="token-symbol">{token.symbol}</span>
                          <span className="token-name">{token.name}</span>
                        </div>
                        <span className="token-price">
                          ${prices[token.symbol]?.toLocaleString() || '--'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <input
                type="number"
                placeholder="0.0"
                value={fromAmount}
                onChange={(e) => handleFromAmountChange(e.target.value)}
                className="swap-amount-input"
              />
            </div>
            
            {fromAmount && prices[fromToken.symbol] && (
              <div className="swap-usd-value">
                ≈ ${(parseFloat(fromAmount) * prices[fromToken.symbol]).toLocaleString()}
              </div>
            )}
          </div>

          {/* Swap Direction Button */}
          <div className="swap-direction">
            <button className="swap-direction-btn" onClick={handleSwapTokens}>
              ⇅
            </button>
          </div>

          {/* To Token */}
          <div className="swap-input-section">
            <div className="swap-input-header">
              <span>To</span>
              <span className="swap-balance">
                Balance: -- {toToken.symbol}
              </span>
            </div>
            
            <div className="swap-input-container">
              <div className="swap-token-select" onClick={(e) => {
                e.stopPropagation();
                setShowToDropdown(!showToDropdown);
                setShowFromDropdown(false);
              }}>
                <span className="token-icon">{toToken.icon}</span>
                <span className="token-symbol">{toToken.symbol}</span>
                <span className="dropdown-arrow">▼</span>
                
                {showToDropdown && (
                  <div className="token-dropdown">
                    {AVAILABLE_TOKENS.filter(token => token.symbol !== fromToken.symbol).map(token => (
                      <div
                        key={token.symbol}
                        className="token-option"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToTokenSelect(token);
                        }}
                      >
                        <span className="token-icon">{token.icon}</span>
                        <div className="token-info">
                          <span className="token-symbol">{token.symbol}</span>
                          <span className="token-name">{token.name}</span>
                        </div>
                        <span className="token-price">
                          ${prices[token.symbol]?.toLocaleString() || '--'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <input
                type="number"
                placeholder="0.0"
                value={toAmount}
                onChange={(e) => handleToAmountChange(e.target.value)}
                className="swap-amount-input"
              />
            </div>
            
            {toAmount && prices[toToken.symbol] && (
              <div className="swap-usd-value">
                ≈ ${(parseFloat(toAmount) * prices[toToken.symbol]).toLocaleString()}
              </div>
            )}
          </div>

          {/* Exchange Rate */}
          {exchangeRate && (
            <div className="swap-rate">
              <span>Exchange Rate:</span>
              <span>1 {fromToken.symbol} = {exchangeRate} {toToken.symbol}</span>
            </div>
          )}

          {/* Slippage Tolerance */}
          <div className="swap-slippage">
            <div className="swap-slippage-header">
              <span>Slippage Tolerance</span>
              <div className="slippage-presets">
                {['0.5', '1.0', '5.5'].map(preset => (
                  <button
                    key={preset}
                    className={`slippage-preset ${slippage === preset ? 'active' : ''}`}
                    onClick={() => handleSlippageChange(preset)}
                  >
                    {preset}%
                  </button>
                ))}
              </div>
            </div>
            
            <div className="slippage-input-container">
              <input
                type="number"
                step="0.1"
                min="0"
                max="50"
                value={slippage}
                onChange={(e) => handleSlippageChange(e.target.value)}
                className="slippage-input"
              />
              <span className="slippage-unit">%</span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="swap-error">
              {error}
            </div>
          )}

          {/* Swap Button */}
          <button
            className={`swap-button ${isLoading ? 'loading' : ''} ${
              !isConnected || !fromAmount || !toAmount || error ? 'disabled' : ''
            }`}
            onClick={handleSwap}
            disabled={isLoading || !isConnected || !fromAmount || !toAmount || !!error}
          >
            {isLoading ? (
              <>
                <span className="loading-spinner"></span>
                Swapping...
              </>
            ) : !isConnected ? (
              'Connect Wallet'
            ) : !fromAmount || !toAmount ? (
              'Enter Amount'
            ) : (
              `Swap ${fromToken.symbol} for ${toToken.symbol}`
            )}
          </button>

          {/* Transaction Details */}
          {fromAmount && toAmount && !error && (
            <div className="swap-details">
              <div className="swap-detail-row">
                <span>Minimum Received:</span>
                <span>
                  {(parseFloat(toAmount) * (1 - parseFloat(slippage) / 100)).toFixed(6)} {toToken.symbol}
                </span>
              </div>
              <div className="swap-detail-row">
                <span>Price Impact:</span>
                <span className="price-impact">{'<0.01%'}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SwapModal;

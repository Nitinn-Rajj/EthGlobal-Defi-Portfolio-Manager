import React from 'react';

const SwapConfirmation = ({ swapData, onConfirm, onReject }) => {
  return (
    <div className="swap-confirmation">
      <div className="swap-confirmation__overlay" onClick={onReject} />
      
      <div className="swap-confirmation__modal">
        <div className="swap-confirmation__header">
          <h3>Confirm Swap</h3>
          <button className="close-btn" onClick={onReject}>×</button>
        </div>
        
        <div className="swap-confirmation__content">
          <div className="swap-summary">
            <div className="swap-tokens">
              <div className="token-section">
                <span className="token-label">You're swapping</span>
                <div className="token-amount">
                  {swapData.amount} {swapData.fromToken}
                </div>
              </div>
              
              <div className="swap-arrow">→</div>
              
              <div className="token-section">
                <span className="token-label">You'll receive ~</span>
                <div className="token-amount">
                  {swapData.estimatedReceive} {swapData.toToken}
                </div>
              </div>
            </div>
          </div>
          
          <div className="swap-details">
            <div className="detail-row">
              <span>Route:</span>
              <span>{swapData.route}</span>
            </div>
            <div className="detail-row">
              <span>Price Impact:</span>
              <span className={swapData.priceImpact > '1%' ? 'high-impact' : ''}>{swapData.priceImpact}</span>
            </div>
            <div className="detail-row">
              <span>Network Fee:</span>
              <span>{swapData.networkFee}</span>
            </div>
            <div className="detail-row">
              <span>Slippage Tolerance:</span>
              <span>{swapData.slippage}</span>
            </div>
          </div>
          
          <div className={`risk-warning risk-${swapData.riskLevel.toLowerCase()}`}>
            <span className="warning-icon">⚠️</span>
            <div>
              <strong>Risk Level: {swapData.riskLevel}</strong>
              <p>Please review all details carefully before confirming this swap.</p>
            </div>
          </div>
        </div>
        
        <div className="swap-confirmation__actions">
          <button 
            className="btn btn-secondary" 
            onClick={onReject}
          >
            Cancel
          </button>
          <button 
            className="btn btn-primary" 
            onClick={onConfirm}
          >
            Confirm Swap
          </button>
        </div>
      </div>
    </div>
  );
};

export default SwapConfirmation;
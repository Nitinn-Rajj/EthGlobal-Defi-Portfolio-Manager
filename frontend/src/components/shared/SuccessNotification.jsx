import React, { useEffect, useState } from 'react';
import './SuccessNotification.css';

const SuccessNotification = ({ 
  isVisible, 
  onClose, 
  type = 'swap', // 'swap' or 'limitOrder'
  data = {} 
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      // Auto-close after 5 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const getNotificationContent = () => {
    if (type === 'swap') {
      return {
        title: '🎉 Swap Successful!',
        subtitle: 'Your token swap has been completed',
        details: [
          { label: 'From', value: `${data.amount || '1.0'} ${data.srcToken || 'ETH'}` },
          { label: 'To', value: `${data.estimatedOutput || '2,500'} ${data.dstToken || 'USDC'}` },
          { label: 'Transaction', value: data.transactionHash || 'mock_tx_' + Date.now() },
          { label: 'Gas Fee', value: `${data.estimatedGas || '21000'} gwei` }
        ]
      };
    } else {
      return {
        title: '✨ Limit Order Created!',
        subtitle: 'Your limit order has been placed successfully',
        details: [
          { label: 'Sell', value: `${data.makerAmount || '1.0'} ${data.makerToken || 'ETH'}` },
          { label: 'Buy', value: `${data.takerAmount || '2,500'} ${data.takerToken || 'USDC'}` },
          { label: 'Order ID', value: data.orderId || 'mock_order_' + Date.now() },
          { label: 'Status', value: 'Active' }
        ]
      };
    }
  };

  const content = getNotificationContent();

  if (!isVisible) return null;

  return (
    <div className={`success-notification-overlay ${isAnimating ? 'visible' : ''}`}>
      <div className={`success-notification ${isAnimating ? 'animate-in' : 'animate-out'}`}>
        {/* Close button */}
        <button className="success-notification__close" onClick={handleClose}>
          ×
        </button>

        {/* Success icon with animation */}
        <div className="success-notification__icon">
          <div className="success-checkmark">
            <div className="check-icon">
              <span className="icon-line line-tip"></span>
              <span className="icon-line line-long"></span>
              <div className="icon-circle"></div>
              <div className="icon-fix"></div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="success-notification__content">
          <h3 className="success-notification__title">{content.title}</h3>
          <p className="success-notification__subtitle">{content.subtitle}</p>

          {/* Transaction details */}
          <div className="success-notification__details">
            {content.details.map((detail, index) => (
              <div key={index} className="success-detail-row">
                <span className="detail-label">{detail.label}:</span>
                <span className="detail-value">{detail.value}</span>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="success-notification__actions">
            <button 
              className="success-btn primary"
              onClick={handleClose}
            >
              Awesome!
            </button>
          </div>
        </div>

        {/* Animated particles */}
        <div className="success-particles">
          <div className="particle particle-1">✨</div>
          <div className="particle particle-2">🎉</div>
          <div className="particle particle-3">⭐</div>
          <div className="particle particle-4">💎</div>
          <div className="particle particle-5">🚀</div>
        </div>
      </div>
    </div>
  );
};

export default SuccessNotification;
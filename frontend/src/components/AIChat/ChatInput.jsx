import React, { useState } from 'react';

const ChatInput = ({ onSendMessage, disabled }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const quickActions = [
    'Show my portfolio',
    'Swap 0.1 ETH to USDC',
    'Find best yield opportunities',
    'Analyze market trends'
  ];

  const handleQuickAction = (action) => {
    if (!disabled) {
      onSendMessage(action);
    }
  };

  return (
    <div className="chat-input">
      <div className="quick-actions">
        {quickActions.map((action, index) => (
          <button
            key={index}
            className="quick-action-btn"
            onClick={() => handleQuickAction(action)}
            disabled={disabled}
          >
            {action}
          </button>
        ))}
      </div>
      
      <form className="chat-input__form" onSubmit={handleSubmit}>
        <div className="chat-input__wrapper">
          <textarea
            className="chat-input__field"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me about your portfolio, request swaps, or get DeFi insights..."
            disabled={disabled}
            rows={1}
          />
          <button 
            type="submit" 
            className="chat-input__send"
            disabled={disabled || !message.trim()}
          >
            <span className="send-icon">📤</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;
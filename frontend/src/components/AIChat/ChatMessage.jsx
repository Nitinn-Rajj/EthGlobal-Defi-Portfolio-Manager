import React, { useState } from 'react';
import ChainOfThought from './ChainOfThought';
import StructuredData from './StructuredData';
import logoImage from '../../assets/logo.jpeg';

const ChatMessage = ({ message, isPending }) => {
  const [showReasoning, setShowReasoning] = useState(false);

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const renderContent = () => {
    if (message.type === 'user') {
      return <p className="chat-message__text">{message.content}</p>;
    }

    return (
      <div className="chat-message__ai-content">
        {message.reasoning && message.reasoning.length > 0 && (
          <div className="chat-message__reasoning-toggle">
            <button 
              className="reasoning-toggle-btn"
              onClick={() => setShowReasoning(!showReasoning)}
            >
              <span className="reasoning-icon">🧠</span>
              {showReasoning ? 'Hide reasoning' : 'Show reasoning'}
              <span className={`reasoning-arrow ${showReasoning ? 'expanded' : ''}`}>▼</span>
            </button>
          </div>
        )}
        
        {message.reasoning && showReasoning && (
          <ChainOfThought steps={message.reasoning} />
        )}
        
        <div className="chat-message__main-content">
          <p className="chat-message__text">{message.content}</p>
          
          {message.structuredData && (
            <StructuredData data={message.structuredData} />
          )}
          
          {message.swapProposal && (
            <div className="swap-proposal">
              <div className="swap-proposal__header">
                <span className="swap-proposal__icon">🔄</span>
                <h4>Swap Proposal</h4>
              </div>
              
              <div className="swap-proposal__details">
                <div className="swap-detail">
                  <span className="swap-label">From:</span>
                  <span className="swap-value">{message.swapProposal.amount} {message.swapProposal.fromToken}</span>
                </div>
                <div className="swap-detail">
                  <span className="swap-label">To:</span>
                  <span className="swap-value">~{message.swapProposal.estimatedReceive} {message.swapProposal.toToken}</span>
                </div>
                <div className="swap-detail">
                  <span className="swap-label">Route:</span>
                  <span className="swap-value">{message.swapProposal.route}</span>
                </div>
                <div className="swap-detail">
                  <span className="swap-label">Price Impact:</span>
                  <span className="swap-value">{message.swapProposal.priceImpact}</span>
                </div>
                <div className="swap-detail">
                  <span className="swap-label">Network Fee:</span>
                  <span className="swap-value">{message.swapProposal.networkFee}</span>
                </div>
                <div className="swap-detail">
                  <span className="swap-label">Slippage:</span>
                  <span className="swap-value">{message.swapProposal.slippage}</span>
                </div>
                
                <div className={`risk-indicator risk-${message.swapProposal.riskLevel.toLowerCase()}`}>
                  <span className="risk-icon">⚠️</span>
                  Risk Level: {message.swapProposal.riskLevel}
                </div>
              </div>
              
              {isPending && (
                <div className="swap-proposal__pending">
                  <span className="pending-icon">⏳</span>
                  Awaiting your confirmation below...
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`chat-message ${message.type === 'user' ? 'user' : 'ai'} ${message.isError ? 'error' : ''} ${message.isSuccess ? 'success' : ''}`}>
      <div className="chat-message__avatar">
        {message.type === 'user' ? '👤' : <img src={logoImage} alt="AI Avatar" className="chat-message__ai-avatar" />}
      </div>
      
      <div className="chat-message__bubble">
        {renderContent()}
        <div className="chat-message__timestamp">
          {formatTime(message.timestamp)}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
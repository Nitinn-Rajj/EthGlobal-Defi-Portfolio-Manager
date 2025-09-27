import React from 'react';
import { useChat } from '../../contexts/ChatContext';
import { AIChat } from '../AIChat';
import './ChatPanel.css';

const ChatPanel = () => {
  const { isChatOpen, closeChat } = useChat();

  return (
    <div className={`chat-panel ${isChatOpen ? 'chat-panel--open' : ''}`}>
      <div className="chat-panel__header">
        <div className="chat-panel__title">
          {/* <span className="chat-panel__icon">🤖</span> */}
          <h3>ASI Assistant</h3>
        </div>
        <button 
          className="chat-panel__close"
          onClick={closeChat}
          aria-label="Close chat"
        >
          ×
        </button>
      </div>
      <div className="chat-panel__content">
        <AIChat />
      </div>
    </div>
  );
};

export default ChatPanel;
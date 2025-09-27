import React from 'react';
import { useChat } from '../../contexts/ChatContext';
import './FloatingChatButton.css';

const FloatingChatButton = () => {
  const { isChatOpen, toggleChat } = useChat();

  if (isChatOpen) {
    return null; // Hide floating button when chat is open
  }

  return (
    <button 
      className="floating-chat-btn"
      onClick={toggleChat}
      aria-label="Open AI Chat Assistant"
      title="Open AI Chat Assistant"
    >
      <span className="floating-chat-btn__icon">🙄</span>
      <div className="floating-chat-btn__pulse">I'm cooked</div>
    </button>
  );
};

export default FloatingChatButton;
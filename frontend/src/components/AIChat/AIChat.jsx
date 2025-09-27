import React, { useState, useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import SwapConfirmation from './SwapConfirmation';
import { processText } from '../../utils/parser';
import { getChatResponse } from '../../apiservices/chatService';
import { getTotalBalanceUSD, getPortfolioData } from '../../apiservices/dashboardService';
import { useWallet } from '../../contexts/WalletContext';
import './AIChat.css';

const AIChat = () => {
  const { dashboardData, account, balance, network } = useWallet();
  
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: 'Hello! I\'m your AI DeFi agent. I can help you with portfolio analysis, token swaps, and investment strategies. What would you like to do today?',
      timestamp: Date.now()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingSwap, setPendingSwap] = useState(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const scrollToBottom = (force = false) => {
    if (force || isNearBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    
    // Consider "near bottom" if within 100px of the bottom
    const nearBottom = distanceFromBottom < 100;
    setIsNearBottom(nearBottom);
    
    // Show scroll to bottom button if scrolled up more than 200px
    setShowScrollToBottom(distanceFromBottom > 200);
  };

  const scrollToTop = () => {
    messagesContainerRef.current?.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const jumpToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setShowScrollToBottom(false);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Helper function to create portfolio data from wallet context
  const createPortfolioData = () => {
    if (!dashboardData) {
      return {
        type: 'portfolio',
        totalValue: balance || '0 ETH',
        assets: []
      };
    }

    console.log('📊 Creating portfolio data from:', dashboardData);

    // Get total balance using dashboard service helper
    const totalBalanceUSD = getTotalBalanceUSD(dashboardData);
    const portfolioData = getPortfolioData(dashboardData);
    
    console.log('💰 Total Balance USD:', totalBalanceUSD);
    console.log('📈 Portfolio Data:', portfolioData);

    // Try to extract asset data from various possible locations
    let assets = [];
    
    // Check if there's a holdings array in portfolio
    if (portfolioData?.holdings && Array.isArray(portfolioData.holdings)) {
      assets = portfolioData.holdings.map((holding, index) => ({
        token: holding.symbol || holding.token || `Asset ${index + 1}`,
        amount: holding.balance || holding.amount || '0',
        value: holding.value_usd || holding.usd_value || '$0',
        allocation: holding.allocation || `${Math.round((parseFloat(holding.value_usd || 0) / parseFloat(totalBalanceUSD || 1)) * 100)}%`
      }));
    }
    // Check if there's a tokens array
    else if (dashboardData.tokens && Array.isArray(dashboardData.tokens)) {
      assets = dashboardData.tokens.map((token, index) => ({
        token: token.symbol || token.name || `Token ${index + 1}`,
        amount: token.balance || token.amount || '0',
        value: token.value_usd || token.usd_value || '$0',
        allocation: token.allocation || `${Math.round((parseFloat(token.value_usd || 0) / parseFloat(totalBalanceUSD || 1)) * 100)}%`
      }));
    }
    // Fallback: show account balance as ETH
    else if (balance) {
      assets = [{
        token: 'ETH',
        amount: balance,
        value: totalBalanceUSD ? `$${totalBalanceUSD}` : 'N/A',
        allocation: '100%'
      }];
    }

    return {
      type: 'portfolio',
      totalValue: totalBalanceUSD ? `$${totalBalanceUSD}` : (balance ? `${balance} ETH` : '$0'),
      assets: assets
    };
  };

  // Main function to send message to AI and handle responses
  const sendMessageToAI = async (userMessage) => {
    setIsLoading(true);
    
    try {
      console.log('💬 Sending message to chat service:', userMessage);
      console.log('🔍 Wallet context:', { account, balance, network });
      console.log('📊 Dashboard data:', dashboardData);
      
      // Prepare wallet context for the chat service
      const walletContext = {
        account,
        balance,
        network,
        isConnected: !!account
      };
      
      // Step 1: Get response from chat service (backend agents) with context
      const chatResponse = await getChatResponse(userMessage, walletContext, dashboardData);
      console.log('✅ Chat service response:', chatResponse);
      
      // Step 2: Parse the response using the parser
      const parsedResult = await processText(chatResponse);
      console.log('🎯 Parser result:', parsedResult);
      
      // Step 3: Create appropriate AI message based on parsed type
      let aiMessage = {
        id: Date.now(),
        type: 'ai',
        timestamp: Date.now()
      };

      switch (parsedResult.type) {
        case 'portfolio_summary':
          aiMessage.content = 'Here\'s your current portfolio analysis:';
          aiMessage.structuredData = createPortfolioData();
          break;
          
        case 'other':
          aiMessage.content = chatResponse; // Use the original chat response
          break;
          
        case 'swap':
          // For now, just show the response text - we'll handle swap modal later
          aiMessage.content = chatResponse;
          console.log('🔄 Swap request detected:', parsedResult.data);
          break;
          
        case 'limit_order':
          // For now, just show the response text - we'll handle limit orders later
          aiMessage.content = chatResponse;
          console.log('📋 Limit order detected:', parsedResult.data);
          break;
          
        default:
          aiMessage.content = chatResponse;
      }
      
      setMessages(prev => [...prev, aiMessage]);
      
    } catch (error) {
      console.error('❌ Error in sendMessageToAI:', error);
      
      const errorMessage = {
        id: Date.now(),
        type: 'ai',
        content: 'Sorry, I encountered an error while processing your request. Please try again.',
        isError: true,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (content) => {
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content,
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Send message to AI service
    await sendMessageToAI(content);
  };

  const handleSwapConfirm = async (swapData) => {
    setIsLoading(true);
    
    try {
      // Mock API call to execute swap
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const confirmationMessage = {
        id: Date.now(),
        type: 'ai',
        content: `Swap executed successfully! You've swapped ${swapData.amount} ${swapData.fromToken} for ${swapData.estimatedReceive} ${swapData.toToken}.`,
        isSuccess: true,
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, confirmationMessage]);
      setPendingSwap(null);
      
    } catch (error) {
      const errorMessage = {
        id: Date.now(),
        type: 'ai',
        content: 'Failed to execute swap. Please try again or contact support.',
        isError: true,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwapReject = () => {
    const rejectionMessage = {
      id: Date.now(),
      type: 'ai',
      content: 'Swap cancelled. Is there anything else I can help you with?',
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, rejectionMessage]);
    setPendingSwap(null);
  };

  return (
    <div className="ai-chat">
      
      <div className="ai-chat__messages-container">
        <div className="ai-chat__messages" ref={messagesContainerRef}>
          {messages.map((message) => (
            <ChatMessage 
              key={message.id} 
              message={message}
              isPending={pendingSwap?.messageId === message.id}
            />
          ))}
          
          {isLoading && (
            <div className="ai-chat__loading">
              <div className="ai-chat__loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <span>AI is thinking...</span>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* Scroll Controls */}
        <div className="ai-chat__scroll-controls">
          {messages.length > 3 && (
            <button 
              className="ai-chat__scroll-btn ai-chat__scroll-top"
              onClick={scrollToTop}
              title="Scroll to top"
            >
              ⬆️
            </button>
          )}
          
          {showScrollToBottom && (
            <button 
              className="ai-chat__scroll-btn ai-chat__scroll-bottom"
              onClick={jumpToBottom}
              title="Scroll to bottom"
            >
              ⬇️
            </button>
          )}
        </div>
        
        {/* Scroll Indicator */}
        {/* {!isNearBottom && messages.length > 5 && (
          <div className="ai-chat__scroll-indicator">
            <span>New messages below</span>
            <button onClick={jumpToBottom}>↓</button>
          </div>
        )} */}
      </div>
      
      {pendingSwap && (
        <SwapConfirmation
          swapData={pendingSwap.proposal}
          onConfirm={() => handleSwapConfirm(pendingSwap.proposal)}
          onReject={handleSwapReject}
        />
      )}
      
      <ChatInput 
        onSendMessage={handleSendMessage}
        disabled={isLoading}
      />
    </div>
  );
};

export default AIChat;
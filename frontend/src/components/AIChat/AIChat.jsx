import React, { useState, useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import SwapConfirmation from './SwapConfirmation';
import { processText } from '../../utils/parser';
import { getChatResponse } from '../../apiservices/chatService';
import { getTotalBalanceUSD, getPortfolioData } from '../../apiservices/dashboardService';
import { useWallet } from '../../contexts/WalletContext';
import { useSwap } from '../../contexts/SwapContext';
import { useLimitOrder } from '../../contexts/LimitOrderContext';
import './AIChat.css';

const AIChat = () => {
  const { dashboardData, account, balance, network } = useWallet();
  const { openSwapModal } = useSwap();
  const { openLimitOrderModal } = useLimitOrder();
  
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
      console.log('💬 Processing user message:', userMessage);
      
      // Prepare wallet context for potential backend calls
      const walletContext = {
        account,
        balance,
        network,
        isConnected: !!account
      };
      
      // Step 1: First parse the user message to determine intent
      const parsedResult = await processText(userMessage);
      console.log('🎯 Parser result:', parsedResult);
      
      // Step 2: Handle different types based on parsed result
      let aiMessage = {
        id: Date.now(),
        type: 'ai',
        timestamp: Date.now()
      };

      switch (parsedResult.type) {
        case 'swap':
          // Directly open swap modal with parsed data
          console.log('� Opening swap modal directly for:', parsedResult.data);
          
          if (parsedResult.data && parsedResult.data.initial_coin && parsedResult.data.target_coin) {
            openSwapModal({
              initial_coin: parsedResult.data.initial_coin,
              target_coin: parsedResult.data.target_coin,
              amount: parsedResult.data.amount || 0
            });
            
            aiMessage.content = `Opening swap interface for ${parsedResult.data.initial_coin} → ${parsedResult.data.target_coin}${parsedResult.data.amount ? ` (${parsedResult.data.amount})` : ''}. Please complete the swap in the modal.`;
          } else {
            // If parsing didn't extract enough data, open modal with defaults
            openSwapModal();
            aiMessage.content = 'Opening swap interface. Please select your tokens and amount in the modal.';
          }
          break;
          
        case 'limit_order':
          // Directly open limit order modal with parsed data
          console.log('📋 Opening limit order modal directly for:', parsedResult.data);
          
          if (parsedResult.data && parsedResult.data.maker_coin && parsedResult.data.taker_coin) {
            openLimitOrderModal({
              maker_coin: parsedResult.data.maker_coin,
              taker_coin: parsedResult.data.taker_coin,
              making_amount: parsedResult.data.making_amount || 0,
              taking_amount: parsedResult.data.taking_amount || 0,
              expiry_time_hours: parsedResult.data.expiry_time_hours || 24
            });
            
            aiMessage.content = `Opening limit order interface for ${parsedResult.data.maker_coin} → ${parsedResult.data.taker_coin}${parsedResult.data.making_amount ? ` (offering ${parsedResult.data.making_amount})` : ''}. Please complete the order in the modal.`;
          } else {
            // If parsing didn't extract enough data, open modal with defaults
            openLimitOrderModal();
            aiMessage.content = 'Opening limit order interface. Please select your tokens and amounts in the modal.';
          }
          break;
          
        case 'portfolio_summary':
          // For portfolio summary, still get backend response but with context
          console.log('📊 Portfolio summary request - getting backend response with context');
          
          const portfolioResponse = await getChatResponse(userMessage, walletContext, dashboardData);
          console.log('✅ Portfolio chat service response:', portfolioResponse);
          
          aiMessage.content = 'Here\'s your current portfolio analysis:';
          aiMessage.structuredData = createPortfolioData();
          break;
          
        case 'other':
        default:
          // For other types, send to backend for processing
          console.log('💭 Other request - sending to backend');
          
          const otherResponse = await getChatResponse(userMessage, walletContext, dashboardData);
          console.log('✅ Other chat service response:', otherResponse);
          
          aiMessage.content = otherResponse;
          break;
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
    console.log('🔄 Opening swap modal with data:', swapData);
    
    // Prepare swap configuration for the modal
    const swapConfig = {
      initial_coin: swapData.fromToken,
      target_coin: swapData.toToken,
      amount: parseFloat(swapData.amount)
    };
    
    // Open the swap modal with the configuration
    openSwapModal(swapConfig);
    
    // Add confirmation message to chat
    const confirmationMessage = {
      id: Date.now(),
      type: 'ai',
      content: `Opening swap interface for ${swapData.amount} ${swapData.fromToken} → ${swapData.toToken}. Please complete the swap in the modal.`,
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, confirmationMessage]);
    setPendingSwap(null);
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
      
      <div className="aichat__input-container">
        <ChatInput 
          onSendMessage={handleSendMessage}
          disabled={isLoading}
        />
      </div>
    </div>
  );
};

export default AIChat;
import React, { useState, useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import SwapConfirmation from './SwapConfirmation';
import './AIChat.css';

const AIChat = () => {
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
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mock API call - replace with your actual backend integration
  const sendMessageToAI = async (userMessage) => {
    setIsLoading(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock response based on message content
      const response = generateMockResponse(userMessage);
      
      const aiMessage = {
        id: Date.now(),
        type: 'ai',
        ...response,
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // If the response contains a swap proposal, set it as pending
      if (response.swapProposal) {
        setPendingSwap({
          messageId: aiMessage.id,
          proposal: response.swapProposal
        });
      }
      
    } catch (error) {
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

  const generateMockResponse = (userMessage) => {
    const message = userMessage.toLowerCase();
    
    // Detect swap requests
    if (message.includes('swap') || message.includes('exchange')) {
      return {
        content: 'I can help you with that swap. Let me analyze the best route and get you a quote.',
        reasoning: [
          {
            step: 'Analyzing swap request',
            content: 'Detecting tokens: BTC → ETH'
          },
          {
            step: 'Fetching liquidity pools',
            content: 'Checking Uniswap V3, 1inch, and Curve pools'
          },
          {
            step: 'Calculating optimal route',
            content: 'Best route found via Uniswap V3 with 0.05% fee tier'
          }
        ],
        swapProposal: {
          fromToken: 'BTC',
          toToken: 'ETH',
          amount: '0.1',
          estimatedReceive: '2.847',
          route: 'Uniswap V3 → 1inch',
          priceImpact: '0.12%',
          networkFee: '~$15',
          slippage: '0.5%',
          riskLevel: 'Low'
        }
      };
    }
    
    // Portfolio analysis
    if (message.includes('portfolio') || message.includes('balance')) {
      return {
        content: 'Here\'s your current portfolio analysis:',
        reasoning: [
          {
            step: 'Fetching wallet balances',
            content: 'Connected to wallet: 0x1234...5678'
          },
          {
            step: 'Analyzing asset allocation',
            content: 'Current allocation: 60% ETH, 25% BTC, 15% Stablecoins'
          }
        ],
        structuredData: {
          type: 'portfolio',
          totalValue: '$12,847.32',
          assets: [
            { token: 'ETH', amount: '5.2', value: '$7,708.32', allocation: '60%' },
            { token: 'BTC', amount: '0.08', value: '$3,211.68', allocation: '25%' },
            { token: 'USDC', amount: '1,927.32', value: '$1,927.32', allocation: '15%' }
          ]
        }
      };
    }
    
    // Default response
    return {
      content: 'I understand your request. How can I help you with your DeFi portfolio today?',
      reasoning: [
        {
          step: 'Processing natural language',
          content: 'Analyzing intent and extracting key parameters'
        },
        {
          step: 'Checking available actions',
          content: 'Available: Portfolio analysis, Token swaps, Yield farming recommendations'
        }
      ]
    };
  };

  const handleSendMessage = async (content) => {
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content,
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, userMessage]);
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
      <div className="ai-chat__header">
        <div className="ai-chat__header-icon">🤖</div>
        <div className="ai-chat__header-info">
          <h3>DeFi AI Agent</h3>
          <span className="ai-chat__status">Online</span>
        </div>
      </div>
      
      <div className="ai-chat__messages">
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
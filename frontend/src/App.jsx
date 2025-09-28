import './App.css'
import Header from './components/Header/Header'
import Footer from './components/Footer/Footer'
import LiquidEther from './components/Background'
import Dashboard from './components/Dashboard/Dashboard'
import ScrollIndicator from './components/ScrollIndicator/ScrollIndicator'
import TextType from './components/textanimation/index'
import ChatPanel from './components/ChatPanel/ChatPanel'
import FloatingChatButton from './components/FloatingChatButton/FloatingChatButton'
import SwapModal from './components/SwapModal/SwapModal'
import LimitOrderModal from './components/LimitOrderModal/LimitOrderModal'
import DebugInfo from './components/DebugInfo'
import SuccessNotification from './components/shared/SuccessNotification'
import { WalletProvider, useWallet } from './contexts/WalletContext'
import { ChatProvider, useChat } from './contexts/ChatContext'
import { SwapProvider, useSwap } from './contexts/SwapContext'
import { LimitOrderProvider, useLimitOrder } from './contexts/LimitOrderContext'
import { useEffect, useRef } from 'react'

// Inner App component to use chat context
const AppContent = () => {
  const { isChatOpen } = useChat();
  const { isSwapModalOpen, closeSwapModal, swapConfig } = useSwap();
  const { isLimitOrderModalOpen, closeLimitOrderModal, limitOrderConfig } = useLimitOrder();
  const { refreshDashboardData, isConnected, hasLoadedDashboardThisSession, getDashboardRequestStats } = useWallet();
  const refreshFunctionRef = useRef(refreshDashboardData);

  // Success notification state
  const [showNotification, setShowNotification] = useState(false);
  const [notificationData, setNotificationData] = useState({});

  // Keep the ref updated
  useEffect(() => {
    refreshFunctionRef.current = refreshDashboardData;
  }, [refreshDashboardData]);

  // Listen for success notification events
  useEffect(() => {
    const handleSuccessNotification = (event) => {
      const { type, data } = event.detail;
      setNotificationData({ type, data });
      setShowNotification(true);
    };

    window.addEventListener('showSuccessNotification', handleSuccessNotification);
    
    return () => {
      window.removeEventListener('showSuccessNotification', handleSuccessNotification);
    };
  }, []);

  // Handle notification close
  const handleCloseNotification = () => {
    setShowNotification(false);
    setNotificationData({});
  };

  // Load dashboard data when app component mounts (page load/refresh) - only if not already loaded
  useEffect(() => {
    let isMounted = true;

    const loadDashboardOnPageLoad = async () => {
      console.log('🏠 App useEffect triggered:', {
        isConnected,
        hasLoadedDashboardThisSession,
        isMounted
      });

      if (isMounted && isConnected && !hasLoadedDashboardThisSession) {
        console.log('🚀 App loaded - loading dashboard data for first time this session');
        // Force refresh on page load to get latest data
        await refreshFunctionRef.current(true);
      } else {
        console.log('⏭️ App useEffect skipped:', {
          mounted: isMounted,
          connected: isConnected,
          alreadyLoaded: hasLoadedDashboardThisSession
        });
      }

      // Log request statistics
      if (getDashboardRequestStats) {
        console.log('📊 Dashboard request stats:', getDashboardRequestStats());
      }
    };

    // Small delay to ensure wallet connection check is complete
    const timer = setTimeout(loadDashboardOnPageLoad, 1000);
    
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [isConnected, hasLoadedDashboardThisSession]); // Removed refreshDashboardData from deps

  return (
    <div className={`app ${isChatOpen ? 'app--chat-open' : ''}`}>
      <div style={{ width: '100%', height: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 0 }}>
        <LiquidEther
          colors={[ '#5227FF', '#FF9FFC', '#B19EEF' ]}
          mouseForce={20}
          cursorSize={100}
          isViscous={false}
          viscous={30}
          iterationsViscous={32}
          iterationsPoisson={32}
          resolution={0.5}
          isBounce={false}
          autoDemo={true}
          autoSpeed={0.5}
          autoIntensity={2.2}
          takeoverDuration={0.25}
          autoResumeDelay={3000}
          autoRampDuration={0.6}
        />
      </div>
      <Header />
      <main className="app-main">
        <div className="hero-section" >
          <TextType 
            as="h1"
            className="hero-title"
            style={{ zIndex: 3 }}
            text={["DeFi, simplified through AI","Chat. Track. Trade. Done."]}
            typingSpeed={75}
            pauseDuration={1500}
            showCursor={true}
            cursorCharacter="|"
          />
          <p className="hero-subtitle">
            Leverage AI-powered agents to optimize your DeFi investments with intelligent rebalancing and risk management.
          </p>
        </div>
        <Dashboard />
      </main>
      <Footer />
      <ScrollIndicator />
      <ChatPanel />
      <FloatingChatButton />
      <SuccessNotification
        isVisible={showNotification}
        onClose={handleCloseNotification}
        type={notificationData.type}
        data={notificationData.data}
      />
      {/* <DebugInfo /> */}
      
      {/* Global Swap Modal */}
      {isSwapModalOpen && (
        <SwapModal
          isOpen={isSwapModalOpen}
          onClose={closeSwapModal}
          initialConfig={swapConfig}
        />
      )}
      
      {/* Global Limit Order Modal */}
      {isLimitOrderModalOpen && (
        <LimitOrderModal
          isOpen={isLimitOrderModalOpen}
          onClose={closeLimitOrderModal}
          initialConfig={limitOrderConfig}
        />
      )}
    </div>
  );
};

function App() {
  return (
    <WalletProvider>
      <ChatProvider>
        <SwapProvider>
          <LimitOrderProvider>
            <AppContent />
          </LimitOrderProvider>
        </SwapProvider>
      </ChatProvider>
    </WalletProvider>
  )
}

export default App

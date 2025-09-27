import './App.css'
import Header from './components/Header/Header'
import Footer from './components/Footer/Footer'
import LiquidEther from './components/Background'

function App() {
  return (
    <div className="app">
      <div style={{ width: '100%', height: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 2 }}>
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
          <h1 className="hero-title" style = {{ zIndex:3 }}>Autonomous DeFi Portfolio Management</h1>
          <p className="hero-subtitle">
            Leverage AI-powered agents to optimize your DeFi investments with intelligent rebalancing and risk management.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default App

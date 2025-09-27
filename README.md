# DeFi Portfolio Manager Frontend

An autonomous DeFi Portfolio Manager frontend built with React and Vite. This application provides a user interface for managing decentralized finance portfolios with AI-powered agents.

## Tech Stack

- **Frontend**: React with Vite
- **Wallet Integration**: WalletConnect/ethers.js (planned)
- **Blockchain**: Ethereum testnets (Sepolia, Polygon Mumbai)
- **Backend Communication**: RESTful APIs to Python/Node.js agents

## Project Structure

```
src/
├── components/
│   ├── Dashboard/          # Portfolio overview and metrics
│   ├── Chat/               # AI agent interaction interface
│   ├── Portfolio/          # Detailed portfolio management
│   ├── Wallet/             # Wallet connection and management
│   ├── Rebalancing/        # Portfolio rebalancing interface
│   └── shared/             # Reusable UI components
├── actions/                # State management and API calls
├── hooks/                  # Custom React hooks
├── services/               # External service integrations
└── utils/                  # Utility functions
```

## Features (Planned)

- Real-time portfolio dashboard
- AI agent chat interface for portfolio management
- Wallet connection via WalletConnect
- Automated portfolio rebalancing
- DeFi protocol integrations
- Transaction signing and execution

## Development

### Installation

```bash
npm install
```

### Development Server

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

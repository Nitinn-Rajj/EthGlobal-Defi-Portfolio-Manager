import React from 'react';
import { useWallet } from '../../contexts/WalletContext';
import './WalletInfo.css';

const WalletInfo = () => {
  const { 
    isConnected, 
    account, 
    balance, 
    network, 
    isConnecting, 
    error 
  } = useWallet();

  if (!isConnected) {
    return null;
  }

  return (
    <div className="wallet-info">
      <div className="wallet-info__container">
        <h3 className="wallet-info__title">Wallet Connected</h3>
        <div className="wallet-info__details">
          <div className="wallet-info__item">
            <span className="wallet-info__label">Address:</span>
            <span className="wallet-info__value">{account}</span>
          </div>
          <div className="wallet-info__item">
            <span className="wallet-info__label">Balance:</span>
            <span className="wallet-info__value">{parseFloat(balance).toFixed(6)} ETH</span>
          </div>
          {network && (
            <div className="wallet-info__item">
              <span className="wallet-info__label">Network:</span>
              <span className="wallet-info__value">
                {network.name === 'unknown' ? `Chain ${network.chainId}` : network.name} (Chain ID: {network.chainId})
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WalletInfo;
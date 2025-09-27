import React from 'react';

const StructuredData = ({ data }) => {
  if (data.type === 'portfolio') {
    return (
      <div className="structured-data portfolio-data">
        <div className="portfolio-header">
          <span className="portfolio-icon">💼</span>
          <div className="portfolio-summary">
            <h4>Portfolio Overview</h4>
            <div className="total-value">{data.totalValue}</div>
          </div>
        </div>
        
        <div className="asset-list">
          {data.assets.map((asset, index) => (
            <div key={index} className="asset-item">
              <div className="asset-info">
                <span className="asset-token">{asset.token}</span>
                <span className="asset-amount">{asset.amount}</span>
              </div>
              <div className="asset-values">
                <span className="asset-value">{asset.value}</span>
                <span className="asset-allocation">{asset.allocation}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  // Default structured data renderer
  return (
    <div className="structured-data">
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

export default StructuredData;
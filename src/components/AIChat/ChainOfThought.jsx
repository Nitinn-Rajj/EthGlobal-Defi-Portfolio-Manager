import React from 'react';

const ChainOfThought = ({ steps }) => {
  return (
    <div className="chain-of-thought">
      <div className="chain-of-thought__header">
        <span className="chain-icon">🔍</span>
        <span>AI Reasoning Process</span>
      </div>
      
      <div className="chain-of-thought__steps">
        {steps.map((step, index) => (
          <div key={index} className="reasoning-step">
            <div className="reasoning-step__indicator">
              <span className="step-number">{index + 1}</span>
            </div>
            <div className="reasoning-step__content">
              <div className="reasoning-step__title">{step.step}</div>
              <div className="reasoning-step__description">{step.content}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChainOfThought;
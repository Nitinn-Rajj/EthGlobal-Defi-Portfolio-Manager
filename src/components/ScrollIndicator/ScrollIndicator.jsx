import React, { useState, useEffect } from 'react';
import { scrollToDashboard } from '../../utils/scroll';
import './ScrollIndicator.css';

const ScrollIndicator = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      // Hide scroll indicator after scrolling 200px
      setIsVisible(window.scrollY < 200);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <button className="scroll-indicator" onClick={scrollToDashboard}>
      <div className="scroll-indicator__text">Scroll for Dashboard</div>
      <div className="scroll-indicator__arrow">
        <div className="scroll-indicator__chevron"></div>
        <div className="scroll-indicator__chevron"></div>
        <div className="scroll-indicator__chevron"></div>
      </div>
    </button>
  );
};

export default ScrollIndicator;
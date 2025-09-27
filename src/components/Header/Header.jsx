import React, { useState, useEffect } from 'react';
import './Header.css';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setIsScrolled(scrollTop > 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`header ${isScrolled ? 'header--scrolled' : ''}`}>
      <div className="header__container">
        <div className="header__content">
          <div className="header__logo">
            <span className="header__logo-icon">⚡</span>
            <span className="header__logo-text">Portfolio Manager</span>
          </div>
          <div className="header__actions">
            <button className="header__nav-btn">
              Dashboards
            </button>
            <button className="header__wallet-btn">
              Connect Wallet
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
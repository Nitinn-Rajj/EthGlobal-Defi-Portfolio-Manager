// Theme utilities and constants
// Centralized theme configuration for the DeFi Portfolio Manager

export const colors = {
  // Core palette
  black: '#000000',
  purplePrimary: '#7d12ff',
  purpleSecondary: '#ab20fd', 
  darkBlue: '#200589',
  light: '#fbf8fd',
  
  // Dark Theme Semantic colors
  primary: '#7d12ff',
  secondary: '#ab20fd',
  accent: '#200589',
  background: '#0a0a0a',
  surface: '#1a1a1a',
  surfaceElevated: '#262626',
  text: '#f8fafc',
  textSecondary: '#cbd5e1',
  textMuted: '#94a3b8',
  textInverse: '#000000',
  
  // Status colors
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#200589',
  
  // Interactive states
  primaryHover: '#6b0fd9',
  secondaryHover: '#9518e8',
  accentHover: '#1a047a',
};

export const spacing = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
};

export const borderRadius = {
  sm: '0.25rem',   // 4px
  md: '0.5rem',    // 8px
  lg: '0.75rem',   // 12px
  xl: '1rem',      // 16px
};

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  purple: '0 4px 14px 0 rgba(125, 18, 255, 0.2)',
};

export const typography = {
  fontFamilyHeading: "'Aeonik', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  fontFamilyBody: "'Input Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  fontSize: {
    xs: '0.75rem',   // 12px
    sm: '0.875rem',  // 14px
    base: '1rem',    // 16px
    lg: '1.125rem',  // 18px
    xl: '1.25rem',   // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '2rem',   // 32px
    '4xl': '2.5rem', // 40px
    '5xl': '3rem',   // 48px
  },
  fontWeight: {
    thin: 100,
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
};

// Utility functions for theme usage
export const getSpacing = (size) => spacing[size] || size;
export const getColor = (colorName) => colors[colorName] || colorName;
export const getBorderRadius = (size) => borderRadius[size] || size;

// CSS-in-JS helper for inline styles
export const theme = {
  colors,
  spacing,
  borderRadius,
  shadows,
  typography,
};

export default theme;
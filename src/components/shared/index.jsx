// Shared components - Reusable UI components with theme integration
// This will contain buttons, modals, cards, and other shared UI elements

export const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md',
  disabled = false,
  className = '',
  ...props 
}) => {
  const sizeClass = size !== 'md' ? `btn-${size}` : '';
  const classes = `btn btn-${variant} ${sizeClass} ${className}`.trim();
  
  return (
    <button 
      className={classes}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export const Card = ({ 
  children, 
  title, 
  className = '', 
  headerAction = null 
}) => {
  return (
    <div className={`card ${className}`}>
      {title && (
        <div className="card-header">
          <h2>{title}</h2>
          {headerAction}
        </div>
      )}
      <div className="card-content">
        {children}
      </div>
    </div>
  );
};

export const Badge = ({ 
  children, 
  variant = 'primary', 
  className = '' 
}) => {
  return (
    <span className={`badge badge-${variant} ${className}`}>
      {children}
    </span>
  );
};

export const Input = ({ 
  label, 
  error, 
  className = '', 
  ...props 
}) => {
  return (
    <div className={`input-group ${className}`}>
      {label && <label className="input-label">{label}</label>}
      <input 
        className={`input ${error ? 'input-error' : ''}`}
        {...props} 
      />
      {error && <span className="input-error-text">{error}</span>}
    </div>
  );
};

export const LoadingSpinner = ({ size = 'md', className = '' }) => {
  return (
    <div className={`loading-spinner loading-spinner-${size} ${className}`}>
      <div className="spinner"></div>
    </div>
  );
};
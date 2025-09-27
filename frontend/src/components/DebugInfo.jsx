import React from 'react';

const DebugInfo = () => {
  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
  
  console.log('🐛 Debug - Environment vars:', import.meta.env);
  console.log('🐛 Debug - API Key:', apiKey ? 'Present' : 'Missing');
  
  return (
    <div style={{ position: 'fixed', top: '10px', right: '10px', background: 'black', color: 'white', padding: '10px', fontSize: '12px', zIndex: 9999 }}>
      <div>API Key: {apiKey ? '✅ Loaded' : '❌ Missing'}</div>
      <div>Env Mode: {import.meta.env.MODE}</div>
      <div>Env Dev: {import.meta.env.DEV ? 'Yes' : 'No'}</div>
    </div>
  );
};

export default DebugInfo;
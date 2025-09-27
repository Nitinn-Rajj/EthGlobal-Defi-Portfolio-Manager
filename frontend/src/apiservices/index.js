/**
 * API Services Index
 * 
 * Central export point for all API service modules
 */

// Chat Service - Bridge Agent API (http://127.0.0.1:8001)
export * from './chatService.js';

// Dashboard Service - Dashboard Server API (http://127.0.0.1:5000)
export * from './dashboardService.js';

// Trading Service - Trading operations API (http://127.0.0.1:8001)
export * from './tradingService.js';

// Re-export with namespaces for clarity
export * as ChatService from './chatService.js';
export * as DashboardService from './dashboardService.js';
export * as TradingService from './tradingService.js';
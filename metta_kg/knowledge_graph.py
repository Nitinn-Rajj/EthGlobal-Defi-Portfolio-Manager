"""
MeTTa Knowledge Graph for DeFi Portfolio Management
Provides structured knowledge representation and reasoning capabilities
for cryptocurrency analysis, portfolio optimization, and risk assessment.
"""

from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import json
import time

try:
    from hyperon import MeTTa, E, S, V, ValueAtom, OperationAtom
    METTA_AVAILABLE = True
except ImportError:
    METTA_AVAILABLE = False
    # Create mock classes for when MeTTa is not available
    class MockMeTTa:
        def __init__(self):
            pass
        def space(self):
            return MockSpace()
        def run(self, query):
            return []
    
    class MockSpace:
        def add_atom(self, atom):
            pass
    
    def E(*args): return None
    def S(arg): return None
    def V(arg): return None
    def ValueAtom(arg): return None


class DeFiKnowledgeGraph:
    """
    DeFi-focused Knowledge Graph using MeTTa for structured reasoning.
    Handles cryptocurrency relationships, portfolio rules, and market patterns.
    """
    
    def __init__(self):
        """Initialize MeTTa instance and populate with DeFi knowledge."""
        if not METTA_AVAILABLE:
            self.metta = MockMeTTa()
            self.available = False
            return
        
        self.metta = MeTTa()
        self.available = True
        
        # Session and cache management
        self.active_sessions = {}  # user_id -> session_data
        self.market_data_cache = {}  # symbol -> {data, timestamp}
        self.cache_duration = 300  # 5 minutes cache for market data
        
        # Initialize knowledge base
        self._initialize_defi_knowledge()
        self._initialize_portfolio_rules()
        self._initialize_risk_management()
        self._initialize_market_patterns()
        self._initialize_user_management()
    
    def is_available(self) -> bool:
        """Check if MeTTa is available and knowledge graph is functional."""
        return self.available and METTA_AVAILABLE
    
    def _initialize_defi_knowledge(self):
        """Initialize basic DeFi cryptocurrency knowledge."""
        if not self.is_available():
            return
            
        # Cryptocurrency categories and properties
        crypto_data = [
            # (category, symbol, name, blockchain, market_cap_rank)
            ("layer1", "BTC", "Bitcoin", "Bitcoin", 1),
            ("layer1", "ETH", "Ethereum", "Ethereum", 2),
            ("layer1", "SOL", "Solana", "Solana", 5),
            ("layer1", "ADA", "Cardano", "Cardano", 8),
            ("layer1", "DOT", "Polkadot", "Polkadot", 12),
            ("layer1", "AVAX", "Avalanche", "Avalanche", 15),
            ("layer2", "MATIC", "Polygon", "Ethereum", 10),
            ("defi", "UNI", "Uniswap", "Ethereum", 18),
            ("defi", "LINK", "Chainlink", "Ethereum", 14),
            ("stablecoin", "USDC", "USD Coin", "Ethereum", 6),
            ("stablecoin", "USDT", "Tether", "Ethereum", 3),
            ("memecoin", "DOGE", "Dogecoin", "Dogecoin", 9),
        ]
        
        for category, symbol, name, blockchain, rank in crypto_data:
            # Add cryptocurrency information
            self.metta.space().add_atom(E(S("crypto"), S(symbol), S(name)))
            self.metta.space().add_atom(E(S("category"), S(symbol), S(category)))
            self.metta.space().add_atom(E(S("blockchain"), S(symbol), S(blockchain)))
            self.metta.space().add_atom(E(S("market_cap_rank"), S(symbol), ValueAtom(rank)))
        
        # Correlation relationships (based on typical market behavior)
        correlations = [
            ("BTC", "ETH", 0.85),   # High correlation
            ("ETH", "SOL", 0.75),   # Strong correlation
            ("BTC", "SOL", 0.70),   # Moderate-strong correlation
            ("MATIC", "ETH", 0.80), # Layer 2 follows Ethereum
            ("UNI", "ETH", 0.78),   # DeFi token follows Ethereum
            ("LINK", "ETH", 0.72),  # Oracle token correlation
            ("USDC", "USDT", 0.98), # Stablecoins highly correlated
            ("BTC", "DOGE", 0.65),  # Some memecoin correlation
        ]
        
        for crypto1, crypto2, corr_value in correlations:
            self.metta.space().add_atom(E(S("correlation"), S(crypto1), S(crypto2), ValueAtom(corr_value)))
            # Add reverse correlation
            self.metta.space().add_atom(E(S("correlation"), S(crypto2), S(crypto1), ValueAtom(corr_value)))
    
    def _initialize_portfolio_rules(self):
        """Initialize portfolio management rules and strategies."""
        if not self.is_available():
            return
            
        # Risk-based allocation rules
        risk_allocations = [
            ("conservative", "BTC", 40),  # 40% BTC for conservative
            ("conservative", "ETH", 30),  # 30% ETH
            ("conservative", "USDC", 20), # 20% stablecoin
            ("conservative", "LINK", 10), # 10% blue-chip DeFi
            
            ("moderate", "BTC", 30),      # Moderate risk
            ("moderate", "ETH", 35),
            ("moderate", "SOL", 15),
            ("moderate", "UNI", 10),
            ("moderate", "USDC", 10),
            
            ("aggressive", "BTC", 20),    # Aggressive portfolio
            ("aggressive", "ETH", 25),
            ("aggressive", "SOL", 20),
            ("aggressive", "ADA", 15),
            ("aggressive", "MATIC", 10),
            ("aggressive", "DOGE", 10),
        ]
        
        for risk_level, symbol, allocation in risk_allocations:
            self.metta.space().add_atom(E(S("allocation"), S(risk_level), S(symbol), ValueAtom(allocation)))
        
        # Diversification rules
        diversification_rules = [
            ("max_single_asset", 50),     # No single asset > 50%
            ("min_stablecoin", 5),        # Minimum 5% stablecoins
            ("max_memecoin", 15),         # Maximum 15% memecoins
            ("min_layer1", 60),           # Minimum 60% Layer 1 tokens
        ]
        
        for rule_name, value in diversification_rules:
            self.metta.space().add_atom(E(S("diversification_rule"), S(rule_name), ValueAtom(value)))
    
    def _initialize_risk_management(self):
        """Initialize risk management knowledge."""
        if not self.is_available():
            return
            
        # Volatility classifications (typical ranges)
        volatility_data = [
            ("BTC", "moderate", 60),      # ~60% annual volatility
            ("ETH", "high", 80),          # ~80% annual volatility
            ("SOL", "very_high", 120),    # ~120% annual volatility
            ("ADA", "high", 90),
            ("DOT", "high", 85),
            ("MATIC", "very_high", 110),
            ("AVAX", "very_high", 115),
            ("UNI", "very_high", 130),
            ("LINK", "high", 95),
            ("DOGE", "extreme", 180),     # Memecoins are extremely volatile
            ("USDC", "low", 2),           # Stablecoins low volatility
            ("USDT", "low", 3),
        ]
        
        for symbol, risk_level, volatility in volatility_data:
            self.metta.space().add_atom(E(S("volatility"), S(symbol), S(risk_level), ValueAtom(volatility)))
        
        # Risk score calculations (0-100, higher = riskier)
        risk_scores = [
            ("BTC", 35),   # Established, but volatile
            ("ETH", 45),   # Higher risk due to complexity
            ("SOL", 65),   # Newer, higher risk
            ("ADA", 55),   # Development risk
            ("DOT", 60),   # Complex ecosystem
            ("MATIC", 50), # Layer 2 dependency
            ("AVAX", 58),  # Competition risk
            ("UNI", 70),   # DeFi protocol risk
            ("LINK", 48),  # Oracle dependency
            ("DOGE", 85),  # High speculative risk
            ("USDC", 10),  # Low risk stablecoin
            ("USDT", 15),  # Slightly higher due to centralization
        ]
        
        for symbol, risk_score in risk_scores:
            self.metta.space().add_atom(E(S("risk_score"), S(symbol), ValueAtom(risk_score)))
    
    def _initialize_market_patterns(self):
        """Initialize market pattern knowledge for better analysis."""
        if not self.is_available():
            return
            
        # Market cycle patterns
        market_patterns = [
            ("bull_market", "BTC", "outperforms", "market average by 20%"),
            ("bull_market", "ETH", "outperforms", "market average by 30%"),
            ("bull_market", "SOL", "outperforms", "market average by 50%"),
            ("bear_market", "BTC", "outperforms", "altcoins by 15%"),
            ("bear_market", "USDC", "preserves", "capital best"),
            ("bear_market", "USDT", "preserves", "capital well"),
            ("high_fear", "DOGE", "underperforms", "significantly"),
            ("high_greed", "DOGE", "outperforms", "significantly"),
        ]
        
        for condition, symbol, performance, description in market_patterns:
            self.metta.space().add_atom(E(S("market_pattern"), S(condition), S(symbol), S(performance), ValueAtom(description)))
        
        # Sector relationships
        sector_relationships = [
            ("ethereum_upgrade", "ETH", "positive_impact"),
            ("ethereum_upgrade", "MATIC", "positive_impact"),
            ("ethereum_upgrade", "UNI", "positive_impact"),
            ("defi_boom", "UNI", "strong_positive"),
            ("defi_boom", "LINK", "strong_positive"),
            ("defi_boom", "ETH", "positive_impact"),
            ("regulation_fear", "USDC", "flight_to_safety"),
            ("regulation_fear", "USDT", "flight_to_safety"),
        ]
        
        for event, symbol, impact in sector_relationships:
            self.metta.space().add_atom(E(S("sector_impact"), S(event), S(symbol), S(impact)))
    
    def query_crypto_info(self, symbol: str) -> Dict[str, Any]:
        """Query comprehensive information about a cryptocurrency."""
        if not self.is_available():
            return {}
            
        symbol = symbol.upper()
        results = {}
        
        # Basic info
        name_query = f'!(match &self (crypto {symbol} $name) $name)'
        names = self.metta.run(name_query)
        if names and names[0]:
            results['name'] = str(names[0][0])
        
        # Category
        category_query = f'!(match &self (category {symbol} $cat) $cat)'
        categories = self.metta.run(category_query)
        if categories and categories[0]:
            results['category'] = str(categories[0][0])
        
        # Risk information
        risk_query = f'!(match &self (risk_score {symbol} $score) $score)'
        risk_scores = self.metta.run(risk_query)
        if risk_scores and risk_scores[0]:
            results['risk_score'] = risk_scores[0][0].get_object().value
        
        # Volatility
        vol_query = f'!(match &self (volatility {symbol} $level $value) ($level $value))'
        volatilities = self.metta.run(vol_query)
        if volatilities and volatilities[0]:
            vol_data = volatilities[0][0]
            results['volatility_level'] = str(vol_data.get_children()[0])
            results['volatility_value'] = vol_data.get_children()[1].get_object().value
        
        return results
    
    def get_portfolio_allocation(self, risk_profile: str) -> Dict[str, float]:
        """Get recommended portfolio allocation based on risk profile."""
        if not self.is_available():
            return {}
            
        risk_profile = risk_profile.lower()
        allocations = {}
        
        allocation_query = f'!(match &self (allocation {risk_profile} $symbol $percent) ($symbol $percent))'
        results = self.metta.run(allocation_query)
        
        for result_list in results:
            for allocation_pair in result_list:
                children = allocation_pair.get_children()
                if len(children) >= 2:
                    symbol = str(children[0])
                    percent = children[1].get_object().value
                    allocations[symbol] = percent
        
        return allocations
    
    def get_risk_assessment(self, portfolio: Dict[str, float]) -> Dict[str, Any]:
        """Assess portfolio risk based on allocations and individual asset risks."""
        if not self.is_available():
            return {'total_risk_score': 0, 'risk_level': 'unknown', 'breakdown': {}}
            
        total_risk_score = 0.0
        total_volatility = 0.0
        risk_breakdown = {}
        
        for symbol, allocation in portfolio.items():
            # Get risk score
            risk_query = f'!(match &self (risk_score {symbol.upper()} $score) $score)'
            risk_results = self.metta.run(risk_query)
            
            if risk_results and risk_results[0]:
                risk_score = risk_results[0][0].get_object().value
                weighted_risk = risk_score * (allocation / 100)
                total_risk_score += weighted_risk
                risk_breakdown[symbol] = {
                    'individual_risk': risk_score,
                    'weighted_risk': weighted_risk,
                    'allocation': allocation
                }
            
            # Get volatility
            vol_query = f'!(match &self (volatility {symbol.upper()} $level $value) $value)'
            vol_results = self.metta.run(vol_query)
            
            if vol_results and vol_results[0]:
                volatility = vol_results[0][0].get_object().value
                weighted_volatility = volatility * (allocation / 100)
                total_volatility += weighted_volatility
                if symbol in risk_breakdown:
                    risk_breakdown[symbol]['volatility'] = volatility
                    risk_breakdown[symbol]['weighted_volatility'] = weighted_volatility
        
        return {
            'total_risk_score': total_risk_score,
            'total_volatility': total_volatility,
            'risk_level': self._categorize_risk(total_risk_score),
            'breakdown': risk_breakdown
        }
    
    def _categorize_risk(self, risk_score: float) -> str:
        """Categorize overall risk based on score."""
        if risk_score <= 20:
            return "very_low"
        elif risk_score <= 35:
            return "low" 
        elif risk_score <= 50:
            return "moderate"
        elif risk_score <= 70:
            return "high"
        else:
            return "very_high"
    
    def query_market_insights(self, fear_greed_index: int) -> List[str]:
        """Get market insights based on Fear & Greed Index."""
        if not self.is_available():
            return []
            
        insights = []
        
        if fear_greed_index <= 25:  # Extreme Fear
            condition = "high_fear"
        elif fear_greed_index >= 75:  # Extreme Greed
            condition = "high_greed"
        elif fear_greed_index <= 45:  # Fear
            condition = "bear_market"
        else:  # Greed
            condition = "bull_market"
        
        # Query market patterns for current condition
        pattern_query = f'!(match &self (market_pattern {condition} $symbol $performance $description) ($symbol $performance $description))'
        results = self.metta.run(pattern_query)
        
        for result_list in results:
            for pattern in result_list:
                children = pattern.get_children()
                if len(children) >= 3:
                    symbol = str(children[0])
                    performance = str(children[1])
                    description = children[2].get_object().value
                    insights.append(f"{symbol} likely {performance}: {description}")
        
        return insights
    
    def add_market_data(self, symbol: str, price: float, volume: float, 
                       market_cap: float, price_change_24h: float):
        """Add real-time market data to the knowledge graph."""
        if not self.is_available():
            return
            
        symbol = symbol.upper()
        
        # Add current market data
        self.metta.space().add_atom(E(S("current_price"), S(symbol), ValueAtom(price)))
        self.metta.space().add_atom(E(S("volume_24h"), S(symbol), ValueAtom(volume)))
        self.metta.space().add_atom(E(S("market_cap"), S(symbol), ValueAtom(market_cap)))
        self.metta.space().add_atom(E(S("price_change_24h"), S(symbol), ValueAtom(price_change_24h)))
        
        # Add timestamp for data freshness
        timestamp = datetime.now().isoformat()
        self.metta.space().add_atom(E(S("data_timestamp"), S(symbol), ValueAtom(timestamp)))
    
    def get_knowledge_summary(self) -> Dict[str, int]:
        """Get summary statistics of knowledge in the graph."""
        if not self.is_available():
            return {'cryptocurrencies': 0, 'correlations': 0, 'risk_assessments': 0}
            
        summary = {}
        
        # Count different types of knowledge
        crypto_query = '!(match &self (crypto $symbol $name) $symbol)'
        crypto_results = self.metta.run(crypto_query)
        summary['cryptocurrencies'] = len(crypto_results[0]) if crypto_results and crypto_results[0] else 0
        
        correlation_query = '!(match &self (correlation $s1 $s2 $corr) ($s1 $s2))'
        corr_results = self.metta.run(correlation_query)
        summary['correlations'] = len(corr_results[0]) if corr_results and corr_results[0] else 0
        
        risk_query = '!(match &self (risk_score $symbol $score) $symbol)'
        risk_results = self.metta.run(risk_query)
        summary['risk_assessments'] = len(risk_results[0]) if risk_results and risk_results[0] else 0
        
        return summary

    def _initialize_user_management(self):
        """Initialize user management and session tracking."""
        if not self.is_available():
            return
            
        # Add user session management schema
        self.metta.space().add_atom(E(S("user_session_schema"), S("session_id"), S("wallet_address"), S("created_at"), S("last_active")))
        self.metta.space().add_atom(E(S("user_preference_schema"), S("user_id"), S("risk_profile"), S("preferred_tokens"), S("notification_settings")))
        
    def create_user_session(self, session_id: str, wallet_address: str, user_preferences: Dict[str, Any] = None) -> bool:
        """Create a new user session with wallet address and preferences."""
        if not self.is_available():
            return False
            
        try:
            current_time = datetime.now().isoformat()
            
            # Store session data in memory for quick access
            self.active_sessions[session_id] = {
                'wallet_address': wallet_address,
                'created_at': current_time,
                'last_active': current_time,
                'preferences': user_preferences or {}
            }
            
            # Add to MeTTa knowledge graph
            self.metta.space().add_atom(E(S("user_session"), S(session_id), S(wallet_address), ValueAtom(current_time)))
            self.metta.space().add_atom(E(S("session_active"), S(session_id), ValueAtom(True)))
            
            # Store user preferences if provided
            if user_preferences:
                for key, value in user_preferences.items():
                    self.metta.space().add_atom(E(S("user_preference"), S(session_id), S(key), ValueAtom(value)))
            
            print(f"✅ User session created: {session_id[:8]}... -> {wallet_address[:10]}...")
            return True
            
        except Exception as e:
            print(f"❌ Error creating user session: {e}")
            return False
    
    def get_user_wallet(self, session_id: str) -> Optional[str]:
        """Get wallet address for a user session."""
        if not self.is_available():
            return None
            
        # First check memory cache
        if session_id in self.active_sessions:
            self.active_sessions[session_id]['last_active'] = datetime.now().isoformat()
            return self.active_sessions[session_id]['wallet_address']
        
        # Query MeTTa if not in cache
        try:
            query = f'!(match &self (user_session {session_id} $wallet $time) $wallet)'
            results = self.metta.run(query)
            
            if results and results[0]:
                wallet_address = str(results[0][0])
                
                # Update cache
                self.active_sessions[session_id] = {
                    'wallet_address': wallet_address,
                    'last_active': datetime.now().isoformat()
                }
                
                return wallet_address
                
        except Exception as e:
            print(f"❌ Error retrieving wallet for session {session_id}: {e}")
            
        return None
    
    def update_user_preferences(self, session_id: str, preferences: Dict[str, Any]) -> bool:
        """Update user preferences for a session."""
        if not self.is_available():
            return False
            
        try:
            # Update memory cache
            if session_id in self.active_sessions:
                self.active_sessions[session_id]['preferences'].update(preferences)
                self.active_sessions[session_id]['last_active'] = datetime.now().isoformat()
            
            # Update MeTTa knowledge graph
            for key, value in preferences.items():
                self.metta.space().add_atom(E(S("user_preference"), S(session_id), S(key), ValueAtom(value)))
            
            return True
            
        except Exception as e:
            print(f"❌ Error updating user preferences: {e}")
            return False
    
    def get_cached_market_data(self, symbol: str) -> Optional[Dict[str, Any]]:
        """Get cached market data if still valid."""
        if not self.is_available():
            return None
            
        symbol = symbol.upper()
        
        if symbol in self.market_data_cache:
            cache_entry = self.market_data_cache[symbol]
            cache_age = time.time() - cache_entry['timestamp']
            
            if cache_age < self.cache_duration:
                print(f"📊 Using cached data for {symbol} (age: {cache_age:.1f}s)")
                return cache_entry['data']
            else:
                # Remove expired cache
                del self.market_data_cache[symbol]
                
        return None
    
    def cache_market_data(self, symbol: str, data: Dict[str, Any]) -> None:
        """Cache market data for a symbol."""
        if not self.is_available():
            return
            
        symbol = symbol.upper()
        self.market_data_cache[symbol] = {
            'data': data,
            'timestamp': time.time()
        }
        
        # Also store in MeTTa for persistence
        try:
            if 'current_price' in data:
                self.add_market_data(
                    symbol, 
                    data['current_price'],
                    data.get('volume_24h', 0),
                    data.get('market_cap', 0),
                    data.get('price_change_24h', 0)
                )
            print(f"💾 Cached market data for {symbol}")
        except Exception as e:
            print(f"⚠️  Failed to persist market data for {symbol}: {e}")
    
    def get_multiple_cached_prices(self, symbols: List[str]) -> Dict[str, Optional[float]]:
        """Get cached prices for multiple symbols."""
        if not self.is_available():
            return {}
            
        results = {}
        for symbol in symbols:
            cached_data = self.get_cached_market_data(symbol)
            if cached_data and 'current_price' in cached_data:
                results[symbol.upper()] = cached_data['current_price']
            else:
                results[symbol.upper()] = None
                
        return results
    
    def invalidate_cache(self, symbol: str = None) -> None:
        """Invalidate cache for a specific symbol or all symbols."""
        if symbol:
            symbol = symbol.upper()
            if symbol in self.market_data_cache:
                del self.market_data_cache[symbol]
                print(f"🗑️  Invalidated cache for {symbol}")
        else:
            self.market_data_cache.clear()
            print("🗑️  Invalidated all market data cache")
    
    def get_session_summary(self, session_id: str) -> Dict[str, Any]:
        """Get comprehensive session information."""
        if not self.is_available():
            return {}
            
        summary = {
            'session_id': session_id,
            'wallet_address': None,
            'preferences': {},
            'session_active': False,
            'cache_status': {}
        }
        
        # Get session data
        if session_id in self.active_sessions:
            session_data = self.active_sessions[session_id]
            summary.update({
                'wallet_address': session_data['wallet_address'],
                'preferences': session_data.get('preferences', {}),
                'session_active': True,
                'last_active': session_data.get('last_active'),
                'created_at': session_data.get('created_at')
            })
        
        # Get cache status
        summary['cache_status'] = {
            'cached_symbols': list(self.market_data_cache.keys()),
            'cache_count': len(self.market_data_cache),
            'cache_duration_minutes': self.cache_duration // 60
        }
        
        return summary
    
    def cleanup_expired_sessions(self, max_age_hours: int = 24) -> int:
        """Clean up expired user sessions."""
        if not self.is_available():
            return 0
            
        cleaned_count = 0
        current_time = datetime.now()
        cutoff_time = current_time - timedelta(hours=max_age_hours)
        
        # Clean up memory cache
        expired_sessions = []
        for session_id, session_data in self.active_sessions.items():
            try:
                last_active = datetime.fromisoformat(session_data['last_active'])
                if last_active < cutoff_time:
                    expired_sessions.append(session_id)
            except Exception:
                expired_sessions.append(session_id)  # Clean up malformed sessions
        
        for session_id in expired_sessions:
            del self.active_sessions[session_id]
            cleaned_count += 1
            
        # Clean up market data cache
        expired_cache = []
        for symbol, cache_entry in self.market_data_cache.items():
            cache_age = time.time() - cache_entry['timestamp']
            if cache_age > (max_age_hours * 3600):  # Convert hours to seconds
                expired_cache.append(symbol)
                
        for symbol in expired_cache:
            del self.market_data_cache[symbol]
            
        if cleaned_count > 0:
            print(f"🧹 Cleaned up {cleaned_count} expired sessions and {len(expired_cache)} expired cache entries")
            
        return cleaned_count
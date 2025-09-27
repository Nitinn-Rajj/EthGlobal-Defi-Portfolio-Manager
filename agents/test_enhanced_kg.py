"""
Test script to demonstrate the enhanced MeTTa-KG functionality
with user session management and market data caching.
"""

import asyncio
import sys
import os

# Add parent directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from metta_kg.knowledge_graph import DeFiKnowledgeGraph

def test_session_management():
    """Test user session management functionality."""
    print("🧪 Testing Session Management")
    print("=" * 50)
    
    # Initialize knowledge graph
    kg = DeFiKnowledgeGraph()
    if not kg.is_available():
        print("❌ MeTTa not available - running in demo mode")
        return
    
    # Test session creation
    session_id = "test_session_123"
    wallet_address = "0x742d35Cc6Ca0532f123456789AbCdEf123456789"
    
    print("1. Creating user session...")
    success = kg.create_user_session(
        session_id=session_id,
        wallet_address=wallet_address,
        user_preferences={
            "risk_profile": "moderate",
            "preferred_tokens": ["ETH", "BTC", "SOL"],
            "notifications": True
        }
    )
    
    if success:
        print(f"✅ Session created: {session_id}")
    else:
        print(f"❌ Failed to create session")
        return
    
    # Test wallet retrieval
    print("\n2. Testing wallet retrieval from session...")
    retrieved_wallet = kg.get_user_wallet(session_id)
    print(f"Retrieved wallet: {retrieved_wallet}")
    
    if retrieved_wallet == wallet_address:
        print("✅ Wallet retrieval successful")
    else:
        print("❌ Wallet retrieval failed")
    
    # Test session summary
    print("\n3. Getting session summary...")
    summary = kg.get_session_summary(session_id)
    print(f"Session active: {summary.get('session_active')}")
    print(f"Wallet: {summary.get('wallet_address')}")
    print(f"Preferences: {summary.get('preferences')}")
    
    return kg, session_id

def test_market_data_caching(kg, session_id):
    """Test market data caching functionality."""
    print("\n🧪 Testing Market Data Caching")
    print("=" * 50)
    
    if not kg or not kg.is_available():
        print("❌ Knowledge Graph not available")
        return
    
    # Test caching fake market data
    test_symbols = ["BTC", "ETH", "SOL"]
    
    print("1. Caching market data...")
    for i, symbol in enumerate(test_symbols):
        fake_price = 1000 + (i * 500)  # BTC: 1000, ETH: 1500, SOL: 2000
        kg.cache_market_data(symbol, {
            'current_price': fake_price,
            'volume_24h': 1000000,
            'market_cap': fake_price * 1000000,
            'symbol': symbol
        })
        print(f"  📊 Cached {symbol}: ${fake_price}")
    
    # Test cache retrieval
    print("\n2. Testing cache retrieval...")
    for symbol in test_symbols:
        cached_data = kg.get_cached_market_data(symbol)
        if cached_data:
            price = cached_data.get('current_price')
            print(f"  💰 {symbol}: ${price} (from cache)")
        else:
            print(f"  ❌ {symbol}: No cached data")
    
    # Test multiple price retrieval
    print("\n3. Testing multiple price retrieval...")
    prices = kg.get_multiple_cached_prices(test_symbols)
    for symbol, price in prices.items():
        status = "✅" if price is not None else "❌"
        print(f"  {status} {symbol}: ${price}")
    
    print(f"\n4. Cache efficiency test...")
    cache_status = kg.market_data_cache
    print(f"  📊 Total cached symbols: {len(cache_status)}")
    print(f"  ⏱️  Cache duration: {kg.cache_duration}s")
    
    return True

def test_integration_flow(kg, session_id):
    """Test the full integration flow."""
    print("\n🧪 Testing Integration Flow")
    print("=" * 50)
    
    if not kg or not kg.is_available():
        print("❌ Knowledge Graph not available")
        return
    
    # Simulate a user interaction flow
    print("1. User connects wallet and creates session ✅")
    print("2. User asks for portfolio analysis...")
    
    # In the actual system, this would happen automatically
    wallet = kg.get_user_wallet(session_id)
    print(f"  📍 Retrieved wallet from session: {wallet[:10]}...")
    
    print("3. System checks cache for ETH price...")
    cached_eth = kg.get_cached_market_data("ETH")
    if cached_eth:
        print(f"  💰 Found cached ETH price: ${cached_eth['current_price']}")
    else:
        print("  🔍 ETH price not in cache, would fetch from API")
    
    print("4. User asks for multiple token prices...")
    symbols = ["BTC", "ETH", "SOL", "ADA"]  # ADA not cached
    prices = kg.get_multiple_cached_prices(symbols)
    
    cached_count = len([p for p in prices.values() if p is not None])
    api_needed = len(symbols) - cached_count
    
    print(f"  📊 Cache hits: {cached_count}/{len(symbols)}")
    print(f"  🌐 API calls needed: {api_needed}")
    
    print("5. Testing cleanup...")
    cleaned = kg.cleanup_expired_sessions(0)  # Clean all sessions
    print(f"  🧹 Cleaned up {cleaned} sessions")
    
    return True

def main():
    """Run all tests."""
    print("🚀 MeTTa-KG Enhanced Features Test Suite")
    print("=" * 60)
    
    try:
        # Test session management
        kg, session_id = test_session_management()
        
        if kg and session_id:
            # Test caching
            test_market_data_caching(kg, session_id)
            
            # Test integration
            test_integration_flow(kg, session_id)
        
        print("\n🎉 All tests completed!")
        
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
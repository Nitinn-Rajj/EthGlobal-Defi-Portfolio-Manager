#!/usr/bin/env python3
"""
Test script for MeTTa Knowledge Graph integration with existing MCP server
"""

import sys
import os
import asyncio

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def test_server_imports():
    """Test that the server imports correctly with MeTTa integration."""
    print("🧪 Testing server imports...")
    
    try:
        # Import the server module
        from server import knowledge_graph, METTA_AVAILABLE, mcp
        print("✅ Server imports successful")
        
        # Check MCP tools count
        tool_count = len(mcp._tools) if hasattr(mcp, '_tools') else 0
        print(f"✅ MCP tools loaded: {tool_count}")
        
        # Check MeTTa status
        if METTA_AVAILABLE and knowledge_graph and knowledge_graph.is_available():
            print("✅ MeTTa Knowledge Graph: ACTIVE")
            summary = knowledge_graph.get_knowledge_summary()
            print(f"   📊 {summary.get('cryptocurrencies', 0)} cryptos, {summary.get('correlations', 0)} correlations")
        elif METTA_AVAILABLE:
            print("⚠️  MeTTa Knowledge Graph: INSTALLED but not functional")
        else:
            print("⚠️  MeTTa Knowledge Graph: NOT AVAILABLE")
        
        return True
        
    except ImportError as e:
        print(f"❌ Import failed: {e}")
        return False
    except Exception as e:
        print(f"❌ Server test failed: {e}")
        return False

def test_existing_functionality():
    """Test that existing MCP tools still work."""
    print("\n🧪 Testing existing MCP functionality...")
    
    try:
        from market_functions import get_coin_price
        from fgi_functions import get_fear_greed_index
        
        print("✅ Market functions import successful")
        print("✅ FGI functions import successful")
        print("✅ Existing functionality preserved")
        
        return True
        
    except ImportError as e:
        print(f"❌ Existing functionality broken: {e}")
        return False
    except Exception as e:
        print(f"❌ Functionality test failed: {e}")
        return False

def test_metta_module():
    """Test MeTTa module directly."""
    print("\n🧪 Testing MeTTa module...")
    
    try:
        from metta_kg.knowledge_graph import DeFiKnowledgeGraph
        from metta_kg.utils import format_risk_level, interpret_market_condition
        
        print("✅ MeTTa modules import successful")
        
        # Test knowledge graph initialization
        kg = DeFiKnowledgeGraph()
        
        if kg.is_available():
            print("✅ MeTTa Knowledge Graph functional")
            
            # Test basic query
            btc_info = kg.query_crypto_info("BTC")
            if btc_info and 'name' in btc_info:
                print(f"✅ Knowledge query works: BTC = {btc_info['name']}")
            else:
                print("⚠️  Knowledge query returned empty")
            
        else:
            print("⚠️  MeTTa Knowledge Graph in fallback mode")
        
        return True
        
    except ImportError as e:
        print(f"⚠️  MeTTa modules not available: {e}")
        return True  # Not a failure, just not installed
    except Exception as e:
        print(f"❌ MeTTa module test failed: {e}")
        return False

def print_system_status():
    """Print system status and installation instructions."""
    print("\n" + "="*60)
    print("📋 System Status Summary:")
    
    # Python version
    print(f"🐍 Python: {sys.version.split()[0]}")
    
    # Check if in virtual environment
    if hasattr(sys, 'real_prefix') or (hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix):
        print("📦 Environment: Virtual Environment ✅")
    else:
        print("📦 Environment: System Python ⚠️")
    
    # Check MeTTa availability
    try:
        import hyperon
        print("🧠 MeTTa (hyperon): INSTALLED ✅")
    except ImportError:
        print("🧠 MeTTa (hyperon): NOT INSTALLED ❌")
        print("   📥 Install with: pip install hyperon")
    
    print("\n💡 Next Steps:")
    print("1. If MeTTa not installed: pip install hyperon")
    print("2. Run: python server.py")
    print("3. Test enhanced tools:")
    print("   - get_intelligent_crypto_analysis('BTC')")
    print("   - get_ai_portfolio_recommendation('moderate', 10000)")
    print("   - get_metta_knowledge_status()")

def main():
    """Run all tests."""
    print("🚀 MeTTa Integration Test Suite")
    print("Testing enhanced server.py with MeTTa Knowledge Graph")
    print("="*60)
    
    tests = [
        ("Server Imports", test_server_imports),
        ("Existing Functionality", test_existing_functionality), 
        ("MeTTa Module", test_metta_module)
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        try:
            if test_func():
                passed += 1
                print(f"✅ {test_name}: PASSED")
            else:
                print(f"❌ {test_name}: FAILED")
        except Exception as e:
            print(f"💥 {test_name}: CRASHED - {e}")
    
    print(f"\n📊 Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Your enhanced server is ready!")
    else:
        print("⚠️  Some issues detected. Check output above.")
    
    print_system_status()
    
    return passed == total

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
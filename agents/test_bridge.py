#!/usr/bin/env python3
"""
Simple test script for the corrected bridge agent.
"""

import requests
import json

def test_bridge():
    """Test the bridge agent with correct ChatMessage models"""
    base_url = "http://127.0.0.1:8001"
    
    print("Testing Bridge Agent with ChatMessage Format")
    print("=" * 50)
    
    # Test 1: Health check
    print("\n1. Health check:")
    try:
        response = requests.get(f"{base_url}/health")
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   Response: {data}")
    except Exception as e:
        print(f"   Error: {e}")
    
    # Test 2: Ping (one-way ChatMessage)
    print("\n2. Ping test (ctx.send with ChatMessage):")
    try:
        data = {"text": "Hello from test!"}
        response = requests.post(f"{base_url}/ping", json=data, headers={"Content-Type": "application/json"})
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"   Response: {result}")
    except Exception as e:
        print(f"   Error: {e}")
    
    # Test 3: Chat (two-way ChatMessage)
    print("\n3. Chat test (ctx.send_and_receive with ChatMessage):")
    try:
        data = {"text": "What is the price of Bitcoin?"}
        response = requests.post(f"{base_url}/chat", json=data, headers={"Content-Type": "application/json"})
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"   Response: {result}")
    except Exception as e:
        print(f"   Error: {e}")
    
    print("\n" + "=" * 50)
    print("Test complete!")
    print("Note: Bridge now uses ChatMessage format compatible with MCP agent")

if __name__ == "__main__":
    print("Make sure both agents are running:")
    print("1. python agent.py")  
    print("2. python bridge_agent.py")
    print()
    
    input("Press Enter to run tests...")
    test_bridge()
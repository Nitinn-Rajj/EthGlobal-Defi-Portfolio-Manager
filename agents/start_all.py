#!/usr/bin/env python3

import subprocess
import sys
import os
import time
import platform

def get_script_dir():
    """Get the directory where this script is located"""
    return os.path.dirname(os.path.abspath(__file__))

def check_venv():
    """Check if virtual environment exists"""
    script_dir = get_script_dir()
    venv_path = os.path.join(script_dir, 'venv', 'bin', 'activate')
    
    if not os.path.exists(venv_path):
        print("❌ Virtual environment not found")
        print("Please create a virtual environment first:")
        print("python -m venv venv")
        print("source venv/bin/activate")
        print("pip install -r requirements.txt")
        sys.exit(1)
    
    return venv_path

def open_terminal_command(title, command, script_dir, venv_path):
    """Generate terminal command based on the system"""
    activate_and_run = f"cd '{script_dir}' && source '{venv_path}' && {command}"
    
    # Try different terminal emulators
    terminal_commands = [
        # GNOME Terminal
        ['gnome-terminal', '--title', title, '--', 'bash', '-c', f"{activate_and_run}; exec bash"],
        # XFCE Terminal  
        ['xfce4-terminal', '--title', title, '--execute', 'bash', '-c', f"{activate_and_run}; exec bash"],
        # Konsole (KDE)
        ['konsole', '--title', title, '-e', 'bash', '-c', f"{activate_and_run}; exec bash"],
        # xterm (fallback)
        ['xterm', '-T', title, '-e', 'bash', '-c', f"{activate_and_run}; exec bash"],
    ]
    
    for cmd in terminal_commands:
        try:
            # Check if terminal exists
            subprocess.run(['which', cmd[0]], check=True, capture_output=True)
            return cmd
        except (subprocess.CalledProcessError, FileNotFoundError):
            continue
    
    return None

def main():
    print("🚀 Starting Cryptocurrency Agent System")
    print("=" * 40)
    print("Components:")
    print("1. Dashboard Server (Flask) - Port 5000")
    print("2. Main Agent (MCP) - Port 8000") 
    print("3. Bridge Agent (REST API) - Port 8001")
    print()
    
    # Check virtual environment
    script_dir = get_script_dir()
    venv_path = check_venv()
    
    # Components to start
    components = [
        ("Dashboard Server (Port 5000)", "echo '🌐 Dashboard Server Starting...' && python dashboard_server.py"),
        ("Main Agent (Port 8000)", "echo '🤖 Main Agent Starting...' && python agent.py"),
        ("Bridge Agent (Port 8001)", "echo '🌉 Bridge Agent Starting...' && python bridge_agent.py")
    ]
    
    processes = []
    
    for i, (title, command) in enumerate(components):
        print(f"🔄 Starting {title}...")
        
        terminal_cmd = open_terminal_command(title, command, script_dir, venv_path)
        
        if terminal_cmd is None:
            print("❌ No supported terminal emulator found")
            print("Please install one of: gnome-terminal, xfce4-terminal, konsole, xterm")
            sys.exit(1)
        
        try:
            # Start the terminal
            process = subprocess.Popen(terminal_cmd)
            processes.append(process)
            print(f"✅ {title} terminal opened")
            
            # Wait between starts
            if i < len(components) - 1:
                print("⏳ Waiting 3 seconds...")
                time.sleep(3)
                
        except Exception as e:
            print(f"❌ Failed to start {title}: {e}")
    
    print()
    print("✅ All terminals opened!")
    print()
    print("🔗 API Endpoints:")
    print("  Dashboard API: http://127.0.0.1:5000/dashboard")
    print("  Chat API:      http://127.0.0.1:8001/chat")  
    print("  Health Check:  http://127.0.0.1:8001/health")
    print()
    print("📝 Test Commands:")
    print('  # Dashboard')
    print('  curl -X POST http://127.0.0.1:5000/dashboard -H "Content-Type: application/json" -d \'{"text":"0x123...wallet"}\'')
    print()
    print('  # Chat')
    print('  curl -X POST http://127.0.0.1:8001/chat -H "Content-Type: application/json" -d \'{"text":"What is the price of Bitcoin?"}\'')
    print()
    print("💡 Close terminals manually when done, or use Ctrl+C in each terminal")
    print()
    print("Press Ctrl+C to exit this launcher...")
    
    try:
        # Keep the launcher running
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n👋 Launcher stopped. Terminals will continue running.")

if __name__ == "__main__":
    main()
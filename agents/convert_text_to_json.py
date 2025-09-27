import os
import json
import google.generativeai as genai
from dotenv import load_dotenv
from google.generativeai.types import HarmCategory, HarmBlockThreshold

# Load environment variables from a .env file
load_dotenv()

# --- Configuration ---
genai.configure(api_key=os.environ.get("GOOGLE_API_KEY"))


# --- Tool Definitions ---

# Portfolio Details
update_portfolio_details = {
    "name": "update_portfolio_details",
    "description": "Parses and extracts asset, network, and balance information from a statement about holdings.",
    "parameters": {
        "type": "OBJECT",
        "properties": {
            "asset_symbol": {
                "type": "STRING",
                "description": "The symbol of the cryptocurrency, e.g., 'ETH', 'BTC'.",
            },
            "network": {
                "type": "STRING",
                "description": "The network the asset is on, e.g., 'Ethereum Mainnet', 'main net'.",
            },
            "amount": {
                "type": "NUMBER",
                "description": "The balance or amount of the specified asset.",
            },
        },
        "required": ["asset_symbol"],
    },
}

# Current Prices
get_current_prices = {
    "name": "get_current_prices",
    "description": "Parses text that states the current market price of one or more cryptocurrencies.",
    "parameters": {
        "type": "OBJECT",
        "properties": {
            "price_updates": {
                "type": "ARRAY",
                "description": "A list of cryptocurrencies and their stated prices.",
                "items": {
                    "type": "OBJECT",
                    "properties": {
                        "symbol": {
                            "type": "STRING",
                            "description": "The cryptocurrency symbol, e.g., BTC, ETH.",
                        },
                        "price_usd": {
                            "type": "NUMBER",
                            "description": "The price of the symbol in USD.",
                        },
                    },
                    "required": ["symbol", "price_usd"],
                },
            }
        },
        "required": ["price_updates"],
    },
}

# Swap
create_swap_json = {
    "name": "create_swap_json",
    "description": "Creates a JSON object for a cryptocurrency swap or trade transaction.",
    "parameters": {
        "type": "OBJECT",
        "properties": {
            "taker_asset": {
                "type": "STRING",
                "description": "The asset symbol the user is giving or selling.",
            },
            "maker_asset": {
                "type": "STRING",
                "description": "The asset symbol the user is receiving or buying.",
            },
            "taking_amount": {
                "type": "NUMBER",
                "description": "The amount of the taker_asset to be swapped.",
            },
        },
        "required": ["taker_asset", "maker_asset", "taking_amount"],
    },
}


# --- Main Processing Logic ---

def process_agent_response(text: str) -> str:
    """
    Takes natural language text, determines the correct JSON template,
    extracts relevant data, and returns the formatted JSON string.
    """
    print(f"[DEBUG] Processing input text: '{text}'")
    
    model = genai.GenerativeModel(
        model_name="gemini-2.5-pro",
        tools=[
            update_portfolio_details,
            get_current_prices,
            create_swap_json,
        ],
    )
    print("[DEBUG] Gemini model initialized successfully")
    
    chat = model.start_chat()
    print("[DEBUG] Starting chat session with Gemini")
    
    response = chat.send_message(
        text,
        safety_settings={
            HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
        }
    )
    print("[DEBUG] Received response from Gemini")
    print(f"[DEBUG] Response candidates: {len(response.candidates)}")
    
    if response.candidates:
        parts = response.candidates[0].content.parts
        print(f"[DEBUG] Content parts: {len(parts)}")
        if parts:
            print(f"[DEBUG] First part type: {type(parts[0])}")
            print(f"[DEBUG] First part has function_call: {hasattr(parts[0], 'function_call')}")

    final_json = {}
    try:
        print("[DEBUG] Attempting to extract function call")
        # Attempt to find and process a function call from the model
        function_call = response.candidates[0].content.parts[0].function_call
        function_name = function_call.name
        model_args = function_call.args

        if not function_name:
            raise AttributeError("Model returned an empty function call name.")
        
        print(f"[DEBUG] Function called: {function_name}")
        print(f"[DEBUG] Function arguments: {model_args}")

        if function_name == "update_portfolio_details":
            print("[DEBUG] Processing portfolio details")
            asset_symbol = model_args.get("asset_symbol", "").upper()
            asset_name = "Ethereum" if "ETH" in asset_symbol else "Bitcoin" if "BTC" in asset_symbol else asset_symbol
            print(f"[DEBUG] Asset symbol: {asset_symbol}, Asset name: {asset_name}")
            final_json = {
                "message_type": "portfolio_details",
                "content": {
                    "division": {
                        asset_name: {
                            "balance": "",
                            "usd_value": "",
                            "network": model_args.get("network", "").lower(),
                            "tokens": [{
                                "symbol": asset_symbol,
                                "amount": str(model_args.get("amount", "")),
                                "usd_value": ""
                            }]
                        }
                    }
                }
            }

        elif function_name == "get_current_prices":
            print("[DEBUG] Processing current prices")
            price_book = {}
            price_updates = model_args.get("price_updates", [])
            print(f"[DEBUG] Found {len(price_updates)} price updates")
            for update in price_updates:
                symbol = update.get("symbol", "UNKNOWN").upper()
                price = update.get("price_usd", "")
                print(f"[DEBUG] Processing price for {symbol}: ${price}")
                price_book[symbol] = {
                    "symbol": symbol,
                    "price_usd": str(price),
                    "price_btc": "",
                    "24h_change": ""
                }
            final_json = {"message_type": "current_prices", "content": {"price_book": price_book}}

        elif function_name == "create_swap_json":
            print("[DEBUG] Processing swap/trade")
            taker = model_args.get("taker_asset", "").upper()
            maker = model_args.get("maker_asset", "").upper()
            amount = str(model_args.get("taking_amount", ""))
            print(f"[DEBUG] Swap: {amount} {taker} -> {maker}")
            final_json = {
                "message_type": "swap",
                "content": {
                    "taker_asset": taker,
                    "maker_asset": maker,
                    "taking_amount": amount,
                    "making_amount": "",
                    "exchange_rate": "",
                    "network": "",
                    "status": "",
                    "transaction_hash": None
                }
            }
        else:
            print(f"[DEBUG] Unknown function name: {function_name}")
            
    except (AttributeError, IndexError, KeyError) as e:
        print(f"[DEBUG] Exception caught: {type(e).__name__}: {e}")
        # This block will execute if no function call is found by the model.
        # It correctly formats the output as plain_text.
        final_json = {
            "message_type": "plain_text",
            "content": {"text": text},
        }

    print(f"[DEBUG] Final JSON message_type: {final_json.get('message_type', 'empty')}")
    print("[DEBUG] Returning JSON result")
    return json.dumps(final_json)

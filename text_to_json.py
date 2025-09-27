import os
import json
import google.generativeai as genai
from google.generativeai.types import HarmCategory, HarmBlockThreshold

# --- Configuration ---
# Set your API key as an environment variable for security
# e.g., export GOOGLE_API_KEY="YOUR_API_KEY"
genai.configure(api_key=os.environ.get("GOOGLE_API_KEY"))


# --- Tool Definitions (Market Trend is now removed) ---

# 1. Plain Text (This is the fallback, no tool needed)

# 2. Portfolio Details
update_portfolio_details = {
    "name": "update_portfolio_details",
    "description": "Parses and extracts asset, network, and balance information from a statement about holdings.",
    "parameters": {
        "type": "object",
        "properties": {
            "asset_symbol": {
                "type": "string",
                "description": "The symbol of the cryptocurrency, e.g., 'ETH', 'BTC'.",
            },
            "network": {
                "type": "string",
                "description": "The network the asset is on, e.g., 'Ethereum Mainnet', 'main net'.",
            },
            "amount": {
                "type": "number",
                "description": "The balance or amount of the specified asset.",
            },
        },
        "required": ["asset_symbol"],
    },
}

# 3. Current Prices
get_current_prices = {
    "name": "get_current_prices",
    "description": "Gets the current market price of one or more specified cryptocurrencies.",
    "parameters": {
        "type": "object",
        "properties": {
            "symbols": {
                "type": "array",
                "description": "A list of cryptocurrency symbols to fetch the price for, e.g., ['ETH', 'BTC'].",
                "items": {"type": "string"},
            }
        },
        "required": ["symbols"],
    },
}

# 4. Swap
create_swap_json = {
    "name": "create_swap_json",
    "description": "Creates a JSON object for a cryptocurrency swap or trade transaction.",
    "parameters": {
        "type": "object",
        "properties": {
            "taker_asset": {
                "type": "string",
                "description": "The asset symbol the user is giving or selling.",
            },
            "maker_asset": {
                "type": "string",
                "description": "The asset symbol the user is receiving or buying.",
            },
            "taking_amount": {
                "type": "number",
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
    model = genai.GenerativeModel(
        model_name="gemini-1.5-flash-latest",
        tools=[
            update_portfolio_details,
            get_current_prices,
            create_swap_json,
        ],
    )
    
    chat = model.start_chat()
    response = chat.send_message(
        text,
        safety_settings={
            HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
        }
    )

    final_json = {}
    try:
        function_call = response.candidates[0].content.parts[0].function_call
        function_name = function_call.name
        model_args = function_call.args

        if function_name == "update_portfolio_details":
            asset_symbol = model_args.get("asset_symbol", "").upper()
            asset_name = "Ethereum" if "ETH" in asset_symbol else "BTC" if "BTC" in asset_symbol else asset_symbol
            final_json = {
                "message_type": "portfolio_details",
                "content": {
                    "division": {
                        asset_name: {
                            "balance": "", "usd_value": "",
                            "network": model_args.get("network", "").lower(),
                            "tokens": [{"symbol": asset_symbol, "amount": str(model_args.get("amount", "")), "usd_value": ""}],
                        }
                    }
                },
            }
        
        elif function_name == "get_current_prices":
            price_book = {}
            for symbol in model_args.get("symbols", []):
                price_book[symbol.upper()] = {"symbol": symbol.upper(), "price_usd": "", "price_btc": "", "24h_change": ""}
            final_json = {"message_type": "current_prices", "content": {"price_book": price_book}}

        elif function_name == "create_swap_json":
            final_json = {
                "message_type": "swap",
                "content": {
                    "taker_asset": model_args.get("taker_asset", "").upper(),
                    "maker_asset": model_args.get("maker_asset", "").upper(),
                    "taking_amount": str(model_args.get("taking_amount", "")),
                    "making_amount": "", "exchange_rate": "", "network": "", "status": "",
                    "transaction_hash": None,
                },
            }

    except (AttributeError, IndexError, KeyError):
        # Fallback for plain text if no tool matches
        final_json = {
            "message_type": "plain_text",
            "content": {"text": text},
        }

    return json.dumps(final_json, indent=2)


# --- Example Usage ---
if __name__ == "__main__":
    agent_responses = [
        # Now correctly falls back to plain_text
        "How is the market looking today?",
        # Portfolio Details
        "Your current ethereum balance on the main net is 0.0047.",
        # Swap
        "Okay, initiating a swap of 0.5 ETH for USDC.",
        # Current Prices
        "What is the price of Bitcoin?",
        # Plain Text
        "I'm sorry, I cannot process that request.",
    ]

    for res in agent_responses:
        print(f"--- Agent Response: '{res}' ---")
        json_output = process_agent_response(res)
        print(json_output)
        print("\n" + "="*40 + "\n")
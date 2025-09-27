import { GoogleGenerativeAI } from '@google/generative-ai';

// --- Google AI Setup ---
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
console.log('🔑 API Key loaded:', API_KEY ? 'Yes' : 'No', API_KEY?.substring(0, 10) + '...');

if (!API_KEY) {
    console.error('❌ VITE_GOOGLE_API_KEY not found in environment variables');
}

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-lite",
    generationConfig: {
        responseMimeType: "application/json", // This is crucial for forcing JSON output
    },
});

// --- The Main Prompt Template ---
const getPrompt = (inputText) => `
You are an expert financial assistant API. Your job is to analyze user text and convert it into a structured JSON object.

You must categorize the user's intent into one of the following types:
- "portfolio_summary"
- "coin_summary"
- "limit_order"
- "swap"
- "other"

Based on the type, you will extract the required information. The final output must be a single, valid JSON object with a "type" attribute and an optional "data" attribute.

### JSON Response Formats ###

1.  If the type is "portfolio_summary":
    { "type": "portfolio_summary" }

2.  If the type is "coin_summary":
    { "type": "coin_summary", "data": { "coin_symbol": "SYMBOL" } }

3.  If the type is "limit_order":
    { "type": "limit_order", "data": { "maker_coin": "SYMBOL", "taker_coin": "SYMBOL", "making_amount": 0.0, "taking_amount": 0.0, "expiry_time_hours": 24 } }

4.  If the type is "swap":
    { "type": "swap", "data": { "initial_coin": "SYMBOL", "target_coin": "SYMBOL", "amount": 0.0, "slippage_percentage": null } }

5.  If the type is "other":
    { "type": "other" }

### User Request ###

User Text: "${inputText}"
`;

// --- The Main Processing Function ---
const processText = async (inputText) => {
    try {
        if (!inputText) {
            throw new Error('Text input is required.');
        }

        console.log("🚀 Processing text:", inputText);
        console.log("🤖 Model initialized:", !!model);

        if (!API_KEY) {
            throw new Error('Google API key is missing');
        }

        const prompt = getPrompt(inputText);
        console.log("📝 Prompt sent to AI:", prompt.substring(0, 200) + '...');
        
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        console.log("✅ LLM Response:", responseText);

        // The responseText is already a JSON string because of the `responseMimeType` setting
        const jsonResponse = JSON.parse(responseText);

        return jsonResponse;

    } catch (error) {
        console.error("🔥 Error processing request:", error);
        console.error("🔥 Full error details:", {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        throw new Error(`Failed to process text with AI model: ${error.message}`);
    }
};

// Export the function for use in other components
export { processText };
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../../agents/.env') }); // Load environment variables from agents/.env file

const { GoogleGenerativeAI } = require('@google/generative-ai');

// --- Google AI Setup ---
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
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

        const prompt = getPrompt(inputText);
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        console.log("✅ LLM Response:", responseText);

        // The responseText is already a JSON string because of the `responseMimeType` setting
        const jsonResponse = JSON.parse(responseText);

        return jsonResponse;

    } catch (error) {
        console.error("🔥 Error processing request:", error);
        throw new Error('Failed to process text with AI model.');
    }
};

// Export the function for use in other components
module.exports = { processText };
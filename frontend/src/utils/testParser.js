import { GoogleGenerativeAI } from '@google/generative-ai';

// Simple test function to check if parser works
export const testParser = async () => {
  try {
    console.log('🧪 Testing parser...');
    
    const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
    console.log('🔑 API Key exists:', !!API_KEY);
    console.log('🔑 API Key preview:', API_KEY?.substring(0, 10) + '...');
    
    if (!API_KEY) {
      throw new Error('API key missing');
    }
    
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash"
    });
    
    console.log('🤖 Model created successfully');
    
    const result = await model.generateContent("Say hello in JSON format");
    const text = result.response.text();
    console.log('✅ Test response:', text);
    
    return { success: true, response: text };
  } catch (error) {
    console.error('❌ Test failed:', error);
    return { success: false, error: error.message };
  }
};
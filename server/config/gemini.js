const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');

dotenv.config();

// Check if API key is present
if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not defined in environment variables');
}

// Initialize with API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Get the model - using Gemini 1.5 Pro for better code generation
const model = genAI.getGenerativeModel({ 
  model: "gemini-1.5-pro"  // Updated to Gemini 1.5 Pro model
});

// Simple wrapper for generating content
const generateContent = async (prompt) => {
  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw error;
  }
};

module.exports = { model, generateContent }; 
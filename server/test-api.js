const { GoogleGenerativeAI } = require("@google/generative-ai");

// Replace with your API key
const API_KEY = "AIzaSyDZ6Kwk6H3D3yrGrNgWTd9i4KGaKF2QCZc";

async function testAPI() {
  try {
    console.log('Starting API test...');
    
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const prompt = "Write a simple function to calculate factorial in JavaScript";
    const result = await model.generateContent(prompt);
    console.log(result.response.text());
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAPI(); 
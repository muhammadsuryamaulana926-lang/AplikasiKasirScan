const axios = require('axios');

const GEMINI_API_KEY = 'AIzaSyAdZF0mTiha7as6YnPVjpsPncd7__xBgrM';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent';

async function testGemini() {
  try {
    console.log('🧪 Testing Gemini API...');
    
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{
            text: "Halo, apa kabar?"
          }]
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ API Test Success!');
    console.log('Response:', response.data.candidates[0].content.parts[0].text);
    
  } catch (error) {
    console.error('❌ API Test Failed:');
    console.error('Status:', error.response?.status);
    console.error('Error:', error.response?.data || error.message);
  }
}

testGemini();
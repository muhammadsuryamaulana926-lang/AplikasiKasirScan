const axios = require('axios');

const GEMINI_API_KEY = 'AIzaSyAdZF0mTiha7as6YnPVjpsPncd7__xBgrM';

async function listModels() {
  try {
    console.log('📋 Checking available models...');
    
    const response = await axios.get(
      `https://generativelanguage.googleapis.com/v1/models?key=${GEMINI_API_KEY}`
    );
    
    console.log('Available models:');
    response.data.models.forEach(model => {
      console.log(`- ${model.name} (${model.displayName})`);
    });
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

listModels();
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const API_KEYS_FILE = path.join(__dirname, 'api-keys.json');

const apiKeysFromEnv = [
  {
    name: 'Groq Primary',
    provider: 'groq',
    apiKey: process.env.GROQ_API_KEY || '',
    model: 'llama-3.3-70b-versatile',
    url: 'https://api.groq.com/openai/v1/chat/completions',
    enabled: !!process.env.GROQ_API_KEY
  },
  {
    name: 'Gemini Backup',
    provider: 'gemini',
    apiKey: process.env.GEMINI_API_KEY || '',
    model: 'gemini-1.5-flash',
    url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    enabled: !!process.env.GEMINI_API_KEY
  },
  {
    name: 'Mistral Backup',
    provider: 'mistral',
    apiKey: process.env.MISTRAL_API_KEY || '',
    model: 'mistral-small-latest',
    url: 'https://api.mistral.ai/v1/chat/completions',
    enabled: !!process.env.MISTRAL_API_KEY
  },
  {
    name: 'Cohere Backup',
    provider: 'cohere',
    apiKey: process.env.COHERE_API_KEY || '',
    model: 'command',
    url: 'https://api.cohere.ai/v1/chat',
    enabled: !!process.env.COHERE_API_KEY
  },
  {
    name: 'HuggingFace Backup',
    provider: 'huggingface',
    apiKey: process.env.HUGGINGFACE_API_KEY || '',
    model: 'meta-llama/Meta-Llama-3-8B-Instruct',
    url: 'https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct',
    enabled: !!process.env.HUGGINGFACE_API_KEY
  },
  {
    name: 'OpenRouter Backup',
    provider: 'openrouter',
    apiKey: process.env.OPENROUTER_API_KEY || '',
    model: 'google/gemini-2.0-flash-exp:free',
    url: 'https://openrouter.ai/api/v1/chat/completions',
    enabled: !!process.env.OPENROUTER_API_KEY
  }
].filter(api => api.apiKey); // Only include APIs with keys

try {
  fs.writeFileSync(API_KEYS_FILE, JSON.stringify(apiKeysFromEnv, null, 2));
  console.log('✅ API keys populated successfully!');
  console.log(`📊 Total API keys: ${apiKeysFromEnv.length}`);
  apiKeysFromEnv.forEach(api => {
    console.log(`   - ${api.name} (${api.provider}): ${api.enabled ? '✅ Enabled' : '❌ Disabled'}`);
  });
} catch (error) {
  console.error('❌ Error populating API keys:', error.message);
}

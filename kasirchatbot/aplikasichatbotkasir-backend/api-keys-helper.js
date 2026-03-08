const fs = require('fs');
const path = require('path');

const API_KEYS_FILE = path.join(__dirname, 'api-keys.json');

// Initialize file if not exists
if (!fs.existsSync(API_KEYS_FILE)) {
  fs.writeFileSync(API_KEYS_FILE, JSON.stringify([], null, 2));
}

function getAllApiKeys() {
  try {
    const data = fs.readFileSync(API_KEYS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading API keys:', error);
    return [];
  }
}

function saveApiKeys(apiKeys) {
  try {
    fs.writeFileSync(API_KEYS_FILE, JSON.stringify(apiKeys, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving API keys:', error);
    return false;
  }
}

function addApiKey(apiKeyData) {
  const apiKeys = getAllApiKeys();
  
  // Check if name already exists
  if (apiKeys.find(k => k.name === apiKeyData.name)) {
    return { success: false, message: 'API key dengan nama ini sudah ada' };
  }
  
  apiKeys.push({
    name: apiKeyData.name,
    provider: apiKeyData.provider,
    apiKey: apiKeyData.apiKey,
    model: apiKeyData.model,
    url: apiKeyData.url,
    enabled: apiKeyData.enabled !== false
  });
  
  if (saveApiKeys(apiKeys)) {
    return { success: true, message: 'API key berhasil ditambahkan' };
  }
  
  return { success: false, message: 'Gagal menyimpan API key' };
}

function updateApiKey(name, updates) {
  const apiKeys = getAllApiKeys();
  const index = apiKeys.findIndex(k => k.name === name);
  
  if (index === -1) {
    return { success: false, message: 'API key tidak ditemukan' };
  }
  
  // Update only provided fields
  if (updates.provider) apiKeys[index].provider = updates.provider;
  if (updates.model) apiKeys[index].model = updates.model;
  if (updates.url) apiKeys[index].url = updates.url;
  if (updates.apiKey) apiKeys[index].apiKey = updates.apiKey;
  if (updates.enabled !== undefined) apiKeys[index].enabled = updates.enabled;
  
  if (saveApiKeys(apiKeys)) {
    return { success: true, message: 'API key berhasil diupdate' };
  }
  
  return { success: false, message: 'Gagal mengupdate API key' };
}

function deleteApiKey(name) {
  const apiKeys = getAllApiKeys();
  const filtered = apiKeys.filter(k => k.name !== name);
  
  if (filtered.length === apiKeys.length) {
    return { success: false, message: 'API key tidak ditemukan' };
  }
  
  if (saveApiKeys(filtered)) {
    return { success: true, message: 'API key berhasil dihapus' };
  }
  
  return { success: false, message: 'Gagal menghapus API key' };
}

function getEnabledApiKeys() {
  return getAllApiKeys().filter(k => k.enabled);
}

module.exports = {
  getAllApiKeys,
  addApiKey,
  updateApiKey,
  deleteApiKey,
  getEnabledApiKeys
};

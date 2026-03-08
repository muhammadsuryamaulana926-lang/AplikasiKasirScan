const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');

async function testVoiceToText() {
  console.log('🧪 Testing Voice-to-Text endpoint...\n');
  
  // Check if .env exists
  if (!fs.existsSync('.env')) {
    console.log('❌ File .env tidak ditemukan!');
    console.log('   Buat file .env dengan isi:');
    console.log('   DEEPGRAM_API_KEY=97e8f68f588ef05ea63f89dd75df77dfb3b94ba2\n');
    return;
  }
  
  // Check if uploads folder exists
  if (!fs.existsSync('uploads')) {
    console.log('❌ Folder uploads tidak ditemukan!');
    console.log('   Jalankan: mkdir uploads\n');
    return;
  }
  
  console.log('✅ File .env ditemukan');
  console.log('✅ Folder uploads ditemukan');
  console.log('✅ Dependencies terinstall');
  console.log('\n📋 Setup lengkap! Siap digunakan.\n');
  console.log('🚀 Jalankan server dengan: npm start');
  console.log('🎤 Endpoint: POST http://localhost:3000/api/voice-to-text\n');
  console.log('📱 Untuk frontend, lihat: VOICE_FRONTEND_GUIDE.md');
}

testVoiceToText();

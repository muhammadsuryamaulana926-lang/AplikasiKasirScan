# 🎤 Setup Voice-to-Text Feature

## 1. Install Dependencies Backend

```bash
cd chatbot-backend
npm install multer @deepgram/sdk
```

## 2. Daftar Deepgram (GRATIS)

1. Buka: https://deepgram.com
2. Sign up dengan email
3. Verifikasi email
4. Dapatkan API Key di Dashboard
5. **Free tier: $200 credit** (≈45 jam audio transcription)

## 3. Konfigurasi API Key

Buat file `.env` di folder `chatbot-backend`:

```bash
DEEPGRAM_API_KEY=your_api_key_here
```

Atau edit langsung di `voice-to-text.js` line 11:
```javascript
const DEEPGRAM_API_KEY = 'your_api_key_here';
```

## 4. Buat Folder Uploads

```bash
mkdir uploads
```

## 5. Restart Backend

```bash
npm start
```

## 6. Test Endpoint

```bash
curl -X POST http://localhost:3000/api/voice-to-text \
  -F "audio=@test-audio.m4a"
```

Response:
```json
{
  "success": true,
  "text": "halo ini adalah test audio",
  "confidence": 0.95
}
```

## 📱 Frontend Implementation

Lihat file `VOICE_FRONTEND_GUIDE.md` untuk implementasi React Native.

## 🎯 Fitur

- ✅ Support Bahasa Indonesia
- ✅ Max file size: 10MB
- ✅ Format: m4a, mp3, wav, webm
- ✅ Auto delete temporary files
- ✅ Confidence score

## 🔧 Troubleshooting

**Error: "Deepgram API key belum dikonfigurasi"**
- Pastikan file `.env` ada dan berisi `DEEPGRAM_API_KEY`
- Atau hardcode API key di `voice-to-text.js`

**Error: "Cannot find module '@deepgram/sdk'"**
```bash
npm install @deepgram/sdk
```

**Error: "ENOENT: no such file or directory, open 'uploads/...'"**
```bash
mkdir uploads
```

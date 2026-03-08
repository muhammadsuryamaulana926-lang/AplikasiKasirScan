# Setup Google Gemini API

## Langkah-langkah:

1. **Buka Google AI Studio**
   - Kunjungi: https://makersuite.google.com/app/apikey
   - Atau: https://aistudio.google.com/app/apikey

2. **Login dengan akun Google**

3. **Klik "Create API Key"**
   - Pilih project atau buat project baru
   - Copy API key yang muncul

4. **Paste API key ke server.js**
   ```javascript
   const GEMINI_API_KEY = 'AIzaSy...'; // Paste API key di sini
   ```

5. **Restart backend**
   ```bash
   npm start
   ```

## Keuntungan Gemini:
- ✅ GRATIS (60 requests/menit)
- ✅ Lebih stabil dari OpenRouter
- ✅ Tidak perlu credit card
- ✅ Response cepat
- ✅ Support Bahasa Indonesia

## Test:
Setelah setup, coba tanya:
- "siapa presiden ke 2 indonesia?"
- "cara masak nasi"
- "apa itu javascript?"

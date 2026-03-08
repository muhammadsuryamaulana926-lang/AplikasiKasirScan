# Setup Backend Chatbot

## Instalasi

1. Masuk ke folder backend:
```bash
cd chatbot-backend
```

2. Install dependencies:
```bash
npm install
```

3. Pastikan MySQL sudah running dan database `nangka_busuk_db` sudah dibuat

4. Jalankan server:
```bash
npm start
```

## Fitur

### 1. Authentication dengan OTP
- ✅ Register dengan email verification
- ✅ Login dengan email & password
- ✅ Forgot password dengan OTP
- ✅ Reset password

### 2. Chatbot
- ✅ Query database Nangka Busuk
- ✅ Integrasi Gemini AI untuk pertanyaan umum
- ✅ Auto-detect query type

## Endpoints

### Auth
- `POST /api/auth/register/send-code` - Kirim OTP registrasi
- `POST /api/auth/register/verify` - Verifikasi OTP & buat akun
- `POST /api/auth/login` - Login
- `POST /api/auth/forgot-password/send-code` - Kirim OTP reset password
- `POST /api/auth/reset-password` - Reset password dengan OTP

### Chatbot
- `POST /api/query` - Query chatbot
- `GET /api/health` - Health check

## Konfigurasi

Edit `server.js` untuk mengubah:
- Database config (host, user, password, database)
- Email config (user, password)
- Port (default: 3000)

## Catatan

Server ini menggabungkan:
- Sistem OTP untuk authentication
- Chatbot dengan database query
- Integrasi Gemini AI

Semua dalam satu backend yang terintegrasi.

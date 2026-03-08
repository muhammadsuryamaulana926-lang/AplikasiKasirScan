# 🔐 Panduan Auto-Login System

## Cara Kerja

Sistem auto-login menggunakan **JWT Token** dengan masa berlaku **30 hari**.

### Flow Login:

1. **User Login** → Backend generate JWT token (berlaku 30 hari)
2. **Token disimpan** di AsyncStorage (local storage HP)
3. **Setiap buka app** → Cek token di AsyncStorage
4. **Jika token valid** → Langsung masuk ke Home
5. **Jika token expired/invalid** → Harus login lagi

### Keuntungan:

✅ User tidak perlu login berulang kali  
✅ Token otomatis expired setelah 30 hari (keamanan)  
✅ Jika logout manual, token dihapus  
✅ Jika ganti HP/uninstall app, harus login lagi  

## Konfigurasi

### Backend (auth.js)
```javascript
const TOKEN_EXPIRY = '30d'; // Ubah sesuai kebutuhan
// Contoh: '7d' = 7 hari, '1h' = 1 jam, '30m' = 30 menit
```

### Frontend (LoginScreen.tsx)
Auto-login sudah aktif secara otomatis saat app dibuka.

## Testing

1. **Login** → Masuk ke halaman Chat
2. **Tutup app** (swipe dari recent apps)
3. **Buka app lagi** → Langsung masuk tanpa login
4. **Logout** → Kembali ke halaman Login
5. **Buka app lagi** → Harus login lagi

## Troubleshooting

### Token tidak tersimpan?
- Pastikan AsyncStorage berfungsi
- Cek console log: "Token valid untuk: [email]"

### Selalu diminta login?
- Cek backend running
- Cek endpoint `/api/auth/verify-token` berfungsi
- Cek token di AsyncStorage: `await AsyncStorage.getItem('userToken')`

### Token expired terlalu cepat?
- Ubah `TOKEN_EXPIRY` di backend `auth.js`
- Restart backend setelah perubahan

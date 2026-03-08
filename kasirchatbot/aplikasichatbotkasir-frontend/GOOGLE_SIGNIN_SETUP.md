# Google Sign In Setup

## Backend Setup ✅ (SUDAH SELESAI)
- Package `google-auth-library` sudah terinstall
- Endpoint `/api/auth/google-login` sudah dibuat
- Client ID sudah dikonfigurasi
- Database sudah diupdate (kolom `google_id`)

## Frontend Setup ✅ (SUDAH SELESAI)
- Package `@react-native-google-signin/google-signin` sudah terinstall
- LoginScreen sudah diupdate dengan fungsi Google Sign In
- Plugin sudah ditambahkan di app.json

## Yang Perlu Dilakukan:

### 1. Download google-services.json (Android)
1. Buka: https://console.firebase.google.com/project/chatbot-485313
2. Pilih project "chatbot-485313"
3. Klik icon Android atau "Add app" → Android
4. Masukkan package name: `com.anonymous.aplikasichatbot` (atau sesuai package Anda)
5. Download `google-services.json`
6. Letakkan file di root folder: `c:\Users\User\aplikasichatbot\google-services.json`

### 2. Update app.json
Tambahkan di bagian android:
```json
"android": {
  "googleServicesFile": "./google-services.json",
  "package": "com.anonymous.aplikasichatbot"
}
```

### 3. Rebuild App
```bash
npx expo prebuild --clean
npx expo run:android
```

### 4. Test
- Buka app
- Klik tombol "Login dengan Google"
- Pilih akun Google
- Login berhasil!

## Troubleshooting

### Error: DEVELOPER_ERROR
- Pastikan SHA-1 fingerprint sudah ditambahkan di Google Cloud Console
- Dapatkan SHA-1 dengan: `cd android && ./gradlew signingReport`

### Error: SIGN_IN_REQUIRED
- Pastikan Google Sign In sudah diaktifkan di Firebase Console
- Pastikan Client ID sudah benar

### Error: Network Error
- Pastikan backend sudah running
- Pastikan BACKEND_URL di config sudah benar

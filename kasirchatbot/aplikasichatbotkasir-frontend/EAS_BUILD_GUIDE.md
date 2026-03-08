# Panduan Build dengan EAS (Tanpa Android Studio)

## Langkah 1: Install EAS CLI
Buka terminal/command prompt dan jalankan:
```bash
npm install -g eas-cli
```

## Langkah 2: Login ke Expo
```bash
eas login
```
- Jika belum punya akun, buat di: https://expo.dev/signup
- Masukkan email dan password Anda

## Langkah 3: Konfigurasi EAS
```bash
eas build:configure
```
Ini akan membuat file `eas.json` otomatis.

## Langkah 4: Download google-services.json

### A. Buka Firebase Console
1. Buka: https://console.firebase.google.com/
2. Klik "Add project" atau pilih project yang sudah ada
3. Beri nama: "ChatbotApp" (atau nama lain)
4. Klik "Continue" → "Continue" → "Create project"

### B. Tambah Android App
1. Di Firebase Console, klik icon Android (⚙️ Settings → Project settings)
2. Scroll ke bawah, klik "Add app" → pilih Android
3. Masukkan:
   - **Android package name**: `com.anonymous.aplikasichatbot`
   - **App nickname**: ChatbotApp (opsional)
   - Klik "Register app"
4. Download `google-services.json`
5. Letakkan file di: `c:\Users\User\aplikasichatbot\google-services.json`

### C. Enable Google Sign In
1. Di Firebase Console, klik "Authentication" di menu kiri
2. Klik "Get started"
3. Klik tab "Sign-in method"
4. Klik "Google" → Enable → Save

## Langkah 5: Build APK
```bash
eas build --profile development --platform android
```

**Proses ini akan:**
- Upload kode ke server Expo
- Build APK di cloud (gratis untuk development)
- Memakan waktu 10-20 menit
- Memberikan link download APK

## Langkah 6: Install APK
1. Setelah build selesai, Anda akan dapat link download
2. Download APK ke HP Android
3. Install APK (aktifkan "Install from unknown sources" jika diminta)
4. Buka aplikasi
5. Test login dengan Google!

## Troubleshooting

### Error: "Not authenticated"
```bash
eas logout
eas login
```

### Error: "google-services.json not found"
Pastikan file ada di root folder dan nama file benar (huruf kecil semua).

### Build gagal
Cek log error di terminal atau di: https://expo.dev/accounts/[username]/projects/aplikasichatbot/builds

## Catatan Penting
- Build pertama bisa memakan waktu lebih lama
- Anda bisa track progress di: https://expo.dev
- APK hanya untuk testing, bukan production
- Gratis untuk development build (unlimited)

## Setelah Berhasil
Jika ingin build production (untuk upload ke Play Store):
```bash
eas build --profile production --platform android
```

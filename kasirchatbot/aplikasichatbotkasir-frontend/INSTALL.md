# Panduan Instalasi Login Screen

## Dependencies yang Ditambahkan

Saya telah menambahkan fitur login screen ke aplikasi Anda. Berikut adalah dependencies baru yang perlu diinstal:

1. `@react-navigation/stack` - Untuk stack navigation
2. `@react-navigation/native-stack` - Native stack navigator
3. `@react-native-async-storage/async-storage` - Untuk menyimpan data login

## Cara Install

Jalankan perintah berikut di terminal:

```bash
npm install
```

Atau jika ada masalah, install satu per satu:

```bash
npm install @react-navigation/stack
npm install @react-navigation/native-stack
npm install @react-native-async-storage/async-storage
```

## Struktur File yang Dibuat

```
aplikasichatbot/
├── navigation/
│   └── AppNavigator.tsx          # Navigator utama
├── screens/
│   ├── auth/
│   │   ├── LoginScreen.tsx       # Halaman login (LENGKAP)
│   │   ├── SignUpEmailScreen.tsx # Placeholder
│   │   ├── SignUpPasswordScreen.tsx
│   │   ├── VerificationCodeScreen.tsx
│   │   ├── ForgotPasswordEmailScreen.tsx
│   │   └── ResetPasswordScreen.tsx
│   └── main/
│       └── ChatScreen.tsx        # Halaman chat (dipindahkan dari App.tsx)
├── types/
│   └── navigation.ts             # Type definitions untuk navigation
└── App.tsx                       # Entry point (diupdate)
```

## Cara Menjalankan

1. Install dependencies:
   ```bash
   npm install
   ```

2. Jalankan aplikasi:
   ```bash
   npx expo start
   ```

3. Aplikasi akan membuka LoginScreen sebagai halaman pertama

## Fitur Login Screen

- ✅ Input email dan password
- ✅ Toggle show/hide password
- ✅ Forgot password link
- ✅ Sign up link
- ✅ Google sign in button (placeholder)
- ✅ Loading state saat login
- ✅ Validasi input
- ✅ Simpan token ke AsyncStorage
- ✅ Navigate ke ChatScreen setelah login berhasil

## Testing Login

Untuk testing, Anda bisa login dengan email dan password apa saja. Sistem akan:
1. Simulasi loading 1.5 detik
2. Simpan token dummy ke AsyncStorage
3. Navigate ke ChatScreen

## Next Steps

Jika ingin mengimplementasikan screen lainnya (SignUp, ForgotPassword, dll), Anda bisa menggunakan LoginScreen.tsx sebagai template dan menyesuaikan dengan kebutuhan.

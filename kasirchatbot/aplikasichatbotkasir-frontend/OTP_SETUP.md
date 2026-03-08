# 📧 PANDUAN SETUP SISTEM OTP

Sistem registrasi dan lupa password dengan kode OTP via email.

---

## 🚀 LANGKAH SETUP

### 1️⃣ Install Dependencies Backend

```bash
npm install nodemailer bcrypt mysql2
```

### 2️⃣ Setup Database

1. Buka **phpMyAdmin** atau **MySQL Workbench**
2. Pilih database `nangka_busuk_db`
3. Jalankan query dari file `DATABASE_SETUP.sql`

### 3️⃣ Setup Gmail App Password

1. Buka: https://myaccount.google.com/apppasswords
2. Jika belum aktif 2-Step Verification:
   - Buka: https://myaccount.google.com/signinoptions/two-step-verification
   - Aktifkan terlebih dahulu
3. Generate App Password:
   - App: **Mail**
   - Device: **Other (Custom name)** → ketik "Chatbot App"
   - Klik **Generate**
   - Copy password 16 digit

### 4️⃣ Update server.js

Ganti bagian email config di `server.js`:

```javascript
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'emailanda@gmail.com',      // GANTI dengan email Gmail Anda
    pass: 'mvuc ffbn kgwu ixzp'       // GANTI dengan App Password Anda
  }
});
```

Dan di bagian sendOTPEmail:

```javascript
await transporter.sendMail({
  from: 'emailanda@gmail.com',  // GANTI dengan email Gmail Anda
  to: email,
  subject: subject,
  text: message
});
```

### 5️⃣ Jalankan Backend

```bash
node server.js
```

---

## ✅ CARA KERJA SISTEM

### 📝 Registrasi Akun Baru:
1. User input email → Kirim OTP ke email
2. User input kode OTP 6 digit → Verifikasi
3. User buat password → Akun dibuat ✅

### 🔑 Lupa Password:
1. User input email → Kirim OTP ke email
2. User input kode OTP 6 digit → Verifikasi
3. User input password baru → Password direset ✅

---

## 🔒 KEAMANAN

- ✅ OTP berlaku **5 menit**
- ✅ OTP hanya bisa dipakai **1 kali**
- ✅ Password di-hash dengan **bcrypt**
- ✅ Email harus **unik** (tidak boleh duplikat)

---

## 📡 API ENDPOINTS

### 1. Kirim OTP Registrasi
```
POST /api/auth/register/send-code
Body: { "email": "user@gmail.com" }
```

### 2. Verifikasi OTP & Buat Akun
```
POST /api/auth/register/verify
Body: { 
  "email": "user@gmail.com",
  "code": "123456",
  "password": "password123"
}
```

### 3. Kirim OTP Lupa Password
```
POST /api/auth/forgot-password/send-code
Body: { "email": "user@gmail.com" }
```

### 4. Reset Password
```
POST /api/auth/reset-password
Body: { 
  "email": "user@gmail.com",
  "code": "123456",
  "newPassword": "newpassword123"
}
```

### 5. Login
```
POST /api/auth/login
Body: { 
  "email": "user@gmail.com",
  "password": "password123"
}
```

---

## 🐛 TROUBLESHOOTING

### Email tidak terkirim?
- Pastikan App Password benar (16 digit)
- Pastikan 2-Step Verification aktif
- Cek spam/junk folder
- Pastikan internet stabil

### Error "Email sudah terdaftar"?
- Email memang sudah ada di database
- Gunakan email lain atau login

### Error "Kode OTP tidak valid"?
- Kode sudah kadaluarsa (>5 menit)
- Kode salah
- Kode sudah pernah dipakai

### Error koneksi database?
- Pastikan MySQL running
- Cek konfigurasi database di server.js
- Pastikan tabel sudah dibuat

---

## 📝 CATATAN

- Ganti `emailanda@gmail.com` dengan email Gmail Anda
- Ganti `mvuc ffbn kgwu ixzp` dengan App Password Anda
- Jangan share App Password ke siapapun
- App Password berbeda dengan password Gmail biasa

---

✅ **Setup selesai! Sistem OTP siap digunakan.**

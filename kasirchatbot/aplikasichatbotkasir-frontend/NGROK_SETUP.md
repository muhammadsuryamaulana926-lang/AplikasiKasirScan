# 🚀 Setup Ngrok - Akses Backend dari IP Berbeda

## 📋 Langkah-langkah Setup

### **1. Install Ngrok**

```bash
npm install -g ngrok
```

Atau download dari: https://ngrok.com/download

---

### **2. Daftar Akun Ngrok (Gratis)**

1. Buka: https://dashboard.ngrok.com/signup
2. Daftar dengan email/Google
3. Setelah login, copy **Authtoken** Anda
4. Jalankan di terminal:

```bash
ngrok config add-authtoken YOUR_AUTHTOKEN_HERE
```

---

### **3. Jalankan Backend + Ngrok**

#### **Terminal 1 - Backend:**
```bash
cd c:\Users\User\aplikasichatbot
node server.js
```

Tunggu sampai muncul: `Server running on port 3000` ✅

#### **Terminal 2 - Ngrok:**
```bash
ngrok http 3000
```

Anda akan lihat output seperti ini:
```
Session Status    online
Forwarding        https://abc123.ngrok.io -> http://localhost:3000
```

**COPY URL** yang ada `https://abc123.ngrok.io` ⬅️ Ini URL publik Anda!

---

### **4. Update Config Frontend**

Buka file: `config/api-config.ts`

Ganti `BACKEND_URL` dengan URL ngrok:

```typescript
export const API_CONFIG = {
  // Ganti dengan URL dari ngrok
  BACKEND_URL: 'https://abc123.ngrok.io', // ⬅️ Paste URL ngrok di sini
};
```

**PENTING:** 
- Jangan pakai `http://`, pakai `https://` dari ngrok
- Jangan tambahkan `/` di akhir
- Jangan tambahkan port `:3000`

---

### **5. Jalankan Frontend**

#### **Terminal 3 - Expo:**
```bash
cd c:\Users\User\aplikasichatbot
npx expo start
```

Scan QR code dengan Expo Go di HP Anda. Sekarang bisa diakses dari WiFi mana saja! 🎉

---

## 🔄 Cara Pakai Sehari-hari

### **Setiap kali mau jalankan app:**

1. **Terminal 1:** `node server.js`
2. **Terminal 2:** `ngrok http 3000` → Copy URL baru
3. **Update** `api-config.ts` dengan URL ngrok yang baru
4. **Terminal 3:** `npx expo start`

---

## ⚠️ Catatan Penting

### **URL Ngrok Berubah Setiap Restart**
- Setiap kali restart ngrok, URL berubah
- Harus update `api-config.ts` lagi
- Untuk URL tetap, upgrade ke ngrok Pro ($)

### **Alternatif: Pakai WiFi Sama**
Kalau ribet, lebih simple pakai WiFi yang sama:
```typescript
BACKEND_URL: 'http://192.168.100.103:3000', // IP lokal
```

---

## 🐛 Troubleshooting

### **Error: "command not found: ngrok"**
```bash
# Install ulang
npm install -g ngrok

# Atau download manual dari ngrok.com
```

### **Error: "ERR_NGROK_108"**
```bash
# Belum login, jalankan:
ngrok config add-authtoken YOUR_TOKEN
```

### **Backend tidak connect**
- Pastikan `server.js` masih running
- Cek URL ngrok sudah benar di `api-config.ts`
- Pastikan pakai `https://` bukan `http://`

### **Expo error setelah ganti URL**
```bash
# Restart Expo, tekan 'r' di terminal
# Atau stop (Ctrl+C) dan start ulang
```

---

## 📱 Cara Cepat Switch Antara Lokal & Ngrok

Edit `config/api-config.ts`:

```typescript
export const API_CONFIG = {
  // Mode 1: WiFi sama (lokal)
  // BACKEND_URL: 'http://192.168.100.103:3000',
  
  // Mode 2: Beda WiFi (ngrok)
  BACKEND_URL: 'https://abc123.ngrok.io',
};
```

Tinggal comment/uncomment sesuai kebutuhan!

---

## ✅ Checklist

- [ ] Ngrok sudah terinstall
- [ ] Sudah daftar & login ngrok
- [ ] Backend running (`node server.js`)
- [ ] Ngrok running (`ngrok http 3000`)
- [ ] URL ngrok sudah di-copy
- [ ] `api-config.ts` sudah diupdate
- [ ] Expo sudah restart
- [ ] App bisa diakses dari HP

---

**Selamat mencoba! 🚀**

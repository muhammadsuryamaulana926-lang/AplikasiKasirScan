# Setup Backend & Database

## 1. Install Dependencies Backend

```bash
cd backend
npm install
```

## 2. Konfigurasi Database

Edit `server.js` bagian `dbConfig`:
```javascript
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'password_mysql_anda', // GANTI INI
  database: 'nangka_busuk_db'
};
```

## 3. Jalankan Backend

```bash
npm start
```

Backend akan berjalan di `http://localhost:3000`

## 4. Test di Expo App

Jika test di device fisik, ganti `BACKEND_URL` di `App.tsx`:
```typescript
const BACKEND_URL = 'http://192.168.x.x:3000'; // IP komputer Anda
```

Cari IP komputer:
- Windows: `ipconfig`
- Mac/Linux: `ifconfig`

## Contoh Pertanyaan ke Chatbot

- "Berapa banyak anggota nangka busuk?"
- "Daftar anggota"
- "Siapa saja anggota?"

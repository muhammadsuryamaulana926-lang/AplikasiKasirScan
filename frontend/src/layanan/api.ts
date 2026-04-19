import axios from 'axios';
import { Platform } from 'react-native';

// ─── KONFIGURASI URL DASAR ────────────────────────────────
// Gunakan IP lokal saat pakai HP fisik, localhost untuk emulator
const ambilUrlDasar = () => {
    if (Platform.OS === 'android') {
        // Ganti dengan IP komputer Anda jika menggunakan HP fisik
        return 'http://192.168.100.103:3001/api';
    }
    return 'http://localhost:3001/api';
};

// ─── BUAT INSTANCE AXIOS ──────────────────────────────────
const api = axios.create({
    baseURL: ambilUrlDasar(),
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// ─── PENANGANAN ERROR RESPONSE ────────────────────────────
api.interceptors.response.use(
    // Jika berhasil, kembalikan response langsung
    response => response,
    error => {
        if (error.code === 'ECONNABORTED') {
            console.log('Waktu request habis - server mungkin sedang mati');
        }
        if (!error.response) {
            console.log('Tidak ada koneksi jaringan - mode offline');
        }
        return Promise.reject(error);
    }
);

export default api;

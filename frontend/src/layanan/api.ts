import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── KONFIGURASI URL DASAR ────────────────────────────────
const ambilUrlDasar = () => {
    if (Platform.OS === 'android') {
        return 'http://10.218.103.33:3001/api';
    }
    return 'http://localhost:3001/api';
};

// ─── BUAT INSTANCE AXIOS ──────────────────────────────────
const api = axios.create({
    baseURL: ambilUrlDasar(),
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' },
});

// ─── INTERCEPTOR REQUEST ──────────────────────────────────
// Otomatis sisipkan x-owner-id di setiap request agar backend
// tahu data milik siapa yang harus diambil/disimpan
api.interceptors.request.use(async (config) => {
    const ownerId = await AsyncStorage.getItem('idPengguna')
        || await AsyncStorage.getItem('userId');
    if (ownerId) config.headers['x-owner-id'] = ownerId;
    return config;
});

// ─── PENANGANAN ERROR RESPONSE ────────────────────────────
api.interceptors.response.use(
    response => response,
    error => {
        if (error.code === 'ECONNABORTED') console.log('Waktu request habis - server mungkin sedang mati');
        if (!error.response) console.log('Tidak ada koneksi jaringan - mode offline');
        return Promise.reject(error);
    }
);

export default api;

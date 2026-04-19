import api from './api';

// Mengambil semua transaksi dengan filter opsional (search, status, tanggal, dll)
export const ambil_semua_transaksi = (params?: object) => api.get('/transactions', { params });

// Membuat transaksi baru dari halaman kasir (checkout)
export const buat_transaksi_baru = (data: object) => api.post('/transactions', data);

import api from './api';

// Mengambil semua nama pemasok unik dari data produk
export const ambil_semua_pemasok = () => api.get('/suppliers');

// Mengambil semua produk aktif dari satu pemasok berdasarkan nama pemasok
export const ambil_produk_pemasok = (name: string) => api.get(`/suppliers/${name}`);

import api from './api';

// Mengambil semua pelanggan aktif dengan filter opsional
export const ambil_semua_pelanggan = (params?: object) => api.get('/customers', { params });

// Mengambil detail satu pelanggan beserta riwayat transaksi dan hutang
export const ambil_satu_pelanggan = (id: string) => api.get(`/customers/${id}`);

// Membuat pelanggan baru
export const buat_pelanggan_baru = (data: object) => api.post('/customers', data);

// Memperbarui data pelanggan berdasarkan ID
export const ubah_pelanggan = (id: string, data: object) => api.put(`/customers/${id}`, data);

// Menghapus pelanggan secara permanen berdasarkan ID
export const hapus_pelanggan = (id: string) => api.delete(`/customers/${id}`);

import api from './api';

// Mengambil semua hutang yang belum lunas dengan filter opsional
export const ambil_semua_hutang = (params?: object) => api.get('/debts', { params });

// Mengambil ringkasan statistik hutang (total, overdue, dll)
export const ambil_ringkasan_hutang = () => api.get('/debts/summary');

// Membuat catatan hutang baru
export const buat_hutang_baru = (data: object) => api.post('/debts', data);

// Mencatat pembayaran hutang berdasarkan ID hutang
export const bayar_hutang = (id: string, data: object) => api.post(`/debts/${id}/pay`, data);

// Memperbarui data hutang (jumlah, catatan, jatuh tempo)
export const ubah_hutang = (id: string, data: object) => api.put(`/debts/${id}`, data);

// Menandai pengingat WhatsApp sudah dikirim ke pelanggan
export const kirim_pengingat_hutang = (id: string) => api.post(`/debts/${id}/remind`);

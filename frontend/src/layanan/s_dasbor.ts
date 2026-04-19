import api from './api';

// Mengambil semua data ringkasan untuk halaman dasbor
export const ambil_data_dasbor = () => api.get('/reports/dashboard');

// Mengambil semua notifikasi
export const ambil_semua_notifikasi = () => api.get('/reports/notifications');

// Menandai satu notifikasi sudah dibaca berdasarkan ID
// Gunakan id = 'read-all' untuk tandai semua sekaligus
export const baca_notifikasi = (id: string) => api.put(`/reports/notifications/${id}/read`);

// Menghapus semua notifikasi yang sudah dibaca
export const hapus_notifikasi = () => api.delete('/reports/notifications/clear');

// Mengambil pengaturan toko
export const ambil_pengaturan = () => api.get('/reports/settings');

// Memperbarui pengaturan toko
export const ubah_pengaturan = (data: object) => api.put('/reports/settings', data);

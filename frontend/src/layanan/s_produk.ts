import api from './api';

// Mengambil semua produk aktif dengan filter opsional (search, kategori, stok rendah, dll)
export const ambil_semua_produk = (params?: object) => api.get('/products', { params });

// Mengambil detail satu produk berdasarkan ID
export const ambil_satu_produk = (id: string) => api.get(`/products/${id}`);

// Mengambil semua kategori produk
export const ambil_semua_kategori = () => api.get('/products/categories');

// Membuat kategori produk baru
export const buat_kategori_baru = (data: object) => api.post('/products/categories', data);

// Membuat produk baru
export const buat_produk_baru = (data: object) => api.post('/products', data);

// Memperbarui data produk berdasarkan ID
export const ubah_produk = (id: string, data: object) => api.put(`/products/${id}`, data);

// Menonaktifkan produk berdasarkan ID (soft delete)
export const hapus_produk = (id: string) => api.delete(`/products/${id}`);

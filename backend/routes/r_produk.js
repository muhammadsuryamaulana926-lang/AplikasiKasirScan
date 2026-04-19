const express = require('express');
const router = express.Router();
const { tampil_semua_produk, tampil_satu_produk, tampil_semua_kategori, buat_kategori_baru, buat_produk_baru, ubah_produk, hapus_produk } = require('../controllers/c_produk');

module.exports = () => {
    // GET /api/products → Ambil semua produk aktif dengan filter dan pagination
    router.get('/', tampil_semua_produk);

    // GET /api/products/categories → Ambil semua kategori produk
    // Harus didaftarkan sebelum /:id agar tidak bentrok
    router.get('/categories', tampil_semua_kategori);

    // POST /api/products/categories → Buat kategori produk baru
    router.post('/categories', buat_kategori_baru);

    // GET /api/products/:id → Ambil detail satu produk
    router.get('/:id', tampil_satu_produk);

    // POST /api/products → Buat produk baru
    router.post('/', buat_produk_baru);

    // PUT /api/products/:id → Perbarui data produk
    router.put('/:id', ubah_produk);

    // DELETE /api/products/:id → Nonaktifkan produk (soft delete)
    router.delete('/:id', hapus_produk);

    return router;
};

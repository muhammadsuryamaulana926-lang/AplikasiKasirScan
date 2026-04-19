const express = require('express');
const router = express.Router();
const { tampil_data_dasbor, tampil_semua_notifikasi, baca_notifikasi, hapus_notifikasi, tampil_pengaturan, ubah_pengaturan } = require('../controllers/c_dasbor');

module.exports = () => {
    // GET /api/reports/dashboard → Ambil semua data ringkasan untuk halaman dasbor
    router.get('/dashboard', tampil_data_dasbor);

    // GET /api/reports/notifications → Ambil semua notifikasi
    router.get('/notifications', tampil_semua_notifikasi);

    // PUT /api/reports/notifications/:id/read → Tandai notifikasi sudah dibaca
    router.put('/notifications/:id/read', baca_notifikasi);

    // DELETE /api/reports/notifications/clear → Hapus semua notifikasi yang sudah dibaca
    router.delete('/notifications/clear', hapus_notifikasi);

    // GET /api/reports/settings → Ambil pengaturan toko
    router.get('/settings', tampil_pengaturan);

    // PUT /api/reports/settings → Perbarui pengaturan toko
    router.put('/settings', ubah_pengaturan);

    return router;
};

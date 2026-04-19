const express = require('express');
const router = express.Router();
const { tampil_semua_hutang, tampil_ringkasan_hutang, buat_hutang_baru, bayar_hutang, ubah_hutang, kirim_pengingat_hutang } = require('../controllers/c_hutang');

module.exports = () => {
    // GET /api/debts → Ambil semua hutang yang belum lunas
    router.get('/', tampil_semua_hutang);

    // GET /api/debts/summary → Ambil ringkasan statistik hutang
    router.get('/summary', tampil_ringkasan_hutang);

    // POST /api/debts → Buat catatan hutang baru
    router.post('/', buat_hutang_baru);

    // POST /api/debts/:id/pay → Catat pembayaran hutang
    router.post('/:id/pay', bayar_hutang);

    // PUT /api/debts/:id → Perbarui data hutang
    router.put('/:id', ubah_hutang);

    // POST /api/debts/:id/remind → Tandai pengingat WhatsApp sudah dikirim
    router.post('/:id/remind', kirim_pengingat_hutang);

    return router;
};

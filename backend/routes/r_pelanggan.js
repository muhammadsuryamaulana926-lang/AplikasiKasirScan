const express = require('express');
const router = express.Router();
const { tampil_semua_pelanggan, tampil_satu_pelanggan, buat_pelanggan_baru, ubah_pelanggan, hapus_pelanggan_handler } = require('../controllers/c_pelanggan');

module.exports = () => {
    // GET /api/customers → Ambil semua pelanggan aktif
    router.get('/', tampil_semua_pelanggan);

    // GET /api/customers/:id → Ambil detail satu pelanggan beserta transaksi dan hutang
    router.get('/:id', tampil_satu_pelanggan);

    // POST /api/customers → Buat pelanggan baru
    router.post('/', buat_pelanggan_baru);

    // PUT /api/customers/:id → Perbarui data pelanggan
    router.put('/:id', ubah_pelanggan);

    // DELETE /api/customers/:id → Hapus pelanggan secara permanen
    router.delete('/:id', hapus_pelanggan_handler);

    return router;
};

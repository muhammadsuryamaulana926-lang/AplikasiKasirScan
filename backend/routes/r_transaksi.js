const express = require('express');
const router = express.Router();
const { tampil_semua_transaksi, buat_transaksi_baru } = require('../controllers/c_transaksi');

module.exports = () => {
    // GET /api/transactions → Ambil semua transaksi dengan filter dan pagination
    router.get('/', tampil_semua_transaksi);

    // POST /api/transactions → Buat transaksi baru dari kasir (checkout)
    router.post('/', buat_transaksi_baru);

    return router;
};

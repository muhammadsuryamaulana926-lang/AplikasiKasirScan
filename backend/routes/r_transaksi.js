const express = require('express');
const router = express.Router();
const { tampil_semua_transaksi, buat_transaksi_baru, refund_transaksi } = require('../controllers/c_transaksi');

module.exports = () => {
    router.get('/', tampil_semua_transaksi);
    router.post('/', buat_transaksi_baru);
    router.put('/:id/refund', refund_transaksi);
    return router;
};

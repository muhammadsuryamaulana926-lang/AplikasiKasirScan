const express = require('express');
const router = express.Router();
const { tampil_semua_pemasok, tampil_produk_pemasok } = require('../controllers/c_pemasok');

module.exports = () => {
    // GET /api/suppliers → Ambil semua nama pemasok unik
    router.get('/', tampil_semua_pemasok);

    // GET /api/suppliers/:name → Ambil semua produk dari satu pemasok
    router.get('/:name', tampil_produk_pemasok);

    return router;
};

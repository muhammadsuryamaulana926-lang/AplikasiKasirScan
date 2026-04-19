const db = require('../database/db');

// Mengambil daftar nama pemasok unik dari kolom supplier di tabel produk
// Pemasok tidak punya tabel sendiri, diambil langsung dari data produk
const cari_semua_pemasok = async () => {
    const [rows] = await db.query(
        'SELECT DISTINCT supplier FROM products WHERE supplier IS NOT NULL AND supplier != "" ORDER BY supplier ASC'
    );
    return rows;
};

// Mengambil semua produk aktif yang berasal dari pemasok tertentu
const cari_produk_pemasok = async (name) => {
    const [rows] = await db.query('SELECT * FROM products WHERE supplier = ? AND is_active = 1', [name]);
    return rows;
};

module.exports = { cari_semua_pemasok, cari_produk_pemasok };

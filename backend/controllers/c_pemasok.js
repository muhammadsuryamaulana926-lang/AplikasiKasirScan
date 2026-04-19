const { cari_semua_pemasok, cari_produk_pemasok } = require('../models/m_pemasok');

// Menangani request GET semua pemasok unik
const tampil_semua_pemasok = async (req, res) => {
    try {
        const rows = await cari_semua_pemasok();
        // Buat format data pemasok dengan ID urutan sederhana
        const data = rows.map((r, index) => ({ id: `sup-${index + 1}`, name: r.supplier, contact: '-', phone: '-' }));
        res.json({ success: true, data });
    } catch (err) {
        console.error('❌ tampil_semua_pemasok Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// Menangani request GET semua produk dari satu pemasok tertentu
const tampil_produk_pemasok = async (req, res) => {
    try {
        const name = req.params.name;
        const products = await cari_produk_pemasok(name);
        res.json({
            success: true,
            data: {
                name,
                // Daftar produk yang disuplai oleh pemasok ini
                suppliedProducts: products.map(p => ({ id: p.id, name: p.name, stock: p.stock, sellPrice: Number(p.sell_price) }))
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

module.exports = { tampil_semua_pemasok, tampil_produk_pemasok };

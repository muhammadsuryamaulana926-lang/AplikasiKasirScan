const { v4: uuidv4 } = require('uuid');
const { cari_semua_produk, cari_satu_produk, cari_semua_kategori, simpan_kategori_baru, simpan_produk_baru, ubah_data_produk, nonaktifkan_produk } = require('../models/m_produk');

// Helper: mengubah format kolom snake_case database ke camelCase untuk frontend
const format_produk = (r) => ({
    id: r.id, barcode: r.barcode, name: r.name,
    categoryId: r.category_id, categoryName: r.categoryName,
    buyPrice: Number(r.buy_price), sellPrice: Number(r.sell_price),
    stock: Number(r.stock), minStock: Number(r.min_stock),
    unit: r.unit, image: r.image, expiryDate: r.expiry_date,
    supplier: r.supplier, salesCount: r.sales_count, createdAt: r.created_at
});

// Menangani request GET semua produk aktif dengan filter dan pagination
const tampil_semua_produk = async (req, res) => {
    try {
        const { rows, total, p, l } = await cari_semua_produk(req.query);
        res.json({ success: true, data: rows.map(format_produk), pagination: { total, page: p, limit: l, totalPages: Math.ceil(total / l) } });
    } catch (err) {
        console.error('❌ tampil_semua_produk Error:', err);
        res.status(500).json({ success: false, error: 'Database error' });
    }
};

// Menangani request GET detail satu produk berdasarkan ID
const tampil_satu_produk = async (req, res) => {
    try {
        const r = await cari_satu_produk(req.params.id);
        if (!r) return res.status(404).json({ success: false, error: 'Produk tidak ditemukan' });
        res.json({ success: true, data: format_produk(r) });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Menangani request GET semua kategori produk
const tampil_semua_kategori = async (req, res) => {
    try {
        const rows = await cari_semua_kategori();
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Menangani request POST membuat kategori produk baru
const buat_kategori_baru = async (req, res) => {
    try {
        const { name, icon, color } = req.body;
        // Nama kategori wajib diisi
        if (!name) return res.status(400).json({ success: false, error: 'Nama kategori wajib diisi' });
        const id = `cat-${uuidv4().slice(0, 8)}`;
        await simpan_kategori_baru(id, { name, icon, color });
        res.status(201).json({ success: true, data: { id, name } });
    } catch (err) {
        console.error('❌ buat_kategori_baru Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// Menangani request POST membuat produk baru
const buat_produk_baru = async (req, res) => {
    try {
        const id = `prod-${uuidv4().slice(0, 8)}`;
        await simpan_produk_baru(id, req.body);
        res.status(201).json({ success: true, data: { id, name: req.body.name } });
    } catch (err) {
        console.error('❌ buat_produk_baru Error:', err);
        // Berikan pesan khusus jika barcode sudah dipakai produk lain
        const message = err.code === 'ER_DUP_ENTRY' ? 'Barcode sudah digunakan oleh produk lain' : err.message;
        res.status(500).json({ success: false, error: message });
    }
};

// Menangani request PUT memperbarui data produk
const ubah_produk = async (req, res) => {
    try {
        const result = await ubah_data_produk(req.params.id, req.body);
        if (result.affectedRows === 0) return res.status(404).json({ success: false, error: 'Produk tidak ditemukan atau tidak ada perubahan' });
        res.json({ success: true, message: 'Produk berhasil diperbarui' });
    } catch (err) {
        console.error('❌ ubah_produk Error:', err);
        const message = err.code === 'ER_DUP_ENTRY' ? 'Barcode sudah digunakan oleh produk lain' : err.message;
        res.status(500).json({ success: false, error: message });
    }
};

// Menangani request DELETE menonaktifkan produk (soft delete)
const hapus_produk = async (req, res) => {
    try {
        await nonaktifkan_produk(req.params.id);
        res.json({ success: true, message: 'Produk berhasil dinonaktifkan' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

module.exports = { tampil_semua_produk, tampil_satu_produk, tampil_semua_kategori, buat_kategori_baru, buat_produk_baru, ubah_produk, hapus_produk };

const db = require('../database/db');

// Mengambil semua data yang dibutuhkan halaman dasbor dalam satu fungsi
const cari_data_dasbor = async (ownerId) => {
    const params = ownerId ? [ownerId] : [];
    const ownerWhere = ownerId ? ' AND owner_id = ?' : '';
    const ownerWhereC = ownerId ? ' AND c.owner_id = ?' : '';

    const [stats] = await db.query(`SELECT * FROM v_dashboard_summary WHERE 1=1${ownerWhere} ORDER BY date DESC LIMIT 7`, params);
    const [lowStock] = await db.query(`SELECT COUNT(*) as count FROM v_low_stock_products WHERE 1=1${ownerWhere}`, params);
    const [expiring] = await db.query(`SELECT COUNT(*) as count FROM products WHERE expiry_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) AND is_active = 1${ownerWhere}`, params);
    const [debts] = await db.query(`SELECT SUM(remaining) as total, COUNT(*) as count FROM debts WHERE status != 'paid'${ownerWhere}`, params);
    const [totalProducts] = await db.query(`SELECT COUNT(*) as count FROM products WHERE is_active = 1${ownerWhere}`, params);
    const [topCustomers] = await db.query(`SELECT id, name, total_spent FROM customers c WHERE is_active = 1${ownerWhereC} ORDER BY total_spent DESC LIMIT 5`, params);
    const [recentTrxRows] = await db.query(`SELECT id, invoice_number, customer_name, total, created_at FROM transactions WHERE 1=1${ownerWhere} ORDER BY created_at DESC LIMIT 5`, params);
    const [notifications] = await db.query('SELECT * FROM notifications WHERE is_read = 0 ORDER BY created_at DESC LIMIT 10');

    return { stats, lowStock: lowStock[0].count, expiring: expiring[0].count, debts: debts[0], totalProducts: totalProducts[0].count, topCustomers, recentTrxRows, notifications };
};

// Mengambil item produk dari transaksi untuk ditampilkan di dasbor
const cari_item_transaksi_dasbor = async (transactionId) => {
    const [rows] = await db.query('SELECT product_name as name, qty FROM transaction_items WHERE transaction_id = ?', [transactionId]);
    return rows;
};

// Mengambil 50 notifikasi terbaru (dibaca maupun belum)
const cari_semua_notifikasi = async () => {
    const [rows] = await db.query('SELECT * FROM notifications ORDER BY created_at DESC LIMIT 50');
    return rows;
};

// Menandai notifikasi sebagai sudah dibaca
// Jika id = 'read-all' maka semua notifikasi ditandai sekaligus
const tandai_notifikasi_dibaca = async (id) => {
    if (id === 'read-all') {
        await db.query('UPDATE notifications SET is_read = 1, read_at = NOW() WHERE is_read = 0');
    } else {
        await db.query('UPDATE notifications SET is_read = 1, read_at = NOW() WHERE id = ?', [id]);
    }
};

// Menghapus semua notifikasi yang sudah dibaca dari database
const hapus_notifikasi_dibaca = async () => {
    await db.query('DELETE FROM notifications WHERE is_read = 1');
};

// Mengambil semua pengaturan toko dan mengubahnya ke format key-value object
const cari_pengaturan_toko = async () => {
    const [rows] = await db.query('SELECT * FROM settings');
    const settings = {};
    rows.forEach(r => { settings[r.key_name] = r.value; });
    return settings;
};

// Menyimpan satu atau lebih pengaturan toko
// Jika key sudah ada maka diupdate, jika belum ada maka diinsert
const simpan_pengaturan_toko = async (updates) => {
    for (const [key, value] of Object.entries(updates)) {
        await db.query('INSERT INTO settings (key_name, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = ?', [key, value, value]);
    }
};

module.exports = { cari_data_dasbor, cari_item_transaksi_dasbor, cari_semua_notifikasi, tandai_notifikasi_dibaca, hapus_notifikasi_dibaca, cari_pengaturan_toko, simpan_pengaturan_toko };

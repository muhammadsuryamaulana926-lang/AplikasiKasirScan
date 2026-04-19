const { cari_data_dasbor, cari_item_transaksi_dasbor, cari_semua_notifikasi, tandai_notifikasi_dibaca, hapus_notifikasi_dibaca, cari_pengaturan_toko, simpan_pengaturan_toko } = require('../models/m_dasbor');

// Menangani request GET data dasbor utama
// Menggabungkan semua data ringkasan yang dibutuhkan halaman dasbor
const tampil_data_dasbor = async (req, res) => {
    try {
        const ownerId = req.headers['x-owner-id'];
        const { stats, lowStock, expiring, debts, topCustomers, recentTrxRows, notifications } = await cari_data_dasbor(ownerId);

        // Untuk setiap transaksi terbaru, ambil juga item yang dibeli
        const recentTransactions = await Promise.all(recentTrxRows.map(async (t) => ({
            id: t.id,
            invoiceNumber: t.invoice_number,
            customerName: t.customer_name,
            total: Number(t.total),
            createdAt: t.created_at,
            items: await cari_item_transaksi_dasbor(t.id)
        })));

        res.json({
            success: true,
            data: {
                // Ringkasan penjualan per hari selama 7 hari terakhir
                summary: stats.map(s => ({ date: s.date, revenue: Number(s.total_revenue), transactions: s.total_transactions, customers: s.unique_customers })),
                lowStockCount: lowStock,       // Jumlah produk stok rendah
                expiringCount: expiring,       // Jumlah produk hampir expired
                overdueDebtsCount: debts.count, // Jumlah hutang belum lunas
                totalDebt: Number(debts.total) || 0, // Total nominal hutang
                topCustomers: topCustomers.map(c => ({ id: c.id, name: c.name, totalSpent: Number(c.total_spent) })),
                recentTransactions,
                notifications: notifications.map(n => ({ id: n.id, type: n.type, title: n.title, message: n.message, createdAt: n.created_at }))
            }
        });
    } catch (err) {
        console.error('❌ tampil_data_dasbor Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// Menangani request GET semua notifikasi
const tampil_semua_notifikasi = async (req, res) => {
    try {
        const rows = await cari_semua_notifikasi();
        res.json({
            success: true,
            data: rows.map(n => ({
                id: n.id, type: n.type, title: n.title, message: n.message,
                priority: n.priority, isRead: Boolean(n.is_read), createdAt: n.created_at
            }))
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Menangani request PUT tandai notifikasi sudah dibaca (satu atau semua)
const baca_notifikasi = async (req, res) => {
    try {
        await tandai_notifikasi_dibaca(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Menangani request DELETE hapus semua notifikasi yang sudah dibaca
const hapus_notifikasi = async (req, res) => {
    try {
        await hapus_notifikasi_dibaca();
        res.json({ success: true, message: 'Notifikasi yang sudah dibaca berhasil dihapus' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Menangani request GET pengaturan toko
const tampil_pengaturan = async (req, res) => {
    try {
        const settings = await cari_pengaturan_toko();
        res.json({ success: true, data: settings });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Menangani request PUT memperbarui pengaturan toko
const ubah_pengaturan = async (req, res) => {
    try {
        await simpan_pengaturan_toko(req.body);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

module.exports = { tampil_data_dasbor, tampil_semua_notifikasi, baca_notifikasi, hapus_notifikasi, tampil_pengaturan, ubah_pengaturan };

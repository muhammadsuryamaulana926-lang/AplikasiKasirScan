const { v4: uuidv4 } = require('uuid');
const db = require('../database/db');
const { cari_semua_pelanggan, cari_satu_pelanggan, cari_transaksi_pelanggan, cari_hutang_pelanggan, simpan_pelanggan_baru, simpan_hutang_awal_pelanggan, ubah_data_pelanggan, hapus_pelanggan } = require('../models/m_pelanggan');

// Helper: mengubah format kolom snake_case database ke camelCase untuk frontend
const format_pelanggan = (r) => ({
    id: r.id, name: r.name, phone: r.phone, address: r.address, email: r.email,
    loyaltyPoints: r.loyalty_points, totalSpent: Number(r.total_spent),
    totalDebt: Number(r.total_debt || 0), totalTransactions: r.total_transactions,
    joinDate: r.join_date, lastVisit: r.last_visit, avatar: r.avatar,
    notes: r.notes, isActive: r.is_active
});

// Menangani request GET semua pelanggan aktif
const tampil_semua_pelanggan = async (req, res) => {
    try {
        const { rows, total, p, l } = await cari_semua_pelanggan(req.query);
        res.json({ success: true, data: rows.map(format_pelanggan), pagination: { total, page: p, limit: l, totalPages: Math.ceil(total / l) } });
    } catch (err) {
        console.error('❌ tampil_semua_pelanggan Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// Menangani request GET detail satu pelanggan beserta riwayat transaksi dan hutang
const tampil_satu_pelanggan = async (req, res) => {
    try {
        const r = await cari_satu_pelanggan(req.params.id);
        if (!r) return res.status(404).json({ success: false, error: 'Pelanggan tidak ditemukan' });

        // Ambil riwayat transaksi dan hutang pelanggan ini
        const transactions = await cari_transaksi_pelanggan(req.params.id);
        const debts = await cari_hutang_pelanggan(req.params.id);

        res.json({
            success: true,
            data: {
                ...format_pelanggan(r),
                transactions: transactions.map(t => ({ id: t.id, invoiceNumber: t.invoice_number, total: Number(t.total), paymentMethod: t.payment_method, createdAt: t.created_at })),
                debts: debts.map(d => ({ id: d.id, amount: Number(d.amount), remaining: Number(d.remaining), status: d.status, dueDate: d.due_date, createdAt: d.created_at }))
            }
        });
    } catch (err) {
        console.error('❌ tampil_satu_pelanggan Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// Menangani request POST membuat pelanggan baru
// Jika ada initialDebt, otomatis membuat catatan hutang awal
const buat_pelanggan_baru = async (req, res) => {
    try {
        const id = `cust-${uuidv4().slice(0, 8)}`;
        const { name, phone, address, email, notes, initialDebt } = req.body;

        await simpan_pelanggan_baru(id, { name, phone, address, email, notes });

        // Buat hutang awal jika ada, dengan jatuh tempo 7 hari
        if (initialDebt && Number(initialDebt) > 0) {
            const debtId = `debt-${uuidv4().slice(0, 8)}`;
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + 7);
            await simpan_hutang_awal_pelanggan(debtId, id, name, initialDebt, dueDate.toISOString().split('T')[0]);
            // Kirim notifikasi hutang baru, error tidak menghentikan proses
            await db.query('INSERT INTO notifications (type, title, message, priority) VALUES (?, ?, ?, ?)',
                ['debt_reminder', 'Hutang Baru Tercatat', `Pelanggan "${name}" memiliki hutang baru sebesar Rp ${Number(initialDebt).toLocaleString('id-ID')}`, 'high']
            ).catch(e => console.error('Notifikasi gagal:', e));
        }

        res.status(201).json({ success: true, data: { id, name, phone } });
    } catch (err) {
        console.error('❌ buat_pelanggan_baru Error:', err);
        // Berikan pesan khusus jika nomor telepon sudah terdaftar
        if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ success: false, error: 'Nomor telepon sudah terdaftar. Gunakan nomor lain atau cari pelanggan yang sudah ada.' });
        res.status(500).json({ success: false, error: err.message });
    }
};

// Menangani request PUT memperbarui data pelanggan
// Menggunakan database transaction agar perubahan nama tersinkron ke tabel hutang
const ubah_pelanggan = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const result = await ubah_data_pelanggan(connection, req.params.id, req.body);
        if (result.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, error: 'Pelanggan tidak ditemukan' });
        }
        await connection.commit();
        res.json({ success: true, message: 'Pelanggan berhasil diperbarui' });
    } catch (err) {
        await connection.rollback();
        console.error('❌ ubah_pelanggan Error:', err);
        res.status(500).json({ success: false, error: err.message });
    } finally {
        connection.release();
    }
};

// Menangani request DELETE menghapus pelanggan secara permanen
const hapus_pelanggan_handler = async (req, res) => {
    try {
        const customerName = await hapus_pelanggan(req.params.id);
        if (!customerName) return res.status(404).json({ success: false, error: 'Pelanggan tidak ditemukan' });

        // Kirim notifikasi penghapusan, error tidak menghentikan proses
        await db.query('INSERT INTO notifications (type, title, message, priority) VALUES (?, ?, ?, ?)',
            ['info', 'Data Penghutang Dihapus', `Pelanggan "${customerName}" telah dihapus secara permanen dari sistem.`, 'medium']
        ).catch(e => console.warn('⚠️ Notifikasi gagal:', e.message));

        res.json({ success: true, message: 'Pelanggan berhasil dihapus' });
    } catch (err) {
        console.error('❌ hapus_pelanggan_handler Error:', err);
        res.status(500).json({ success: false, error: 'Internal Server Error: ' + err.message });
    }
};

module.exports = { tampil_semua_pelanggan, tampil_satu_pelanggan, buat_pelanggan_baru, ubah_pelanggan, hapus_pelanggan_handler };

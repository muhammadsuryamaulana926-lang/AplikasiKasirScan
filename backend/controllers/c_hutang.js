const { v4: uuidv4 } = require('uuid');
const db = require('../database/db');
const { cari_semua_hutang, cari_ringkasan_hutang, simpan_hutang_baru, simpan_pembayaran_hutang, cek_status_hutang, ubah_data_hutang, tandai_pengingat_hutang } = require('../models/m_hutang');

// Menangani request GET semua hutang yang belum lunas
const tampil_semua_hutang = async (req, res) => {
    try {
        const { rows, total, p, l } = await cari_semua_hutang(req.query);

        // Format ulang kolom snake_case dari database ke camelCase untuk frontend
        const data = rows.map(r => ({
            id: r.id,
            customerId: r.customer_id,
            customerName: r.customer_name,
            customerPhone: r.customer_phone,
            amount: Number(r.amount),
            paidAmount: Number(r.paid_amount),
            remaining: Number(r.remaining),
            items: r.items,
            dueDate: r.due_date,
            // Gunakan current_status (hasil kalkulasi overdue) jika ada
            status: r.current_status || r.status,
            reminderSent: Boolean(r.reminder_sent),
            transactionId: r.transaction_id,
            notes: r.notes,
            createdAt: r.created_at
        }));

        res.json({ success: true, data, pagination: { total, page: p, limit: l, totalPages: Math.ceil(total / l) } });
    } catch (err) {
        console.error('❌ tampil_semua_hutang Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// Menangani request GET ringkasan statistik hutang untuk halaman hutang
const tampil_ringkasan_hutang = async (req, res) => {
    try {
        const s = await cari_ringkasan_hutang();
        res.json({
            success: true,
            data: {
                totalDebt: Number(s.totalDebt) || 0,       // Total nominal semua hutang
                overdueCount: Number(s.overdueCount) || 0, // Jumlah hutang melewati jatuh tempo
                unpaidCount: Number(s.unpaidCount) || 0,   // Jumlah hutang belum dibayar sama sekali
                partialCount: Number(s.partialCount) || 0, // Jumlah hutang dibayar sebagian
                totalRecords: s.totalRecords || 0           // Total semua catatan hutang
            }
        });
    } catch (err) {
        console.error('❌ tampil_ringkasan_hutang Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// Menangani request POST membuat catatan hutang baru
const buat_hutang_baru = async (req, res) => {
    try {
        const id = `debt-${uuidv4().slice(0, 8)}`;
        const { customerId, customerName, amount, items, dueDate, transactionId, notes } = req.body;
        await simpan_hutang_baru({ id, customerId, customerName, amount, items, dueDate, transactionId, notes });
        res.status(201).json({ success: true, data: { id, customerName, amount } });
    } catch (err) {
        console.error('❌ buat_hutang_baru Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// Menangani request POST mencatat pembayaran hutang (bisa sebagian atau lunas)
const bayar_hutang = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const { amount, method = 'cash', notes = '' } = req.body;
        const debtId = req.params.id;

        // Simpan pembayaran, trigger DB otomatis update sisa hutang
        await simpan_pembayaran_hutang(connection, { payId: `pay-${uuidv4().slice(0, 8)}`, debtId, amount, method, notes });
        await connection.commit();

        // Cek apakah hutang sudah lunas setelah pembayaran ini
        const hutang = await cek_status_hutang(debtId);
        if (hutang && hutang.status === 'paid') {
            // Kirim notifikasi hutang lunas, error notifikasi tidak menghentikan proses
            await db.query('INSERT INTO notifications (type, title, message, priority) VALUES (?, ?, ?, ?)',
                ['info', 'Hutang Lunas', `Hutang pelanggan "${hutang.customer_name}" sebesar Rp ${Number(hutang.amount).toLocaleString('id-ID')} telah lunas.`, 'medium']
            ).catch(e => console.error('Notifikasi lunas gagal:', e));
        }

        res.json({ success: true, message: 'Pembayaran berhasil dicatat' });
    } catch (err) {
        await connection.rollback();
        console.error('❌ bayar_hutang Error:', err);
        res.status(500).json({ success: false, error: err.message });
    } finally {
        connection.release();
    }
};

// Menangani request PUT memperbarui data hutang (jumlah, catatan, jatuh tempo)
const ubah_hutang = async (req, res) => {
    try {
        const { amount, notes, dueDate } = req.body;

        // Ambil jumlah yang sudah dibayar untuk menghitung sisa hutang baru
        const [rows] = await db.query('SELECT paid_amount FROM debts WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ success: false, error: 'Data hutang tidak ditemukan' });

        await ubah_data_hutang(req.params.id, { amount, notes, dueDate, paidAmount: Number(rows[0].paid_amount) });
        res.json({ success: true, message: 'Data hutang berhasil diperbarui' });
    } catch (err) {
        console.error('❌ ubah_hutang Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// Menangani request POST menandai pengingat WhatsApp sudah dikirim
const kirim_pengingat_hutang = async (req, res) => {
    try {
        const result = await tandai_pengingat_hutang(req.params.id);
        if (result.affectedRows === 0) return res.status(404).json({ success: false, error: 'Data hutang tidak ditemukan' });
        res.json({ success: true, message: 'Status pengingat WhatsApp diperbarui' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

module.exports = { tampil_semua_hutang, tampil_ringkasan_hutang, buat_hutang_baru, bayar_hutang, ubah_hutang, kirim_pengingat_hutang };

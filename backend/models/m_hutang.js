const db = require('../database/db');

// Mengambil semua hutang yang belum lunas dengan filter dan pagination
// Status 'overdue' dihitung otomatis dari tanggal jatuh tempo, bukan dari kolom status
const cari_semua_hutang = async (filters) => {
    const { search, status, page = 1, limit = 20, ownerId } = filters;
    const p = parseInt(page), l = parseInt(limit), offset = (p - 1) * l;

    let query = `
        SELECT d.*, c.phone as customer_phone,
        CASE WHEN d.status != 'paid' AND d.due_date < CURDATE() THEN 'overdue' ELSE d.status END as current_status
        FROM debts d LEFT JOIN customers c ON d.customer_id = c.id WHERE d.status != 'paid'`;
    let params = [];

    if (ownerId) { query += ' AND d.owner_id = ?'; params.push(ownerId); }

    // Filter pencarian berdasarkan nama pelanggan atau deskripsi barang
    if (search) { query += ' AND (d.customer_name LIKE ? OR d.items LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }

    // Filter berdasarkan status hutang
    if (status) {
        // Status overdue dihitung dari tanggal, bukan dari kolom status langsung
        if (status === 'overdue') { query += " AND (d.status != 'paid' AND d.due_date < CURDATE())"; }
        else { query += ' AND d.status = ?'; params.push(status); }
    }

    query += ' ORDER BY d.created_at DESC';

    // Hitung total data untuk pagination
    const [countResult] = await db.query(`SELECT COUNT(*) as total FROM (${query}) as t`, params);
    const total = countResult[0].total;

    query += ' LIMIT ? OFFSET ?';
    params.push(l, offset);
    const [rows] = await db.query(query, params);
    return { rows, total, p, l };
};

const cari_ringkasan_hutang = async (ownerId) => {
    let query = `SELECT SUM(remaining) as totalDebt,
        SUM(CASE WHEN status != 'paid' AND due_date < CURDATE() THEN 1 ELSE 0 END) as overdueCount,
        SUM(CASE WHEN status = 'unpaid' AND due_date >= CURDATE() THEN 1 ELSE 0 END) as unpaidCount,
        SUM(CASE WHEN status = 'partial' AND due_date >= CURDATE() THEN 1 ELSE 0 END) as partialCount,
        COUNT(*) as totalRecords FROM debts WHERE 1=1`;
    const params = [];
    if (ownerId) { query += ' AND owner_id = ?'; params.push(ownerId); }
    const [rows] = await db.query(query, params);
    return rows[0];
};

const simpan_hutang_baru = async (data) => {
    const { id, customerId, customerName, amount, items, dueDate, transactionId, notes, ownerId } = data;
    await db.query(
        'INSERT INTO debts (id, customer_id, customer_name, amount, remaining, items, due_date, transaction_id, notes, owner_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [id, customerId, customerName, amount, amount, items || '', dueDate || null, transactionId || null, notes || null, ownerId || null]
    );
};

// Menyimpan catatan pembayaran hutang ke tabel debt_payments
// Trigger database otomatis mengupdate sisa hutang di tabel debts setelah insert
const simpan_pembayaran_hutang = async (connection, data) => {
    const { payId, debtId, amount, method, notes } = data;
    await connection.query(
        'INSERT INTO debt_payments (id, debt_id, amount, payment_method, notes) VALUES (?, ?, ?, ?, ?)',
        [payId, debtId, amount, method, notes]
    );
};

// Mengecek status hutang setelah pembayaran untuk keperluan notifikasi lunas
const cek_status_hutang = async (debtId) => {
    const [rows] = await db.query('SELECT status, customer_name, amount FROM debts WHERE id = ?', [debtId]);
    return rows[0];
};

// Memperbarui jumlah hutang, catatan, atau tanggal jatuh tempo
// Status dihitung ulang otomatis berdasarkan sisa hutang
const ubah_data_hutang = async (id, data) => {
    const { amount, notes, dueDate, paidAmount } = data;
    const remaining = (amount !== undefined ? amount : 0) - paidAmount;
    // Tentukan status: lunas, sebagian, atau belum bayar
    const status = remaining <= 0 ? 'paid' : (paidAmount > 0 ? 'partial' : 'unpaid');
    await db.query(
        'UPDATE debts SET amount = COALESCE(?, amount), remaining = ?, notes = COALESCE(?, notes), due_date = COALESCE(?, due_date), status = ? WHERE id = ?',
        [amount || null, remaining, notes || null, dueDate || null, status, id]
    );
};

// Menandai bahwa pengingat WhatsApp sudah dikirim ke pelanggan
const tandai_pengingat_hutang = async (id) => {
    const [result] = await db.query('UPDATE debts SET reminder_sent = 1 WHERE id = ?', [id]);
    return result;
};

module.exports = { cari_semua_hutang, cari_ringkasan_hutang, simpan_hutang_baru, simpan_pembayaran_hutang, cek_status_hutang, ubah_data_hutang, tandai_pengingat_hutang };

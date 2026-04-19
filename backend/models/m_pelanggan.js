const db = require('../database/db');

// Mengambil semua pelanggan aktif beserta total hutang masing-masing
const cari_semua_pelanggan = async (filters) => {
    const { search, page = 1, limit = 20, ownerId } = filters;
    const p = parseInt(page), l = parseInt(limit), offset = (p - 1) * l;

    let query = `SELECT c.*, (SELECT COALESCE(SUM(remaining), 0) FROM debts WHERE customer_id = c.id AND status != 'paid') as total_debt FROM customers c WHERE c.is_active = 1`;
    let params = [];

    if (ownerId) { query += ' AND c.owner_id = ?'; params.push(ownerId); }

    // Filter pencarian berdasarkan nama, telepon, atau alamat
    if (search) { query += ' AND (c.name LIKE ? OR c.phone LIKE ? OR c.address LIKE ?)'; params.push(`%${search}%`, `%${search}%`, `%${search}%`); }

    // Urutkan dari yang punya hutang terbesar, lalu total belanja terbesar
    query += ' ORDER BY total_debt DESC, total_spent DESC';

    // Hitung total data untuk pagination
    const [countResult] = await db.query(`SELECT COUNT(*) as total FROM (${query}) as t`, params);
    const total = countResult[0].total;

    query += ' LIMIT ? OFFSET ?';
    params.push(l, offset);
    const [rows] = await db.query(query, params);
    return { rows, total, p, l };
};

// Mengambil detail satu pelanggan beserta total hutang aktifnya
const cari_satu_pelanggan = async (id) => {
    const [rows] = await db.query(
        `SELECT c.*, (SELECT COALESCE(SUM(remaining), 0) FROM debts WHERE customer_id = c.id AND status != 'paid') as total_debt FROM customers c WHERE c.id = ?`,
        [id]
    );
    return rows[0];
};

// Mengambil 10 transaksi terakhir milik pelanggan tertentu
const cari_transaksi_pelanggan = async (customerId) => {
    const [rows] = await db.query('SELECT * FROM transactions WHERE customer_id = ? ORDER BY created_at DESC LIMIT 10', [customerId]);
    return rows;
};

// Mengambil semua catatan hutang milik pelanggan tertentu
const cari_hutang_pelanggan = async (customerId) => {
    const [rows] = await db.query('SELECT * FROM debts WHERE customer_id = ? ORDER BY created_at DESC', [customerId]);
    return rows;
};

// Menyimpan data pelanggan baru ke database
const simpan_pelanggan_baru = async (id, data, ownerId) => {
    const { name, phone, address, email, notes } = data;
    await db.query(
        'INSERT INTO customers (id, name, phone, address, email, notes, owner_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [id, name || '', phone || '', address || null, email || null, notes || null, ownerId || null]
    );
};

const simpan_hutang_awal_pelanggan = async (debtId, customerId, name, initialDebt, dueDate, ownerId) => {
    await db.query(
        'INSERT INTO debts (id, customer_id, customer_name, amount, remaining, status, due_date, owner_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [debtId, customerId, name, Number(initialDebt), Number(initialDebt), 'unpaid', dueDate, ownerId || null]
    );
};

// Memperbarui data pelanggan menggunakan database transaction
// Jika nama diubah, nama di tabel hutang juga ikut diperbarui
const ubah_data_pelanggan = async (connection, id, data) => {
    const { name, phone, address, email, notes } = data;
    const [result] = await connection.query(
        'UPDATE customers SET name = COALESCE(?, name), phone = COALESCE(?, phone), address = COALESCE(?, address), email = COALESCE(?, email), notes = COALESCE(?, notes) WHERE id = ?',
        [name || null, phone || null, address || null, email || null, notes || null, id]
    );
    // Sinkronkan nama pelanggan di tabel hutang jika nama diubah
    if (name) await connection.query('UPDATE debts SET customer_name = ? WHERE customer_id = ?', [name, id]);
    return result;
};

// Menghapus pelanggan secara permanen dari database
// Mengembalikan nama pelanggan untuk keperluan notifikasi, null jika tidak ditemukan
const hapus_pelanggan = async (id) => {
    const [rows] = await db.query('SELECT name FROM customers WHERE id = ?', [id]);
    if (rows.length === 0) return null;
    await db.query('DELETE FROM customers WHERE id = ?', [id]);
    return rows[0].name;
};

module.exports = { cari_semua_pelanggan, cari_satu_pelanggan, cari_transaksi_pelanggan, cari_hutang_pelanggan, simpan_pelanggan_baru, simpan_hutang_awal_pelanggan, ubah_data_pelanggan, hapus_pelanggan };

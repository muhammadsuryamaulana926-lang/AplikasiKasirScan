const db = require('../database/db');

// Mengambil semua transaksi dari database dengan filter dan pagination
const cari_semua_transaksi = async (filters) => {
    const { search, paymentMethod, status, dateFrom, dateTo, page = 1, limit = 20, ownerId } = filters;
    const p = parseInt(page), l = parseInt(limit), offset = (p - 1) * l;

    let query = 'SELECT * FROM transactions WHERE 1=1';
    let params = [];

    if (ownerId) { query += ' AND owner_id = ?'; params.push(ownerId); }

    // Filter pencarian berdasarkan nomor invoice, nama pelanggan, atau kasir
    if (search) { query += ' AND (invoice_number LIKE ? OR customer_name LIKE ? OR cashier LIKE ?)'; params.push(`%${search}%`, `%${search}%`, `%${search}%`); }
    // Filter berdasarkan metode pembayaran
    if (paymentMethod) { query += ' AND payment_method = ?'; params.push(paymentMethod); }
    // Filter berdasarkan status transaksi
    if (status) { query += ' AND status = ?'; params.push(status); }
    // Filter berdasarkan rentang tanggal
    if (dateFrom) { query += ' AND created_at >= ?'; params.push(dateFrom); }
    if (dateTo) { query += ' AND created_at <= ?'; params.push(dateTo); }

    query += ' ORDER BY created_at DESC';

    // Hitung total data untuk keperluan pagination
    const [countResult] = await db.query(`SELECT COUNT(*) as total FROM (${query}) as t`, params);
    const total = countResult[0].total;

    query += ' LIMIT ? OFFSET ?';
    params.push(l, offset);
    const [rows] = await db.query(query, params);
    return { rows, total, p, l };
};

// Mengambil semua item produk yang ada dalam satu transaksi
const cari_item_transaksi = async (transactionId) => {
    const [rows] = await db.query(
        'SELECT product_id as productId, product_name as name, qty, price, subtotal FROM transaction_items WHERE transaction_id = ?',
        [transactionId]
    );
    return rows;
};

const simpan_transaksi = async (connection, data) => {
    const { id, invoice, customerId, customerName, subtotal, discount, total, paymentMethod, amountPaid, change, cashier, notes, ownerId } = data;
    await connection.query(
        'INSERT INTO transactions (id, invoice_number, customer_id, customer_name, subtotal, discount, total, payment_method, amount_paid, change_amount, cashier, notes, owner_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [id, invoice, customerId || null, customerName || 'Pembeli Umum', subtotal, discount, total, paymentMethod, amountPaid, change, cashier, notes, ownerId || null]
    );
};

// Menyimpan satu item produk ke dalam tabel transaction_items
// Trigger database akan otomatis mengurangi stok produk setelah insert
const simpan_item_transaksi = async (connection, item, transactionId, itemId) => {
    await connection.query(
        'INSERT INTO transaction_items (id, transaction_id, product_id, product_name, qty, price, subtotal) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [itemId, transactionId, item.productId, item.name, item.qty, item.price, item.price * item.qty]
    );
};

module.exports = { cari_semua_transaksi, cari_item_transaksi, simpan_transaksi, simpan_item_transaksi };

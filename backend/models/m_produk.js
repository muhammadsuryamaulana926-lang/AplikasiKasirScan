const db = require('../database/db');

// Mengambil semua produk aktif dengan filter, sorting, dan pagination
const cari_semua_produk = async (filters) => {
    const { search, category, lowStock, expiringSoon, sort, page = 1, limit = 20, ownerId } = filters;
    const p = parseInt(page), l = parseInt(limit), offset = (p - 1) * l;

    let query = 'SELECT p.*, c.name as categoryName FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.is_active = 1';
    let params = [];

    if (ownerId) { query += ' AND p.owner_id = ?'; params.push(ownerId); }

    // Filter pencarian berdasarkan nama atau barcode produk
    if (search) { query += ' AND (p.name LIKE ? OR p.barcode LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
    // Filter berdasarkan kategori
    if (category) { query += ' AND p.category_id = ?'; params.push(category); }
    // Filter produk yang stoknya di bawah atau sama dengan stok minimum
    if (lowStock === 'true') query += ' AND p.stock <= p.min_stock';
    // Filter produk yang akan expired dalam 30 hari ke depan
    if (expiringSoon === 'true') query += ' AND p.expiry_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)';

    // Sorting dinamis, hanya field yang diizinkan yang bisa dipakai
    if (sort) {
        const [field, order] = sort.split(':');
        const allowedFields = ['name', 'sell_price', 'stock', 'sales_count', 'created_at'];
        if (allowedFields.includes(field)) query += ` ORDER BY ${field} ${order === 'desc' ? 'DESC' : 'ASC'}`;
    } else {
        query += ' ORDER BY p.created_at DESC';
    }

    // Hitung total data untuk pagination
    const [countResult] = await db.query(`SELECT COUNT(*) as total FROM (${query}) as t`, params);
    const total = countResult[0].total;

    query += ' LIMIT ? OFFSET ?';
    params.push(l, offset);
    const [rows] = await db.query(query, params);
    return { rows, total, p, l };
};

// Mengambil detail satu produk berdasarkan ID beserta nama kategorinya
const cari_satu_produk = async (id) => {
    const [rows] = await db.query(
        'SELECT p.*, c.name as categoryName FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ?',
        [id]
    );
    return rows[0];
};

const cari_semua_kategori = async (ownerId) => {
    let query = 'SELECT * FROM categories WHERE 1=1';
    const params = [];
    if (ownerId) { query += ' AND owner_id = ?'; params.push(ownerId); }
    query += ' ORDER BY name ASC';
    const [rows] = await db.query(query, params);
    return rows;
};

const simpan_kategori_baru = async (id, data, ownerId) => {
    const { name, icon, color } = data;
    await db.query('INSERT INTO categories (id, name, icon, color, owner_id) VALUES (?, ?, ?, ?, ?)', [id, name, icon || 'package', color || '#6366f1', ownerId || null]);
};

const simpan_produk_baru = async (id, data, ownerId) => {
    const { barcode, name, categoryId, buyPrice, sellPrice, stock, minStock, unit, image, expiryDate, supplier } = data;
    await db.query(
        'INSERT INTO products (id, barcode, name, category_id, buy_price, sell_price, stock, min_stock, unit, image, expiry_date, supplier, owner_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [id, barcode || '', name || '', categoryId || null, Number(buyPrice) || 0, Number(sellPrice) || 0, Number(stock) || 0, Number(minStock) || 0, unit || 'pcs', image || null, expiryDate || null, supplier || null, ownerId || null]
    );
};

// Memperbarui data produk yang sudah ada
const ubah_data_produk = async (id, data) => {
    const { barcode, name, categoryId, buyPrice, sellPrice, stock, minStock, unit, image, expiryDate, supplier } = data;
    const [result] = await db.query(
        'UPDATE products SET barcode=?, name=?, category_id=?, buy_price=?, sell_price=?, stock=?, min_stock=?, unit=?, image=?, expiry_date=?, supplier=? WHERE id=?',
        [barcode || '', name || '', categoryId || null, Number(buyPrice) || 0, Number(sellPrice) || 0, Number(stock) || 0, Number(minStock) || 0, unit || 'pcs', image || null, expiryDate || null, supplier || null, id]
    );
    return result;
};

// Menonaktifkan produk (soft delete) agar data tetap tersimpan di database
const nonaktifkan_produk = async (id) => {
    await db.query('UPDATE products SET is_active = 0 WHERE id = ?', [id]);
};

module.exports = { cari_semua_produk, cari_satu_produk, cari_semua_kategori, simpan_kategori_baru, simpan_produk_baru, ubah_data_produk, nonaktifkan_produk };

const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../database/db');

// Helper for pagination (MySQL version)
const getPagination = (page, limit) => {
    const offset = (page - 1) * limit;
    return { limit, offset };
};

module.exports = (mockData) => {
    // GET all products with search, filter, pagination
    router.get('/', async (req, res) => {
        try {
            const { search, category, lowStock, expiringSoon, sort, page = 1, limit = 20 } = req.query;
            const p = parseInt(page);
            const l = parseInt(limit);
            const offset = (p - 1) * l;

            let query = 'SELECT p.*, c.name as categoryName FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.is_active = 1';
            let params = [];

            if (search) {
                query += ' AND (p.name LIKE ? OR p.barcode LIKE ?)';
                params.push(`%${search}%`, `%${search}%`);
            }
            if (category) {
                query += ' AND p.category_id = ?';
                params.push(category);
            }
            if (lowStock === 'true') {
                query += ' AND p.stock <= p.min_stock';
            }
            if (expiringSoon === 'true') {
                query += ' AND p.expiry_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)';
            }

            if (sort) {
                const [field, order] = sort.split(':');
                const allowedFields = ['name', 'sell_price', 'stock', 'sales_count', 'created_at'];
                if (allowedFields.includes(field)) {
                    query += ` ORDER BY ${field === 'sell_price' ? 'sell_price' : field} ${order === 'desc' ? 'DESC' : 'ASC'}`;
                }
            } else {
                query += ' ORDER BY p.created_at DESC';
            }

            // Get total count for pagination
            const [countResult] = await db.query(`SELECT COUNT(*) as total FROM (${query}) as t`, params);
            const total = countResult[0].total;

            // Add limit and offset
            query += ' LIMIT ? OFFSET ?';
            params.push(l, offset);

            const [rows] = await db.query(query, params);

            // Map database snake_case to frontend camelCase
            const mappedRows = rows.map(r => ({
                id: r.id,
                barcode: r.barcode,
                name: r.name,
                categoryId: r.category_id,
                categoryName: r.categoryName,
                buyPrice: Number(r.buy_price),
                sellPrice: Number(r.sell_price),
                stock: Number(r.stock),
                minStock: Number(r.min_stock),
                unit: r.unit,
                image: r.image,
                expiryDate: r.expiry_date,
                supplier: r.supplier,
                salesCount: r.sales_count,
                createdAt: r.created_at
            }));

            res.json({
                success: true,
                data: mappedRows,
                pagination: {
                    total,
                    page: p,
                    limit: l,
                    totalPages: Math.ceil(total / l)
                }
            });
        } catch (err) {
            console.error('❌ GET Products Error:', err);
            res.status(500).json({ success: false, error: 'Database error' });
        }
    });

    // GET categories
    router.get('/categories', async (req, res) => {
        try {
            const [rows] = await db.query('SELECT * FROM categories ORDER BY name ASC');
            res.json({ success: true, data: rows });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    });

    // POST create category
    router.post('/categories', async (req, res) => {
        try {
            const { name, icon, color } = req.body;
            if (!name) return res.status(400).json({ success: false, error: 'Nama kategori wajib diisi' });

            const id = `cat-${uuidv4().slice(0, 8)}`;
            await db.query(
                'INSERT INTO categories (id, name, icon, color) VALUES (?, ?, ?, ?)',
                [id, name, icon || 'package', color || '#6366f1']
            );

            res.status(201).json({ success: true, data: { id, name } });
        } catch (err) {
            console.error('❌ POST Category Error:', err);
            res.status(500).json({ success: false, error: err.message });
        }
    });

    // GET single product
    router.get('/:id', async (req, res) => {
        try {
            const [rows] = await db.query('SELECT p.*, c.name as categoryName FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ?', [req.params.id]);
            if (rows.length === 0) return res.status(404).json({ success: false, error: 'Produk tidak ditemukan' });

            const r = rows[0];
            const mappedProduct = {
                id: r.id,
                barcode: r.barcode,
                name: r.name,
                categoryId: r.category_id,
                categoryName: r.categoryName,
                buyPrice: Number(r.buy_price),
                sellPrice: Number(r.sell_price),
                stock: Number(r.stock),
                minStock: Number(r.min_stock),
                unit: r.unit,
                image: r.image,
                expiryDate: r.expiry_date,
                supplier: r.supplier,
                salesCount: r.sales_count,
                createdAt: r.created_at
            };

            res.json({ success: true, data: mappedProduct });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    });

    // POST create product
    router.post('/', async (req, res) => {
        try {
            const id = `prod-${uuidv4().slice(0, 8)}`;
            const { barcode, name, categoryId, buyPrice, sellPrice, stock, minStock, unit, image, expiryDate, supplier } = req.body;

            const params = [
                id,
                barcode || '',
                name || '',
                categoryId || null,
                Number(buyPrice) || 0,
                Number(sellPrice) || 0,
                Number(stock) || 0,
                Number(minStock) || 0,
                unit || 'pcs',
                image || null,
                expiryDate || null,
                supplier || null
            ];

            await db.query(
                'INSERT INTO products (id, barcode, name, category_id, buy_price, sell_price, stock, min_stock, unit, image, expiry_date, supplier) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                params
            );

            res.status(201).json({ success: true, data: { id, name } });
        } catch (err) {
            console.error('❌ POST Product Error:', err);
            const message = err.code === 'ER_DUP_ENTRY' ? 'Barcode sudah digunakan oleh produk lain' : err.message;
            res.status(500).json({ success: false, error: message });
        }
    });

    // PUT update product
    router.put('/:id', async (req, res) => {
        try {
            const { barcode, name, categoryId, buyPrice, sellPrice, stock, minStock, unit, image, expiryDate, supplier } = req.body;
            const productId = req.params.id;

            // Ensure we don't send 'undefined' to MySQL, use null instead
            const params = [
                barcode || '',
                name || '',
                categoryId || null,
                Number(buyPrice) || 0,
                Number(sellPrice) || 0,
                Number(stock) || 0,
                Number(minStock) || 0,
                unit || 'pcs',
                image || null,
                expiryDate || null,
                supplier || null,
                productId
            ];

            const [result] = await db.query(
                'UPDATE products SET barcode=?, name=?, category_id=?, buy_price=?, sell_price=?, stock=?, min_stock=?, unit=?, image=?, expiry_date=?, supplier=? WHERE id=?',
                params
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ success: false, error: 'Produk tidak ditemukan atau tidak ada perubahan' });
            }

            res.json({ success: true, message: 'Produk berhasil diperbarui' });
        } catch (err) {
            console.error('❌ PUT Product Error:', err);
            const message = err.code === 'ER_DUP_ENTRY' ? 'Barcode sudah digunakan oleh produk lain' : err.message;
            res.status(500).json({ success: false, error: message });
        }
    });

    // DELETE product
    router.delete('/:id', async (req, res) => {
        try {
            await db.query('UPDATE products SET is_active = 0 WHERE id = ?', [req.params.id]);
            res.json({ success: true, message: 'Produk berhasil dinonaktifkan' });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    });

    return router;
};

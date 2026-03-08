const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../database/db');

module.exports = (data) => {
    // GET all customers
    router.get('/', async (req, res) => {
        try {
            const { search, page = 1, limit = 20 } = req.query;
            const p = parseInt(page);
            const l = parseInt(limit);
            const offset = (p - 1) * l;

            let query = 'SELECT * FROM customers WHERE is_active = 1';
            let params = [];

            if (search) {
                query += ' AND (name LIKE ? OR phone LIKE ? OR address LIKE ?)';
                params.push(`%${search}%`, `%${search}%`, `%${search}%`);
            }

            query += ' ORDER BY total_spent DESC';

            const [countResult] = await db.query(`SELECT COUNT(*) as total FROM (${query}) as t`, params);
            const total = countResult[0].total;

            query += ' LIMIT ? OFFSET ?';
            params.push(l, offset);

            const [rows] = await db.query(query, params);

            // Map to camelCase
            const mappedRows = rows.map(r => ({
                id: r.id,
                name: r.name,
                phone: r.phone,
                address: r.address,
                email: r.email,
                loyaltyPoints: r.loyalty_points,
                totalSpent: Number(r.total_spent),
                totalTransactions: r.total_transactions,
                joinDate: r.join_date,
                lastVisit: r.last_visit,
                avatar: r.avatar,
                notes: r.notes,
                isActive: r.is_active
            }));

            res.json({
                success: true,
                data: mappedRows,
                pagination: { total, page: p, limit: l, totalPages: Math.ceil(total / l) }
            });
        } catch (err) {
            console.error('❌ GET Customers Error:', err);
            res.status(500).json({ success: false, error: err.message });
        }
    });

    // GET single customer
    router.get('/:id', async (req, res) => {
        try {
            const [rows] = await db.query('SELECT * FROM customers WHERE id = ?', [req.params.id]);
            if (rows.length === 0) return res.status(404).json({ success: false, error: 'Pelanggan tidak ditemukan' });

            const r = rows[0];
            const customer = {
                id: r.id,
                name: r.name,
                phone: r.phone,
                address: r.address,
                email: r.email,
                loyaltyPoints: r.loyalty_points,
                totalSpent: Number(r.total_spent),
                totalTransactions: r.total_transactions,
                joinDate: r.join_date,
                lastVisit: r.last_visit,
                avatar: r.avatar,
                notes: r.notes
            };

            const [transactions] = await db.query('SELECT * FROM transactions WHERE customer_id = ? ORDER BY created_at DESC LIMIT 10', [req.params.id]);
            const [debts] = await db.query('SELECT * FROM debts WHERE customer_id = ? ORDER BY created_at DESC', [req.params.id]);

            // Map sub-items
            const mappedTrx = transactions.map(t => ({
                id: t.id,
                invoiceNumber: t.invoice_number,
                total: Number(t.total),
                paymentMethod: t.payment_method,
                createdAt: t.created_at
            }));

            const mappedDebts = debts.map(d => ({
                id: d.id,
                amount: Number(d.amount),
                remaining: Number(d.remaining),
                status: d.status,
                dueDate: d.due_date,
                createdAt: d.created_at
            }));

            res.json({ success: true, data: { ...customer, transactions: mappedTrx, debts: mappedDebts } });
        } catch (err) {
            console.error('❌ GET Customer Error:', err);
            res.status(500).json({ success: false, error: err.message });
        }
    });

    // POST create customer
    router.post('/', async (req, res) => {
        try {
            const id = `cust-${uuidv4().slice(0, 8)}`;
            const { name, phone, address, email, notes } = req.body;

            await db.query(
                'INSERT INTO customers (id, name, phone, address, email, notes) VALUES (?, ?, ?, ?, ?, ?)',
                [id, name || '', phone || '', address || null, email || null, notes || null]
            );

            res.status(201).json({ success: true, data: { id, name, phone } });
        } catch (err) {
            console.error('❌ POST Customer Error:', err);
            res.status(500).json({ success: false, error: err.message });
        }
    });

    // UPDATE customer
    router.put('/:id', async (req, res) => {
        try {
            const { name, phone, address, email, notes } = req.body;
            const [result] = await db.query(
                'UPDATE customers SET name=?, phone=?, address=?, email=?, notes=? WHERE id=?',
                [name || '', phone || '', address || null, email || null, notes || null, req.params.id]
            );

            if (result.affectedRows === 0) return res.status(404).json({ success: false, error: 'Pelanggan tidak ditemukan' });
            res.json({ success: true, message: 'Pelanggan berhasil diperbarui' });
        } catch (err) {
            console.error('❌ PUT Customer Error:', err);
            res.status(500).json({ success: false, error: err.message });
        }
    });

    return router;
};

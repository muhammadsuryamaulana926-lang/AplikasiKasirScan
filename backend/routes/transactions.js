const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../database/db');

module.exports = (data) => {
    // GET all transactions
    router.get('/', async (req, res) => {
        try {
            const { search, paymentMethod, status, dateFrom, dateTo, page = 1, limit = 20 } = req.query;
            const p = parseInt(page);
            const l = parseInt(limit);
            const offset = (p - 1) * l;

            let query = 'SELECT * FROM transactions WHERE 1=1';
            let params = [];

            if (search) {
                query += ' AND (invoice_number LIKE ? OR customer_name LIKE ? OR cashier LIKE ?)';
                params.push(`%${search}%`, `%${search}%`, `%${search}%`);
            }
            if (paymentMethod) {
                query += ' AND payment_method = ?';
                params.push(paymentMethod);
            }
            if (status) {
                query += ' AND status = ?';
                params.push(status);
            }
            if (dateFrom) {
                query += ' AND created_at >= ?';
                params.push(dateFrom);
            }
            if (dateTo) {
                query += ' AND created_at <= ?';
                params.push(dateTo);
            }

            query += ' ORDER BY created_at DESC';

            const [countResult] = await db.query(`SELECT COUNT(*) as total FROM (${query}) as t`, params);
            const total = countResult[0].total;

            query += ' LIMIT ? OFFSET ?';
            params.push(l, offset);

            const [rows] = await db.query(query, params);

            // Fetch items for each transaction
            const transactionsWithItems = await Promise.all(rows.map(async (r) => {
                const [itemRows] = await db.query(
                    'SELECT product_id as productId, product_name as name, qty, price, subtotal FROM transaction_items WHERE transaction_id = ?',
                    [r.id]
                );

                return {
                    id: r.id,
                    invoiceNumber: r.invoice_number,
                    customerId: r.customer_id,
                    customerName: r.customer_name,
                    subtotal: Number(r.subtotal),
                    discount: Number(r.discount),
                    tax: Number(r.tax),
                    total: Number(r.total),
                    paymentMethod: r.payment_method,
                    amountPaid: Number(r.amount_paid),
                    change: Number(r.change_amount),
                    status: r.status,
                    cashier: r.cashier,
                    notes: r.notes,
                    createdAt: r.created_at,
                    items: itemRows
                };
            }));

            res.json({
                success: true,
                data: transactionsWithItems,
                pagination: { total, page: p, limit: l, totalPages: Math.ceil(total / l) }
            });
        } catch (err) {
            console.error('❌ GET Transactions Error:', err);
            res.status(500).json({ success: false, error: err.message });
        }
    });

    // POST create transaction (POS checkout)
    router.post('/', async (req, res) => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            const { customerId, customerName, items, paymentMethod, amountPaid, discount = 0, notes = '', cashier = 'Admin' } = req.body;

            if (!items || items.length === 0) {
                throw new Error('Keranjang belanja kosong');
            }

            const subtotal = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
            const total = subtotal - discount;
            const id = `trx-${uuidv4().slice(0, 8)}`;
            const invoice = `INV-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;

            // Insert Transaction
            await connection.query(
                'INSERT INTO transactions (id, invoice_number, customer_id, customer_name, subtotal, discount, total, payment_method, amount_paid, change_amount, cashier, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [id, invoice, customerId || null, customerName || 'Pembeli Umum', subtotal, discount, total, paymentMethod, amountPaid, (Number(amountPaid) - total), cashier, notes]
            );

            // Insert Items (Trigger handles stock)
            for (const item of items) {
                await connection.query(
                    'INSERT INTO transaction_items (id, transaction_id, product_id, product_name, qty, price, subtotal) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [`txi-${uuidv4().slice(0, 8)}`, id, item.productId, item.name, item.qty, item.price, item.price * item.qty]
                );
            }

            await connection.commit();
            res.status(201).json({ success: true, data: { id, invoice, total } });
        } catch (err) {
            await connection.rollback();
            console.error('❌ Checkout Error:', err);
            res.status(500).json({ success: false, error: err.message });
        } finally {
            connection.release();
        }
    });

    return router;
};

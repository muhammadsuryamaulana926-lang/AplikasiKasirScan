const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../database/db');

module.exports = (data) => {
    // GET all debts with search and status filter
    router.get('/', async (req, res) => {
        try {
            const { search, status, page = 1, limit = 20 } = req.query;
            const p = parseInt(page);
            const l = parseInt(limit);
            const offset = (p - 1) * l;

            // Base query with auto-overdue logic for the result set
            let query = `
                SELECT d.*, c.phone as customer_phone,
                CASE 
                    WHEN d.status != 'paid' AND d.due_date < CURDATE() THEN 'overdue' 
                    ELSE d.status 
                END as current_status 
                FROM debts d
                LEFT JOIN customers c ON d.customer_id = c.id
                WHERE 1=1`;
            let params = [];

            if (search) {
                query += ' AND (d.customer_name LIKE ? OR d.items LIKE ?)';
                params.push(`%${search}%`, `%${search}%`);
            }

            if (status) {
                // If filtering by overdue, we use our calculated status
                if (status === 'overdue') {
                    query += " AND (d.status != 'paid' AND d.due_date < CURDATE())";
                } else {
                    query += ' AND d.status = ?';
                    params.push(status);
                }
            }

            query += ' ORDER BY d.created_at DESC';

            const [countResult] = await db.query(`SELECT COUNT(*) as total FROM (${query}) as t`, params);
            const total = countResult[0].total;

            query += ' LIMIT ? OFFSET ?';
            params.push(l, offset);

            const [rows] = await db.query(query, params);

            // Map to camelCase
            const mappedRows = rows.map(r => ({
                id: r.id,
                customerId: r.customer_id,
                customerName: r.customer_name,
                customerPhone: r.customer_phone,
                amount: Number(r.amount),
                paidAmount: Number(r.paid_amount),
                remaining: Number(r.remaining),
                items: r.items,
                dueDate: r.due_date,
                status: r.current_status || r.status,
                reminderSent: Boolean(r.reminder_sent),
                transactionId: r.transaction_id,
                notes: r.notes,
                createdAt: r.created_at
            }));

            res.json({
                success: true,
                data: mappedRows,
                pagination: { total, page: p, limit: l, totalPages: Math.ceil(total / l) }
            });
        } catch (err) {
            console.error('❌ GET Debts Error:', err);
            res.status(500).json({ success: false, error: err.message });
        }
    });

    // GET debt summary
    router.get('/summary', async (req, res) => {
        try {
            const [rows] = await db.query(`
                SELECT 
                    SUM(remaining) as totalDebt,
                    SUM(CASE WHEN status != 'paid' AND due_date < CURDATE() THEN 1 ELSE 0 END) as overdueCount,
                    SUM(CASE WHEN status = 'unpaid' AND due_date >= CURDATE() THEN 1 ELSE 0 END) as unpaidCount,
                    SUM(CASE WHEN status = 'partial' AND due_date >= CURDATE() THEN 1 ELSE 0 END) as partialCount,
                    COUNT(*) as totalRecords
                FROM debts
            `);
            const s = rows[0];
            res.json({
                success: true,
                data: {
                    totalDebt: Number(s.totalDebt) || 0,
                    overdueCount: Number(s.overdueCount) || 0,
                    unpaidCount: Number(s.unpaidCount) || 0,
                    partialCount: Number(s.partialCount) || 0,
                    totalRecords: s.totalRecords || 0
                }
            });
        } catch (err) {
            console.error('❌ GET Debts Summary Error:', err);
            res.status(500).json({ success: false, error: err.message });
        }
    });

    // POST create debt
    router.post('/', async (req, res) => {
        try {
            const id = `debt-${uuidv4().slice(0, 8)}`;
            const { customerId, customerName, amount, items, dueDate, transactionId, notes } = req.body;

            await db.query(
                'INSERT INTO debts (id, customer_id, customer_name, amount, remaining, items, due_date, transaction_id, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [id, customerId, customerName, amount, amount, items || '', dueDate || null, transactionId || null, notes || null]
            );

            res.status(201).json({ success: true, data: { id, customerName, amount } });
        } catch (err) {
            console.error('❌ POST Debt Error:', err);
            res.status(500).json({ success: false, error: err.message });
        }
    });

    // POST record payment
    router.post('/:id/pay', async (req, res) => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            const { amount, method = 'cash', notes = '' } = req.body;
            const debtId = req.params.id;

            // Trigger in DB (after_debt_payment_insert) will update debts table
            await connection.query(
                'INSERT INTO debt_payments (id, debt_id, amount, payment_method, notes) VALUES (?, ?, ?, ?, ?)',
                [`pay-${uuidv4().slice(0, 8)}`, debtId, amount, method, notes]
            );

            await connection.commit();
            res.json({ success: true, message: 'Pembayaran berhasil dicatat' });
        } catch (err) {
            await connection.rollback();
            console.error('❌ Debt Payment Error:', err);
            res.status(500).json({ success: false, error: err.message });
        } finally {
            connection.release();
        }
    });

    // POST send reminder
    router.post('/:id/remind', async (req, res) => {
        try {
            const [result] = await db.query('UPDATE debts SET reminder_sent = 1 WHERE id = ?', [req.params.id]);
            if (result.affectedRows === 0) return res.status(404).json({ success: false, error: 'Data hutang tidak ditemukan' });
            res.json({ success: true, message: 'Status pengingat WhatsApp diperbarui' });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    });

    return router;
};

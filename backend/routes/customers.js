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

            // Updated query to include total remaining debt
            let query = `
                SELECT c.*, 
                (SELECT COALESCE(SUM(remaining), 0) FROM debts WHERE customer_id = c.id AND status != 'paid') as total_debt
                FROM customers c 
                WHERE c.is_active = 1`;
            let params = [];

            if (search) {
                query += ' AND (c.name LIKE ? OR c.phone LIKE ? OR c.address LIKE ?)';
                params.push(`%${search}%`, `%${search}%`, `%${search}%`);
            }

            query += ' ORDER BY total_debt DESC, total_spent DESC';

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
                totalDebt: Number(r.total_debt || 0),
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
            const [rows] = await db.query(`
                SELECT c.*, 
                (SELECT COALESCE(SUM(remaining), 0) FROM debts WHERE customer_id = c.id AND status != 'paid') as total_debt
                FROM customers c WHERE c.id = ?`, [req.params.id]);
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
                totalDebt: Number(r.total_debt || 0),
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
            const { name, phone, address, email, notes, initialDebt } = req.body;

            await db.query(
                'INSERT INTO customers (id, name, phone, address, email, notes) VALUES (?, ?, ?, ?, ?, ?)',
                [id, name || '', phone || '', address || null, email || null, notes || null]
            );

            // If initial debt is provided, create a debt record
            if (initialDebt && Number(initialDebt) > 0) {
                const debtId = `debt-${uuidv4().slice(0, 8)}`;
                const dueDate = new Date();
                dueDate.setDate(dueDate.getDate() + 7); // Default 7 days

                await db.query(
                    'INSERT INTO debts (id, customer_id, customer_name, amount, remaining, status, due_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [debtId, id, name, Number(initialDebt), Number(initialDebt), 'unpaid', dueDate.toISOString().split('T')[0]]
                );

                // Add notification
                await db.query(
                    'INSERT INTO notifications (type, title, message, priority) VALUES (?, ?, ?, ?)',
                    ['debt_reminder', 'Hutang Baru Tercatat', `Pelanggan "${name}" memiliki hutang baru sebesar Rp ${Number(initialDebt).toLocaleString('id-ID')}`, 'high']
                ).catch(e => console.error("Notification failed", e));
            }

            res.status(201).json({ success: true, data: { id, name, phone } });
        } catch (err) {
            console.error('❌ POST Customer Error:', err);
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ success: false, error: 'Nomor telepon sudah terdaftar. Gunakan nomor lain atau cari pelanggan yang sudah ada.' });
            }
            res.status(500).json({ success: false, error: err.message });
        }
    });

    // UPDATE customer
    router.put('/:id', async (req, res) => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            const { name, phone, address, email, notes } = req.body;
            
            // Update customer record
            const [result] = await connection.query(
                'UPDATE customers SET name = COALESCE(?, name), phone = COALESCE(?, phone), address = COALESCE(?, address), email = COALESCE(?, email), notes = COALESCE(?, notes) WHERE id = ?',
                [name || null, phone || null, address || null, email || null, notes || null, req.params.id]
            );

            if (result.affectedRows === 0) {
                await connection.rollback();
                return res.status(404).json({ success: false, error: 'Pelanggan tidak ditemukan' });
            }

            // Sync name with debts table if name was provided
            if (name) {
                await connection.query(
                    'UPDATE debts SET customer_name = ? WHERE customer_id = ?',
                    [name, req.params.id]
                );
            }

            await connection.commit();
            res.json({ success: true, message: 'Pelanggan berhasil diperbarui' });
        } catch (err) {
            await connection.rollback();
            console.error('❌ PUT Customer Error:', err);
            res.status(500).json({ success: false, error: err.message });
        } finally {
            connection.release();
        }
    });

    // DELETE customer (soft delete)
    router.delete('/:id', async (req, res) => {
        try {
            // Get customer name first for notification
            const [rows] = await db.query('SELECT name FROM customers WHERE id = ?', [req.params.id]);
            if (rows.length === 0) {
                return res.status(404).json({ success: false, error: 'Pelanggan tidak ditemukan' });
            }
            const customerName = rows[0].name;

            // Hard delete: remove from database
            await db.query('DELETE FROM customers WHERE id = ?', [req.params.id]);
            
            // Add notification
            try {
                await db.query(
                    'INSERT INTO notifications (type, title, message, priority) VALUES (?, ?, ?, ?)',
                    ['info', 'Data Penghutang Dihapus', `Pelanggan "${customerName}" telah dihapus secara permanen dari sistem.`, 'medium']
                );
            } catch (notifyErr) {
                console.warn('⚠️ Gagal membuat notifikasi, tapi data sudah terhapus:', notifyErr.message);
            }

            res.json({ success: true, message: 'Pelanggan berhasil dihapus' });
        } catch (err) {
            console.error('❌ DELETE Customer Error:', err);
            res.status(500).json({ success: false, error: 'Internal Server Error: ' + err.message });
        }
    });

    return router;
};

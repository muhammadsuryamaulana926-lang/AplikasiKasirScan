const express = require('express');
const router = express.Router();
const db = require('../database/db');

module.exports = (data) => {
    // GET dashboard summary
    router.get('/dashboard', async (req, res) => {
        try {
            // Get stats from DB
            const [stats] = await db.query('SELECT * FROM v_dashboard_summary ORDER BY date DESC LIMIT 7');
            const [lowStock] = await db.query('SELECT COUNT(*) as count FROM v_low_stock_products');
            const [expiring] = await db.query('SELECT COUNT(*) as count FROM products WHERE expiry_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) AND is_active = 1');
            const [debts] = await db.query("SELECT SUM(remaining) as total, COUNT(*) as count FROM debts WHERE status != 'paid'");

            // Top customers
            const [topCustomers] = await db.query('SELECT id, name, total_spent FROM customers WHERE is_active = 1 ORDER BY total_spent DESC LIMIT 5');

            // Recent transactions with items
            const [recentTrxRows] = await db.query('SELECT id, invoice_number, customer_name, total, created_at FROM transactions ORDER BY created_at DESC LIMIT 5');

            const recentTransactions = await Promise.all(recentTrxRows.map(async (t) => {
                const [itemRows] = await db.query(
                    'SELECT product_name as name, qty FROM transaction_items WHERE transaction_id = ?',
                    [t.id]
                );
                return {
                    id: t.id,
                    invoiceNumber: t.invoice_number,
                    customerName: t.customer_name,
                    total: Number(t.total),
                    createdAt: t.created_at,
                    items: itemRows
                };
            }));

            // Notifications
            const [notifications] = await db.query('SELECT * FROM notifications WHERE is_read = 0 ORDER BY created_at DESC LIMIT 10');

            res.json({
                success: true,
                data: {
                    summary: stats.map(s => ({
                        date: s.date,
                        revenue: Number(s.total_revenue),
                        transactions: s.total_transactions,
                        customers: s.unique_customers
                    })),
                    lowStockCount: lowStock[0].count,
                    expiringCount: expiring[0].count,
                    overdueDebtsCount: debts[0].count,
                    totalDebt: Number(debts[0].total) || 0,
                    topCustomers: topCustomers.map(c => ({
                        id: c.id,
                        name: c.name,
                        totalSpent: Number(c.total_spent)
                    })),
                    recentTransactions: recentTransactions,
                    notifications: notifications.map(n => ({
                        id: n.id,
                        type: n.type,
                        title: n.title,
                        message: n.message,
                        createdAt: n.created_at
                    }))
                },
            });
        } catch (err) {
            console.error('❌ GET Dashboard Error:', err);
            res.status(500).json({ success: false, error: err.message });
        }
    });

    // GET notifications
    router.get('/notifications', async (req, res) => {
        try {
            const [rows] = await db.query('SELECT * FROM notifications ORDER BY created_at DESC LIMIT 50');
            res.json({
                success: true,
                data: rows.map(n => ({
                    id: n.id,
                    type: n.type,
                    title: n.title,
                    message: n.message,
                    priority: n.priority,
                    isRead: Boolean(n.is_read),
                    createdAt: n.created_at
                }))
            });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    });

    // PUT mark notification read
    router.put('/notifications/:id/read', async (req, res) => {
        try {
            await db.query('UPDATE notifications SET is_read = 1, read_at = NOW() WHERE id = ?', [req.params.id]);
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    });

    // GET store settings
    router.get('/settings', async (req, res) => {
        try {
            const [rows] = await db.query('SELECT * FROM settings');
            const settings = {};
            rows.forEach(r => {
                settings[r.key_name] = r.value;
            });
            res.json({ success: true, data: settings });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    });

    // PUT update store settings
    router.put('/settings', async (req, res) => {
        try {
            const updates = req.body; // { key: value }
            for (const [key, value] of Object.entries(updates)) {
                await db.query('INSERT INTO settings (key_name, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = ?', [key, value, value]);
            }
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    });

    return router;
};

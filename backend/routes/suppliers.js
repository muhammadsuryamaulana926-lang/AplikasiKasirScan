const express = require('express');
const router = express.Router();
const db = require('../database/db');

module.exports = (data) => {
    // GET all suppliers (Unique suppliers from products table)
    router.get('/', async (req, res) => {
        try {
            const [rows] = await db.query('SELECT DISTINCT supplier FROM products WHERE supplier IS NOT NULL AND supplier != "" ORDER BY supplier ASC');

            const suppliers = rows.map((r, index) => ({
                id: `sup-${index + 1}`,
                name: r.supplier,
                contact: '-',
                phone: '-'
            }));

            res.json({ success: true, data: suppliers });
        } catch (err) {
            console.error('❌ GET Suppliers Error:', err);
            res.status(500).json({ success: false, error: err.message });
        }
    });

    // GET single supplier products
    router.get('/:name', async (req, res) => {
        try {
            const name = req.params.name;
            const [products] = await db.query('SELECT * FROM products WHERE supplier = ? AND is_active = 1', [name]);

            res.json({
                success: true,
                data: {
                    name,
                    suppliedProducts: products.map(p => ({
                        id: p.id,
                        name: p.name,
                        stock: p.stock,
                        sellPrice: Number(p.sell_price)
                    }))
                }
            });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    });

    return router;
};

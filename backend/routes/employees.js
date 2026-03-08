const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../database/db');

module.exports = (data) => {
    // POST login
    router.post('/login', async (req, res) => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ success: false, error: 'Email dan password harus diisi' });
            }

            // Check email
            const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

            if (rows.length === 0) {
                return res.status(401).json({ success: false, error: 'Email tidak terdaftar. Silakan daftar terlebih dahulu.' });
            }

            const user = rows[0];

            // Simple password check (plaintext) - In production use bcrypt
            if (user.password !== password) {
                return res.status(401).json({ success: false, error: 'Password salah.' });
            }

            if (!user.is_active) {
                return res.status(401).json({ success: false, error: 'Akun Anda dinonaktifkan. Hubungi admin.' });
            }

            res.json({
                success: true,
                message: 'Login berhasil',
                data: {
                    id: user.id,
                    name: user.name,
                    username: user.username,
                    role: user.role,
                    email: user.email,
                    phone: user.phone,
                    avatar: user.avatar,
                    banner: user.banner,
                    createdAt: user.created_at
                }
            });

        } catch (err) {
            console.error('Login Error:', err);
            res.status(500).json({ success: false, error: 'Terjadi kesalahan server' });
        }
    });

    // GET all employees
    router.get('/', async (req, res) => {
        try {
            const { search, page = 1, limit = 20 } = req.query;
            const p = parseInt(page);
            const l = parseInt(limit);
            const offset = (p - 1) * l;

            let query = 'SELECT * FROM users WHERE is_active = 1';
            let params = [];

            if (search) {
                query += ' AND (name LIKE ? OR username LIKE ? OR phone LIKE ?)';
                params.push(`%${search}%`, `%${search}%`, `%${search}%`);
            }

            query += ' ORDER BY name ASC';

            const [countResult] = await db.query(`SELECT COUNT(*) as total FROM (${query}) as t`, params);
            const total = countResult[0].total;

            query += ' LIMIT ? OFFSET ?';
            params.push(l, offset);

            const [rows] = await db.query(query, params);

            // Map to camelCase
            const mappedRows = rows.map(r => ({
                id: r.id,
                name: r.name,
                username: r.username,
                role: r.role,
                phone: r.phone,
                email: r.email,
                avatar: r.avatar,
                banner: r.banner,
                isActive: r.is_active,
                createdAt: r.created_at
            }));

            res.json({
                success: true,
                data: mappedRows,
                pagination: { total, page: p, limit: l, totalPages: Math.ceil(total / l) }
            });
        } catch (err) {
            console.error('❌ GET Employees Error:', err);
            res.status(500).json({ success: false, error: err.message });
        }
    });

    // GET single employee
    router.get('/:id', async (req, res) => {
        try {
            const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
            if (rows.length === 0) return res.status(404).json({ success: false, error: 'Karyawan tidak ditemukan' });

            const r = rows[0];
            res.json({
                success: true,
                data: {
                    id: r.id,
                    name: r.name,
                    username: r.username,
                    role: r.role,
                    phone: r.phone,
                    email: r.email,
                    avatar: r.avatar,
                    banner: r.banner,
                    isActive: r.is_active,
                    createdAt: r.created_at
                }
            });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    });

    // POST create employee
    router.post('/', async (req, res) => {
        try {
            const id = `emp-${uuidv4().slice(0, 8)}`;
            const { name, username, password, role, phone, email, avatar, banner } = req.body;

            await db.query(
                'INSERT INTO users (id, name, username, password, role, phone, email, avatar, banner) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [id, name || '', username || '', password || '12345', role || 'kasir', phone || null, email || null, avatar || null, banner || null]
            );

            res.status(201).json({ success: true, data: { id, name, username, role } });
        } catch (err) {
            console.error('❌ POST Employee Error:', err);
            res.status(500).json({ success: false, error: err.message });
        }
    });

    // PUT update employee
    router.put('/:id', async (req, res) => {
        try {
            const { name, username, role, phone, email, avatar, banner, isActive } = req.body;

            let fields = [];
            let values = [];

            if (name !== undefined) { fields.push('name=?'); values.push(name); }
            if (username !== undefined) { fields.push('username=?'); values.push(username); }
            if (role !== undefined) { fields.push('role=?'); values.push(role); }
            if (phone !== undefined) { fields.push('phone=?'); values.push(phone); }
            if (email !== undefined) { fields.push('email=?'); values.push(email); }
            if (avatar !== undefined) { fields.push('avatar=?'); values.push(avatar); }
            if (banner !== undefined) { fields.push('banner=?'); values.push(banner); }
            if (isActive !== undefined) { fields.push('is_active=?'); values.push(isActive); }

            if (fields.length === 0) return res.json({ success: true, message: 'Tidak ada data yang diubah' });

            values.push(req.params.id);

            const [result] = await db.query(
                `UPDATE users SET ${fields.join(', ')} WHERE id=?`,
                values
            );

            if (result.affectedRows === 0) return res.status(404).json({ success: false, error: 'Karyawan tidak ditemukan' });

            // Get updated user data
            const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
            const r = rows[0];

            res.json({
                success: true,
                message: 'Data karyawan berhasil diperbarui',
                data: {
                    id: r.id,
                    name: r.name,
                    username: r.username,
                    role: r.role,
                    phone: r.phone,
                    email: r.email,
                    avatar: r.avatar,
                    banner: r.banner,
                    isActive: r.is_active
                }
            });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    });

    // DELETE employee (Soft delete)
    router.delete('/:id', async (req, res) => {
        try {
            await db.query('UPDATE users SET is_active = 0 WHERE id = ?', [req.params.id]);
            res.json({ success: true, message: 'Karyawan berhasil dinonaktifkan' });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    });

    return router;
};

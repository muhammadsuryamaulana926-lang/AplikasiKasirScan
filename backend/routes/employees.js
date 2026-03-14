const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../database/db');
const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');
const { sendOTP } = require('../utils/emailService');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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
                    qrisImage: user.qris_image,
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
                qrisImage: r.qris_image,
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
                    qrisImage: r.qris_image,
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
                'INSERT INTO users (id, name, username, password, role, phone, email, avatar, banner, qris_image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [id, name || '', username || '', password || '12345', role || 'kasir', phone || null, email || null, avatar || null, banner || null, req.body.qrisImage || null]
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
            if (req.body.qrisImage !== undefined) { fields.push('qris_image=?'); values.push(req.body.qrisImage); }
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
                    qrisImage: r.qris_image,
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

    // --- OTP ROUTES ---

    // POST Request OTP
    router.post('/request-otp', async (req, res) => {
        try {
            const { email, type } = req.body; // type: 'register' or 'forgot_password'
            if (!email) return res.status(400).json({ success: false, error: 'Email wajib diisi' });

            // Generate 6-digit OTP
            const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
            const expiresAt = new Date(Date.now() + 10 * 60000); // 10 minutes

            // Save to DB
            await db.query(
                'INSERT INTO otps (email, code, type, expires_at) VALUES (?, ?, ?, ?)',
                [email, otpCode, type || 'register', expiresAt]
            );

            // Send Email
            const emailResult = await sendOTP(email, otpCode, type || 'register');

            if (emailResult.success) {
                res.json({ success: true, message: 'Kode OTP telah dikirim ke email Anda' });
            } else {
                res.status(500).json({ success: false, error: 'Gagal mengirim email OTP' });
            }
        } catch (err) {
            console.error('Request OTP Error:', err);
            res.status(500).json({ success: false, error: 'Terjadi kesalahan sistem' });
        }
    });

    // POST Verify OTP
    router.post('/verify-otp', async (req, res) => {
        try {
            const { email, code, type } = req.body;
            if (!email || !code) return res.status(400).json({ success: false, error: 'Email dan kode wajib diisi' });

            const [rows] = await db.query(
                'SELECT * FROM otps WHERE email = ? AND code = ? AND type = ? AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
                [email, code, type || 'register']
            );

            if (rows.length === 0) {
                return res.status(400).json({ success: false, error: 'Kode OTP salah atau sudah kedaluwarsa' });
            }

            // Mark user as verified if they exist
            await db.query('UPDATE users SET is_verified = 1 WHERE email = ?', [email]);
            
            // Delete used OTP
            await db.query('DELETE FROM otps WHERE email = ? AND type = ?', [email, type || 'register']);

            res.json({ success: true, message: 'Verifikasi berhasil' });
        } catch (err) {
            console.error('Verify OTP Error:', err);
            res.status(500).json({ success: false, error: 'Terjadi kesalahan sistem' });
        }
    });

    // --- GOOGLE AUTH ROUTE ---

    router.post('/google-login', async (req, res) => {
        try {
            const { idToken } = req.body;
            if (!idToken) return res.status(400).json({ success: false, error: 'Token Google diperlukan' });

            const ticket = await client.verifyIdToken({
                idToken: idToken,
                audience: process.env.GOOGLE_CLIENT_ID,
            });

            const payload = ticket.getPayload();
            const { sub, email, name, picture } = payload;

            // Check if user exists
            let [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
            let user;

            if (users.length === 0) {
                // Register new user via Google
                const id = `user-${uuidv4().slice(0, 8)}`;
                const username = email.split('@')[0];
                
                await db.query(
                    'INSERT INTO users (id, name, username, email, avatar, google_id, auth_provider, is_verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                    [id, name, username, email, picture, sub, 'google', 1]
                );

                const [newUsers] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
                user = newUsers[0];
            } else {
                user = users[0];
                // Update google_id if not set
                if (!user.google_id) {
                    await db.query('UPDATE users SET google_id = ?, auth_provider = ?, is_verified = 1 WHERE id = ?', [sub, 'google', user.id]);
                }
            }

            res.json({
                success: true,
                message: 'Login Google berhasil',
                data: {
                    id: user.id,
                    name: user.name,
                    username: user.username,
                    role: user.role,
                    email: user.email,
                    avatar: user.avatar
                }
            });

        } catch (err) {
            console.error('Google Login Error:', err);
            res.status(500).json({ success: false, error: 'Gagal melakukan login dengan Google' });
        }
    });

    // POST Request Forgot Password OTP
    router.post('/forgot-password', async (req, res) => {
        try {
            const { email } = req.body;
            if (!email) return res.status(400).json({ success: false, error: 'Email wajib diisi' });

            // Check if user exists
            const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
            if (users.length === 0) {
                return res.status(404).json({ success: false, error: 'Email tidak ditemukan' });
            }

            // Generate 6-digit OTP
            const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
            const expiresAt = new Date(Date.now() + 10 * 60000); // 10 minutes

            await db.query(
                'INSERT INTO otps (email, code, type, expires_at) VALUES (?, ?, ?, ?)',
                [email, otpCode, 'forgot_password', expiresAt]
            );

            const emailResult = await sendOTP(email, otpCode, 'forgot_password');

            if (emailResult.success) {
                res.json({ success: true, message: 'Kode OTP reset password telah dikirim' });
            } else {
                res.status(500).json({ success: false, error: 'Gagal mengirim email OTP' });
            }
        } catch (err) {
            console.error('Forgot Password OTP Error:', err);
            res.status(500).json({ success: false, error: 'Terjadi kesalahan sistem' });
        }
    });

    // POST Reset Password
    router.post('/reset-password', async (req, res) => {
        try {
            const { email, code, newPassword } = req.body;
            if (!email || !code || !newPassword) {
                return res.status(400).json({ success: false, error: 'Data tidak lengkap' });
            }

            // Verify OTP
            const [rows] = await db.query(
                'SELECT * FROM otps WHERE email = ? AND code = ? AND type = "forgot_password" AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
                [email, code]
            );

            if (rows.length === 0) {
                return res.status(400).json({ success: false, error: 'Kode OTP salah atau sudah kedaluwarsa' });
            }

            // Update user password (In production, use bcrypt)
            await db.query('UPDATE users SET password = ? WHERE email = ?', [newPassword, email]);
            
            // Delete OTP
            await db.query('DELETE FROM otps WHERE email = ? AND type = "forgot_password"', [email]);

            res.json({ success: true, message: 'Password berhasil diperbarui' });
        } catch (err) {
            console.error('Reset Password Error:', err);
            res.status(500).json({ success: false, error: 'Terjadi kesalahan sistem' });
        }
    });

    return router;
};

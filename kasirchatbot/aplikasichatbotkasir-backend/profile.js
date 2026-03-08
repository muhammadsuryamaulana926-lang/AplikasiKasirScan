const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const JWT_SECRET = 'your-secret-key-change-this-in-production';

// Multer configuration for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Hanya file gambar yang diperbolehkan'));
  }
});

// Database connection
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'chat-botKasir_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Middleware untuk verifikasi token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.json({ success: false, error: 'Token tidak ditemukan' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.json({ success: false, error: 'Token tidak valid' });
    }
    req.user = user;
    next();
  });
};

// GET - Ambil data profil berdasarkan email (tanpa token)
router.get('/profile/get', async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.json({ success: false, error: 'Email tidak ditemukan' });
    }

    const [users] = await pool.execute(
      'SELECT id, nama as name, email, telepon as phone, profile_image as profileImage, dibuat_pada as created_at FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.json({ success: false, error: 'User tidak ditemukan' });
    }

    res.json({
      success: true,
      user: users[0]
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.json({ success: false, error: 'Gagal mengambil data profil' });
  }
});

// GET - Ambil data profil user
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.execute(
      'SELECT id, nama as name, email, telepon as phone, dibuat_pada as created_at FROM users WHERE id = ?',
      [req.user.userId]
    );

    if (users.length === 0) {
      return res.json({ success: false, error: 'User tidak ditemukan' });
    }

    res.json({
      success: true,
      user: users[0]
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.json({ success: false, error: 'Gagal mengambil data profil' });
  }
});

// PUT - Update profil user (nama dan phone)
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, phone } = req.body;

    if (!name || name.trim() === '') {
      return res.json({ success: false, error: 'Nama tidak boleh kosong' });
    }

    if (name.length < 2) {
      return res.json({ success: false, error: 'Nama minimal 2 karakter' });
    }

    if (name.length > 50) {
      return res.json({ success: false, error: 'Nama maksimal 50 karakter' });
    }

    // Update nama dan phone
    await pool.execute(
      'UPDATE users SET nama = ?, telepon = ? WHERE id = ?',
      [name.trim(), phone ? phone.trim() : null, req.user.userId]
    );

    const [users] = await pool.execute(
      'SELECT id, nama as name, email, telepon as phone, dibuat_pada as created_at FROM users WHERE id = ?',
      [req.user.userId]
    );

    res.json({
      success: true,
      message: 'Profil berhasil diperbarui',
      user: users[0]
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.json({ success: false, error: 'Gagal memperbarui profil' });
  }
});

// PUT - Update password
router.put('/profile/password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.json({ success: false, error: 'Password lama dan baru harus diisi' });
    }

    if (newPassword.length < 6) {
      return res.json({ success: false, error: 'Password baru minimal 6 karakter' });
    }

    // Cek password lama
    const [users] = await pool.execute(
      'SELECT kata_sandi as password FROM users WHERE id = ?',
      [req.user.userId]
    );

    if (users.length === 0) {
      return res.json({ success: false, error: 'User tidak ditemukan' });
    }

    // Verifikasi password lama dengan bcrypt
    const isValidPassword = await bcrypt.compare(currentPassword, users[0].password);
    if (!isValidPassword) {
      return res.json({ success: false, error: 'Password lama tidak sesuai' });
    }

    // Hash password baru
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password baru
    await pool.execute(
      'UPDATE users SET kata_sandi = ? WHERE id = ?',
      [hashedPassword, req.user.userId]
    );

    res.json({
      success: true,
      message: 'Password berhasil diperbarui'
    });
  } catch (error) {
    console.error('Update password error:', error);
    res.json({ success: false, error: 'Gagal memperbarui password' });
  }
});

// PUT - Update profil tanpa token (berdasarkan email)
router.put('/profile/update', async (req, res) => {
  try {
    const { email, name, phone } = req.body;

    if (!email) {
      return res.json({ success: false, error: 'Email tidak ditemukan' });
    }

    if (!name || name.trim() === '') {
      return res.json({ success: false, error: 'Nama tidak boleh kosong' });
    }

    if (name.length < 2) {
      return res.json({ success: false, error: 'Nama minimal 2 karakter' });
    }

    if (name.length > 50) {
      return res.json({ success: false, error: 'Nama maksimal 50 karakter' });
    }

    await pool.execute(
      'UPDATE users SET nama = ?, telepon = ? WHERE email = ?',
      [name.trim(), phone ? phone.trim() : null, email]
    );

    const [users] = await pool.execute(
      'SELECT id, nama as name, email, telepon as phone, dibuat_pada as created_at FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.json({ success: false, error: 'User tidak ditemukan' });
    }

    res.json({
      success: true,
      message: 'Profil berhasil diperbarui',
      user: users[0]
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.json({ success: false, error: 'Gagal memperbarui profil' });
  }
});

// PUT - Update password tanpa token (berdasarkan email)
router.put('/profile/update-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    console.log('Update password request for email:', email);

    if (!email) {
      return res.json({ success: false, error: 'Email tidak ditemukan' });
    }

    if (!newPassword) {
      return res.json({ success: false, error: 'Password baru harus diisi' });
    }

    if (newPassword.length < 6) {
      return res.json({ success: false, error: 'Password baru minimal 6 karakter' });
    }

    // Hash password baru
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    console.log('Password hashed successfully');

    // Update password dengan hash
    await pool.execute(
      'UPDATE users SET kata_sandi = ? WHERE email = ?',
      [hashedPassword, email]
    );

    console.log('Password updated in database');

    res.json({
      success: true,
      message: 'Password berhasil diperbarui'
    });
  } catch (error) {
    console.error('Update password error:', error);
    res.json({ success: false, error: 'Gagal memperbarui password' });
  }
});

// POST - Upload profile image
router.post('/profile/upload-image', (req, res) => {
  upload.single('profileImage')(req, res, async (err) => {
    try {
      if (err) {
        console.error('Multer error:', err);
        return res.json({ success: false, error: err.message || 'Gagal mengupload file' });
      }

      if (!req.file) {
        return res.json({ success: false, error: 'Tidak ada file yang diupload' });
      }

      const { email } = req.body;
      if (!email) {
        fs.unlinkSync(req.file.path);
        return res.json({ success: false, error: 'Email tidak ditemukan' });
      }

      const imageUrl = '/uploads/' + req.file.filename;

      // Get old image
      const [users] = await pool.execute(
        'SELECT profile_image FROM users WHERE email = ?',
        [email]
      );

      // Delete old image if exists
      if (users.length > 0 && users[0].profile_image) {
        const oldImagePath = path.join(__dirname, users[0].profile_image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      // Update database
      await pool.execute(
        'UPDATE users SET profile_image = ? WHERE email = ?',
        [imageUrl, email]
      );

      res.json({
        success: true,
        message: 'Foto profil berhasil diupload',
        imageUrl: imageUrl
      });
    } catch (error) {
      console.error('Upload image error:', error);
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      res.json({ success: false, error: 'Gagal mengupload foto profil' });
    }
  });
});

module.exports = router;

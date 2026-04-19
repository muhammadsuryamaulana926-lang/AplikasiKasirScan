const db = require('../database/db');

// Mencari satu karyawan/user berdasarkan alamat email
const cari_karyawan_by_email = async (email) => {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
};

// Mengambil semua karyawan aktif dengan filter pencarian dan pagination
const cari_semua_karyawan = async (filters) => {
    const { search, page = 1, limit = 20 } = filters;
    const p = parseInt(page), l = parseInt(limit), offset = (p - 1) * l;

    let query = 'SELECT * FROM users WHERE is_active = 1';
    let params = [];

    // Filter pencarian berdasarkan nama, username, atau nomor telepon
    if (search) { query += ' AND (name LIKE ? OR username LIKE ? OR phone LIKE ?)'; params.push(`%${search}%`, `%${search}%`, `%${search}%`); }
    query += ' ORDER BY name ASC';

    // Hitung total data untuk pagination
    const [countResult] = await db.query(`SELECT COUNT(*) as total FROM (${query}) as t`, params);
    const total = countResult[0].total;

    query += ' LIMIT ? OFFSET ?';
    params.push(l, offset);
    const [rows] = await db.query(query, params);
    return { rows, total, p, l };
};

// Mengambil detail satu karyawan berdasarkan ID
const cari_satu_karyawan = async (id) => {
    const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0];
};

// Menyimpan data karyawan baru ke database
const simpan_karyawan_baru = async (id, data) => {
    const { name, username, password, role, phone, email, avatar, banner, qrisImage } = data;
    await db.query(
        'INSERT INTO users (id, name, username, password, role, phone, email, avatar, banner, qris_image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [id, name || '', username || '', password || '12345', role || 'kasir', phone || null, email || null, avatar || null, banner || null, qrisImage || null]
    );
};

// Memperbarui data karyawan secara dinamis (hanya field yang dikirim yang diupdate)
const ubah_data_karyawan = async (id, data) => {
    const { name, username, role, phone, email, avatar, banner, qrisImage, isActive } = data;
    let fields = [], values = [];

    // Tambahkan field ke query hanya jika nilainya dikirim
    if (name !== undefined) { fields.push('name=?'); values.push(name); }
    if (username !== undefined) { fields.push('username=?'); values.push(username); }
    if (role !== undefined) { fields.push('role=?'); values.push(role); }
    if (phone !== undefined) { fields.push('phone=?'); values.push(phone); }
    if (email !== undefined) { fields.push('email=?'); values.push(email); }
    if (avatar !== undefined) { fields.push('avatar=?'); values.push(avatar); }
    if (banner !== undefined) { fields.push('banner=?'); values.push(banner); }
    if (qrisImage !== undefined) { fields.push('qris_image=?'); values.push(qrisImage); }
    if (isActive !== undefined) { fields.push('is_active=?'); values.push(isActive); }

    // Kembalikan null jika tidak ada field yang perlu diupdate
    if (fields.length === 0) return null;
    values.push(id);
    const [result] = await db.query(`UPDATE users SET ${fields.join(', ')} WHERE id=?`, values);
    return result;
};

// Menonaktifkan karyawan (soft delete) agar data tetap tersimpan
const nonaktifkan_karyawan = async (id) => {
    await db.query('UPDATE users SET is_active = 0 WHERE id = ?', [id]);
};

// Menyimpan kode OTP ke database dengan waktu kedaluwarsa
const simpan_otp = async (email, code, type, expiresAt) => {
    await db.query('INSERT INTO otps (email, code, type, expires_at) VALUES (?, ?, ?, ?)', [email, code, type, expiresAt]);
};

// Memverifikasi kode OTP, mengembalikan data OTP jika valid atau undefined jika tidak valid/expired
const verifikasi_otp = async (email, code, type) => {
    const [rows] = await db.query(
        'SELECT * FROM otps WHERE email = ? AND code = ? AND type = ? AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
        [email, code, type]
    );
    return rows[0];
};

// Menghapus OTP yang sudah digunakan agar tidak bisa dipakai lagi
const hapus_otp = async (email, type) => {
    await db.query('DELETE FROM otps WHERE email = ? AND type = ?', [email, type]);
};

// Menandai akun pengguna sebagai sudah terverifikasi
const tandai_terverifikasi = async (email) => {
    await db.query('UPDATE users SET is_verified = 1 WHERE email = ?', [email]);
};

// Memperbarui password pengguna dengan password baru
const ubah_password = async (email, newPassword) => {
    await db.query('UPDATE users SET password = ? WHERE email = ?', [newPassword, email]);
};

// Menyimpan karyawan baru yang mendaftar via Google OAuth
const simpan_karyawan_google = async (id, data) => {
    const { name, username, email, picture, sub } = data;
    await db.query(
        'INSERT INTO users (id, name, username, email, avatar, google_id, auth_provider, is_verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [id, name, username, email, picture, sub, 'google', 1]
    );
};

// Memperbarui google_id untuk akun yang sudah ada tapi belum terhubung ke Google
const ubah_google_id = async (id, sub) => {
    await db.query('UPDATE users SET google_id = ?, auth_provider = ?, is_verified = 1 WHERE id = ?', [sub, 'google', id]);
};

module.exports = { cari_karyawan_by_email, cari_semua_karyawan, cari_satu_karyawan, simpan_karyawan_baru, ubah_data_karyawan, nonaktifkan_karyawan, simpan_otp, verifikasi_otp, hapus_otp, tandai_terverifikasi, ubah_password, simpan_karyawan_google, ubah_google_id };

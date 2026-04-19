const { v4: uuidv4 } = require('uuid');
const { OAuth2Client } = require('google-auth-library');
const { sendOTP } = require('../utils/u_email');
const { cari_karyawan_by_email, cari_semua_karyawan, cari_satu_karyawan, simpan_karyawan_baru, ubah_data_karyawan, nonaktifkan_karyawan, simpan_otp, verifikasi_otp, hapus_otp, tandai_terverifikasi, ubah_password, simpan_karyawan_google, ubah_google_id } = require('../models/m_auth');

// Inisialisasi Google OAuth client untuk verifikasi token Google
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Helper: mengubah format kolom snake_case database ke camelCase untuk frontend
const format_karyawan = (r) => ({
    id: r.id, name: r.name, username: r.username, role: r.role,
    phone: r.phone, email: r.email, avatar: r.avatar, banner: r.banner,
    qrisImage: r.qris_image, isActive: r.is_active, createdAt: r.created_at
});

// Menangani request POST login dengan email dan password
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ success: false, error: 'Email dan password harus diisi' });

        const user = await cari_karyawan_by_email(email);
        // Validasi: email terdaftar, password cocok, akun aktif
        if (!user) return res.status(401).json({ success: false, error: 'Email tidak terdaftar. Silakan daftar terlebih dahulu.' });
        if (user.password !== password) return res.status(401).json({ success: false, error: 'Password salah.' });
        if (!user.is_active) return res.status(401).json({ success: false, error: 'Akun Anda dinonaktifkan. Hubungi admin.' });

        res.json({ success: true, message: 'Login berhasil', data: format_karyawan(user) });
    } catch (err) {
        console.error('❌ login Error:', err);
        res.status(500).json({ success: false, error: 'Terjadi kesalahan server' });
    }
};

// Menangani request GET semua karyawan aktif
const tampil_semua_karyawan = async (req, res) => {
    try {
        const { rows, total, p, l } = await cari_semua_karyawan(req.query);
        res.json({ success: true, data: rows.map(format_karyawan), pagination: { total, page: p, limit: l, totalPages: Math.ceil(total / l) } });
    } catch (err) {
        console.error('❌ tampil_semua_karyawan Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// Menangani request GET detail satu karyawan berdasarkan ID
const tampil_satu_karyawan = async (req, res) => {
    try {
        const r = await cari_satu_karyawan(req.params.id);
        if (!r) return res.status(404).json({ success: false, error: 'Karyawan tidak ditemukan' });
        res.json({ success: true, data: format_karyawan(r) });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Menangani request POST membuat karyawan baru
const buat_karyawan_baru = async (req, res) => {
    try {
        const id = `emp-${uuidv4().slice(0, 8)}`;
        await simpan_karyawan_baru(id, req.body);
        res.status(201).json({ success: true, data: { id, name: req.body.name, username: req.body.username, role: req.body.role } });
    } catch (err) {
        console.error('❌ buat_karyawan_baru Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// Menangani request PUT memperbarui data karyawan
const ubah_karyawan = async (req, res) => {
    try {
        const result = await ubah_data_karyawan(req.params.id, req.body);
        // Jika tidak ada field yang dikirim, kembalikan sukses tanpa perubahan
        if (!result) return res.json({ success: true, message: 'Tidak ada data yang diubah' });
        if (result.affectedRows === 0) return res.status(404).json({ success: false, error: 'Karyawan tidak ditemukan' });

        // Kembalikan data karyawan terbaru setelah diupdate
        const r = await cari_satu_karyawan(req.params.id);
        res.json({ success: true, message: 'Data karyawan berhasil diperbarui', data: format_karyawan(r) });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Menangani request DELETE menonaktifkan karyawan (soft delete)
const hapus_karyawan = async (req, res) => {
    try {
        await nonaktifkan_karyawan(req.params.id);
        res.json({ success: true, message: 'Karyawan berhasil dinonaktifkan' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Menangani request POST mengirim kode OTP ke email pengguna
const kirim_otp = async (req, res) => {
    try {
        const { email, type } = req.body;
        if (!email) return res.status(400).json({ success: false, error: 'Email wajib diisi' });

        // Buat kode OTP 6 digit acak, berlaku 10 menit
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60000);

        await simpan_otp(email, otpCode, type || 'register', expiresAt);
        const emailResult = await sendOTP(email, otpCode, type || 'register');

        if (emailResult.success) res.json({ success: true, message: 'Kode OTP telah dikirim ke email Anda' });
        else res.status(500).json({ success: false, error: 'Gagal mengirim email OTP' });
    } catch (err) {
        console.error('❌ kirim_otp Error:', err);
        res.status(500).json({ success: false, error: 'Terjadi kesalahan sistem' });
    }
};

// Menangani request POST verifikasi kode OTP yang dikirim ke email
const verifikasi_kode_otp = async (req, res) => {
    try {
        const { email, code, type } = req.body;
        if (!email || !code) return res.status(400).json({ success: false, error: 'Email dan kode wajib diisi' });

        const otp = await verifikasi_otp(email, code, type || 'register');
        if (!otp) return res.status(400).json({ success: false, error: 'Kode OTP salah atau sudah kedaluwarsa' });

        // Tandai akun sebagai terverifikasi dan hapus OTP yang sudah dipakai
        await tandai_terverifikasi(email);
        await hapus_otp(email, type || 'register');
        res.json({ success: true, message: 'Verifikasi berhasil' });
    } catch (err) {
        console.error('❌ verifikasi_kode_otp Error:', err);
        res.status(500).json({ success: false, error: 'Terjadi kesalahan sistem' });
    }
};

// Menangani request POST login menggunakan akun Google
const login_google = async (req, res) => {
    try {
        const { idToken } = req.body;
        if (!idToken) return res.status(400).json({ success: false, error: 'Token Google diperlukan' });

        // Verifikasi token Google dan ambil data profil
        const ticket = await client.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID });
        const { sub, email, name, picture } = ticket.getPayload();

        let user = await cari_karyawan_by_email(email);

        if (!user) {
            // Daftarkan pengguna baru jika belum ada
            const id = `user-${uuidv4().slice(0, 8)}`;
            await simpan_karyawan_google(id, { name, username: email.split('@')[0], email, picture, sub });
            user = await cari_satu_karyawan(id);
        } else if (!user.google_id) {
            // Hubungkan akun yang sudah ada dengan Google jika belum terhubung
            await ubah_google_id(user.id, sub);
        }

        res.json({ success: true, message: 'Login Google berhasil', data: format_karyawan(user) });
    } catch (err) {
        console.error('❌ login_google Error:', err);
        res.status(500).json({ success: false, error: 'Gagal melakukan login dengan Google' });
    }
};

// Menangani request POST lupa password - kirim OTP reset ke email
const lupa_password = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ success: false, error: 'Email wajib diisi' });

        // Pastikan email terdaftar sebelum kirim OTP
        const user = await cari_karyawan_by_email(email);
        if (!user) return res.status(404).json({ success: false, error: 'Email tidak ditemukan' });

        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60000);

        await simpan_otp(email, otpCode, 'forgot_password', expiresAt);
        const emailResult = await sendOTP(email, otpCode, 'forgot_password');

        if (emailResult.success) res.json({ success: true, message: 'Kode OTP reset password telah dikirim' });
        else res.status(500).json({ success: false, error: 'Gagal mengirim email OTP' });
    } catch (err) {
        console.error('❌ lupa_password Error:', err);
        res.status(500).json({ success: false, error: 'Terjadi kesalahan sistem' });
    }
};

// Menangani request POST reset password menggunakan kode OTP
const reset_password = async (req, res) => {
    try {
        const { email, code, newPassword } = req.body;
        if (!email || !code || !newPassword) return res.status(400).json({ success: false, error: 'Data tidak lengkap' });

        // Verifikasi OTP sebelum mengizinkan reset password
        const otp = await verifikasi_otp(email, code, 'forgot_password');
        if (!otp) return res.status(400).json({ success: false, error: 'Kode OTP salah atau sudah kedaluwarsa' });

        // Update password dan hapus OTP yang sudah dipakai
        await ubah_password(email, newPassword);
        await hapus_otp(email, 'forgot_password');
        res.json({ success: true, message: 'Password berhasil diperbarui' });
    } catch (err) {
        console.error('❌ reset_password Error:', err);
        res.status(500).json({ success: false, error: 'Terjadi kesalahan sistem' });
    }
};

module.exports = { login, tampil_semua_karyawan, tampil_satu_karyawan, buat_karyawan_baru, ubah_karyawan, hapus_karyawan, kirim_otp, verifikasi_kode_otp, login_google, lupa_password, reset_password };
